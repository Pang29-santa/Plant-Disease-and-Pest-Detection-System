import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const AdminLayout = ({ children, title = "ระบบตรวจสอบพืชสวนครัว" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
             {/* Toggle button for small screens if sidebar is hidden/overlay or managed differently */}
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-600">
                <Menu /> 
             </button>
            <h1 className="text-xl font-bold text-green-700">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* User Profile */}
            <div className="flex items-center gap-3">
                <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-800">{user?.fullname || 'Admin'}</span>
                </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
