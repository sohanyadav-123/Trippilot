import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Luggage,
  Search,
  Compass,
  Sparkles,
  CalendarDays,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTripBuilder } from '../context/TripBuilderContext';
import { TripCard } from '../components/MyTrips/TripCard';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { EmptyState } from '../components/Common/EmptyState';
import { useTravelSettings } from '../context/TravelSettingsContext';

type TripTab = 'upcoming' | 'ongoing' | 'completed' | 'saved';

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const { setDestination, setOrigin, destination: currentDest } = useTripBuilder();
  const { t } = useTravelSettings();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TripTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const localRaw = localStorage.getItem('trippilot_user_bookings');
      const localBookings: Booking[] = localRaw ? JSON.parse(localRaw) : [];

      const res = await bookingService.listBookings();
      if (res.success && res.data && res.data.bookings && res.data.bookings.length > 0) {
        setBookings([...localBookings, ...res.data.bookings]);
      } else if (localBookings.length > 0) {
        setBookings(localBookings);
      } else {
        // Mock demo bookings across all tabs
        const mockBookings: Booking[] = [
          {
            id: 'bk-demo-1',
            booking_reference: 'TP-849201',
            selected_items: [
              {
                type: 'flight',
                id: 'fl-1',
                flight_data: {
                  id: 'fl-1',
                  airline: 'IndiGo',
                  flight_number: '6E-2041',
                  origin: 'Delhi',
                  destination: 'Goa',
                  departure_time: '2026-09-15T06:10:00',
                  arrival_time: '2026-09-15T08:45:00',
                  duration: 155,
                  stops: 0,
                  cabin_class: 'Economy',
                  price: 4199,
                  seats_available: 5,
                  baggage_policy: '7kg Cabin + 15kg Check-in',
                  cancellation_policy: 'Free Reschedule',
                },
              },
              {
                type: 'hotel',
                id: 'ht-1',
                hotel_data: {
                  id: 'ht-1',
                  name: 'Taj Exotica Resort & Spa',
                  city: 'Goa',
                  country: 'India',
                  address: 'Calwaddo, Benaulim, Goa 403716',
                  description: 'Mediterranean-style 5-star luxury resort set in 56 acres of lush gardens along Benaulim Beach.',
                  price_per_night: 8500,
                  rating: 4.9,
                  review_count: 1420,
                  amenities: ['Pool', 'Spa', 'Beachfront', 'Free Wi-Fi', 'Bar & Lounge'],
                  room_types: ['Garden Villa Room', 'Sea View Deluxe Suite'],
                  image_urls: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
                  available_rooms: 4,
                  cancellation_policy: 'Free cancellation up to 48 hours before check-in',
                },
              },
            ],
            traveller_details: [
              { title: 'Mr', first_name: user?.name?.split(' ')[0] || 'Sohan', last_name: user?.name?.split(' ')[1] || 'Yadav' },
            ],
            contact: { email: user?.email || 'sohan@example.com', phone: '9876543210', country_code: '+91' },
            total_amount: 12699,
            subtotal: 12000,
            taxes: 699,
            service_fee: 0,
            currency: 'INR',
            breakdown: [],
            payment_id: 'pay_mock_849201',
            status: 'confirmed',
            created_at: '2026-08-23T14:30:00Z',
            updated_at: '2026-08-23T14:30:00Z',
          },
        ];
        setBookings(mockBookings);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePlanAgain = (tripId: string) => {
    const trip = bookings.find((b) => b.id === tripId);
    if (trip) {
      const flightItem = trip.selected_items.find((i) => i.type === 'flight');
      if (flightItem?.flight_data?.destination) {
        setDestination(flightItem.flight_data.destination);
      }
      if (flightItem?.flight_data?.origin) {
        setOrigin(flightItem.flight_data.origin);
      }
    }
    navigate('/plan');
  };

  const handleContinuePlanning = () => {
    navigate('/plan');
  };

  // Demo ongoing trip
  const ongoingTrips = [
    {
      id: 'trip-ongoing-1',
      reference: 'TP-ONGOING-01',
      title: 'Monsoon Beach Vacation',
      destination: 'Goa',
      origin: 'Mumbai',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      status: 'ongoing' as const,
      totalAmount: 28400,
      tripHealthScore: 96,
      dayProgress: { current: 1, total: 5 },
      items: [
        { type: 'flight' as const, title: 'IndiGo 6E-512', subtitle: 'Mumbai → Goa' },
        { type: 'hotel' as const, title: 'W Goa Beach Resort', subtitle: 'Vagator Beach' },
        { type: 'activity' as const, title: 'Scuba Diving at Grande Island', subtitle: 'Tomorrow morning' },
      ],
    },
  ];

  // Demo completed trips
  const completedTrips = [
    {
      id: 'trip-comp-1',
      reference: 'TP-772910',
      title: 'Summer Mountain Escape',
      destination: 'Manali & Solang Valley',
      origin: 'Delhi',
      startDate: '2026-06-10',
      endDate: '2026-06-15',
      status: 'completed' as const,
      totalAmount: 34200,
      tripHealthScore: 98,
      items: [
        { type: 'transport' as const, title: 'Volvo AC Express', subtitle: 'Delhi → Manali' },
        { type: 'hotel' as const, title: 'The Himalayan Luxury Resort', subtitle: 'Log Huts Area' },
        { type: 'activity' as const, title: 'Solang Valley Paragliding', subtitle: 'High altitude tour' },
      ],
    },
  ];

  // Demo saved draft trips
  const savedTrips = [
    {
      id: 'trip-saved-1',
      reference: 'TP-DRAFT-99',
      title: 'Heritage & Palaces Exploration',
      destination: 'Jaipur & Udaipur',
      origin: 'Bengaluru',
      status: 'saved' as const,
      totalAmount: 42000,
      tripHealthScore: 88,
      items: [
        { type: 'flight' as const, title: 'Air India AI-802', subtitle: 'BLR → JAI' },
        { type: 'hotel' as const, title: 'Taj Lake Palace', subtitle: 'Lake Pichola' },
      ],
    },
  ];

  const getFilteredItems = () => {
    let list: any[] = [];
    if (activeTab === 'upcoming') {
      list = bookings.map((b) => {
        const fl = b.selected_items.find((i) => i.type === 'flight')?.flight_data;
        const ht = b.selected_items.find((i) => i.type === 'hotel')?.hotel_data;
        return {
          id: b.id,
          reference: b.booking_reference,
          title: `${fl?.destination || ht?.city || 'Goa'} Trip`,
          destination: fl?.destination || ht?.city || 'Goa',
          origin: fl?.origin || 'Delhi',
          startDate: fl?.departure_time?.slice(0, 10) || '2026-09-15',
          status: 'upcoming' as const,
          totalAmount: b.total_amount,
          tripHealthScore: 95,
          items: b.selected_items.map((item) => ({
            type: item.type as any,
            title: item.type === 'flight' ? `${item.flight_data?.airline} ${item.flight_data?.flight_number}` : item.hotel_data?.name || 'Stay',
            subtitle: item.type === 'flight' ? `${item.flight_data?.origin} → ${item.flight_data?.destination}` : item.hotel_data?.city,
          })),
        };
      });
    } else if (activeTab === 'ongoing') {
      list = ongoingTrips;
    } else if (activeTab === 'completed') {
      list = completedTrips;
    } else if (activeTab === 'saved') {
      list = savedTrips;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.reference && t.reference.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const displayedTrips = getFilteredItems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Luggage className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t('trips.title', 'My Trips & Journeys')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('trips.subtitle', 'Manage upcoming confirmed bookings, ongoing itineraries, past memories, and saved blueprints')}
            </p>
          </div>
        </div>

        <Link
          to="/plan"
          className="btn-primary text-xs !py-2.5 px-4 font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('trips.plan_new', 'Plan New Trip')}</span>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'upcoming', label: t('trips.tab_upcoming', 'Upcoming Trips') },
            { id: 'ongoing', label: t('trips.tab_ongoing', '● Ongoing (Live)') },
            { id: 'completed', label: t('trips.tab_completed', 'Completed') },
            { id: 'saved', label: t('trips.tab_saved', 'Saved Drafts') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TripTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search by Destination */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('trips.search_placeholder', 'Search by destination or ref...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-8 py-2"
          />
        </div>
      </div>

      {/* Trip Cards List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : displayedTrips.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} trips found`}
          description={
            searchQuery
              ? 'No trips matched your search filter. Try searching for a different destination.'
              : 'You do not have any trips in this tab yet.'
          }
          actionLabel="Build a New Trip"
          onAction={() => navigate('/plan')}
        />
      ) : (
        <div className="space-y-4">
          {displayedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              {...trip}
              onPlanAgain={handlePlanAgain}
              onContinuePlanning={handleContinuePlanning}
            />
          ))}
        </div>
      )}
    </div>
  );
};

