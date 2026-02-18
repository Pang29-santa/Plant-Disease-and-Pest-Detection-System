import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, AlertTriangle, ChevronRight, Shield, Thermometer, Info } from 'lucide-react';
import axios from 'axios';

const Diseases = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axios.get('/api/diseases-pest/diseases');
        const mappedData = response.data.map(d => ({
          id: d.id || d._id,
          thai_name: d.thai_name,
          eng_name: d.eng_name,
          symptoms: d.description || t('vegetablesPage.noDataDetails'),
          cause: d.cause || t('vegetablesPage.noDataDetails'),
          treatment: d.treatment || t('vegetablesPage.noDataDetails'),
          severity: t('detectPage.severity.medium'), // Default or from API
          image: d.image_path ? `${import.meta.env.VITE_API_URL}/${d.image_path}` : 'https://placehold.co/600x400?text=No+Image'
        }));
        setDiseases(mappedData);
      } catch (error) {
        console.error('Error fetching diseases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiseases();
  }, [t]);

  const filteredDiseases = diseases.filter(d =>
    d.thai_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.eng_name && d.eng_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Shield className="w-64 h-64 text-red-900 rotate-12" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Smart Guard System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {t('nav.diseases')}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg mb-10 font-medium">
            {t('diseasesPage.subtitle')}
          </p>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-red-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('diseasesPage.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl 
                         focus:outline-none focus:bg-white focus:border-red-500' 
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
        ) : filteredDiseases.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('diseasesPage.noResults')}</h3>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-red-600 font-bold hover:underline"
            >
              แสดงทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => navigate(`/diseases-pest/details/${disease.id}`)}
                className="group bg-white rounded-[2.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-red-900/5 border border-gray-100 transition-all duration-500 cursor-pointer flex flex-col hover:-translate-y-2 active:scale-95"
              >
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6">
                  <img
                    src={disease.image}
                    alt={disease.thai_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=No+Image'}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-red-600 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {disease.severity}
                  </div>
                </div>

                <div className="px-5 pb-5 flex-grow">
                  <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-red-600 transition-colors">
                    {disease.thai_name}
                  </h3>
                  <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">{disease.eng_name || '-'}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('diseasesPage.symptoms')}</span>
                        <p className="text-sm text-gray-600 line-clamp-2 font-medium leading-relaxed">{disease.symptoms.replace(/<[^>]*>?/gm, '')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Thermometer className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('diseasesPage.cause')}</span>
                        <p className="text-sm text-gray-600 line-clamp-1 font-medium leading-relaxed">{disease.cause.replace(/<[^>]*>?/gm, '')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between group-hover:border-red-50 transition-colors">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-red-600 transition-colors">
                      {t('diseasesPage.viewDetail')}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
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

export default Diseases;
