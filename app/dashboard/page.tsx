"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, stock: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  interface StatsResponse {
    totalSales: number;
    totalOrders: number;
    stock: number;
  }

  interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
  }

  useEffect(() => {
    axios.get<StatsResponse>("http://localhost:3000/dashboard/stats").then((res) => setStats(res.data));
    axios.get<Product[]>("http://localhost:3000/dashboard/products").then((res) => setProducts(res.data));
  }, []);

  const addProduct = async () => {
    const res = await axios.post("http://localhost:3000/admin/products", newProduct);
    setProducts([...products, res.data]);
  };

  const deleteProduct = async (id: string) => {
    await axios.delete(`http://localhost:3000/admin/products/${id}`);
    setProducts(products.filter((product) => product._id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">💰 Total Sales</h3>
              <p className="text-2xl">₹{stats.totalSales}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">📦 Orders Summary</h3>
              <p className="text-2xl">{stats.totalOrders} Orders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">📊 Stock Available</h3>
              <p className="text-2xl">{stats.stock} Items</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Product Management */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">🛍️ Manage Products</h3>

        {/* Add Product Form */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <Input
            placeholder="Price"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <Input
            placeholder="Stock"
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
          <Button onClick={addProduct}>Add Product</Button>
        </div>

        {/* Product List */}
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">Product List</h4>
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="flex justify-between p-2 border-b">
                <span>{product.name} - ₹{product.price} - Stock: {product.stock}</span>
                <Button variant="destructive" onClick={() => deleteProduct(product._id)}>❌ Delete</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}