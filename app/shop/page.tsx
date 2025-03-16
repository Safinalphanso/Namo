'use client';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';
import { useCart } from '../hooks/use-cart';
import { Star, Clock, ShoppingBag, X, Heart } from "lucide-react";

const products = [
  {
    id: 1,
    name: 'Premium Agarbatti Set',
    price: 499,
    image: 'https://i.pinimg.com/474x/ec/e6/99/ece6994b64fa7706314bf23bd5a1d6f9.jpg',
    category: 'Premium',
    description: 'Aromatic and long-lasting incense sticks for a divine and soothing experience. Hand-rolled with natural ingredients for a pure fragrance.',
    rating: 4.9,
    stock: 12,
    burningTime: '45 minutes'
  },
  {
    id: 2,
    name: 'Sandalwood Agarbatti',
    price: 299,
    image: 'https://i.pinimg.com/474x/90/42/28/904228413f1cf1fee0fe3c997328a55e.jpg',
    category: 'Sandalwood',
    description: 'Classic sandalwood fragrance for a calm and peaceful atmosphere. Made from authentic sandalwood powder for a genuine experience.',
    rating: 4.7,
    stock: 24,
    burningTime: '35 minutes'
  },
  {
    id: 3,
    name: 'Lavender Incense Sticks',
    price: 349,
    image: 'https://i.pinimg.com/474x/5d/0b/b1/5d0bb15fa9f52b9ee96f46d25a66b64e.jpg',
    category: 'Lavender',
    description: 'Soothing lavender fragrance to help you relax and unwind. Perfect for stress relief and creating a serene environment.',
    rating: 4.5,
    stock: 18,
    burningTime: '40 minutes'
  },
  {
    id: 4,
    name: 'Rose Incense Sticks',
    price: 279,
    image: 'https://i.pinimg.com/474x/9a/c6/f0/9ac6f0ae11b6ef3b311fdd0cdef076bb.jpg',
    category: 'Floral',
    description: 'Delicate rose fragrance for a romantic and pleasant atmosphere. Infused with real rose extracts for an authentic floral aroma.',
    rating: 4.3,
    stock: 30,
    burningTime: '30 minutes'
  },
  {
    id: 5,
    name: 'Jasmine Agarbatti',
    price: 329,
    image: 'https://i.pinimg.com/474x/0a/fe/2a/0afe2a988f65b682cf04c5206e31d505.jpg',
    category: 'Floral',
    description: 'Sweet jasmine fragrance that fills your space with a refreshing aroma. Natural ingredients ensure a pure and long-lasting scent.',
    rating: 4.8,
    stock: 15,
    burningTime: '38 minutes'
  },
  {
    id: 6,
    name: 'Meditation Incense Set',
    price: 549,
    image: 'https://i.pinimg.com/474x/92/ae/27/92ae27943c4cb8220ff2ecab8bfbfa82.jpg',
    category: 'Premium',
    description: 'Special blend of fragrances ideal for meditation and spiritual practices. Contains a mix of sandalwood, frankincense, and myrrh.',
    rating: 5.0,
    stock: 8,
    burningTime: '50 minutes'
  },
];

export default function ShopPage() {
  const [category, setCategory] = useState<string>('all');
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // Check for system dark mode preference and respond to changes
  useEffect(() => {
    // This will allow the component to respect the system/browser theme settings
    // without adding a separate control
    if (typeof window !== 'undefined') {
      // Add a listener for theme changes from the navbar or system
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Apply initial theme class based on browser/system preference or existing setting
      const isDarkMode = mediaQuery.matches || document.documentElement.classList.contains('dark');
      if (isDarkMode && !document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      }
      
      // Listen for changes to the system preference
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const filteredProducts = category === 'all'
    ? products
    : products.filter(product => product.category === category);

  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))];

  const handleAddToCart = (product: typeof products[0], event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const openPopup = (id: number) => {
    setActiveProduct(id);
  };

  const closePopup = (event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Premium Incense Shop</h1>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="dark:text-white dark:focus:bg-slate-700">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="relative group cursor-pointer"
            onClick={() => openPopup(product.id)}
          >
            <Card className="overflow-hidden bg-white dark:bg-black border dark:border-white/20 shadow transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge className="absolute top-3 left-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-3 py-1 rounded-full font-medium text-xs text-white">
                    {product.category}
                  </Badge>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-slate-800 dark:text-white text-lg">{product.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                      <Star size={14} className="text-amber-500" fill="currentColor" /> 
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">₹{product.price}</p>
                    <Button 
                      onClick={(e) => handleAddToCart(product, e)} 
                      variant="outline"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors dark:text-white"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Popup Modal */}
            {activeProduct === product.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div 
                className="relative bg-white dark:bg-slate-800 dark:border dark:border-white/20 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Close Button */}
                  <button 
                    onClick={closePopup}
                    className="absolute right-4 top-4 z-10 bg-white dark:bg-slate-700 rounded-full p-1 shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <X size={20} className="text-slate-600 dark:text-white" />
                  </button>
                  
                  <div className="flex flex-col md:flex-row">
                    {/* Left Column - Image */}
                    <div className="md:w-1/2">
                      <div className="relative h-64 md:h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"></div>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="object-contain w-full h-full p-8 relative z-10"
                        />
                        <Badge className="absolute top-4 left-4 z-20 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-3 py-1 rounded-full font-medium text-white">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Right Column - Details */}
                    <div className="md:w-1/2 p-6 md:p-8">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{product.name}</h2>
                        <button className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Heart size={22} />
                        </button>
                      </div>
                      
                      <div className="flex items-center mt-2 mb-6">
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                          <Star size={16} className="text-amber-500" fill="currentColor" /> 
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{product.rating}</span>
                        </div>
                        <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">12 reviews</span>
                      </div>
                      
                      <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">{product.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center text-slate-700 dark:text-slate-300 mb-1">
                            <Clock size={16} className="mr-2 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm font-medium">Burning Time</span>
                          </div>
                          <p className="text-slate-900 dark:text-white font-semibold pl-6">{product.burningTime}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center text-slate-700 dark:text-slate-300 mb-1">
                            <ShoppingBag size={16} className="mr-2 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm font-medium">Availability</span>
                          </div>
                          <p className="text-slate-900 dark:text-white font-semibold pl-6">
                            {product.stock > 10 ? 'In Stock' : `${product.stock} left`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Price</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{product.price}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 line-through">₹{Math.round(product.price * 1.2)}</p>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 ml-2">
                            Save 20%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          onClick={(e) => handleAddToCart(product, e)} 
                          className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-6"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Toaster component here */}
      <Toaster />
    </div>
  );
}