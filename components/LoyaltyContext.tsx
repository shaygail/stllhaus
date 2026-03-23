"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LoyaltyCard = {
  customerId: string;
  name: string;
  email: string;
  totalPoints: number;
  totalPurchases: number;
  totalSpent: number;
  tier: "bronze" | "silver" | "gold";
  joinedAt: string;
  lastPurchase?: string;
};

type LoyaltyContextValue = {
  card: LoyaltyCard | null;
  pointsPerDollar: number;
  addPoints: (amount: number, purchaseAmount: number) => void;
  initializeCard: (name: string, email: string) => void;
  getTierBenefits: () => string[];
  getPointsUntilNextTier: () => number;
};

const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);
const STORAGE_KEY = "stll-loyalty-card";
const POINTS_PER_DOLLAR = 10;

function determineTier(
  totalPoints: number,
): "bronze" | "silver" | "gold" {
  if (totalPoints >= 500) return "gold";
  if (totalPoints >= 250) return "silver";
  return "bronze";
}

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCard(parsed);
      } catch {
        setCard(null);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && card) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
    }
  }, [card, isLoaded]);

  const addPoints = (pointsEarned: number, purchaseAmount: number) => {
    setCard((prev) => {
      if (!prev) return null;
      const newPoints = prev.totalPoints + pointsEarned;
      const newTier = determineTier(newPoints);
      return {
        ...prev,
        totalPoints: newPoints,
        totalPurchases: prev.totalPurchases + 1,
        totalSpent: prev.totalSpent + purchaseAmount,
        tier: newTier,
        lastPurchase: new Date().toISOString(),
      };
    });
  };

  const initializeCard = (name: string, email: string) => {
    const customerId = `STLL-${Date.now()}`;
    setCard({
      customerId,
      name,
      email,
      totalPoints: 0,
      totalPurchases: 0,
      totalSpent: 0,
      tier: "bronze",
      joinedAt: new Date().toISOString(),
    });
  };

  const getTierBenefits = () => {
    if (!card) return [];
    switch (card.tier) {
      case "gold":
        return [
          "20% discount on all drinks",
          "Free drink every 5 purchases",
          "Early access to seasonal drinks",
          "Birthday bonus: 50 free points",
        ];
      case "silver":
        return [
          "10% discount on all drinks",
          "Free drink every 10 purchases",
          "Special member-only offers",
        ];
      case "bronze":
      default:
        return [
          "1 point per dollar spent",
          "Free drink at 100 points",
          "Earn tier upgrades",
        ];
    }
  };

  const getPointsUntilNextTier = () => {
    if (!card) return 0;
    if (card.tier === "gold") return 0;
    const nextThreshold = card.tier === "silver" ? 500 : 250;
    return Math.max(0, nextThreshold - card.totalPoints);
  };

  const value: LoyaltyContextValue = useMemo(
    () => ({
      card,
      pointsPerDollar: POINTS_PER_DOLLAR,
      addPoints,
      initializeCard,
      getTierBenefits,
      getPointsUntilNextTier,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card],
  );

  return (
    <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error("useLoyalty must be used within LoyaltyProvider");
  }
  return context;
}
