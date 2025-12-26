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
    discount_percent: 0,
    applicable_categories: []
  });

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
    if (!newOffer.name || newOffer.discount_percent <= 0) {
      toast.error('Please fill all offer details');
      return;
    }

    try {
      const response = await axios.post(`${API}/offers`, newOffer);
      setOffers([...offers, response.data]);
      toast.success('Offer created successfully');
      setNewOffer({ name: '', discount_percent: 0, applicable_categories: [] });
    } catch (error) {
      toast.error('Failed to create offer');
    }
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
                      placeholder="e.g., Happy Hour Special"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

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

                  <Button
                    onClick={handleCreateOffer}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
                        <div key={offer.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                          <div>
                            <h3 className="font-medium text-slate-100">{offer.name}</h3>
                            <Badge className="mt-1 bg-green-500/20 text-green-400">
                              {offer.discount_percent}% OFF
                            </Badge>
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