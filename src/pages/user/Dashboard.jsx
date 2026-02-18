import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  Leaf, 
  Bug, 
  Camera,
  History,
  LayoutGrid,
  MessageCircle,
  User,
  Send,
  LogOut,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: t('user.dashboard.logout.confirm'),
      text: t('user.dashboard.logout.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('nav.logout'),
      cancelButtonText: t('admin.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  const menuActions = [
    {
      title: t('home.features.detect.title'),
      desc: t('home.features.detect.desc'),
      icon: Camera,
      path: "/detect",
      color: "from-green-600 to-emerald-500",
      shadow: "shadow-emerald-200"
    },
    {
      title: t('home.features.vegetables.title'),
      desc: t('home.features.vegetables.desc'),
      icon: Leaf,
      path: "/vegetables",
      color: "from-green-500 to-green-400",
      shadow: "shadow-green-100"
    },
    {
      title: t('home.features.diseases.title'),
      desc: t('home.features.diseases.desc'),
      icon: ShieldAlert,
      path: "/diseases",
      color: "from-red-500 to-orange-400",
      shadow: "shadow-red-100"
    },
    {
      title: t('home.features.pests.title'),
      desc: t('home.features.pests.desc'),
      icon: Bug,
      path: "/pests",
      color: "from-orange-500 to-yellow-400",
      shadow: "shadow-orange-100"
    }
  ];

  const secondaryActions = [
    {
       title: t('user.dashboard.secondary.cctv'),
       desc: t('user.dashboard.secondary.cctvDesc'),
       icon: LayoutGrid,
       path: "/cctv",
       color: "text-sky-600",
       bg: "bg-sky-50"
    },
    {
       title: t('user.dashboard.secondary.history'),
       desc: t('user.dashboard.secondary.historyDesc'),
       icon: History,
       path: "/history",
       color: "text-teal-600",
       bg: "bg-teal-50"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Header with Wave/Gradient */}
      <div className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 pt-8 pb-24 px-4 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col sm:flex-row items-center justify-between text-white gap-6">
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white/20 overflow-hidden bg-white/10 backdrop-blur-md shadow-2xl shrink-0 transform hover:rotate-3 transition-transform duration-300">
                {user?.image_path ? (
                  <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-green-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {t('user.dashboard.welcome', { fullname: user?.fullname || t('admin.roles.user') })}
              </h1>
              <p className="text-green-50/80 text-sm sm:text-base font-medium opacity-90 leading-tight mt-1">
                {t('user.dashboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
             <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 transition-all font-bold text-sm"
             >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.profile')}</span>
             </button>
             <button 
                onClick={() => navigate('/telegram')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 transition-all font-bold text-sm"
             >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.telegram')}</span>
             </button>
             <button 
                onClick={handleLogout}
                className="p-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl transition-all shadow-lg hover:shadow-red-200"
             >
                <LogOut className="w-5 h-5 text-white" />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12">
        {/* Main Grid Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10">
          {menuActions.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white p-6 sm:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col gap-6 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all group cursor-pointer relative overflow-hidden active:scale-[0.98]"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white ${item.shadow} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-green-50 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-black text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
              
              {/* Subtle background text or icon */}
              <item.icon className="absolute -bottom-4 -right-4 w-32 h-32 text-gray-50 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
            </div>
          ))}
        </div>

        {/* Secondary Nav + Support Header */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {secondaryActions.map((item, index) => (
                  <button
                      key={index}
                      onClick={() => navigate(item.path)}
                      className="flex items-center justify-between p-5 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group"
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                              <item.icon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                              <h4 className="font-extrabold text-gray-800 text-base">{item.title}</h4>
                              <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                          </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-all group-hover:translate-x-1" />
                  </button>
              ))}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 lg:w-2/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black">{t('user.dashboard.support.title')}</h2>
                <p className="text-gray-400 text-[11px] leading-tight max-w-[140px]">{t('user.dashboard.support.desc')}</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl shadow-xl shadow-green-900/20 transition-all font-bold text-sm whitespace-nowrap active:scale-95 relative z-10 border border-green-500/50"
            >
              {t('user.dashboard.support.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
