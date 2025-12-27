import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Save, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [offers, setOffers] = useState([]);
  const [newOffer, setNewOffer] = useState({
    name: '',
    offer_type: 'combo', // 'percentage' or 'combo'
    discount_percent: 0,
    combo_items: [],
    combo_price: 0,
    applicable_categories: []
  });
  const [showItemSelector, setShowItemSelector] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    fetchOffers();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API}/menu`);
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API}/offers`);
      setOffers(response.data || []);
    } catch (error) {
      console.log('No offers yet');
    }
  };

  const handleImageUpdate = async (itemId) => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      await axios.put(`${API}/menu/${itemId}`, { image: imageUrl });
      setMenuItems(menuItems.map(item => 
        item.id === itemId ? { ...item, image: imageUrl } : item
      ));
      toast.success('Image updated successfully');
      setEditingItem(null);
      setImageUrl('');
    } catch (error) {
      toast.error('Failed to update image');
    }
  };

  const handleCreateOffer = async () => {
    if (!newOffer.name) {
      toast.error('Please enter offer name');
      return;
    }

    if (newOffer.offer_type === 'combo') {
      if (newOffer.combo_items.length === 0 || newOffer.combo_price <= 0) {
        toast.error('Please select items and set combo price');
        return;
      }
    } else {
      if (newOffer.discount_percent <= 0) {
        toast.error('Please enter discount percentage');
        return;
      }
    }

    try {
      const response = await axios.post(`${API}/offers`, newOffer);
      setOffers([...offers, response.data]);
      toast.success('Offer created successfully');
      setNewOffer({ 
        name: '', 
        offer_type: 'combo',
        discount_percent: 0,
        combo_items: [],
        combo_price: 0,
        applicable_categories: [] 
      });
      setShowItemSelector(false);
    } catch (error) {
      toast.error('Failed to create offer');
    }
  };

  const toggleItemInCombo = (item) => {
    const isSelected = newOffer.combo_items.some(i => i.id === item.id);
    if (isSelected) {
      setNewOffer({
        ...newOffer,
        combo_items: newOffer.combo_items.filter(i => i.id !== item.id)
      });
    } else {
      setNewOffer({
        ...newOffer,
        combo_items: [...newOffer.combo_items, { id: item.id, name: item.name, price: item.price }]
      });
    }
  };

  const calculateOriginalPrice = () => {
    return newOffer.combo_items.reduce((sum, item) => sum + item.price, 0);
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await axios.delete(`${API}/offers/${offerId}`);
      setOffers(offers.filter(o => o.id !== offerId));
      toast.success('Offer deleted');
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const getCategoryName = (category) => {
    const names = {
      '18-inch-pizza': '18" Pizza',
      'giant-slice': 'Giant Slice',
      'pocket-pizza': 'Pocket Pizza',
      'sides': 'Sides',
      'dips': 'Dips',
      'drinks': 'Drinks',
      'slice-combos': 'Slice Combos',
      'pocket-combos': 'Pocket Combos',
      'pizza-family-combos': 'Pizza Family',
      'pocket-family-combos': 'Pocket Family'
    };
    return names[category] || category;
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 ml-20 p-8" data-testid="settings-page">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-secondary text-5xl tracking-wide text-orange-500 uppercase mb-2">
              Settings
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Manage your POS configuration</p>
          </div>

          <Tabs defaultValue="images" className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="images">Menu Images</TabsTrigger>
              <TabsTrigger value="offers">Offers & Discounts</TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="font-secondary text-2xl text-orange-500 uppercase">
                    Update Menu Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 mb-6 text-sm">
                    Update product images by entering image URLs from Unsplash, Pexels, or your own hosting.
                  </p>

                  <div className="grid gap-4">
                    {menuItems.filter(item => ['18-inch-pizza', 'giant-slice', 'pocket-pizza', 'sides', 'drinks'].includes(item.category)).map((item) => (
                      <Card key={item.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-slate-700 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-slate-500" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-100">{item.name}</h3>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {getCategoryName(item.category)}
                              </Badge>
                            </div>

                            {editingItem === item.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={imageUrl}
                                  onChange={(e) => setImageUrl(e.target.value)}
                                  placeholder="Enter image URL"
                                  className="bg-slate-900 border-slate-700"
                                />
                                <Button
                                  size="icon"
                                  onClick={() => handleImageUpdate(item.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingItem(null);
                                    setImageUrl('');
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => {
                                  setEditingItem(item.id);
                                  setImageUrl(item.image || '');
                                }}
                                variant="outline"
                                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Change Image
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="font-secondary text-2xl text-orange-500 uppercase">
                    Create New Offer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Offer Name</Label>
                    <Input
                      value={newOffer.name}
                      onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                      placeholder="e.g., Lunch Special, Family Deal"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Offer Type</Label>
                    <select
                      value={newOffer.offer_type}
                      onChange={(e) => setNewOffer({ ...newOffer, offer_type: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100"
                    >
                      <option value="combo">Combo Deal (Select items + Set price)</option>
                      <option value="percentage">Percentage Discount</option>
                    </select>
                  </div>

                  {newOffer.offer_type === 'combo' ? (
                    <>
                      <div>
                        <Label className="text-slate-300 mb-2 block">Select Items for Combo</Label>
                        <Button
                          onClick={() => setShowItemSelector(!showItemSelector)}
                          variant="outline"
                          className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                        >
                          {newOffer.combo_items.length > 0 
                            ? `${newOffer.combo_items.length} items selected` 
                            : 'Click to select items'}
                        </Button>
                      </div>

                      {showItemSelector && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <p className="text-slate-400 text-sm mb-3">Select items to include in this combo:</p>
                          <div className="space-y-2">
                            {menuItems.filter(item => !item.category.includes('combo')).map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={newOffer.combo_items.some(i => i.id === item.id)}
                                  onChange={() => toggleItemInCombo(item)}
                                  className="w-4 h-4"
                                />
                                <span className="text-slate-100 text-sm flex-1">{item.name}</span>
                                <span className="text-slate-400 text-sm">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {newOffer.combo_items.length > 0 && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                          <p className="text-slate-300 text-sm font-medium mb-2">Selected Items:</p>
                          {newOffer.combo_items.map((item, idx) => (
                            <div key={idx} className="text-slate-400 text-sm">• {item.name} (₹{item.price})</div>
                          ))}
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <p className="text-slate-300 font-medium">
                              Original Price: ₹{calculateOriginalPrice()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-slate-300 mb-2 block">Combo Offer Price</Label>
                        <Input
                          type="number"
                          value={newOffer.combo_price}
                          onChange={(e) => setNewOffer({ ...newOffer, combo_price: Number(e.target.value) })}
                          placeholder="e.g., 599"
                          className="bg-slate-800 border-slate-700"
                        />
                        {newOffer.combo_price > 0 && calculateOriginalPrice() > 0 && (
                          <p className="text-green-400 text-sm mt-1">
                            Savings: ₹{(calculateOriginalPrice() - newOffer.combo_price).toFixed(0)} 
                            ({(((calculateOriginalPrice() - newOffer.combo_price) / calculateOriginalPrice()) * 100).toFixed(0)}% off)
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label className="text-slate-300 mb-2 block">Discount Percentage</Label>
                      <Input
                        type="number"
                        value={newOffer.discount_percent}
                        onChange={(e) => setNewOffer({ ...newOffer, discount_percent: Number(e.target.value) })}
                        placeholder="e.g., 15"
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleCreateOffer}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg h-12"
                  >
                    Create Offer
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="font-secondary text-2xl text-orange-500 uppercase">
                    Active Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {offers.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No offers yet. Create your first offer above!</p>
                  ) : (
                    <div className="space-y-3">
                      {offers.map((offer) => (
                        <div key={offer.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-100 text-lg">{offer.name}</h3>
                              {offer.offer_type === 'combo' ? (
                                <div className="mt-2">
                                  <Badge className="bg-orange-500/20 text-orange-400 mb-2">
                                    Combo Deal - ₹{offer.combo_price}
                                  </Badge>
                                  <div className="text-slate-400 text-sm mt-2">
                                    <p className="font-medium text-slate-300 mb-1">Includes:</p>
                                    {offer.combo_items?.map((item, idx) => (
                                      <p key={idx}>• {item.name}</p>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <Badge className="mt-1 bg-green-500/20 text-green-400">
                                  {offer.discount_percent}% OFF
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;