# Vegetable & Agriculture Frontend

Frontend สำหรับระบบตรวจจับโรคและศัตรูพืชในผัก สำหรับสวนครัวด้วย CCTV และระบบพ่นน้ำอัตโนมัติ

## Features

- 🔐 ระบบ Login/Register พร้อม JWT Authentication
- 🌐 รองรับ 2 ภาษา (ไทย/อังกฤษ)
- 📱 Responsive Design
- 🔍 ตรวจจับโรคและศัตรูพืชด้วย AI
- 🥬 ข้อมูลผัก โรคพืช และแมลงศัตรูพืช
- 📊 Dashboard แสดงสถิติ
- 🎨 ดีไซน์สวยงามด้วย Tailwind CSS

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- i18next (ภาษา)
- Lucide React (Icons)

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
VITE_API_URL=http://localhost:8888
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | หน้าแรก (Landing Page) |
| `/login` | เข้าสู่ระบบ |
| `/register` | ลงทะเบียน |
| `/detect` | ตรวจโรคและศัตรูพืช |
| `/vegetables` | ข้อมูลผัก |
| `/diseases` | ข้อมูลโรคพืช |
| `/pests` | ข้อมูลแมลงศัตรูพืช |
| `/dashboard` | แดชบอร์ดผู้ใช้ |

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── LanguageSwitcher.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Detect.jsx
│   │   ├── Vegetables.jsx
│   │   ├── Diseases.jsx
│   │   ├── Pests.jsx
│   │   └── Dashboard.jsx
│   ├── context/        # React Context
│   │   └── AuthContext.jsx
│   ├── i18n/           # Translations
│   │   ├── i18n.js
│   │   └── locales/
│   │       ├── th.json
│   │       └── en.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## License

MIT
# Plant-Disease-and-Pest-Detection-System
