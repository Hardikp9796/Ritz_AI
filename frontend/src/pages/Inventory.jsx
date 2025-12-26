import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API}/inventory`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditStock(item.stock.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock('');
  };

  const saveStock = async (itemId) => {
    try {
      const newStock = parseInt(editStock);
      if (isNaN(newStock) || newStock < 0) {
        toast.error('Please enter a valid stock number');
        return;
      }

      await axios.put(`${API}/inventory/${itemId}`, { stock: newStock });
      setItems(items.map(item => 
        item.id === itemId ? { ...item, stock: newStock } : item
      ));
      toast.success('Stock updated successfully');
      cancelEdit();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const getCategoryName = (category) => {
    const names = {
      '18-inch-pizza': '18" Pizza',
      'giant-slice': 'Giant Slice',
      'pocket-pizza': 'Pocket Pizza',
      'sides': 'Sides',
      'dips': 'Dips',
      'drinks': 'Drinks'
    };
    return names[category] || category;
  };

  const lowStockItems = items.filter(item => item.stock < 10);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 ml-20 p-8" data-testid="inventory-page">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-secondary text-5xl tracking-wide text-orange-500 uppercase mb-2" data-testid="page-title">
              Inventory
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Manage your stock levels</p>
          </div>

          {lowStockItems.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/50 mb-6" data-testid="low-stock-alert">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <Badge key={item.id} variant="destructive" data-testid={`low-stock-${item.id}`}>
                      {item.name}: {item.stock} left
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading inventory...</div>
          ) : (
            <div className="grid gap-4" data-testid="inventory-list">
              {items.map((item) => (
                <Card key={item.id} className="bg-slate-900 border-slate-800" data-testid={`inventory-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div>
                          <h3 className="font-medium text-slate-100 text-lg" data-testid={`item-name-${item.id}`}>{item.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                              {getCategoryName(item.category)}
                            </Badge>
                            <span className="text-orange-500 font-medium">₹{item.price}</span>
                            <span className="text-slate-400 text-sm">COGS: ₹{item.cogs}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-24 bg-slate-800 border-slate-700"
                              data-testid={`edit-stock-input-${item.id}`}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300"
                              onClick={() => saveStock(item.id)}
                              data-testid={`save-stock-${item.id}`}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-slate-400 hover:text-slate-300"
                              onClick={cancelEdit}
                              data-testid={`cancel-edit-${item.id}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="text-sm text-slate-400 uppercase tracking-wider">Stock</div>
                              <div className={`font-secondary text-3xl ${item.stock < 10 ? 'text-red-400' : 'text-green-400'}`} data-testid={`stock-level-${item.id}`}>
                                {item.stock}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-slate-400 hover:text-orange-400"
                              onClick={() => startEdit(item)}
                              data-testid={`edit-stock-${item.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;