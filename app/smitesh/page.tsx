'use client';
import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Star } from "lucide-react";

// TypeScript Prop Types
interface Review {
  name: string;
  text: string;
}

interface SimilarProduct {
  title: string;
  price: number;
  image: string;
}

interface Product {
  title: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  reviews: Review[];
  similarProducts: SimilarProduct[];
}

const ProductDetailCard: React.FC<{ product: Product }> = ({ product }) => {
  const [reviews, setReviews] = useState<Review[]>(product.reviews);
  const [newReview, setNewReview] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("");

  const handleAddReview = () => {
    if (newReview.trim() && reviewerName.trim()) {
      setReviews([...reviews, { name: reviewerName, text: newReview }]);
      setNewReview("");
      setReviewerName("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-r from-yellow-200 via-orange-300 to-yellow-400 min-h-screen">
      <Card className="w-full max-w-2xl rounded-2xl shadow-2xl bg-white p-6 border border-transparent transition-transform transform hover:scale-105 duration-300 hover:shadow-xl">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-64 object-contain object-center mb-4 transition-transform transform hover:scale-110 duration-300"
        />

        <CardContent>
          {/* Product Details */}
          <h2 className="text-3xl font-bold text-yellow-800 mb-2">{product.title}</h2>
          <p className="text-gray-700 mb-4 text-lg italic">{product.description}</p>

          {/* Price & Rating */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-semibold text-red-600">₹{product.price.toFixed(2)}</span>
            <span className="flex items-center gap-1 text-yellow-500 text-lg">
              <Star size={20} fill="currentColor" /> {product.rating}
            </span>
          </div>

          {/* Reviews */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-yellow-800">Customer Reviews</h3>
            <ul className="list-disc pl-5 text-gray-800">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <li key={index} className="text-md italic">
                    <strong>{review.name}:</strong> "{review.text}"
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </ul>
          </div>

          {/* Add Review Section */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-yellow-800">Share Your Experience</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="border p-2 w-full rounded-md mb-2 border-yellow-500"
            />
            <textarea
              placeholder="Write your review here..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="border p-2 w-full rounded-md mb-2 border-yellow-500"
            />
            <button
              onClick={handleAddReview}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
              disabled={!newReview.trim() || !reviewerName.trim()}
            >
              Submit Review
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Similar Products */}
      <div className="mt-6 w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-yellow-800 mb-3">More Incense Varieties</h3>
        <div className="grid grid-cols-2 gap-4">
          {product.similarProducts.map((item, index) => (
            <div key={index} className="p-4 rounded-lg shadow-md bg-white border-transparent transition-transform transform hover:scale-105 hover:shadow-2xl hover:shadow-gray-500 duration-300">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-32 object-contain transition-transform transform hover:scale-110 duration-300 shadow-md"
              />
              <p className="text-md font-medium mt-2 text-gray-800">{item.title}</p>
              <span className="text-red-600 font-semibold">₹{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example Product Data
const exampleProduct: Product = {
  title: "Premium Agarbatti Set",
  description: "Aromatic and long-lasting incense sticks for a divine and soothing experience.",
  price: 499,
  rating: 4.9,
  image: "https://th.bing.com/th/id/OIP.7DMT4bwaJICQ0zXUmZi7EAHaHa?w=184&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  reviews: [
    { name: "Rahul Sharma", text: "Very pleasant fragrance, lasts long!" },
    { name: "Meera Joshi", text: "Perfect for meditation and relaxation." },
    { name: "Amit Verma", text: "Great quality, will buy again." },
  ],
  similarProducts: [
    {
      title: "Sandalwood Agarbatti",
      price: 299,
      image: "https://th.bing.com/th/id/OIP.iSgJxaaTho2aR_OtmeTfRwHaKG?w=135&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    },
    {
      title: "Lavender Incense Sticks",
      price: 349,
      image: "https://th.bing.com/th/id/OIP.iSgJxaaTho2aR_OtmeTfRwHaKG?w=135&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    },
  ],
};

export default function App() {
  return <ProductDetailCard product={exampleProduct} />;
}