export function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return '₹' + (value / 10000000).toFixed(2) + ' Cr';
  }
  if (value >= 100000) {
    return '₹' + (value / 100000).toFixed(2) + ' L';
  }
  return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

export function getRiskColor(risk: string): string {
  const r = risk.toLowerCase();
  if (r === 'low' || r === 'very low') return '#39FF14';
  if (r === 'medium' || r === 'moderate') return '#f59e0b';
  if (r === 'high') return '#ef4444';
  if (r === 'very high' || r === 'critical') return '#dc2626';
  return '#9ca3af';
}

export function getRiskBg(risk: string): string {
  const r = risk.toLowerCase();
  if (r === 'low' || r === 'very low') return 'rgba(57, 255, 20, 0.1)';
  if (r === 'medium' || r === 'moderate') return 'rgba(245, 158, 11, 0.1)';
  if (r === 'high') return 'rgba(239, 68, 68, 0.1)';
  if (r === 'very high' || r === 'critical') return 'rgba(220, 38, 38, 0.1)';
  return 'rgba(156, 163, 175, 0.1)';
}

export function getScoreLabel(score: number): string {
  if (score >= 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Fair';
  if (score >= 500) return 'Poor';
  return 'Very Poor';
}

export function getApprovalLabel(probability: number): string {
  if (probability >= 80) return 'Very Likely';
  if (probability >= 60) return 'Likely';
  if (probability >= 40) return 'Moderate';
  if (probability >= 20) return 'Unlikely';
  return 'Very Unlikely';
}

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

export function generateAmortization(principal: number, annualRate: number, tenureMonths: number) {
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const rows = [];
  let balance = principal;

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({
      month: i,
      emi,
      principal: principalPart,
      interest,
      balance: Math.round(balance),
    });
  }
  return rows;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
