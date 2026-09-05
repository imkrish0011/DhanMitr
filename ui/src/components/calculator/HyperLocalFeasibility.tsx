'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Users,
  Building2,
  BarChart3,
  Award,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';

interface HyperLocalFeasibilityProps {
  initialProjectCost?: number;
}

type BusinessSector =
  | 'dairy'
  | 'poultry'
  | 'retail'
  | 'textiles'
  | 'agro'
  | 'tech_services';

type AdminTier = 'village' | 'block' | 'semi_urban';

export const HyperLocalFeasibility: React.FC<HyperLocalFeasibilityProps> = ({
  initialProjectCost = 500000,
}) => {
  // Sector selection
  const [sector, setSector] = useState<BusinessSector>('dairy');

  // Geography & Catchment
  const [adminTier, setAdminTier] = useState<AdminTier>('village');
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Operational Scale & Unit Economics
  const [dailyCustomers, setDailyCustomers] = useState<number>(65);
  const [avgTicketPrice, setAvgTicketPrice] = useState<number>(180);
  const [initialInvestment, setInitialInvestment] = useState<number>(initialProjectCost);

  // Local Competition
  const [existingCompetitors, setExistingCompetitors] = useState<number>(2);

  // Sector Presets and Benchmarks
  const sectorData = useMemo(() => {
    switch (sector) {
      case 'dairy':
        return {
          title: 'Dairy Farming & Milk Chilling Unit',
          defaultUnit: 'liters/day',
          defaultTicket: 65, // Rs per liter/packet
          defaultCustomers: 150, // liters/day or customer points
          grossMarginPct: 24, // 24% gross operating margin
          monthlyOverhead: 18000, // Feed, power, chilling maintenance
          swot: {
            strengths: [
              'Daily non-cyclical cash inflow from milk procurement and retail sales',
              'Direct backward integration with local cattle feed and fodder supply',
              'Government subvention schemes & animal husbandry incentives (DADF)',
            ],
            weaknesses: [
              'Perishable commodity requiring uninterrupted chilling & cold-chain power',
              'Lactation cycles cause seasonal variations in milk volume (dry periods)',
              'High sensitivity to cattle health, vaccination schedules, and vet access',
            ],
            opportunities: [
              'Value addition into Ghee, Paneer, Curd, and Khoya increases margins to 35%+',
              'Direct collection tie-up with national milk federations (Amul, Mother Dairy, Nandini)',
              'Bio-gas / cow dung vermicompost packaging as organic fertilizer byproduct',
            ],
            threats: [
              'Sudden spikes in green fodder and commercial cattle feed prices',
              'Foot-and-mouth or seasonal bovine disease outbreaks',
              'Adulteration rumors or price regulation by local procurement cartels',
            ],
          },
          moatTips: [
            'Install a transparent digital fat/SNF testing machine visible to all dairy farmers',
            'Offer daily morning doorstep delivery to households in 3 km radius',
            'Tie up with local tea stalls and sweet shops for bulk guaranteed off-take',
          ],
        };
      case 'poultry':
        return {
          title: 'Poultry Broiler & Layer Farm',
          defaultUnit: 'birds or egg crates/day',
          defaultTicket: 220, // avg per dressed bird or egg tray
          defaultCustomers: 80,
          grossMarginPct: 21,
          monthlyOverhead: 22000,
          swot: {
            strengths: [
              'Rapid 40–45 day broiler harvest cycle enabling high capital rotation',
              'Consistently high regional protein demand across rural and peri-urban belts',
              'Standardized feed-to-weight conversion ratios and automated drinkers',
            ],
            weaknesses: [
              'Severe bird mortality risk without proper biosecurity and temperature control',
              'Intense odor and fly nuisance requiring location far from village settlement',
              'Extreme price volatility in day-old-chicks (DOC) and maize/soya feed',
            ],
            opportunities: [
              'Contract farming integration with national integrators (Venky’s, Suguna)',
              'Processing and dressed chilled retail counter cutting out local middlemen',
              'Poultry manure composting sold as high-nitrogen organic manure to orchards',
            ],
            threats: [
              'Avian influenza / bird flu rumors leading to immediate localized demand collapse',
              'Summer heat waves causing sudden heat-stroke mortality spikes',
              'Predators and power failure disabling ventilation sheds',
            ],
          },
          moatTips: [
            'Maintain strict closed-curtain biosecurity and vaccinated batch logs for buyers',
            'Establish fixed-supply contracts with local dhabas, caterers, and weekly haats',
            'Adopt contract buy-back model to hedge day-old-chick price shocks',
          ],
        };
      case 'retail':
        return {
          title: 'Rural Kirana & General Consumer Store',
          defaultUnit: 'orders/day',
          defaultTicket: 190,
          defaultCustomers: 120,
          grossMarginPct: 15,
          monthlyOverhead: 12000,
          swot: {
            strengths: [
              'Essential daily household staple demand (flour, oil, pulses, personal care)',
              'High customer loyalty and social community trust in Gram Panchayat',
              'Fast inventory turnover on fast-moving consumer goods (FMCG)',
            ],
            weaknesses: [
              'Heavy working capital lockup in credit book ("Udhaar") leading to cash crunches',
              'Low margins on branded commodities (sugar, edible oils, branded atta)',
              'Space constraints and inventory shrinkage/expiry losses',
            ],
            opportunities: [
              'Introduce WhatsApp catalog ordering and home delivery for elderly/working villagers',
              'Install DigiPay / AePS banking micro-ATM and bill payment terminal for footfall',
              'Direct wholesale procurement through JioMart/Udaan B2B to boost margins by 4–6%',
            ],
            threats: [
              'Bad debt write-offs from uncollected village Udhaar ledgers',
              'Expanding quick-commerce / regional delivery chains in block towns',
              'Local price undercutting from legacy entrenched shopkeepers',
            ],
          },
          moatTips: [
            'Enforce a strict 7-day Udhaar ceiling with automated SMS / WhatsApp reminders',
            'Provide UPI QR payment cashback discounts to encourage instantaneous cashflow',
            'Bundle high-margin loose spices and grains with branded staples',
          ],
        };
      case 'textiles':
        return {
          title: 'Textiles, Readymades & Custom Tailoring',
          defaultUnit: 'garments/orders per day',
          defaultTicket: 450,
          defaultCustomers: 30,
          grossMarginPct: 32,
          monthlyOverhead: 15000,
          swot: {
            strengths: [
              'Substantial gross margins (30–40%) on seasonal and festive apparel',
              'Tailoring and alteration services generate zero-raw-material service revenue',
              'Personalized customer fitting and community relationship retention',
            ],
            weaknesses: [
              'Strong seasonality — massive peaks during weddings/festivals, lean monsoons',
              'Unsold dead inventory risk if regional fashion/color preferences shift',
              'Skilled master tailor retention and stitcher attrition',
            ],
            opportunities: [
              'School uniform and institutional workwear annual supply contracts',
              'Bridal rental and ethnic festive embroidery customization',
              'Social media video marketing showcasing new saree arrivals to local block women',
            ],
            threats: [
              'Cheap synthetic imports and budget readymade market flooding',
              'Rise of online fashion apps (Meesho, Flipkart) among rural youth',
              'Power cuts stalling industrial sewing machines and steam irons',
            ],
          },
          moatTips: [
            'Guaranteed 24-hour fitting & alteration turnaround for customer purchases',
            'Secure annual school uniform contracts across 3 neighboring Gram Panchayats',
            'Curate wedding family bundles (sarees, kurtas, shirting) with packaged discounts',
          ],
        };
      case 'agro':
        return {
          title: 'Agro-Processing & Flour/Oil/Spice Mill',
          defaultUnit: 'quintals processed/day',
          defaultTicket: 320,
          defaultCustomers: 45,
          grossMarginPct: 26,
          monthlyOverhead: 25000,
          swot: {
            strengths: [
              'Direct proximity to farm-gate harvest without long transport logistics',
              'Dual revenue model: Custom milling job-work + branded packaging sales',
              'Byproducts (wheat bran, mustard oil cake) fetch guaranteed sale to dairy farmers',
            ],
            weaknesses: [
              'Heavy 3-phase industrial electricity and motor maintenance dependency',
              'Working capital required to buy grains during peak harvest season',
              'Dust, noise, and grain pest management challenges',
            ],
            opportunities: [
              'PMFME (PM Formalisation of Micro food processing) 35% capital subsidy',
              'Cold-pressed (Kachi Ghani) oil and stone-ground (Chakki) atta premium branding',
              'Packaging in 5kg and 10kg sealed bags for local kirana store distribution',
            ],
            threats: [
              'Monsoon failure or crop damage in local catchment reducing mandi arrivals',
              'Industrial flour mills dumping low-cost flour in regional block markets',
              'Frequent power voltage drops damaging electric mill motors',
            ],
          },
          moatTips: [
            'Guarantee 100% unadulterated cold-pressed extraction with transparent live viewing',
            'Sell fresh oil cakes directly to neighboring dairy farmers with loyalty credits',
            'Offer pick-up and drop-off of grain sacks from farmer doorsteps in 5 km radius',
          ],
        };
      case 'tech_services':
      default:
        return {
          title: 'Rural Tech, Solar & Agricultural Machinery Workshop',
          defaultUnit: 'repairs & services/day',
          defaultTicket: 380,
          defaultCustomers: 25,
          grossMarginPct: 44,
          monthlyOverhead: 14000,
          swot: {
            strengths: [
              'Extremely high gross margin on skilled technician labor and diagnostic service',
              'Essential utility: Solar pump, tractor, inverter, and smartphone repair',
              'Low inventory carrying cost compared to retail or food processing',
            ],
            weaknesses: [
              'Sole dependency on technician diagnostic skill and tool proficiency',
              'Spare parts delivery delays from district or metro supply hubs',
              'Seasonality tied to sowing and harvest machinery cycles',
            ],
            opportunities: [
              'Government PM-KUSUM solar water pump installation & annual maintenance tie-ups',
              'EV 2-wheeler and e-rickshaw battery servicing station',
              'Refurbished smartphone and agri-sensor sales with 6-month warranty',
            ],
            threats: [
              'Rapid obsolescence of repair equipment and circuit diagnostic tools',
              'Unauthorized roadside mechanics undercutting on counterfeit spares',
              'Manufacturer warranty locks restricting independent repair',
            ],
          },
          moatTips: [
            'Maintain a mobile breakdown repair van that travels to agricultural fields on call',
            'Offer genuine spare parts guarantee with 30-day post-service warranty',
            'Become an authorized warranty service point for regional solar pump brands',
          ],
        };
    }
  }, [sector]);

  // Sync default unit prices when switching sector
  const handleSectorChange = (newSector: BusinessSector) => {
    setSector(newSector);
    let defaultTicket = 180;
    let defaultCust = 65;
    if (newSector === 'dairy') {
      defaultTicket = 65;
      defaultCust = 150;
    } else if (newSector === 'poultry') {
      defaultTicket = 220;
      defaultCust = 80;
    } else if (newSector === 'retail') {
      defaultTicket = 190;
      defaultCust = 120;
    } else if (newSector === 'textiles') {
      defaultTicket = 450;
      defaultCust = 30;
    } else if (newSector === 'agro') {
      defaultTicket = 320;
      defaultCust = 45;
    } else if (newSector === 'tech_services') {
      defaultTicket = 380;
      defaultCust = 25;
    }
    setAvgTicketPrice(defaultTicket);
    setDailyCustomers(defaultCust);
  };

  // 2. Market Reach & Catchment Population Model
  const marketCatchment = useMemo(() => {
    // Census benchmark rural & block densities:
    // Village/GP: ~450 people/km²
    // Block Town: ~1,800 people/km²
    // Semi-Urban: ~4,200 people/km²
    let density = 450;
    if (adminTier === 'block') density = 1800;
    if (adminTier === 'semi_urban') density = 4200;

    const areaSqKm = Math.PI * Math.pow(radiusKm, 2);
    const estimatedRawPop = Math.round(areaSqKm * density);

    // Realistic caps based on Indian administrative boundaries
    let cappedPopulation = estimatedRawPop;
    if (adminTier === 'village') cappedPopulation = Math.min(estimatedRawPop, 18000);
    if (adminTier === 'block') cappedPopulation = Math.min(estimatedRawPop, 85000);
    if (adminTier === 'semi_urban') cappedPopulation = Math.min(estimatedRawPop, 250000);

    const households = Math.round(cappedPopulation / 4.6);
    const targetAddressableHouseholds = Math.round(households * 0.45);

    return {
      areaSqKm: Math.round(areaSqKm),
      cappedPopulation,
      households,
      targetAddressableHouseholds,
    };
  }, [adminTier, radiusKm]);

  // 3. Financial & Feasibility Model
  const financials = useMemo(() => {
    const monthlyRevenue = dailyCustomers * avgTicketPrice * 30;
    const grossMarginAmount = (monthlyRevenue * sectorData.grossMarginPct) / 100;
    const netMonthlyProfit = Math.max(0, grossMarginAmount - sectorData.monthlyOverhead);
    const annualNetProfit = netMonthlyProfit * 12;

    // Break even in months = Initial Investment / Monthly Net Profit
    const breakEvenMonths =
      netMonthlyProfit > 0
        ? Math.round((initialInvestment / netMonthlyProfit) * 10) / 10
        : 999;

    // Daily market capture % = daily customers / target households
    const marketCapturePct =
      marketCatchment.targetAddressableHouseholds > 0
        ? Math.min(
            100,
            Math.round(
              (dailyCustomers / marketCatchment.targetAddressableHouseholds) *
                1000
            ) / 10
          )
        : 0;

    return {
      monthlyRevenue,
      grossMarginAmount: Math.round(grossMarginAmount),
      monthlyOverhead: sectorData.monthlyOverhead,
      netMonthlyProfit: Math.round(netMonthlyProfit),
      annualNetProfit: Math.round(annualNetProfit),
      breakEvenMonths,
      marketCapturePct,
    };
  }, [dailyCustomers, avgTicketPrice, sectorData, initialInvestment, marketCatchment]);

  // 4. Competitor Density & Moat Analysis
  const competitorAnalysis = useMemo(() => {
    // 0: Monopoly, 1-2: Low, 3-5: Moderate, 6+: Saturated
    let saturationScore = 15;
    let moatRating = 'Strong Defensible Moat';
    let moatBadge = 'LOW COMPETITION';
    let color = 'text-emerald-500';

    if (existingCompetitors === 0) {
      saturationScore = 10;
      moatRating = 'First-Mover Rural Monopoly';
      moatBadge = 'UNSERVED DEMAND';
      color = 'text-emerald-400';
    } else if (existingCompetitors <= 2) {
      saturationScore = 35;
      moatRating = 'Healthy Duopoly / Room to Grow';
      moatBadge = 'MODERATE';
      color = 'text-teal-400';
    } else if (existingCompetitors <= 5) {
      saturationScore = 65;
      moatRating = 'Competitive Market (Moat Required)';
      moatBadge = 'HIGH DENSITY';
      color = 'text-amber-400';
    } else {
      saturationScore = 90;
      moatRating = 'Saturated (Price War Risk)';
      moatBadge = 'SATURATED';
      color = 'text-rose-400';
    }

    return {
      saturationScore,
      moatRating,
      moatBadge,
      color,
    };
  }, [existingCompetitors]);

  // 5. Composite Bank Loan Viability Score (0 - 100)
  const viabilityScore = useMemo(() => {
    let score = 50;

    // Margin health (+/- 20)
    if (financials.netMonthlyProfit > 40000) score += 20;
    else if (financials.netMonthlyProfit > 20000) score += 12;
    else if (financials.netMonthlyProfit > 8000) score += 5;
    else score -= 15;

    // Break-even speed (+/- 15)
    if (financials.breakEvenMonths <= 18) score += 15;
    else if (financials.breakEvenMonths <= 36) score += 8;
    else score -= 10;

    // Competition density (+/- 15)
    if (existingCompetitors <= 1) score += 15;
    else if (existingCompetitors <= 3) score += 8;
    else score -= 8;

    // Catchment support (+/- 10)
    if (marketCatchment.cappedPopulation >= 8000) score += 10;
    else score += 5;

    const finalScore = Math.min(98, Math.max(25, score));
    let status = 'High Bankability (Low Risk)';
    let statusColor = 'text-emerald-500';
    let ringColor = 'stroke-emerald-500';

    if (finalScore < 60) {
      status = 'Marginal Viability (High Debt Risk)';
      statusColor = 'text-rose-400';
      ringColor = 'stroke-rose-500';
    } else if (finalScore < 75) {
      status = 'Moderate Viability (Conditional)';
      statusColor = 'text-amber-400';
      ringColor = 'stroke-amber-500';
    }

    return {
      score: finalScore,
      status,
      statusColor,
      ringColor,
    };
  }, [financials, existingCompetitors, marketCatchment]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module 1 Header Banner */}
      <div className="p-6 sm:p-7 fintech-card rounded-3xl border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MODULE 1: HYPER-LOCAL FEASIBILITY ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              Village & Block-Level Business Feasibility
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyzes micro-market reach, competitor saturation, 4-quadrant SWOT matrices, and bank loan viability for rural enterprise setups across dairy, poultry, retail kirana, and agro-processing.
            </p>
          </div>

          {/* Quick Sector Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'dairy', label: '🥛 Dairy' },
              { id: 'poultry', label: '🐔 Poultry' },
              { id: 'retail', label: '🏪 Kirana' },
              { id: 'textiles', label: '🧵 Textiles' },
              { id: 'agro', label: '🌾 Agro Mill' },
              { id: 'tech_services', label: '⚙️ Workshop' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleSectorChange(s.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                  sector === s.id
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Geography & Operational Parameters */}
        <div className="lg:col-span-7 fintech-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                  {sectorData.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Configure administrative geography and operational scale
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {sectorData.grossMarginPct}% Gross Margin
            </span>
          </div>

          {/* Location Tier Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              <span>Administrative Geography Tier:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'village', label: 'Gram Panchayat', sub: 'Village (<5,000)' },
                { id: 'block', label: 'Block / Tehsil', sub: 'Town (15k–50k)' },
                { id: 'semi_urban', label: 'Semi-Urban', sub: 'Mandi (50k–1.5L)' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setAdminTier(tier.id as any)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    adminTier === tier.id
                      ? 'bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#070B14] dark:hover:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold block">{tier.label}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{tier.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Catchment Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Service Catchment Radius:
              </span>
              <span className="text-teal-600 dark:text-teal-400">
                {radiusKm} km radius ({marketCatchment.areaSqKm} sq. km)
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>2 km (Local Village)</span>
              <span>10 km (Inter-Panchayat)</span>
              <span>20 km (Full Block)</span>
            </div>
          </div>

          {/* Daily Customer & Ticket Price Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Target Daily Output / Customers:
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={dailyCustomers || ''}
                onChange={(e) => setDailyCustomers(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white"
                placeholder="e.g. 65"
              />
              <span className="text-[10px] text-slate-400 block font-mono">
                {sectorData.defaultUnit}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Average Ticket Realization (₹):
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={avgTicketPrice || ''}
                onChange={(e) => setAvgTicketPrice(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white"
                placeholder="e.g. 180"
              />
              <span className="text-[10px] text-slate-400 block font-mono">
                Average billing per unit/customer
              </span>
            </div>
          </div>

          {/* Existing Local Competitors */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200">
                Existing Competitors in {radiusKm} km Radius:
              </span>
              <span className="font-mono text-amber-500 font-black">
                {existingCompetitors === 0 ? 'None (Monopoly)' : `${existingCompetitors} Competitor${existingCompetitors > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 5, 8].map((compCount) => (
                <button
                  key={compCount}
                  onClick={() => setExistingCompetitors(compCount)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    existingCompetitors === compCount
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  {compCount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Market Reach & Viability Gauge */}
        <div className="lg:col-span-5 fintech-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Bank Feasibility Verdict
                </span>
              </div>

              <span className={`text-[10px] font-mono font-bold ${viabilityScore.statusColor}`}>
                {viabilityScore.status}
              </span>
            </div>

            {/* Circular Gauge / Viability Meter */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={viabilityScore.ringColor}
                    strokeDasharray={`${viabilityScore.score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    {viabilityScore.score}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Loan Sanction Readiness
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Evaluated based on debt coverage, catchment demand ratio, and competitor saturation.
                </p>
                <span className="inline-block text-[10px] font-mono font-bold text-emerald-500">
                  Break-Even: ~{financials.breakEvenMonths} Months
                </span>
              </div>
            </div>

            {/* Catchment Demographic Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                  Catchment Population
                </span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white block">
                  {marketCatchment.cappedPopulation.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  ~{marketCatchment.households.toLocaleString('en-IN')} Households
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                  Competitor Moat
                </span>
                <span className={`text-base font-black font-mono ${competitorAnalysis.color} block`}>
                  {competitorAnalysis.moatBadge}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {competitorAnalysis.saturationScore}% Saturation
                </span>
              </div>
            </div>

            {/* Monthly Profitability Breakdown */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Gross Monthly Revenue:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  ₹{financials.monthlyRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Estimated Overheads & COGS:</span>
                <span className="text-rose-500 font-medium">
                  -₹{(financials.monthlyRevenue - financials.netMonthlyProfit).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-emerald-700 dark:text-emerald-300">Net Monthly Cash Surplus:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                  ₹{financials.netMonthlyProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/70 dark:border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Annual Net Run-rate:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ₹{financials.annualNetProfit.toLocaleString('en-IN')} / year
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic 4-Quadrant SWOT Matrix (Indian Rural / Block Enterprise Specific) */}
      <div className="fintech-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
        <div className="space-y-1 pb-4 border-b border-slate-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-mono font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>GROUNDED 4-QUADRANT SWOT MATRIX</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
            Strategic Feasibility Analysis — {sectorData.title}
          </h3>
          <p className="text-xs text-slate-400">
            Tailored to grassroots Bharat market realities, addressing working capital constraints, cold-chain risks, and local community dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>STRENGTHS (Internal Operational Edge)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {sectorData.swot.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>WEAKNESSES (Internal Vulnerabilities)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {sectorData.swot.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-5 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-mono font-bold text-xs">
              <Lightbulb className="w-4 h-4" />
              <span>OPPORTUNITIES (Market & Government Incentives)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {sectorData.swot.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>THREATS (External Risks & Competition)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {sectorData.swot.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Competitor Differentiation Tactics & Bank Application Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Differentiation Tactics */}
        <div className="fintech-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/70 dark:border-white/5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Grassroots Moat-Building Tactics
            </h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {sectorData.moatTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/60 dark:border-white/5">
                <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-600 dark:text-teal-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bank Loan Checklist */}
        <div className="fintech-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/70 dark:border-white/5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Bank Loan Documentation Checklist
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { doc: 'Detailed Project Report (DPR)', status: 'Auto-Calculated via DhanMitr' },
              { doc: 'Machinery / Shed Quotations from Vendors', status: 'Mandatory for 90% Loan' },
              { doc: 'Gram Panchayat No Objection Certificate (NOC)', status: 'Required for Shed/Mill' },
              { doc: '3-Phase Industrial Electricity Sanction', status: 'Applicable for Chilling/Mill' },
              { doc: 'Promoter KYC & Aadhaar-linked Bank Passbook', status: 'Mandatory' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/60 dark:border-white/5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {item.doc}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
