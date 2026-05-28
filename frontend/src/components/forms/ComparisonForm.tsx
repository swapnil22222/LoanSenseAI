import { motion } from 'motion/react';

interface ComparisonData {
  salary: number;
  existing_loans: number;
  credit_score: number;
  employment_years: number;
  loan_amount: number;
}

interface Props {
  form: ComparisonData;
  onChange: (field: keyof ComparisonData, value: number) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const fields: { key: keyof ComparisonData; label: string; placeholder: string }[] = [
  { key: 'salary', label: 'Monthly Salary (₹)', placeholder: '75000' },
  { key: 'existing_loans', label: 'Existing Loans (₹)', placeholder: '200000' },
  { key: 'credit_score', label: 'Credit Score', placeholder: '720' },
  { key: 'employment_years', label: 'Employment Years', placeholder: '5' },
  { key: 'loan_amount', label: 'Desired Loan Amount (₹)', placeholder: '1000000' },
];

export default function ComparisonForm({ form, onChange, onSubmit, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-lg p-8"
    >
      <h2 className="text-xl font-bold text-white mb-6">Compare Loan Types</h2>
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
        {loading ? 'Comparing...' : 'Compare Loans'}
      </button>
    </motion.div>
  );
}
