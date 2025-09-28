import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

// Icon Components
const EmailIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
  </svg>
);

const HeartIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
  </svg>
);

// Medical Background Pattern Component
const MedicalBackground = () => (
  <div className="absolute inset-0 overflow-hidden opacity-5">
    <svg className="w-full h-full" viewBox="0 0 400 400" fill="currentColor">
      {/* Medical cross patterns */}
      <g className="text-blue-600">
        <path d="M50 50h10v30h30v10H60v30H50V90H20V80h30V50z"/>
        <path d="M150 150h10v30h30v10h-30v30h-10v-30h-30v-10h30v-30z"/>
        <path d="M250 250h10v30h30v10h-30v30h-10v-30h-30v-10h30v-30z"/>
        <path d="M350 50h10v30h30v10h-30v30h-10V90h-30V80h30V50z"/>
        <path d="M50 350h10v30h30v10H60v30H50v-30H20v-10h30v-30z"/>
      </g>
      {/* DNA helix pattern */}
      <g className="text-indigo-600">
        <circle cx="100" cy="300" r="3"/>
        <circle cx="120" cy="290" r="3"/>
        <circle cx="140" cy="300" r="3"/>
        <circle cx="160" cy="310" r="3"/>
        <circle cx="180" cy="300" r="3"/>
        <circle cx="200" cy="290" r="3"/>
        <circle cx="220" cy="300" r="3"/>
      </g>
    </svg>
  </div>
);

// Auth Form Component
const AuthForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotScreenError, setForgotScreenError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotScreen, setShowForgotScreen] = useState(false);

  const [verificationSentMessage1, setVerificationSentMessage1] = useState("We've sent a verification link to your email address.");
  const [verificationSentMessage2, setVerificationSentMessage2] = useState("Please check your inbox and click the verification link to complete your registration, and login using your credentials.");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if(isLogin){
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        if (userCredential.user.emailVerified) {
          onLogin(formData);
        } else {
          setError("Please verify your email before logging in!");
        }
      } else{
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setIsLoading(false);
          return;
        }
        if (!formData.agreeToTerms) {
          setError('Please agree to terms and conditions');
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.fullName });
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        setIsLogin(true);
      }
      
      //If we reach here, authentication was successful
      setIsLoading(false);
      
    } catch(err){
      console.error("Auth error:", err);
      setIsLoading(false);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email address or password!");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  const forgotPasswordSendEmail = async() => {
    try {
      await sendPasswordResetEmail(auth, formData?.email);
      setVerificationSentMessage1("We've sent a password reset link to your email address.");
      setVerificationSentMessage2("Please check your inbox and click the link to change your password, and login using your new credentials.");
      setVerificationSent(true);
    } catch (err) {
      setForgotScreenError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      <MedicalBackground />
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <HeartIcon className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">ChronoCare</h1>
          <p className="text-blue-600">Your Health, Our Priority</p>
        </div>

        {/* Auth Toggle */}
        <div className="bg-blue-100 p-1 rounded-xl mb-6 flex">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              isLogin 
                ? 'bg-white text-blue-900 shadow-md' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              !isLogin 
                ? 'bg-white text-blue-900 shadow-md' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Form */}
        <div className="bg-white shadow-2xl border border-blue-200 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error.length !== 0 && (
              <div className="text-center">
                <span className="text-sm italic text-red-600">{error}</span>
              </div>
            )}

            {/* Full Name - Only for Sign Up */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="text-blue-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Dr. John Smith"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EmailIcon className="text-blue-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="doctor@chronocare.com"
                  required
                />
              </div>
            </div>

            {/* Phone - Only for Sign Up */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="text-blue-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="+1 (555) 123-4567"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="text-blue-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Only for Sign Up */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="text-blue-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms Agreement - Only for Sign Up */}
            {!isLogin && (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded transition-colors duration-200"
                  required={!isLogin}
                />
                <label className="text-sm text-blue-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In to ChronoCare' : 'Create Account'}
                </>
              )}
            </button>

            {/* Forgot Password - Only for Login */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {setShowForgotScreen(true);}}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Additional Features */}
        <div className="mt-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <h3 className="text-blue-900 font-semibold mb-2">Why Choose ChronoCare?</h3>
            <div className="grid grid-cols-3 gap-4 text-xs text-blue-700">
              <div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  🔒
                </div>
                <p>HIPAA Compliant</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  🤖
                </div>
                <p>AI Powered</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  📊
                </div>
                <p>Real-time Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification link send successfully screen */}
      {verificationSent && (
        <div className="fixed inset-0 w-full h-full backdrop-blur-sm flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            {/* Animated Green Tick */}
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg 
                className="w-10 h-10 text-white animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Email Sent Successfully!</h2>
            <p className="text-blue-600 mb-6">
              {verificationSentMessage1}
            </p>
            <p className="text-sm text-blue-500 mb-6">
              {verificationSentMessage2}
            </p>
            <button
              onClick={() => setVerificationSent(false)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Forgot password screen */}
      {showForgotScreen && (
        <div className="fixed inset-0 w-full h-full backdrop-blur-sm flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Forgot Password</h2>
            <p className="text-blue-600 mb-6">
              Enter your email address and we'll send you a password reset link.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await forgotPasswordSendEmail();
                setShowForgotScreen(false);
              }}
              className="space-y-6"
            >
              <div className="relative mb-6">
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  placeholder="Email address"
                  className="w-full py-3 pl-10 pr-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                  <EmailIcon />
                </span>
              </div>

              {forgotScreenError.length !== 0 && (
                <div className="text-center mb-4">
                  <span className="text-sm italic text-red-600">{forgotScreenError}</span>
                </div>
              )}
              
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105 w-full"
              >
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setShowForgotScreen(false)}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function LoginPage({ onLogin }) {
  return <AuthForm onLogin={onLogin} />;
}

export default LoginPage;