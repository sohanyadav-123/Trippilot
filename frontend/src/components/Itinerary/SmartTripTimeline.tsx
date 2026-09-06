import React from 'react';
import { Plane, Building2, Car, Compass, Utensils, Clock, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

export const SmartTripTimeline: React.FC = () => {
  const {
    origin,
    destination,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    selectedRestaurants,
    customItinerary,
  } = useTripBuilder();

  // Construct unified chronological timeline items
  const timelineEvents = [
    ...(selectedTravel
      ? [
          {
            id: 'time-flight-dep',
            time: selectedTravel.departureTime || '09:15 AM',
            title: `Departure: ${selectedTravel.operator} (${selectedTravel.identifier || 'Flight'})`,
            category: 'travel',
            status: 'Upcoming',
            location: origin,
            cost: selectedTravel.price,
            icon: Plane,
          },
        ]
      : []),
    ...(selectedMobility
      ? [
          {
            id: 'time-mob-pickup',
            time: '11:00 AM',
            title: `Pickup: ${selectedMobility.title} (${selectedMobility.vehicleModel})`,
            category: 'transport',
            status: 'Upcoming',
            location: `${destination} Terminal`,
            cost: selectedMobility.price,
            icon: Car,
          },
        ]
      : []),
    ...(selectedStay
      ? [
          {
            id: 'time-stay-checkin',
            time: '02:00 PM',
            title: `Check-in: ${selectedStay.name} (${selectedStay.selectedRoomName || selectedStay.type})`,
            category: 'stay',
            status: 'Upcoming',
            location: selectedStay.address,
            cost: selectedStay.price_per_night,
            icon: Building2,
          },
        ]
      : []),
    ...customItinerary.map((ev) => ({
      id: `time-itin-${ev.id}`,
      time: ev.time || '04:00 PM',
      title: `${ev.title} (Day ${ev.day})`,
      category: ev.type,
      status: 'Upcoming',
      location: ev.location || destination,
      cost: ev.cost || 0,
      icon: ev.type === 'dining' ? Utensils : ev.type === 'stay' ? Building2 : Compass,
    })),
    ...selectedRestaurants.map((r) => ({
      id: `time-res-${r.id}`,
      time: '08:30 PM',
      title: `Dinner Reservation: ${r.name}`,
      category: 'dining',
      status: 'Upcoming',
      location: r.location,
      cost: r.cost,
      icon: Utensils,
    })),
  ];

  return (
    <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-[#0B1220] flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Unified Smart Trip Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized itinerary merging flights, transfers, accommodations, daily stops & dining.
          </p>
        </div>

        <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
          {timelineEvents.length} Scheduled Stops
        </span>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No items scheduled in the timeline yet. Select a flight, hotel, or activity to populate.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
          {timelineEvents.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#0B1220] flex items-center justify-center shadow-xs">
                  <Icon className="w-3 h-3 text-[#0B1220]" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 group-hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {item.time}
                      </span>
                      <span className="text-[9.5px] font-extrabold uppercase bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {item.cost > 0 && (
                    <div className="text-right">
                      <CurrencyDisplay amount={item.cost} className="font-black text-sm text-slate-900 block" />
                      <span className="text-[9.5px] text-slate-400">allocated cost</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
