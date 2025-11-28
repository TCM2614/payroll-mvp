import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock("@/components/layout/AppShell", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/components/landing/EmailSignupSection", () => ({
  __esModule: true,
  default: () => <div data-testid="email-signup" />,
}));

vi.mock("@/components/landing/FeedbackModal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="feedback-modal" /> : null),
}));

vi.mock("@/components/landing/CookieBanner", () => ({
  __esModule: true,
  default: () => <div data-testid="cookie-banner" />,
}));

vi.mock("@/components/EarlyAccessForm", () => ({
  __esModule: true,
  EarlyAccessForm: () => <form data-testid="early-access" />,
}));

vi.mock("@/components/take-home-calculator", () => ({
  __esModule: true,
  TakeHomeCalculator: ({
    onSummaryChange,
    onGrossChange,
    onNetChange,
  }: {
    onSummaryChange?: (value: any) => void;
    onGrossChange?: (value: number) => void;
    onNetChange?: (value: number) => void;
  }) => {
    React.useEffect(() => {
      onSummaryChange?.({
        annualNet: 48000,
        monthlyNet: 4000,
        weeklyNet: 923.08,
        annualGross: 60000,
      });
      onGrossChange?.(60000);
      onNetChange?.(48000);
    }, [onSummaryChange, onGrossChange, onNetChange]);

    return <div data-testid="take-home-calculator">Calculator</div>;
  },
}));

vi.mock("@/components/StickySummary", () => ({
  __esModule: true,
  StickySummary: () => <div data-testid="sticky-summary">Summary</div>,
}));

vi.mock("@/components/WealthInsights", () => ({
  __esModule: true,
  WealthInsights: ({ salary }: { salary: number }) => (
    <div data-testid="wealth-insights">Salary {salary}</div>
  ),
}));

vi.mock("@/components/MortgageAffordability", () => ({
  __esModule: true,
  MortgageAffordability: ({ salary }: { salary: number }) => (
    <div data-testid="mortgage" data-salary={salary} />
  ),
}));

import HomeClient from "@/components/HomeClient";
import { DistributionTooltip } from "@/components/WealthDistributionChart";

describe("HomeClient regression", () => {
  it("renders the wealth visuals section exactly once", async () => {
    const { container } = render(<HomeClient />);

    await waitFor(() => expect(screen.getByTestId("sticky-summary")).toBeInTheDocument());

    const wealthSections = container.querySelectorAll("#wealth-visuals");
    expect(wealthSections).toHaveLength(1);
  });
});

describe("DistributionTooltip", () => {
  it("returns null when inactive", () => {
    const { container } = render(<DistributionTooltip active={false} payload={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders each payload entry when active", () => {
    const payload = [
      { payload: { income: 50000, percentile: 80, density: 0.2 } },
      { payload: { income: 90000, percentile: 95, density: 0.1 } },
    ];

    render(<DistributionTooltip active payload={payload} />);

    expect(screen.getByText("Top 20.0% of earners")).toBeInTheDocument();
    expect(screen.getByText("Top 5.0% of earners")).toBeInTheDocument();
  });
});
