'use client';

import { ShoppingCart, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/app/components/ui/sheet';
import { useCart } from '@/app/hooks/use-cart'; // Importing cart hook
import { Badge } from '@/app/components/ui/badge';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { cart } = useCart(); // Extracting cart data

  // Calculate total number of items in the cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
  ];

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              Namo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium px-4 py-2 transition-all duration-500 delay-2000
                          rounded-full hover:bg-black hover:text-white 
                          dark:hover:bg-white dark:hover:text-black"
              >
                {item.name}
                <span className="absolute inset-0 rounded-full scale-95 opacity-0 transition-all duration-500 delay-2000 ease-in-out 
                                hover:scale-100 hover:opacity-100"></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle (Only renders on client-side) */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {/* Shopping Cart with Badge */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="relative text-sm font-medium px-4 py-2 transition-all duration-500 delay-2000
                                  rounded-full hover:bg-black hover:text-white 
                                  dark:hover:bg-white dark:hover:text-black"
                      >
                        {item.name}
                        <span className="absolute inset-0 rounded-full scale-95 opacity-0 transition-all duration-500 delay-2000 ease-in-out 
                                        hover:scale-100 hover:opacity-100"></span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
