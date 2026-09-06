import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plane,
  Building2,
  ShieldCheck,
  Tag,
  ArrowRight,
  User,
  Mail,
  Phone,
  Check,
  AlertCircle,
  Plus,
  Luggage,
  Coffee,
  Car,
  Armchair,
  Edit3,
  Calendar,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useTravellers } from '../context/TravellersContext';
import { useTripBuilder } from '../context/TripBuilderContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { EmptyState } from '../components/Common/EmptyState';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const Cart: React.FC = () => {
  const { t, tPlace } = useTravelSettings();
  const { items, removeItem, totalAmount, toSelectedItems } = useCart();
  const { user } = useAuth();
  const { travellers: savedTravellers } = useTravellers();
  const { budget, destination, origin } = useTripBuilder();
  const navigate = useNavigate();

  // Active Checkout Sub-step
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'travellers' | 'addons' | 'review'>('selection');

  // Pricing breakdown
  const [subtotal, setSubtotal] = useState(totalAmount);
  const [taxes, setTaxes] = useState(Math.round(totalAmount * 0.05));
  const [serviceFee, setServiceFee] = useState(250);
  const [discount, setDiscount] = useState(0);

  // Optional Add-ons (Non-forced, customizable)
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [transferSelected, setTransferSelected] = useState(false);
  const [extraBaggageSelected, setExtraBaggageSelected] = useState(false);
  const [seatSelected, setSeatSelected] = useState(false);
  const [mealSelected, setMealSelected] = useState(false);

  const insuranceCost = insuranceSelected ? 499 : 0;
  const transferCost = transferSelected ? 899 : 0;
  const baggageCost = extraBaggageSelected ? 650 : 0;
  const seatCost = seatSelected ? 350 : 0;
  const mealCost = mealSelected ? 450 : 0;

  const totalAddonsCost = insuranceCost + transferCost + baggageCost + seatCost + mealCost;

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Contact details
  const [contactEmail, setContactEmail] = useState(user?.email || 'sohan.yadav@example.com');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 9876543210');

  // Primary Traveller details
  const [travellers, setTravellers] = useState([
    {
      title: 'Mr',
      first_name: user?.name ? user.name.split(' ')[0] : 'Sohan',
      last_name: user?.name ? user.name.split(' ')[1] || 'Yadav' : 'Yadav',
      dob: '1995-05-15',
      gender: 'male',
      nationality: 'Indian',
    },
  ]);

  useEffect(() => {
    setSubtotal(totalAmount);
    setTaxes(Math.round(totalAmount * 0.05));
  }, [totalAmount]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();

    if (code === 'TRIP2026') {
      const disc = Math.min(2500, Math.round(subtotal * 0.15));
      setDiscount(disc);
      setAppliedPromo('TRIP2026 (15% Savings Applied)');
    } else if (code === 'STAYLUXE') {
      const disc = 2000;
      setDiscount(disc);
      setAppliedPromo('STAYLUXE (₹2,000 Off Applied)');
    } else {
      setPromoError('Invalid promo code. Try TRIP2026');
      setDiscount(0);
      setAppliedPromo(null);
    }
  };

  const finalTotal = Math.max(0, subtotal + taxes + serviceFee + totalAddonsCost - discount);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactPhone) {
      alert('Please provide valid contact information for e-ticket delivery.');
      return;
    }

    const selectedAddonsList = [];
    if (insuranceSelected) selectedAddonsList.push({ name: 'Comprehensive Travel Insurance', price: 499, demo: true });
    if (transferSelected) selectedAddonsList.push({ name: 'Private Airport Transfer', price: 899, demo: true });
    if (extraBaggageSelected) selectedAddonsList.push({ name: '10kg Extra Check-in Baggage', price: 650, demo: true });
    if (seatSelected) selectedAddonsList.push({ name: 'Preferred Window/Aisle Seat', price: 350, demo: true });
    if (mealSelected) selectedAddonsList.push({ name: 'Chef Special In-Flight Meal', price: 450, demo: true });

    const checkoutData = {
      selected_items: toSelectedItems(),
      traveller_details: travellers,
      addons: selectedAddonsList,
      contact: {
        email: contactEmail,
        phone: contactPhone,
        country_code: '+91',
      },
      total_amount: finalTotal,
      subtotal,
      taxes,
      service_fee: serviceFee,
      addons_total: totalAddonsCost,
      discount,
      currency: 'INR',
      destination: destination || 'Goa',
      origin: origin || 'Delhi',
      is_demo: true,
    };

    localStorage.setItem('trippilot_pending_checkout', JSON.stringify(checkoutData));
    navigate('/payment');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          title={t('cart.empty_title', 'Your trip cart is empty')}
          description={t('cart.empty_desc', 'Add flights, stays, or curated holiday blueprints to begin checkout.')}
          actionLabel={t('cart.browse_cta', 'Browse Flights & Hotels')}
          onAction={() => navigate('/flights')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="surface-card p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {[
            { id: 'selection', step: '1', title: t('cart.step1', '1. Review Items') },
            { id: 'travellers', step: '2', title: t('cart.step2', '2. Travellers') },
            { id: 'addons', step: '3', title: t('cart.step3', '3. Add-ons') },
            { id: 'review', step: '4', title: t('cart.step4', '4. Final Review') },
          ].map((s, idx) => {
            const isActive = checkoutStep === s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => setCheckoutStep(s.id as any)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all ${
                    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {s.step}
                  </div>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
                {idx < 3 && <div className="flex-1 h-px bg-slate-200 mx-2 sm:mx-3" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Step Contents */}
        <div className="lg:col-span-8 space-y-6">
          {/* ─── STEP 1: SELECTION REVIEW & EDITING ─── */}
          {checkoutStep === 'selection' && (
            <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5 bg-white shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" /> {t('cart.step1_title', { count: items.length }, `Step 1: Selected Travel Items (${items.length})`)}
                </h2>
                <Link to="/flights" className="text-xs font-bold text-blue-600 hover:underline">
                  {t('cart.add_more', '+ Add More Items')}
                </Link>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => {
                  const title =
                    item.type === 'flight'
                      ? `${tPlace(item.item.airline)} (${tPlace(item.item.origin)} → ${tPlace(item.item.destination)})`
                      : item.item.name;

                  const subtitle =
                    item.type === 'flight'
                      ? `${t('step.travel.flight', 'Flight')} ${item.item.flight_number} • ${item.item.cabin_class || 'Economy'} • ${item.passengers} ${t('builder.traveller_label', 'Passenger(s)')}`
                      : `${tPlace(item.item.city)} • ${item.nights} ${t('builder.nights', 'Night(s)')}, ${item.rooms} ${t('search.guests_rooms', 'Room(s)')}`;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
                          {item.type === 'flight' ? <Plane className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                              {item.type}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900">{title}</h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <CurrencyDisplay amount={item.subtotal} className="text-base font-black text-slate-900" />
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={item.type === 'flight' ? '/flights' : '/hotels'}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Change Selection"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove from Cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('travellers')}
                  className="btn-primary text-xs !py-2.5 px-6 font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>{t('cart.continue_travellers', 'Continue to Traveller Details')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: TRAVELLER DETAILS & CONTACT ─── */}
          {checkoutStep === 'travellers' && (
            <div className="space-y-6 animate-fade-in">
              {/* Primary Traveller Information */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" /> {t('cart.step2_title', 'Step 2: Primary Traveller Information')}
                  </h2>

                  {/* Saved Traveller Quick Selector */}
                  {savedTravellers.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 font-semibold">{t('cart.autofill', 'Autofill:')}</span>
                      <select
                        onChange={(e) => {
                          const found = savedTravellers.find((tItem) => tItem.id === e.target.value);
                          if (found) {
                            setTravellers([
                              {
                                title: found.gender === 'female' ? 'Ms' : 'Mr',
                                first_name: found.firstName,
                                last_name: found.lastName,
                                dob: found.dob || '1995-05-15',
                                gender: found.gender,
                                nationality: found.nationality || 'Indian',
                              },
                            ]);
                          }
                        }}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="">{t('cart.choose_saved', 'Choose Saved Profile')}</option>
                        {savedTravellers.map((tItem) => (
                          <option key={tItem.id} value={tItem.id}>
                            {tItem.firstName} {tItem.lastName} {tItem.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t('checkout.title_label', 'Title')}</label>
                    <select
                      value={travellers[0].title}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[0].title = e.target.value;
                        setTravellers(updated);
                      }}
                      className="input-field text-xs py-2"
                    >
                      <option value="Mr">Mr.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Dr">Dr.</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t('checkout.first_name', 'First Name')}</label>
                    <input
                      type="text"
                      required
                      value={travellers[0].first_name}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[0].first_name = e.target.value;
                        setTravellers(updated);
                      }}
                      className="input-field text-xs py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t('checkout.last_name', 'Last Name')}</label>
                    <input
                      type="text"
                      required
                      value={travellers[0].last_name}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[0].last_name = e.target.value;
                        setTravellers(updated);
                      }}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Mail className="w-4 h-4 text-blue-600" /> {t('cart.delivery_title', 'Booking Contact & E-Ticket Delivery')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t('checkout.email', 'Email Address')}</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="input-field text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t('checkout.phone', 'Mobile Phone')}</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('selection')}
                  className="btn-secondary text-xs !py-2 px-4 font-bold"
                >
                  {t('cart.back_items', 'Back to Items')}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('addons')}
                  className="btn-primary text-xs !py-2.5 px-6 font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>{t('cart.continue_addons', 'Continue to Optional Add-ons')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: OPTIONAL ADD-ONS (TRANSPARENT & NON-FORCED) ─── */}
          {checkoutStep === 'addons' && (
            <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5 bg-white shadow-sm animate-fade-in">
              <div className="pb-3 border-b border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase mb-1">
                  <Sparkles className="w-3 h-3" /> {t('cart.extras_badge', 'Optional Traveler Extras')}
                </div>
                <h2 className="text-base font-black text-slate-900">{t('cart.step3_title', 'Step 3: Select Optional Add-ons')}</h2>
                <p className="text-xs text-slate-500">
                  {t('cart.step3_desc', 'Customise your trip with optional perks. All extra add-ons are completely optional.')}
                </p>
              </div>

              <div className="space-y-3">
                {/* Insurance */}
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={insuranceSelected}
                      onChange={() => setInsuranceSelected(!insuranceSelected)}
                      className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t('cart.insurance_title', 'Comprehensive Travel Insurance (₹499)')}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {t('checkout.simulated_badge', 'DEMO ADD-ON')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {t('cart.insurance_desc', 'Emergency medical cover, flight delay protection, and baggage loss warranty')}
                      </span>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </label>

                {/* Airport Transfer */}
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={transferSelected}
                      onChange={() => setTransferSelected(!transferSelected)}
                      className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t('cart.transfer_title', 'Private Airport AC Sedan Transfer (₹899)')}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {t('checkout.simulated_badge', 'DEMO ADD-ON')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {t('cart.transfer_desc', 'Chauffeur meet & greet at arrivals with zero surge guarantee')}
                      </span>
                    </div>
                  </div>
                  <Car className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </label>

                {/* Extra Baggage */}
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={extraBaggageSelected}
                      onChange={() => setExtraBaggageSelected(!extraBaggageSelected)}
                      className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t('cart.baggage_title', 'Extra Check-in Baggage +10kg (₹650)')}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {t('checkout.simulated_badge', 'DEMO ADD-ON')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {t('cart.baggage_desc', 'Pre-booked excess weight discount vs. standard airport counter rates')}
                      </span>
                    </div>
                  </div>
                  <Luggage className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                </label>

                {/* Seat Selection */}
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={seatSelected}
                      onChange={() => setSeatSelected(!seatSelected)}
                      className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t('cart.seat_title', 'Preferred Seat Allocation (₹350)')}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {t('checkout.simulated_badge', 'DEMO ADD-ON')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {t('cart.seat_desc', 'Guaranteed front row or extra legroom window seat')}
                      </span>
                    </div>
                  </div>
                  <Armchair className="w-5 h-5 text-purple-600 flex-shrink-0" />
                </label>

                {/* Meal Selection */}
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={mealSelected}
                      onChange={() => setMealSelected(!mealSelected)}
                      className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t('cart.meal_title', 'Chef Hot In-Flight Meal Combo (₹450)')}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {t('checkout.simulated_badge', 'DEMO ADD-ON')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {t('cart.meal_desc', 'Warm pre-packaged gourmet meal with refreshing cold beverage')}
                      </span>
                    </div>
                  </div>
                  <Coffee className="w-5 h-5 text-amber-600 flex-shrink-0" />
                </label>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('travellers')}
                  className="btn-secondary text-xs !py-2 px-4 font-bold"
                >
                  {t('cart.back_travellers', 'Back to Travellers')}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('review')}
                  className="btn-primary text-xs !py-2.5 px-6 font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>{t('cart.continue_review', 'Continue to Final Review')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: FINAL REVIEW & PRE-PAYMENT SUMMARY ─── */}
          {checkoutStep === 'review' && (
            <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm animate-fade-in">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">{t('cart.step4_title', 'Step 4: Final Booking & Fare Review')}</h2>
                  <p className="text-xs text-slate-500">
                    {t('cart.step4_desc', 'Verify all itinerary details and passenger information before payment simulation.')}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                  {t('checkout.simulated_badge', 'Sandbox Checkout Mode')}
                </span>
              </div>

              {/* Trip Overview Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('builder.destination', 'Destination')}</span>
                  <span className="font-bold text-slate-900">{destination || 'Goa'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('cart.primary_passenger', 'Primary Passenger')}</span>
                  <span className="font-bold text-slate-900">
                    {travellers[0].first_name} {travellers[0].last_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('checkout.email', 'Contact')}</span>
                  <span className="font-bold text-slate-900 truncate block">{contactEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('step.review.budget_status', 'Trip Budget Check')}</span>
                  <span className="font-bold text-emerald-600">
                    {budget ? `₹${budget.toLocaleString('en-IN')} Target` : t('common.flexible', 'Flexible')}
                  </span>
                </div>
              </div>

              {/* Selected Add-ons Summary */}
              {totalAddonsCost > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs space-y-2">
                  <span className="font-bold text-blue-900 text-xs block">{t('cart.selected_addons', 'Selected Add-ons')} (₹{totalAddonsCost}):</span>
                  <div className="flex flex-wrap gap-2">
                    {insuranceSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-700 font-semibold text-[11px]">
                        {t('cart.insurance_short', 'Insurance')} (₹499)
                      </span>
                    )}
                    {transferSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-700 font-semibold text-[11px]">
                        {t('cart.transfer_short', 'Airport Transfer')} (₹899)
                      </span>
                    )}
                    {extraBaggageSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-700 font-semibold text-[11px]">
                        {t('cart.baggage_short', 'Extra Baggage')} (₹650)
                      </span>
                    )}
                    {seatSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-700 font-semibold text-[11px]">
                        {t('cart.seat_short', 'Preferred Seat')} (₹350)
                      </span>
                    )}
                    {mealSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-slate-700 font-semibold text-[11px]">
                        {t('cart.meal_short', 'In-Flight Meal')} (₹450)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('addons')}
                  className="btn-secondary text-xs !py-2.5 px-4 font-bold w-full sm:w-auto"
                >
                  {t('cart.edit_addons', 'Edit Add-ons & Details')}
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="btn-primary py-3.5 px-8 text-sm font-black shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <span>{t('cart.proceed_payment', 'Proceed to Payment')} (₹{finalTotal.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Fare Breakdown & Promo Code */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          <div className="surface-card p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              {t('cart.breakdown_title', 'Fare & Financial Breakdown')}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.base_subtotal', 'Base Subtotal')}</span>
                <CurrencyDisplay amount={subtotal} className="font-bold text-slate-900" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.taxes', 'Taxes & GST (5%)')}</span>
                <CurrencyDisplay amount={taxes} className="font-bold text-slate-900" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.convenience_fee', 'Convenience Fee')}</span>
                <CurrencyDisplay amount={serviceFee} className="font-bold text-slate-900" />
              </div>

              {totalAddonsCost > 0 && (
                <div className="flex justify-between text-blue-700 font-semibold">
                  <span>{t('cart.selected_addons', 'Selected Add-ons')}</span>
                  <CurrencyDisplay amount={totalAddonsCost} className="font-bold text-blue-700" />
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{t('cart.promo_discount', 'Promo Discount')}</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900 block">{t('cart.total_payable', 'Total Payable')}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{t('checkout.simulated_badge', 'Demo Sandbox Pricing')}</span>
                </div>
                <CurrencyDisplay amount={finalTotal} className="text-2xl font-black text-blue-600" />
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">{t('cart.have_promo', 'Have a Promo Code?')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. TRIP2026"
                  className="input-field text-xs py-2 uppercase"
                />
                <button type="submit" className="btn-secondary text-xs !py-2 px-3 font-bold">
                  {t('booking.apply_code', 'Apply')}
                </button>
              </div>
              {appliedPromo && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {appliedPromo}
                </p>
              )}
              {promoError && (
                <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {promoError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

