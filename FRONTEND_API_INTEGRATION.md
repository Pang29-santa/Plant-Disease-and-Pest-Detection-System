# Frontend API Integration
## เอกสารการเชื่อมต่อ API ใหม่สำหรับหน้าบ้าน

**วันที่**: 2026-02-23  
**โปรเจกต์**: `D:\pang\project\frontend`

---

## สรุป

ได้เพิ่ม API Services, Hooks และ Components สำหรับใช้งาน API ใหม่ที่ backend ทั้งหมด 9 endpoints

---

## โครงสร้างไฟล์ที่เพิ่ม

### 1. API Services (`src/services/`)

```
services/
├── validationApi.js      # [NEW] ตรวจสอบชื่อซ้ำ
├── uploadApi.js          # [NEW] อัปโหลดรูปภาพ CKEditor
├── adminStatsApi.js      # [NEW] สถิติสำหรับ Admin
├── cctvStreamApi.js      # [NEW] สตรีมและสถานะกล้อง
├── languageApi.js        # [NEW] ตั้งค่าภาษา
├── aiApi.js              # [EXISTING]
└── telegramApi.js        # [EXISTING]
```

### 2. Custom Hooks (`src/hooks/`)

```
hooks/
├── useValidation.js      # [NEW] Hook สำหรับตรวจสอบชื่อซ้ำ
├── useAdminStats.js      # [NEW] Hook สำหรับสถิติ Admin
├── useCCTV.js            # [NEW] Hook สำหรับกล้อง CCTV
├── useLanguage.js        # [NEW] Hook สำหรับภาษา
├── useUpload.js          # [NEW] Hook สำหรับอัปโหลดไฟล์
└── index.js              # [NEW] Export รวม hooks
```

### 3. Components (`src/components/`)

```
components/
├── common/
│   ├── LanguageSwitcher.jsx      # [NEW] ปุ่มสลับภาษา
│   ├── NameValidationInput.jsx   # [NEW] Input พร้อมตรวจสอบชื่อซ้ำ
│   ├── CCTVStream.jsx            # [NEW] แสดงสตรีมกล้อง
│   └── index.js                  # [NEW] Export รวม
└── admin/
    └── AdminStatsDashboard.jsx   # [NEW] Dashboard สถิติ
```

---

## วิธีใช้งาน

### 1. Validation (ตรวจสอบชื่อซ้ำ)

```jsx
import { useValidation } from './hooks';

function VegetableForm() {
  const { checkVegetable, isChecking } = useValidation();
  const [name, setName] = useState('');

  const handleCheck = async () => {
    const result = await checkVegetable(name);
    if (result.exists) {
      alert('ชื่อผักนี้มีอยู่แล้ว!');
    }
  };

  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="ชื่อผัก"
      />
      <button onClick={handleCheck} disabled={isChecking}>
        {isChecking ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
      </button>
    </div>
  );
}
```

**หรือใช้ Component ที่เตรียมไว้:**

```jsx
import { NameValidationInput } from './components/common';

function MyForm() {
  const [name, setName] = useState('');

  return (
    <NameValidationInput
      type="vegetable"  // 'vegetable' | 'disease' | 'pest'
      value={name}
      onChange={setName}
      placeholder="ชื่อผัก"
    />
  );
}
```

---

### 2. Upload (อัปโหลดรูปภาพ)

```jsx
import { useUpload } from './hooks';

function ImageUpload() {
  const { upload, uploading, progress } = useUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const result = await upload(file, {
      onProgress: (percent) => console.log(`${percent}%`),
      onSuccess: (data) => console.log('Uploaded:', data.url),
      onError: (err) => console.error('Error:', err),
    });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      {uploading && <progress value={progress} max="100" />}
    </div>
  );
}
```

---

### 3. Admin Stats (สถิติสำหรับ Admin)

```jsx
import { useAdminStats } from './hooks';

function StatsPage() {
  const { stats, loading, fetchStats } = useAdminStats();

  useEffect(() => {
    fetchStats(2026, 2); // ปี 2026, เดือน 2
  }, []);

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div>
      <h1>สถิติการตรวจพบ</h1>
      <p>ทั้งหมด: {stats?.total_detections} ครั้ง</p>
      
      <h3>อันดับที่พบมากที่สุด</h3>
      <ul>
        {stats?.top_items?.map((item, i) => (
          <li key={i}>{item.name}: {item.count} ครั้ง</li>
        ))}
      </ul>
    </div>
  );
}
```

**หรือใช้ Component ที่เตรียมไว้:**

```jsx
import AdminStatsDashboard from './components/admin/AdminStatsDashboard';

function AdminPage() {
  return <AdminStatsDashboard initialYear={2026} />;
}
```

---

### 4. CCTV Stream (กล้องวงจรปิด)

```jsx
import { useCCTV } from './hooks';

function CameraView({ cctvId }) {
  const { status, isOnline, checkStatus } = useCCTV(cctvId);

  return (
    <div>
      <p>สถานะ: {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}</p>
      <button onClick={checkStatus}>ตรวจสอบสถานะ</button>
    </div>
  );
}
```

**แสดงสตรีมวิดีโอ:**

```jsx
import { CCTVStream } from './components/common';

function CameraPage() {
  return (
    <CCTVStream 
      cctvId="64abc123..."
      showStatus
      showControls
      onSnapshot={(dataUrl) => console.log('Snapshot:', dataUrl)}
    />
  );
}
```

---

### 5. Language (ตั้งค่าภาษา)

```jsx
import { useLanguage } from './hooks';

function MyComponent() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <div>
      <p>Current: {lang}</p>
      <p>{t('app.name')}</p>
      <button onClick={() => toggleLang()}>
        สลับภาษา
      </button>
    </div>
  );
}
```

**หรือใช้ Component ที่เตรียมไว้:**

```jsx
import { LanguageSwitcher } from './components/common';

function Navbar() {
  return (
    <nav>
      <LanguageSwitcher showLabel />
    </nav>
  );
}
```

---

## API Reference

### validationApi

```javascript
import validationApi from './services/validationApi';

// ตรวจสอบชื่อผัก
const result = await validationApi.checkVegetableName('ผักบุ้ง');
// { exists: false, thai_name: 'ผักบุ้ง', message: 'ชื่อผักนี้สามารถใช้ได้' }

// ตรวจสอบชื่อโรค/ศัตรูพืช
const result = await validationApi.checkDiseasePestName('โรคใบจุด', '1');
// { exists: true, thai_name: 'โรคใบจุด', type: '1', type_name: 'โรคพืช', message: '...' }

// แบบมี debounce (real-time)
validationApi.checkVegetableNameWithDebounce('ผักกาด', 500)
  .then(result => console.log(result));
```

### uploadApi

```javascript
import uploadApi from './services/uploadApi';

// อัปโหลดรูปภาพ
const result = await uploadApi.uploadImage(file, (percent) => {
  console.log(`Progress: ${percent}%`);
});
// { url: '/static/images/ckeditor/abc.jpg', uploaded: true, filename: 'abc.jpg' }

// อัปโหลดหลายไฟล์
const results = await uploadApi.uploadMultipleImages(files);

// ตรวจสอบไฟล์ก่อนอัปโหลด
const validation = uploadApi.validateImageFile(file, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png']
});
// { valid: true, error: null }

// แปลงไฟล์เป็น Base64
const base64 = await uploadApi.fileToBase64(file);
```

### adminStatsApi

```javascript
import adminStatsApi from './services/adminStatsApi';

// ดึงสถิติ top 3 ประจำวัน
const daily = await adminStatsApi.getTopDailyDetections('2026-02-23');

// ดึงสถิติทั้งหมด
const stats = await adminStatsApi.getDetectionStats(2026, 2); // ปี, เดือน

// ดึงรายการเดือนที่มีข้อมูล
const months = await adminStatsApi.getAvailableMonths(2026);
// [{ value: 1, name: 'มกราคม' }, ...]

// Helper: แปลงปี พ.ศ. <=> ค.ศ.
const christianYear = adminStatsApi.toChristianYear(2568); // 2025
const buddhistYear = adminStatsApi.toBuddhistYear(2025);   // 2568
```

### cctvStreamApi

```javascript
import cctvStreamApi from './services/cctvStreamApi';

// ตรวจสอบสถานะกล้อง
const status = await cctvStreamApi.getCameraStatus('64abc123...');
// { status: 'online', protocol: 'rtsp' }

// ดึง URL สำหรับสตรีม
const streamUrl = cctvStreamApi.getCameraStreamUrl('64abc123...');
// '/api/cctv/stream/64abc123...'

// ตรวจสอบหลายกล้องพร้อมกัน
const statuses = await cctvStreamApi.getMultipleCameraStatus(['id1', 'id2']);

// ถ่ายภาพ snapshot
const snapshot = await cctvStreamApi.captureSnapshot('64abc123...');
// 'data:image/jpeg;base64,...'
```

### languageApi

```javascript
import languageApi from './services/languageApi';

// ตั้งค่าภาษา
await languageApi.setLanguage('en');

// ดึงภาษาปัจจุบัน
const lang = languageApi.getCurrentLanguage(); // 'th' หรือ 'en'

// สลับภาษา
await languageApi.toggleLanguage(true); // true = reload หน้า

// แปลข้อความ
const text = languageApi.t('app.name'); // 'Vegetable & Disease...'

// ข้อมูลภาษาที่รองรับ
console.log(languageApi.SUPPORTED_LANGS); // ['th', 'en']
console.log(languageApi.DEFAULT_LANG);    // 'th'
```

---

## Dependencies

ไม่ต้องติดตั้งเพิ่ม ใช้ dependencies ที่มีอยู่แล้ว:
- `axios` - HTTP client
- `react` - Hooks (useState, useEffect, useCallback)

---

## หมายเหตุ

1. **ทุก API service ใช้ axios** - สอดคล้องกับโปรเจกต์เดิม
2. **Hooks รองรับ loading, error states** - จัดการ state ครบถ้วน
3. **Components ใช้ Tailwind CSS** - สอดคล้องกับโปรเจกต์เดิม
4. **รองรับ Thai/English** - ผ่าน languageApi และ useLanguage hook

---

## ตัวอย่างการใช้งานรวม

```jsx
import React from 'react';
import { LanguageSwitcher, NameValidationInput, CCTVStream } from './components/common';
import AdminStatsDashboard from './components/admin/AdminStatsDashboard';

function AdminPage() {
  return (
    <div className="p-6">
      {/* สลับภาษา */}
      <div className="flex justify-end mb-4">
        <LanguageSwitcher showLabel />
      </div>

      {/* สถิติ */}
      <AdminStatsDashboard initialYear={2026} />

      {/* กล้องวงจรปิด */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">กล้องวงจรปิด</h2>
        <div className="grid grid-cols-2 gap-4">
          <CCTVStream cctvId="64abc..." />
          <CCTVStream cctvId="64def..." />
        </div>
      </div>
    </div>
  );
}
```
