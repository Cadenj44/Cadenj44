"""
Trade executor — receives a parsed TradingView signal dict and submits the
correct order (with stop-loss bracket) to the broker.

Expected signal schema (sent by your TradingView alert as JSON):
{
    "secret":      "YOUR_WEBHOOK_SECRET",   // optional — verified if set
    "action":      "BUY" | "SELL",
    "symbol":      "AAPL",
    "quantity":    10,                       // optional, falls back to DEFAULT_QUANTITY
    "stop_loss":   182.00,                   // optional explicit stop price
    "stop_pct":    0.02,                     // optional % stop (overridden by stop_loss)
    "take_profit": 195.00                    // optional take-profit price
}
"""
import logging
from typing import Any

from .broker import SchwabBroker
from .config import Config

logger = logging.getLogger(__name__)


class TradeExecutor:
    def __init__(self, broker: SchwabBroker, config: Config):
        self._broker = broker
        self._config = config

    def handle_signal(self, signal: dict[str, Any]) -> None:
        """Parse a TradingView webhook payload and execute the trade."""
        # ── Validate secret ─────────────────────────────────────────────────
        if self._config.WEBHOOK_SECRET:
            if signal.get("secret") != self._config.WEBHOOK_SECRET:
                logger.warning("Rejected signal — invalid secret.")
                return

        action = signal.get("action", "").upper()
        symbol = signal.get("symbol", "").upper()

        if action not in ("BUY", "SELL"):
            logger.error("Unknown action '%s' — ignoring signal.", action)
            return
        if not symbol:
            logger.error("Signal missing 'symbol' field — ignoring.")
            return

        quantity = int(signal.get("quantity", self._config.DEFAULT_QUANTITY))

        # ── Fetch current price ─────────────────────────────────────────────
        try:
            last = self._broker.last_price(symbol)
            logger.info("Last price for %s: %.2f", symbol, last)
        except Exception as exc:
            logger.error("Could not fetch price for %s: %s", symbol, exc)
            return

        # ── Determine stop-loss price ───────────────────────────────────────
        stop_price: float | None = None
        if "stop_loss" in signal:
            stop_price = float(signal["stop_loss"])
        elif "stop_pct" in signal:
            pct = float(signal["stop_pct"])
            stop_price = last * (1 - pct) if action == "BUY" else last * (1 + pct)
        else:
            pct = self._config.DEFAULT_STOP_LOSS_PCT
            stop_price = last * (1 - pct) if action == "BUY" else last * (1 + pct)

        stop_price = round(stop_price, 2)
        take_profit: float | None = signal.get("take_profit")
        if take_profit is not None:
            take_profit = round(float(take_profit), 2)

        logger.info(
            "Signal → %s %d %s | stop=%.2f%s",
            action, quantity, symbol, stop_price,
            f" | tp={take_profit:.2f}" if take_profit else "",
        )

        # ── Build bracket order ─────────────────────────────────────────────
        order_payload = self._broker.build_oco_bracket(
            symbol=symbol,
            quantity=quantity,
            entry_price=last,
            stop_loss_price=stop_price,
            take_profit_price=take_profit,
            is_buy=(action == "BUY"),
        )

        # ── Submit (or dry-run) ─────────────────────────────────────────────
        if self._config.DRY_RUN:
            import json
            logger.info("[DRY RUN] Would have submitted:\n%s", json.dumps(order_payload, indent=2))
            return

        try:
            resp = self._broker.place_order(order_payload)
            order_id = resp.headers.get("Location", "unknown").split("/")[-1]
            logger.info(
                "Order submitted successfully. Order ID: %s | %s %d %s | stop=%.2f",
                order_id, action, quantity, symbol, stop_price,
            )
        except Exception as exc:
            logger.error("Failed to submit order for %s: %s", symbol, exc)
