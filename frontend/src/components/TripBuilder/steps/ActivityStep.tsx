import React, { useState } from 'react';
import { Compass, Star, Clock, Check, Plus, ShieldCheck, ChevronRight, Sparkles, X } from 'lucide-react';
import { useTripBuilder, SelectedActivity } from '../../../context/TripBuilderContext';
import { useTravelSettings } from '../../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../Common/CurrencyDisplay';

const ACTIVITIES_POOL: Record<string, SelectedActivity[]> = {
  Goa: [
    {
      id: 'act-goa-scuba',
      name: 'Grande Island Scuba Diving & Dolphin Sightseeing',
      destination: 'Goa',
      category: 'Water Sports',
      duration: '5 Hours',
      rating: 4.9,
      price: 2499,
      image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
      description: 'PADI-certified underwater diving with equipment, boat transfer, dolphin spotting, and GoPro HD video.',
    },
    {
      id: 'act-goa-cruise',
      name: 'Mandovi Luxury Sunset River Cruise & Live DJ',
      destination: 'Goa',
      category: 'Cruises',
      duration: '2.5 Hours',
      rating: 4.8,
      price: 999,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      description: 'Panoramic river sunset cruise with traditional Goan folk dance performances, DJ music, and welcome drinks.',
    },
    {
      id: 'act-goa-watersports',
      name: 'Baga Beach 5-in-1 Combo Water Sports',
      destination: 'Goa',
      category: 'Water Sports',
      duration: '3 Hours',
      rating: 4.7,
      price: 1850,
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      description: 'Parasailing with dip, Jet Ski, Banana ride, Bumper ride, and Speed boat cruise with certified safety crew.',
    },
    {
      id: 'act-goa-heritage',
      name: 'Fontainhas Latin Quarter Heritage & Bakery Walk',
      destination: 'Goa',
      category: 'Culture',
      duration: '2.5 Hours',
      rating: 4.9,
      price: 650,
      image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
      description: 'Guided architectural walk across vibrant 18th-century Portuguese streets with artisanal bakery tastings.',
    },
    {
      id: 'act-goa-spices',
      name: 'Sahakari Organic Spice Plantation & Traditional Buffet Lunch',
      destination: 'Goa',
      category: 'Food & Culinary',
      duration: '4 Hours',
      rating: 4.8,
      price: 850,
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      description: 'Guided aromatic spice garden tour with botanical briefing, betelnut demonstration, and authentic Goan feast.',
    },
    {
      id: 'act-goa-club',
      name: 'VIP Club Entry & Sunset Cocktail Lounge Experience',
      destination: 'Goa',
      category: 'Nightlife',
      duration: '4 Hours',
      rating: 4.6,
      price: 1500,
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      description: 'Reserved VIP table access, welcome cocktails, and ocean sunset vibes at premier cliffside venues.',
    },
  ],
  Dubai: [
    {
      id: 'act-dxb-safari',
      name: 'Premium Red Dune Desert Safari with BBQ Dinner',
      destination: 'Dubai',
      category: 'Adventure',
      duration: '6 Hours',
      rating: 4.9,
      price: 3450,
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      description: '4x4 dune bashing in Lahbab desert, sandboarding, camel ride, Tanoura dance show, and 5★ buffet dinner.',
    },
    {
      id: 'act-dxb-burj',
      name: 'Burj Khalifa At The Top (124th & 125th Floor)',
      destination: 'Dubai',
      category: 'Sightseeing',
      duration: '2 Hours',
      rating: 4.9,
      price: 3890,
      image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop&q=80',
      description: 'Panoramic 360-degree observation deck views of Dubai skyline with high-speed elevator journey.',
    },
  ],
};

export const ActivityStep: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    destination,
    travellers,
    selectedActivities,
    toggleActivity,
    removeActivity,
    skipActivities,
    goToNextStep,
    goToPrevStep,
  } = useTripBuilder();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const destKey = ACTIVITIES_POOL[destination] ? destination : 'Goa';
  const availableActivities = ACTIVITIES_POOL[destKey] || ACTIVITIES_POOL['Goa'];

  const filteredActivities = availableActivities.filter((act) => {
    if (activeCategory === 'all') return true;
    return act.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const categories = ['all', 'Water Sports', 'Cruises', 'Culture', 'Food & Culinary', 'Nightlife', 'Adventure'];

  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'all': return t('step.activity.filter_all', 'All Experiences');
      case 'water sports': return t('step.activity.filter_water', 'Water Sports');
      case 'cruises': return t('step.activity.filter_cruises', 'Cruises');
      case 'culture': return t('step.activity.filter_culture', 'Culture & Heritage');
      case 'food & culinary': return t('step.activity.filter_food', 'Food & Culinary');
      case 'nightlife': return t('step.activity.filter_nightlife', 'Nightlife');
      case 'adventure': return t('step.activity.filter_adventure', 'Adventure');
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-0.5">
            {t('step.activity.header_step', 'Step 4 of 6 • Curated Experiences & Excursions')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
            {t('step.activity.question', { destination }, `Add Activities & Things to Do in ${destination}`)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('step.activity.subtitle', { count: selectedActivities.length }, `${selectedActivities.length} Experiences selected • Add top-rated water sports, sunset cruises, or food tours.`)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevStep}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('step.activity.back_transport', '← Back to Transport')}
          </button>
          <button
            type="button"
            onClick={selectedActivities.length > 0 ? goToNextStep : skipActivities}
            className="btn-primary text-xs !py-2 px-4.5 font-bold shadow-sm flex items-center gap-1.5"
          >
            <span>
              {selectedActivities.length > 0
                ? t('sidebar.continue_to', { step: t('step.itinerary', 'Itinerary') }, 'Continue to Itinerary')
                : t('step.activity.skip', 'Skip for now →')}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── SELECTED ACTIVITIES SUMMARY RIBBON / EMPTY STATE ─── */}
      {selectedActivities.length > 0 ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-md text-slate-900 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {t('step.activity.experiences_added', { count: selectedActivities.length }, `${selectedActivities.length} Experiences Added ✓`)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('common.for_travellers', { count: travellers }, `For ${travellers} ${travellers > 1 ? 'Guests' : 'Guest'}`)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('step.review.activities_cost', 'Total Activities')}</span>
              <CurrencyDisplay
                amount={selectedActivities.reduce((acc, a) => acc + a.price * travellers, 0)}
                className="text-sm font-black text-slate-900"
              />
            </div>
          </div>

          {/* Activity Pills with individual removal */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
            {selectedActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 group hover:border-slate-300 transition-all"
              >
                <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{act.name}</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (<CurrencyDisplay amount={act.price * travellers} />)
                </span>
                <button
                  type="button"
                  onClick={() => removeActivity(act.id)}
                  className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                  title={t('step.activity.remove_item', { name: act.name }, `Remove ${act.name}`)}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">{t('step.activity.empty_title', 'No Activities Added')}</span>
              <span className="text-[11px] text-slate-500">{t('step.activity.empty_desc', 'Pick from curated water sports, cultural walks, sunset cruises, or food tours below.')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={skipActivities}
            className="btn-secondary text-xs font-bold py-1.5 px-3 whitespace-nowrap"
          >
            {t('step.activity.skip', 'Skip Activities →')}
          </button>
        </div>
      )}

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#0B1220] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredActivities.map((activity) => {
          const isAdded = selectedActivities.some((a) => a.id === activity.id);

          return (
            <div
              key={activity.id}
              className={`surface-card rounded-2xl overflow-hidden transition-all bg-white flex flex-col justify-between ${
                isAdded ? 'border-[#0B1220] ring-2 ring-[#0B1220]/10 shadow-md' : 'hover:border-slate-300'
              }`}
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={activity.image_url}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#0B1220]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {getCategoryLabel(activity.category)}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md text-[#0B1220] text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{activity.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{activity.duration}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0B1220] line-clamp-2">{activity.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{activity.description}</p>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('step.activity.per_person', 'Per Person')}</span>
                  <CurrencyDisplay amount={activity.price} className="text-base font-black text-[#0B1220]" />
                </div>

                <button
                  type="button"
                  onClick={() => toggleActivity(activity)}
                  className={`text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isAdded
                      ? 'bg-[#158A6A] hover:bg-rose-600 text-white shadow-xs group/btn'
                      : 'btn-secondary hover:bg-slate-200'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                      <X className="w-3.5 h-3.5 hidden group-hover/btn:inline-block" />
                      <span className="group-hover/btn:hidden">{t('step.activity.added_short', 'Added')}</span>
                      <span className="hidden group-hover/btn:inline-block">{t('step.activity.remove', 'Remove')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('step.activity.add', 'Add to Trip')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
