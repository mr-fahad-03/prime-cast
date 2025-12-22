import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    trialStartDate: string;
    trialDays: number;
    isSubscribed: boolean;
    subscriptionEnd: string | null;
    isSuspended: boolean;
    suspendReason: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      trialStartDate: string;
      trialDays: number;
      isSubscribed: boolean;
      subscriptionEnd: string | null;
      isSuspended: boolean;
      suspendReason: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    trialStartDate: string;
    trialDays: number;
    isSubscribed: boolean;
    subscriptionEnd: string | null;
    isSuspended: boolean;
    suspendReason: string | null;
  }
}
