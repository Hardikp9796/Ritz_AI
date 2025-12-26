import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import POSScreen from '@/pages/POSScreen';
import OrderHistory from '@/pages/OrderHistory';
import Inventory from '@/pages/Inventory';
import Analytics from '@/pages/Analytics';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<POSScreen />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;