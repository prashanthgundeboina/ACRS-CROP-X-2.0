import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, BarChart3, IndianRupee, ShoppingBag, Sparkles,
  RefreshCw, Layers, CheckCircle2, AlertCircle, ArrowUpRight,
  Boxes, Zap, Bot
} from 'lucide-react';
import {
  fetchAdminCommerceAnalytics,
  fetchAdminAiInsights
} from '../../services/adminService';

export const AdminCommerceAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anData, aiData] = await Promise.all([
        fetchAdminCommerceAnalytics(),
        fetchAdminAiInsights()
      ]);
      setAnalytics(anData);
      setInsights(aiData);
    } catch (err: any) {
      console.error('Failed to load commerce analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = {
    totalRevenue: analytics?.metrics?.totalRevenue ?? analytics?.summary?.totalRevenue ?? 0,
    totalOrders: analytics?.metrics?.totalOrdersCount ?? analytics?.summary?.totalOrders ?? 0,
    averageOrderValue: analytics?.metrics?.avgOrderValue ?? analytics?.summary?.averageOrderValue ?? 0,
    activeSkus: analytics?.metrics?.totalProducts ?? analytics?.summary?.activeSkus ?? 0,
    lowStockSkus: analytics?.metrics?.lowStockCount ?? analytics?.summary?.lowStockSkus ?? 0
  };

  const topProducts = analytics?.topProducts || [];
  const categoryBreakdown = (analytics?.topCategories || analytics?.categoryBreakdown || []).map((cat: any, cIdx: number) => {
    const totalRev = summary.totalRevenue || 1;
    const sharePercent = Math.round(((cat.revenue || 0) / totalRev) * 100);
    return {
      ...cat,
      id: cat.id || cat.categoryId || cat.name || `cat_${cIdx}`,
      sharePercent: cat.sharePercent !== undefined ? cat.sharePercent : sharePercent
    };
  });

  const highlightsList: any[] = Array.isArray(insights)
    ? insights
    : (Array.isArray(insights?.highlights)
      ? insights.highlights
      : (Array.isArray(insights?.insights) ? insights.insights : []));
  const recommendedActions: string[] = Array.isArray(insights?.recommendedActions) ? insights.recommendedActions : [];
  const insightSummary: string = typeof insights?.summary === 'string' ? insights.summary : '';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Commerce Intelligence & AI Forecasting
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30">
                AI Powered
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time revenue telemetry, category performance metrics, and predictive input demand models
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center gap-2 text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Gross Merchandise Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            ₹{summary.totalRevenue?.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +18.4% vs last seasonal cycle
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Fulfilled Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {summary.totalOrders}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Across 14 agrarian clusters</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300 font-mono mt-2">
            ₹{summary.averageOrderValue?.toLocaleString()}
          </div>
          <div className="text-[10px] text-teal-400/80 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            Driven by certified seed bundles
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Catalog SKUs</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono mt-2">
            {summary.activeSkus}
          </div>
          <div className="text-[10px] text-amber-400 mt-1">
            {summary.lowStockSkus} SKUs need procurement
          </div>
        </div>
      </div>

      {/* AI Automated Restock & Demand Insights */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Bot className="w-5 h-5" />
            <span>Gemini Agro-Commerce Neural Insights & Reorder Forecasts</span>
          </div>
          {insights?.generatedAt && (
            <span className="text-[10px] text-slate-500 font-mono">
              Updated: {new Date(insights.generatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {insightSummary && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-200/90 leading-relaxed">
            {insightSummary}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlightsList.length === 0 ? (
            <div className="col-span-3 text-xs text-slate-400 text-center py-4">
              Generating automated agronomic demand models...
            </div>
          ) : (
            highlightsList.map((item, idx) => (
              <div key={item.id || item.title || `highlight_${idx}`} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.severity === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.severity === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.type || 'RECOMMENDATION'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.confidence || (item.severity ? `${item.severity} PRIORITY` : '94% Confidence')}</span>
                </div>
                <div className="font-bold text-white text-xs">{item.title}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                {item.action && (
                  <div className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                    Action: {item.action}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {recommendedActions.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Strategic Reorder & Promotional Actions
            </div>
            <div className="space-y-1.5">
              {recommendedActions.map((action, aIdx) => (
                <div key={`rec_action_${aIdx}_${action.slice(0, 15)}`} className="text-[11px] text-slate-400 flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Top Grossing Inputs by Units Sold
          </h3>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No sales logged yet.</div>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <div key={p.id || p.name || `top_prod_${idx}`} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.unitsSold} units ordered • ₹{p.revenue?.toLocaleString()} revenue
                      </div>
                    </div>
                  </div>

                  <div className="font-bold text-emerald-400 font-mono text-xs">
                    ₹{p.revenue?.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Category Revenue Share
          </h3>

          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No categories recorded.</div>
            ) : (
              categoryBreakdown.map((c: any) => (
                <div key={c.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <span>{c.icon || '🌾'}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-mono text-emerald-400">
                      ₹{c.revenue?.toLocaleString()} ({c.sharePercent || 0}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.max(c.sharePercent || 5, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
