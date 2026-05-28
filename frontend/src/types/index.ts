export interface EligibilityInput {
  salary: number;
  existing_loans: number;
  credit_score: number;
  loan_amount: number;
  loan_duration: number;
  employment_years: number;
}

export interface EligibilityResult {
  approval_probability: number;
  risk_level: string;
  recommended_emi: number;
  suggested_amount: number;
  debt_to_income: number;
  max_affordable_emi: number;
}

export interface LoanComparisonInput {
  salary: number;
  existing_loans: number;
  credit_score: number;
  employment_years: number;
  loan_amount: number;
}

export interface LoanComparisonResult {
  loan_type: string;
  approval_chance: number;
  risk_level: string;
  interest_rate: number;
  emi: number;
  total_payment: number;
}

export interface EMIInput {
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
}

export interface EMIResult {
  emi: number;
  total_payment: number;
  total_interest: number;
  principal: number;
}

export interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface FinancialHealthInput {
  salary: number;
  existing_loans: number;
  credit_score: number;
  monthly_expenses: number;
  savings: number;
}

export interface FinancialHealthResult {
  overall_score: number;
  dimensions: {
    name: string;
    score: number;
    label: string;
  }[];
  metrics: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
  }[];
}

export interface DashboardData {
  total_applications: number;
  approved: number;
  rejected: number;
  pending: number;
  approval_rate: number;
  avg_loan_amount: number;
  avg_credit_score: number;
  total_disbursed: number;
  applications: ApplicationRow[];
  approval_history: { month: string; approved: number; rejected: number }[];
  risk_trends: { month: string; low: number; medium: number; high: number }[];
  recent_activity: { action: string; details: string; time: string }[];
}

export interface ApplicationRow {
  id: string;
  name: string;
  amount: number;
  status: 'Approved' | 'Rejected' | 'Pending';
  risk: string;
  date: string;
  score: number;
}

export interface CreditSuggestion {
  current_score: number;
  potential_score: number;
  scenarios: {
    title: string;
    description: string;
    impact: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }[];
  actions: {
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    timeframe: string;
  }[];
}

export interface AnalyticsData {
  total_loans: number;
  total_volume: number;
  avg_interest: number;
  default_rate: number;
  distribution: { name: string; value: number; fill: string }[];
  risk_clusters: { cluster: string; count: number; fill: string }[];
  income_distribution: { range: string; count: number }[];
  time_trends: { month: string; applications: number; approvals: number; disbursed: number }[];
}

export interface KPIData {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon: string;
}
