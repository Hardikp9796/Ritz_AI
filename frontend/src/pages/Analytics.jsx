import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, ShoppingBag, TrendingDown, Award } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const [period, setPeriod] = useState('today');
  const [analytics, setAnalytics] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchBestSellers();
  }, [period, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    try {
      let url = `${API}/analytics/sales?period=${period}`;
      if (period === 'custom' && customStartDate && customEndDate) {
        url = `${API}/analytics/sales?start_date=${customStartDate}&end_date=${customEndDate}`;
      }
      const response = await axios.get(url);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRangeApply = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      toast.error('Start date must be before end date');
      return;
    }
    setPeriod('custom');
    setShowCustomRange(false);
    fetchAnalytics();
  };

  const fetchBestSellers = async () => {
    try {
      const response = await axios.get(`${API}/analytics/best-sellers`);
      setBestSellers(response.data);
    } catch (error) {
      console.error('Failed to load best sellers');
    }
  };

  const paymentData = analytics ? [
    { name: 'Cash', value: analytics.cash_sales, color: '#22c55e' },
    { name: 'Digital', value: analytics.digital_sales, color: '#3b82f6' }
  ] : [];

  const profitMargin = analytics ? ((analytics.total_profit / analytics.total_sales) * 100).toFixed(1) : 0;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 ml-20 p-8" data-testid="analytics-page">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-secondary text-5xl tracking-wide text-orange-500 uppercase mb-2" data-testid="page-title">
              Analytics
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Track your business performance</p>
          </div>

          <div className="mb-8">
            <Tabs value={period} onValueChange={(val) => { setPeriod(val); if(val === 'custom') setShowCustomRange(true); }}>
              <TabsList className="bg-slate-900 border border-slate-800" data-testid="period-selector">
                <TabsTrigger value="today" data-testid="period-today">Today</TabsTrigger>
                <TabsTrigger value="week" data-testid="period-week">This Week</TabsTrigger>
                <TabsTrigger value="month" data-testid="period-month">This Month</TabsTrigger>
                <TabsTrigger value="custom" data-testid="period-custom">Custom Range</TabsTrigger>
              </TabsList>
            </Tabs>

            {showCustomRange && (
              <Card className="bg-slate-900 border-slate-800 mt-4" data-testid="custom-date-range">
                <CardContent className="p-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label className="text-slate-300 mb-2 block">Start Date</Label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                        data-testid="start-date-input"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-slate-300 mb-2 block">End Date</Label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                        data-testid="end-date-input"
                      />
                    </div>
                    <Button
                      onClick={handleCustomRangeApply}
                      className="bg-orange-500 hover:bg-orange-600"
                      data-testid="apply-custom-range"
                    >
                      Apply Range
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomRange(false)}
                      data-testid="cancel-custom-range"
                    >
                      Cancel
                    </Button>
                  </div>
                  {period === 'custom' && customStartDate && customEndDate && (
                    <p className="text-slate-400 text-sm mt-3">
                      Showing data from {new Date(customStartDate).toLocaleDateString()} to {new Date(customEndDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading analytics...</div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="stat-card" data-testid="total-sales-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-secondary text-4xl text-orange-500" data-testid="total-sales">₹{analytics.total_sales.toFixed(2)}</div>
                    <p className="text-slate-400 text-sm mt-1">{analytics.total_orders} orders</p>
                  </CardContent>
                </Card>

                <Card className="stat-card" data-testid="total-profit-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Gross Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-secondary text-4xl text-green-400" data-testid="total-profit">₹{analytics.total_profit.toFixed(2)}</div>
                    <p className="text-slate-400 text-sm mt-1">{profitMargin}% margin</p>
                  </CardContent>
                </Card>

                <Card className="stat-card" data-testid="avg-order-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Avg Order Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-secondary text-4xl text-blue-400" data-testid="avg-order-value">₹{analytics.avg_order_value.toFixed(2)}</div>
                    <p className="text-slate-400 text-sm mt-1">Per transaction</p>
                  </CardContent>
                </Card>

                <Card className="stat-card" data-testid="total-orders-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-secondary text-4xl text-yellow-400" data-testid="total-orders">{analytics.total_orders}</div>
                    <p className="text-slate-400 text-sm mt-1">Completed</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="font-secondary text-2xl text-orange-500 uppercase">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `₹${entry.value.toFixed(0)}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800" data-testid="best-sellers-card">
                  <CardHeader>
                    <CardTitle className="font-secondary text-2xl text-orange-500 uppercase flex items-center gap-2">
                      <Award className="w-6 h-6" />
                      Top 5 Best Sellers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bestSellers.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">No sales data yet</p>
                    ) : (
                      <div className="space-y-3" data-testid="best-sellers-list">
                        {bestSellers.slice(0, 5).map((item, index) => (
                          <div key={item.item_id} className="bg-slate-800 p-4 rounded-lg" data-testid={`best-seller-${index}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`font-secondary text-2xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-600' : 'text-slate-500'}`}>
                                  #{index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-100">{item.item_name}</h4>
                                  <p className="text-sm text-slate-400">{item.quantity_sold} units sold</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-orange-500 font-medium">₹{item.revenue.toFixed(2)}</div>
                                <div className="text-green-400 text-sm">+₹{item.profit.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Analytics;