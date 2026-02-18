import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, AlertTriangle, Shield, Thermometer, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DiseasePestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        // If history exists, go back. Otherwise, go to home or relevant list.
        if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
            navigate(-1);
        } else {
            // Sensible fallback
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
                // The ID from Telegram link might be the numeric ID or MongoDB ObjectId
                // The API /api/diseases-pest/:id handles both if implemented correctly
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูล</h1>
                <p className="text-gray-600 mb-6 text-center">ขออภัย ไม่พบรายละเอียดของโรคหรือศัตรูพืชที่คุณต้องการ</p>
                <button 
                    onClick={handleBack}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    ย้อนกลับ
                </button>
            </div>
        );
    }

    const typeLabel = item.type === '1' ? 'โรคพืช' : 'ศัตรูพืช';
    const typeColor = item.type === '1' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700';

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    ย้อนกลับ
                </button>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header with Image */}
                    <div className="relative h-64 md:h-96">
                        <img 
                            src={item.image_path ? `${import.meta.env.VITE_API_URL}/${item.image_path}` : 'https://via.placeholder.com/800x400?text=No+Image'} 
                            alt={item.thai_name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${typeColor}`}>
                                {typeLabel}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-1">
                                {item.thai_name}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 italic font-medium">
                                {item.eng_name}
                            </p>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-10 space-y-10">
                        {/* Description Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                    <Info className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">ลักษณะอาการ</h2>
                            </div>
                            <div 
                                className="text-gray-700 leading-relaxed text-lg prose prose-green max-w-none"
                                dangerouslySetInnerHTML={{ __html: item.description || 'ยังไม่มีข้อมูล' }}
                            />
                        </section>

                        {/* Cause Section */}
                        <section className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                                    <Thermometer className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">สาเหตุการเกิด</h2>
                            </div>
                            <div 
                                className="text-gray-700 text-lg leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: item.cause || 'ยังไม่มีข้อมูล' }}
                            />
                        </section>

                        {/* Treatment Section */}
                        <section className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-xl text-green-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">วิธีการรักษาและจัดการ</h2>
                            </div>
                            <div 
                                className="text-gray-700 leading-relaxed text-lg prose prose-green max-w-none"
                                dangerouslySetInnerHTML={{ __html: item.treatment || 'ยังไม่มีข้อมูล' }}
                            />
                        </section>

                        {/* Prevention Section */}
                        <section className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gray-200 rounded-xl text-gray-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">การป้องกัน</h2>
                            </div>
                            <div 
                                className="text-gray-700 leading-relaxed text-lg prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: item.prevention || 'ยังไม่มีข้อมูล' }}
                            />
                        </section>

                        {/* Gallery Section */}
                        {item.image_paths && item.image_paths.length > 1 && (
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">รูปภาพเพิ่มเติม</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {item.image_paths.slice(1).map((path, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <img 
                                                src={`${import.meta.env.VITE_API_URL}/${path}`} 
                                                alt={`Gallery ${idx}`}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${path}`, '_blank')}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseasePestDetail;
