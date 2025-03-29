"use client";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";
import { useCart } from "../hooks/use-cart";
import { Star, Clock, ShoppingBag, X, Send } from "lucide-react";
import { Textarea } from "../components/ui/textarea";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number; // 1 for "In Stock", 0 for "Out of Stock"
  description?: string;
  image?: string;
  category?: string;
}

interface Review {
  id: number;
  productId: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

const StarRating = ({
  rating,
  size = 16,
  interactive = false,
  onRatingChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-button ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => handleRatingClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <Star
            size={size}
            className={`${
              (hoverRating || rating) >= star
                ? "text-amber-500"
                : "text-slate-300 dark:text-slate-600"
            }`}
            fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const formattedProducts = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: Number(p.stock), // Ensure stock is a number
          description: p.description || "No description available",
          image: p.image || "https://via.placeholder.com/300",
          category: (p.category || "Uncategorized").trim().toLowerCase(),
        }));
        console.log("Raw Products from API:", data);
        console.log("Formatted Products:", formattedProducts);
        setProducts(formattedProducts);
      })
      .catch((err) => console.error("Error fetching products:", err));

    fetch("http://localhost:5000/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        const formattedReviews = data.map((r: any) => ({
          id: r.id,
          productId: r.productId,
          user: r.name,
          avatar: r.avatar || "/api/placeholder/40/40",
          rating: r.rating || 0,
          comment: r.review,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Unknown date",
        }));
        setReviews(formattedReviews);
      })
      .catch((err) => console.error("Error fetching reviews:", err));

    const socketInstance = io("http://localhost:5000");
    setSocket(socketInstance);

    socketInstance.on("productUpdate", (updatedProducts: any[]) => {
      const formattedProducts = updatedProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: Number(p.stock), // Ensure stock is a number
        description: p.description || "No description available",
        image: p.image || "https://via.placeholder.com/300",
        category: (p.category || "Uncategorized").trim().toLowerCase(),
      }));
      console.log("Socket.IO Product Update:", formattedProducts);
      setProducts(formattedProducts);
    });

    socketInstance.on("reviewUpdate", (updatedReviews: any[]) => {
      const formattedReviews = updatedReviews.map((r: any) => ({
        id: r.id,
        productId: r.productId,
        user: r.name,
        avatar: r.avatar || "/api/placeholder/40/40",
        rating: r.rating || 0,
        comment: r.review,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Unknown date",
      }));
      setReviews(formattedReviews);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    if (mediaQuery.matches) {
      document.documentElement.classList.add("dark");
    }
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const allCategories = Array.from(
    new Set(products.map((p) => (p.category ?? "Uncategorized").trim().toLowerCase()))
  ).sort();

  const filteredProducts =
    category === "all"
      ? products
      : products.filter(
          (product) =>
            (product.category ?? "Uncategorized").trim().toLowerCase() ===
            category.trim().toLowerCase()
        );

  useEffect(() => {
    console.log("Selected Category:", category);
    console.log("All Categories:", ["all", ...allCategories]);
    console.log("Filtered Products:", filteredProducts);
  }, [category, products]);

  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Adding ${product.name} to cart, stock: ${product.stock}, type: ${typeof product.stock}`);
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: `Sorry, the ${product.name} is out of stock. Come back later to see the availability.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    addToCart({
      ...product,
      image: product.image ?? "https://via.placeholder.com/300",
      category: product.category ?? "Uncategorized",
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const openPopup = (id: number) => {
    setActiveProduct(id);
    setActiveTab("details");
    document.body.style.overflow = "hidden";
  };

  const closePopup = (event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveProduct(null);
    document.body.style.overflow = "";
    setNewReview({ rating: 0, comment: "" });
  };

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmitReview = async (productId: number) => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      toast({
        title: "Cannot submit review",
        description: "Please provide both a rating and comment.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Anonymous",
          review: newReview.comment,
          productId,
          rating: newReview.rating,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      setNewReview({ rating: 0, comment: "" });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getProductReviews = (productId: number) => {
    return reviews.filter((review) => review.productId === productId);
  };

  const capitalizeCategory = (cat: string | undefined) => {
    return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "Uncategorized";
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
            <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">
              All Categories
            </SelectItem>
            {allCategories.map((cat) => (
              <SelectItem
                key={cat}
                value={cat}
                className="dark:text-white dark:focus:bg-slate-700"
              >
                {capitalizeCategory(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400">
          No products found in this category.
        </p>
      ) : (
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
                      src={product.image ?? "https://via.placeholder.com/300"}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <Badge className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-3 py-1 rounded-full font-medium text-xs text-white">
                        {capitalizeCategory(product.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-slate-800 dark:text-white text-lg">{product.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">₹{product.price}</p>
                      <Button
                        onClick={(e) => handleAddToCart(product, e)}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors dark:text-white"
                        // Removed disabled to allow toast to show
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {activeProduct === product.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm transition-all duration-300">
                  <div
                    className="bg-white dark:bg-slate-900 w-full h-full overflow-auto animate-in fade-in zoom-in duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={closePopup}
                      className="fixed right-6 top-6 z-50 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X size={24} className="text-slate-600 dark:text-white" />
                    </button>

                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-1/2">
                        <div className="relative h-96 lg:h-[600px]">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"></div>
                          <img
                            src={product.image ?? "https://via.placeholder.com/300"}
                            alt={product.name}
                            className="object-contain w-full h-full p-12 relative z-10"
                          />
                          <div className="absolute top-8 left-8 z-20 flex flex-wrap gap-2 max-w-[80%]">
                            <Badge className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-4 py-1 rounded-full font-medium text-white text-base">
                              {capitalizeCategory(product.category)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-1/2 p-8 md:p-16 lg:overflow-auto">
                        <div className="flex justify-between items-start">
                          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">{product.name}</h2>
                        </div>

                        <div className="flex items-center mt-4 mb-8">
                          <span className="text-base text-slate-500 dark:text-slate-400">
                            {getProductReviews(product.id).length} reviews
                          </span>
                        </div>

                        <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
                          <div className="flex space-x-8">
                            <button
                              className={`pb-3 px-1 ${
                                activeTab === "details"
                                  ? "border-b-2 border-amber-500 text-slate-900 dark:text-white font-medium"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                              onClick={() => setActiveTab("details")}
                            >
                              Details
                            </button>
                            <button
                              className={`pb-3 px-1 ${
                                activeTab === "reviews"
                                  ? "border-b-2 border-amber-500 text-slate-900 dark:text-white font-medium"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                              onClick={() => setActiveTab("reviews")}
                            >
                              Reviews ({getProductReviews(product.id).length})
                            </button>
                          </div>
                        </div>

                        {activeTab === "details" && (
                          <>
                            <p className="text-lg text-slate-700 dark:text-slate-300 mb-12 leading-relaxed">{product.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                <div className="flex items-center text-slate-700 dark:text-slate-300 mb-2">
                                  <ShoppingBag size={20} className="mr-3 text-slate-500 dark:text-slate-400" />
                                  <span className="text-base font-medium">Availability</span>
                                </div>
                                <p className="text-slate-900 dark:text-white font-semibold pl-8 text-lg">
                                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </p>
                              </div>
                            </div>

                            <div className="mb-12 pb-8 border-b border-slate-200 dark:border-slate-700">
                              <p className="text-base text-slate-500 dark:text-slate-400 mb-2">Price</p>
                              <div className="flex items-end gap-3">
                                <p className="text-4xl font-bold text-slate-900 dark:text-white">₹{product.price}</p>
                                <p className="text-lg text-slate-500 dark:text-slate-400 mb-1 line-through">
                                  ₹{Math.round(product.price * 1.2)}
                                </p>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 ml-2 px-3 py-1 text-base">
                                  Save 20%
                                </Badge>
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <Button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-8 text-lg"
                                // Removed disabled to allow toast to show
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </>
                        )}

                        {activeTab === "reviews" && (
                          <div className="space-y-12">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Write a Review</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Your Rating
                                  </label>
                                  <StarRating
                                    rating={newReview.rating}
                                    size={24}
                                    interactive={true}
                                    onRatingChange={handleRatingChange}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Your Review
                                  </label>
                                  
                                  <Textarea
                                  
                                    placeholder="Share your experience with this product..."
                                    value={newReview.comment}
                                    onChange={handleCommentChange}
                                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
                                    rows={4}
                                  />
                                </div>
                                <Button
                                  onClick={() => handleSubmitReview(product.id)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                  <Send size={18} className="mr-2" />
                                  Submit Review
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h3 className="text-xl font-medium text-slate-900 dark:text-white">Customer Reviews</h3>
                              {getProductReviews(product.id).length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 italic">
                                  No reviews yet. Be the first to review this product!
                                </p>
                              ) : (
                                <div className="space-y-6">
                                  {getProductReviews(product.id).map((review) => (
                                    <div
                                      key={review.id}
                                      className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0"
                                    >
                                      <div className="flex items-start">
                                        <img
                                          src={review.avatar}
                                          alt={review.user}
                                          className="w-10 h-10 rounded-full mr-4"
                                        />
                                        <div className="flex-1">
                                          <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-medium text-slate-900 dark:text-white">{review.user}</h4>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{review.date}</span>
                                          </div>
                                          <div className="mb-2">
                                            <StarRating rating={review.rating} size={16} />
                                          </div>
                                          <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Toaster />
    </div>
  );
}