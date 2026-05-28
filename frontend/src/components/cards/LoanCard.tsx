import { motion } from 'motion/react';
import { getRiskColor, getRiskBg, formatCurrency, formatPercent } from '../../utils/helpers';

interface Props {
  loanType: string;
  approvalChance: number;
  riskLevel: string;
  interestRate: number;
  emi: number;
  totalPayment: number;
  delay?: number;
  icon: React.ReactNode;
}

export default function LoanCard({
  loanType,
  approvalChance,
  riskLevel,
  interestRate,
  emi,
  totalPayment,
  delay = 0,
  icon,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card p-6 hover:border-[#39FF14]/20 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{loanType}</h3>
      </div>

      {/* Approval gauge */}
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Approval Chance</span>
          <span className="text-[#39FF14] font-semibold">{formatPercent(approvalChance)}</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${approvalChance}%` }}
            transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#39FF14] to-emerald-500"
          />
        </div>
      </div>

      {/* Risk badge */}
      <div className="mb-4">
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ color: getRiskColor(riskLevel), backgroundColor: getRiskBg(riskLevel) }}
        >
          {riskLevel} Risk
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Interest Rate</span>
          <span className="text-white font-medium">{formatPercent(interestRate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Monthly EMI</span>
          <span className="text-white font-medium">{formatCurrency(emi)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Payment</span>
          <span className="text-white font-medium">{formatCurrency(totalPayment)}</span>
        </div>
      </div>
    </motion.div>
  );
}
