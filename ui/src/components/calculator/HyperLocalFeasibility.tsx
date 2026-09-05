'use client';

import React, { useState, useMemo } from 'react';
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
  Home,
  Lightbulb,
} from 'lucide-react';

interface HyperLocalFeasibilityProps {
  initialProjectCost?: number;
}

type BusinessSector = 'dairy' | 'poultry' | 'retail' | 'textiles' | 'agro' | 'tech';

export const HyperLocalFeasibility: React.FC<HyperLocalFeasibilityProps> = ({
  initialProjectCost = 500000,
}) => {
  const [sector, setSector] = useState<BusinessSector>('dairy');
  const [locationType, setLocationType] = useState<'village' | 'town'>('village');
  const [projectBudget, setProjectBudget] = useState<number>(initialProjectCost);

  // Sector profiles tailored for rural Bharat
  const sectorInfo = useMemo(() => {
    switch (sector) {
      case 'dairy':
        return {
          title: 'Dairy Farm & Milk Supply',
          monthlySales: locationType === 'village' ? 140000 : 210000,
          profitMargin: 28, // 28% net profit
          breakEvenMonths: 12,
          viabilityScore: 88,
          advantages: [
            'Daily steady cash flow from morning/evening milk collection.',
            'High local demand from households, sweet shops, and dairies.',
          ],
          watchpoint: 'Requires reliable clean water, cattle vaccination, and chilling backup.',
        };
      case 'poultry':
        return {
          title: 'Broiler & Egg Poultry Unit',
          monthlySales: locationType === 'village' ? 160000 : 250000,
          profitMargin: 22,
          breakEvenMonths: 10,
          viabilityScore: 82,
          advantages: [
            'Fast 40–45 day harvest cycle enables quick cash rotation.',
            'High protein demand across rural and peri-urban markets.',
          ],
          watchpoint: 'Strict biosecurity and temperature management needed in summer.',
        };
      case 'retail':
        return {
          title: 'Kirana & Rural FMCG Store',
          monthlySales: locationType === 'village' ? 180000 : 320000,
          profitMargin: 18,
          breakEvenMonths: 9,
          viabilityScore: 86,
          advantages: [
            'Essential daily needs create repeat footfall and loyal customers.',
            'Opportunity to add digital payments, bill pay, and cash withdrawal (AePS).',
          ],
          watchpoint: 'Avoid granting unrecorded informal credit (Udhaar) to manage cash flow.',
        };
      case 'textiles':
        return {
          title: 'Garments & Tailoring Unit',
          monthlySales: locationType === 'village' ? 95000 : 175000,
          profitMargin: 35,
          breakEvenMonths: 14,
          viabilityScore: 79,
          advantages: [
            'High margins on custom stitching, school uniforms, and festive wear.',
            'Low perishable risk compared to food or livestock businesses.',
          ],
          watchpoint: 'Demand peaks during festival and wedding seasons; manage working capital.',
        };
      case 'agro':
        return {
          title: 'Agro Grain & Flour Mini Mill',
          monthlySales: locationType === 'village' ? 120000 : 210000,
          profitMargin: 32,
          breakEvenMonths: 13,
          viabilityScore: 85,
          advantages: [
            'Farmers prefer processing grain locally rather than traveling to distant mandis.',
            'Byproducts (husk, bran) sell readily as animal fodder.',
          ],
          watchpoint: 'Requires stable 3-phase rural electricity connection or solar hybrid setup.',
        };
      case 'tech':
      default:
        return {
          title: 'Solar & Mobile Tech Workshop',
          monthlySales: locationType === 'village' ? 80000 : 150000,
          profitMargin: 40,
          breakEvenMonths: 11,
          viabilityScore: 83,
          advantages: [
            'High profit margins on smartphone repairs, solar pump maintenance, and accessories.',
            'Low raw material inventory cost; income comes from skilled technical labor.',
          ],
          watchpoint: 'Keep up with new repair tools, spare parts sourcing, and fast turnaround.',
        };
    }
  }, [sector, locationType]);

  const monthlyProfit = Math.round(
    sectorInfo.monthlySales * (sectorInfo.profitMargin / 100)
  );
  const monthlyExpenses = sectorInfo.monthlySales - monthlyProfit;

  const sectors = [
    { id: 'dairy', label: 'Dairy Farm', Icon: Milk, iconColor: 'text-emerald-500' },
    { id: 'poultry', label: 'Poultry Unit', Icon: Egg, iconColor: 'text-amber-500' },
    { id: 'retail', label: 'Kirana Store', Icon: ShoppingBag, iconColor: 'text-teal-500' },
    { id: 'textiles', label: 'Textiles', Icon: Shirt, iconColor: 'text-indigo-500' },
    { id: 'agro', label: 'Grain Mill', Icon: Wheat, iconColor: 'text-amber-600' },
    { id: 'tech', label: 'Tech & Solar', Icon: Wrench, iconColor: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Master Feasibility Card */}
      <div className="fintech-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-white/5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
              Village & Block Business Feasibility
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Select your business type and location to check local market viability, estimated monthly profits, and bank readiness.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-mono font-bold">
            <button
              onClick={() => setLocationType('village')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                locationType === 'village'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Village / Panchayat</span>
            </button>
            <button
              onClick={() => setLocationType('town')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                locationType === 'town'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Town / Block Center</span>
            </button>
          </div>
        </div>

        {/* Business Sector Picker (6 Clean Visual SVG Cards) */}
        <div>
          <label className="text-xs font-bold uppercase font-mono text-slate-400 block mb-2.5">
            Select Your Business:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {sectors.map((item) => {
              const IconComp = item.Icon;
              const isSelected = sector === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSector(item.id as BusinessSector)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#070B14] dark:hover:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold font-sans tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Unit Economics & Profit Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Monthly Sales */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 font-mono">
              Estimated Monthly Sales
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              ₹{sectorInfo.monthlySales.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              Costs: ₹{monthlyExpenses.toLocaleString('en-IN')} / mo
            </p>
          </div>

          {/* Net Monthly Profit */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Estimated Net Profit
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                {sectorInfo.profitMargin}% Margin
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{monthlyProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              Direct monthly earnings in your pocket
            </p>
          </div>

          {/* Bank Viability Score */}
          <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase font-bold text-teal-600 dark:text-teal-400 font-mono">
                Bank Viability Score
              </span>
              <span className="text-[10px] font-mono text-teal-500 font-bold">
                Break-even ~{sectorInfo.breakEvenMonths} mos
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <span>{sectorInfo.viabilityScore} / 100</span>
              <Award className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-[11px] text-teal-600/80 dark:text-teal-400/80">
              Strong candidate for CGTMSE / Mudra Loan
            </p>
          </div>
        </div>

        {/* 3. Strengths & Key Tips (Simplified SWOT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/15 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Key Local Advantages
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {sectorInfo.advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/15 border border-amber-500/20 space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Key Watchpoint for Success
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {sectorInfo.watchpoint}
            </p>
            <div className="pt-1 text-[11px] text-amber-700 dark:text-amber-300/80 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Maintaining your 10% margin upfront ensures smooth bank loan processing.</span>
            </div>
          </div>
        </div>

        {/* 4. Bank Readiness Checklist (4 Quick Checks) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase font-mono text-slate-400">
              Bank Document Readiness Checklist:
            </span>
            <span className="text-[11px] text-emerald-500 font-mono font-bold">
              4 of 4 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { title: 'Aadhaar & PAN', desc: 'Identity & Address Proof' },
              { title: 'Udyam Registration', desc: 'Free 5-min MSME Certificate' },
              { title: 'Vendor Quotation', desc: 'Machinery / Shed Estimate' },
              { title: '6-Month Bank Statement', desc: 'Proof of 10% Margin Funds' },
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
    </div>
  );
};
