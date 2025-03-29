"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Order {
  id: number;
  name: string;
  email: string;
  address: string;
  total_price: number;
  payment_method: string;
  status: "Pending" | "Dispatched" | "Delivered";
  created_at: string;
}

interface StatsResponse {
  totalSales: number;
  totalOrders: number;
  stock: number;
  orders: Order[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  category?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsResponse>({
    totalSales: 0,
    totalOrders: 0,
    stock: 0,
    orders: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "1",
    description: "",
    image: "",
    category: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [token, setToken] = useState<string | null>(null); // No localStorage persistence
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [buttonStates, setButtonStates] = useState<
    Record<number, { dispatched: boolean; delivered: boolean }>
  >({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Start unauthenticated
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { toast } = useToast();

  // Hardcoded credentials
  const HARD_CODED_USERNAME = "Namo";
  const HARD_CODED_PASSWORD = "admin";

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false); // Always require login
      return;
    }

    const validateToken = async () => {
      try {
        const [statsResponse, productsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const responseData = statsResponse.data;
        const calculatedTotalSales = responseData.orders.reduce(
          (sum: number, order: Order) => sum + order.total_price,
          0
        );
        setStats({
          ...responseData,
          totalSales: responseData.totalSales ?? calculatedTotalSales,
          totalOrders: responseData.totalOrders ?? responseData.orders.length,
        });
        setProducts(productsResponse.data);
        setIsAuthenticated(true);

        const socketInstance = io("http://localhost:5000");
        setSocket(socketInstance);

        socketInstance.on("productUpdate", (updatedProducts: Product[]) => {
          setProducts(updatedProducts);
        });

        socketInstance.on("orderUpdate", (updatedOrders: Order[]) => {
          setStats((prev) => {
            const newTotalSales = updatedOrders.reduce(
              (sum, order) => sum + order.total_price,
              0
            );
            return {
              ...prev,
              orders: updatedOrders,
              totalOrders: updatedOrders.length,
              totalSales: newTotalSales,
            };
          });
        });

        return () => {
          socketInstance.disconnect();
        };
      } catch (err: any) {
        console.error("Token validation failed:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          setToken(null);
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
            duration: 2000,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load dashboard data. Please try again.",
            variant: "destructive",
            duration: 2000,
          });
        }
      }
    };

    validateToken();
  }, [token]);

  const handleLogin = () => {
    if (!loginUsername || !loginPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter both username and password.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (loginUsername === HARD_CODED_USERNAME && loginPassword === HARD_CODED_PASSWORD) {
      const dummyToken = "hardcoded-auth-token";
      setToken(dummyToken); // Set token without localStorage
      setLoginUsername("");
      setLoginPassword("");
      toast({
        title: "Success",
        description: "Logged in successfully!",
        variant: "success",
        duration: 2000,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const addProduct = async () => {
    if (!token || !isAuthenticated) return;

    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Missing Fields",
        description: "Name and price are required.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        description: newProduct.description || undefined,
        image: newProduct.image || undefined,
        category: newProduct.category || undefined,
      };
      await axios.post("http://localhost:5000/api/products", productData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setNewProduct({ name: "", price: "", stock: "1", description: "", image: "", category: "" });
      toast({
        title: "Success",
        description: "Product added successfully!",
        variant: "success",
        duration: 2000,
      });
      socket?.emit("productUpdate", [...products, productData]);
    } catch (error: any) {
      console.error("Error adding product:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add product.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const deleteProduct = async (id: number) => {
    if (!token || !isAuthenticated) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: "Product deleted successfully!",
        variant: "success",
        duration: 2000,
      });
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      socket?.emit("productUpdate", updatedProducts);
    } catch (error: any) {
      console.error("Error deleting product:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete product.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const updateProduct = async () => {
    if (!token || !isAuthenticated || !editingProduct) return;

    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct.id}`,
        editingProduct,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      toast({
        title: "Success",
        description: "Product updated successfully!",
        variant: "success",
        duration: 2000,
      });
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id ? editingProduct : p
      );
      setProducts(updatedProducts);
      socket?.emit("productUpdate", updatedProducts);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error updating product:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update product.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const markOutOfStock = async (id: number) => {
    if (!token || !isAuthenticated) return;

    try {
      await axios.put(
        `http://localhost:5000/api/products/${id}`,
        { stock: 0 },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      toast({
        title: "Success",
        description: "Product marked as Out of Stock!",
        variant: "success",
        duration: 2000,
      });
      const updatedProducts = products.map((p) =>
        p.id === id ? { ...p, stock: 0 } : p
      );
      setProducts(updatedProducts);
      socket?.emit("productUpdate", updatedProducts);
    } catch (error: any) {
      console.error("Error marking product out of stock:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mark product as out of stock.",
        variant: "destructive",
        duration: 2000,
      });
      
    }
  };

  const updateOrderStatus = async (id: number, status: "Dispatched" | "Delivered") => {
    if (!token || !isAuthenticated) return;

    try {
      await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      toast({
        title: "Success",
        description: `Order marked as ${status}!`,
        variant: "success",
        duration: 2000,
      });

      setButtonStates((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          dispatched: status === "Dispatched" || status === "Delivered" || prev[id]?.dispatched,
          delivered: status === "Delivered" || prev[id]?.delivered,
        },
      }));

      const updatedOrders = stats.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      );
      setStats((prev) => ({ ...prev, orders: updatedOrders }));
      socket?.emit("orderUpdate", updatedOrders);

      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error: any) {
      console.error("Error updating order status:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update order status.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Premium Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-200 to-rose-200">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-amber-300"
        >
          <h2 className="text-3xl font-serif font-bold text-center text-amber-800 mb-6">
            Namo Admin
          </h2>
          <p className="text-center text-amber-600 mb-8 font-light">
            Welcome back, master of scents
          </p>
          <div className="space-y-6">
            <Input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Button
              onClick={handleLogin}
              className="w-full p-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-md"
            >
              Enter the Sanctuary
            </Button>
          </div>
        </motion.div>
        <Toaster />
      </div>
    );
  }

  // Premium Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-rose-100 p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-serif font-bold text-amber-900 mb-8 flex items-center">
          <span className="mr-2">🪔</span> Namo Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-amber-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-amber-800 flex items-center">
                  <span className="mr-2">💰</span> Total Sales
                </h3>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  ₹{stats.totalSales.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-amber-200 cursor-pointer" onClick={() => setShowOrdersDialog(true)}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-amber-800 flex items-center">
                  <span className="mr-2">📦</span> Orders Summary
                </h3>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  {stats.totalOrders} Orders
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-amber-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-amber-800 flex items-center">
                  <span className="mr-2">🧺</span> Stock Level
                </h3>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  {stats.stock} Units
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
          <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-amber-900">📋 Order Management</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              {stats.orders.length === 0 ? (
                <p className="text-amber-700">No orders found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-amber-50">
                      <TableHead className="text-gray-900 font-semibold">Order ID</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Total</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Payment</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className={`${order.status === "Delivered" ? "bg-green-500" : "hover:bg-amber-50"}`}
                      >
                        <TableCell className={`${order.status === "Delivered" ? "text-white" : "text-gray-800"}`}>
                          {order.id}
                        </TableCell>
                        <TableCell className={`${order.status === "Delivered" ? "text-white" : "text-gray-800"}`}>
                          {order.name}
                        </TableCell>
                        <TableCell className={`${order.status === "Delivered" ? "text-white" : "text-gray-800"}`}>
                          ₹{order.total_price.toLocaleString()}
                        </TableCell>
                        <TableCell className={`${order.status === "Delivered" ? "text-white" : "text-gray-800"}`}>
                          {order.payment_method}
                        </TableCell>
                        <TableCell className={`${order.status === "Delivered" ? "text-white" : "text-gray-800"}`}>
                          {order.status}
                        </TableCell>
                        <TableCell className={`${order.status === "Delivered" ? "text-white" : "text-gray-800"}`}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "Dispatched")}
                              disabled={order.status !== "Pending"}
                              className={`border-amber-400 text-amber-800 ${buttonStates[order.id]?.dispatched ? "bg-amber-500 text-black" : ""}`}
                            >
                              Dispatch
                            </Button>
                            <Button
                              variant="default"
                              onClick={() => updateOrderStatus(order.id, "Delivered")}
                              disabled={order.status !== "Dispatched"}
                              className={`bg-amber-600 text-white hover:bg-amber-700 ${buttonStates[order.id]?.delivered ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              Deliver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-amber-900 font-serif">Order Details - #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 text-amber-800">
                <p><strong>Name:</strong> {selectedOrder.name}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                <p><strong>Total:</strong> ₹{selectedOrder.total_price.toLocaleString()}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-amber-900 font-serif">Edit Product - {editingProduct?.name}</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <Input
                  placeholder="Product Name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="bg-amber-50 border-amber-200 text-amber-900"
                />
                <Input
                  placeholder="Price"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="bg-amber-50 border-amber-200 text-amber-900"
                />
                <Select
                  value={editingProduct.stock.toString()}
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, stock: parseInt(value) })}
                >
                  <SelectTrigger className="bg-amber-50 border-amber-200 text-amber-900">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">In Stock</SelectItem>
                    <SelectItem value="0">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Description"
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="bg-amber-50 border-amber-200 text-amber-900"
                />
                <Input
                  placeholder="Image URL"
                  value={editingProduct.image || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="bg-amber-50 border-amber-200 text-amber-900"
                />
                <Input
                  placeholder="Category"
                  value={editingProduct.category || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="bg-amber-50 border-amber-200 text-amber-900"
                />
                <Button onClick={updateProduct} className="bg-amber-600 text-white hover:bg-amber-700">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-amber-200">
          <h3 className="text-2xl font-serif font-semibold text-amber-900 mb-6 flex items-center">
            <span className="mr-2">🛒</span> Manage Incense Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="bg-amber-50 border-amber-200 text-amber-900"
            />
            <Input
              placeholder="Price (₹)"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="bg-amber-50 border-amber-200 text-amber-900"
            />
            <Select
              value={newProduct.stock}
              onValueChange={(value) => setNewProduct({ ...newProduct, stock: value })}
            >
              <SelectTrigger className="bg-amber-50 border-amber-200 text-amber-900">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">In Stock</SelectItem>
                <SelectItem value="0">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="bg-amber-50 border-amber-200 text-amber-900"
            />
            <Input
              placeholder="Image URL"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              className="bg-amber-50 border-amber-200 text-amber-900"
            />
            <Input
              placeholder="Category (e.g., Sandalwood)"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="bg-amber-50 border-amber-200 text-amber-900"
            />
          </div>
          <Button
            onClick={addProduct}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
          >
            Add New Incense
          </Button>

          <div className="mt-8">
            <h4 className="text-xl font-semibold text-amber-900 mb-4">Product Inventory</h4>
            {products.length === 0 ? (
              <p className="text-amber-700">No products found.</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center p-4 bg-amber-50 rounded-lg shadow-sm border border-amber-200"
                  >
                    
                    <span className="text-amber-900">
                    {/* <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-20 h-20 object-cover rounded-lg"
                  /> */}
                      {product.name} - ₹{product.price} -{" "}
                      {product.stock > 0 ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="border-amber-400 text-amber-800 hover:bg-amber-300 hover:text-amber-900 transition-colors duration-200"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => markOutOfStock(product.id)}
                        disabled={product.stock === 0}
                        className="bg-amber-200 text-amber-900 hover:bg-amber-300"
                      >
                        ⛔ Out of Stock
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteProduct(product.id)}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        ❌ Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <Toaster />
    </div>
  );
}