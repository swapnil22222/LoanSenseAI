import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle,
  BarChart3,
  Target,
  Activity,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dollar: DollarSign,
  users: Users,
  check: CheckCircle,
  chart: BarChart3,
  target: Target,
  activity: Activity,
  trending: TrendingUp,
};

interface Props {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon?: string;
  delay?: number;
}

export default function KPICard({ label, value, prefix = '', suffix = '', trend, icon = 'chart', delay = 0 }: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = iconMap[icon] || BarChart3;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime - delay * 1000;
        if (elapsed < 0) {
          requestAnimationFrame(animate);
          return;
        }
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card p-6 hover:border-[#39FF14]/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#39FF14]" />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
              trend >= 0 ? 'text-[#39FF14] bg-[#39FF14]/10' : 'text-red-400 bg-red-400/10'
            }`}
          >
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {prefix}{displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}
