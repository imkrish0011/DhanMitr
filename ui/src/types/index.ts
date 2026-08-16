/**
 * UI Type definitions - Re-exported from shared contracts + local UI state models
 */
export * from "../../../shared/types/typescript";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
