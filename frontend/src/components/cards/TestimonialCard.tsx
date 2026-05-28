import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface Props {
  name: string;
  role: string;
  quote: string;
  rating: number;
  delay?: number;
}

export default function TestimonialCard({ name, role, quote, rating, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-8"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-[#39FF14] fill-[#39FF14]' : 'text-gray-600'}`}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{quote}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-emerald-600 flex items-center justify-center text-black font-bold text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-white font-medium text-sm">{name}</div>
          <div className="text-gray-500 text-xs">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}
