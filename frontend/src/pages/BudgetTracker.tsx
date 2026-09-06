import React, { useState } from 'react';
import {
  Wallet,
  TrendingDown,
  Receipt,
  Users,
  DollarSign,
  Bell,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { BudgetOverviewCard } from '../components/Budget/BudgetOverviewCard';
import { CategoryBreakdownSection } from '../components/Budget/CategoryBreakdownSection';
import { BudgetOptimizerSection } from '../components/Budget/BudgetOptimizerSection';
import { ExpenseTrackerSection } from '../components/Budget/ExpenseTrackerSection';
import { GroupSplitSection } from '../components/Budget/GroupSplitSection';
import { CurrencyConverterCard } from '../components/Budget/CurrencyConverterCard';
import { PriceAlertsSection } from '../components/Budget/PriceAlertsSection';
import { Link } from 'react-router-dom';
import { useTravelSettings } from '../context/TravelSettingsContext';

type BudgetHubTab = 'overview' | 'optimizer' | 'expenses' | 'splitting' | 'currency' | 'alerts';

export const BudgetTracker: React.FC = () => {
  const { destination, budget, plannedCost, remainingBudget, isDraftEmpty } = useTripBuilder();
  const { t } = useTravelSettings();
  const [activeTab, setActiveTab] = useState<BudgetHubTab>('overview');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb / Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Link to="/trip-builder" className="hover:text-[#0B1220] transition-colors">
                {t('builder.title', 'Trip Builder')}
              </Link>
              <span>/</span>
              <span className="text-[#C8A96B] font-bold">{t('budget.financial_intel', 'Financial Intelligence')}</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B1220] tracking-tight">
              {destination ? `${destination} ${t('budget.money_hub', 'Budget & Money Hub')}` : t('budget.travel_money_hub', 'Travel Budget & Money Hub')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('budget.hub_subtitle', 'One synchronized source of truth for planning, tracking, and optimizing your travel money.')}
            </p>
          </div>

          <Link
            to="/trip-builder"
            className="btn-secondary text-xs !py-2 px-4 font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" />
            <span>{t('budget.open_builder', 'Open Trip Builder Workspace')}</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          {[
            { id: 'overview', label: t('budget.tab_overview', '📊 Budget Overview'), count: undefined },
            { id: 'optimizer', label: t('budget.tab_optimizer', '⚡ AI Optimizer'), count: t('budget.swaps_count', '3 Swaps') },
            { id: 'expenses', label: t('budget.tab_expenses', '🧾 Confirmed Expenses'), count: undefined },
            { id: 'splitting', label: t('budget.tab_splitting', '👥 Group Split'), count: undefined },
            { id: 'currency', label: t('budget.tab_currency', '💱 Currency Converter'), count: undefined },
            { id: 'alerts', label: t('budget.tab_alerts', '🔔 Price Watch'), count: undefined },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as BudgetHubTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#0B1220] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === tab.id ? 'bg-emerald-400 text-slate-900 font-black' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="space-y-8 animate-fade-in">
          {activeTab === 'overview' && (
            <>
              <BudgetOverviewCard />
              <CategoryBreakdownSection />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CurrencyConverterCard />
                <PriceAlertsSection />
              </div>
            </>
          )}

          {activeTab === 'optimizer' && (
            <>
              <BudgetOptimizerSection />
              <CategoryBreakdownSection />
            </>
          )}

          {activeTab === 'expenses' && (
            <>
              <BudgetOverviewCard />
              <ExpenseTrackerSection />
            </>
          )}

          {activeTab === 'splitting' && (
            <>
              <GroupSplitSection />
              <ExpenseTrackerSection />
            </>
          )}

          {activeTab === 'currency' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <CurrencyConverterCard />
              <BudgetOverviewCard />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <PriceAlertsSection />
              <BudgetOptimizerSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
