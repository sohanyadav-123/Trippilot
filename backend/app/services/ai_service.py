"""
AI Service — Groq Cloud API Integration with graceful fallback.
The GROK_API_KEY is read server-side only. Never exposed to frontend.
"""
import json
import re
import logging
import httpx
from typing import Optional, List, Dict, Any
from config import current_config
from app.services.places_service import search_hidden_places, get_all_hidden_places
from app.services.search_service import search_flights, search_hotels

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
        http_client = httpx.Client()
        return OpenAI(
            api_key=current_config.GROK_API_KEY,
            base_url=current_config.GROK_BASE_URL,
            http_client=http_client,
        )
    except Exception as e:
        logger.debug(f"Failed to create OpenAI client: {e}")
        return None


def _clean_json_text(text: str) -> str:
    """Extract raw JSON substring from potentially markdown-wrapped model outputs."""
    text = text.strip()
    if text.startswith("```"):
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
    return text


def _call_grok_conversation(messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.7) -> Optional[dict]:
    """
    Calls the LLM with full multi-turn conversation messages.
    Tries OpenAI client first, then direct HTTP request with httpx.
    """
    client = _get_client()
    models_to_try = [current_config.GROK_MODEL, "openai/gpt-oss-20b"]

    # If json_mode is requested, make sure 'json' appears in at least one message
    if json_mode:
        has_json = any("json" in m.get("content", "").lower() for m in messages)
        if not has_json and messages:
            messages[-1]["content"] += "\nRespond ONLY in valid JSON format."

    # First attempt: OpenAI client
    if client:
        for model_name in models_to_try:
            try:
                kwargs = {
                    "model": model_name,
                    "messages": messages,
                    "max_tokens": 2048,
                    "temperature": temperature,
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
                logger.warning(f"Groq API call with model {model_name} via client failed: {e}. Trying fallback.")
                continue

    # Second attempt: Direct HTTP request via httpx
    try:
        url = f"{current_config.GROK_BASE_URL.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {current_config.GROK_API_KEY}",
            "Content-Type": "application/json"
        }
        for model_name in models_to_try:
            try:
                payload = {
                    "model": model_name,
                    "messages": messages,
                    "max_tokens": 2048,
                    "temperature": temperature,
                }
                if json_mode:
                    payload["response_format"] = {"type": "json_object"}

                response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                if not content:
                    continue

                if json_mode:
                    cleaned = _clean_json_text(content)
                    return json.loads(cleaned)
                return {"text": content}
            except Exception as e:
                logger.warning(f"Direct HTTP call with {model_name} failed: {e}")
                continue
    except Exception as e:
        logger.error(f"All direct HTTP calls failed: {e}")

    return None


def _call_grok(system_prompt: str, user_message: str, json_mode: bool = True) -> Optional[dict]:
    """Convenience wrapper for single-prompt calls."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]
    return _call_grok_conversation(messages, json_mode=json_mode)


# ── Title Generator ──────────────────────────────────────────────────────────

def generate_conversation_title(first_query: str) -> str:
    """Generate a clean, short 2-5 word title for a conversation."""
    q = first_query.strip()
    q_clean = re.sub(r"[?!.,:;]+", "", q).strip()

    # Fast heuristics for common queries
    q_lower = q_clean.lower()
    if re.match(r"^(hey|hello|hi|hiya|yo|namaste)", q_lower):
        return "Trip Consultation"
    if "hidden" in q_lower and "goa" in q_lower:
        return "Hidden Places in Goa"
    if "hidden" in q_lower:
        m = re.search(r"hidden (?:places|gems|spots|beaches)(?: in ([a-zA-Z\s]+))?", q_lower)
        if m and m.group(1):
            return f"Hidden Gems in {m.group(1).strip().title()}"
        return "Curated Hidden Places"
    if "budget" in q_lower:
        return "Trip Budget Planning"
    if "flight" in q_lower:
        return "Flight Search & Fares"
    if "hotel" in q_lower:
        return "Hotel Recommendations"
    if "itinerary" in q_lower:
        return "Trip Itinerary Design"
    if "france" in q_lower and "capital" in q_lower:
        return "Capital of France"
    if "telephone" in q_lower:
        return "Invention of the Telephone"

    # Truncate clean words
    words = q_clean.split()
    if len(words) <= 5:
        return " ".join(words).title()
    return " ".join(words[:4]).title() + "..."


# ── Intent and Smart Context Classifier ──────────────────────────────────────

def _is_casual_greeting(text: str) -> bool:
    cleaned = re.sub(r"[!?.👋😊🙏\s]+", "", text.lower())
    greetings = {"hey", "hello", "hi", "hiya", "yo", "hola", "namaste", "goodmorning", "goodafternoon", "goodevening", "howdy", "sup"}
    return cleaned in greetings


def _is_thanks_or_closure(text: str) -> bool:
    cleaned = re.sub(r"[!?.😊🙏\s]+", "", text.lower())
    thanks = {"thanks", "thankyou", "thx", "cheers", "bye", "goodbye", "seeya", "coolthanks", "awesomethanks"}
    return cleaned in thanks


def _is_general_trivia(text: str) -> bool:
    lower = text.lower()
    trivia_patterns = [
        r"who invented",
        r"what is the capital of",
        r"who was the first",
        r"how far is the moon",
        r"what is the speed of light",
        r"tell me a joke",
        r"solve this",
        r"write a poem",
        r"define [a-z]+",
        r"why is the sky blue",
    ]
    return any(re.search(p, lower) for p in trivia_patterns)


def _needs_trip_context(query: str, last_assistant_msg: str = "") -> bool:
    """
    Determines if answering the query requires the user's specific TripPilot trip context.
    Casual greetings and general trivia do NOT need trip context.
    """
    lower = query.lower()

    if _is_casual_greeting(query) or _is_thanks_or_closure(query) or _is_general_trivia(query):
        return False

    trip_keywords = [
        "my trip", "my budget", "my flight", "my hotel", "my booking", "my stay",
        "my dates", "my destination", "my itinerary", "remaining budget", "trip score",
        "trip health", "day 1", "day 2", "day 3", "day 4", "day 5", "day 6", "day 7",
        "how much budget", "how much money do i have", "am i over budget",
        "add to itinerary", "remove from itinerary", "optimize my day", "change destination",
        "start fresh", "how far is it from my hotel", "how far from my stay", "nearest to my hotel"
    ]
    if any(kw in lower for kw in trip_keywords):
        return True

    # Check if user is asking about the current destination
    return False


# ── Chat Execution ───────────────────────────────────────────────────────────

def chat(messages: list, context: dict) -> dict:
    """
    ChatGPT-style conversational AI with smart, silent TripPilot travel intelligence.
    Understands casual chat naturally without forcing trip context.
    Selectively accesses real TripPilot tools (flights, hotels, hidden places, itinerary actions).
    """
    if not messages:
        return {
            "source": "ai",
            "reply": "Hey! 👋 How can I help you?",
            "message": "Hey! 👋 How can I help you?",
            "suggestions": ["Find hidden places in Goa", "Search flights to Goa", "Check top beach hotels"],
            "actions": [],
        }

    latest_user_text = messages[-1].get("content", "").strip()
    latest_lower = latest_user_text.lower()

    # 1. Immediate natural responses for casual greetings & thanks (NO trip context dump!)
    if _is_casual_greeting(latest_user_text):
        return {
            "source": "ai",
            "reply": "Hey! 👋 How can I help you?",
            "message": "Hey! 👋 How can I help you?",
            "suggestions": ["Find hidden places in Goa", "Search flights from Hyderabad", "Recommend boutique stays"],
            "actions": [],
        }

    if _is_thanks_or_closure(latest_user_text):
        return {
            "source": "ai",
            "reply": "You're welcome! 😊 Let me know if you need anything else for your travels.",
            "message": "You're welcome! 😊 Let me know if you need anything else for your travels.",
            "suggestions": ["Plan an itinerary", "Top restaurants", "Budget tips"],
            "actions": [],
        }

    # 2. Check if query asks for hidden places
    destination_in_context = context.get("destination") or "Goa"
    hidden_place_match = re.search(r"hidden (?:places?|gems?|spots?|beaches?)(?: in ([a-zA-Z\s]+))?", latest_lower)
    target_destination = destination_in_context
    if hidden_place_match and hidden_place_match.group(1):
        target_destination = hidden_place_match.group(1).strip().title()

    tool_grounding = ""
    action_cards = []

    if hidden_place_match or "hidden places" in latest_lower or "hidden gems" in latest_lower or "offbeat" in latest_lower or "secret" in latest_lower:
        gems = search_hidden_places(target_destination, max_results=4)
        if gems:
            tool_grounding += f"\n\n[VERIFIED TRIPPILOT HIDDEN PLACES DATA FOR {target_destination.upper()}]:\n"
            for g in gems:
                tool_grounding += (
                    f"- Place: {g['name']}\n"
                    f"  Location/Region: {g['region']}\n"
                    f"  Category: {g['category']}\n"
                    f"  Why Worth Visiting: {g['why_worth_visiting']}\n"
                    f"  Why Less Touristy: {g['why_less_touristy']}\n"
                    f"  Best Time to Visit: {g['best_time_to_visit']}\n"
                    f"  How to Reach: {g['how_to_reach']}\n"
                    f"  Distance & Travel Time: {g['distance']} ({g['travel_time']})\n"
                    f"  Entry Fee & Parking: ₹{g['entry_fee']} entry | {g['parking']}\n"
                    f"  Activities: {', '.join(g['activities'])}\n"
                    f"  Food Options: {g['food_options']}\n"
                    f"  Safety Tips: {g['safety_tips']}\n"
                    f"  Crowd Level & Recommended Duration: {g['crowd_level']} | {g['recommended_duration']}\n"
                    f"  Estimated Cost: {g['approximate_cost']}\n"
                    f"  Suitability: Couples: {g['suitability_couples']} | Families: {g['suitability_families']}\n"
                )

    # 3. Check if query asks for real flight search
    flight_search_match = re.search(r"flights? (?:from ([a-zA-Z\s]+) )?to ([a-zA-Z\s]+)", latest_lower)
    if flight_search_match or "cheapest flight" in latest_lower or "find flight" in latest_lower:
        orig = context.get("origin") or "Hyderabad"
        dest = destination_in_context
        if flight_search_match:
            if flight_search_match.group(1):
                orig = flight_search_match.group(1).strip().title()
            if flight_search_match.group(2):
                dest = flight_search_match.group(2).strip().title()
        
        try:
            flights_data = search_flights(origin=orig, destination=dest, departure_date="2026-09-15", per_page=4)
            flights_list = flights_data.get("flights", [])
            if flights_list:
                tool_grounding += f"\n\n[VERIFIED TRIPPILOT FLIGHTS DATA ({orig} to {dest})]:\n"
                for f in flights_list[:3]:
                    tool_grounding += (
                        f"- {f.get('airline')} ({f.get('flight_number', 'Direct')}): "
                        f"Price ₹{f.get('price', 4500)}, Departure: {str(f.get('departure_time', '08:00'))}, "
                        f"Stops: {'Non-Stop' if f.get('stops') == 0 else '1 Stop'}, Baggage: {f.get('baggage_policy', 'Included')}\n"
                    )
        except Exception as e:
            logger.warning(f"Tool search_flights failed: {e}")

    # 4. Check if query asks for real hotel search
    if "hotel" in latest_lower or "stay" in latest_lower or "resort" in latest_lower:
        try:
            hotels_data = search_hotels(city=destination_in_context, per_page=3)
            hotels_list = hotels_data.get("hotels", [])
            if hotels_list:
                tool_grounding += f"\n\n[VERIFIED TRIPPILOT HOTELS DATA ({destination_in_context})]:\n"
                for h in hotels_list[:3]:
                    tool_grounding += (
                        f"- {h.get('name')}: Rating {h.get('rating', 4.5)}★, "
                        f"Price ₹{h.get('price_per_night', 4000)}/night, "
                        f"Amenities: {', '.join(h.get('amenities', []))}, "
                        f"Policy: {h.get('cancellation_policy', 'Free cancellation')}\n"
                    )
        except Exception as e:
            logger.warning(f"Tool search_hotels failed: {e}")

    # 5. Detect itinerary action (e.g. "add ... to day 3")
    add_match = re.search(r"add (?:this|the|)([a-zA-Z\s]+) to day (\d+)", latest_lower)
    if add_match:
        activity_name = add_match.group(1).strip().title()
        day_num = int(add_match.group(2))
        action_cards.append({
            "id": f"act-add-{day_num}-{activity_name.lower().replace(' ', '-')}",
            "actionType": "add_activity",
            "title": f"Add {activity_name} to Day {day_num}",
            "description": f"Ready to integrate {activity_name} into Day {day_num} of your {destination_in_context} itinerary.",
            "buttonLabel": f"Confirm & Add to Day {day_num}",
            "status": "pending",
            "payload": {
                "day": day_num,
                "activity": activity_name,
                "type": "sightseeing",
                "time": "10:30 AM",
            }
        })

    # 6. Build smart system prompt
    mode = context.get("travelExperienceMode") or context.get("travel_mode") or "standard"
    mode_info = ""
    if mode == "family":
        mode_info = "Traveler Mode: Family with Kids (prioritize child safety, shallow waters, relaxed pace, family dining)."
    elif mode == "accessibility":
        mode_info = "Traveler Mode: Accessibility Mode (prioritize step-free access, wheelchair accessible venues, elevators, barrier-free transit)."

    # Determine whether to expose trip context
    should_include_trip = _needs_trip_context(latest_user_text)
    trip_knowledge = ""
    if should_include_trip:
        trip_knowledge = f"""
[USER'S ACTIVE TRIPPILOT TRIP]:
- Destination: {context.get('destination', 'Goa')}
- Origin: {context.get('origin', 'Hyderabad')}
- Total Budget: {context.get('budget', '₹40,000')}
- Remaining Budget: {context.get('remainingBudget', '₹15,000')}
- Budget Status: {context.get('budgetStatus', 'On track')}
- Travellers: {context.get('travellers', 2)}
- Dates: {context.get('departureDate', '2026-09-15')} to {context.get('returnDate', '2026-09-20')}
- Selected Flight: {context.get('selectedFlight', 'Not yet selected')}
- Selected Hotel: {context.get('selectedHotel', 'Not yet selected')}
- Trip Score: {context.get('tripScore', '80')}/100
"""

    system_prompt = f"""You are TripPilot AI, an elite conversational AI travel intelligence co-pilot.
You combine the conversational brilliance and warmth of ChatGPT with TripPilot's deep real-world travel intelligence.

CORE RULES:
1. NATURAL CONVERSATION:
   - If the user says "hey" or asks casual questions, reply naturally, warmly, and concisely.
   - For general questions (e.g. "what is the capital of France?", "who invented the telephone?"), answer directly and accurately without mentioning any trip details.
   - NEVER force trip context (destination, budget, dates, score) into casual messages or unrelated trivia.
   - Only bring up the user's trip when they specifically ask about it, or when their question is directly related to planning/budgeting their trip.

2. DETAILED TRAVEL INTELLIGENCE:
   - When asked for hidden places, secret spots, or offbeat attractions, provide richly detailed, practical information for each place:
     • Place Name & Exact Location/Region
     • Why It's Worth Visiting & Why It's Less Touristy
     • Best Time to Visit & Crowd Level
     • How to Reach, Distance & Travel Time
     • Entry Fee & Parking Details
     • Key Activities & Nearby Highlights
     • Local Food Options & Safety Tips
     • Approximate Cost & Suitability (Couples vs Families)
   - NEVER hallucinate fake flight prices or fake hotel rates. Use the verified data provided below when available.

3. MULTI-TURN CONVERSATIONAL MEMORY:
   - Understand pronouns and follow-up questions ("Which one is best for sunset?", "How far is it?", "Add it to day 2").
   - Maintain continuity with previous messages in this conversation.

4. FORMATTING:
   - Format responses using clean Markdown with bolding, bullet points, numbered lists, and headers where helpful.
   - Avoid massive uninterrupted blocks of text.
{mode_info}
{trip_knowledge}
{tool_grounding}
"""

    # 7. Prepare conversation history for the LLM
    llm_messages = [{"role": "system", "content": system_prompt}]
    # Include up to the last 12 messages from the thread for context memory
    for m in messages[-12:]:
        llm_messages.append({
            "role": m.get("role", "user"),
            "content": m.get("content", ""),
        })

    result = _call_grok_conversation(llm_messages, json_mode=False)

    if result and result.get("text"):
        reply_text = result.get("text", "").strip()
        suggestions = ["Find hidden places in Goa", "Cheapest flights from Hyderabad", "Recommend luxury beach resorts"]
        if "hidden" in latest_lower:
            suggestions = ["Which one is best for sunset?", "How far is it from North Goa?", "Add to my itinerary"]
        elif "budget" in latest_lower:
            suggestions = ["How to save ₹5,000?", "Compare budget vs luxury stays", "Show free activities"]
        elif "flight" in latest_lower:
            suggestions = ["Compare morning vs evening flights", "Baggage policies", "Book flights"]

        return {
            "source": "ai",
            "reply": reply_text,
            "message": reply_text,
            "suggestions": suggestions,
            "actions": action_cards,
        }

    # 8. Graceful intelligent fallback if model API is unreachable
    if _is_general_trivia(latest_user_text):
        if "telephone" in latest_lower:
            reply_text = "Alexander Graham Bell is widely credited with inventing the first practical telephone, receiving the official patent in 1876."
        elif "france" in latest_lower and "capital" in latest_lower:
            reply_text = "The capital of France is Paris."
        else:
            reply_text = "I'm here to help with any general knowledge or travel questions! What else would you like to explore?"
    elif hidden_place_match or "hidden" in latest_lower:
        gems = search_hidden_places(target_destination, max_results=3)
        gem_descriptions = []
        for g in gems:
            gem_descriptions.append(
                f"### 📍 {g['name']} ({g['region']})\n"
                f"- **Why Visit:** {g['why_worth_visiting']}\n"
                f"- **Why Less Touristy:** {g['why_less_touristy']}\n"
                f"- **Best Time:** {g['best_time_to_visit']} (Crowd Level: {g['crowd_level']})\n"
                f"- **How to Reach:** {g['how_to_reach']} ({g['travel_time']})\n"
                f"- **Cost:** Entry: ₹{g['entry_fee']} | Approx. Cost: {g['approximate_cost']}\n"
                f"- **Insider Tip:** {g['food_options']} | {g['safety_tips']}"
            )
        reply_text = f"Here are verified hidden places in **{target_destination}**:\n\n" + "\n\n".join(gem_descriptions)
    elif should_include_trip:
        budget_val = context.get('budget', '₹40,000')
        remaining_val = context.get('remainingBudget', '₹15,000')
        dest_val = context.get('destination', 'Goa')
        reply_text = f"Your current trip to **{dest_val}** has a total budget of **{budget_val}** with approximately **{remaining_val}** remaining. You are on track! What would you like to optimize next?"
    else:
        reply_text = "I can help you plan your journey, discover secluded spots, compare flights, or answer any travel and general questions. What would you like to explore?"

    return {
        "source": "fallback",
        "reply": reply_text,
        "message": reply_text,
        "suggestions": ["Find hidden places in Goa", "Check flight options", "What's my trip budget?"],
        "actions": action_cards,
    }


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
