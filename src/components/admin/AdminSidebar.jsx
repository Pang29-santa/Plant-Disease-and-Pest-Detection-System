import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  Leaf,
  Bug,
  Sprout,
  Users,
  LogOut,
  Menu,
  X,
  FileBarChart
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      title: t('admin.logout.title'),
      text: t('admin.logout.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('admin.logout.confirm'),
      cancelButtonText: t('admin.logout.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('admin.sidebar.dashboard'), path: '/admin' },
    { icon: Leaf, label: t('admin.sidebar.vegetables'), path: '/admin/vegetables' },
    { icon: Sprout, label: t('admin.sidebar.diseases'), path: '/admin/diseases' },
    { icon: Bug, label: t('admin.sidebar.pests'), path: '/admin/pests' },
    { icon: FileBarChart, label: t('admin.sidebar.reports'), path: '/admin/reports' },
    { icon: Users, label: t('admin.sidebar.users'), path: '/admin/users' },
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-green-800 text-white transition-all duration-300 flex flex-col shadow-xl z-20 overflow-hidden`}
    >
      <div className="p-4 flex items-center justify-between bg-green-900 h-[73px]">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-full min-w-[32px] shadow-inner">
            <Leaf className="w-5 h-5 text-green-700" />
          </div>
          {sidebarOpen && (
            <span className="font-black text-sm leading-tight tracking-tight uppercase">
              {t('admin.sidebar.brand').split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </span>
          )}
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-green-100 hover:text-white transition-colors">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-6 py-3.5 transition-all group relative ${
                isActive 
                  ? 'bg-green-700/50 text-white border-r-4 border-yellow-400' 
                  : 'text-green-100 hover:bg-green-700/30'
              }`}
            >
              <item.icon className={`w-5 h-5 min-w-[20px] transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {sidebarOpen && (
                <span className={`ml-4 text-sm font-bold tracking-wide transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-100 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 min-w-[20px] group-hover:-translate-x-1 transition-transform" />
          {sidebarOpen && <span className="ml-4 text-sm font-bold uppercase tracking-widest">{t('admin.sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
