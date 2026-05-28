import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Zap,
  Shield,
  BarChart3,
  Calculator,
  Heart,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import KPICard from '../components/cards/KPICard';
import FeatureCard from '../components/cards/FeatureCard';
import TestimonialCard from '../components/cards/TestimonialCard';
import { getDashboard } from '../api/client';
import type { DashboardData } from '../types';

const features = [
  {
    icon: <Shield className="w-7 h-7 text-[#39FF14]" />,
    title: 'Smart Eligibility Check',
    description: 'AI-powered loan eligibility analysis using machine learning models trained on thousands of applications.',
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-[#39FF14]" />,
    title: 'Loan Comparison Engine',
    description: 'Compare Home, Car, Education, and Personal loans side-by-side with real-time risk assessment.',
  },
  {
    icon: <Calculator className="w-7 h-7 text-[#39FF14]" />,
    title: 'Advanced EMI Planner',
    description: 'Calculate EMIs, view amortization schedules, and simulate early repayment scenarios.',
  },
  {
    icon: <Heart className="w-7 h-7 text-[#39FF14]" />,
    title: 'Financial Health Score',
    description: 'Get a comprehensive financial health assessment across 5 key dimensions with actionable insights.',
  },
  {
    icon: <Lightbulb className="w-7 h-7 text-[#39FF14]" />,
    title: 'Credit Improvement Tips',
    description: 'Personalized recommendations to improve your credit score and boost loan approval chances.',
  },
  {
    icon: <Zap className="w-7 h-7 text-[#39FF14]" />,
    title: 'Real-time Analytics',
    description: 'Dashboard with live metrics, trend analysis, and risk distribution insights for informed decisions.',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    quote: 'LoanSense AI helped me understand my true borrowing capacity. The EMI planner saved me from taking a loan I couldn\'t afford. Absolutely brilliant tool!',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Business Owner',
    quote: 'The loan comparison feature is incredibly useful. I could see exactly which loan type suited my business needs. Got approved at the best rate possible.',
    rating: 5,
  },
  {
    name: 'Anita Desai',
    role: 'Financial Analyst',
    quote: 'As someone in finance, I appreciate the depth of analysis. The credit improvement suggestions actually worked — my score went up 60 points in 3 months!',
    rating: 4,
  },
];

export default function Landing() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch(console.error);
  }, []);

  const kpis = data ? [
    { label: 'Loans Analyzed', value: data.total_applications, icon: 'chart' },
    { label: 'Users Served', value: Math.round(data.total_applications * 1.5), icon: 'users' },
    { label: 'Approval Rate', value: data.approval_rate, icon: 'check', suffix: '%' },
    { label: 'Avg. Savings', value: 245000, icon: 'dollar', prefix: '₹' },
  ] : [
    { label: 'Loans Analyzed', value: 0, icon: 'chart' },
    { label: 'Users Served', value: 0, icon: 'users' },
    { label: 'Approval Rate', value: 0, icon: 'check', suffix: '%' },
    { label: 'Avg. Savings', value: 245000, icon: 'dollar', prefix: '₹' },
  ];

  const chartData = data ? data.approval_history.map(item => ({
    month: item.month,
    approvals: item.approved,
    applications: item.approved + item.rejected
  })) : [];

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#39FF14]/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/5 rounded-full blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 mb-8"
          >
            <Zap className="w-4 h-4 text-[#39FF14]" />
            <span className="text-sm text-[#39FF14] font-medium">AI-Powered Loan Intelligence</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Smart Loan Intelligence
            <br />
            <span className="text-gradient-neon">for a Smarter Future</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Make informed financial decisions with ML-powered eligibility checks,
            loan comparisons, and personalized credit improvement recommendations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard" className="btn-neon inline-flex items-center justify-center gap-2 text-lg">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/eligibility" className="btn-outline-neon inline-flex items-center justify-center gap-2 text-lg">
              Check Eligibility
            </Link>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { icon: TrendingUp, label: '86% Accuracy', sub: 'ML Predictions' },
              { icon: Users, label: data ? `${Math.round(data.total_applications * 1.5)}+` : '...', sub: 'Users Served' },
              { icon: CheckCircle, label: data ? `${data.approval_rate}%` : '...', sub: 'Approval Rate' },
              { icon: DollarSign, label: data ? `₹${data.total_disbursed}Cr` : '...', sub: 'Loans Processed' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div>
                  <div className="text-white font-semibold">{stat.label}</div>
                  <div className="text-gray-500 text-xs">{stat.sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* KPI Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Performance</h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto">Real-time metrics from our AI-powered loan intelligence platform</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto">Everything you need to make smart borrowing decisions</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Analytics Preview</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Visualize live loan trends and approval patterns with interactive charts</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-lg p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Live Approval Trends</h3>
            <span className="text-sm text-[#39FF14] animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39FF14]"></span> Live Data
            </span>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
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
                  <Area type="monotone" dataKey="applications" stroke="#555" fill="#555" fillOpacity={0.1} strokeWidth={2} name="Total Applications" />
                  <Area type="monotone" dataKey="approvals" stroke="#39FF14" fill="#39FF14" fillOpacity={0.1} strokeWidth={2} name="Approvals" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 animate-pulse">Loading live charts...</span>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Users Say</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Trusted by thousands for smarter financial decisions</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} delay={i * 0.15} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-lg p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14]/5 to-emerald-600/5" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of users making smarter loan decisions with AI-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/eligibility" className="btn-neon inline-flex items-center justify-center gap-2">
                Check Eligibility <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/dashboard" className="btn-outline-neon inline-flex items-center justify-center gap-2">
                Explore Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </PageWrapper>
  );
}
