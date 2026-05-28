import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -8 }}
      className="glass-card p-8 group hover:border-[#39FF14]/30 transition-all duration-300 cursor-pointer"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/10 flex items-center justify-center mb-6 group-hover:bg-[#39FF14]/20 group-hover:shadow-[0_0_30px_rgba(57,255,20,0.15)] transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
