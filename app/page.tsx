'use client'

import { useState, useEffect, SetStateAction } from 'react';
import { Button } from '../app/components/ui/button';
import { Card, CardContent } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { ArrowRight, X, Star, ShoppingBag, Clock } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';
import { useToast } from '../app/hooks/use-toast';
import { Toaster } from '../app/components/ui/toaster';

// Component to render star ratings
const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          size={size} 
          className={rating >= star ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} 
          fill={rating >= star ? 'currentColor' : 'none'} 
        />
      ))}
    </div>
  );
};

const featuredProducts = [
  {
    id: 1,
    name: 'Sandalwood Incense',
    price: 299,
    image: 'https://i.pinimg.com/474x/90/42/28/904228413f1cf1fee0fe3c997328a55e.jpg',
    category: 'Sandalwood',
    description: 'Classic sandalwood fragrance for a calm and peaceful atmosphere. Made from authentic sandalwood powder for a genuine experience.',
    rating: 4.7,
    stock: 24,
    burningTime: '35 minutes'
  },
  {
    id: 2,
    name: 'Lavender Incense',
    price: 349,
    image: 'https://i.pinimg.com/474x/5d/0b/b1/5d0bb15fa9f52b9ee96f46d25a66b64e.jpg',
    category: 'Lavender',
    description: 'Soothing lavender fragrance to help you relax and unwind. Perfect for stress relief and creating a serene environment.',
    rating: 4.5,
    stock: 18,
    burningTime: '40 minutes'
  },
  {
    id: 3,
    name: 'Rose Incense',
    price: 279,
    image: 'https://i.pinimg.com/474x/9a/c6/f0/9ac6f0ae11b6ef3b311fdd0cdef076bb.jpg',
    category: 'Floral',
    description: 'Delicate rose fragrance for a romantic and pleasant atmosphere. Infused with real rose extracts for an authentic floral aroma.',
    rating: 4.3,
    stock: 30,
    burningTime: '30 minutes'
  },
];

export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const { toast } = useToast();

  const openPopup = (id: number | null) => {
    setActiveProduct(id);
    // Disable scrolling on the body when popup is open
    document.body.style.overflow = 'hidden';
  };

  const closePopup = (event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveProduct(null);
    // Re-enable scrolling when popup is closed
    document.body.style.overflow = '';
  };

  const handleAddToCart = (product: { id: number; name: string; price: number; image: string; category: string; description: string; rating: number; stock: number; burningTime: string }, event: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  // Theme detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const isDarkMode = mediaQuery.matches || document.documentElement.classList.contains('dark');
      if (isDarkMode && !document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      }
      
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

  return (
    <main className="bg-slate-50 dark:bg-black min-h-screen transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/474x/73/a3/0a/73a30a886ac2c41e76fddc8df634bba6.jpg)',
            backgroundSize: 'fit',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover the Essence of Serenity
          </h1>
          <p className="text-xl mb-8 max-w-xl">
            Experience the finest handcrafted incense sticks that bring peace, relaxation, and purity to your home.
          </p>
          <Button size="lg" asChild className="bg-white hover:bg-amber-500 text-black">
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Best-Selling Incense Sticks</h2>
            <Button variant="outline" asChild className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors dark:text-white">
              <Link href="/shop">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
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

                {/* Full Screen Modal */}
                {activeProduct === product.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm transition-all duration-300">
                    <div 
                      className="bg-white dark:bg-slate-900 w-full h-full overflow-auto animate-in fade-in zoom-in duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close Button */}
                      <button 
                        onClick={closePopup}
                        className="fixed right-6 top-6 z-50 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X size={24} className="text-slate-600 dark:text-white" />
                      </button>

                      {/* Top Section */}
                      <div className="flex flex-col lg:flex-row">
                        {/* Left Column - Image */}
                        <div className="lg:w-1/2">
                          <div className="relative h-96 lg:h-[600px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"></div>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="object-contain w-full h-full p-12 relative z-10"
                            />
                            <Badge className="absolute top-8 left-8 z-20 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-4 py-1 rounded-full font-medium text-white text-base">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Right Column - Details */}
                        <div className="lg:w-1/2 p-8 md:p-16 lg:overflow-auto">
                          <div className="flex justify-between items-start">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">{product.name}</h2>
                          </div>
                          
                          <div className="flex items-center mt-4 mb-8">
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-md">
                              <Star size={20} className="text-amber-500" fill="currentColor" /> 
                              <span className="text-base font-medium text-amber-700 dark:text-amber-400">{product.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-lg text-slate-700 dark:text-slate-300 mb-12 leading-relaxed">{product.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                              <div className="flex items-center text-slate-700 dark:text-slate-300 mb-2">
                                <Clock size={20} className="mr-3 text-slate-500 dark:text-slate-400" />
                                <span className="text-base font-medium">Burning Time</span>
                              </div>
                              <p className="text-slate-900 dark:text-white font-semibold pl-8 text-lg">{product.burningTime}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                              <div className="flex items-center text-slate-700 dark:text-slate-300 mb-2">
                                <ShoppingBag size={20} className="mr-3 text-slate-500 dark:text-slate-400" />
                                <span className="text-base font-medium">Availability</span>
                              </div>
                              <p className="text-slate-900 dark:text-white font-semibold pl-8 text-lg">
                                {product.stock > 10 ? 'In Stock' : `${product.stock} left`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-12 pb-8 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-base text-slate-500 dark:text-slate-400 mb-2">Price</p>
                            <div className="flex items-end gap-3">
                              <p className="text-4xl font-bold text-slate-900 dark:text-white">₹{product.price}</p>
                              <p className="text-lg text-slate-500 dark:text-slate-400 mb-1 line-through">₹{Math.round(product.price * 1.2)}</p>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 ml-2 px-3 py-1 text-base">
                                Save 20%
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <Button 
                              onClick={(e) => handleAddToCart(product, e)} 
                              className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-8 text-lg"
                            >
                              Add to Cart
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium py-8 text-lg"
                            >
                              <Link href="/shop">
                                View More Products
                              </Link>
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
        </div>
      </section>
      
      {/* Add Toaster component for notifications */}
      <Toaster />
    </main>
  );
}