import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import AIHomePage from "./AIHomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen to login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AIHomePage />} />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <SignupPage /> : <Navigate to="/dashboard" replace />}
        />
        {/* ✅ Protected Route for Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
          }
        />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
