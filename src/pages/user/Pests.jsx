import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { getImageUrl } from '../../utils/urlHelper';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const Pests = () => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language === 'th';

  const [searchTerm, setSearchTerm] = useState('');
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPest, setSelectedPest] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeModalImg, setActiveModalImg] = useState(null);

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
      setActiveModalImg(selectedPest.image_path);
    } else {
      document.body.style.overflow = 'unset';
      setActiveModalImg(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPest]);

  const openDetail = async (itemOrId) => {
    const id = typeof itemOrId === 'object' ? (itemOrId._id || itemOrId.id) : itemOrId;
    if (typeof itemOrId === 'object') {
      setSelectedPest(itemOrId);
    }
    if (!id) return;
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
            <AlertCircle className="w-4 h-4" />
            <span>Pest Control System</span>
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
                placeholder={t('pestsPage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 sm:py-5 bg-gray-50 border border-gray-100 rounded-2xl sm:rounded-3xl text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-base shadow-sm"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-[2.5rem] h-96 animate-pulse shadow-sm border border-gray-100" />
            ))}
          </div>
        ) : filteredPests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center max-w-md mx-auto shadow-xl shadow-gray-100 border border-gray-100">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-500">
              <Info className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pestsPage.notFound')}</h3>
            <p className="text-gray-500 text-sm font-medium">{t('pestsPage.trySearch')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPests.map((pest) => {
              const pestId = pest._id || pest.id;
              return (
                <div
                  key={pestId || pest.thai_name}
                  onClick={() => openDetail(pest)}
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                  <img
                    src={getImageUrl(pest.image_path)}
                    alt={pest.thai_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 bg-orange-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/20 shadow-lg">
                      Pest
                    </span>
                  </div>

                  {/* Title overlay on image */}
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <p className="text-xs font-black text-orange-300 uppercase tracking-widest mb-1">{pest.eng_name}</p>
                    <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-orange-200 transition-colors">
                      {pest.thai_name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('diseasesPage.symptoms')}</span>
                        <p className="text-sm text-gray-600 line-clamp-2 font-bold leading-relaxed">{stripHtml(pest.description) || t('vegetablesPage.noDataDetails')}</p>
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
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedPest && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPest(null)}
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
                  src={getImageUrl(activeModalImg || selectedPest.image_path)}
                  className="w-full h-full object-cover filter brightness-90 transform hover:scale-105 transition-transform duration-700"
                  alt={selectedPest.thai_name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Top Badge */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold shadow-sm">
                  <Bug className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedPest.severity || t('detectPage.severity.medium')} Pest Threat</span>
                </div>
              </div>

              {/* Hero Title & Thumbnails */}
              <div className="relative z-10 mt-auto space-y-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {selectedPest.thai_name}
                  </h2>
                  <p className="text-xs md:text-sm font-bold text-amber-300 uppercase tracking-widest mt-1 drop-shadow-sm">
                    {selectedPest.eng_name}
                  </p>
                </div>

                {/* Interactive Gallery Thumbnails */}
                {selectedPest.image_paths && selectedPest.image_paths.length > 1 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {t('vegetablesPage.moreImages') || 'รูปภาพเพิ่มเติม'}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {selectedPest.image_paths.map((path, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveModalImg(path)}
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            (activeModalImg || selectedPest.image_path) === path 
                              ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/40' 
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
              {/* Description / Symptoms */}
              <section className="bg-amber-50/60 rounded-3xl p-5 md:p-6 border border-amber-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('detailPage.description') || 'รายละเอียดและลักษณะรอยทำลาย'}</h3>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{isThai ? 'ลักษณะพฤติกรรมและการระบาด' : 'Pest Description & Behavior'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-amber-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: selectedPest.description || t('vegetablesPage.noDataDetails') }} 
                />
              </section>

              {/* Cause / Damage */}
              <section className="bg-rose-50/60 rounded-3xl p-5 md:p-6 border border-rose-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
                    <Skull className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('detailPage.cause') || 'ผลกระทบและสาเหตุ'}</h3>
                    <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">{isThai ? 'ความเสียหายต่อผลผลิต' : 'Damage & Impact'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-rose-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: selectedPest.cause || t('vegetablesPage.noDataDetails') }} 
                />
              </section>

              {/* Treatment / Control */}
              <section className="bg-emerald-50/60 rounded-3xl p-5 md:p-6 border border-emerald-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('detailPage.treatment') || 'วิธีป้องกันกำจัด'}</h3>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">{isThai ? 'การกำจัดแบบผสมผสานและวิถีชีวภาพ' : 'Control Methods'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-emerald-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: selectedPest.treatment || t('vegetablesPage.noDataDetails') }} 
                />
              </section>

              {/* Prevention */}
              <section className="bg-sky-50/60 rounded-3xl p-5 md:p-6 border border-sky-100/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{t('detailPage.prevention') || 'การป้องกันล่วงหน้า'}</h3>
                    <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">{isThai ? 'แนวทางดูแลแปลงผักล่วงหน้า' : 'Preventive Guidance'}</p>
                  </div>
                </div>
                <div 
                  className="text-sm leading-relaxed text-slate-700 font-medium pl-3 border-l-3 border-sky-400 html-content" 
                  dangerouslySetInnerHTML={{ __html: selectedPest.prevention || t('vegetablesPage.noDataDetails') }} 
                />
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

export default Pests;
