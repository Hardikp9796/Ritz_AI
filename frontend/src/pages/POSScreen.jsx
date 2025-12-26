import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingCart, Pizza, UtensilsCrossed, Coffee, Droplets, Percent, Home, Package, TrendingUp, History, X, Plus, Minus, CreditCard, Banknote, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Sidebar from '@/components/Sidebar';
import PrintReceipt from '@/components/PrintReceipt';
import { useReactToPrint } from 'react-to-print';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categoryIcons = {
  '18-inch-pizza': Pizza,
  'giant-slice': Pizza,
  'pocket-pizza': Pizza,
  'sides': UtensilsCrossed,
  'dips': Droplets,
  'drinks': Coffee,
  'combos': Percent
};

const POSScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderType, setOrderType] = useState('dine-in');
  const [tableToken, setTableToken] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(`${API}/menu`);
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu');
    }
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: Home },
    { id: '18-inch-pizza', name: '18" Pizza', icon: Pizza },
    { id: 'giant-slice', name: 'Giant Slices', icon: Pizza },
    { id: 'pocket-pizza', name: 'Pocket Pizza', icon: Pizza },
    { id: 'sides', name: 'Sides', icon: UtensilsCrossed },
    { id: 'dips', name: 'Dips', icon: Droplets },
    { id: 'drinks', name: 'Drinks', icon: Coffee },
    { id: 'slice-combos', name: 'Slice Combos', icon: Percent },
    { id: 'pocket-combos', name: 'Pocket Combos', icon: Percent },
    { id: 'pizza-family-combos', name: 'Pizza Family', icon: Percent },
    { id: 'pocket-family-combos', name: 'Pocket Family', icon: Percent },
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.item_id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.item_id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        item_id: item.id,
        item_name: item.name,
        quantity: 1,
        price: item.price,
        cogs: item.cogs
      }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item =>
      item.item_id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.item_id !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateProfit = () => {
    return cart.reduce((sum, item) => sum + ((item.price - item.cogs) * item.quantity), 0);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${lastOrder?.order_number}`,
    onAfterPrint: () => {
      toast.success('Receipt printed successfully!');
    },
  });

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (orderType === 'dine-in' && !tableToken.trim()) {
      toast.error('Please enter table/token number');
      return;
    }

    setLoading(true);

    try {
      if (paymentType === 'digital') {
        const total = calculateTotal();
        const razorpayResponse = await axios.post(`${API}/payment/create-order`, {
          amount: total
        });

        const options = {
          key: razorpayResponse.data.key_id,
          amount: razorpayResponse.data.amount,
          currency: razorpayResponse.data.currency,
          order_id: razorpayResponse.data.order_id,
          name: 'POCKETO',
          description: 'Order Payment',
          handler: async (response) => {
            await completeOrder(response.razorpay_payment_id);
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast.error('Payment cancelled');
            }
          },
          theme: {
            color: '#f97316'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        await completeOrder();
      }
    } catch (error) {
      toast.error('Checkout failed: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const completeOrder = async (paymentId = null) => {
    try {
      const orderData = {
        items: cart,
        total: calculateTotal(),
        gross_profit: calculateProfit(),
        order_type: orderType,
        table_token: orderType === 'dine-in' ? tableToken : null,
        payment_type: paymentType,
        payment_id: paymentId
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      setLastOrder(response.data);
      toast.success('Order placed successfully!');
      
      // Auto print receipt after 500ms
      setTimeout(() => {
        handlePrint();
      }, 500);
      
      setCart([]);
      setTableToken('');
      setLoading(false);
    } catch (error) {
      toast.error('Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 ml-20 mr-96" data-testid="pos-main-content">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="font-secondary text-5xl tracking-wide text-orange-500 uppercase mb-2" data-testid="pos-header">
              POCKETO POS
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Fast • Reliable • Simple</p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="bg-slate-900 border border-slate-800 p-1 flex-wrap h-auto" data-testid="category-tabs">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs"
                    data-testid={`category-tab-${cat.id}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="menu-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="menu-card group"
                onClick={() => addToCart(item)}
                data-testid={`menu-item-${item.id}`}
              >
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-medium text-slate-100 mb-1 text-sm">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-secondary text-2xl text-orange-500">₹{item.price}</span>
                    {item.stock < 10 && (
                      <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                    )}
                  </div>
                  {item.tier && (
                    <Badge
                      variant="secondary"
                      className={`mt-2 text-xs ${item.tier === 'premium' ? 'bg-yellow-500/20 text-yellow-300' : item.tier === 'signature' ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-700 text-slate-300'}`}
                    >
                      {item.tier}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <aside className="order-summary p-6" data-testid="order-summary">
        <div className="mb-6">
          <h2 className="font-secondary text-3xl text-orange-500 uppercase tracking-wide mb-4" data-testid="current-order-title">
            Current Order
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-slate-300 text-sm uppercase tracking-wider mb-2 block">Order Type</Label>
              <RadioGroup value={orderType} onValueChange={setOrderType} data-testid="order-type-selector">
                <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg">
                  <RadioGroupItem value="dine-in" id="dine-in" data-testid="order-type-dine-in" />
                  <Label htmlFor="dine-in" className="cursor-pointer flex-1">Dine-In</Label>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg">
                  <RadioGroupItem value="takeaway" id="takeaway" data-testid="order-type-takeaway" />
                  <Label htmlFor="takeaway" className="cursor-pointer flex-1">Takeaway</Label>
                </div>
              </RadioGroup>
            </div>

            {orderType === 'dine-in' && (
              <div>
                <Label className="text-slate-300 text-sm uppercase tracking-wider mb-2 block">Table/Token Number</Label>
                <Input
                  value={tableToken}
                  onChange={(e) => setTableToken(e.target.value)}
                  placeholder="Enter table or token number"
                  className="bg-slate-800 border-slate-700 focus:border-orange-500"
                  data-testid="table-token-input"
                />
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="h-[300px] mb-6">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400" data-testid="empty-cart-message">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="cart-items">
              {cart.map((item) => (
                <div key={item.item_id} className="bg-slate-800 rounded-lg p-3" data-testid={`cart-item-${item.item_id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-100 text-sm">{item.item_name}</h4>
                      <p className="text-orange-500 font-secondary text-lg">₹{item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                      onClick={() => removeFromCart(item.item_id)}
                      data-testid={`remove-item-${item.item_id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-slate-900 border-slate-700"
                        onClick={() => updateQuantity(item.item_id, -1)}
                        data-testid={`decrease-quantity-${item.item_id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-medium w-8 text-center" data-testid={`quantity-${item.item_id}`}>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-slate-900 border-slate-700"
                        onClick={() => updateQuantity(item.item_id, 1)}
                        data-testid={`increase-quantity-${item.item_id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-secondary text-xl text-slate-100" data-testid={`item-total-${item.item_id}`}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-secondary text-lg" data-testid="subtotal">₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400 text-sm">
              <span>Profit</span>
              <span data-testid="profit">₹{calculateProfit().toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-lg">
              <span className="text-slate-100">Total</span>
              <span className="font-secondary text-2xl text-orange-500" data-testid="total">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div>
            <Label className="text-slate-300 text-sm uppercase tracking-wider mb-2 block">Payment Method</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType} data-testid="payment-method-selector">
              <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg">
                <RadioGroupItem value="cash" id="cash" data-testid="payment-method-cash" />
                <Banknote className="w-4 h-4 text-green-500" />
                <Label htmlFor="cash" className="cursor-pointer flex-1">Cash</Label>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg">
                <RadioGroupItem value="digital" id="digital" data-testid="payment-method-digital" />
                <CreditCard className="w-4 h-4 text-blue-500" />
                <Label htmlFor="digital" className="cursor-pointer flex-1">Digital (UPI/Card)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            className="w-full btn-primary h-14 text-lg"
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            data-testid="checkout-button"
          >
            {loading ? 'Processing...' : 'Complete Order'}
          </Button>

          {lastOrder && (
            <Button
              variant="outline"
              className="w-full h-12 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              onClick={handlePrint}
              data-testid="reprint-button"
            >
              <Printer className="w-4 h-4 mr-2" />
              Reprint Last Receipt
            </Button>
          )}
        </div>
      </aside>

      {/* Hidden Print Component */}
      {lastOrder && (
        <PrintReceipt
          ref={printRef}
          orderData={lastOrder}
          orderNumber={lastOrder.order_number}
        />
      )}
    </div>
  );
};

export default POSScreen;