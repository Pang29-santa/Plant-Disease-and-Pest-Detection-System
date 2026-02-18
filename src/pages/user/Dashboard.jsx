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
  ArrowRight,
  Sparkles,
  Activity
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
      cancelButtonText: t('common.cancel'),
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
      shadow: "shadow-emerald-200/50",
      badge: t('user.dashboard.aiBadge')
    },
    {
      title: t('home.features.vegetables.title'),
      desc: t('home.features.vegetables.desc'),
      icon: Leaf,
      path: "/vegetables",
      color: "from-green-500 to-green-400",
      shadow: "shadow-green-100/50"
    },
    {
      title: t('home.features.diseases.title'),
      desc: t('home.features.diseases.desc'),
      icon: ShieldAlert,
      path: "/diseases",
      color: "from-red-500 to-orange-400",
      shadow: "shadow-red-100/50"
    },
    {
      title: t('home.features.pests.title'),
      desc: t('home.features.pests.desc'),
      icon: Bug,
      path: "/pests",
      color: "from-orange-500 to-yellow-400",
      shadow: "shadow-orange-100/50"
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Premium Header - Ultra Modern */}
      <div className="relative bg-gray-900 pt-12 pb-32 px-4 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-gray-900 to-gray-900" />
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 group">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2.5rem] border-4 border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl shadow-2xl flex-shrink-0 transform hover:rotate-6 transition-transform duration-500">
                  {user?.image_path ? (
                    <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                  <Activity className="w-4 h-4 text-white animate-pulse" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em]">
                    {user?.role === 'admin' ? t('user.dashboard.roleAdmin') : t('user.dashboard.roleUser')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {t('user.dashboard.welcome', { fullname: user?.fullname || t('user.dashboard.welcomeDefault') })}
                </h1>
                <p className="text-white/50 text-base sm:text-lg font-medium mt-1 max-w-sm">
                  {t('user.dashboard.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 transition-all font-black text-xs text-white uppercase tracking-widest active:scale-95"
               >
                  {t('nav.profile')}
               </button>
               <button 
                  onClick={() => navigate('/telegram')}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl transition-all font-black text-xs uppercase tracking-widest hover:bg-green-400 active:scale-95 shadow-xl shadow-black/20"
               >
                  <Send className="w-4 h-4" />
                  {t('nav.telegram')}
               </button>
               <button 
                  onClick={handleLogout}
                  className="p-3 bg-red-500/10 hover:bg-red-500 rounded-2xl group transition-all"
               >
                  <LogOut className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {/* Main Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {menuActions.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-transparent hover:border-green-100 flex flex-col gap-6 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden active:scale-95"
            >
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white ${item.shadow} shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <item.icon className="w-8 h-8 drop-shadow-lg" />
                </div>
              </div>

              <div className="relative z-10 mt-2">
                {item.badge && (
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                    {item.badge}
                  </span>
                )}
                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-green-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-bold">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-all" />
                </div>
                <item.icon className="absolute -bottom-8 -right-8 w-32 h-32 text-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Secondary Tools and Support Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {secondaryActions.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-between p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 group"
              >
                <div className="flex items-center gap-5 text-left">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg tracking-tight">{item.title}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.desc}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-gray-900 rounded-[3rem] p-10 text-white flex flex-col justify-between gap-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 opacity-[0.03] rounded-full -mr-32 -mt-32 blur-3xl group-hover:opacity-10 transition-opacity duration-1000" />
            
            <div className="relative z-10 flex items-start gap-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl">
                <MessageCircle className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">{t('user.dashboard.support.title')}</h2>
                <p className="text-gray-400 text-sm font-medium leading-relaxed opacity-80">
                  {t('user.dashboard.support.desc')}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/contact')}
              className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-[2rem] shadow-2xl shadow-green-900/40 transition-all font-black text-sm uppercase tracking-[0.2em] active:scale-95 relative z-10 group/btn"
            >
              <span className="flex items-center justify-center gap-3">
                {t('user.dashboard.support.button')}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
