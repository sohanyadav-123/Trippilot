import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, CreditCard, Lock, Check, AlertCircle, Sparkles, User, Mail, Phone, ArrowRight } from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { useAuth } from '../../hooks/useAuth';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { LoadingSpinner } from '../Common/LoadingSpinner';

export const TripBuilderCheckoutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTravelSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    destination,
    departureDate,
    returnDate,
    travellers,
    tripNights,
    estimatedTotal,
    taxes,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    completeBooking,
  } = useTripBuilder();

  // Travellers State
  const [travellerNames, setTravellerNames] = useState(
    Array.from({ length: travellers }, (_, i) => ({
      title: i === 0 ? 'Mr' : 'Ms',
      first_name: i === 0 ? user?.name?.split(' ')[0] || 'Sohan' : '',
      last_name: i === 0 ? user?.name?.split(' ')[1] || 'Yadav' : '',
    }))
  );

  const [contactEmail, setContactEmail] = useState(user?.email || 'sohan.yadav@example.com');
  const [contactPhone, setContactPhone] = useState('9876543210');

  // Add-ons
  const [insuranceSelected, setInsuranceSelected] = useState(true);
  const [carbonOffsetSelected, setCarbonOffsetSelected] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('sohan@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8920 1294 3829');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('842');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insuranceCost = insuranceSelected ? 399 * travellers : 0;
  const carbonCost = carbonOffsetSelected ? 150 * travellers : 0;
  const finalGrandTotal = estimatedTotal + insuranceCost + carbonCost;

  const handleTravellerChange = (index: number, field: string, value: string) => {
    setTravellerNames((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate
    if (!contactEmail.includes('@') || !contactPhone || contactPhone.length < 8) {
      setErrorMessage('Please provide a valid email and phone number.');
      return;
    }

    for (let i = 0; i < travellerNames.length; i++) {
      if (!travellerNames[i].first_name.trim() || !travellerNames[i].last_name.trim()) {
        setErrorMessage(`Please enter complete name for Traveller ${i + 1}.`);
        return;
      }
    }

    setLoading(true);

    const res = await completeBooking(
      travellerNames,
      {
        email: contactEmail,
        phone: contactPhone,
        country_code: '+91',
      },
      paymentMethod
    );

    setLoading(false);

    if (res.success && res.bookingReference) {
      onClose();
      navigate(`/booking-confirmation/${res.bookingReference}`);
    } else {
      setErrorMessage(res.error || 'Payment authorization failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-luxury border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-[#0B1220] text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#C8A96B] text-[#0B1220] uppercase tracking-wider">
                {t('checkout.demo_badge', 'DEMO BOOKING CHECKOUT')}
              </span>
              <span className="text-xs text-slate-300">• {t('checkout.instant_tickets', '100% Instant E-Tickets')}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              {t('checkout.title', { destination }, `Confirm & Book ${destination} Trip`)}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleConfirmBooking} className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Traveller Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0B1220]" />
              <span>{t('checkout.traveller_details', { count: travellers }, `Traveller Details (${travellers} Guest${travellers > 1 ? 's' : ''})`)}</span>
            </h4>

            {travellerNames.map((tItem, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">{t('checkout.traveller_num', { num: idx + 1 }, `Traveller ${idx + 1}`)}</span>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <select
                      value={tItem.title}
                      onChange={(e) => handleTravellerChange(idx, 'title', e.target.value)}
                      className="input-field text-xs !py-1.5"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.first_name', 'First Name')}
                      value={tItem.first_name}
                      onChange={(e) => handleTravellerChange(idx, 'first_name', e.target.value)}
                      className="input-field text-xs !py-1.5"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.last_name', 'Last Name')}
                      value={tItem.last_name}
                      onChange={(e) => handleTravellerChange(idx, 'last_name', e.target.value)}
                      className="input-field text-xs !py-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0B1220]" />
              <span>{t('checkout.contact_title', 'Contact for Digital Tickets & Vouchers')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('checkout.email', 'Email Address')}</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-field text-xs !py-1.5"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('checkout.phone', 'Phone Number')}</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input-field text-xs !py-1.5"
                />
              </div>
            </div>
          </div>

          {/* 3. Optional Add-ons */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('checkout.enhancements_title', 'Optional Trip Enhancements')}</h4>

            <div
              onClick={() => setInsuranceSelected(!insuranceSelected)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                insuranceSelected ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${insuranceSelected ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  {insuranceSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0B1220] block">{t('checkout.protection_plan', 'Comprehensive Travel Protection Plan')}</span>
                  <span className="text-[11px] text-slate-500">{t('checkout.protection_desc', 'Medical emergency coverage, baggage loss, and trip delay insurance')}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">+₹{399 * travellers}</span>
            </div>

            <div
              onClick={() => setCarbonOffsetSelected(!carbonOffsetSelected)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                carbonOffsetSelected ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${carbonOffsetSelected ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  {carbonOffsetSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0B1220] block">{t('checkout.carbon_plan', 'Certified Carbon Offset Contribution')}</span>
                  <span className="text-[11px] text-slate-500">{t('checkout.carbon_desc', 'Plant certified trees in Western Ghats sanctuary')}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">+₹{150 * travellers}</span>
            </div>
          </div>

          {/* 4. Demo Payment Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0B1220]" />
                <span>{t('checkout.payment_method_title', 'Demo Payment Method')}</span>
              </h4>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                {t('checkout.simulated_badge', 'Simulated Sandbox Demo')}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'upi', label: t('checkout.upi_tab', 'UPI / QR') },
                { id: 'card', label: t('checkout.card_tab', 'Credit / Debit Card') },
                { id: 'netbanking', label: t('checkout.netbanking_tab', 'NetBanking') },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === m.id
                      ? 'bg-[#0B1220] text-white border-[#0B1220]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'upi' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{t('checkout.upi_id', 'UPI Virtual ID')}</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="input-field text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400">{t('checkout.upi_sub', 'Simulates instant UPI push approval notification.')}</span>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">{t('checkout.card_number', 'Card Number')}</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">{t('checkout.valid_thru', 'Valid Thru')}</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="input-field text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">{t('checkout.cvv', 'CVV')}</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="input-field text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{t('checkout.select_bank', 'Select Bank')}</label>
                <select className="input-field text-xs">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* Pricing Total Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/90 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{t('checkout.trip_subtotal', 'Trip Subtotal')}</span>
              <CurrencyDisplay amount={estimatedTotal - taxes} className="font-semibold" />
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>{t('checkout.taxes', 'Applicable Taxes (GST 5%)')}</span>
              <CurrencyDisplay amount={taxes} className="font-semibold" />
            </div>
            {insuranceSelected && (
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('checkout.protection_fee', 'Travel Protection Plan')}</span>
                <CurrencyDisplay amount={insuranceCost} className="font-semibold" />
              </div>
            )}
            {carbonOffsetSelected && (
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('checkout.carbon_fee', 'Carbon Offset')}</span>
                <CurrencyDisplay amount={carbonCost} className="font-semibold" />
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-sm text-[#0B1220]">
              <span>{t('checkout.grand_total', 'Final Grand Total')}</span>
              <CurrencyDisplay amount={finalGrandTotal} className="text-lg font-black text-[#0B1220]" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-xs !py-2.5 px-4 font-bold"
            >
              {t('common.cancel', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-blue text-xs sm:text-sm !py-2.5 px-6 font-bold shadow-md flex items-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" text={t('checkout.processing', 'Processing Demo Payment...')} />
              ) : (
                <>
                  <span>{t('checkout.authorize_payment', 'Authorize Demo Payment')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
