import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Plus,
  Send,
  Download,
  Share2,
  CheckCircle2,
  Building2,
  Plane,
  Percent,
  Calculator,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';
import { Modal } from '../../components/Common/Modal';

interface ClientProposal {
  id: string;
  clientName: string;
  destination: string;
  travelDates: string;
  pax: number;
  baseCost: number;
  agencyMarginPercent: number;
  totalQuotation: number;
  status: 'Draft' | 'Sent to Client' | 'Accepted' | 'Booked';
  inclusions: string[];
}

export const AgencyPortal: React.FC = () => {
  const [proposals, setProposals] = useState<ClientProposal[]>([
    {
      id: 'prop-101',
      clientName: 'Dr. Alok Verma (Family)',
      destination: 'Goa Coastal Luxury',
      travelDates: '15 Sep – 20 Sep 2026',
      pax: 4,
      baseCost: 78000,
      agencyMarginPercent: 12,
      totalQuotation: 87360,
      status: 'Accepted',
      inclusions: ['4x Roundtrip Flights (DEL-GOI)', '5★ Beach Villa 4 Nights', 'Private AC Innova Crysta', 'Sunset Cruise'],
    },
    {
      id: 'prop-102',
      clientName: 'Mehta Honeymoon Package',
      destination: 'Bali Tropical Escape',
      travelDates: '04 Oct – 11 Oct 2026',
      pax: 2,
      baseCost: 110000,
      agencyMarginPercent: 15,
      totalQuotation: 126500,
      status: 'Sent to Client',
      inclusions: ['Private Pool Villa in Ubud', 'Nusa Penida Speedboat', 'Couples Balinese Spa', 'Airport VIP Pickup'],
    },
    {
      id: 'prop-103',
      clientName: 'TechCorp Annual Offsite',
      destination: 'Dubai Business & Desert Retreat',
      travelDates: '12 Nov – 16 Nov 2026',
      pax: 15,
      baseCost: 450000,
      agencyMarginPercent: 10,
      totalQuotation: 495000,
      status: 'Draft',
      inclusions: ['Emirates Group Flights', '5★ Downtown Hotel', 'Private Desert Safari & Banquet', 'Meeting Hall'],
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [destination, setDestination] = useState('Goa');
  const [travelDates, setTravelDates] = useState('15 Sep – 20 Sep 2026');
  const [pax, setPax] = useState(2);
  const [baseCost, setBaseCost] = useState(40000);
  const [marginPercent, setMarginPercent] = useState(12);
  const [inclusionsText, setInclusionsText] = useState('Roundtrip Flights, 4★ Resort, Private Cab, Breakfast');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const totalRevenue = proposals.reduce((acc, p) => acc + p.totalQuotation, 0);
  const totalCommission = proposals.reduce((acc, p) => acc + (p.totalQuotation - p.baseCost), 0);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const totalQuotation = Math.round(baseCost * (1 + marginPercent / 100));
    const newProp: ClientProposal = {
      id: `prop-${Date.now().toString().slice(-4)}`,
      clientName,
      destination,
      travelDates,
      pax: Number(pax),
      baseCost: Number(baseCost),
      agencyMarginPercent: Number(marginPercent),
      totalQuotation,
      status: 'Draft',
      inclusions: inclusionsText.split(',').map((s) => s.trim()),
    };

    setProposals([newProp, ...proposals]);
    setModalOpen(false);
    setClientName('');
    setBaseCost(40000);
  };

  const handleShare = (prop: ClientProposal) => {
    const link = `https://trippilot.ai/proposal/${prop.id}?client=${encodeURIComponent(prop.clientName)}`;
    setGeneratedLink(link);
    navigator.clipboard.writeText(link);
    setTimeout(() => setGeneratedLink(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>TRIPPILOT PRO TRAVEL AGENCY CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Travel Agency & B2B Partner Workspace
          </h1>
          <p className="text-xs text-slate-500">
            Build custom client itineraries, manage quotations, apply agency markups, and dispatch branded proposals.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs !py-3 px-5 font-bold shadow-sm flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Client Proposal
        </button>
      </div>

      {generatedLink && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Branded Client Proposal URL Copied to Clipboard!</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-900 truncate max-w-sm">{generatedLink}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="surface-card p-5 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Active Clients</span>
          <span className="text-2xl font-black text-slate-900">{proposals.length} Accounts</span>
          <span className="text-[11px] text-slate-500 block">Proposals in pipeline</span>
        </div>

        <div className="surface-card p-5 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Quoted Volume</span>
          <CurrencyDisplay amount={totalRevenue} className="text-2xl font-black text-slate-900" />
          <span className="text-[11px] text-slate-500 block">Total itinerary volume</span>
        </div>

        <div className="surface-card p-5 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">Agency Margin</span>
          <CurrencyDisplay amount={totalCommission} className="text-2xl font-black text-emerald-700" />
          <span className="text-[11px] text-emerald-600 font-bold block">Avg. 12.5% Gross Margin</span>
        </div>

        <div className="surface-card p-5 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-1">
          <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">Conversion Rate</span>
          <span className="text-2xl font-black text-blue-700">75%</span>
          <span className="text-[11px] text-blue-600 font-bold block">Proposal-to-booking</span>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="surface-card rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Client Travel Proposals ({proposals.length})
          </h3>
          <span className="text-xs text-slate-500">Live Client Quotations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 pl-4">Client / Group</th>
                <th className="p-3.5">Destination & Dates</th>
                <th className="p-3.5">Pax</th>
                <th className="p-3.5">Base Cost</th>
                <th className="p-3.5">Agency Margin</th>
                <th className="p-3.5">Quotation</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-4 font-bold text-slate-900">{p.clientName}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block">{p.destination}</span>
                    <span className="text-[10px] text-slate-400">{p.travelDates}</span>
                  </td>
                  <td className="p-3.5 text-slate-700">{p.pax} Person(s)</td>
                  <td className="p-3.5 text-slate-600">
                    <CurrencyDisplay amount={p.baseCost} />
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{p.agencyMarginPercent}%
                    </span>
                  </td>
                  <td className="p-3.5">
                    <CurrencyDisplay amount={p.totalQuotation} className="font-black text-slate-900 text-sm" />
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'Accepted' || p.status === 'Booked'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'Sent to Client'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <button
                      onClick={() => handleShare(p)}
                      className="btn-secondary text-xs !py-1 px-2.5 font-bold inline-flex items-center gap-1"
                      title="Share Proposal Link with Client"
                    >
                      <Share2 className="w-3 h-3" /> Share Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Create New Client Proposal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Client Trip Proposal" maxWidth="lg">
        <form onSubmit={handleCreateProposal} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Client / Company Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Ramesh Patel Family"
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Destination</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Travel Dates</label>
              <input
                type="text"
                required
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                placeholder="e.g. 15 Oct – 20 Oct 2026"
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Number of Travellers</label>
              <input
                type="number"
                min={1}
                required
                value={pax}
                onChange={(e) => setPax(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Estimated Base Inventory Cost (INR)</label>
              <input
                type="number"
                required
                value={baseCost}
                onChange={(e) => setBaseCost(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Agency Commission / Markup (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                required
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Inclusions Summary (Comma separated)</label>
            <textarea
              rows={2}
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
              className="input-field text-xs py-2"
            />
          </div>

          {/* Real-time Calculation Summary */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Calculated Client Quotation</span>
              <CurrencyDisplay
                amount={Math.round(baseCost * (1 + marginPercent / 100))}
                className="text-lg font-black text-slate-900"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Gross Margin</span>
              <CurrencyDisplay
                amount={Math.round((baseCost * marginPercent) / 100)}
                className="text-base font-black text-emerald-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs !py-2 px-3 font-bold">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold shadow-sm">
              Save & Generate Client Proposal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
