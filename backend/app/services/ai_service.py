"""
AI Service — Groq Cloud API Integration with graceful fallback.
The GROK_API_KEY is read server-side only. Never exposed to frontend.
"""
import json
import re
import logging
import httpx
from typing import Optional
from config import current_config

logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
    _openai_available = True
except ImportError:
    _openai_available = False


def _get_client() -> Optional[object]:
    if not _openai_available:
        return None
    if not current_config.GROK_API_KEY:
        return None
    try:
        return OpenAI(
            api_key=current_config.GROK_API_KEY,
            base_url=current_config.GROK_BASE_URL,
        )
    except Exception as e:
        logger.error(f"Failed to create Groq client: {e}")
        return None


def _clean_json_text(text: str) -> str:
    """Extract raw JSON substring from potentially markdown-wrapped model outputs."""
    text = text.strip()
    if text.startswith("```"):
        # Match ```json ... ``` or ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
    return text


def _call_grok(system_prompt: str, user_message: str, json_mode: bool = True) -> Optional[dict]:
    client = _get_client()
    # Ensure the request mentions JSON when needed
    if json_mode and "json" not in system_prompt.lower() and "json" not in user_message.lower():
        user_message += "\nRespond ONLY in valid JSON format."

    models_to_try = [current_config.GROK_MODEL, "openai/gpt-oss-20b"]
    # First, try using the OpenAI client (if it was created successfully)
    if client:
        for model_name in models_to_try:
            try:
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ]
                kwargs = {
                    "model": model_name,
                    "messages": messages,
                    "max_tokens": 2048,
                    "temperature": 0.7,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                response = client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
                if not content:
                    continue
                if json_mode:
                    cleaned = _clean_json_text(content)
                    return json.loads(cleaned)
                return {"text": content}
            except Exception as e:
                logger.warning(f"Groq API call with model {model_name} via OpenAI client failed: {e}. Trying next model/fallback.")
                continue
    # If the OpenAI client failed (or was not created), fall back to a direct HTTP request using httpx
    try:
        url = f"{current_config.GROK_BASE_URL.rstrip('/')}/chat/completions"
        headers = {"Authorization": f"Bearer {current_config.GROK_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": models_to_try[0],
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": 2048,
            "temperature": 0.7,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content:
            return None
        if json_mode:
            cleaned = _clean_json_text(content)
            return json.loads(cleaned)
        return {"text": content}
    except Exception as e:
        logger.error(f"Direct HTTP call to Groq failed: {e}")
        return None


# ── Destination Recommendations ──────────────────────────────────────────────

def get_destination_recommendations(params: dict, db_destinations: list) -> dict:
    system_prompt = """You are TripPilot AI, an expert travel planner. 
    Return ONLY valid JSON matching this schema:
    {
      "summary": "string",
      "recommended_destinations": [{"name": "string", "reason": "string", "estimated_budget": number}],
      "tips": ["string"],
      "best_time_to_visit": "string",
      "warnings": ["string"]
    }"""

    user_message = f"""
    Help plan a trip with these details in JSON:
    {json.dumps(params, indent=2)}
    
    Available destinations from our database:
    {json.dumps([{"city": d.get("city"), "country": d.get("country"), "tags": d.get("tags", [])} for d in db_destinations[:10]], indent=2)}
    
    Recommend 3-5 destinations and provide travel tips. Use estimated prices in {current_config.CURRENCY}.
    """

    result = _call_grok(system_prompt, user_message)
    if result:
        return {"source": "ai", **result}

    # Fallback: database-based recommendations
    return _fallback_destination_recommendations(db_destinations, params)


def _fallback_destination_recommendations(destinations: list, params: dict) -> dict:
    budget = params.get("budget", 50000)
    recommended = [
        d for d in destinations
        if d.get("average_daily_budget", 9999) * 5 <= budget
    ][:5]

    return {
        "source": "fallback",
        "summary": "Here are some popular destinations based on your preferences.",
        "recommended_destinations": [
            {
                "name": f"{d.get('city')}, {d.get('country')}",
                "reason": d.get("description", "")[:100],
                "estimated_budget": d.get("average_daily_budget", 3000) * 5,
            }
            for d in recommended
        ],
        "tips": ["Book in advance for best prices.", "Travel during shoulder season for fewer crowds."],
        "best_time_to_visit": "October to March for most Indian destinations.",
        "warnings": [],
    }


# ── Itinerary Generation ──────────────────────────────────────────────────────

def generate_itinerary(params: dict, db_hotels: list, db_flights: list) -> dict:
    mode = params.get("travelExperienceMode") or params.get("travel_mode") or "standard"
    mode_instruction = ""
    if mode == "family":
        mode_instruction = "IMPORTANT: Travel Experience Mode is 'Family with Kids'. Prioritize kid-friendly attractions, safe family seating, relaxed pacing, and family-friendly dining."
    elif mode == "accessibility":
        mode_instruction = "IMPORTANT: Travel Experience Mode is 'Accessibility Mode'. Prioritize step-free access, wheelchair accessible venues, accessible transit, and barrier-free accommodations."

    system_prompt = f"""You are TripPilot AI. Generate a detailed day-by-day travel itinerary.
    {mode_instruction}
    Return ONLY valid JSON matching this schema:
    {{
      "title": "string",
      "summary": "string",
      "days": [
        {{
          "day": 1,
          "date": "YYYY-MM-DD",
          "activities": [
            {{"time": "HH:MM", "activity": "string", "description": "string", "estimated_cost": number, "type": "sightseeing|food|transport|accommodation"}}
          ],
          "accommodation": "string",
          "daily_budget": number
        }}
      ],
      "estimated_total_cost": number,
      "budget_breakdown": {{"flights": number, "hotels": number, "food": number, "activities": number, "transport": number}},
      "important_notes": ["string"],
      "alternatives": ["string"]
    }}"""

    user_message = f"""
    Create a detailed itinerary in JSON format:
    {json.dumps(params, indent=2)}
    
    Available hotels: {json.dumps([{"name": h.get("name"), "city": h.get("city"), "price_per_night": h.get("price_per_night"), "rating": h.get("rating")} for h in db_hotels[:5]], indent=2)}
    Available flights: {json.dumps([{"airline": f.get("airline"), "origin": f.get("origin"), "destination": f.get("destination"), "price": f.get("price"), "departure_time": str(f.get("departure_time", ""))} for f in db_flights[:5]], indent=2)}
    
    Currency: {current_config.CURRENCY}. Make it realistic and day-by-day.
    """

    result = _call_grok(system_prompt, user_message)
    if result:
        return {"source": "ai", **result}
    return _fallback_itinerary(params)


def _fallback_itinerary(params: dict) -> dict:
    days_count = params.get("duration_days", 5)
    destination = params.get("destination", "Goa")
    budget = params.get("budget", 50000)
    daily_budget = budget // max(days_count, 1)
    mode = params.get("travelExperienceMode") or params.get("travel_mode") or "standard"

    if mode == "family":
        activities_by_day = [
            ["Arrive and check in at family resort", "Kids splash pool & beach walk", "Family dinner at seaside restaurant"],
            ["Morning dolphin cruise / marine safari", "Lunch at kid-friendly café", "Spice plantation & butterfly park", "Sunset beach picnic"],
            ["Water park or heritage fort exploration", "Local sweet making workshop", "Souvenir craft market"],
            ["Safe shallow beach swimming", "Relaxing resort games / spa for parents", "Sunset garden diner"],
            ["Final family photos & breakfast", "Toy & craft shopping", "Comfortable transfer & departure"],
        ]
        title_suffix = " (Family with Kids Edition)"
        summary_note = "Tailored with kid-friendly activities, family dining, and relaxed travel pacing."
    elif mode == "accessibility":
        activities_by_day = [
            ["Arrive & check in at step-free accessible stay", "Accessible promenade roll/stroll", "Barrier-free waterfront dining"],
            ["Morning accessible viewpoints & wide trail", "Lunch at step-free heritage restaurant", "Museum with elevator & audio tour"],
            ["Scenic drive & panoramic accessible viewpoint", "Seated cultural performance & dining", "Accessible craft bazaar"],
            ["Relaxation at accessible resort garden & pool", "Gentle sightseeing with ramp access", "Gourmet seated dinner"],
            ["Morning leisurely breakfast", "Local shopping with flat access", "Accessible private transfer to airport/station"],
        ]
        title_suffix = " (Accessibility Edition)"
        summary_note = "Optimized with step-free attractions, wheelchair-friendly venues, and accessible transit."
    else:
        activities_by_day = [
            ["Arrive and check in", "Evening walk on beach", "Dinner at local restaurant"],
            ["Morning sightseeing", "Lunch at famous café", "Museum visit", "Sunset viewing"],
            ["Day trip to nearby attraction", "Local cuisine experience", "Shopping"],
            ["Adventure activities", "Spa or relaxation", "Local market"],
            ["Final sightseeing", "Souvenir shopping", "Departure"],
        ]
        title_suffix = ""
        summary_note = f"An amazing {days_count}-day itinerary for {destination}."

    days = []
    for i in range(min(days_count, 5)):
        days.append({
            "day": i + 1,
            "date": params.get("start_date", "2026-09-15"),
            "activities": [
                {"time": "09:00", "activity": act, "description": f"Explore {destination}", "estimated_cost": daily_budget // len(activities_by_day[i % len(activities_by_day)]), "type": "sightseeing"}
                for act in activities_by_day[i % len(activities_by_day)]
            ],
            "accommodation": f"Hotel in {destination}",
            "daily_budget": daily_budget,
        })

    return {
        "source": "fallback",
        "title": f"{days_count}-Day Trip to {destination}{title_suffix}",
        "summary": summary_note,
        "days": days,
        "estimated_total_cost": budget,
        "budget_breakdown": {"flights": int(budget * 0.3), "hotels": int(budget * 0.3), "food": int(budget * 0.2), "activities": int(budget * 0.1), "transport": int(budget * 0.1)},
        "important_notes": ["Prices are estimated. Book in advance.", "Carry local currency."],
        "alternatives": ["Consider nearby cities for variety."],
    }


# ── Chat ──────────────────────────────────────────────────────────────────────

def chat(messages: list, context: dict) -> dict:
    mode = context.get("travelExperienceMode") or context.get("travel_mode") or "standard"
    mode_info = ""
    if mode == "family":
        mode_info = "The traveler is in 'Family with Kids' mode. Prioritize family-safe stays, kid-friendly spots, and relaxed travel."
    elif mode == "accessibility":
        mode_info = "The traveler is in 'Accessibility' mode. Prioritize wheelchair access, step-free hotels/transit, and accessible facilities."

    system_prompt = f"""You are TripPilot AI, a helpful, friendly, and knowledgeable travel assistant. 
    {mode_info}
    You help users plan trips, find hotels and flights, manage budgets, and recommend destinations.
    Be concise, helpful, and provide specific travel tips with estimated prices in INR (₹)."""

    user_message = f"User query: {messages[-1].get('content', '') if messages else ''}\nContext: {json.dumps(context)}"

    result = _call_grok(system_prompt, user_message, json_mode=False)
    if result and result.get("text"):
        reply_text = result.get("text", "").strip()
        return {
            "source": "ai",
            "message": reply_text,
            "reply": reply_text,
            "suggestions": ["Find flights to Goa", "Recommend luxury hotels in Dubai", "Plan a 5-day Bali itinerary"],
        }

    fallback_text = "Hello! I am your TripPilot AI travel assistant. How can I help you plan your next trip, compare flight fares, or find verified hotels?"
    return {
        "source": "fallback",
        "message": fallback_text,
        "reply": fallback_text,
        "suggestions": ["Search flights from Delhi", "Top stays in Goa", "Create AI itinerary"],
    }


# ── Budget Optimization Suggestions ───────────────────────────────────────────

def get_budget_suggestions(budget_data: dict) -> dict:
    system_prompt = """You are TripPilot AI budget optimizer. 
    Analyze this trip budget and provide 3-5 specific, actionable money-saving tips in JSON.
    Return ONLY valid JSON:
    {
      "suggestions": [
        {"category": "flights|hotels|food|activities|transport|general", "tip": "string", "potential_savings": number}
      ],
      "overall_assessment": "string",
      "projected_savings": number
    }"""

    user_message = f"Analyze this budget and output JSON:\n{json.dumps(budget_data, indent=2)}"

    result = _call_grok(system_prompt, user_message)
    if result:
        return {"source": "ai", **result}

    return {
        "source": "fallback",
        "suggestions": [
            {"category": "flights", "tip": "Book weekday flights (Tue/Wed) to save 15-20%", "potential_savings": 2500},
            {"category": "hotels", "tip": "Consider staying slightly outside prime tourist areas", "potential_savings": 3500},
            {"category": "food", "tip": "Eat where locals eat for authentic and affordable meals", "potential_savings": 1500},
        ],
        "overall_assessment": "Your budget is well-distributed. Some minor adjustments can save money.",
        "projected_savings": 7500,
    }


# ── Modify Itinerary ──────────────────────────────────────────────────────────

def modify_itinerary(itinerary: dict, modification_type: str, user_preferences: dict) -> dict:
    prompts = {
        "cheaper": "Modify this itinerary to reduce costs by 20-30%. Suggest budget alternatives for stays and activities.",
        "adventure": "Add more adventure activities (trekking, water sports, outdoor exploration) to this itinerary.",
        "family": "Make this itinerary family-friendly with activities suitable for all ages.",
        "reduce_travel": "Optimize this itinerary to minimize travel time between locations.",
        "luxury": "Upgrade this itinerary with luxury stays, fine dining, and premium experiences.",
    }

    system_prompt = f"""You are TripPilot AI. {prompts.get(modification_type, 'Modify this itinerary as requested.')}
    Return ONLY valid JSON matching the same itinerary schema:
    {
      "title": "string",
      "summary": "string",
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "activities": [
            {"time": "HH:MM", "activity": "string", "description": "string", "estimated_cost": number, "type": "sightseeing|food|transport|accommodation"}
          ],
          "accommodation": "string",
          "daily_budget": number
        }
      ],
      "estimated_total_cost": number,
      "budget_breakdown": {"flights": number, "hotels": number, "food": number, "activities": number, "transport": number},
      "important_notes": ["string"],
      "alternatives": ["string"]
    }"""

    user_message = f"Original itinerary in JSON:\n{json.dumps(itinerary, indent=2)}\nPreferences: {json.dumps(user_preferences)}"

    result = _call_grok(system_prompt, user_message)
    if result:
        return {"source": "ai", **result}
    return {"source": "fallback", **itinerary}
