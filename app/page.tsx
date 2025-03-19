'use client'

import { Button } from '../app/components/ui/button';
import { Card, CardContent } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const featuredProducts = [
  {
    id: 1,
    name: 'Sandalwood Incense',
    price: 19.99,
    image: 'https://i.pinimg.com/474x/90/42/28/904228413f1cf1fee0fe3c997328a55e.jpg',
    category: 'Incense',
    description: 'Calming sandalwood fragrance for meditation and relaxation.',
  },
  {
    id: 2,
    name: 'Lavender Incense',
    price: 14.99,
    image: 'https://i.pinimg.com/474x/5d/0b/b1/5d0bb15fa9f52b9ee96f46d25a66b64e.jpg',
    category: 'Incense',
    description: 'Soothing lavender aroma to promote peace and tranquility.',
  },
  {
    id: 3,
    name: 'Rose Incense',
    price: 16.99,
    image: 'https://i.pinimg.com/474x/9a/c6/f0/9ac6f0ae11b6ef3b311fdd0cdef076bb.jpg',
    category: 'Incense',
    description: 'Romantic rose scent to uplift your mood.',
  },
];

export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <main>
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
          <Button size="lg" asChild>
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Best-Selling Incense Sticks</h2>
            <Button variant="outline" asChild>
              <Link href="/shop">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-lg font-bold">₹{product.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}