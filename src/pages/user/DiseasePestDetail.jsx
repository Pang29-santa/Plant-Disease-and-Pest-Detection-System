
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, AlertTriangle, Shield, Thermometer, Info, Sparkles, LayoutGrid, X, Bug, Activity, Droplets, Skull } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DiseasePestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleBack = () => {
        if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
            navigate(-1);
        } else {
            if (item?.type === '1') {
                navigate('/diseases');
            } else if (item?.type === '2') {
                navigate('/pests');
            } else {
                navigate('/');
            }
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/diseases-pest/${id}`);
                if (res.data) {
                    setItem(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-[6px] border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Details...</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">{t('detailPage.noData')}</h1>
                <p className="text-gray-500 mb-8 max-w-sm font-medium">{t('detailPage.noDataDesc')}</p>
                <button 
                    onClick={handleBack}
                    className="group flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 font-bold"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {t('detailPage.back')}
                </button>
            </div>
        );
    }

    const isDisease = item.type === '1';
    // Dynamic styles based on type
    const bgGradient = isDisease ? 'bg-red-950' : 'bg-orange-950';
    const bgGradientFrom = isDisease ? 'from-red-950/95' : 'from-orange-950/95';
    const bgGradientTo = isDisease ? 'to-red-950/90' : 'to-orange-950/90';
    const accentText = isDisease ? 'text-red-400' : 'text-orange-400';
    const accentTextDark = isDisease ? 'text-red-600' : 'text-orange-600';
    const accentBg = isDisease ? 'bg-red-50' : 'bg-orange-50';
    const shadowColor = isDisease ? 'shadow-red-100' : 'shadow-orange-100';

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 md:p-8">
            {/* Main Card adapting Modal Layout */}
            <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                
                {/* Back Button (Floating) */}
                <button
                    onClick={handleBack}
                    className="absolute top-6 right-6 z-50 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white md:text-gray-500 md:bg-gray-100 md:hover:bg-gray-200 transition-all active:scale-95 shadow-lg group"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Left: Image & Quick Stats */}
                <div className={`w-full md:w-5/12 ${bgGradient} relative flex flex-col transition-all duration-500 ease-out ${isScrolled ? 'basis-24 min-h-[6rem]' : 'basis-64 min-h-[16rem]'} md:basis-auto md:min-h-0 shadow-2xl z-10`}>
                   <div className={`relative w-full h-full transition-all duration-500 ${isScrolled ? 'opacity-90' : 'opacity-100'}`}>
                      <img
                         src={item.image_path ? `${import.meta.env.VITE_API_URL}/${item.image_path}` : 'https://placehold.co/800x600?text=No+Image'}
                         className={`w-full h-full object-cover opacity-80 transition-all duration-700 ${isScrolled ? 'scale-110 blur-sm' : 'scale-100'}`}
                         alt={item.thai_name}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-b ${bgGradientFrom} via-transparent to-transparent md:from-transparent md:${bgGradientTo}`} />

                      <div className={`absolute bottom-0 left-0 p-8 md:p-12 md:top-0 md:left-0 text-white w-full transition-all duration-500 md:transform-none ${isScrolled ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                         <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-lg border border-white/10">
                            <Activity className={`w-4 h-4 ${accentText} animate-pulse`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.severity || t('detectPage.severity.medium')} Danger</span>
                         </div>
                         <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-2xl tracking-tighter leading-none">
                            {item.thai_name}
                         </h2>
                         <p className="text-white/60 font-black text-xl md:text-2xl drop-shadow-md uppercase tracking-widest">{item.eng_name}</p>
                      </div>

                      {/* Desktop Gallery (Bottom Left) */}
                      {item.image_paths && item.image_paths.length > 1 && (
                         <div className={`hidden md:block absolute bottom-0 left-0 w-full p-10 z-10 transition-all duration-500 ${isScrolled ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                            <p className={`${isDisease ? 'text-red-200' : 'text-orange-200'} text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2`}>
                               <Sparkles className="w-3.5 h-3.5" /> {t('vegetablesPage.moreImages')}
                            </p>
                            <div className="grid grid-cols-4 gap-3">
                               {item.image_paths.slice(1).map((path, index) => (
                                  <div
                                     key={index}
                                     className="aspect-square rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer hover:border-white transition-all bg-black/20 group/thumb"
                                     onClick={() => setSelectedImage(path)}
                                  >
                                     <img
                                        src={`${import.meta.env.VITE_API_URL}/${path}`}
                                        alt={`Gallery ${index}`}
                                        className="w-full h-full object-cover group-hover/thumb:scale-125 transition-transform duration-700"
                                     />
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                </div>

                {/* Right: Content */}
                <div
                   className="w-full md:w-7/12 bg-white flex-1 md:h-full overflow-y-auto custom-scrollbar flex flex-col"
                   onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 50)}
                >
                   <div className="p-8 md:p-16 space-y-12">
                      {/* Detailed Info */}
                      <div className="space-y-12">
                         <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-5 mb-6">
                               <div className={`w-14 h-14 rounded-2xl ${accentBg} ${accentTextDark} flex items-center justify-center shrink-0 shadow-lg ${shadowColor}`}>
                                  <Info className="w-7 h-7" />
                               </div>
                               <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.description')}</h3>
                            </div>
                            <div 
                                className="text-gray-600 text-lg leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                dangerouslySetInnerHTML={{ __html: item.description || t('vegetablesPage.noDataDetails') }} 
                            />
                         </section>

                         <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-5 mb-6">
                               <div className={`w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-100`}>
                                   {isDisease ? <Thermometer className="w-7 h-7" /> : <Bug className="w-7 h-7" />}
                               </div>
                               <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.cause')}</h3>
                            </div>
                            <div 
                                className="text-gray-600 text-lg leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                dangerouslySetInnerHTML={{ __html: item.cause || t('vegetablesPage.noDataDetails') }} 
                            />
                         </section>

                         <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex items-center gap-5 mb-6">
                               <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-100">
                                  <Shield className="w-7 h-7" />
                               </div>
                               <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.treatment')}</h3>
                            </div>
                            <div 
                                className="text-gray-600 text-lg leading-relaxed prose prose-emerald max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                dangerouslySetInnerHTML={{ __html: item.treatment || t('vegetablesPage.noDataDetails') }} 
                            />
                         </section>

                         <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex items-center gap-5 mb-6">
                               <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-100">
                                  <Droplets className="w-7 h-7" />
                               </div>
                               <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.prevention')}</h3>
                            </div>
                            <div 
                                className="text-gray-600 text-lg leading-relaxed prose prose-sky max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                dangerouslySetInnerHTML={{ __html: item.prevention || t('vegetablesPage.noDataDetails') }} 
                            />
                         </section>
                      </div>

                      {/* Gallery Section - Mobile Only */}
                      {item.image_paths && item.image_paths.length > 1 && (
                         <div className="space-y-6 md:hidden border-t border-gray-100 pt-10">
                            <h3 className="font-black text-gray-800 text-xl flex items-center gap-3">
                               <LayoutGrid className="w-6 h-6 text-purple-500" />
                               {t('detailPage.gallery')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                               {item.image_paths.slice(1).map((path, index) => (
                                  <div key={index} className="aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 group relative active:scale-95 transition-transform" onClick={() => setSelectedImage(path)}>
                                     <img
                                        src={`${import.meta.env.VITE_API_URL}/${path}`}
                                        alt={`Gallery ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                     />
                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
            </div>

            {/* Image Popup Modal */}
            {selectedImage && (
              <div 
                className="fixed inset-0 z-[150] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
                onClick={() => setSelectedImage(null)}
              >
                <button 
                  className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all active:scale-95"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-6 h-6" />
                </button>
                <img 
                  src={`${import.meta.env.VITE_API_URL}/${selectedImage}`}
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                  alt="Gallery Full size"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 20px;
              border: 2px solid transparent;
              background-clip: content-box;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #cbd5e1;
              background-clip: content-box;
            }
          `}</style>
        </div>
    );
};

export default DiseasePestDetail;
