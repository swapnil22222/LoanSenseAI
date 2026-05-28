import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import EligibilityForm from '../components/forms/EligibilityForm';
import GaugeChart from '../components/charts/GaugeChart';
import type { EligibilityInput } from '../types';
import { formatCurrency, getRiskColor, getRiskBg, getApprovalLabel } from '../utils/helpers';
import { checkEligibility } from '../api/client';

const defaultForm: EligibilityInput = {
  salary: 75000,
  existing_loans: 200000,
  credit_score: 720,
  loan_amount: 1500000,
  loan_duration: 60,
  employment_years: 5,
};

interface ResultData {
  approval_probability: number;
  risk_level: string;
  recommended_emi: number;
  suggested_amount: number;
  debt_to_income: number;
  max_affordable_emi: number;
}

function computeFallback(form: EligibilityInput): ResultData {
  const dti = form.existing_loans / (form.salary * 12);
  const scoreNorm = (form.credit_score - 300) / 600;
  const empNorm = Math.min(form.employment_years / 10, 1);
  const loanToIncome = form.loan_amount / (form.salary * 12);

  let prob = (scoreNorm * 0.4 + empNorm * 0.15 + (1 - dti) * 0.25 + (1 - Math.min(loanToIncome / 5, 1)) * 0.2) * 100;
  prob = Math.max(5, Math.min(95, prob));

  const maxEmi = form.salary * 0.4;
  const risk = prob >= 70 ? 'Low' : prob >= 40 ? 'Medium' : 'High';

  return {
    approval_probability: prob,
    risk_level: risk,
    recommended_emi: Math.round(maxEmi * 0.8),
    suggested_amount: Math.round(maxEmi * 0.8 * form.loan_duration * 0.85),
    debt_to_income: dti * 100,
    max_affordable_emi: Math.round(maxEmi),
  };
}

export default function EligibilitySimulator() {
  const [form, setForm] = useState<EligibilityInput>(defaultForm);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (field: keyof EligibilityInput, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await checkEligibility(form);
      setResult(data);
    } catch {
      setResult(computeFallback(form));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Eligibility <span className="text-gradient-neon">Simulator</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Enter your financial details to check your loan eligibility. Our AI analyzes your profile against thousands of data points.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <EligibilityForm form={form} onChange={onChange} onSubmit={onSubmit} loading={loading} />

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card-lg p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Results</h2>

            {result ? (
              <div className="space-y-6">
                {/* Gauge */}
                <div className="flex justify-center">
                  <GaugeChart value={result.approval_probability} label="Approval Probability" size={240} />
                </div>

                {/* Approval label */}
                <div className="text-center">
                  <span className="text-lg font-semibold text-white">
                    {getApprovalLabel(result.approval_probability)}
                  </span>
                </div>

                {/* Risk badge */}
                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      color: getRiskColor(result.risk_level),
                      backgroundColor: getRiskBg(result.risk_level),
                    }}
                  >
                    {result.risk_level === 'Low' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {result.risk_level} Risk
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: IndianRupee, label: 'Recommended EMI', value: formatCurrency(result.recommended_emi) },
                    { icon: Shield, label: 'Suggested Amount', value: formatCurrency(result.suggested_amount) },
                    { icon: AlertTriangle, label: 'Debt-to-Income', value: result.debt_to_income.toFixed(1) + '%' },
                    { icon: CheckCircle, label: 'Max Affordable EMI', value: formatCurrency(result.max_affordable_emi) },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-white/5 rounded-xl p-4"
                    >
                      <m.icon className="w-4 h-4 text-[#39FF14] mb-2" />
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-white font-semibold">{m.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-gray-500">
                <Shield className="w-16 h-16 mb-4 text-gray-700" />
                <p className="text-center">Enter your details and click<br />"Check Eligibility" to see results</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
