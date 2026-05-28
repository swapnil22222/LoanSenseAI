import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import KPICard from '../components/cards/KPICard';
import TrendChart from '../components/charts/TrendChart';
import { DistributionPieChart, DistributionBarChart } from '../components/charts/DistributionChart';
import { getDashboard } from '../api/client';
import type { DashboardData } from '../types';

export default function AnalyticsPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#39FF14] text-xl font-medium animate-pulse">Running Live SQL Analytics...</div>
      </div>
    );
  }

  const analyticsKPIs = [
    { label: 'Total Loans', value: data.total_applications, icon: 'chart' },
    { label: 'Total Volume', value: data.total_disbursed, icon: 'dollar', prefix: '₹', suffix: 'Cr' },
    { label: 'Avg Credit Score', value: data.avg_credit_score, icon: 'trending' },
    { label: 'Avg Loan Size', value: Math.round(data.avg_loan_amount / 100000), icon: 'activity', prefix: '₹', suffix: 'L' },
  ];

  // Map backend risk distribution to chart format
  const riskColors: Record<string, string> = {
    'Low': '#39FF14',
    'Medium': '#f59e0b',
    'High': '#ef4444'
  };
  
  const riskClusters = (data.risk_distribution || []).map((item: any) => ({
    cluster: item.category,
    count: item.count,
    fill: riskColors[item.category] || '#555'
  }));

  // Map loan amount distribution to income/amount distribution
  const loanDistribution = (data.loan_amount_distribution || []).map((item: any, i: number) => {
    const colors = ['#39FF14', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'];
    return {
      name: item.range,
      value: item.count,
      fill: colors[i % colors.length]
    };
  });

  // Map approval history to time trends
  const timeTrends = (data.approval_history || []).map((item: any) => ({
    month: item.month,
    Applications: item.approved + item.rejected,
    Approvals: item.approved,
  }));

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="lg:pl-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-24 pb-16 max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              SQL Analytics <span className="text-gradient-neon">Panel</span>
            </h1>
            <p className="text-gray-400">Comprehensive real-time insights powered by live database aggregation</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analyticsKPIs.map((kpi, i) => (
              <KPICard key={i} {...kpi} delay={i * 0.1} />
            ))}
          </div>

          {/* Row 1: Pie + Risk Clusters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Loan Amount Distribution</h3>
              <DistributionPieChart data={loanDistribution} height={320} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Risk Segments</h3>
              <DistributionBarChart
                data={riskClusters}
                xKey="cluster"
                bars={[{ key: 'count', color: '#39FF14', name: 'Applications' }]}
                height={320}
              />
            </motion.div>
          </div>

          {/* Row 2: Monthly Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card-lg p-6 lg:col-span-2"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Live Monthly Trends</h3>
              <TrendChart
                data={timeTrends}
                xKey="month"
                series={[
                  { key: 'Applications', color: '#555', name: 'Total Applications' },
                  { key: 'Approvals', color: '#39FF14', name: 'Approvals' },
                ]}
                height={320}
              />
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
