import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Bug, 
  ChevronRight, 
  AlertCircle, 
  Skull, 
  Info, 
  X, 
  Sparkles, 
  Activity,
  Shield,
  Droplets,
  LayoutGrid
} from 'lucide-react';
import axios from 'axios';

const Pests = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPest, setSelectedPest] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchPests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/diseases-pest/pests');
        setPests(response.data);
      } catch (error) {
        console.error('Error fetching pests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPests();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPest) {
      document.body.style.overflow = 'hidden';
      setIsScrolled(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPest]);

  const openDetail = async (id) => {
    setModalLoading(true);
    try {
      const res = await axios.get(`/api/diseases-pest/${id}`);
      if (res.data) {
        setSelectedPest(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredPests = pests.filter(p =>
    p.thai_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.eng_name && p.eng_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 selection:bg-orange-100 selection:text-orange-900">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Bug className="w-64 h-64 text-orange-900 rotate-12" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <Bug className="w-4 h-4" />
            <span>Pest Control Unit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {t('nav.pests')}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg mb-10 font-medium leading-relaxed">
            {t('pestsPage.subtitle')}
          </p>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-orange-100 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('pestsPage.searchPlaceholder')}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] 
                         focus:outline-none focus:bg-white focus:border-orange-500 
                         transition-all shadow-sm text-gray-700 font-bold placeholder:text-gray-300"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 h-[28rem] animate-pulse">
                <div className="w-full h-52 bg-gray-50 rounded-[2rem] mb-6" />
                <div className="h-6 w-3/4 bg-gray-50 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-50 rounded w-full" />
                  <div className="h-4 bg-gray-50 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Bug className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('pestsPage.noResults')}</h3>
            <button 
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-colors"
            >
              แสดงทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPests.map((pest) => (
              <div
                key={pest._id}
                onClick={() => openDetail(pest._id)}
                className="group bg-white rounded-[2.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 border border-gray-100 hover:border-orange-100 transition-all duration-500 cursor-pointer flex flex-col hover:-translate-y-2 active:scale-95"
              >
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 bg-orange-50">
                  <img
                    src={pest.image_path ? `${import.meta.env.VITE_API_URL}/${pest.image_path}` : 'https://placehold.co/600x400?text=No+Image'}
                    alt={pest.thai_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=No+Image'}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-orange-600 shadow-sm flex items-center gap-1.5 uppercase tracking-widest border border-orange-100/50">
                    <Activity className="w-3 h-3 text-orange-500 animate-pulse" />
                    {pest.severity || t('detectPage.severity.medium')}
                  </div>
                </div>

                <div className="px-5 pb-5 flex-grow">
                  <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                    {pest.thai_name}
                  </h3>
                  <p className="text-sm font-bold text-gray-300 mb-6 uppercase tracking-wider">{pest.eng_name || '-'}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-gray-300 tracking-widest">{t('pestsPage.description')}</span>
                        <p className="text-sm text-gray-600 line-clamp-2 font-bold leading-relaxed">{pest.description?.replace(/<[^>]*>?/gm, '') || t('vegetablesPage.noDataDetails')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between group-hover:border-orange-50 transition-colors">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-orange-600 transition-colors">
                      {t('diseasesPage.viewDetail')}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedPest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedPest(null)} />

          <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPest(null)}
              className="absolute top-6 right-6 z-50 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white md:text-gray-500 md:bg-gray-100 md:hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left: Image & Quick Stats */}
            <div className={`w-full md:w-5/12 bg-orange-950 relative flex flex-col transition-all duration-500 ease-out ${isScrolled ? 'basis-24 min-h-[6rem]' : 'basis-64 min-h-[16rem]'} md:basis-auto md:min-h-0 shadow-2xl z-10`}>
               <div className={`relative w-full h-full transition-all duration-500 ${isScrolled ? 'opacity-90' : 'opacity-100'}`}>
                  <img
                     src={selectedPest.image_path ? `${import.meta.env.VITE_API_URL}/${selectedPest.image_path}` : 'https://placehold.co/800x600?text=No+Image'}
                     className={`w-full h-full object-cover opacity-80 transition-all duration-700 ${isScrolled ? 'scale-110 blur-sm' : 'scale-100'}`}
                     alt={selectedPest.thai_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-b from-orange-950/95 via-transparent to-transparent md:from-transparent md:to-orange-950/90" />

                  <div className={`absolute bottom-0 left-0 p-8 md:p-12 md:top-0 md:left-0 text-white w-full transition-all duration-500 md:transform-none ${isScrolled ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                     <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-lg border border-white/10">
                        <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedPest.severity || t('detectPage.severity.medium')} Danger</span>
                     </div>
                     <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-2xl tracking-tighter leading-none">
                        {selectedPest.thai_name}
                     </h2>
                     <p className="text-white/60 font-black text-xl md:text-2xl drop-shadow-md uppercase tracking-widest">{selectedPest.eng_name}</p>
                  </div>

                  {/* Desktop Gallery (Bottom Left) */}
                  {selectedPest.image_paths && selectedPest.image_paths.length > 1 && (
                     <div className={`hidden md:block absolute bottom-0 left-0 w-full p-10 z-10 transition-all duration-500 ${isScrolled ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                        <p className="text-orange-200 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                           <Sparkles className="w-3.5 h-3.5" /> {t('vegetablesPage.moreImages')}
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                           {selectedPest.image_paths.slice(1).map((path, index) => (
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
                           <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-100">
                              <Info className="w-7 h-7" />
                           </div>
                           <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.description')}</h3>
                        </div>
                        <div className="text-gray-600 text-lg leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: selectedPest.description || t('vegetablesPage.noDataDetails') }} />
                     </section>

                     <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-5 mb-6">
                           <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-100">
                              <Skull className="w-7 h-7" />
                           </div>
                           <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.cause')}</h3>
                        </div>
                        <div className="text-gray-600 text-lg leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: selectedPest.cause || t('vegetablesPage.noDataDetails') }} />
                     </section>

                     <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-5 mb-6">
                           <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-100">
                              <Shield className="w-7 h-7" />
                           </div>
                           <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.treatment')}</h3>
                        </div>
                        <div className="text-gray-600 text-lg leading-relaxed prose prose-emerald max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: selectedPest.treatment || t('vegetablesPage.noDataDetails') }} />
                     </section>

                     <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-5 mb-6">
                           <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-100">
                              <Droplets className="w-7 h-7" />
                           </div>
                           <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.prevention')}</h3>
                        </div>
                        <div className="text-gray-600 text-lg leading-relaxed prose prose-sky max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: selectedPest.prevention || t('vegetablesPage.noDataDetails') }} />
                     </section>
                  </div>

                  {/* Gallery Section - Mobile Only */}
                  {selectedPest.image_paths && selectedPest.image_paths.length > 1 && (
                     <div className="space-y-6 md:hidden border-t border-gray-100 pt-10">
                        <h3 className="font-black text-gray-800 text-xl flex items-center gap-3">
                           <LayoutGrid className="w-6 h-6 text-purple-500" />
                           {t('detailPage.gallery')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           {selectedPest.image_paths.slice(1).map((path, index) => (
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
        </div>
      )}

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button
             className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
             onClick={() => setSelectedImage(null)}
          >
             <X className="w-6 h-6" />
          </button>
          <img
             src={`${import.meta.env.VITE_API_URL}/${selectedImage}`}
             alt="Full size"
             className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
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

export default Pests;
