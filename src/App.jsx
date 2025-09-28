import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/LocalAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './pages/LandingPage';
import LoginTypePage from './pages/LoginTypePage';
import LoginPage from './pages/LoginPage';
import DonorDashboard from './pages/DonorDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import StockManagementPage from './pages/StockManagementPage';
import RegisterPage from './pages/RegisterPage';
import DemonstrationPage from './pages/DemonstrationPage';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login/type" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    // Redirect to appropriate dashboard based on role
    if (userProfile?.role === 'donor') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (userProfile?.role === 'professional') {
      return <Navigate to="/professional/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirects if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Only redirect if user is already authenticated and not on login pages
  if (user && userProfile && !location.pathname.includes('/login') && !location.pathname.includes('/register')) {
    // Redirect to appropriate dashboard based on role
    if (userProfile.role === 'donor') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (userProfile.role === 'professional') {
      return <Navigate to="/professional/dashboard" replace />;
    }
  }

  // If user exists but profile is not loaded yet, show loading
  if (user && !userProfile) {
    return <LoadingSpinner />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login/type" 
          element={
            <PublicRoute>
              <LoginTypePage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login/:userType" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/demonstracao"
          element={<DemonstrationPage />}
        />
        <Route 
          path="/donor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['professional', 'admin']}>
              <ProfessionalDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional/stock" 
          element={
            <ProtectedRoute allowedRoles={['professional', 'admin']}>
              <StockManagementPage />
            </ProtectedRoute>
          } 
        />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;