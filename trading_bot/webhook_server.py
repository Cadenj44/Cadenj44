"""
Flask webhook server — listens for TradingView alert POST requests.

TradingView alert setup (in your alert's Webhook URL field):
    http(s)://<your-server-ip>:<WEBHOOK_PORT>/webhook

Alert message body (paste this into TradingView → "Message" field):
{
    "secret":      "YOUR_WEBHOOK_SECRET",
    "action":      "{{strategy.order.action}}",
    "symbol":      "{{ticker}}",
    "quantity":    {{strategy.order.contracts}},
    "stop_loss":   {{plot("Stop Loss")}},
    "take_profit": {{plot("Take Profit")}}
}

Omit fields you don't use — the bot has sensible defaults.
"""
import logging

from flask import Flask, request, jsonify

from .trade_executor import TradeExecutor

logger = logging.getLogger(__name__)


def create_app(executor: TradeExecutor) -> Flask:
    app = Flask(__name__)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.route("/webhook", methods=["POST"])
    def webhook():
        if not request.is_json:
            logger.warning("Received non-JSON request from %s", request.remote_addr)
            return jsonify({"error": "Content-Type must be application/json"}), 415

        signal = request.get_json(silent=True)
        if signal is None:
            return jsonify({"error": "Invalid JSON body"}), 400

        logger.info("Received signal from %s: %s", request.remote_addr, signal)

        try:
            executor.handle_signal(signal)
        except Exception as exc:
            logger.exception("Unhandled error processing signal: %s", exc)
            return jsonify({"error": "Internal error processing signal"}), 500

        return jsonify({"status": "signal accepted"}), 200

    return app
