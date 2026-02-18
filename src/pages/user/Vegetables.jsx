import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Leaf, 
  X, 
  Clock, 
  Info, 
  Droplets, 
  Hand, 
  Apple, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sprout,
  ThermometerSun
} from 'lucide-react';
import axios from 'axios';

const Vegetables = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVeg, setSelectedVeg] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 9; // Increased limit for better grid filling

  const fetchVegetables = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      let url = `/api/vegetable?skip=${skip}&limit=${limit}`;
      
      if (activeSearch) {
        url = `/api/vegetable/search?q=${activeSearch}`;
      }

      const response = await axios.get(url);
      
      if (activeSearch) {
        setVegetables(response.data.data || []);
        setTotalCount(response.data.count || 0);
      } else {
        setVegetables(response.data.data || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching vegetables:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, limit]);

  useEffect(() => {
    fetchVegetables();
  }, [fetchVegetables]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedVeg) {
      document.body.style.overflow = 'hidden';
      setIsScrolled(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedVeg]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const openDetail = async (veg) => {
    setSelectedVeg(veg);
    setModalLoading(true);
    setNutrition([]);
    try {
      const res = await axios.get(`/api/vegetable/${veg._id}/nutrition`);
      if (res.data?.nutrition) {
        setNutrition(res.data.nutrition);
      }
    } catch (error) {
      console.error("Error fetching nutrition:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans selection:bg-emerald-100 selection:text-emerald-900">
       {/* Modern Header Section */}
       <div className="bg-white border-b border-gray-100 pb-12 pt-8 sm:pt-12 px-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Leaf className="w-64 h-64 text-emerald-900 rotate-12" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                <Sprout className="w-4 h-4" />
                <span>{t('vegetablesPage.smartAgricultureDatabase')}</span>
             </div>
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
                {t('nav.vegetables')}
             </h1>
             <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg mb-8">
                {t('home.features.vegetables.desc')}
             </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
               <div className="relative flex items-center">
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={t('vegetablesPage.searchPlaceholder')}
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                  />
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <button
                     type="submit"
                     className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-200"
                  >
                     {t('vegetablesPage.searchButton')}
                  </button>
               </div>
            </form>

            {activeSearch && (
               <div className="mt-4 flex justify-center items-center gap-2 animate-fade-in">
                  <span className="text-sm text-slate-500">{t('vegetablesPage.searchResults')} <span className="font-bold text-emerald-700">"{activeSearch}"</span></span>
                  <button onClick={() => { setSearchTerm(''); setActiveSearch(''); setPage(1); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                     <X className="w-4 h-4" />
                  </button>
               </div>
            )}
          </div>
       </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-96 animate-pulse">
                <div className="w-full h-48 bg-slate-100 rounded-2xl mb-4" />
                <div className="h-6 w-3/4 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : vegetables.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Leaf className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-700 mb-1">{t('vegetablesPage.noData')}</h3>
             <p className="text-slate-500">{t('vegetablesPage.tryAgain')}</p>
          </div>
        ) : (
          /* Vegetable Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-12">
            {vegetables.map((veg, index) => (
              <div
                key={veg._id || index}
                onClick={() => openDetail(veg)}
                className="group bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 border border-slate-100 hover:border-emerald-100 transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-emerald-50">
                  <img
                    src={veg.image_path ? `${import.meta.env.VITE_API_URL}/${veg.image_path}` : 'https://placehold.co/600x400?text=No+Image'}
                    alt={veg.thai_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=No+Image'}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-sm flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {t('vegetablesPage.growth', { days: veg.growth || '?' })}
                  </div>
                </div>

                <div className="px-2 pb-2 flex-grow flex flex-col select-none">
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {veg.thai_name}
                  </h3>
                  <p className="text-sm font-medium text-slate-400 mb-4">{veg.eng_name || '-'}</p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                     <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">{t('vegetablesPage.readMore')}</span>
                     <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > limit && (activeSearch === '') && (
           <div className="flex justify-center items-center gap-3">
              <button
                 onClick={() => {setPage(p => Math.max(1, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'});}}
                 disabled={page === 1}
                 className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                 <ChevronLeft className="w-5 h-5" />
              </button>

               <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                  {t('vegetablesPage.page', { page, totalPages })}
               </div>

              <button
                 onClick={() => {setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 0, behavior: 'smooth'});}}
                 disabled={page === totalPages}
                 className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                 <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        )}
      </div>

      {/* Modal - Recipe/Profile Card Style */}
      {selectedVeg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedVeg(null)} />

          <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVeg(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white md:text-slate-500 md:bg-slate-100 md:hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Image & Quick Stats */}
            <div className={`w-full md:w-5/12 bg-emerald-900 relative flex flex-col transition-all duration-300 ease-out ${isScrolled ? 'basis-24 min-h-[6rem]' : 'basis-64 min-h-[16rem]'} md:basis-auto md:min-h-0`}>
               <div className={`relative w-full h-full transition-all duration-300 ${isScrolled ? 'opacity-90' : 'opacity-100'}`}>
                  <img
                     src={selectedVeg.image_path ? `${import.meta.env.VITE_API_URL}/${selectedVeg.image_path}` : 'https://placehold.co/600x400?text=No+Image'}
                     className={`w-full h-full object-cover opacity-80 transition-all duration-300 ${isScrolled ? 'scale-105' : 'scale-100'}`}
                     alt={selectedVeg.thai_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-b from-emerald-950/95 via-transparent to-transparent md:from-transparent md:to-emerald-950/90" />

                  <div className={`absolute bottom-0 left-0 p-6 md:top-0 md:left-0 text-white w-full transition-all duration-300 md:transform-none ${isScrolled ? 'translate-y-2' : 'translate-y-0'}`}>
                     <h2 className={`font-extrabold mb-1 drop-shadow-md transition-all duration-300 origin-left ${isScrolled ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>
                        {selectedVeg.thai_name}
                     </h2>
                     <div className={`transition-all duration-300 origin-top overflow-hidden ${isScrolled ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                        <p className="text-white/90 font-medium text-lg drop-shadow-md mb-4">{selectedVeg.eng_name}</p>

                        <div className="flex flex-wrap gap-2">
                           <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-emerald-300" />
                              {t('vegetablesPage.growth', { days: selectedVeg.growth })}
                           </div>
                           <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold flex items-center gap-2">
                              <ThermometerSun className="w-3.5 h-3.5 text-yellow-300" />
                              {t('vegetablesPage.sunLoving')}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Desktop Gallery (Bottom Left) */}
                  {selectedVeg.image_paths && selectedVeg.image_paths.length > 1 && (
                     <div className="hidden md:block absolute bottom-0 left-0 w-full p-6 z-10">
                        <p className="text-emerald-200 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                           <Sparkles className="w-3 h-3" /> {t('vegetablesPage.moreImages')}
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                           {selectedVeg.image_paths.slice(1).map((path, index) => (
                              <div
                                 key={index}
                                 className="aspect-square rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:border-white transition-colors bg-black/20"
                                 onClick={() => setSelectedImage(path)}
                              >
                                 <img
                                    src={`${import.meta.env.VITE_API_URL}/${path}`}
                                    alt={`Gallery ${index}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
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
               <div className="p-6 md:p-10 space-y-8">
                  {/* Details Info */}
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                           <Info className="w-5 h-5" />
                        </div>
                         <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-2">{t('vegetablesPage.details')}</h3>
                           <div className="text-slate-600 text-sm leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: i18n.language === 'en' ? (selectedVeg.details_en || selectedVeg.details) : selectedVeg.details || t('vegetablesPage.noDataDetails') }} />
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                           <Hand className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-2">{t('vegetablesPage.planting')}</h3>
                           <div className="text-slate-600 text-sm leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: i18n.language === 'en' ? (selectedVeg.planting_method_en || selectedVeg.planting_method) : selectedVeg.planting_method || t('vegetablesPage.noDataDetails') }} />
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                           <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-2">{t('vegetablesPage.care')}</h3>
                           <div className="text-slate-600 text-sm leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: i18n.language === 'en' ? (selectedVeg.care_en || selectedVeg.care) : selectedVeg.care || t('vegetablesPage.noDataDetails') }} />
                        </div>
                     </div>
                  </div>

                  {/* Nutrition */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                     <div className="flex items-center gap-2 mb-4">
                        <Apple className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-slate-800">{t('vegetablesPage.nutrition')}</h3>
                     </div>

                     {modalLoading ? (
                        <div className="space-y-2 animate-pulse">
                           <div className="h-4 bg-slate-200 rounded w-full" />
                           <div className="h-4 bg-slate-200 rounded w-2/3" />
                        </div>
                     ) : nutrition.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                           {nutrition.map((n, i) => (
                              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                                 <span className="text-xs text-slate-400 font-bold uppercase">{n.nutrient_name || n.nutrition_name}</span>
                                 <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-lg font-black text-emerald-600">{n.nutrition_qty || n.amount}</span>
                                    <span className="text-xs text-slate-500">{n.unit}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm text-slate-400 italic">{t('vegetablesPage.noNutrition')}</p>
                     )}
                  </div>

                  {/* Gallery Section - Mobile Only */}
                  {selectedVeg.image_paths && selectedVeg.image_paths.length > 1 && (
                     <div className="space-y-4 md:hidden">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           <Sparkles className="w-5 h-5 text-yellow-500" />
                           {t('vegetablesPage.moreImages')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                           {selectedVeg.image_paths.slice(1).map((path, index) => (
                              <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-100 group relative cursor-pointer" onClick={() => setSelectedImage(path)}>
                                 <img
                                    src={`${import.meta.env.VITE_API_URL}/${path}`}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                 />
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button
             className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
             onClick={() => setSelectedImage(null)}
          >
             <X className="w-6 h-6" />
          </button>
          <img
             src={`${import.meta.env.VITE_API_URL}/${selectedImage}`}
             alt="Full size"
             className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Vegetables;

