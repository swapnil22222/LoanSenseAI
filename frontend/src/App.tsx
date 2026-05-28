import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import EligibilitySimulator from './pages/EligibilitySimulator';
import LoanComparison from './pages/LoanComparison';
import EMIPlanner from './pages/EMIPlanner';
import FinancialHealth from './pages/FinancialHealth';
import Dashboard from './pages/Dashboard';
import CreditSuggestions from './pages/CreditSuggestions';
import AnalyticsPanel from './pages/AnalyticsPanel';

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#39FF14] selection:text-black font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/eligibility" element={<EligibilitySimulator />} />
          <Route path="/compare" element={<LoanComparison />} />
          <Route path="/emi" element={<EMIPlanner />} />
          <Route path="/health" element={<FinancialHealth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/credit" element={<CreditSuggestions />} />
          <Route path="/analytics" element={<AnalyticsPanel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
