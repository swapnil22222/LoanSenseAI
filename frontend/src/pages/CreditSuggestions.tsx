import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Target,
  Clock,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import GaugeChart from '../components/charts/GaugeChart';
import { getRiskColor, getRiskBg } from '../utils/helpers';

interface Scenario {
  title: string;
  description: string;
  impact: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  currentApproval: number;
  newApproval: number;
}

const mockScenarios: Scenario[] = [
  {
    title: 'Pay Off Credit Card Debt',
    description: 'Reducing credit utilization from 70% to 30% can significantly boost your score.',
    impact: 45,
    difficulty: 'Medium',
    currentApproval: 62,
    newApproval: 78,
  },
  {
    title: 'Increase Employment Tenure',
    description: 'Staying at your current job for 2+ more years shows stability to lenders.',
    impact: 20,
    difficulty: 'Easy',
    currentApproval: 62,
    newApproval: 70,
  },
  {
    title: 'Build Emergency Fund',
    description: 'Having 6 months of expenses saved shows financial responsibility.',
    impact: 30,
    difficulty: 'Medium',
    currentApproval: 62,
    newApproval: 75,
  },
  {
    title: 'Diversify Credit Mix',
    description: 'Having different types of credit accounts improves your credit profile.',
    impact: 15,
    difficulty: 'Hard',
    currentApproval: 62,
    newApproval: 68,
  },
];

const actions = [
  { action: 'Set up auto-pay for all bills', priority: 'High' as const, timeframe: '1 week', icon: Zap },
  { action: 'Request credit limit increase', priority: 'High' as const, timeframe: '2 weeks', icon: TrendingUp },
  { action: 'Pay down highest interest debt first', priority: 'High' as const, timeframe: '3 months', icon: Target },
  { action: 'Avoid new credit applications for 6 months', priority: 'Medium' as const, timeframe: '6 months', icon: Shield },
  { action: 'Check credit report for errors', priority: 'Medium' as const, timeframe: '1 week', icon: CheckCircle },
  { action: 'Keep oldest credit accounts open', priority: 'Low' as const, timeframe: 'Ongoing', icon: Clock },
];

const priorityColors = {
  High: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Low: { color: '#39FF14', bg: 'rgba(57,255,20,0.1)' },
};

const difficultyColors = {
  Easy: { color: '#39FF14', bg: 'rgba(57,255,20,0.1)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function CreditSuggestions() {
  const [currentScore] = useState(680);
  const [potentialScore] = useState(780);
  const [targetApproval, setTargetApproval] = useState(80);

  // Goal mode: compute requirements
  const scoreNeeded = Math.round(300 + (targetApproval / 100) * 600);
  const scoreGap = Math.max(0, scoreNeeded - currentScore);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Credit <span className="text-gradient-neon">Suggestions</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Personalized recommendations to improve your credit score and boost loan approval chances.
          </p>
        </motion.div>

        {/* Current vs Potential */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-lg p-8 text-center"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Current Score</h3>
            <GaugeChart value={currentScore} maxValue={900} size={200} label="out of 900" />
            <div className="mt-4">
              <span className="text-sm text-gray-400">
                {currentScore >= 700 ? 'Good' : currentScore >= 600 ? 'Fair' : 'Poor'} Credit
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-lg p-8 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 to-transparent" />
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-4">Potential Score</h3>
              <GaugeChart value={potentialScore} maxValue={900} size={200} label="achievable" />
              <div className="mt-4 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#39FF14]" />
                <span className="text-sm text-[#39FF14] font-medium">
                  +{potentialScore - currentScore} points possible
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* What-If Simulators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-6">What-If Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockScenarios.map((s, i) => {
              const dc = difficultyColors[s.difficulty];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold">{s.title}</h3>
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ color: dc.color, backgroundColor: dc.bg }}
                    >
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{s.description}</p>

                  {/* Impact bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Score Impact</span>
                      <span className="text-[#39FF14] font-medium">+{s.impact} points</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.impact / 100) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#39FF14] to-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Approval change */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">{s.currentApproval}%</span>
                    <ArrowRight className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-[#39FF14] font-semibold">{s.newApproval}%</span>
                    <span className="text-gray-500 text-xs">approval chance</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recommended Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recommended Actions</h2>
          <div className="glass-card-lg p-6">
            <div className="space-y-4">
              {actions.map((a, i) => {
                const pc = priorityColors[a.priority];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 flex items-center justify-center flex-shrink-0">
                      <a.icon className="w-5 h-5 text-[#39FF14]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{a.action}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Timeline: {a.timeframe}</div>
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{ color: pc.color, backgroundColor: pc.bg }}
                    >
                      {a.priority}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Goal Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card-lg p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#39FF14]" />
            Goal Mode
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Set your target approval percentage and see what's required to achieve it.
          </p>

          <div className="mb-6">
            <label className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Target Approval Rate</span>
              <span className="text-[#39FF14] font-semibold">{targetApproval}%</span>
            </label>
            <input
              type="range"
              min={30}
              max={95}
              value={targetApproval}
              onChange={(e) => setTargetApproval(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#39FF14]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Required Score</div>
              <div className="text-2xl font-bold text-white">{scoreNeeded}</div>
              <div className="text-xs text-gray-500 mt-1">out of 900</div>
            </div>
            <div className="bg-white/5 rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Gap to Bridge</div>
              <div className="text-2xl font-bold" style={{ color: scoreGap > 50 ? '#ef4444' : scoreGap > 0 ? '#f59e0b' : '#39FF14' }}>
                {scoreGap > 0 ? `+${scoreGap}` : '✓ Achieved'}
              </div>
              <div className="text-xs text-gray-500 mt-1">points needed</div>
            </div>
            <div className="bg-white/5 rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Estimated Time</div>
              <div className="text-2xl font-bold text-white">
                {scoreGap <= 0 ? 'Now' : scoreGap <= 30 ? '3-6 mo' : scoreGap <= 60 ? '6-12 mo' : '12+ mo'}
              </div>
              <div className="text-xs text-gray-500 mt-1">to achieve</div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
