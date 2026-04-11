"""
Configuration loader — reads from environment variables or a .env file.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Schwab / ThinkorSwim API ────────────────────────────────────────────
    SCHWAB_APP_KEY: str = os.environ["SCHWAB_APP_KEY"]
    SCHWAB_APP_SECRET: str = os.environ["SCHWAB_APP_SECRET"]
    SCHWAB_CALLBACK_URL: str = os.getenv(
        "SCHWAB_CALLBACK_URL", "https://127.0.0.1"
    )
    # The encrypted account hash returned by GET /accounts (not the account number)
    SCHWAB_ACCOUNT_HASH: str = os.environ["SCHWAB_ACCOUNT_HASH"]

    # ── Webhook server ──────────────────────────────────────────────────────
    WEBHOOK_HOST: str = os.getenv("WEBHOOK_HOST", "0.0.0.0")
    WEBHOOK_PORT: int = int(os.getenv("WEBHOOK_PORT", "8080"))
    # Optional shared secret — TradingView sends this in the alert message
    # so you can verify the request is legitimate.
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "")

    # ── Risk management defaults ────────────────────────────────────────────
    # Default stop-loss percentage below entry price (e.g. 0.02 = 2 %)
    DEFAULT_STOP_LOSS_PCT: float = float(os.getenv("DEFAULT_STOP_LOSS_PCT", "0.02"))
    # Default number of shares per trade (can be overridden per alert)
    DEFAULT_QUANTITY: int = int(os.getenv("DEFAULT_QUANTITY", "1"))
    # If True the bot paper-trades (logs orders but does NOT submit them)
    DRY_RUN: bool = os.getenv("DRY_RUN", "false").lower() == "true"
