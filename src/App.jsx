import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DetectionProvider } from './context/DetectionContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const DetectPublic = lazy(() => import('./pages/DetectPublic'));
const DetectWithPlot = lazy(() => import('./pages/user/DetectWithPlot'));
const Vegetables = lazy(() => import('./pages/user/Vegetables'));
const Diseases = lazy(() => import('./pages/user/Diseases'));
const Pests = lazy(() => import('./pages/user/Pests'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const CCTV = lazy(() => import('./pages/user/CCTV'));
const Plots = lazy(() => import('./pages/user/MyPlots'));
const History = lazy(() => import('./pages/user/History'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Telegram = lazy(() => import('./pages/user/Telegram'));
const Contact = lazy(() => import('./pages/user/Contact'));
const DiseasePestDetail = lazy(() => import('./pages/user/DiseasePestDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVegetables = lazy(() => import('./pages/admin/AdminVegetables'));
const AdminVegetableForm = lazy(() => import('./pages/admin/AdminVegetableForm'));
const AdminVegetableDetail = lazy(() => import('./pages/admin/AdminVegetableDetail'));
const AdminDiseases = lazy(() => import('./pages/admin/AdminDiseases'));
const AdminDiseaseForm = lazy(() => import('./pages/admin/AdminDiseaseForm'));
const AdminDiseaseDetail = lazy(() => import('./pages/admin/AdminDiseaseDetail'));
const AdminPests = lazy(() => import('./pages/admin/AdminPests'));
const AdminPestForm = lazy(() => import('./pages/admin/AdminPestForm'));
const AdminPestDetail = lazy(() => import('./pages/admin/AdminPestDetail'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserForm = lazy(() => import('./pages/admin/AdminUserForm'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));

function App() {
  const location = useLocation();
  const hideNavFooter = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) || location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <DetectionProvider>
        <div className="min-h-screen flex flex-col">

          {!hideNavFooter && <Navbar />}
        <main className="flex-grow">
          <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div></div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Feature Routes */}
              <Route path="/detect" element={<DetectPublic />} />
              <Route path="/detect/plots" element={
                <ProtectedRoute>
                  <DetectWithPlot />
                </ProtectedRoute>
              } />
              <Route path="/vegetables" element={<Vegetables />} />
              <Route path="/diseases" element={<Diseases />} />
              <Route path="/pests" element={<Pests />} />
              <Route path="/diseases-pest/details/:id" element={
                <ProtectedRoute>
                  <DiseasePestDetail />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/cctv" element={
                <ProtectedRoute>
                  <CCTV />
                </ProtectedRoute>
              } />
              <Route path="/plots" element={
                <ProtectedRoute>
                  <Plots />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/telegram" element={
                <ProtectedRoute>
                  <Telegram />
                </ProtectedRoute>
              } />
              <Route path="/contact" element={
                <ProtectedRoute>
                  <Contact />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/vegetables" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVegetables />
                </ProtectedRoute>
              } />
              <Route path="/admin/vegetables/new" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVegetableForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/vegetables/edit/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVegetableForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/vegetables/view/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVegetableDetail />
                </ProtectedRoute>
              } />
              <Route path="/admin/diseases" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDiseases />
                </ProtectedRoute>
              } />
              <Route path="/admin/diseases/new" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDiseaseForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/diseases/edit/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDiseaseForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/diseases/view/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDiseaseDetail />
                </ProtectedRoute>
              } />
              <Route path="/admin/pests" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPests />
                </ProtectedRoute>
              } />
              <Route path="/admin/pests/new" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPestForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/pests/edit/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPestForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/pests/view/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPestDetail />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/users/new" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/users/edit/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/users/view/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserDetail />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!hideNavFooter && <Footer />}
        </div>
      </DetectionProvider>
    </AuthProvider>
  );
}

export default App;
