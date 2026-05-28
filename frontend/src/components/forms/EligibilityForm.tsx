import { motion } from 'motion/react';
import type { EligibilityInput } from '../../types';

interface Props {
  form: EligibilityInput;
  onChange: (field: keyof EligibilityInput, value: number) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const fields: { key: keyof EligibilityInput; label: string; placeholder: string; min: number; max: number; step: number }[] = [
  { key: 'salary', label: 'Monthly Salary (₹)', placeholder: '50000', min: 0, max: 10000000, step: 1000 },
  { key: 'existing_loans', label: 'Existing Loans (₹)', placeholder: '0', min: 0, max: 50000000, step: 1000 },
  { key: 'credit_score', label: 'Credit Score', placeholder: '750', min: 300, max: 900, step: 1 },
  { key: 'loan_amount', label: 'Desired Loan Amount (₹)', placeholder: '500000', min: 0, max: 100000000, step: 10000 },
  { key: 'loan_duration', label: 'Loan Duration (months)', placeholder: '60', min: 6, max: 360, step: 6 },
  { key: 'employment_years', label: 'Employment Years', placeholder: '5', min: 0, max: 50, step: 1 },
];

export default function EligibilityForm({ form, onChange, onSubmit, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-lg p-8"
    >
      <h2 className="text-xl font-bold text-white mb-6">Check Your Eligibility</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm text-gray-400 mb-2 font-medium">{f.label}</label>
            <input
              type="number"
              className="input-dark"
              placeholder={f.placeholder}
              min={f.min}
              max={f.max}
              step={f.step}
              value={form[f.key] || ''}
              onChange={(e) => onChange(f.key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="btn-neon w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Check Eligibility'}
      </button>
    </motion.div>
  );
}
