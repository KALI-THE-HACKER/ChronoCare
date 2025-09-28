import React, { useState, useEffect } from "react";
import "./index.css";
import LoginPage from "./Components/LoginPage";
import Dashboard from "./Components/Dashboard";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        // User is signed in and email is verified
        setUserData({
          email: user.email,
          name: user.displayName || user.email
        });
        setIsLoggedIn(true);
      } else {
        // User is signed out or email not verified
        setUserData(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (data) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setIsLoggedIn(false);
    } catch (error) {
      alert("Failed to log out. Please try again.");
    }
  };

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">ChronoCare</h2>
          <p className="text-blue-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} userData={userData} />;
  }

  return <LoginPage onLogin={handleLogin} />;
}

export default App;