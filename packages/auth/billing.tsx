// Billing-related exports
export const BILLING_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type BillingPlan = (typeof BILLING_PLANS)[keyof typeof BILLING_PLANS];

export interface BillingFeatures {
  maxUsers: number;
  maxProjects: number;
  supportLevel: 'community' | 'email' | 'priority';
  customBranding: boolean;
}

export const PLAN_FEATURES: Record<BillingPlan, BillingFeatures> = {
  [BILLING_PLANS.FREE]: {
    maxUsers: 1,
    maxProjects: 3,
    supportLevel: 'community',
    customBranding: false,
  },
  [BILLING_PLANS.PRO]: {
    maxUsers: 10,
    maxProjects: -1, // unlimited
    supportLevel: 'email',
    customBranding: true,
  },
  [BILLING_PLANS.ENTERPRISE]: {
    maxUsers: -1, // unlimited
    maxProjects: -1, // unlimited
    supportLevel: 'priority',
    customBranding: true,
  },
};
