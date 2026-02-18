import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Bug, ChevronRight, AlertCircle, Skull, Info } from 'lucide-react';
import axios from 'axios';

const Pests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPests = async () => {
      try {
        const response = await axios.get('/api/diseases-pest/pests');
        const mappedData = response.data.map(p => ({
          id: p.id || p._id,
          thai_name: p.thai_name,
          eng_name: p.eng_name,
          description: p.description || t('vegetablesPage.noDataDetails'),
          damage: p.description || t('vegetablesPage.noDataDetails'),
          control: p.prevention || t('vegetablesPage.noDataDetails'),
          severity: t('detectPage.severity.medium'), // Default or from API
          image: p.image_path ? `${import.meta.env.VITE_API_URL}/${p.image_path}` : 'https://placehold.co/600x400?text=No+Image'
        }));
        setPests(mappedData);
      } catch (error) {
        console.error('Error fetching pests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPests();
  }, [t]);

  const filteredPests = pests.filter(p =>
    p.thai_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.eng_name && p.eng_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-16 px-4 relative overflow-hidden">
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
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg mb-10 font-medium">
            {t('pestsPage.subtitle')}
          </p>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-orange-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('pestsPage.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl 
                         focus:outline-none focus:bg-white focus:border-orange-500 
                         transition-all shadow-sm text-gray-700 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 h-[30rem] animate-pulse">
                <div className="w-full h-56 bg-gray-100 rounded-[2rem] mb-6" />
                <div className="h-6 w-3/4 bg-gray-100 rounded mb-4" />
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
              className="text-orange-600 font-bold hover:underline"
            >
              แสดงทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPests.map((pest) => (
              <div
                key={pest.id}
                onClick={() => navigate(`/diseases-pest/details/${pest.id}`)}
                className="group bg-white rounded-[2.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 border border-gray-100 transition-all duration-500 cursor-pointer flex flex-col hover:-translate-y-2 active:scale-95"
              >
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6">
                  <img
                    src={pest.image}
                    alt={pest.thai_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=No+Image'}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-orange-600 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    {pest.severity}
                  </div>
                </div>

                <div className="px-5 pb-5 flex-grow">
                  <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                    {pest.thai_name}
                  </h3>
                  <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">{pest.eng_name || '-'}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('pestsPage.description')}</span>
                        <p className="text-sm text-gray-600 line-clamp-2 font-medium leading-relaxed">{pest.description.replace(/<[^>]*>?/gm, '')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Skull className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('pestsPage.control')}</span>
                        <p className="text-sm text-gray-600 line-clamp-1 font-medium leading-relaxed">{pest.control.replace(/<[^>]*>?/gm, '')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between group-hover:border-orange-50 transition-colors">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                      {t('diseasesPage.viewDetail')}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pests;
