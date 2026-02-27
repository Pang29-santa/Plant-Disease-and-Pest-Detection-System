import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Swal from 'sweetalert2';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  Camera, 
  ShieldAlert, 
  LayoutGrid, 
  History, 
  BookOpen, 
  MessageCircle,
  Send,
  Settings,
  Sprout,
  Bug,
  Activity,
  Map,
  Library
} from 'lucide-react';
import logo from '../static/img/logo.png';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language === 'th';
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const profileRef = useRef(null);
  const knowledgeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (knowledgeRef.current && !knowledgeRef.current.contains(event.target)) {
        setIsKnowledgeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    Swal.fire({
      title: t('auth.register.logoutConfirmTitle') || 'ยืนยันการออกจากระบบ?',
      text: t('auth.register.logoutConfirmText') || 'คุณต้องการออกจากระบบหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('auth.register.logoutConfirmButton') || 'ออกจากระบบ',
      cancelButtonText: t('common.cancel') || 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  // Re-order links as requested
  const mainLinks = [
    { to: '/cctv', label: t('nav.cctv'), icon: BookOpen, authRequired: true },
    { to: '/detect', label: t('nav.detect'), icon: Camera },
    { to: '/detect/plots', label: isThai ? 'วิเคราะห์ตามแปลง' : 'Plot Analysis', icon: Sprout, authRequired: true },
    { to: '/plots', label: t('nav.plots'), icon: Map, authRequired: true },
    { to: '/history', label: t('nav.history'), icon: History, authRequired: true },
  ];

  const knowledgeLinks = [
    { to: '/vegetables', label: t('nav.vegetables'), icon: Sprout },
    { to: '/diseases', label: t('nav.diseases'), icon: Activity },
    { to: '/pests', label: t('nav.pests'), icon: Bug },
  ];

  const isActive = (path) => location.pathname === path;
  const isKnowledgeActive = knowledgeLinks.some(link => isActive(link.to));

  return (
    <nav className="sticky top-0 w-full bg-white shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* 1. System Branding (Far Left) - Responsive width */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-100 transition-all duration-300 shrink-0">
              <img src={logo} alt="Logo" className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" />
            </div>
            <div className="leading-tight block">
              <h1 className="text-[10px] font-black text-primary-700 uppercase tracking-[0.2em] whitespace-nowrap">
                {t('nav.branding.top')}
              </h1>
              <h1 className="text-xs sm:text-sm xl:text-base font-black text-gray-800 uppercase tracking-tight group-hover:text-primary-600 transition-colors whitespace-nowrap">
                {t('nav.branding.bottom')}
              </h1>
            </div>
          </Link>

          {/* 2. Navigation Links (Centered) */}
          <div className="hidden xl:flex items-center justify-center">
            <div className="flex items-center p-1 bg-gray-50/50 rounded-2xl border border-gray-100 backdrop-blur-sm">
              {!isAuthenticated ? (
                /* Public User Navigation - Simplified */
                <>
                  {[
                    { to: '/detect', label: t('nav.detect'), icon: Camera },
                    { to: '/vegetables', label: t('nav.vegetables'), icon: Sprout },
                    { to: '/diseases', label: t('nav.diseases'), icon: Activity },
                    { to: '/pests', label: t('nav.pests'), icon: Bug },
                  ].map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                          active
                            ? 'text-primary-700 bg-white shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-primary-600 hover:bg-white/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-primary-600' : 'opacity-40'}`} />
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              ) : (
                /* Authenticated User Navigation - Full Menu */
                <>
                  {mainLinks.map((link) => {
                    if (link.authRequired && !isAuthenticated) return null;
                    
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-2 px-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                          active
                            ? 'text-primary-700 bg-white shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-primary-600 hover:bg-white/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-primary-600' : 'opacity-40'}`} />
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Knowledge Dropdown (Desktop) */}
                  <div className="relative" ref={knowledgeRef}>
                    <button
                      onMouseEnter={() => setIsKnowledgeOpen(true)}
                      onClick={() => setIsKnowledgeOpen(!isKnowledgeOpen)}
                      className={`flex items-center gap-2 px-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                        isKnowledgeOpen || isKnowledgeActive
                          ? 'text-primary-700 bg-white shadow-sm ring-1 ring-black/5'
                          : 'text-gray-500 hover:text-primary-600 hover:bg-white/50'
                      }`}
                    >
                      <Library className={`w-4 h-4 transition-colors ${isKnowledgeOpen || isKnowledgeActive ? 'text-primary-600' : 'opacity-40'}`} />
                      {t('nav.knowledge')}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isKnowledgeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isKnowledgeOpen && (
                      <div 
                        className="absolute top-full left-0 mt-3 w-56 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl py-2.5 animate-in fade-in slide-in-from-top-2 duration-300 z-50"
                        onMouseLeave={() => setIsKnowledgeOpen(false)}
                      >
                        <div className="px-4 py-2 mb-1 border-b border-gray-50">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('nav.knowledge')}</p>
                        </div>
                        {knowledgeLinks.map((link) => {
                          const Icon = link.icon;
                          const active = isActive(link.to);
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setIsKnowledgeOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all ${
                                active
                                  ? 'text-primary-700 bg-primary-50 mx-2 rounded-xl'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600 mx-2 rounded-xl'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg ${active ? 'bg-white text-primary-600 shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                                 <Icon className="w-4 h-4" />
                              </div>
                              {link.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Contact Admin Link (Desktop) */}
                  <Link
                    to="/contact"
                    className={`flex items-center gap-2 px-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                      isActive('/contact') 
                        ? 'text-primary-700 bg-white shadow-sm ring-1 ring-black/5' 
                        : 'text-gray-500 hover:text-primary-600 hover:bg-white/50'
                    }`}
                  >
                    <MessageCircle className={`w-4 h-4 transition-colors ${isActive('/contact') ? 'text-primary-600' : 'opacity-40'}`} />
                    {t('nav.contact')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 3. Right Side (Fixed width for balance, but allow expansion) */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
            
            {/* TH/EN Switch - Move to menu on ultra small screens */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <div className="h-6 w-px bg-gray-100 hidden md:block"></div>

            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pl-3 pr-4 rounded-full border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                    {user?.image_path ? (
                      <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-black text-gray-700 group-hover:text-primary-700 hidden xl:block">
                    {user?.fullname || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('nav.menu.manageAccount')}</p>
                       <p className="text-sm font-black text-gray-800 truncate">{user?.fullname}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-primary-500" />
                      {t('nav.profile')}
                    </Link>
                    <Link to="/telegram" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      <Send className="w-4 h-4 text-blue-500" />
                      {t('nav.telegram')}
                    </Link>
                    <Link to="/contact" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4 text-purple-500" />
                      {t('nav.contact')}
                    </Link>
                    
                    <div className="h-px bg-gray-100 my-2 mx-4" />
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-black text-gray-600 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-black bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`xl:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div className={`xl:hidden fixed top-0 right-0 h-full w-[280px] bg-white z-50 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-tighter">{t('nav.branding.top')}</p>
                <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{t('nav.branding.bottom')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-xl transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* User Profile in Mobile Menu */}
            {isAuthenticated && (
              <div className="px-4 py-6 border-b border-gray-50 bg-gradient-to-br from-primary-50/30 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden border border-white">
                    {user?.image_path ? (
                      <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-primary-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 truncate">{user?.fullname}</p>
                    <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{user?.role || 'User'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 space-y-6">
              {!isAuthenticated ? (
                /* Public Mobile Menu */
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">{t('nav.menu.main')}</p>
                  <div className="space-y-1">
                    {[
                      { to: '/detect', label: t('nav.detect'), icon: Camera },
                      { to: '/vegetables', label: t('nav.vegetables'), icon: Sprout },
                      { to: '/diseases', label: t('nav.diseases'), icon: Activity },
                      { to: '/pests', label: t('nav.pests'), icon: Bug },
                    ].map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            isActive(link.to) 
                              ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${isActive(link.to) ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Authenticated Mobile Menu */
                <>
                  {/* Main Links */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">{t('nav.menu.main')}</p>
                    <div className="space-y-1">
                      {mainLinks.map((link) => {
                        if (link.authRequired && !isAuthenticated) return null;
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                              isActive(link.to) 
                                ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg ${isActive(link.to) ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Knowledge Links */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">{t('nav.knowledge')}</p>
                    <div className="space-y-1">
                      {knowledgeLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                              isActive(link.to) 
                                ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg ${isActive(link.to) ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Admin (Mobile) */}
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive('/contact') 
                        ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive('/contact') ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    {t('nav.contact')}
                  </Link>
                </>
              )}

              {/* Settings & Account */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">{t('nav.menu.settings')}</p>
                <div className="space-y-1">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    {t('nav.profile')}
                  </Link>
                  <div className="px-4 py-3 flex items-center justify-between bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold text-gray-600">{t('nav.menu.language')} (Language)</span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-white transition-all"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
