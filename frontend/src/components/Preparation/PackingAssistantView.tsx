import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  CloudSun,
  ShieldCheck,
  Users,
  Check,
  Filter,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { PackingItem, PackingCategory } from '../../types';
import { generateSmartPackingList } from '../../utils/packingIntelligence';

export const PackingAssistantView: React.FC = () => {
  const {
    destination,
    tripNights,
    travelStyle,
    interests,
    selectedActivities,
    sharedMembers,
    packingList,
    togglePackingItem,
    addPackingItem,
    removePackingItem,
  } = useTripBuilder();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeAssignee, setActiveAssignee] = useState<string>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>('Clothing');
  const [newItemAssignee, setNewItemAssignee] = useState<string>('Shared Gear');

  const categories: PackingCategory[] = [
    'Clothing',
    'Toiletries',
    'Electronics',
    'Documents',
    'Health & Personal Care',
    'Weather Gear',
    'Activity Gear',
    'Travel Accessories',
    'Sun & Rain',
    'Footwear',
    'Swim & Water',
    'Hiking & Gear',
    'Other',
  ];

  const totalItems = packingList.length;
  const packedCount = packingList.filter((item) => item.checked).length;
  const progressPercentage = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;
  const isAllPacked = totalItems > 0 && packedCount === totalItems;

  const filteredItems = useMemo(() => {
    return packingList.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (activeAssignee !== 'all' && (item.assignedTo || 'Shared Gear') !== activeAssignee) return false;
      return true;
    });
  }, [packingList, activeCategory, activeAssignee]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addPackingItem(newItemName.trim(), newItemCategory as any, false);
    setNewItemName('');
  };

  const handleMarkAllComplete = () => {
    packingList.forEach((item) => {
      if (!item.checked) {
        togglePackingItem(item.id);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>WEATHER & ACTIVITY AWARE PACKING</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight">
            Packing Assistant for {destination}
          </h2>
          <p className="text-xs text-slate-300">
            Duration: <strong>{tripNights || 4} Nights</strong> • Style: <strong className="capitalize text-[#C8A96B]">{travelStyle}</strong> • Activity-matched gear.
          </p>
        </div>

        {/* Packing Progress Ring / Card */}
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Progress</span>
            <span className="font-black text-sm text-white">
              {packedCount} / {totalItems} Packed
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllPacked ? 'bg-emerald-400' : 'bg-[#C8A96B]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-[#C8A96B]">{progressPercentage}% Ready</span>
            {isAllPacked ? (
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">
                ✓ Packing Complete
              </span>
            ) : (
              <button
                type="button"
                onClick={handleMarkAllComplete}
                className="text-[10px] font-bold text-slate-300 hover:text-white underline"
              >
                Mark All Packed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Item Bar */}
      <form
        onSubmit={handleAddItem}
        className="surface-card p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3"
      >
        <input
          type="text"
          placeholder="Add custom packing item (e.g. GoPro extra battery, Linen shirt...)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none"
        />

        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as any)}
          className="w-full sm:w-44 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full sm:w-auto btn-primary text-xs !py-2.5 px-5 font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </form>

      {/* Filter Tabs: Categories & Shared Travellers */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeCategory === 'all'
                ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Items ({packingList.length})
          </button>
          {categories.map((cat) => {
            const count = packingList.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Packing Items Grid */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePackingItem(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  item.checked
                    ? 'bg-emerald-50/70 border-emerald-300/80 text-slate-600'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <span
                      className={`text-xs font-bold block truncate ${
                        item.checked ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.reason && (
                      <span className="text-[10px] text-slate-500 block leading-tight truncate">
                        💡 {item.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePackingItem(item.id);
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Copilot Packing Shortcuts */}
      <div className="surface-card p-6 rounded-3xl bg-[#0B1220] text-white shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8A96B]" />
          <h3 className="font-bold text-sm text-white">Ask AI Copilot About Packing</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {[
            'Will I need a rain jacket in Goa?',
            'What should I pack for water sports?',
            'Make my packing list lighter for 4 days',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => alert(`Copilot query: "${prompt}". Check the AI Assistant.`)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-left border border-white/10 transition-colors"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
