import { motion } from 'motion/react';

interface EMIFormData {
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
}

interface Props {
  form: EMIFormData;
  onChange: (field: keyof EMIFormData, value: number) => void;
  onSubmit: () => void;
}

export default function EMIForm({ form, onChange, onSubmit }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-lg p-8"
    >
      <h2 className="text-xl font-bold text-white mb-6">EMI Calculator</h2>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <label className="flex justify-between text-sm text-gray-400 mb-2 font-medium">
            <span>Loan Amount</span>
            <span className="text-[#39FF14]">₹{form.loan_amount.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={50000}
            max={10000000}
            step={50000}
            value={form.loan_amount}
            onChange={(e) => onChange('loan_amount', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#39FF14]"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>₹50K</span>
            <span>₹1Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="flex justify-between text-sm text-gray-400 mb-2 font-medium">
            <span>Interest Rate (%)</span>
            <span className="text-[#39FF14]">{form.interest_rate}%</span>
          </label>
          <input
            type="range"
            min={5}
            max={25}
            step={0.25}
            value={form.interest_rate}
            onChange={(e) => onChange('interest_rate', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#39FF14]"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>5%</span>
            <span>25%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <label className="flex justify-between text-sm text-gray-400 mb-2 font-medium">
            <span>Tenure</span>
            <span className="text-[#39FF14]">{form.tenure_months} months</span>
          </label>
          <input
            type="range"
            min={6}
            max={360}
            step={6}
            value={form.tenure_months}
            onChange={(e) => onChange('tenure_months', Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#39FF14]"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>6 mo</span>
            <span>30 yr</span>
          </div>
        </div>
      </div>

      <button onClick={onSubmit} className="btn-neon w-full mt-8">
        Calculate EMI
      </button>
    </motion.div>
  );
}
