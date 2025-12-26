import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, TrendingUp, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders?limit=100`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 ml-20 p-8" data-testid="order-history-page">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-secondary text-5xl tracking-wide text-orange-500 uppercase mb-2" data-testid="page-title">
              Order History
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Track all your orders</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12" data-testid="no-orders-message">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 text-lg">No orders yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4" data-testid="orders-list">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-slate-900 border-slate-800" data-testid={`order-${order.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-secondary text-2xl text-orange-500" data-testid={`order-number-${order.id}`}>
                            ORDER #{order.order_number}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(order.timestamp)}
                            </span>
                            <Badge
                              variant="secondary"
                              className={order.order_type === 'dine-in' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}
                              data-testid={`order-type-${order.id}`}
                            >
                              {order.order_type}
                            </Badge>
                            {order.table_token && (
                              <span className="text-slate-300" data-testid={`table-token-${order.id}`}>
                                Table: {order.table_token}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-secondary text-3xl text-orange-500" data-testid={`order-total-${order.id}`}>₹{order.total.toFixed(2)}</div>
                          <Badge
                            variant="secondary"
                            className={order.payment_type === 'cash' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}
                            data-testid={`payment-type-${order.id}`}
                          >
                            {order.payment_type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2" data-testid={`order-items-${order.id}`}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                            <div>
                              <span className="text-slate-100 font-medium">{item.item_name}</span>
                              <span className="text-slate-400 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="text-orange-500 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
                        <span className="text-green-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Profit: ₹{order.gross_profit.toFixed(2)}
                        </span>
                        <span className="text-slate-400">
                          Margin: {((order.gross_profit / order.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderHistory;