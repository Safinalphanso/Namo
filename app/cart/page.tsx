'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/use-cart';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 30;
  const total = subtotal + shipping;

  const upiID = "smiteshparvatkar@okicici";
  const upiLink = `upi://pay?pa=${upiID}&am=${total.toFixed(2)}&cu=INR`;

  const { width, height } = useWindowSize();
  const [showQR, setShowQR] = useState(false);
  const [showCODMessage, setShowCODMessage] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    paymentMethod: 'UPI',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.paymentMethod === "COD") {
      setShowCODMessage(true);
      setShowQR(false);
      setTimeout(() => {
        setOrderCompleted(true);
        setShowConfetti(true);
      }, 50);
    } else {
      setShowQR(true);
      setShowCODMessage(false);
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Start shopping to add items to your cart.</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center p-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-muted-foreground">₹{item.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6">Checkout</Button>
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center">
                  <DialogTitle>
                    {showCODMessage ? "Order Confirmed" : showQR ? "Scan to Pay" : "Enter Your Details"}
                  </DialogTitle>

                  {!showQR && !showCODMessage ? (
                    <form className="w-full space-y-4" onSubmit={handleSubmit}>
                      <Input type="text" placeholder="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                      <Input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
                      <Input type="text" placeholder="Address" name="address" value={formData.address} onChange={handleChange} required />
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="UPI">UPI</option>
                        <option value="COD">Cash on Delivery</option>
                      </select>
                      <Button type="submit" className="w-full">Proceed to Pay</Button>
                    </form>
                  ) : showCODMessage ? (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="text-green-600 font-semibold text-lg text-center">
                      🎉 Thank you for your order! 🎉
                    </motion.div>
                  ) : (
                    <>
                      <Image src="/images/qr.png" alt="Payment QR Code" width={200} height={200} priority />
                      <p className="text-sm text-muted-foreground mt-2">Scan this QR code to complete the payment.</p>
                      <p className="text-sm text-muted-foreground mt-2">Pay ₹{total.toFixed(2)}</p>
                      <a href={upiLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-4">Pay via Google Pay</a>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {showConfetti && <Confetti width={width} height={height} />}

              <Button variant="outline" className="w-full mt-2" onClick={clearCart}>Clear Cart</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}