import { useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, Calendar, Percent, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import EMIForm from '../components/forms/EMIForm';
import { calculateEMI, generateAmortization, formatCurrency } from '../utils/helpers';

export default function EMIPlanner() {
  const [form, setForm] = useState({ loan_amount: 2000000, interest_rate: 10, tenure_months: 120 });
  const [calculated, setCalculated] = useState(true);

  const onChange = (field: 'loan_amount' | 'interest_rate' | 'tenure_months', value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setCalculated(false);
  };

  const onSubmit = () => setCalculated(true);

  const emi = calculateEMI(form.loan_amount, form.interest_rate, form.tenure_months);
  const totalPayment = emi * form.tenure_months;
  const totalInterest = totalPayment - form.loan_amount;
  const amortization = calculated ? generateAmortization(form.loan_amount, form.interest_rate, form.tenure_months) : [];

  // Tenure comparison data
  const tenures = [12, 24, 36, 60, 84, 120, 180, 240];
  const tenureData = tenures
    .filter((t) => t <= 360)
    .map((t) => ({
      tenure: `${t}mo`,
      EMI: calculateEMI(form.loan_amount, form.interest_rate, t),
      'Total Interest': calculateEMI(form.loan_amount, form.interest_rate, t) * t - form.loan_amount,
    }));

  // Early repayment: extra payment per month
  const extraPayments = [0, 2000, 5000, 10000];
  const repaymentData = extraPayments.map((extra) => {
    let balance = form.loan_amount;
    const monthlyRate = form.interest_rate / 12 / 100;
    let months = 0;
    let totalPaid = 0;
    while (balance > 0 && months < 600) {
      const interest = balance * monthlyRate;
      const principalPart = emi + extra - interest;
      if (principalPart <= 0) break;
      balance = Math.max(0, balance - principalPart);
      totalPaid += emi + extra;
      months++;
    }
    return {
      label: extra === 0 ? 'No Extra' : `+₹${extra.toLocaleString()}`,
      months,
      totalPaid: Math.round(totalPaid),
      saved: Math.round(totalPayment - totalPaid),
    };
  });

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            EMI <span className="text-gradient-neon">Planner</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Calculate EMIs, compare tenures, view amortization schedules, and simulate early repayment savings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <EMIForm form={form} onChange={onChange} onSubmit={onSubmit} />
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* EMI Result Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: IndianRupee, label: 'Monthly EMI', value: formatCurrency(emi), color: '#39FF14' },
                { icon: Calendar, label: 'Total Payment', value: formatCurrency(totalPayment), color: '#10b981' },
                { icon: Percent, label: 'Total Interest', value: formatCurrency(totalInterest), color: '#f59e0b' },
                { icon: TrendingDown, label: 'Principal', value: formatCurrency(form.loan_amount), color: '#8b5cf6' },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5"
                >
                  <card.icon className="w-5 h-5 mb-3" style={{ color: card.color }} />
                  <div className="text-xs text-gray-400 mb-1">{card.label}</div>
                  <div className="text-lg font-bold text-white">{card.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Tenure Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-lg p-8"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Tenure Comparison</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tenureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="tenure" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '13px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="EMI" stroke="#39FF14" strokeWidth={2} dot={{ fill: '#39FF14', r: 4 }} />
                    <Line type="monotone" dataKey="Total Interest" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Early Repayment Simulator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-lg p-8"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Early Repayment Simulator</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {repaymentData.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${
                      i === 0 ? 'bg-white/5 border-white/10' : 'bg-[#39FF14]/5 border-[#39FF14]/10'
                    }`}
                  >
                    <div className="text-sm font-medium text-white mb-3">{r.label}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Months</span>
                        <span className="text-white font-medium">{r.months}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Paid</span>
                        <span className="text-white font-medium">{formatCurrency(r.totalPaid)}</span>
                      </div>
                      {r.saved > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Saved</span>
                          <span className="text-[#39FF14] font-semibold">{formatCurrency(r.saved)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Amortization Table */}
            {calculated && amortization.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card-lg p-8"
              >
                <h3 className="text-lg font-semibold text-white mb-6">
                  Amortization Schedule
                  <span className="text-sm font-normal text-gray-400 ml-2">(Showing first 24 months)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Month</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">EMI</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Principal</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Interest</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortization.slice(0, 24).map((row) => (
                        <tr key={row.month} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white">{row.month}</td>
                          <td className="py-3 px-4 text-right text-white">{formatCurrency(row.emi)}</td>
                          <td className="py-3 px-4 text-right text-[#39FF14]">{formatCurrency(row.principal)}</td>
                          <td className="py-3 px-4 text-right text-yellow-400">{formatCurrency(row.interest)}</td>
                          <td className="py-3 px-4 text-right text-gray-300">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
