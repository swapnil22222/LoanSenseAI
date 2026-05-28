import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import KPICard from '../components/cards/KPICard';
import TrendChart from '../components/charts/TrendChart';
import { DistributionBarChart } from '../components/charts/DistributionChart';
import { getRiskColor, getRiskBg, formatCurrency } from '../utils/helpers';
import type { DashboardData } from '../types';
import { getDashboard } from '../api/client';

const statusConfig = {
  Approved: { color: '#39FF14', bg: 'rgba(57,255,20,0.1)', icon: CheckCircle },
  Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await getDashboard();
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#39FF14] text-xl font-medium animate-pulse">Loading Live Data...</div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Applications', value: data.total_applications, icon: 'chart' },
    { label: 'Approved', value: data.approved, icon: 'check', prefix: '' },
    { label: 'Approval Rate', value: data.approval_rate, icon: 'target', suffix: '%' },
    { label: 'Total Disbursed', value: data.total_disbursed, icon: 'dollar', prefix: '₹', suffix: 'Cr' },
  ];

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
            <h1 className="text-3xl font-bold text-white mb-2">Live Dashboard</h1>
            <p className="text-gray-400">Overview of loan application metrics directly from the ML engine</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, i) => (
              <KPICard key={i} {...kpi} delay={i * 0.1} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Approval History</h3>
              <TrendChart
                data={data.approval_history}
                xKey="month"
                series={[
                  { key: 'approved', color: '#39FF14', name: 'Approved' },
                  { key: 'rejected', color: '#ef4444', name: 'Rejected' },
                ]}
                height={280}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution Trends</h3>
              <DistributionBarChart
                data={data.risk_trends}
                xKey="month"
                bars={[
                  { key: 'Low', color: '#39FF14', name: 'Low Risk' },
                  { key: 'Medium', color: '#f59e0b', name: 'Medium Risk' },
                  { key: 'High', color: '#ef4444', name: 'High Risk' },
                ]}
                height={280}
              />
            </motion.div>
          </div>

          {/* Applications Table + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 glass-card-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                <span className="text-sm text-gray-400">{data.applications.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Applicant</th>
                      <th className="text-right py-3 px-3 text-gray-400 font-medium">Amount</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-medium">Score</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-medium">Risk</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.applications.map((app) => {
                      const sc = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.Pending;
                      return (
                        <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3">
                            <div className="text-white font-medium">{app.name}</div>
                            <div className="text-xs text-gray-500">{app.id} · {app.date}</div>
                          </td>
                          <td className="py-3 px-3 text-right text-white">{formatCurrency(app.amount)}</td>
                          <td className="py-3 px-3 text-center text-white">{app.score}</td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className="text-xs font-medium px-2 py-1 rounded-full"
                              style={{ color: getRiskColor(app.risk), backgroundColor: getRiskBg(app.risk) }}
                            >
                              {app.risk}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                              style={{ color: sc.color, backgroundColor: sc.bg }}
                            >
                              <sc.icon className="w-3 h-3" />
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {data.recent_activity.map((a, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Eye className="w-4 h-4 text-[#39FF14]" />
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{a.action}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{a.details}</div>
                      <div className="text-xs text-gray-600 mt-1">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
