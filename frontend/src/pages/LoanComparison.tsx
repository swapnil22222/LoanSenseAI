import { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Car, GraduationCap, Wallet } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import ComparisonForm from '../components/forms/ComparisonForm';
import LoanCard from '../components/cards/LoanCard';
import { calculateEMI, formatCurrency } from '../utils/helpers';
import { compareLoanTypes } from '../api/client';

interface FormData {
  salary: number;
  existing_loans: number;
  credit_score: number;
  employment_years: number;
  loan_amount: number;
}

interface LoanResult {
  loanType: string;
  approvalChance: number;
  riskLevel: string;
  interestRate: number;
  emi: number;
  totalPayment: number;
  icon: React.ReactNode;
}

const loanConfigs = [
  { type: 'Home Loan', rate: 8.5, tenure: 240, icon: <Home className="w-5 h-5 text-[#39FF14]" />, factor: 1.0 },
  { type: 'Car Loan', rate: 9.5, tenure: 60, icon: <Car className="w-5 h-5 text-[#39FF14]" />, factor: 0.4 },
  { type: 'Education Loan', rate: 10.5, tenure: 84, icon: <GraduationCap className="w-5 h-5 text-[#39FF14]" />, factor: 0.5 },
  { type: 'Personal Loan', rate: 14.0, tenure: 48, icon: <Wallet className="w-5 h-5 text-[#39FF14]" />, factor: 0.25 },
];

function computeFallback(form: FormData): LoanResult[] {
  const scoreNorm = (form.credit_score - 300) / 600;
  const empNorm = Math.min(form.employment_years / 10, 1);
  const dtiBase = form.existing_loans / (form.salary * 12);

  return loanConfigs.map((cfg) => {
    const amount = form.loan_amount * cfg.factor;
    const emi = calculateEMI(amount, cfg.rate, cfg.tenure);
    const totalPayment = emi * cfg.tenure;
    const loanToIncome = amount / (form.salary * 12);
    let prob = (scoreNorm * 0.4 + empNorm * 0.15 + (1 - dtiBase) * 0.25 + (1 - Math.min(loanToIncome / 5, 1)) * 0.2) * 100;
    prob = Math.max(10, Math.min(95, prob + (cfg.type === 'Home Loan' ? 5 : cfg.type === 'Personal Loan' ? -10 : 0)));
    const risk = prob >= 70 ? 'Low' : prob >= 40 ? 'Medium' : 'High';

    return {
      loanType: cfg.type,
      approvalChance: Math.round(prob * 10) / 10,
      riskLevel: risk,
      interestRate: cfg.rate,
      emi,
      totalPayment,
      icon: cfg.icon,
    };
  });
}

export default function LoanComparison() {
  const [form, setForm] = useState<FormData>({
    salary: 75000,
    existing_loans: 200000,
    credit_score: 720,
    employment_years: 5,
    loan_amount: 2000000,
  });
  const [results, setResults] = useState<LoanResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (field: keyof FormData, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await compareLoanTypes(form);
      const mapped = data.map((d, i) => ({
        loanType: d.loan_type,
        approvalChance: d.approval_chance,
        riskLevel: d.risk_level,
        interestRate: d.interest_rate,
        emi: d.emi,
        totalPayment: d.total_payment,
        icon: loanConfigs[i]?.icon || <Wallet className="w-5 h-5 text-[#39FF14]" />,
      }));
      setResults(mapped);
    } catch {
      setResults(computeFallback(form));
    } finally {
      setLoading(false);
    }
  };

  const chartData = results?.map((r) => ({
    name: r.loanType.replace(' Loan', ''),
    'Approval %': r.approvalChance,
    'Interest %': r.interestRate,
  }));

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Loan <span className="text-gradient-neon">Comparison</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Compare different loan types side-by-side. See approval chances, interest rates, and EMIs for Home, Car, Education, and Personal loans.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <ComparisonForm form={form} onChange={onChange} onSubmit={onSubmit} loading={loading} />
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {results ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {results.map((r, i) => (
                    <LoanCard
                      key={r.loanType}
                      {...r}
                      delay={i * 0.1}
                    />
                  ))}
                </div>

                {/* Comparison Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card-lg p-8"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Comparison Chart</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '13px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="Approval %" fill="#39FF14" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Interest %" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="glass-card-lg p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500 text-center">
                  Fill in your details and click "Compare Loans"<br />to see results across 4 loan types
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
