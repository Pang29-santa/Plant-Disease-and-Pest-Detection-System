import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Scan, 
  Leaf, 
  Bug, 
  Sprout,
  ArrowRight,
  Shield,
  Camera,
  Droplets,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import cctvImg from '../static/img/cctv.png';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Scan,
      title: t('home.features.detect.title'),
      description: t('home.features.detect.desc'),
      link: '/detect',
      color: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-200',
    },
    {
      icon: Leaf,
      title: t('home.features.vegetables.title'),
      description: t('home.features.vegetables.desc'),
      link: '/vegetables',
      color: 'from-green-500 to-emerald-400',
      shadow: 'shadow-green-200',
    },
    {
      icon: Shield,
      title: t('home.features.diseases.title'),
      description: t('home.features.diseases.desc'),
      link: '/diseases',
      color: 'from-orange-500 to-yellow-400',
      shadow: 'shadow-orange-200',
    },
    {
      icon: Bug,
      title: t('home.features.pests.title'),
      description: t('home.features.pests.desc'),
      link: '/pests',
      color: 'from-red-500 to-pink-400',
      shadow: 'shadow-red-200',
    },
  ];

  const techFeatures = [
    {
      icon: Camera,
      title: t('home.tech.camera.title'),
      description: t('home.tech.camera.desc'),
    },
    {
      icon: Scan,
      title: t('home.tech.ai.title'),
      description: t('home.tech.ai.desc'),
    },
    {
      icon: Droplets,
      title: t('home.tech.water.title'),
      description: t('home.tech.water.desc'),
    },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background"
            className="w-full h-full object-cover animate-subtle-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-primary-900/80 to-black/90" />
          
          {/* Animated Decorative Blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8 animate-bounce">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{t('home.heroBadge')}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            {t('app.title')}
          </h1>
          
          <p className="text-lg md:text-xl text-primary-50 font-medium mb-4 tracking-wide">
            {t('app.subtitle')}
          </p>

          <p className="text-base md:text-lg text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed px-4 opacity-90">
            {t('home.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
            {isAuthenticated ? (
              <Link
                to="/detect"
                className="w-full sm:w-auto px-10 py-4 bg-primary-500 text-white font-black rounded-2xl hover:bg-primary-600 shadow-xl shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                {t('home.cta.getStarted')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-10 py-4 bg-white text-primary-700 font-black rounded-2xl hover:bg-primary-50 shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  {t('home.cta.login')}
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-4 bg-primary-700 text-white font-black rounded-2xl hover:bg-primary-800 shadow-xl shadow-primary-700/30 border border-primary-500 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  {t('home.cta.register')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid - Revamped Premium Design */}
      <section className="py-32 bg-white relative">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-primary-100/50">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>{t('home.featureTitle')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight">
              {t('home.featureTitle')}
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed font-medium">
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group relative flex flex-col h-full"
                >
                  <div className="relative flex-1 bg-white rounded-[32px] p-8 transition-all duration-500 border border-gray-100 hover:border-transparent hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center text-center overflow-hidden">
                    {/* Corner Accent Color */}
                    <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-700`} />
                    
                    {/* Icon Container with Glass Effect */}
                    <div className="relative mb-10">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                      <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out`}>
                        <Icon className="w-10 h-10 text-white drop-shadow-md" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-10 font-medium">
                        {feature.description}
                      </p>
                    </div>

                    {/* Action Button - Premium Style */}
                    <div className="mt-auto w-full">
                      <div className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest transition-all duration-500 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-600/30">
                        <span>{t('home.learnMore')}</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                      </div>
                    </div>

                    {/* Subtle numbering in background */}
                    <span className="absolute bottom-6 left-8 text-[80px] font-black text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 select-none">
                      0{index + 1}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Breakdown */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50" />
              
              <div className="relative glass-card rounded-[3rem] p-4 overflow-hidden shadow-2xl group">
                <img 
                  src={cctvImg} 
                  alt="Smart Garden Technology"
                  className="w-full h-auto rounded-[2.5rem] group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute top-10 right-10">
                  <div className="px-4 py-2 bg-white/90 backdrop-blur shadow-xl rounded-full text-xs font-black text-primary-600 border border-primary-100 flex items-center gap-2 animate-bounce">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                    {t('home.tech.badge')}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-secondary-400 rounded-full flex items-center justify-center shadow-2xl animate-float">
                <span className="text-white font-black text-2xl tracking-tighter">AI</span>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  {t('home.tech.title')}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('home.tech.description')}
                </p>
              </div>

              <div className="space-y-6">
                {techFeatures.map((tech, idx) => (
                  <div key={idx} className="flex gap-5 p-4 rounded-2xl hover:bg-primary-50 transition-colors group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <tech.icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-gray-900 mb-1">{tech.title}</h5>
                      <p className="text-sm text-gray-500 leading-relaxed">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


