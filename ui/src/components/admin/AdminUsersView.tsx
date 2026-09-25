'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  UserX, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  X,
  Copy,
  Check,
  Tv,
  DollarSign,
  Layers,
  Wallet,
  TrendingUp,
  Receipt,
  Tag,
  Sparkles,
  Plus,
  Trash2,
  Crown,
  Award,
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  avatar_initial: string;
  currency: string;
  monthly_income: number;
  monthly_expenses: number;
  emergency_fund_balance: number;
  total_investments: number;
  total_liabilities: number;
  risk_tolerance: string;
  employment_type: string;
  tax_regime: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
  adminRole: 'superadmin' | 'admin' | 'moderator' | 'user';
  isAdminActive: boolean;
  tags?: string[];
  custom_tag?: string;
}

export const AdminUsersView: React.FC = () => {
  const { adminFetch, adminRole: currentAdminRole } = useAdminAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [onboardedFilter, setOnboardedFilter] = useState('all');

  // Modals & Drawers
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetailData, setUserDetailData] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [inspectionTab, setInspectionTab] = useState<'profile' | 'subscriptions' | 'insurances' | 'transactions'>('profile');

  const [roleModalUser, setRoleModalUser] = useState<UserRecord | null>(null);
  const [targetRole, setTargetRole] = useState<'superadmin' | 'admin' | 'moderator' | 'user'>('user');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // User Tag Management Modal State
  const [tagModalUser, setTagModalUser] = useState<UserRecord | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [isSavingTags, setIsSavingTags] = useState<boolean>(false);

  const handleOpenTagModal = (user: UserRecord) => {
    setTagModalUser(user);
    setSelectedTags(user.tags || []);
    setCustomTagInput(user.custom_tag || '');
  };

  const handleTogglePresetTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim();
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveTags = async () => {
    if (!tagModalUser) return;
    setIsSavingTags(true);
    try {
      const customTag = selectedTags.find((t) => !['founder', 'cool', 'clever'].includes(t)) || '';
      await adminFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tagModalUser.id,
          action: 'UPDATE_TAGS',
          tags: selectedTags,
          customTag: customTag,
        }),
      });

      if (typeof window !== 'undefined') {
        const payload = { tags: selectedTags, customTag };
        localStorage.setItem(`dhanmitr_user_tags_${tagModalUser.id}`, JSON.stringify(payload));
        if (tagModalUser.email) {
          localStorage.setItem(`dhanmitr_email_tags_${tagModalUser.email.toLowerCase().trim()}`, JSON.stringify(payload));
        }
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === tagModalUser.id
            ? {
                ...u,
                tags: selectedTags,
                custom_tag: customTag || undefined,
              }
            : u
        )
      );

      setActionSuccessMessage(`Tags updated for ${tagModalUser.name || tagModalUser.email}!`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
      setTagModalUser(null);
    } catch (err: any) {
      alert(`Failed to save tags: ${err?.message}`);
    } finally {
      setIsSavingTags(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (onboardedFilter !== 'all') params.append('onboarded', onboardedFilter);

      const res = await adminFetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load user records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, roleFilter, onboardedFilter]);

  const handleInspectUser = async (userId: string) => {
    setSelectedUserId(userId);
    setUserDetailData(null);
    setIsLoadingDetail(true);
    setInspectionTab('profile');

    try {
      const res = await adminFetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserDetailData(data);
        }
      }
    } catch (e) {
      console.error('Failed to load user detail:', e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateRole = async () => {
    if (!roleModalUser) return;
    setIsUpdatingRole(true);
    setActionSuccessMessage(null);

    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: roleModalUser.id,
          role: targetRole,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMessage(`Successfully updated role for ${roleModalUser.name || roleModalUser.email} to ${targetRole}.`);
        setRoleModalUser(null);
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to update user role');
      }
    } catch (e: any) {
      alert(`Error updating role: ${e.message}`);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const formatCurrency = (val: number, cur: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cur || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User & Role Directory</h1>
          <p className="text-sm text-slate-400">Search, inspect connected assets, and manage administrative privileges</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Directory
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {actionSuccessMessage}
          </span>
          <button onClick={() => setActionSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Directory Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Users Listed</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white">{users.length}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Income Tracked</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(users.reduce((sum, u) => sum + (u.monthly_income || 0), 0))}
            <span className="text-xs text-slate-500 font-medium">/mo</span>
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Expenses Tracked</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(users.reduce((sum, u) => sum + (u.monthly_expenses || 0), 0))}
            <span className="text-xs text-slate-500 font-medium">/mo</span>
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Investments Tracked</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(users.reduce((sum, u) => sum + (u.total_investments || 0), 0))}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or user UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">Standard User</option>
          </select>
        </div>

        {/* Onboarding Filter */}
        <div className="sm:col-span-3">
          <select
            value={onboardedFilter}
            onChange={(e) => setOnboardedFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Onboarding States</option>
            <option value="true">Onboarded</option>
            <option value="false">Pending Onboarding</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading user registry...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <UserX className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No users found matching your filters</p>
            <p className="text-xs text-slate-600 mt-1">Try broadening your search query or reset filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User / Profile</th>
                  <th className="px-4 py-3.5">User ID</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Tags & Badges</th>
                  <th className="px-4 py-3.5">Onboarding</th>
                  <th className="px-4 py-3.5 text-right">Income /mo</th>
                  <th className="px-4 py-3.5 text-right">Expenses /mo</th>
                  <th className="px-4 py-3.5 text-right">Investments</th>
                  <th className="px-4 py-3.5">Risk Preference</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((user) => {
                  const isSuperAdmin = user.adminRole === 'superadmin';
                  const isAdmin = user.adminRole === 'admin';
                  const isModerator = user.adminRole === 'moderator';

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center">
                            {user.avatar_initial || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user.name || 'Unnamed User'}</div>
                            <div className="text-slate-500 text-[11px]">{user.email || 'No email attached'}</div>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span>{user.id.substring(0, 8)}...</span>
                          <button
                            onClick={() => handleCopy(user.id)}
                            className="p-1 hover:text-slate-300 transition-colors text-slate-600"
                            title="Copy full UUID"
                          >
                            {copiedId === user.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isSuperAdmin 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : isAdmin
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : isModerator
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {(isSuperAdmin || isAdmin) && <ShieldCheck className="w-3 h-3" />}
                          {user.adminRole.toUpperCase()}
                        </span>
                      </td>

                      {/* Tags & Badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1 max-w-[210px]">
                          {user.tags && user.tags.length > 0 ? (
                            user.tags.map((t) => {
                              if (t === 'founder') {
                                return (
                                  <span
                                    key={t}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                                  >
                                    <Crown className="w-3 h-3 text-amber-400" />
                                    Founder
                                  </span>
                                );
                              }
                              if (t === 'cool') {
                                return (
                                  <span
                                    key={t}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                  >
                                    😎 Cool
                                  </span>
                                );
                              }
                              if (t === 'clever') {
                                return (
                                  <span
                                    key={t}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                  >
                                    🧠 Clever
                                  </span>
                                );
                              }
                              return (
                                <span
                                  key={t}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                  {t}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[11px] text-slate-600 italic">No tags</span>
                          )}
                        </div>
                      </td>

                      {/* Onboarding */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          user.is_onboarded
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {user.is_onboarded ? 'Onboarded' : 'Pending'}
                        </span>
                      </td>

                      {/* Monthly Income */}
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                        {formatCurrency(user.monthly_income, user.currency)}
                      </td>

                      {/* Monthly Expenses */}
                      <td className="px-4 py-3 text-right font-semibold text-rose-400">
                        {formatCurrency(user.monthly_expenses, user.currency)}
                      </td>

                      {/* Total Investments */}
                      <td className="px-4 py-3 text-right font-semibold text-purple-400">
                        {formatCurrency(user.total_investments, user.currency)}
                      </td>

                      {/* Risk Preference */}
                      <td className="px-4 py-3 capitalize text-slate-300">
                        {user.risk_tolerance || 'Moderate'}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleInspectUser(user.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Inspect Profile & Assets"
                          >
                            <Eye className="w-3 h-3" /> Inspect
                          </button>

                          {(currentAdminRole === 'superadmin' || currentAdminRole === 'admin') && (
                            <>
                              <button
                                onClick={() => handleOpenTagModal(user)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Assign Founder, Cool, Clever or Custom Surprise Tags"
                              >
                                <Tag className="w-3 h-3" /> Tag
                              </button>

                              <button
                                onClick={() => {
                                  setRoleModalUser(user);
                                  setTargetRole(user.adminRole);
                                }}
                                className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Role
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deep Inspection Drawer / Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-base">
                  {userDetailData?.user?.avatar_initial || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{userDetailData?.user?.name || 'User Profile'}</h3>
                  <p className="text-xs text-slate-400">{userDetailData?.user?.email || selectedUserId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                <p className="text-xs">Gathering connected financial records...</p>
              </div>
            ) : userDetailData ? (
              <div className="space-y-4">
                {/* Inspection Sub-Tabs */}
                <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setInspectionTab('profile')}
                    className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                      inspectionTab === 'profile' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Financial Profile
                  </button>
                  <button
                    onClick={() => setInspectionTab('subscriptions')}
                    className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                      inspectionTab === 'subscriptions' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OTT ({userDetailData.subscriptions?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectionTab('insurances')}
                    className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                      inspectionTab === 'insurances' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Insurances ({userDetailData.insurances?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectionTab('transactions')}
                    className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                      inspectionTab === 'transactions' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ledger ({userDetailData.recentTransactions?.length || 0})
                  </button>
                </div>

                {/* Tab: Profile Overview */}
                {inspectionTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">Monthly Income</span>
                        <span className="text-sm font-semibold text-emerald-400">{formatCurrency(userDetailData.user.monthly_income)}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">Monthly Expenses</span>
                        <span className="text-sm font-semibold text-rose-400">{formatCurrency(userDetailData.user.monthly_expenses)}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">Emergency Fund</span>
                        <span className="text-sm font-semibold text-blue-400">{formatCurrency(userDetailData.user.emergency_fund_balance)}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">Total Investments</span>
                        <span className="text-sm font-semibold text-purple-400">{formatCurrency(userDetailData.user.total_investments)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Employment:</span>
                        <span className="font-semibold text-white capitalize">{userDetailData.user.employment_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Profile:</span>
                        <span className="font-semibold text-white capitalize">{userDetailData.user.risk_tolerance || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tax Regime:</span>
                        <span className="font-semibold text-white capitalize">{userDetailData.user.tax_regime || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Role Privilege:</span>
                        <span className="font-mono text-emerald-400 uppercase">{userDetailData.user.adminRole}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">UUID:</span>
                        <span className="font-mono text-[10px] text-slate-400">{userDetailData.user.id}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Subscriptions */}
                {inspectionTab === 'subscriptions' && (
                  <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                    {userDetailData.subscriptions?.length === 0 ? (
                      <p className="text-slate-500 py-6 text-center">No OTT subscriptions registered by this user.</p>
                    ) : (
                      userDetailData.subscriptions.map((s: any) => (
                        <div key={s.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-white">{s.name}</span>
                            <span className="text-slate-500 text-[10px] block">{s.billing_cycle} · Next: {s.next_renewal_date || 'N/A'}</span>
                          </div>
                          <span className="font-bold text-amber-300">{formatCurrency(s.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Insurances */}
                {inspectionTab === 'insurances' && (
                  <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                    {userDetailData.insurances?.length === 0 ? (
                      <p className="text-slate-500 py-6 text-center">No insurance policies registered by this user.</p>
                    ) : (
                      userDetailData.insurances.map((i: any) => (
                        <div key={i.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-white">{i.policy_name}</span>
                            <span className="text-slate-500 text-[10px] block capitalize">{i.policy_type?.replace('_', ' ')} · {i.provider}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400 block">{formatCurrency(i.coverage_amount)}</span>
                            <span className="text-[10px] text-slate-400">{formatCurrency(i.premium_amount)}/yr</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Transactions */}
                {inspectionTab === 'transactions' && (
                  <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                    {userDetailData.recentTransactions?.length === 0 ? (
                      <p className="text-slate-500 py-6 text-center">No transactions recorded yet.</p>
                    ) : (
                      userDetailData.recentTransactions.map((t: any) => (
                        <div key={t.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-white">{t.title}</span>
                            <span className="text-slate-500 text-[10px] block">{t.category} · {t.date}</span>
                          </div>
                          <span className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Modify User Administrative Role</h3>
            </div>

            <p className="text-xs text-slate-400">
              Change role assignment for <strong className="text-white">{roleModalUser.name || roleModalUser.email}</strong>. This grants or revokes server-side administrative access to the धनMitr database.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Select Role</label>
              <select
                value={targetRole}
                onChange={(e: any) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="user">Standard User (No Admin Access)</option>
                <option value="moderator">Moderator (Read-Only Admin)</option>
                <option value="admin">Administrator (Full Admin Access)</option>
                {currentAdminRole === 'superadmin' && (
                  <option value="superadmin">Superadmin (Highest Privileges)</option>
                )}
              </select>
            </div>

            {targetRole === 'user' && roleModalUser.adminRole !== 'user' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>This will revoke all administrative privileges and audit the action immediately.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRoleModalUser(null)}
                disabled={isUpdatingRole}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={isUpdatingRole}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isUpdatingRole && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Role Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Tag & Surprise Badge Management Modal */}
      {tagModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-amber-400">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Manage User Badges & Tags</h3>
                  <p className="text-[11px] text-slate-400">
                    Assign special recognitions for {tagModalUser.name || tagModalUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTagModalUser(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User overview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{tagModalUser.name || 'User'}</p>
                <p className="text-slate-400 text-[11px]">{tagModalUser.email}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {tagModalUser.adminRole}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Quick Preset Badges
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Founder preset */}
                <button
                  type="button"
                  onClick={() => handleTogglePresetTag('founder')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedTags.includes('founder')
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>✦ Founder</span>
                </button>

                {/* Cool preset */}
                <button
                  type="button"
                  onClick={() => handleTogglePresetTag('cool')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedTags.includes('cool')
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40 shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">😎</span>
                  <span>Cool</span>
                </button>

                {/* Clever preset */}
                <button
                  type="button"
                  onClick={() => handleTogglePresetTag('clever')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedTags.includes('clever')
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-1 ring-purple-400/40 shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">🧠</span>
                  <span>Clever</span>
                </button>
              </div>
            </div>

            {/* Custom Surprise Tag Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Add Custom Surprise Tag</span>
                <span className="text-[10px] text-emerald-400 font-normal">Shows on their DhanMITR card!</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="e.g. VIP Investor, FinTech Wizard, Elite Angel..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Active Assigned Tags */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-400 block">
                Active Assigned Tags ({selectedTags.length})
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      <span>{tag === 'founder' ? '✦ Founder' : tag === 'cool' ? '😎 Cool' : tag === 'clever' ? '🧠 Clever' : tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic p-1">No tags assigned yet. Select a preset or type a custom tag above.</span>
                )}
              </div>
            </div>

            {/* Note on how user sees the surprise */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Immediate Surprise Effect</span>
              </p>
              <p className="text-[10.5px] leading-relaxed text-amber-300/90">
                When this user opens or downloads their DhanMITR card in Settings, their card will proudly display this custom recognition badge!
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTagModalUser(null)}
                disabled={isSavingTags}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTags}
                disabled={isSavingTags}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingTags ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Badges & Surprise User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
