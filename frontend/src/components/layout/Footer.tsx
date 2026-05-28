import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const links = [
  { label: 'Eligibility', path: '/eligibility' },
  { label: 'Compare', path: '/compare' },
  { label: 'EMI Planner', path: '/emi' },
  { label: 'Financial Health', path: '/health' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Analytics', path: '/analytics' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-[#39FF14]" />
              <span className="text-xl font-bold text-white">LoanSense AI</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Smart Loan Intelligence powered by Machine Learning. Make informed financial decisions with AI-driven insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Tools</h3>
            <ul className="space-y-3">
              {links.slice(0, 3).map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-gray-400 hover:text-[#39FF14] transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Insights</h3>
            <ul className="space-y-3">
              {links.slice(3).map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-gray-400 hover:text-[#39FF14] transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>hello@loansense.ai</li>
              <li>+91 98765 43210</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2026 LoanSense AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-gray-600 hover:text-gray-400 cursor-pointer text-sm">Privacy Policy</span>
            <span className="text-gray-600 hover:text-gray-400 cursor-pointer text-sm">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
