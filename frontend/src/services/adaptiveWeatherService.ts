import {
  WeatherDayForecast,
  ItineraryConflict,
  TravelGroupType,
  AlternativeActivitySuggestion,
  PlanBScenario,
} from '../types/adaptiveWeather';
import { ItineraryEvent } from '../context/TripBuilderContext';

export const adaptiveWeatherService = {
  getDestinationForecast(destination: string, departureDate: string, daysCount = 5): WeatherDayForecast[] {
    const baseDate = new Date(departureDate || '2026-09-15');

    // Realistic meteorological & marine tidal model
    const mockForecasts: WeatherDayForecast[] = [
      {
        dayNumber: 1,
        date: new Date(baseDate.getTime() + 0 * 86400000).toISOString().split('T')[0],
        dayLabel: 'Day 1',
        tempC: 30,
        tempMinC: 24,
        condition: 'Sunny',
        rainProbability: 10,
        windSpeedKmh: 12,
        uvIndex: 7,
        tide: {
          highTideTime: '11:15 AM',
          lowTideTime: '05:30 PM',
          seaCondition: 'Calm',
          waveHeightMeters: 0.6,
        },
        officialSource: 'IMD Coastal Meteorological Division',
        alertLevel: 'none',
      },
      {
        dayNumber: 2,
        date: new Date(baseDate.getTime() + 1 * 86400000).toISOString().split('T')[0],
        dayLabel: 'Day 2',
        tempC: 27,
        tempMinC: 23,
        condition: 'Light Rain',
        rainProbability: 65,
        rainTimeWindow: '01:30 PM - 04:30 PM',
        windSpeedKmh: 24,
        uvIndex: 4,
        tide: {
          highTideTime: '12:45 PM',
          lowTideTime: '06:40 PM',
          seaCondition: 'Moderate',
          waveHeightMeters: 1.2,
        },
        officialSource: 'IMD Coastal Meteorological Division',
        alertLevel: 'advisory',
      },
      {
        dayNumber: 3,
        date: new Date(baseDate.getTime() + 2 * 86400000).toISOString().split('T')[0],
        dayLabel: 'Day 3',
        tempC: 29,
        tempMinC: 24,
        condition: 'Partly Cloudy',
        rainProbability: 20,
        windSpeedKmh: 15,
        uvIndex: 6,
        tide: {
          highTideTime: '02:10 PM',
          lowTideTime: '08:00 AM',
          seaCondition: 'Calm',
          waveHeightMeters: 0.8,
        },
        officialSource: 'IMD Coastal Meteorological Division',
        alertLevel: 'none',
      },
      {
        dayNumber: 4,
        date: new Date(baseDate.getTime() + 3 * 86400000).toISOString().split('T')[0],
        dayLabel: 'Day 4',
        tempC: 26,
        tempMinC: 22,
        condition: 'Heavy Rain',
        rainProbability: 85,
        rainTimeWindow: '02:00 PM - 06:30 PM',
        windSpeedKmh: 38,
        uvIndex: 3,
        tide: {
          highTideTime: '04:20 PM',
          lowTideTime: '10:15 AM',
          seaCondition: 'Rough',
          waveHeightMeters: 2.4,
        },
        officialSource: 'National Maritime Safety & Marine Weather Cell',
        alertLevel: 'warning',
      },
      {
        dayNumber: 5,
        date: new Date(baseDate.getTime() + 4 * 86400000).toISOString().split('T')[0],
        dayLabel: 'Day 5',
        tempC: 30,
        tempMinC: 25,
        condition: 'Sunny',
        rainProbability: 15,
        windSpeedKmh: 14,
        uvIndex: 8,
        tide: {
          highTideTime: '05:40 PM',
          lowTideTime: '11:30 AM',
          seaCondition: 'Calm',
          waveHeightMeters: 0.7,
        },
        officialSource: 'IMD Coastal Meteorological Division',
        alertLevel: 'none',
      },
    ];

    return mockForecasts.slice(0, daysCount);
  },

  detectItineraryConflicts(
    events: ItineraryEvent[],
    destination: string,
    departureDate: string,
    groupType: TravelGroupType = 'couple',
    travellers = 2
  ): ItineraryConflict[] {
    const forecasts = this.getDestinationForecast(destination, departureDate);
    const conflicts: ItineraryConflict[] = [];

    events.forEach((ev) => {
      const dayForecast = forecasts.find((f) => f.dayNumber === ev.day);
      if (!dayForecast) return;

      const titleLower = ev.title.toLowerCase();
      const isBeach = titleLower.includes('beach') || titleLower.includes('shore') || titleLower.includes('coast');
      const isWaterSport = titleLower.includes('scuba') || titleLower.includes('watersport') || titleLower.includes('jet ski') || titleLower.includes('diving');
      const isCruise = titleLower.includes('cruise') || titleLower.includes('boat') || titleLower.includes('dolphin');
      const isTrek = titleLower.includes('trek') || titleLower.includes('paragliding') || titleLower.includes('safari');

      // Conflict 1: Heavy rain / Rough sea on Day 4 for Beach or Outdoor cruise
      if (dayForecast.dayNumber === 4 && (isBeach || isCruise || isWaterSport || isTrek)) {
        const alt = this.getGroupAwareAlternative(groupType, destination, 'rain_shelter', travellers);

        conflicts.push({
          id: `conflict-day-4-${ev.id}`,
          eventId: ev.id,
          dayNumber: 4,
          eventTitle: ev.title,
          eventType: ev.type,
          originalTime: ev.time,
          conflictType: 'rain',
          severity: 'warning',
          impactExplanation: `Heavy rainfall (85% probability) and wind gusts up to 38 km/h are expected between 2:00 PM and 6:30 PM. High tide peaks at 4:20 PM with rough sea conditions (${dayForecast.tide?.waveHeightMeters}m waves).`,
          suggestedTimeShift: {
            newTime: '10:00 AM',
            reason: 'Shift beach excursion to morning when conditions are clear (20% rain probability, low tide at 10:15 AM).',
          },
          suggestedAlternative: alt,
          costDifference: (alt.cost - (ev.cost || 0)),
        });
      }

      // Conflict 2: Light Rain / High Sea on Day 2 for Scuba Diving or Water sports
      if (dayForecast.dayNumber === 2 && (isWaterSport || isCruise)) {
        const alt = this.getGroupAwareAlternative(groupType, destination, 'cultural_indoor', travellers);

        conflicts.push({
          id: `conflict-day-2-${ev.id}`,
          eventId: ev.id,
          dayNumber: 2,
          eventTitle: ev.title,
          eventType: ev.type,
          originalTime: ev.time,
          conflictType: 'rough_sea',
          severity: 'advisory',
          impactExplanation: `Moderate sea swells and intermittent afternoon showers (65% probability) expected between 1:30 PM and 4:30 PM.`,
          suggestedTimeShift: {
            newTime: '09:30 AM',
            reason: 'Morning visibility and calm waters provide optimal diving conditions before afternoon rainfall.',
          },
          suggestedAlternative: alt,
          costDifference: (alt.cost - (ev.cost || 0)),
        });
      }
    });

    return conflicts;
  },

  getGroupAwareAlternative(
    groupType: TravelGroupType,
    destination: string,
    context: 'rain_shelter' | 'cultural_indoor',
    travellers = 2
  ): AlternativeActivitySuggestion {
    // 1. Family / Family with Kids
    if (groupType === 'family' || groupType === 'family_kids') {
      return {
        id: 'alt-museum-goa',
        name: 'Museum of Goa & Artisanal Chocolate Atelier Workshop',
        category: 'Indoor Cultural & Interactive Family Experience',
        duration: '3.5 Hours',
        cost: 650 * travellers,
        priceDifference: -1500,
        description: 'Interactive contemporary Goan art museum followed by bean-to-bar artisan chocolate crafting workshop suitable for all ages.',
        reason: 'Recommended for families: 100% sheltered indoor experience with engaging kid-friendly art and culinary activities.',
        suitableGroupTypes: ['family', 'family_kids', 'group'],
        location: 'Pilerne Industrial Estate, Goa',
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      };
    }

    // 2. Friends / Students
    if (groupType === 'friends' || groupType === 'students') {
      return {
        id: 'alt-gaming-brewery',
        name: 'Craft Brewery Tasting & Indoor Arcade Bowling Lounge',
        category: 'Indoor Social Entertainment & Dining',
        duration: '4 Hours',
        cost: 950 * travellers,
        priceDifference: -1200,
        description: 'Guided coastal craft beer tasting flight with wood-fired sourdough pizzas, indoor bowling, and retro arcade games.',
        reason: 'Recommended for friends: Dynamic social indoor entertainment with games, craft beverages, and lively music.',
        suitableGroupTypes: ['friends', 'group', 'students'],
        location: 'Candolim Coastal Hub, Goa',
        image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80',
      };
    }

    // 3. Couple / Solo (Default)
    return {
      id: 'alt-ayurveda-spa',
      name: 'Couples Ayurvedic Rejuvenation Spa & Oceanfront Covered Lounge',
      category: 'Luxury Wellness & Relaxed Covered Dining',
      duration: '3 Hours',
      cost: 1800 * travellers,
      priceDifference: -800,
      description: 'Synchronized Ayurvedic warm herbal oil massage followed by steam therapy and gourmet high tea at oceanfront sheltered cabana.',
      reason: 'Recommended for couples: Peaceful romantic wellness escape sheltered from inclement weather with panoramic sea views.',
      suitableGroupTypes: ['couple', 'solo'],
      location: 'Candolim Beach Road, Goa',
      image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    };
  },

  getPlanBScenario(
    dayNumber: number,
    destination: string,
    departureDate: string,
    groupType: TravelGroupType = 'couple',
    travellers = 2
  ): PlanBScenario {
    if (groupType === 'family' || groupType === 'family_kids') {
      return {
        dayNumber,
        title: `Plan B (Weather-Adapted Family Itinerary)`,
        rationale: `Re-sequenced to enjoy the beach during morning calm and visit sheltered interactive attractions during the 2 PM–6 PM rain window.`,
        groupType,
        events: [
          {
            time: '10:00 AM',
            title: `Morning Palolem Beach Stroll & Shell Gathering`,
            type: 'activity',
            description: `Calm morning low-tide conditions ideal for gentle beach walks before rains.`,
            cost: 0,
            location: `${destination} Coast`,
          },
          {
            time: '01:00 PM',
            title: `Seafood & Goan Thali Lunch at Covered Veranda`,
            type: 'dining',
            description: `Authentic family lunch at rain-sheltered heritage veranda.`,
            cost: 800 * travellers,
            location: 'Assagao Village',
          },
          {
            time: '03:00 PM',
            title: `Museum of Goa & Artisanal Chocolate Workshop`,
            type: 'activity',
            description: `Indoor creative art galleries and interactive chocolate crafting.`,
            cost: 650 * travellers,
            location: 'Pilerne Estate',
          },
          {
            time: '07:30 PM',
            title: `Boutique Indoor Spice Market Souvenir Shopping`,
            type: 'custom',
            description: `Sheltered market visit for organic spices and local artisanal handicrafts.`,
            cost: 0,
            location: 'Panjim Central',
          },
        ],
      };
    }

    if (groupType === 'friends' || groupType === 'students') {
      return {
        dayNumber,
        title: `Plan B (Weather-Adapted Friends Itinerary)`,
        rationale: `Morning beach adventure combined with lively afternoon indoor arcade games and craft brewery tasting during heavy showers.`,
        groupType,
        events: [
          {
            time: '09:30 AM',
            title: `Morning High-Speed Speedboat Cruise`,
            type: 'activity',
            description: `Clear morning sea window before afternoon swell increases.`,
            cost: 1200 * travellers,
            location: `Baga Beach`,
          },
          {
            time: '01:30 PM',
            title: `Craft Brewery Tasting & Wood-Fired Pizza Lunch`,
            type: 'dining',
            description: `Indoor brewery flight tasting and gourmet pizzas.`,
            cost: 950 * travellers,
            location: `Candolim`,
          },
          {
            time: '04:00 PM',
            title: `Indoor Bowling & Retro Arcade Gaming Challenge`,
            type: 'activity',
            description: `High-energy indoor bowling and air hockey tournament.`,
            cost: 450 * travellers,
            location: `North Goa Entertainment Hub`,
          },
          {
            time: '08:00 PM',
            title: `Live Acoustic Night at Sheltered Cliff Lounge`,
            type: 'dining',
            description: `Ocean-facing sheltered lounge with live acoustic indie performances.`,
            cost: 800 * travellers,
            location: `Vagator Cliff`,
          },
        ],
      };
    }

    // Default: Couple / Solo
    return {
      dayNumber,
      title: `Plan B (Weather-Adapted Couple Itinerary)`,
      rationale: `Morning scenic coastal walk followed by an afternoon of luxury Ayurvedic spa rejuvenation and candlelight covered dining.`,
      groupType,
      events: [
        {
          time: '10:00 AM',
          title: `Morning Coastal Cliff Walk & Café Breakfast`,
          type: 'activity',
          description: `Breezy morning viewpoint before afternoon cloud buildup.`,
          cost: 400 * travellers,
          location: `Vagator Hilltop`,
        },
        {
          time: '02:00 PM',
          title: `Couples Ayurvedic Rejuvenation Massage & Steam`,
          type: 'activity',
          description: `Luxury full-body warm herbal oil massage sheltered from heavy rain.`,
          cost: 1800 * travellers,
          location: `Ayurveda Wellness Pavilion`,
        },
        {
          time: '05:30 PM',
          title: `High Tea & Latin Quarter Art Gallery Tour`,
          type: 'custom',
          description: `Restored Portuguese heritage manor visit with freshly brewed coffee.`,
          cost: 350 * travellers,
          location: `Fontainhas Latin Quarter`,
        },
        {
          time: '08:00 PM',
          title: `Candlelight Covered Veranda Ocean Dinner`,
          type: 'dining',
          description: `Rain-sheltered romantic coastal dinner with live jazz.`,
          cost: 1200 * travellers,
          location: `Calangute Beachfront`,
        },
      ],
    };
  },
};
