"""
Schwab (ThinkorSwim) API client.

Authentication flow:
1. First run: call `broker.authorize()` — it prints a URL, you paste it
   into a browser, log in, then paste the redirected URL back.
2. The access + refresh tokens are cached in `tokens.json`.
3. On subsequent runs tokens are loaded and auto-refreshed.

API docs: https://developer.schwab.com/products/trader-api--individual-
"""
import json
import logging
import os
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse, parse_qs

import requests
from requests.auth import HTTPBasicAuth

logger = logging.getLogger(__name__)

_TOKEN_FILE = Path(__file__).parent / "tokens.json"
_AUTH_BASE = "https://api.schwabapi.com/v1/oauth"
_API_BASE = "https://api.schwabapi.com/trader/v1"


class SchwabBroker:
    """Thin wrapper around the Schwab Trader API."""

    def __init__(self, app_key: str, app_secret: str, callback_url: str, account_hash: str):
        self._key = app_key
        self._secret = app_secret
        self._callback = callback_url
        self._account_hash = account_hash
        self._access_token: str = ""
        self._refresh_token: str = ""
        self._token_expiry: float = 0.0
        self._load_tokens()

    # ── Authentication ──────────────────────────────────────────────────────

    def authorize(self) -> None:
        """Interactive first-time OAuth2 authorization."""
        auth_url = (
            f"{_AUTH_BASE}/authorize"
            f"?response_type=code"
            f"&client_id={self._key}"
            f"&redirect_uri={self._callback}"
        )
        print("\n[AUTH] Open this URL in your browser and log into Schwab:\n")
        print(f"  {auth_url}\n")
        redirected = input("[AUTH] Paste the full redirected URL here: ").strip()
        parsed = urlparse(redirected)
        code = parse_qs(parsed.query).get("code", [None])[0]
        if not code:
            raise ValueError("Could not extract authorization code from URL.")
        self._exchange_code(code)

    def _exchange_code(self, code: str) -> None:
        resp = requests.post(
            f"{_AUTH_BASE}/token",
            auth=HTTPBasicAuth(self._key, self._secret),
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self._callback,
            },
            timeout=10,
        )
        resp.raise_for_status()
        self._store_tokens(resp.json())

    def _refresh_access_token(self) -> None:
        resp = requests.post(
            f"{_AUTH_BASE}/token",
            auth=HTTPBasicAuth(self._key, self._secret),
            data={
                "grant_type": "refresh_token",
                "refresh_token": self._refresh_token,
            },
            timeout=10,
        )
        resp.raise_for_status()
        self._store_tokens(resp.json())

    def _store_tokens(self, data: dict) -> None:
        self._access_token = data["access_token"]
        self._refresh_token = data.get("refresh_token", self._refresh_token)
        self._token_expiry = time.time() + data.get("expires_in", 1800) - 60
        _TOKEN_FILE.write_text(json.dumps({
            "access_token": self._access_token,
            "refresh_token": self._refresh_token,
            "token_expiry": self._token_expiry,
        }))
        logger.info("Tokens saved to %s", _TOKEN_FILE)

    def _load_tokens(self) -> None:
        if _TOKEN_FILE.exists():
            data = json.loads(_TOKEN_FILE.read_text())
            self._access_token = data.get("access_token", "")
            self._refresh_token = data.get("refresh_token", "")
            self._token_expiry = data.get("token_expiry", 0.0)
            logger.info("Loaded cached tokens (expires in %.0fs)", self._token_expiry - time.time())

    def _ensure_token(self) -> None:
        if not self._access_token:
            raise RuntimeError("No access token — run `broker.authorize()` first.")
        if time.time() >= self._token_expiry:
            logger.info("Access token expired, refreshing…")
            self._refresh_access_token()

    def _headers(self) -> dict:
        self._ensure_token()
        return {"Authorization": f"Bearer {self._access_token}", "Content-Type": "application/json"}

    # ── Market data ─────────────────────────────────────────────────────────

    def get_quote(self, symbol: str) -> dict:
        resp = requests.get(
            f"{_API_BASE}/marketdata/{symbol}/quotes",
            headers=self._headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def last_price(self, symbol: str) -> float:
        data = self.get_quote(symbol)
        # Quote shape: { "AAPL": { "quote": { "lastPrice": 182.5 } } }
        quote = data.get(symbol, {}).get("quote", {})
        price = quote.get("lastPrice") or quote.get("mark") or quote.get("closePrice")
        if price is None:
            raise ValueError(f"Could not determine last price for {symbol}")
        return float(price)

    # ── Order placement ─────────────────────────────────────────────────────

    def place_order(self, order_payload: dict) -> requests.Response:
        url = f"{_API_BASE}/accounts/{self._account_hash}/orders"
        resp = requests.post(url, headers=self._headers(), json=order_payload, timeout=15)
        if not resp.ok:
            logger.error("Order rejected [%s]: %s", resp.status_code, resp.text)
        resp.raise_for_status()
        return resp

    def build_equity_order(
        self,
        symbol: str,
        action: str,          # "BUY" or "SELL"
        quantity: int,
        order_type: str = "MARKET",
        limit_price: float | None = None,
        stop_price: float | None = None,
        duration: str = "DAY",
        session: str = "NORMAL",
    ) -> dict:
        """Return a Schwab order payload dict for a single-leg equity order."""
        instruction = action.upper()  # BUY / SELL / BUY_TO_COVER / SELL_SHORT
        leg = {
            "instruction": instruction,
            "quantity": quantity,
            "instrument": {"symbol": symbol, "assetType": "EQUITY"},
        }
        payload: dict[str, Any] = {
            "orderType": order_type,
            "session": session,
            "duration": duration,
            "orderStrategyType": "SINGLE",
            "orderLegCollection": [leg],
        }
        if order_type == "LIMIT" and limit_price is not None:
            payload["price"] = round(limit_price, 2)
        if order_type == "STOP" and stop_price is not None:
            payload["stopPrice"] = round(stop_price, 2)
        return payload

    def build_oco_bracket(
        self,
        symbol: str,
        quantity: int,
        entry_price: float,
        stop_loss_price: float,
        take_profit_price: float | None = None,
        is_buy: bool = True,
    ) -> dict:
        """
        Build an OCO (One-Cancels-Other) bracket order payload.

        This submits a TRIGGER order so the bracket only activates after the
        entry fills.  Layout:
            TRIGGER (entry market order)
              └─ OCO
                    ├─ LIMIT (take-profit, optional)
                    └─ STOP  (stop-loss)
        """
        close_instruction = "SELL" if is_buy else "BUY"

        child_orders = []

        if take_profit_price is not None:
            child_orders.append({
                "orderType": "LIMIT",
                "session": "NORMAL",
                "duration": "GOOD_TILL_CANCEL",
                "price": round(take_profit_price, 2),
                "orderStrategyType": "SINGLE",
                "orderLegCollection": [{
                    "instruction": close_instruction,
                    "quantity": quantity,
                    "instrument": {"symbol": symbol, "assetType": "EQUITY"},
                }],
            })

        child_orders.append({
            "orderType": "STOP",
            "session": "NORMAL",
            "duration": "GOOD_TILL_CANCEL",
            "stopPrice": round(stop_loss_price, 2),
            "orderStrategyType": "SINGLE",
            "orderLegCollection": [{
                "instruction": close_instruction,
                "quantity": quantity,
                "instrument": {"symbol": symbol, "assetType": "EQUITY"},
            }],
        })

        entry_instruction = "BUY" if is_buy else "SELL"
        return {
            "orderType": "MARKET",
            "session": "NORMAL",
            "duration": "DAY",
            "orderStrategyType": "TRIGGER",
            "orderLegCollection": [{
                "instruction": entry_instruction,
                "quantity": quantity,
                "instrument": {"symbol": symbol, "assetType": "EQUITY"},
            }],
            "childOrderStrategies": [{
                "orderStrategyType": "OCO",
                "childOrderStrategies": child_orders,
            }],
        }

    # ── Account info ────────────────────────────────────────────────────────

    def get_account(self) -> dict:
        resp = requests.get(
            f"{_API_BASE}/accounts/{self._account_hash}",
            headers=self._headers(),
            params={"fields": "positions,orders"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def get_open_orders(self) -> list:
        resp = requests.get(
            f"{_API_BASE}/accounts/{self._account_hash}/orders",
            headers=self._headers(),
            params={"status": "WORKING"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
