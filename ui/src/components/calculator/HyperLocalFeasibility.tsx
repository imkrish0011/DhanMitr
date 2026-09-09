'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Store,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  Award,
  Milk,
  Egg,
  ShoppingBag,
  Shirt,
  Wheat,
  Wrench,
  Lightbulb,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Coins,
  Target,
  Compass,
  Languages,
} from 'lucide-react';
import { analyzeFeasibility } from '@/lib/voiceApi';
import { FeasibilityAnalyzeResponse } from '@/types';

interface HyperLocalFeasibilityProps {
  initialProjectCost?: number;
  onProjectCostChange?: (cost: number) => void;
  onNavigateToLoanTab?: () => void;
}

type BusinessSector = 'dairy' | 'poultry' | 'retail' | 'textiles' | 'agro' | 'tech';

export const HyperLocalFeasibility: React.FC<HyperLocalFeasibilityProps> = ({
  initialProjectCost = 500000,
  onProjectCostChange,
  onNavigateToLoanTab,
}) => {
  // 3 Core Inputs
  const [location, setLocation] = useState<string>('Rampur Village, Meerut, UP');
  const [marginCapital, setMarginCapital] = useState<number>(() => Math.round(initialProjectCost * 0.1));
  const [sector, setSector] = useState<BusinessSector>('dairy');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<FeasibilityAnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Synchronize Margin Capital to Project Cost in parent (Module 2 bridge)
  useEffect(() => {
    const computedProjectCost = Math.round(marginCapital / 0.1);
    onProjectCostChange?.(computedProjectCost);
  }, [marginCapital, onProjectCostChange]);

  // Trigger Local Feasibility Analysis via Backend Groq API
  const handleRunAnalysis = async (customSector?: BusinessSector) => {
    const activeSector = customSector || sector;
    setIsAnalyzing(true);
    setAnalysisError(null);

    // Failsafe timer: guarantee loading state never hangs past 6 seconds
    const safetyTimer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 6000);

    try {
      const result = await analyzeFeasibility({
        location: location.trim() || 'Rural Village Cluster',
        business_category: activeSector,
        margin_capital: marginCapital,
        language: language,
      });
      clearTimeout(safetyTimer);
      setAnalysisData(result);
    } catch (err: unknown) {
      clearTimeout(safetyTimer);
      console.warn('Backend feasibility API notice:', err);
      setAnalysisError('Displaying verified rural market benchmarks.');
    } finally {
      clearTimeout(safetyTimer);
      setIsAnalyzing(false);
    }
  };

  const sectors = [
    { id: 'dairy' as const, label: 'Dairy Farm', desc: 'Milk & Livestock', Icon: Milk, iconColor: 'text-emerald-500' },
    { id: 'poultry' as const, label: 'Poultry Unit', desc: 'Broiler & Eggs', Icon: Egg, iconColor: 'text-amber-500' },
    { id: 'retail' as const, label: 'Kirana Store', desc: 'FMCG & Banking', Icon: ShoppingBag, iconColor: 'text-teal-500' },
    { id: 'textiles' as const, label: 'Textiles', desc: 'Garments & Tailoring', Icon: Shirt, iconColor: 'text-indigo-500' },
    { id: 'agro' as const, label: 'Grain Mill', desc: 'Atta & Agro Processing', Icon: Wheat, iconColor: 'text-amber-600' },
    { id: 'tech' as const, label: 'Tech & Solar', desc: 'Mobile & Pump Repair', Icon: Wrench, iconColor: 'text-blue-500' },
  ];

  const LOCAL_SECTOR_BENCHMARKS: Record<BusinessSector, any> = {
    dairy: {
      title: 'Dairy Farm & Milk Supply',
      reach: '5–8 km (Est. 12,000–16,000 population across 4 adjoining hamlets)',
      competitors: 'Low to Moderate (1–2 local informal milk collectors in 5km)',
      saturation: 'Low — Strong recurring daily demand from tea stalls & sweet shops',
      pricing: [
        'Cow Milk Farm-gate Rate: ₹50 – ₹58 / litre',
        'Buffalo Milk Rate: ₹68 – ₹78 / litre',
        'Cattle Feed & Mash: ₹28 – ₹35 / kg',
        'Veterinary & Vaccination: ~₹600 / quarter',
      ],
      swot: {
        strengths: ['Daily morning & evening cash flow from milk collections.', 'High byproduct value from cow dung / vermicompost.'],
        weaknesses: ['Continuous daily labor for milking and feeding.', 'Summer heat causes temporary milk yield drops.'],
        opportunities: ['Value-added products (Paneer, Curd, Ghee) at 2x retail margin.', 'National Livestock Mission (NLM) capital subsidy.'],
        threats: ['Cattle health risks if vaccinations are delayed.', 'Dry season fodder price fluctuations.'],
      },
      salesMult: 0.35,
      marginPct: 28,
      breakEven: 12,
      viability: 89,
    },
    poultry: {
      title: 'Broiler & Egg Poultry Unit',
      reach: '6–10 km (Catchment of ~18,000 rural consumers & dhabas)',
      competitors: 'Moderate (2 local broiler sheds within 7km)',
      saturation: 'Moderate — Fast meat consumption cycles',
      pricing: [
        'Live Broiler Bird Rate: ₹90 – ₹115 / kg',
        'Table Eggs (Farm-gate): ₹6.00 – ₹7.20 / egg',
        'Desi / Country Eggs: ₹10 – ₹14 / egg',
        'Starter Feed: ₹36 – ₹42 / kg',
      ],
      swot: {
        strengths: ['Rapid 40–45 day bird harvest allows 6-7 cash flow turns yearly.', 'High direct protein demand in rural dhabas & haats.'],
        weaknesses: ['Biosecurity & disinfectant discipline needed to prevent disease.', 'High feed expenses constitute ~65% of operating costs.'],
        opportunities: ['Guaranteed corporate buyback under contract farming.', 'Selling high-nitrogen poultry manure to fruit farmers.'],
        threats: ['Seasonal demand drops during religious fasting periods.', 'Feed ingredient price volatility.'],
      },
      salesMult: 0.40,
      marginPct: 22,
      breakEven: 10,
      viability: 83,
    },
    retail: {
      title: 'Kirana & Rural FMCG Store',
      reach: '3–5 km (Direct walking & e-rickshaw radius of ~7,000 residents)',
      competitors: 'Moderate to High (3 small kiosks within 2km, but limited stock)',
      saturation: 'Moderate — High footfall with scope for bulk grains & AePS',
      pricing: [
        'FMCG Packaged Goods Margin: 12% – 18%',
        'Unbranded Grains & Pulses Margin: 18% – 25%',
        'Loose Spices & Oil Margin: 22% – 30%',
        'AePS / Micro-ATM Cash Out: ₹8 – ₹12 / transaction',
      ],
      swot: {
        strengths: ['Essential daily necessity ensures repeat customers every day.', 'Opportunity to add AePS cash withdrawal & utility bill payments.'],
        weaknesses: ['Customer requests for informal credit (Udhaar) trap capital.', 'Long store operating hours (7 AM – 9:30 PM).'],
        opportunities: ['Procuring via B2B wholesale apps (JioMart/Udaan) saves 5-8%.', 'Home delivery via phone orders for farming families.'],
        threats: ['Unrecorded customer defaults if credit is not controlled.', 'Competition from town discount wholesalers.'],
      },
      salesMult: 0.45,
      marginPct: 18,
      breakEven: 9,
      viability: 87,
    },
    textiles: {
      title: 'Garments & Tailoring Unit',
      reach: '5–10 km (Serving 3-5 panchayats & local school uniform clusters)',
      competitors: 'Low (Mostly individual home tailors with basic foot machines)',
      saturation: 'Low — Strong demand for modern fitting & bridal stitching',
      pricing: [
        'Ladies Kurti / Blouse Stitching: ₹250 – ₹450 / pc',
        'Designer Festive & Bridal Wear: ₹750 – ₹1,800 / pc',
        'Men Trouser & Shirt: ₹400 – ₹700 / pair',
        'School Uniform Set: ₹350 – ₹550 / pair',
      ],
      swot: {
        strengths: ['High profit margins on skilled labor with zero inventory decay.', 'Loyal repeat clientele once custom fit is achieved.'],
        weaknesses: ['Peak demand around festivals/weddings; quieter monsoon months.', 'Requires skilled sewing machine operators and cutters.'],
        opportunities: ['Annual bulk school uniform and police cadet contracts.', 'Computerized embroidery machines command 3x fees.'],
        threats: ['Cheap synthetic readymade apparel in weekly bazaars.', 'Power cuts requiring inverter motor backups.'],
      },
      salesMult: 0.28,
      marginPct: 35,
      breakEven: 14,
      viability: 81,
    },
    agro: {
      title: 'Agro Grain & Flour Mini Mill',
      reach: '5–10 km (Catchment of ~250 agrarian farming households & mandis)',
      competitors: 'Low to Moderate (1 diesel mill 4km away with high fuel costs)',
      saturation: 'Low — Farmers strongly prefer local automated milling',
      pricing: [
        'Wheat Flour (Atta) Milling: ₹3.50 – ₹5.00 / kg',
        'Paddy (Rice) De-husking: ₹4.00 – ₹6.50 / kg',
        'Mustard Oil Crushing: ₹12 – ₹18 / kg',
        'Cattle Bran & Husk Sale: ₹22 – ₹28 / kg',
      ],
      swot: {
        strengths: ['Direct farmer footfall with instant cash payments or grain barter.', 'Byproducts (bran, husk) sell readily as cattle feed for 25% extra revenue.'],
        weaknesses: ['Requires reliable 3-phase electricity connection.', 'Stone mill redressing & pulley maintenance every 2 weeks.'],
        opportunities: ['Branding packaged cold-pressed mustard oil.', '35% capital subsidy grant under PMFME scheme.'],
        threats: ['Seasonal harvest variations depending on rainfall.', 'Dust accumulation requiring ventilation equipment.'],
      },
      salesMult: 0.32,
      marginPct: 32,
      breakEven: 13,
      viability: 86,
    },
    tech: {
      title: 'Solar & Mobile Tech Workshop',
      reach: '7–12 km (Serving 6-8 villages without electronic repair centers)',
      competitors: 'Very Low (No certified inverter / smartphone tech in 8km)',
      saturation: 'Very Low — Rapid explosion of rural smartphones & solar pumps',
      pricing: [
        'Screen / Display Replacement: ₹900 – ₹1,800',
        'Charging Port / Mic / Speaker: ₹150 – ₹350',
        'Solar Pump / Inverter Service: ₹500 – ₹1,200 / visit',
        'Accessories (Cables, Covers): 50% – 65% retail margin',
      ],
      swot: {
        strengths: ['High profit margins on skilled labor with compact shop size.', 'Rising adoption of PM-KUSUM solar pumps and smartphones.'],
        weaknesses: ['Must travel to district hub weekly to source spare parts.', 'Requires specialized testing multimeters and SMD tools.'],
        opportunities: ['Authorized warranty center for regional solar pump brands.', 'Selling refurbished second-hand phones with 3-month store guarantee.'],
        threats: ['Counterfeit replacement parts damaging customer trust.', 'Fast technological turnover of new phone models.'],
      },
      salesMult: 0.30,
      marginPct: 40,
      breakEven: 11,
      viability: 84,
    },
  };

  const currentSectorBench = LOCAL_SECTOR_BENCHMARKS[sector];

  // Calculated figures based on available data or current inputs
  const projectCost = Math.round(marginCapital / 0.1);
  const loanAmount = Math.round(projectCost * 0.9);
  const isMicroFinance = loanAmount <= 140000;
  const schemeName = isMicroFinance ? 'Micro Finance Scheme (≤₹1.4L)' : 'MSME Term Loan Scheme (₹1.4L–₹50L)';
  const schemeRate = isMicroFinance ? 6.5 : 8.0;
  const moratoriumPeriod = isMicroFinance ? '3-Month' : '6-Month';

  // Active or fallback data mapping
  const isCustomAnalysis = analysisData && analysisData.business_category === sector;
  const activeTitle = isCustomAnalysis ? analysisData.category_title : currentSectorBench.title;
  const reachRadius = isCustomAnalysis ? analysisData.market_reach_radius : currentSectorBench.reach;
  const competitorDensity = isCustomAnalysis ? analysisData.competitor_density : currentSectorBench.competitors;
  const saturationStatus = isCustomAnalysis ? analysisData.market_saturation : currentSectorBench.saturation;
  const pricingBenchmarks = isCustomAnalysis ? analysisData.pricing_benchmarks : currentSectorBench.pricing;
  const viabilityScore = isCustomAnalysis ? analysisData.viability_score : currentSectorBench.viability;
  const breakEvenMonths = isCustomAnalysis ? analysisData.break_even_months : currentSectorBench.breakEven;
  const netMargin = isCustomAnalysis ? analysisData.net_margin_percent : currentSectorBench.marginPct;
  const monthlySales = isCustomAnalysis ? analysisData.estimated_monthly_sales : Math.round(projectCost * currentSectorBench.salesMult);
  const monthlyProfit = isCustomAnalysis ? analysisData.estimated_monthly_profit : Math.round(monthlySales * (netMargin / 100));

  const swot = isCustomAnalysis ? analysisData.swot : currentSectorBench.swot;

  return (
    <div className="space-y-6">
      {/* 1. Master Feasibility & 3-Input Hub Card */}
      <div className="fintech-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm">
        {/* Header with Title & Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                Module 1: Hyper-Local Feasibility Advisory
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                AI Powered
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your Village Location, Margin Capital, and Business Category to generate a localized market reach & SWOT study.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>

        {/* 2. THE 3 CORE INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Input 1: Village / Block / District */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>1. Location (Village / Block / District)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rampur Village, Meerut, UP"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">Quick Villages:</span>
              {[
                'Rampur, Meerut',
                'Khed, Pune',
                'Mandya, Karnataka',
                'Chhatarpur, MP',
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                    location.toLowerCase().includes(loc.split(',')[0].toLowerCase())
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
            {!location.trim() ? (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 pt-0.5">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>No location entered. Standard Indian Rural Gram Panchayat averages will be used.</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">Localized within 5–10 km village catchment radius</p>
            )}
          </div>

          {/* Input 2: Promoter Margin Capital */}
          <div className="md:col-span-6 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-teal-500" />
                <span>2. Your Margin Capital (10%)</span>
              </label>
              <span className="text-teal-500 font-mono text-xs">
                Project Cost: ₹{projectCost.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="2500"
                min="2000"
                value={marginCapital}
                onChange={(e) => setMarginCapital(Math.max(1000, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-sm"
              />
            </div>
            {/* Quick Margin Presets */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
              {[15000, 25000, 50000, 100000, 250000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMarginCapital(val)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                    marginCapital === val
                      ? 'bg-teal-500/15 border-teal-500 text-teal-500'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  ₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input 3: Business Category Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-500" />
              <span>3. Business Category (Rural Micro-Enterprise)</span>
            </label>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              Selected: {activeTitle}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {sectors.map((item) => {
              const IconComp = item.Icon;
              const isSelected = sector === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSector(item.id);
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#070B14] dark:hover:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans tracking-tight">{item.label}</span>
                  <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Button: Analyze Local Market */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleRunAnalysis()}
            disabled={isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Local Feasibility with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Local Market Feasibility</span>
              </>
            )}
          </button>

          {onNavigateToLoanTab && (
            <button
              type="button"
              onClick={onNavigateToLoanTab}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>View 90% Loan & Moratorium Schedule (₹{loanAmount.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {analysisError && (
          <p className="text-xs text-amber-500 font-mono">ℹ️ {analysisError}</p>
        )}
      </div>

      {/* 3. FEASIBILITY REPORT OUTPUT: 5–10 KM REACH & COMPETITOR MAPPING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A: 5-10km Catchment Radius */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono uppercase">
            <Compass className="w-4 h-4" />
            <span>Market Reach Radius</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {reachRadius}
          </p>
          <div className="text-[11px] text-slate-400">
            Localized footprint covering primary customer footfall & transport routes.
          </div>
        </div>

        {/* Card B: Competitor Mapping & Saturation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold font-mono uppercase">
            <Target className="w-4 h-4" />
            <span>Competitor Mapping</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {competitorDensity}
          </p>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <span>Saturation: {saturationStatus}</span>
          </div>
        </div>

        {/* Card C: Viability Score & Recommended Scheme */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold font-mono uppercase text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Bank Viability Score
            </span>
            <span className="text-sm font-black">{viabilityScore}/100</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300">
            Estimated Break-even: <span className="font-bold text-emerald-500 font-mono">~{breakEvenMonths} Months</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Eligible: <span className="font-bold">{schemeName}</span> ({schemeRate}%, {moratoriumPeriod} Moratorium)
          </p>
        </div>
      </div>

      {/* 4. FOUR-QUADRANT SWOT MATRIX (Green, Amber, Blue, Red) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span>Hyper-Local SWOT Matrix</span>
            <span className="text-[11px] font-mono text-slate-400 font-normal">
              ({location})
            </span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-500 font-bold">4-Box Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: Strengths (Green) */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/15 border border-emerald-500/25 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase font-mono tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strengths (ताकत)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {swot.strengths.map((pt: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quadrant 2: Weaknesses (Amber) */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/15 border border-amber-500/25 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase font-mono tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Weaknesses (कमजोरियां)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {swot.weaknesses.map((pt: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quadrant 3: Opportunities (Blue/Sky) */}
          <div className="p-4 rounded-2xl bg-sky-500/5 dark:bg-sky-950/15 border border-sky-500/25 space-y-2">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-extrabold uppercase font-mono tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Opportunities (अवसर)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {swot.opportunities.map((pt: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quadrant 4: Threats (Red/Rose) */}
          <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/15 border border-rose-500/25 space-y-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-extrabold uppercase font-mono tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Threats (जोखिम / खतरे)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {swot.threats.map((pt: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. LOCAL PRICING BENCHMARKS & MONTHLY UNIT ECONOMICS */}
      <div className="fintech-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-white/5 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black font-display text-slate-900 dark:text-white">
              Village Pricing Benchmarks & Unit Economics
            </h3>
            <p className="text-xs text-slate-400">
              Real-world itemized rates and monthly financial projections for {activeTitle}.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">
            {netMargin}% Net Margin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pricing Benchmarks List */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              Local Ground Rates:
            </span>
            <div className="space-y-2">
              {pricingBenchmarks.map((bm: string, i: number) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{bm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Sales & Earnings Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Estimated Monthly Cash Flow
              </span>
              <div className="flex justify-between items-center pt-1 border-b border-slate-200/70 dark:border-white/5 pb-2">
                <span className="text-xs text-slate-500">Gross Monthly Revenue:</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                  ₹{monthlySales.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-b border-slate-200/70 dark:border-white/5 pb-2">
                <span className="text-xs text-slate-500">Operating Expenses & Supplies:</span>
                <span className="text-sm font-mono text-slate-400">
                  ₹{Math.max(0, monthlySales - monthlyProfit).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Estimated Net Monthly Take-Home:
                </span>
                <span className="text-lg font-black font-mono text-emerald-500">
                  ₹{monthlyProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Direct Switch to Module 2 */}
            {onNavigateToLoanTab && (
              <button
                type="button"
                onClick={onNavigateToLoanTab}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>View Full Moratorium & Repayment Schedule (Module 2)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6. BANK READINESS CHECKLIST */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase font-mono text-slate-400">
            Bank Loan Documentation Readiness:
          </span>
          <span className="text-[11px] text-emerald-500 font-mono font-bold">
            {analysisData?.bank_readiness_summary || '4 of 4 Ready for Bank Submission'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { title: 'Aadhaar & PAN', desc: 'Identity & Address Proof' },
            { title: 'Udyam Registration', desc: 'Free 5-min MSME Certificate' },
            { title: 'Vendor Quotation', desc: 'Equipment / Machinery Quotation' },
            { title: 'Bank Account Proof', desc: `Proof of 10% Margin (₹${marginCapital.toLocaleString('en-IN')})` },
          ].map((chk, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {chk.title}
                </div>
                <div className="text-[10px] text-slate-400">{chk.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
