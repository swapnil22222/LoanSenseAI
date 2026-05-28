import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  CreditCard,
  Calculator,
  Heart,
  Lightbulb,
  PieChart,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/eligibility', label: 'Eligibility', icon: ClipboardList },
  { path: '/compare', label: 'Compare', icon: BarChart3 },
  { path: '/emi', label: 'EMI Planner', icon: Calculator },
  { path: '/health', label: 'Financial Health', icon: Heart },
  { path: '/credit', label: 'Credit Tips', icon: Lightbulb },
  { path: '/analytics', label: 'Analytics', icon: PieChart },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0a0a0a] border-r border-white/5 p-6 pt-24 fixed left-0 top-0 z-30">
      <div className="flex items-center gap-2 mb-8">
        <CreditCard className="w-6 h-6 text-[#39FF14]" />
        <span className="text-lg font-bold text-white">Console</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
