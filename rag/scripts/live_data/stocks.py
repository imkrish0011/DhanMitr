"""Fetch Indian stock prices using yfinance."""

from __future__ import annotations

import yfinance as yf


STOCK_ALIASES = {
    "reliance": "RELIANCE.NS",
    "reliance industries": "RELIANCE.NS",
    "tcs": "TCS.NS",
    "tata consultancy services": "TCS.NS",
    "sbi": "SBIN.NS",
    "state bank of india": "SBIN.NS",
    "hdfc bank": "HDFCBANK.NS",
    "hdfcbank": "HDFCBANK.NS",
}


def get_stock_price(symbol: str) -> dict:
    """Fetch the latest available stock price."""

    ticker = yf.Ticker(symbol)

    info = ticker.fast_info

    price = info["lastPrice"]

    return {
        "provider": "yfinance",
        "symbol": symbol,
        "currency": info["currency"],
        "exchange": info["exchange"],
        "price": float(price),
        "is_live": True,
    }


def main() -> None:
    """Test Indian stock prices."""

    stocks = [
        "RELIANCE.NS",
        "TCS.NS",
        "SBIN.NS",
        "HDFCBANK.NS",
    ]

    for symbol in stocks:
        try:
            data = get_stock_price(symbol)

            print()
            print("=" * 50)
            print(f"Stock: {data['symbol']}")
            print(f"Price: ₹{data['price']}")
            print(f"Currency: {data['currency']}")
            print(f"Exchange: {data['exchange']}")
            print(f"Provider: {data['provider']}")

        except Exception as exc:
            print()
            print(f"{symbol} failed:")
            print(f"{type(exc).__name__}: {exc}")


if __name__ == "__main__":
    main()