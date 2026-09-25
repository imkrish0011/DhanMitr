/**
 * DhanMITR User Tagging & Special Recognition Engine
 * Handles automatic tagging (founder, cool, clever) and admin custom surprise tags.
 */

export interface TagDetails {
  id: string;
  name: string;
  badgeLabel: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  canvasColor: string;
  canvasBg: string;
  canvasBorder: string;
  isSpecial?: boolean;
}

// Known / Configured Founder Emails
export const FOUNDER_EMAILS = [
  'ks9875277@gmail.com',
  'founder@dhanmitr.ai',
  'admin@dhanmitr.ai',
  'krish@dhanmitr.ai',
];

/**
 * Checks if a given email qualifies for the Founder tag automatically
 */
export function isFounderEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  
  if (FOUNDER_EMAILS.includes(clean)) return true;
  if (clean.endsWith('@dhanmitr.ai') || clean.endsWith('@dhanmitr.com')) return true;
  if (clean.startsWith('founder') || clean.includes('founder@')) return true;
  if (clean.includes('krish') && clean.includes('sharma')) return true;

  return false;
}

/**
 * Automatically computes tags based on user email, financial habits, and stored tags
 */
export function resolveUserTags(params: {
  userId?: string;
  email?: string;
  savingsRate?: number;
  monthly_income?: number;
  total_investments?: number;
  existingTags?: string[];
  customTag?: string;
}): { tags: string[]; activeBadge: TagDetails; allBadges: TagDetails[]; customTag?: string; memberNumber: string } {
  const {
    userId,
    email = '',
    savingsRate = 0,
    monthly_income = 0,
    total_investments = 0,
    existingTags = [],
    customTag: directCustomTag,
  } = params;

  const tagsSet = new Set<string>();

  // 1. Add existing stored tags from DB or localStorage
  existingTags.forEach((t) => tagsSet.add(t.toLowerCase().trim()));

  // Check localStorage overrides if client-side
  let clientCustomTag = directCustomTag;
  if (typeof window !== 'undefined' && userId) {
    try {
      const stored = localStorage.getItem(`dhanmitr_user_tags_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.tags)) {
          parsed.tags.forEach((t: string) => tagsSet.add(t.toLowerCase().trim()));
        }
        if (parsed.customTag) {
          clientCustomTag = parsed.customTag;
        }
      }

      // Check email-based stored tags
      if (email) {
        const emailStored = localStorage.getItem(`dhanmitr_email_tags_${email.toLowerCase().trim()}`);
        if (emailStored) {
          const parsedEmail = JSON.parse(emailStored);
          if (Array.isArray(parsedEmail.tags)) {
            parsedEmail.tags.forEach((t: string) => tagsSet.add(t.toLowerCase().trim()));
          }
          if (parsedEmail.customTag) {
            clientCustomTag = parsedEmail.customTag;
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // 2. Auto-tag fallback if no tags are explicitly set yet
  if (tagsSet.size === 0) {
    if (isFounderEmail(email)) {
      tagsSet.add('founder');
    } else {
      if (savingsRate >= 35 || monthly_income >= 60000) {
        tagsSet.add('cool');
      }
      if (total_investments > 0 || savingsRate >= 45) {
        tagsSet.add('clever');
      }
    }
  }

  const tagsArray = Array.from(tagsSet);
  const allBadges = getAllUserBadges(tagsArray, clientCustomTag);
  const activeBadge = allBadges[0] || getPrimaryBadge(tagsArray, clientCustomTag);
  const memberNumber = getUserMemberNumber(userId, email, tagsArray);

  return {
    tags: tagsArray,
    activeBadge,
    allBadges,
    customTag: clientCustomTag,
    memberNumber,
  };
}

/**
 * Determines user sequence/member number inspired by Instagram Threads (e.g. @1, @9274)
 */
export function getUserMemberNumber(userId?: string, email?: string, tags: string[] = []): string {
  if (tags.some((t) => t.toLowerCase() === 'founder') || isFounderEmail(email) || email?.toLowerCase().trim() === 'ks9875277@gmail.com') {
    return '1';
  }
  if (!userId) return '42';
  
  // Deterministic member number based on userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const num = (Math.abs(hash) % 9200) + 2;
  return num.toString();
}

/**
 * Returns all active display badges for a user in priority order (up to 3 for vertical display)
 */
export function getAllUserBadges(tags: string[], customTag?: string): TagDetails[] {
  const badges: TagDetails[] = [];
  const seen = new Set<string>();

  // Collect all unique tags preserving case for display
  const tagList: string[] = [...tags];
  if (customTag && customTag.trim()) {
    tagList.push(customTag.trim());
  }

  // Priority 1: Founder Tag
  if (tagList.some((t) => t.toLowerCase().trim() === 'founder')) {
    seen.add('founder');
    badges.push({
      id: 'founder',
      name: 'Founder',
      badgeLabel: '✦ FOUNDING MEMBER',
      colorBg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20',
      colorBorder: 'border-amber-400/80',
      colorText: 'text-amber-800 dark:text-amber-300',
      canvasColor: '#B45309', // Amber 700
      canvasBg: '#FEF3C7',    // Amber 100
      canvasBorder: '#F59E0B',// Amber 500
      isSpecial: true,
    });
  }

  // Priority 2: Custom Admin Tags (e.g. "Nothing to Write", "Boring Person", etc.)
  for (const rawTag of tagList) {
    const clean = rawTag.trim();
    const lower = clean.toLowerCase();
    if (!clean || lower === 'founder' || lower === 'cool' || lower === 'clever') continue;
    if (seen.has(lower)) continue;
    seen.add(lower);

    badges.push({
      id: 'custom_' + lower.replace(/\s+/g, '_'),
      name: clean,
      badgeLabel: `✦ ${clean.toUpperCase()}`,
      colorBg: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
      colorBorder: 'border-emerald-400/80',
      colorText: 'text-emerald-800 dark:text-emerald-300',
      canvasColor: '#047857',
      canvasBg: '#ECFDF5',
      canvasBorder: '#10B981',
      isSpecial: true,
    });
  }

  // Priority 3: Clever Tag
  if (tagList.some((t) => t.toLowerCase().trim() === 'clever') && !seen.has('clever')) {
    seen.add('clever');
    badges.push({
      id: 'clever',
      name: 'Clever Strategist',
      badgeLabel: '🧠 CLEVER INVESTOR',
      colorBg: 'bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20',
      colorBorder: 'border-purple-400/80',
      colorText: 'text-purple-800 dark:text-purple-300',
      canvasColor: '#6D28D9',
      canvasBg: '#F3E8FF',
      canvasBorder: '#8B5CF6',
      isSpecial: true,
    });
  }

  // Priority 4: Cool Tag
  if (tagList.some((t) => t.toLowerCase().trim() === 'cool') && !seen.has('cool')) {
    seen.add('cool');
    badges.push({
      id: 'cool',
      name: 'Cool Wealth Builder',
      badgeLabel: '😎 COOL INVESTOR',
      colorBg: 'bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-cyan-500/20',
      colorBorder: 'border-cyan-400/80',
      colorText: 'text-cyan-800 dark:text-cyan-300',
      canvasColor: '#0E7490',
      canvasBg: '#CFFAFE',
      canvasBorder: '#06B6D4',
      isSpecial: true,
    });
  }

  // Default fallback if absolutely no badges
  if (badges.length === 0) {
    badges.push({
      id: 'elite',
      name: 'DhanMITR Elite',
      badgeLabel: '✦ DHANMITR ELITE',
      colorBg: 'bg-emerald-50 text-emerald-700',
      colorBorder: 'border-emerald-200',
      colorText: 'text-emerald-700',
      canvasColor: '#047857',
      canvasBg: '#ECFDF5',
      canvasBorder: '#A7F3D0',
      isSpecial: false,
    });
  }

  return badges;
}

/**
 * Returns primary display badge properties for a user's tags
 */
export function getPrimaryBadge(tags: string[], customTag?: string): TagDetails {
  const all = getAllUserBadges(tags, customTag);
  return all[0];
}
