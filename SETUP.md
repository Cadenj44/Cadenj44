# TradingView → ThinkorSwim Trading Bot — Setup Guide

## How it works

```
TradingView alert
       │  (HTTPS POST with JSON)
       ▼
Webhook server (Flask)
       │
       ▼
Trade executor
   • fetches live price from Schwab
   • calculates stop-loss price
   • builds bracket order (entry + OCO stop-loss/take-profit)
       │
       ▼
Schwab API  →  ThinkorSwim account
```

---

## 1. Create a Schwab developer app

1. Go to <https://developer.schwab.com> and sign in with your Schwab account.
2. Create a new **"Individual Trader API"** app.
3. Set the **Callback URL** to `https://127.0.0.1` (or your server domain).
4. Copy your **App Key** and **App Secret**.

---

## 2. Get your encrypted account hash

After authorizing (step 4 below) you can get your hash by running:

```bash
python - <<'EOF'
from trading_bot.broker import SchwabBroker
from trading_bot.config import Config
c = Config()
b = SchwabBroker(c.SCHWAB_APP_KEY, c.SCHWAB_APP_SECRET, c.SCHWAB_CALLBACK_URL, "placeholder")
import requests
resp = requests.get("https://api.schwabapi.com/trader/v1/accounts",
                    headers=b._headers())
for acct in resp.json():
    print(acct["hashValue"], "→", acct["securitiesAccount"]["accountNumber"])
EOF
```

---

## 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your App Key, App Secret, Callback URL, and Account Hash
```

---

## 4. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

## 5. Authorize with Schwab (one time)

```bash
python -m trading_bot.main --authorize
```

This prints a URL. Open it in your browser, log in, approve access, then paste
the redirected URL back into the terminal. Tokens are saved to
`trading_bot/tokens.json` (never commit this file).

---

## 6. Start the bot

```bash
python -m trading_bot.main
```

The server starts on `http://0.0.0.0:8080`.  
Visit `http://localhost:8080/health` to confirm it's running.

---

## 7. Expose the bot to the internet

TradingView must be able to reach your webhook URL. Options:

| Method | Notes |
|--------|-------|
| **ngrok** (easiest for testing) | `ngrok http 8080` → copy the HTTPS URL |
| VPS / cloud server | open port 8080 in your firewall |
| Reverse proxy (nginx + Let's Encrypt) | recommended for production |

---

## 8. Set up TradingView alerts

1. Open your chart → right-click an indicator → **Add Alert**.
2. In **Settings → Notifications**, enable **Webhook URL** and paste:
   ```
   https://<your-public-url>/webhook
   ```
3. In the **Message** field, paste this JSON (edit as needed):
   ```json
   {
     "secret":      "YOUR_WEBHOOK_SECRET",
     "action":      "{{strategy.order.action}}",
     "symbol":      "{{ticker}}",
     "quantity":    1,
     "stop_pct":    0.02,
     "take_profit": null
   }
   ```
   - `action` must be `"BUY"` or `"SELL"`
   - `stop_loss` overrides `stop_pct` if provided
   - `take_profit` is optional (omit or set to `null` for stop-only bracket)

---

## Signal JSON reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `secret` | string | if `WEBHOOK_SECRET` is set | Must match `WEBHOOK_SECRET` in `.env` |
| `action` | string | yes | `"BUY"` or `"SELL"` |
| `symbol` | string | yes | Ticker, e.g. `"AAPL"` |
| `quantity` | int | no | Shares (default: `DEFAULT_QUANTITY`) |
| `stop_loss` | float | no | Explicit stop price |
| `stop_pct` | float | no | % stop (e.g. `0.02` = 2%) |
| `take_profit` | float | no | Take-profit limit price |

---

## Paper trading / dry run

Set `DRY_RUN=true` in `.env` to log all signals and orders without submitting
them to Schwab. Great for testing your alert setup.

---

## File structure

```
trading_bot/
├── __init__.py
├── config.py          ← env var loading
├── broker.py          ← Schwab API client + order builders
├── trade_executor.py  ← signal parsing + order submission
├── webhook_server.py  ← Flask app
├── main.py            ← entry point
└── tokens.json        ← auto-generated, do NOT commit
requirements.txt
.env.example
.gitignore
SETUP.md               ← this file
```

---

## Disclaimer

This bot submits **real orders** to your brokerage account.  
Test thoroughly with `DRY_RUN=true` before going live.  
You are solely responsible for any trades placed.
