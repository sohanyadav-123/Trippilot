import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Building,
  Wallet,
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FlaskConical,
  ToggleLeft,
  ToggleRight,
  Info,
  Zap,
  Smartphone,
  BadgeAlert,
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../services/bookingService';
import { useCart } from '../hooks/useCart';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { useTravelSettings } from '../context/TravelSettingsContext';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const BANKS = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda'];
const WALLETS = ['Amazon Pay Balance', 'Paytm Wallet', 'Mobikwik', 'Freecharge', 'PhonePe Wallet'];

const generateDemoRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `DEMO-TRP-${code}`;
};

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { t } = useTravelSettings();
  const idempotencyRef = useRef<string>(`PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('sohan.yadav@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 7890');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState('SOHAN YADAV');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  useEffect(() => {
    const raw =
      localStorage.getItem('trippilot_pending_checkout') ||
      sessionStorage.getItem('trippilot_checkout_data');
    if (!raw) {
      navigate('/cart');
      return;
    }
    const parsed = JSON.parse(raw);
    setCheckoutData(parsed);

    // Duplicate payment protection: check if this checkout was already paid
    const paidRef = sessionStorage.getItem(`trippilot_paid_${idempotencyRef.current}`);
    if (paidRef) setAlreadyPaid(true);
  }, [navigate]);

  if (!checkoutData) {
    return <div className="py-32 text-center text-slate-500 font-semibold">{t('payment.loading', 'Loading secure payment session...')}</div>;
  }

  const totalAmount = checkoutData.total_amount || checkoutData.pricing?.total || 15000;
  const subtotal = checkoutData.subtotal || totalAmount * 0.9;
  const taxes = checkoutData.taxes || totalAmount * 0.05;
  const addonsTotal = checkoutData.addons_total || 0;
  const discount = checkoutData.discount || 0;
  const selected_items = checkoutData.selected_items || [];
  const traveller_details = checkoutData.traveller_details || [{ first_name: 'Traveller', last_name: 'Primary' }];
  const contact = checkoutData.contact || { email: 'user@trippilot.ai', phone: '9876543210' };

  const formatCard = (val: string) => {
    const raw = val.replace(/\s/g, '').slice(0, 16);
    return raw.replace(/(.{4})/g, '$1 ').trim();
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing || alreadyPaid) return;

    if (selectedMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setError(t('payment.error_upi', 'Please enter a valid UPI VPA address (e.g. yourname@okhdfcbank).'));
        return;
      }
    } else if (selectedMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setError(t('payment.error_card_num', 'Please enter a valid card number (15–16 digits).'));
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        setError(t('payment.error_expiry', 'Please enter a valid expiry date (MM/YY).'));
        return;
      }
      if (cardCvv.length < 3) {
        setError(t('payment.error_cvv', 'Please enter a valid 3-digit CVV / Security Code.'));
        return;
      }
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create Payment Intent
      setProcessingStep(t('payment.step_init', 'Initialising secure payment session...'));
      await new Promise((r) => setTimeout(r, 700));

      const createRes = await paymentService.createPaymentIntent({
        amount: totalAmount,
        currency: 'INR',
        idempotency_key: idempotencyRef.current,
        metadata: {
          traveller_count: traveller_details.length,
          item_count: selected_items.length,
          is_demo: true,
        },
      });
      const paymentId = createRes.success && createRes.data
        ? createRes.data.payment_id
        : `pay_demo_${Date.now()}`;

      // Step 2: Simulate processing
      setProcessingStep(t('payment.step_auth', 'Authenticating with payment network...'));
      await new Promise((r) => setTimeout(r, 900));

      // Simulate failure if toggle is on
      if (simulateFailure) {
        throw new Error('DEMO: Payment declined — Insufficient funds simulation. This is a test scenario. No real charge was made.');
      }

      // Step 3: Confirm Payment
      setProcessingStep(t('payment.step_confirm', 'Confirming transaction with bank...'));
      await paymentService.confirmPayment(paymentId, selectedMethod);
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Create Booking
      setProcessingStep(t('payment.step_gen', 'Generating booking confirmation...'));
      const demoRef = generateDemoRef();
      const bookingRes = await bookingService.createBooking({
        selected_items,
        traveller_details,
        contact,
        payment_id: paymentId,
        booking_reference: demoRef,
        is_demo: true,
      });

      const ref = bookingRes.success && bookingRes.data
        ? bookingRes.data.booking_reference || bookingRes.data.id || demoRef
        : demoRef;

      // Mark as paid to prevent duplicate charges
      sessionStorage.setItem(`trippilot_paid_${idempotencyRef.current}`, ref);

      clearCart();
      localStorage.removeItem('trippilot_pending_checkout');
      sessionStorage.removeItem('trippilot_checkout_data');

      navigate(`/booking/confirmation/${ref}`);
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please retry.');
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* DEMO SANDBOX BANNER — Prominent */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm">
        <FlaskConical className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-amber-800 uppercase tracking-wide">
            {t('payment.sandbox_title', '🧪 Demo Payment Gateway — Sandbox Mode')}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
            {t('payment.sandbox_desc', 'This is a simulated payment session. No real money will be charged. No real airline/hotel reservation will be created. All transactions are synthetic and for demonstration purposes only. Pre-filled details are mock test credentials.')}
          </p>
        </div>
        <BadgeAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      </div>

      {/* Checkout Stepper */}
      <div className="flex items-center justify-between max-w-xl mx-auto py-2">
        <div className="flex items-center gap-2 text-emerald-600 font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs">{t('payment.step_travellers', 'Travellers Confirmed')}</span>
        </div>
        <div className="flex-1 h-px bg-slate-300 mx-4" />
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
            2
          </div>
          <span className="text-xs">{t('payment.step_gateway', 'Payment Gateway')}</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 mx-4" />
        <div className="flex items-center gap-2 opacity-50 font-semibold text-slate-400">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-xs flex items-center justify-center">
            3
          </div>
          <span className="text-xs">{t('payment.step_eticket', 'E-Ticket')}</span>
        </div>
      </div>

      {alreadyPaid && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{t('payment.already_paid', 'This payment session has already been processed. Please check your booking in My Trips.')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* Left Column: Payment Form */}
        <div className="md:col-span-7 space-y-4">
          <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h1 className="text-lg font-black text-slate-900">{t('payment.select_mode', 'Select Payment Mode')}</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('payment.simulated', 'SIMULATED')}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {t('payment.sandbox', 'SANDBOX')}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'upi', label: t('payment.method_upi', 'UPI / QR Code'), icon: QrCode, sub: t('payment.method_upi_sub', 'GPay, PhonePe, Paytm') },
                { id: 'card', label: t('payment.method_card', 'Credit / Debit Card'), icon: CreditCard, sub: t('payment.method_card_sub', 'Visa, Mastercard, Rupay') },
                { id: 'netbanking', label: t('payment.method_netbanking', 'Net Banking'), icon: Building, sub: t('payment.method_netbanking_sub', 'All major banks') },
                { id: 'wallet', label: t('payment.method_wallet', 'Digital Wallet'), icon: Wallet, sub: t('payment.method_wallet_sub', 'Paytm, Amazon Pay') },
              ].map((m) => {
                const Icon = m.icon;
                const active = selectedMethod === m.id as PaymentMethod;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      active
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs block font-semibold">{m.label}</span>
                      <span className={`text-[10px] ${active ? 'text-blue-600' : 'text-slate-400'}`}>{m.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Method Specific Form Fields */}
            <form onSubmit={handlePayNow} className="space-y-4 pt-2">
              {selectedMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{t('payment.demo_upi_qr', 'DEMO UPI QR')}</p>
                      <p className="text-xs text-slate-700">{t('payment.scan_upi_desc', 'Scan with any UPI app (simulated — no money deducted)')}</p>
                    </div>
                  </div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block">{t('payment.upi_id_label', 'UPI ID / VPA')}</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="input-field text-xs py-2.5"
                  />
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {t('payment.upi_simulated_note', 'A simulated payment request will be sent in demo mode.')}
                  </p>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">{t('payment.card_name_label', 'Cardholder Name')}</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="input-field text-xs py-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">{t('payment.card_number_label', 'Card Number')}</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="input-field text-xs py-2.5 font-mono tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">{t('payment.expiry_label', 'Expiry (MM/YY)')}</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="input-field text-xs py-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">{t('payment.cvv_label', 'CVV')}</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="input-field text-xs py-2.5 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {t('payment.card_test_note', 'These are pre-filled test credentials. No real card is charged.')}
                  </p>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 block">{t('payment.select_bank', 'Select Your Bank')}</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="input-field text-xs py-2.5"
                  >
                    {BANKS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {t('payment.bank_redirect_note', 'Redirects to a simulated bank portal in demo mode.')}
                  </p>
                </div>
              )}

              {selectedMethod === 'wallet' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 block">{t('payment.select_wallet', 'Select Digital Wallet')}</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="input-field text-xs py-2.5"
                  >
                    {WALLETS.map((w) => <option key={w}>{w}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {t('payment.wallet_note', 'Wallet balance deduction is simulated in sandbox.')}
                  </p>
                </div>
              )}

              {/* Simulate Failure Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{t('payment.simulate_failure', 'Simulate Payment Failure')}</p>
                    <p className="text-[10px] text-slate-500">{t('payment.simulate_failure_sub', 'Toggle to test the declined transaction flow')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulateFailure((v) => !v)}
                  className={`flex-shrink-0 transition-colors ${simulateFailure ? 'text-rose-500' : 'text-slate-400'}`}
                >
                  {simulateFailure
                    ? <ToggleRight className="w-8 h-8" />
                    : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              {processing && processingStep && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-blue-700">{processingStep}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={processing || alreadyPaid}
                className="w-full btn-primary py-3.5 text-sm font-black shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('payment.authorising', 'Authorising Demo Payment...')}
                  </>
                ) : alreadyPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> {t('payment.already_processed', 'Already Processed')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>{t('payment.pay_demo_btn', 'Pay (DEMO)')} <CurrencyDisplay amount={totalAmount} className="font-black text-white" /></span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                {t('payment.security_footer', 'Simulated 256-bit TLS encryption • No real payment processed • SANDBOX')}
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5 space-y-4">
          <div className="surface-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t('payment.order_summary', 'Order Summary')}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
                {t('common.demo', 'DEMO')}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              {selected_items.length > 0 ? (
                selected_items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="truncate">{item.type === 'flight' ? t('payment.item_flight', '✈ Flight') : item.type === 'hotel' ? t('payment.item_hotel', '🏨 Hotel') : '📦 ' + item.type}</span>
                    <CurrencyDisplay amount={item.price || 0} className="font-bold text-slate-900 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>{t('payment.selected_items', 'Selected Items')}</span>
                  <span className="font-bold text-slate-900">{selected_items.length || 1} {t('payment.components_count', 'Component(s)')}</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span>{t('payment.subtotal', 'Subtotal')}</span>
                  <CurrencyDisplay amount={subtotal} className="font-semibold text-slate-700" />
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>{t('payment.addons', 'Add-ons')}</span>
                    <CurrencyDisplay amount={addonsTotal} className="font-semibold text-slate-700" />
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('payment.taxes_fees', 'Taxes & Fees')}</span>
                  <CurrencyDisplay amount={taxes} className="font-semibold text-slate-700" />
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t('payment.discount_applied', 'Discount Applied')}</span>
                    <span className="font-bold">-₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">{t('payment.total_payable', 'Total Payable (Demo)')}</span>
                <CurrencyDisplay amount={totalAmount} className="text-2xl font-black text-blue-600" />
              </div>
            </div>
          </div>

          <div className="surface-card p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-500 tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('payment.booking_details', 'Booking Details')}
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('payment.travellers', 'Travellers')}</span>
                <span className="font-bold text-slate-900">{traveller_details.length} {t('payment.person_count', 'Person(s)')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('payment.contact', 'Contact')}</span>
                <span className="font-semibold text-slate-900 truncate max-w-[140px]">{contact.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('payment.reference_format', 'Reference Format')}</span>
                <span className="font-mono text-[10px] font-bold text-blue-600">DEMO-TRP-XXXXXX</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-600 mb-0.5">{t('payment.disclaimer_title', '⚠ Demo Mode Disclaimer')}</p>
            {t('payment.disclaimer_desc', 'All bookings made through this interface are simulated and do not create actual reservations with airlines, hotels, or any travel provider. The DEMO-TRP reference is for internal tracking only.')}
          </div>
        </div>
      </div>
    </div>
  );
};
