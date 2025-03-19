'use client';

import { ShoppingCart, Sun, Moon, Menu, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/app/components/ui/sheet';
import { useRouter } from "next/navigation";
import { Badge } from '@/app/components/ui/badge';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Consistent login route path
  const loginPath = "/login";
  
  const handleLogin = () => {
    router.push(loginPath);
  }

  // Ensures theme is applied on client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    // { name: 'New Arrivals', href: '/new-arrivals' },
    // { name: 'Sale', href: '/sale' },
    // { name: 'Admin', href: '/admin' },
  ];

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group relative">
              <div className="relative flex items-center overflow-hidden">
                {/* Lotus Flower Symbol */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                  <div className="w-8 h-8 rounded-full border border-current rotate-45"></div>
                  <div className="w-8 h-8 rounded-full border border-current rotate-[90deg] absolute top-0"></div>
                  <div className="w-8 h-8 rounded-full border border-current rotate-[135deg] absolute top-0"></div>
                </div>
                
                <div className="pl-6">
                  {/* Main Brand Name */}
                  <span className="font-extrabold text-3xl inline-block transform transition-transform duration-700 relative z-10 
                                  bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900
                                  dark:from-slate-200 dark:to-slate-400
                                  group-hover:scale-105 group-hover:from-slate-800 group-hover:to-slate-950
                                  dark:group-hover:from-slate-100 dark:group-hover:to-white">
                    NAMO
                  </span>
                  
                  {/* Animated line that extends on hover */}
                  <div className="h-px w-0 group-hover:w-full bg-slate-400 dark:bg-slate-500 transition-all duration-500 ease-out"></div>
                </div>
              </div>
              
              {/* Animated Smoke/Aura Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 bg-slate-100 dark:bg-slate-800 rounded-full opacity-0 
                             group-hover:w-full group-hover:h-full group-hover:opacity-10 -z-10 transition-all duration-700 ease-out blur-md"></div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium px-4 py-2 transition-all duration-500
                          rounded-full hover:bg-black hover:text-white 
                          dark:hover:bg-white dark:hover:text-black"
              >
                {item.name}
                <span className="absolute inset-0 rounded-full scale-95 opacity-0 transition-all duration-500 ease-in-out 
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
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {/* Login Button */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href={loginPath} title="Login">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Shopping Cart */}
            <Button variant="ghost" size="icon" asChild className="relative" title="View cart">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
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
                  <div className="mt-8">
                    {/* Mobile Logo */}
                    <div className="mb-8 text-center">
                      <div className="inline-block relative">
                        <span className="font-extrabold text-3xl
                                      bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900
                                      dark:from-slate-200 dark:to-slate-400">
                          NAMO
                        </span>
                        
                        <div className="h-px w-full bg-slate-400 dark:bg-slate-500 mt-1"></div>
                        
                        {/* Simplified Lotus Symbol for Mobile */}
                        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 opacity-20">
                          <div className="w-6 h-6 rounded-full border border-current rotate-45"></div>
                          <div className="w-6 h-6 rounded-full border border-current rotate-[90deg] absolute top-0"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="relative text-sm font-medium px-4 py-2 transition-all duration-500
                                    rounded-full hover:bg-black hover:text-white 
                                    dark:hover:bg-white dark:hover:text-black"
                        >
                          {item.name}
                          <span className="absolute inset-0 rounded-full scale-95 opacity-0 transition-all duration-500 ease-in-out 
                                          hover:scale-100 hover:opacity-100"></span>
                        </Link>
                      ))}
                      
                      {/* Added Login link to mobile menu with consistent path */}
                      <button
                        onClick={handleLogin}
                        className="relative text-sm font-medium px-4 py-2 transition-all duration-500
                                  rounded-full hover:bg-black hover:text-white 
                                  dark:hover:bg-white dark:hover:text-black"
                      >
                        Login
                        <span className="absolute inset-0 rounded-full scale-95 opacity-0 transition-all duration-500 ease-in-out 
                                      hover:scale-100 hover:opacity-100"></span>
                      </button>
                    </div>
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