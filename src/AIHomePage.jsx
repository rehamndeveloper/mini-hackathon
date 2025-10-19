import React from "react";
import { Link } from "react-router-dom";

export default function AIHomePage() {
  return (
    <div
      className="relative flex items-center justify-center h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Overlay for soft gradient tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/70 via-purple-800/60 to-indigo-900/70 backdrop-blur-sm"></div>

      {/* Content container */}
      <div className="relative z-10 text-center text-white px-6 max-w-lg">
        <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
          Welcome to <span className="text-indigo-300">AI Hub</span>
        </h1>
        <p className="text-lg mb-10 text-gray-200">
          Experience next-generation intelligence tools powered by AI.
        </p>

        <div className="flex justify-center space-x-6">
          <Link
            to="/login"
            className="bg-white/90 text-indigo-700 px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 hover:bg-white transition-all duration-300 backdrop-blur-md"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-500/80 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 hover:bg-indigo-600 transition-all duration-300 backdrop-blur-md"
          >
            Signup
          </Link>
        </div>
      </div>

      {/* Optional animated floating blobs for modern look */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
  );
}
