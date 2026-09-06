import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Clock,
  Send,
  Compass,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Activity,
  User,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';

export const SharedTripsPage: React.FC = () => {
  const {
    destination,
    sharedMembers,
    addSharedMember,
    removeSharedMember,
    suggestions,
    addSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    tripActivityLog,
    tripComments,
    addTripComment,
  } = useTripBuilder();

  const [activeTab, setActiveTab] = useState<'members' | 'suggestions' | 'activity' | 'chat'>('suggestions');

  // Invite Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');

  // New Suggestion state
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [sugTitle, setSugTitle] = useState('');
  const [sugType, setSugType] = useState<'activity' | 'restaurant' | 'hotel'>('activity');
  const [sugDesc, setSugDesc] = useState('');
  const [sugCost, setSugCost] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    addSharedMember(inviteEmail.trim(), inviteName.trim() || inviteEmail.split('@')[0], inviteRole);
    setInviteEmail('');
    setInviteName('');
  };

  const handleCreateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugTitle.trim()) return;

    addSuggestion({
      suggestedBy: 'Sohan (You)',
      suggestedByEmail: 'sohan@example.com',
      type: sugType,
      title: sugTitle.trim(),
      description: sugDesc.trim(),
      cost: sugCost ? Number(sugCost) : undefined,
    });

    setSugTitle('');
    setSugDesc('');
    setSugCost('');
    setShowSuggestForm(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTripComment({
      authorName: 'Sohan (You)',
      authorEmail: 'sohan@example.com',
      itemId: 'general',
      itemType: 'general',
      text: commentText.trim(),
    });
    setCommentText('');
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-[#0B1220] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
            <Users className="w-3.5 h-3.5" />
            <span>GROUP CO-PLANNING & SUGGESTIONS</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight">
            Collaborate on {destination} Trip
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Invite travel buddies to review itineraries, pitch activities, vote on stays, and track group change history.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3 self-start sm:self-auto">
          <Link
            to="/plan"
            className="btn-secondary text-xs !py-2.5 px-4 font-bold bg-white text-slate-900 border-none shadow-md"
          >
            Open Trip Builder
          </Link>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'suggestions', label: `💡 Suggestions (${pendingSuggestions.length})` },
          { id: 'members', label: `👥 Collaborators (${sharedMembers.length})` },
          { id: 'activity', label: '⚡ Activity Log' },
          { id: 'chat', label: '💬 Group Discussion' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* ─── TAB 1: SUGGESTIONS WORKFLOW ─── */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Pending Group Suggestions
            </h3>
            <button
              onClick={() => setShowSuggestForm(!showSuggestForm)}
              className="btn-primary text-xs !py-1.5 px-3.5 font-bold shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Propose Suggestion</span>
            </button>
          </div>

          {/* New Suggestion Form */}
          {showSuggestForm && (
            <form
              onSubmit={handleCreateSuggestion}
              className="surface-card p-6 rounded-3xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-3 animate-fade-in text-xs"
            >
              <h4 className="font-bold text-sm text-slate-900">Propose an Activity or Restaurant</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scuba Diving at Grande Island"
                    value={sugTitle}
                    onChange={(e) => setSugTitle(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Category</label>
                  <select
                    value={sugType}
                    onChange={(e) => setSugType(e.target.value as any)}
                    className="input-field text-xs py-2"
                  >
                    <option value="activity">Activity / Tour</option>
                    <option value="restaurant">Restaurant / Dining</option>
                    <option value="hotel">Stay / Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={sugCost}
                    onChange={(e) => setSugCost(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Why do you recommend this?</label>
                <textarea
                  rows={2}
                  placeholder="Share a short note on why the group should do this..."
                  value={sugDesc}
                  onChange={(e) => setSugDesc(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSuggestForm(false)}
                  className="btn-secondary text-xs !py-1.5 px-3 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs !py-1.5 px-4 font-bold shadow-xs"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          )}

          {suggestions.length === 0 ? (
            <div className="surface-card p-10 text-center rounded-3xl border border-slate-200 bg-white space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No suggestions pitched yet. Be the first to propose an activity!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className={`surface-card p-5 rounded-3xl border bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    sug.status === 'accepted'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : sug.status === 'rejected'
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {sug.type}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{sug.title}</h4>
                      {sug.cost && (
                        <span className="text-xs font-mono font-bold text-slate-700">
                          ₹{sug.cost.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {sug.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{sug.description}</p>
                    )}

                    <span className="text-[11px] text-slate-400 block">
                      Proposed by <strong>{sug.suggestedBy}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {sug.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => acceptSuggestion(sug.id)}
                          className="btn-primary text-xs !py-1.5 px-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Add</span>
                        </button>
                        <button
                          onClick={() => rejectSuggestion(sug.id)}
                          className="btn-secondary text-xs !py-1.5 px-3 font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                          sug.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sug.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: MEMBERS & INVITATION ─── */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#0B1220]">Invite Co-Traveller</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Permission Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="input-field text-xs py-2"
                >
                  <option value="editor">Editor (Can suggest & edit)</option>
                  <option value="viewer">Viewer (View-only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Send Invite</span>
              </button>
            </div>
          </form>

          {/* Members List */}
          <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-sm text-[#0B1220] pb-2 border-b border-slate-100">
              Trip Members ({sharedMembers.length})
            </h3>

            <div className="space-y-2.5">
              {sharedMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0B1220] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                      <span className="text-xs text-slate-500">{member.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                      member.role === 'owner' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-200 text-slate-800 border-slate-300'
                    }`}>
                      {member.role}
                    </span>
                    {member.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => removeSharedMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ACTIVITY LOG ─── */}
      {activeTab === 'activity' && (
        <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Recent Trip Modifications & History
          </h3>

          <div className="space-y-3">
            {tripActivityLog.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 flex-shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      <strong>{log.actor}</strong> {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-600">{log.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: GROUP DISCUSSION ─── */}
      {activeTab === 'chat' && (
        <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" /> Co-Traveller Discussion Thread
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {tripComments.map((cmt) => (
              <div key={cmt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{cmt.authorName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{cmt.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendComment} className="flex gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Ask a question or leave a note for the group..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field text-xs py-2 flex-1"
            />
            <button type="submit" className="btn-primary text-xs !py-2 px-4 font-bold shadow-xs flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

