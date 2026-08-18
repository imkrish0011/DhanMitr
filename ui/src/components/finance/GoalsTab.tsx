'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { FinancialGoal, GoalCategory, GoalPriority } from '@/types';
import { BottomSheetDrawer } from '@/components/ui/BottomSheetDrawer';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Edit2,
  Home,
  Shield,
  Briefcase,
  GraduationCap,
  Car,
  Palmtree,
  HeartHandshake,
} from 'lucide-react';

interface GoalsTabProps {
  onOpenAddModal?: () => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>('emergency_fund');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [priority, setPriority] = useState<GoalPriority>('medium');

  // Open modal for creating or editing
  const handleOpenAdd = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10));
    setCategory('emergency_fund');
    setMonthlyContribution('5000');
    setPriority('medium');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setTargetDate(goal.target_date);
    setCategory(goal.category);
    setMonthlyContribution(goal.monthly_contribution.toString());
    setPriority(goal.priority);
    setIsAddModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        title,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
        target_date: targetDate,
        category,
        monthly_contribution: Number(monthlyContribution) || 0,
        priority,
        is_completed: Number(currentAmount) >= Number(targetAmount),
      });
    } else {
      await addGoal({
        title,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
        target_date: targetDate || '2026-12-31',
        category,
        monthly_contribution: Number(monthlyContribution) || 0,
        priority,
        is_completed: Number(currentAmount) >= Number(targetAmount),
      });
    }

    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'emergency_fund':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'home':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'vehicle':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'retirement':
        return <Briefcase className="w-4 h-4 text-teal-500" />;
      case 'vacation':
        return <Palmtree className="w-4 h-4 text-sky-500" />;
      case 'wedding':
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      default:
        return <Target className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getPriorityColor = (p: GoalPriority) => {
    switch (p) {
      case 'high':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-500/20';
      case 'medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-500/20';
      case 'low':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Financial Goals & Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track your life goals with disciplined monthly SIP allocations and milestone progress.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goals Content: Card Grid or Clean Zero-State */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-emerald-900/30">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No Financial Goals Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Create target milestones for your Emergency Cushion, Home Down Payment, Vehicle, or Retirement to track your savings progress in real time.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenAdd}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Financial Goal</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current_amount / (goal.target_amount || 1)) * 100));
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs hover:border-emerald-500/30 transition-all flex flex-col justify-between group space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {goal.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                        {goal.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                </div>

                {/* Progress & Numbers */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        ₹{goal.current_amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-400"> / ₹{goal.target_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent >= 100 ? 'bg-emerald-500 shadow-xs' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                    <span>Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Target: {goal.target_date}</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer & Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Monthly SIP: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">₹{goal.monthly_contribution.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Bottom Sheet Drawer */}
      <BottomSheetDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingGoal ? 'Edit Financial Goal' : 'Create New Financial Goal'}
        subtitle="Set target amounts and monthly contribution to track progress"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Goal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 6-Month Emergency Cushion, Tesla Model 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="500000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Saved (₹)
              </label>
              <input
                type="number"
                placeholder="100000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="emergency_fund">Emergency Fund</option>
                <option value="home">Home / Property</option>
                <option value="vehicle">Vehicle / Car</option>
                <option value="education">Higher Education</option>
                <option value="retirement">Retirement</option>
                <option value="vacation">Vacation / Travel</option>
                <option value="wedding">Wedding / Family</option>
                <option value="other">Other Goal</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly SIP / Deposit (₹)
              </label>
              <input
                type="number"
                placeholder="10000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </BottomSheetDrawer>
    </div>
  );
};
