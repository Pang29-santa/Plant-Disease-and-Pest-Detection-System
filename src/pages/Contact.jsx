import ContactForm from '../components/ContactForm';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ติดต่อเรา
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานของเราพร้อมให้บริการ
            ส่งข้อความถึงเราได้ทางฟอร์มด้านล่าง หรือติดต่อทางอีเมลโดยตรง
          </p>
        </div>

        {/* Contact Form */}
        <ContactForm />

        {/* Contact Info Cards */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">อีเมล</h3>
            <p className="text-gray-600 text-sm">651413010@crru.ac.th</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">เวลาทำการ</h3>
            <p className="text-gray-600 text-sm">จันทร์ - ศุกร์<br />08:00 - 17:00</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">ตอบกลับ</h3>
            <p className="text-gray-600 text-sm">ภายใน 24-48 ชั่วโมง</p>
          </div>
        </div>
      </div>
    </div>
  );
}
