import axios from 'axios';
import type {
  EligibilityInput,
  EligibilityResult,
  LoanComparisonInput,
  LoanComparisonResult,
  EMIInput,
  EMIResult,
  FinancialHealthInput,
  FinancialHealthResult,
  DashboardData,
  CreditSuggestion,
  AnalyticsData,
} from '../types';

const client = axios.create({
  baseURL: 'http://34.237.155.20:8000/',
  headers: { 'Content-Type': 'application/json' },
});

export async function checkEligibility(data: EligibilityInput): Promise<EligibilityResult> {
  const res = await client.post('/predict', data);
  const bd = res.data;
  return {
    approval_probability: bd.approval_probability,
    risk_level: bd.risk_category || 'Medium',
    recommended_emi: bd.recommended_emi,
    suggested_amount: bd.suggested_loan_amount,
    debt_to_income: bd.features ? bd.features.debt_ratio * 100 : 0,
    max_affordable_emi: bd.recommended_emi * 1.2, // fallback approximation
  };
}

export async function compareLoanTypes(data: LoanComparisonInput): Promise<LoanComparisonResult[]> {
  const res = await client.post('/loan-compare', data);
  return res.data.comparisons || [];
}

export async function calculateEMIApi(data: EMIInput): Promise<EMIResult> {
  const res = await client.post('/emi', data);
  return res.data;
}

export async function getFinancialHealth(data: FinancialHealthInput): Promise<FinancialHealthResult> {
  const res = await client.post('/financial-health', data);
  return res.data;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await client.get('/analytics/overview');
  return res.data;
}

export async function getCreditSuggestions(credit_score: number): Promise<CreditSuggestion> {
  const res = await client.post('/credit-improvement', { credit_score, mode: 'simulate' });
  return res.data;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await client.get('/analytics/spark-stats');
  return res.data;
}

export default client;
