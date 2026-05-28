import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, TrendingUp, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import GaugeChart from '../components/charts/GaugeChart';
import RadarChart from '../components/charts/RadarChart';
import { getRiskColor, getRiskBg } from '../utils/helpers';
import { getFinancialHealth } from '../api/client';

interface FormData {
  salary: number;
  existing_loans: number;
  credit_score: number;
  monthly_expenses: number;
  savings: number;
}

interface HealthResult {
  overall_score: number;
  dimensions: { name: string; score: number; label: string }[];
  metrics: { label: string; value: string; status: 'good' | 'warning' | 'critical' }[];
}

function computeFallback(form: FormData): HealthResult {
  const dti = form.existing_loans > 0 ? Math.min((form.existing_loans / (form.salary * 12)) * 100, 100) : 5;
  const savings_ratio = form.savings / (form.salary * 12) * 100;
  const expense_ratio = (form.monthly_expenses / form.salary) * 100;
  const credit_norm = ((form.credit_score - 300) / 600) * 100;

  const incomeScore = Math.min(100, (form.salary / 100000) * 100);
  const debtScore = Math.max(0, 100 - dti * 2);
  const creditScore = credit_norm;
  const savingsScore = Math.min(100, savings_ratio * 5);
  const expenseScore = Math.max(0, 100 - expense_ratio);

  const overall = (incomeScore * 0.2 + debtScore * 0.25 + creditScore * 0.25 + savingsScore * 0.15 + expenseScore * 0.15);

  return {
    overall_score: Math.round(overall),
    dimensions: [
      { name: 'Income', score: Math.round(incomeScore), label: incomeScore >= 70 ? 'Strong' : incomeScore >= 40 ? 'Moderate' : 'Low' },
      { name: 'Debt', score: Math.round(debtScore), label: debtScore >= 70 ? 'Healthy' : debtScore >= 40 ? 'Moderate' : 'High' },
      { name: 'Credit', score: Math.round(creditScore), label: creditScore >= 70 ? 'Excellent' : creditScore >= 40 ? 'Fair' : 'Poor' },
      { name: 'Savings', score: Math.round(savingsScore), label: savingsScore >= 70 ? 'Strong' : savingsScore >= 40 ? 'Growing' : 'Low' },
      { name: 'Expenses', score: Math.round(expenseScore), label: expenseScore >= 70 ? 'Efficient' : expenseScore >= 40 ? 'Moderate' : 'High' },
    ],
    metrics: [
      { label: 'Debt-to-Income Ratio', value: dti.toFixed(1) + '%', status: dti < 30 ? 'good' : dti < 50 ? 'warning' : 'critical' },
      { label: 'Savings Ratio', value: savings_ratio.toFixed(1) + '%', status: savings_ratio > 20 ? 'good' : savings_ratio > 10 ? 'warning' : 'critical' },
      { label: 'Expense Ratio', value: expense_ratio.toFixed(1) + '%', status: expense_ratio < 50 ? 'good' : expense_ratio < 70 ? 'warning' : 'critical' },
      { label: 'Credit Score', value: form.credit_score.toString(), status: form.credit_score >= 700 ? 'good' : form.credit_score >= 600 ? 'warning' : 'critical' },
      { label: 'Emergency Fund', value: (form.savings / form.monthly_expenses).toFixed(1) + ' months', status: form.savings / form.monthly_expenses >= 6 ? 'good' : form.savings / form.monthly_expenses >= 3 ? 'warning' : 'critical' },
      { label: 'Net Monthly Surplus', value: '₹' + (form.salary - form.monthly_expenses).toLocaleString(), status: form.salary - form.monthly_expenses > 20000 ? 'good' : form.salary - form.monthly_expenses > 0 ? 'warning' : 'critical' },
    ],
  };
}

const statusConfig = {
  good: { color: '#39FF14', bg: 'rgba(57,255,20,0.1)', icon: CheckCircle, label: 'Good' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle, label: 'Warning' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle, label: 'Critical' },
};

export default function FinancialHealth() {
  const [form, setForm] = useState<FormData>({
    salary: 80000,
    existing_loans: 300000,
    credit_score: 730,
    monthly_expenses: 35000,
    savings: 500000,
  });
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (field: keyof FormData, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await getFinancialHealth(form);
      setResult(data);
    } catch {
      setResult(computeFallback(form));
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof FormData; label: string; placeholder: string }[] = [
    { key: 'salary', label: 'Monthly Salary (₹)', placeholder: '80000' },
    { key: 'existing_loans', label: 'Total Existing Loans (₹)', placeholder: '300000' },
    { key: 'credit_score', label: 'Credit Score', placeholder: '730' },
    { key: 'monthly_expenses', label: 'Monthly Expenses (₹)', placeholder: '35000' },
    { key: 'savings', label: 'Total Savings (₹)', placeholder: '500000' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Financial <span className="text-gradient-neon">Health</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Get a comprehensive assessment of your financial health across 5 key dimensions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card-lg p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Your Financial Profile</h2>
            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">{f.label}</label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={(e) => onChange(f.key, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="btn-neon w-full mt-6 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Health'}
            </button>
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-8">
            {result ? (
              <>
                {/* Gauge + Radar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-lg p-8 flex flex-col items-center"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Overall Score</h3>
                    <GaugeChart value={result.overall_score} size={220} label="out of 100" />
                    <div className="mt-4">
                      <span
                        className="px-4 py-2 rounded-full text-sm font-semibold"
                        style={{
                          color: getRiskColor(result.overall_score >= 70 ? 'Low' : result.overall_score >= 40 ? 'Medium' : 'High'),
                          backgroundColor: getRiskBg(result.overall_score >= 70 ? 'Low' : result.overall_score >= 40 ? 'Medium' : 'High'),
                        }}
                      >
                        {result.overall_score >= 70 ? 'Healthy' : result.overall_score >= 40 ? 'Needs Improvement' : 'At Risk'}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card-lg p-8"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Dimension Analysis</h3>
                    <RadarChart
                      data={result.dimensions.map((d) => ({ name: d.name, score: d.score }))}
                      size={260}
                    />
                  </motion.div>
                </div>

                {/* Metric Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.metrics.map((m, i) => {
                      const cfg = statusConfig[m.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="glass-card p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm text-gray-400">{m.label}</span>
                            <span
                              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                              style={{ color: cfg.color, backgroundColor: cfg.bg }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-white">{m.value}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Dimension Scores */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card-lg p-8"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Dimension Scores</h3>
                  <div className="space-y-4">
                    {result.dimensions.map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{d.score}/100</span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                color: getRiskColor(d.score >= 70 ? 'Low' : d.score >= 40 ? 'Medium' : 'High'),
                                backgroundColor: getRiskBg(d.score >= 70 ? 'Low' : d.score >= 40 ? 'Medium' : 'High'),
                              }}
                            >
                              {d.label}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${d.score}%` }}
                            transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                            className="h-full rounded-full"
                            style={{
                              background: d.score >= 70
                                ? 'linear-gradient(to right, #39FF14, #10b981)'
                                : d.score >= 40
                                ? 'linear-gradient(to right, #f59e0b, #eab308)'
                                : 'linear-gradient(to right, #ef4444, #dc2626)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="glass-card-lg p-12 flex flex-col items-center justify-center min-h-[400px]">
                <Heart className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-500 text-center">
                  Enter your financial details and click<br />"Analyze Health" to see your assessment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
