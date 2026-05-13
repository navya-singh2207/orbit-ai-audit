export interface ToolInput {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditRecommendation {
  toolName: string;
  currentPlan: string;
  recommendedAction: string;
  savings: number;
  reason: string;
}

export interface AuditResult {
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  isOptimal: boolean;
}

const PRICING: Record<string, any> = {
  "Cursor": {
    "Hobby": 0,
    "Pro": 20,
    "Business": 40,
    "Enterprise": 100
  },
  "GitHub Copilot": {
    "Individual": 10,
    "Business": 19,
    "Enterprise": 39
  },
  "Claude": {
    "Free": 0,
    "Pro": 20,
    "Max": 50,
    "Team": 30, // min 5
    "Enterprise": 75
  },
  "ChatGPT": {
    "Plus": 20,
    "Team": 30,
    "Enterprise": 60
  }
};

export function runAudit(tools: ToolInput[], teamSize: number, useCase: string): AuditResult {
  const recommendations: AuditRecommendation[] = [];
  let totalMonthlySavings = 0;
  let totalCurrentSpend = 0;

  tools.forEach(tool => {
    totalCurrentSpend += tool.monthlySpend;
    let rec: AuditRecommendation = {
      toolName: tool.name,
      currentPlan: tool.plan,
      recommendedAction: "Keep current plan",
      savings: 0,
      reason: "Your current plan is optimal for your team size."
    };

    // Logic for Cursor
    if (tool.name === "Cursor") {
      if (tool.plan === "Business" && teamSize < 3) {
        rec.recommendedAction = "Downgrade to Pro";
        rec.savings = (tool.monthlySpend - (20 * tool.seats));
        rec.reason = "Business features are overkill for small teams; individual Pro seats save ~$20/mo each.";
      }
    }

    // Logic for GitHub Copilot
    if (tool.name === "GitHub Copilot") {
      if (tool.plan === "Enterprise" && teamSize < 10) {
        rec.recommendedAction = "Downgrade to Business";
        rec.savings = (tool.monthlySpend - (19 * tool.seats));
        rec.reason = "Enterprise Copilot features like custom models are rarely utilized by teams under 10.";
      }
    }

    // Logic for Team plans (Generic)
    if (tool.plan.includes("Team") || tool.plan === "Business") {
      if (tool.seats === 1) {
        rec.recommendedAction = "Switch to Individual/Pro";
        const unitPrice = PRICING[tool.name]?.["Pro"] || PRICING[tool.name]?.["Individual"] || 20;
        rec.savings = tool.monthlySpend - unitPrice;
        rec.reason = "Single-seat 'Team' plans usually carry a premium without providing multi-user benefits.";
      }
    }

    // Use Case specific suggestions
    if (useCase === "coding" && tool.name === "ChatGPT" && tool.plan === "Plus") {
      rec.recommendedAction = "Switch to Cursor Pro";
      rec.savings = 0; // Cost parity usually
      rec.reason = "For dedicated coding, Cursor provides better IDE integration for the same price as ChatGPT Plus.";
    }

    if (rec.savings > 0) {
      recommendations.push(rec);
      totalMonthlySavings += rec.savings;
    } else {
      recommendations.push(rec);
    }
  });

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    totalCurrentSpend,
    isOptimal: totalMonthlySavings === 0
  };
}
