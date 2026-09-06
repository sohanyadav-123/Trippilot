import React, { useState } from 'react';
import {
  Users,
  Plus,
  Vote,
  DollarSign,
  Share2,
  Mail,
  CheckCircle2,
  Flame,
  ThumbsUp,
  UserCheck,
  Send,
  Calculator,
  User,
} from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface GroupMember {
  id: string;
  name: string;
  avatarText: string;
  role: 'Leader' | 'Member';
  budgetLimit: number;
  dietary: string;
  status: 'Accepted' | 'Pending';
}

interface PollOption {
  id: string;
  title: string;
  category: string;
  estCost: number;
  votes: string[]; // Member IDs
}

export const GroupTripPlanner: React.FC = () => {
  const [members, setMembers] = useState<GroupMember[]>([
    {
      id: 'm-1',
      name: 'Dasuri Sohan Yadav',
      avatarText: 'SY',
      role: 'Leader',
      budgetLimit: 45000,
      dietary: 'Vegetarian',
      status: 'Accepted',
    },
    {
      id: 'm-2',
      name: 'Priya Sharma',
      avatarText: 'PS',
      role: 'Member',
      budgetLimit: 40000,
      dietary: 'Non-Veg',
      status: 'Accepted',
    },
    {
      id: 'm-3',
      name: 'Rahul Verma',
      avatarText: 'RV',
      role: 'Member',
      budgetLimit: 50000,
      dietary: 'No restrictions',
      status: 'Accepted',
    },
    {
      id: 'm-4',
      name: 'Ananya Roy',
      avatarText: 'AR',
      role: 'Member',
      budgetLimit: 38000,
      dietary: 'Vegan',
      status: 'Pending',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // Activity Voting Poll State
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    {
      id: 'p-1',
      title: 'Grande Island Scuba Diving & Dolphin Cruise',
      category: 'Adventure',
      estCost: 2499,
      votes: ['m-1', 'm-2', 'm-3'],
    },
    {
      id: 'p-2',
      title: 'Old Goa Heritage Walk & Latin Quarter Tasting',
      category: 'Culture',
      estCost: 850,
      votes: ['m-1', 'm-4'],
    },
    {
      id: 'p-3',
      title: 'Mandovi Luxury Sunset DJ Cruise',
      category: 'Nightlife',
      estCost: 1200,
      votes: ['m-2'],
    },
  ]);

  const currentUserId = 'm-1';

  const handleVote = (optionId: string) => {
    setPollOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          const hasVoted = opt.votes.includes(currentUserId);
          return {
            ...opt,
            votes: hasVoted ? opt.votes.filter((id) => id !== currentUserId) : [...opt.votes, currentUserId],
          };
        }
        return opt;
      })
    );
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: GroupMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      avatarText: inviteEmail.slice(0, 2).toUpperCase(),
      role: 'Member',
      budgetLimit: 40000,
      dietary: 'Standard',
      status: 'Pending',
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  // Group Expense Split Calculation
  const totalGroupBudget = members.reduce((acc, m) => acc + m.budgetLimit, 0);
  const avgBudget = Math.round(totalGroupBudget / members.length);

  return (
    <div className="surface-card p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            <Users className="w-3 h-3 text-blue-600" />
            <span>COLLABORATIVE GROUP TRIP HUB</span>
          </div>
          <h3 className="text-base font-black text-slate-900">
            Goa Friends Getaway ({members.length} Travellers)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            Avg. Budget: <CurrencyDisplay amount={avgBudget} className="font-bold text-slate-900" /> / person
          </span>
        </div>
      </div>

      {/* Invite Co-Travellers Box */}
      <form onSubmit={handleSendInvite} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full flex-1">
          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite friend or partner by email..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="submit"
          className="btn-primary text-xs !py-2 px-4 font-bold shadow-xs whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send Trip Invite
        </button>
      </form>

      {inviteSent && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Invitation sent! Shared itinerary access link generated.</span>
        </div>
      )}

      {/* Members Directory */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Trip Members & Preferences</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {member.avatarText}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{member.name}</span>
                    {member.role === 'Leader' && (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        Host
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Diet: {member.dietary} • Max: ₹{member.budgetLimit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  member.status === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Voting Poll */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Vote className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Activity Vote: "What should we do on Day 2 Afternoon?"
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">Total Votes: {pollOptions.reduce((a, b) => a + b.votes.length, 0)}</span>
        </div>

        <div className="space-y-2.5">
          {pollOptions.map((opt) => {
            const isUserVoted = opt.votes.includes(currentUserId);
            const totalVotes = opt.votes.length;
            const isWinner = totalVotes === Math.max(...pollOptions.map((o) => o.votes.length)) && totalVotes > 0;

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isWinner ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{opt.title}</span>
                    {isWinner && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-600 fill-amber-600" /> Top Choice
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Category: {opt.category} • Approx.{' '}
                    <CurrencyDisplay amount={opt.estCost} className="font-bold text-slate-700" /> / person
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center -space-x-1.5">
                    {opt.votes.map((vId) => {
                      const m = members.find((mem) => mem.id === vId);
                      return (
                        <div
                          key={vId}
                          title={m?.name}
                          className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white"
                        >
                          {m?.avatarText || 'U'}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVote(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isUserVoted
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{opt.votes.length} Vote{opt.votes.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
