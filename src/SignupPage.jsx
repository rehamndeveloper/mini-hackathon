import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Swal from "sweetalert2";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed ❌",
        text: error.message,
        confirmButtonColor: "#6366f1",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Account Created 🎉",
        text: "Please verify your email before logging in.",
        confirmButtonColor: "#6366f1",
      }).then(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      });
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1526378722430-4da6c5a2c8f3?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Gradient overlay for soft tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/80 via-purple-800/70 to-indigo-900/80 backdrop-blur-sm"></div>

      {/* Signup Card */}
      <form
        onSubmit={handleSignup}
        className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 w-96 text-white space-y-6"
      >
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-200 mb-6">
          Join the future with AI Dashboard
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full bg-white/20 placeholder-gray-300 text-white border border-white/30 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-white/20 placeholder-gray-300 text-white border border-white/30 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.03]"
          }`}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-300 text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-300 hover:text-indigo-200 underline"
          >
            Login
          </Link>
        </p>
      </form>

      {/* Animated Background Blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
  );
}
