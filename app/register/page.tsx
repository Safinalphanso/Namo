"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import Next.js router
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter(); // ✅ Initialize router
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setMessage({ text: "⚠️ All fields are required!", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:5000/api/register", formData, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage({ text: "✅ Registration successful!", type: "success" });
      setFormData({ username: "", email: "", password: "" });

      // ✅ Redirect to login page after 2 seconds
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      console.error("❌ Registration Error:", error);

      setMessage({
        text: error?.response?.data?.error || error?.message || "Something went wrong! Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-5">Register</h2>

        {/* Message Box */}
        {message && (
          <div className={`flex items-center p-3 mb-4 rounded-lg ${
            message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
          }`}>
            {message.type === "error" ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[68%] transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Register Button */}
          <button
            type="button"
            onClick={handleRegister}
            className={`w-full py-3 rounded-lg text-lg font-semibold transition-all flex justify-center items-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            disabled={loading}
          >
            <span>{loading ? "Registering..." : "Register"}</span>
          </button>

          {/* Login Button */}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full mt-3 py-3 rounded-lg text-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}
