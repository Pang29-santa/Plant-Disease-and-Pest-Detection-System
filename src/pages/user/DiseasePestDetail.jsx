import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, AlertTriangle, Shield, Thermometer, Info, Sparkles, LayoutGrid, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DiseasePestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

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
    const typeLabel = isDisease ? t('detailPage.disease') : t('detailPage.pest');
    const typeColor = isDisease ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600';
    const accentColor = isDisease ? 'red' : 'orange';

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Action Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 mb-8">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm group"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                    {t('detailPage.back')}
                </button>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${typeColor} shadow-sm border border-current/10`}>
                    {typeLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto px-4">
                {/* Main Content Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    {/* Header with Hero Image */}
                    <div className="relative h-[25rem] md:h-[35rem] group">
                        <img 
                            src={item.image_path ? `${import.meta.env.VITE_API_URL}/${item.image_path}` : 'https://placehold.co/1200x800?text=No+Hero+Image'} 
                            alt={item.thai_name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
                        <div className="absolute bottom-10 left-8 right-8 md:left-12 md:right-12">
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                                {item.thai_name}
                            </h1>
                            <div className="flex items-center gap-3">
                              <p className="text-lg md:text-2xl text-white/80 font-bold uppercase tracking-widest leading-none">
                                  {item.eng_name}
                              </p>
                              {item.severity && (
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                                  {item.severity}
                                </span>
                              )}
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="p-8 md:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                          {/* Sidebar Info */}
                          <div className="lg:col-span-4 space-y-10">
                            <div className={`p-8 rounded-[2rem] bg-${accentColor}-50 border border-${accentColor}-100 relative overflow-hidden group`}>
                              <div className={`absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-500`}>
                                {isDisease ? <Thermometer className="w-20 h-20" /> : <Bug className="w-20 h-20" />}
                              </div>
                              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('detailPage.cause')}</h3>
                              <div 
                                  className="text-gray-700 font-bold text-lg leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: item.cause || t('vegetablesPage.noDataDetails') }}
                              />
                            </div>

                            <div className="p-8 rounded-[2rem] bg-green-50/50 border border-green-100 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                                <Shield className="w-20 h-20 text-green-600" />
                              </div>
                              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('detailPage.prevention')}</h3>
                              <div 
                                  className="text-gray-700 font-medium text-base leading-relaxed prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: item.prevention || t('vegetablesPage.noDataDetails') }}
                              />
                            </div>
                          </div>

                          {/* Main Sections */}
                          <div className="lg:col-span-8 space-y-16">
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-sky-50 rounded-2xl text-sky-600 flex items-center justify-center shadow-sm">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('detailPage.symptoms')}</h2>
                                </div>
                                <div 
                                    className="text-gray-600 leading-relaxed text-lg prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: item.description || t('vegetablesPage.noDataDetails') }}
                                />
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl text-green-600 flex items-center justify-center shadow-sm">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('detailPage.treatment')}</h2>
                                </div>
                                <div 
                                    className="text-gray-600 leading-relaxed text-lg prose prose-emerald max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: item.treatment || t('vegetablesPage.noDataDetails') }}
                                />
                            </section>

                            {/* Gallery Section */}
                            {item.image_paths && item.image_paths.length > 1 && (
                                <section className="pt-8 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-8">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl text-purple-600 flex items-center justify-center shadow-sm">
                                            <LayoutGrid className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('detailPage.gallery')}</h2>
                                      </div>
                                      <span className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                                        {item.image_paths.length - 1} {t('vegetablesPage.moreImages')}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {item.image_paths.slice(1).map((path, idx) => (
                                            <div 
                                              key={idx} 
                                              onClick={() => setSelectedImage(path)}
                                              className="aspect-square rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-50"
                                            >
                                                <img 
                                                    src={`${import.meta.env.VITE_API_URL}/${path}`} 
                                                    alt={`Gallery ${idx}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                  <Sparkles className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                          </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
              <div 
                className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
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
        </div>
    );
};

export default DiseasePestDetail;
