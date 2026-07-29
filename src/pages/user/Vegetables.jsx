import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { getImageUrl } from '../../utils/urlHelper';

const Vegetables = () => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language === 'th';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVeg, setSelectedVeg] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeModalImg, setActiveModalImg] = useState(null);

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
      setActiveModalImg(selectedVeg.image_path);
    } else {
      document.body.style.overflow = 'unset';
      setActiveModalImg(null);
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
    <div className="min-h-screen bg-[#F8FAF9] font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20">
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

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-80 animate-pulse shadow-sm border border-slate-100" />
             ))}
          </div>
        ) : vegetables.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">{t('vegetablesPage.noResults')}</h3>
              <p className="text-slate-400 text-sm">{t('vegetablesPage.tryOtherKeywords')}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vegetables.map((veg) => (
              <div
                key={veg._id}
                onClick={() => openDetail(veg)}
                className="group bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border border-slate-100/80 flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-slate-100">
                  <img
                    src={getImageUrl(veg.image_path)}
                    alt={veg.thai_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=No+Image'}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-sm flex items-center gap-1">
                     <Clock className="w-3 h-3 text-emerald-600" /> {t('vegetablesPage.growth', { days: veg.growth || '?' })}
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

      {/* Detailed Modal */}
      {selectedVeg && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVeg(null)}
              className="absolute top-4 right-4 z-50 w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 backdrop-blur-md rounded-2xl transition-all shadow-md active:scale-95 group"
              title={isThai ? 'ปิด' : 'Close'}
            >
              <X className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Left: Image & Hero */}
            <div className="w-full md:w-5/12 bg-slate-950 relative flex flex-col justify-between p-6 md:p-8 shrink-0 min-h-[220px] md:min-h-full">
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={getImageUrl(activeModalImg || selectedVeg.image_path)}
                  className="w-full h-full object-cover filter brightness-90 transform hover:scale-105 transition-transform duration-700"
                  alt={selectedVeg.thai_name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Top Badges */}
              <div className="relative z-10 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('vegetablesPage.growth', { days: selectedVeg.growth })}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold shadow-sm">
                  <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('vegetablesPage.sunLoving')}</span>
                </div>
              </div>

              {/* Hero Title & Thumbnails */}
              <div className="relative z-10 mt-auto space-y-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {selectedVeg.thai_name}
                  </h2>
                  <p className="text-xs md:text-sm font-bold text-emerald-300 uppercase tracking-widest mt-1 drop-shadow-sm">
                    {selectedVeg.eng_name}
                  </p>
                </div>

                {/* Interactive Gallery Thumbnails */}
                {selectedVeg.image_paths && selectedVeg.image_paths.length > 1 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      {t('vegetablesPage.moreImages') || 'รูปภาพเพิ่มเติม'}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {selectedVeg.image_paths.map((path, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveModalImg(path)}
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            (activeModalImg || selectedVeg.image_path) === path 
                              ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/40' 
                              : 'border-white/30 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={getImageUrl(path)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Content */}
            <div className="w-full md:w-7/12 bg-white flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-6">
              {/* Details Info */}
              <section className="bg-amber-50/60 rounded-3xl p-5 md:p-6 border border-amber-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('vegetablesPage.details') || 'รายละเอียดทั่วไป'}</h3>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{isThai ? 'ข้อมูลสายพันธุ์และลักษณะพืช' : 'Crop Description'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-amber-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: i18n.language === 'en' ? (selectedVeg.details_en || selectedVeg.details) : selectedVeg.details || t('vegetablesPage.noDataDetails') }} 
                />
              </section>

              {/* Planting Method */}
              <section className="bg-emerald-50/60 rounded-3xl p-5 md:p-6 border border-emerald-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                    <Hand className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('vegetablesPage.planting') || 'วิธีและขั้นตอนการปลูก'}</h3>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">{isThai ? 'คำแนะนำการเพาะปลูก' : 'Planting Instructions'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-emerald-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: i18n.language === 'en' ? (selectedVeg.planting_method_en || selectedVeg.planting_method) : selectedVeg.planting_method || t('vegetablesPage.noDataDetails') }} 
                />
              </section>

              {/* Care & Maintenance */}
              <section className="bg-sky-50/60 rounded-3xl p-5 md:p-6 border border-sky-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('vegetablesPage.care') || 'การดูแลรักษาและให้น้ำ'}</h3>
                    <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">{isThai ? 'การดูแลและใส่ปุ๋ย' : 'Watering & Maintenance'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-sky-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: i18n.language === 'en' ? (selectedVeg.care_en || selectedVeg.care) : selectedVeg.care || t('vegetablesPage.noDataDetails') }} 
                />
              </section>

              {/* Nutrition Card */}
              <section className="bg-slate-50 rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('vegetablesPage.nutrition') || 'คุณค่าทางโภชนาการ'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isThai ? 'สารอาหารสำคัญต่อ 100g' : 'Nutritional Values per 100g'}</p>
                  </div>
                </div>

                {modalLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                ) : nutrition.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {nutrition.map((n, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{n.nutrient_name || n.nutrition_name}</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-black text-emerald-600">{n.nutrition_qty || n.amount}</span>
                          <span className="text-xs font-bold text-slate-500">{n.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">{t('vegetablesPage.noNutrition') || 'ไม่มีข้อมูลสารอาหาร'}</p>
                )}
              </section>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Popup Modal */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={getImageUrl(selectedImage)}
            alt="Full size"
            className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
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
