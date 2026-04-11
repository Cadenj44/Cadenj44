"""
Entry point — run with:

    python -m trading_bot.main

First-time setup (generates tokens.json):
    python -m trading_bot.main --authorize
"""
import argparse
import logging
import sys

from .broker import SchwabBroker
from .config import Config
from .trade_executor import TradeExecutor
from .webhook_server import create_app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="TradingView → ThinkorSwim trading bot")
    parser.add_argument(
        "--authorize",
        action="store_true",
        help="Run the interactive Schwab OAuth2 authorization flow.",
    )
    args = parser.parse_args()

    config = Config()

    broker = SchwabBroker(
        app_key=config.SCHWAB_APP_KEY,
        app_secret=config.SCHWAB_APP_SECRET,
        callback_url=config.SCHWAB_CALLBACK_URL,
        account_hash=config.SCHWAB_ACCOUNT_HASH,
    )

    if args.authorize:
        broker.authorize()
        logger.info("Authorization complete — tokens saved. Re-run without --authorize to start.")
        return

    executor = TradeExecutor(broker=broker, config=config)
    app = create_app(executor=executor)

    mode = "DRY RUN" if config.DRY_RUN else "LIVE"
    logger.info("Starting webhook server in %s mode on %s:%d", mode, config.WEBHOOK_HOST, config.WEBHOOK_PORT)

    app.run(host=config.WEBHOOK_HOST, port=config.WEBHOOK_PORT)


if __name__ == "__main__":
    main()
