# 🐱 Kedi Jüri - Fotoğraf Değerlendirme Sistemi

Kedi fotoğraflarını beş farklı kritere göre puanlayan, Firebase tabanlı interaktif bir web uygulaması.

## 📋 Proje Hakkında

Bu proje, kedi fotoğraflarını sistematik bir şekilde değerlendirmek için geliştirilmiş kapsamlı bir sistemdir. Kullanıcı dostu arayüzü ile fotoğrafları 5 farklı kritere göre puanlayabilir, puanlanan fotoğraflar otomatik olarak veritabanında "done" durumuna geçer ve depolama alanından silinerek yer tasarrufu sağlar.

### ✨ Özellikler

- 🎯 **5 Farklı Puanlama Kriteri:**

  - **Teknik** (Netlik, ışık, kompozisyon)
  - **Biçim** (Çerçeveleme ve düzenleme)
  - **İçerik** (Kedi ve çevre uyumu)
  - **Anlatım** (Duygusal etki)
  - **Duygu** (Kedinin ruh hali ve ifadesi)

- 🎲 **Rastgele Fotoğraf Seçimi:** Pending durumundaki fotoğraflardan 50'lik havuz oluşturur ve rastgele sunar
- 💾 **Otomatik Kayıt:** Puanlanan fotoğraflar Firestore'da saklanır ve Storage'dan silinir
- 📊 **CSV Export:** Tüm puanlanan fotoğrafları CSV formatında indirebilme
- 📱 **Responsive Tasarım:** Mobil ve masaüstü uyumlu arayüz
- ⌨️ **Klavye Kısayolları:** Hızlı puanlama için (0-9 tuşları)

## 🛠️ Teknolojiler

- **React 19.2** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Firebase 12.7** - Firestore & Storage

## 📁 Proje Yapısı

```
cat-juri/
└── kedi-juri/                    # React Frontend
    ├── src/
    │   ├── App.tsx               # Ana uygulama
    │   ├── firebase.ts           # Firebase yapılandırması
    │   └── ...
    ├── package.json
    └── vite.config.ts
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Firebase projesi (Firestore + Storage)

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/burhanmorningstar/cat-juri.git
cd cat-juri
```

### 2. Bağımlılıkları Yükleyin

```bash
cd kedi-juri
npm install
```

### 3. Firebase Yapılandırması

`kedi-juri/src/firebase.ts` dosyasını kendi Firebase projenizle yapılandırın:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4. Firestore Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /photos/{photoId} {
      allow read, write: if true; // Geliştirme için - Production'da düzenleyin!
    }
  }
}
```

### 5. Storage Kuralları

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      allow read: if true;
      allow write: if true; // Geliştirme için
    }
  }
}
```

## Kullanım

### Frontend'i Başlatın

```bash
cd kedi-juri
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini açın.

### Puanlama Yapma

1. Uygulama açıldığında rastgele bir fotoğraf gelir
2. 5 kriterin her birine **0-10 arası** puan verin
3. Slider'ları kullanın veya **klavye kısayolları** ile hızlıca puanlayın:
   - **0-9 tuşları:** İlgili kritere puan ver
   - **Enter:** Kaydet ve sıradakine geç
4. "Kaydet & Sıradaki" butonuna basın
5. Fotoğraf otomatik olarak:
   - Firestore'da `done` olarak işaretlenir
   - Storage'dan silinir (yer kazancı)
   - Sonraki fotoğraf yüklenir

### CSV Export

Tüm puanlanan fotoğrafları indirmek için:

1. "BİTTİ!" ekranında "CSV İNDİR" butonuna tıklayın
2. `etiketli_kediler.csv` dosyası indirilir

CSV formatı:

```
Dosya,Teknik,Bicim,Icerik,Anlatim,Duygu,Toplam
kedi_001.jpg,8,7,9,8,10,42
kedi_002.jpg,6,8,7,9,8,38
```

## Veri Modeli

### Firestore - photos Collection

```typescript
interface Photo {
  id: string; // Firestore doc ID
  name: string; // Dosya adı
  url: string; // Public URL
  status: "pending" | "done";
  scores?: {
    teknik: number; // 0-10
    bicim: number; // 0-10
    icerik: number; // 0-10
    anlatim: number; // 0-10
    duygu: number; // 0-10
  };
  total?: number; // Toplam puan (0-50)
  uploaded_at: Timestamp; // Yüklenme tarihi
  labeled_at?: Timestamp; // Puanlanma tarihi
  labeler?: string; // 'human' | 'ai'
}
```

## 🎨 Mobil Uyumluluk

Uygulama mobil cihazlarda da sorunsuz çalışır:

- Touch-friendly butonlar
- Responsive layout
- Optimized font sizes
- Vertical stacking on small screens

## 🔐 Güvenlik Notları

⚠️ **Önemli:** Bu proje geliştirme/demo amaçlıdır. Production'da:

1. Firebase kurallarını sıkılaştırın (authentication ekleyin)
2. `.env` dosyası kullanarak API key'leri saklayın
3. Admin SDK JSON dosyasını `.gitignore`'a ekleyin
4. CORS ayarlarını yapılandırın
5. Rate limiting ekleyin

## 🐛 Bilinen Sorunlar

- [ ] Çok büyük dataset'lerde Storage silme işlemi yavaşlayabilir
- [ ] Firestore limit: 50 fotoğraf havuzu (gerekirse artırılabilir)
- [ ] CSV export tüm verileri RAM'e alıyor (büyük dataset'lerde optimize edilmeli)

## 🚀 Geliştirme İpuçları

### Production Build

```bash
cd kedi-juri
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**🐱 Happy Coding & Happy Judging! 🐱**
