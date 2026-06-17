import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Hall from '@/pages/Hall';
import Demand from '@/pages/Demand';
import Inspection from '@/pages/Inspection';
import Bargain from '@/pages/Bargain';
import Deal from '@/pages/Deal';

function AppRoutes() {
  const location = useLocation();
  return (
    <Layout>
      <Routes location={location}>
        <Route path="/" element={<Hall />} />
        <Route path="/hall" element={<Hall />} />
        <Route path="/demand" element={<Demand />} />
        <Route path="/inspection/:equipmentId" element={<Inspection />} />
        <Route path="/bargain" element={<Bargain />} />
        <Route path="/deal" element={<Deal />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
