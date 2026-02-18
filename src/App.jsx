import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';


// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Detect from './pages/user/Detect';
import Vegetables from './pages/user/Vegetables';
import Diseases from './pages/user/Diseases';
import Pests from './pages/user/Pests';
import Dashboard from './pages/user/Dashboard';
import CCTV from './pages/user/CCTV';
import Plots from './pages/user/Plots';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import Telegram from './pages/user/Telegram';
import Contact from './pages/user/Contact';
import DiseasePestDetail from './pages/user/DiseasePestDetail';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVegetables from './pages/admin/AdminVegetables';
import AdminVegetableForm from './pages/admin/AdminVegetableForm';
import AdminVegetableDetail from './pages/admin/AdminVegetableDetail';
import AdminDiseases from './pages/admin/AdminDiseases';
import AdminDiseaseForm from './pages/admin/AdminDiseaseForm';
import AdminDiseaseDetail from './pages/admin/AdminDiseaseDetail';
import AdminPests from './pages/admin/AdminPests';
import AdminPestForm from './pages/admin/AdminPestForm';
import AdminPestDetail from './pages/admin/AdminPestDetail';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserForm from './pages/admin/AdminUserForm';
import AdminUserDetail from './pages/admin/AdminUserDetail';

function App() {
  const location = useLocation();
  const hideNavFooter = ['/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">

        {!hideNavFooter && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Feature Routes */}
            <Route path="/detect" element={<Detect />} />
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
        </main>
        {!hideNavFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
