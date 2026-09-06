from typing import Dict, Any, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import CurrencyProvider, ProviderStatus, provider_cache, http_get_json

BENCHMARK_RATES_TO_INR = {
    "INR": 1.0,
    "USD": 86.40,
    "EUR": 93.50,
    "GBP": 110.20,
    "AED": 23.52,
    "SGD": 64.80,
    "THB": 2.48,
    "JPY": 0.58,
    "AUD": 56.10,
    "CAD": 61.20,
}

CURRENCY_FLAGS = {
    "INR": "🇮🇳",
    "USD": "🇺🇸",
    "EUR": "🇪🇺",
    "GBP": "🇬🇧",
    "AED": "🇦🇪",
    "SGD": "🇸🇬",
    "THB": "🇹🇭",
    "JPY": "🇯🇵",
    "AUD": "🇦🇺",
    "CAD": "🇨🇦",
}

CURRENCY_NAMES = {
    "INR": "Indian Rupee",
    "USD": "US Dollar",
    "EUR": "Euro",
    "GBP": "British Pound",
    "AED": "UAE Dirham",
    "SGD": "Singapore Dollar",
    "THB": "Thai Baht",
    "JPY": "Japanese Yen",
    "AUD": "Australian Dollar",
    "CAD": "Canadian Dollar",
}


class LiveCurrencyProvider(CurrencyProvider):
    """
    Live Foreign Exchange Rate Provider using public central bank reference data (Frankfurter/ECB API).
    """
    BASE_URL = "https://api.frankfurter.app/latest"

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "European Central Bank / Frankfurter Forex Network",
            "category": "Currency",
            "status": ProviderStatus.CONNECTED,
            "data_type": "LIVE",
            "is_live": True,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Real-time foreign exchange market rates against Indian Rupee and major global currencies.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        test_url = f"{self.BASE_URL}?from=USD&to=EUR"
        success, data, latency = http_get_json(test_url, timeout=4)
        if success and isinstance(data, dict) and "rates" in data:
            return True, "Forex API reachable and rates verified", latency
        return False, f"Forex API error: {data}", latency

    def get_rates(self, base_currency: str = "INR") -> Dict[str, Any]:
        base = base_currency.upper()
        cache_key = f"forex_rates_{base}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        # Fetch USD base rates from Frankfurter, then compute cross rates to INR
        url = f"{self.BASE_URL}?from=USD"
        success, data, latency = http_get_json(url, timeout=5)

        if not success or not isinstance(data, dict) or "rates" not in data:
            # Fallback to mock currency rates
            mock = MockCurrencyProvider()
            return mock.get_rates(base)

        usd_rates = data.get("rates", {})
        usd_to_inr = usd_rates.get("INR", 86.4)

        # Build INR conversion rates
        rates_list = []
        for code, name in CURRENCY_NAMES.items():
            if code == "INR":
                rate_against_inr = 1.0
            elif code == "USD":
                rate_against_inr = usd_to_inr
            elif code in usd_rates:
                # 1 Code = (usd_to_inr / usd_rates[code]) INR
                rate_against_inr = round(usd_to_inr / usd_rates[code], 4)
            else:
                rate_against_inr = BENCHMARK_RATES_TO_INR.get(code, 1.0)

            rates_list.append({
                "code": code,
                "name": name,
                "symbol": "₹" if code == "INR" else ("$" if code in ["USD", "SGD", "AUD", "CAD"] else ("€" if code == "EUR" else "£")),
                "rateAgainstINR": rate_against_inr,
                "flag": CURRENCY_FLAGS.get(code, "🌐"),
            })

        result = {
            "provider": "Frankfurter Central Bank Forex",
            "source": "CENTRAL_BANK_FOREX_API",
            "data_type": "LIVE",
            "is_live": True,
            "base_currency": base,
            "rates": rates_list,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        # Cache for 1 hour
        provider_cache.set(cache_key, result, ttl_seconds=3600)
        return result

    def convert(self, amount: float, from_curr: str, to_curr: str) -> Dict[str, Any]:
        from_c = from_curr.upper()
        to_c = to_curr.upper()

        if from_c == to_c:
            return {
                "amount": amount,
                "from_currency": from_c,
                "to_currency": to_c,
                "converted_amount": amount,
                "exchange_rate": 1.0,
                "data_type": "LIVE",
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }

        rates_data = self.get_rates("INR")
        rates_map = {r["code"]: r["rateAgainstINR"] for r in rates_data.get("rates", [])}

        from_rate_inr = rates_map.get(from_c, BENCHMARK_RATES_TO_INR.get(from_c, 1.0))
        to_rate_inr = rates_map.get(to_c, BENCHMARK_RATES_TO_INR.get(to_c, 1.0))

        # Convert from_curr -> INR -> to_curr
        inr_val = amount * from_rate_inr
        converted = round(inr_val / to_rate_inr, 2)
        effective_rate = round(from_rate_inr / to_rate_inr, 4)

        return {
            "amount": amount,
            "from_currency": from_c,
            "to_currency": to_c,
            "converted_amount": converted,
            "exchange_rate": effective_rate,
            "data_type": rates_data.get("data_type", "LIVE"),
            "provider": rates_data.get("provider", "Frankfurter Central Bank Forex"),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }


class MockCurrencyProvider(CurrencyProvider):
    """Fallback benchmark currency rate provider."""
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Demo Forex Provider",
            "category": "Currency",
            "status": ProviderStatus.DEMO,
            "data_type": "DEMO",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Static standard forex conversion rates for offline demo sandbox.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock forex engine operational", 1

    def get_rates(self, base_currency: str = "INR") -> Dict[str, Any]:
        rates_list = []
        for code, rate in BENCHMARK_RATES_TO_INR.items():
            rates_list.append({
                "code": code,
                "name": CURRENCY_NAMES.get(code, code),
                "symbol": "₹" if code == "INR" else ("$" if code in ["USD", "SGD", "AUD", "CAD"] else "€"),
                "rateAgainstINR": rate,
                "flag": CURRENCY_FLAGS.get(code, "🌐"),
            })

        return {
            "provider": "TripPilot Demo Forex Provider",
            "source": "BENCHMARK_RATES",
            "data_type": "DEMO",
            "is_live": False,
            "base_currency": base_currency.upper(),
            "rates": rates_list,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    def convert(self, amount: float, from_curr: str, to_curr: str) -> Dict[str, Any]:
        from_c = from_curr.upper()
        to_c = to_curr.upper()
        from_rate = BENCHMARK_RATES_TO_INR.get(from_c, 1.0)
        to_rate = BENCHMARK_RATES_TO_INR.get(to_c, 1.0)

        inr_val = amount * from_rate
        converted = round(inr_val / to_rate, 2)
        effective_rate = round(from_rate / to_rate, 4)

        return {
            "amount": amount,
            "from_currency": from_c,
            "to_currency": to_c,
            "converted_amount": converted,
            "exchange_rate": effective_rate,
            "data_type": "DEMO",
            "provider": "TripPilot Demo Forex Provider",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
