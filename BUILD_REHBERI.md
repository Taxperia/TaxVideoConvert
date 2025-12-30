# 🛠️ TaxVideoConvert - Build ve Güncelleme Rehberi

Bu rehber, uygulamayı nasıl derleyeceğini, GitHub'a yükleyeceğini ve güncelleme yayınlayacağını adım adım anlatır.

---

## 📋 İçindekiler

1. [Gereksinimler](#-gereksinimler)
2. [İlk Kurulum (Tek Seferlik)](#-i̇lk-kurulum-tek-seferlik)
3. [Uygulamayı Derleme (Build)](#-uygulamayı-derleme-build)
4. [Yeni Güncelleme Yayınlama](#-yeni-güncelleme-yayınlama)
5. [GitHub Token Oluşturma](#-github-token-oluşturma)
6. [Sık Karşılaşılan Sorunlar](#-sık-karşılaşılan-sorunlar)
7. [Dosya Yapısı](#-dosya-yapısı)

---

## 📦 Gereksinimler

Başlamadan önce bilgisayarında şunlar yüklü olmalı:

| Program | İndirme Linki | Kontrol Komutu |
|---------|---------------|----------------|
| Node.js (v18+) | https://nodejs.org | `node --version` |
| Git | https://git-scm.com | `git --version` |
| VS Code | https://code.visualstudio.com | - |

---

## 🚀 İlk Kurulum (Tek Seferlik)

### 1. Bağımlılıkları Yükle

Proje klasöründe terminali aç ve çalıştır:

```powershell
npm install
```

### 2. GitHub Token Oluştur

[GitHub Token Oluşturma](#-github-token-oluşturma) bölümüne bak.

### 3. Token'ı Kaydet (Opsiyonel)

Her seferinde token yazmamak için sistem ortam değişkenine ekleyebilirsin:

**Windows:**
1. Başlat → "ortam değişkenleri" ara → "Sistem ortam değişkenlerini düzenle"
2. "Ortam Değişkenleri" butonuna tıkla
3. "Kullanıcı değişkenleri" altında "Yeni" tıkla
4. Değişken adı: `GH_TOKEN`
5. Değişken değeri: `ghp_xxxxxxxxxxxx` (senin token'ın)

---

## 🔨 Uygulamayı Derleme (Build)

### Sadece Build (Yayınlamadan)

```powershell
npm run dist
```

Bu komut `dist` klasöründe şunları oluşturur:
- `TaxVideoConvert-Setup-X.X.X.exe` - Kurulum dosyası
- `win-unpacked/` - Portable versiyon

### Build + GitHub'a Yayınla

```powershell
# Token'ı ayarla (ortam değişkeni olarak kaydetmediysen)
$env:GH_TOKEN = "ghp_SENIN_TOKENIN"

# Derle ve yayınla
npm run dist -- --publish always
```

---

## 🔄 Yeni Güncelleme Yayınlama

Kod değişikliği yaptıktan sonra yeni sürüm yayınlamak için:

### Adım 1: Kodlarını Değiştir

İstediğin değişiklikleri yap (yeni özellik, bug fix, vs.)

### Adım 2: Versiyon Numarasını Artır

`package.json` dosyasını aç ve `version` değerini artır:

```json
{
  "name": "tax-video-convert",
  "version": "1.0.4",   // <-- Bunu artır (1.0.3 → 1.0.4)
  ...
}
```

**Versiyon Numarası Kuralları:**
- `X.Y.Z` formatında (Major.Minor.Patch)
- **Patch (Z):** Bug fix → 1.0.3 → 1.0.4
- **Minor (Y):** Yeni özellik → 1.0.3 → 1.1.0
- **Major (X):** Büyük değişiklik → 1.0.3 → 2.0.0

### Adım 3: Git'e Kaydet

```powershell
git add .
git commit -m "v1.0.4 - Değişiklik açıklaması"
git push
```

### Adım 4: Derle ve Yayınla

```powershell
$env:GH_TOKEN = "YOUR_GITHUB_TOKEN_HERE"
npm run dist -- --publish always
```

### Adım 5: GitHub'da Kontrol Et

https://github.com/Taxperia/TaxVideoConvert/releases adresinde yeni release'i gör.

---

## 🔑 GitHub Token Oluşturma

Token, uygulamayı GitHub'a yayınlamak için gerekli.

### Adım Adım:

1. **GitHub'a giriş yap**

2. **Token sayfasına git:**
   https://github.com/settings/tokens/new

3. **Ayarları doldur:**
   - **Note:** `TaxVideoConvert Updater`
   - **Expiration:** 90 days veya "No expiration"
   - **Select scopes:** ✅ `repo` (tüm repo izinleri)

4. **"Generate token" tıkla**

5. **Token'ı kopyala ve güvenli bir yere kaydet!**
   - `ghp_` ile başlayan uzun bir kod
   - ⚠️ Bu sayfadan çıkınca bir daha göremezsin!

### Token Güvenliği

- ❌ Token'ı kimseyle paylaşma
- ❌ Token'ı koda yazma
- ✅ Ortam değişkeni olarak kullan
- ✅ Süresi dolunca yenile

---

## ❓ Sık Karşılaşılan Sorunlar

### 1. "GH_TOKEN is not set" Hatası

**Çözüm:** Token'ı ayarla:
```powershell
$env:GH_TOKEN = "ghp_SENIN_TOKENIN"
```

### 2. "Cannot find module" Hatası

**Çözüm:** Bağımlılıkları yeniden yükle:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### 3. "EBUSY" veya "file in use" Hatası

**Çözüm:** 
- Uygulamayı kapat
- `dist` klasörünü sil
- Tekrar dene

### 4. Git Push Hatası

**Çözüm:**
```powershell
git pull origin main
git push
```

### 5. Token Expired (Süresi Dolmuş)

**Çözüm:** Yeni token oluştur ve eski komutu yeni token ile çalıştır.

---

## 📁 Dosya Yapısı

```
TaxVideoConvert/
├── main.js              # Ana Electron process
├── preload.js           # Preload script (güvenlik)
├── package.json         # Proje ayarları ve versiyon
├── package-lock.json    # Bağımlılık kilitleri
│
├── renderer/            # Kullanıcı arayüzü
│   ├── index.html       # Ana sayfa
│   ├── index.js         # Ana sayfa JS
│   ├── editor.html      # Editör sayfası
│   ├── editor.js        # Editör JS
│   ├── styles.css       # Stiller
│   ├── i18n.js          # Dil desteği (TR/EN)
│   ├── themes.js        # Tema sistemi
│   └── settings.js      # Ayarlar
│
├── build/               # Build kaynakları
│   ├── icon.ico         # Uygulama ikonu
│   ├── license_tr.txt   # Türkçe lisans
│   └── license_en.txt   # İngilizce lisans
│
├── vendor/              # Harici araçlar
│   └── yt-dlp/
│       └── win/
│           └── yt-dlp.exe
│
├── dist/                # Build çıktıları (otomatik oluşur)
│   ├── TaxVideoConvert-Setup-X.X.X.exe
│   ├── latest.yml       # Güncelleme bilgisi
│   └── win-unpacked/    # Portable versiyon
│
└── node_modules/        # Bağımlılıklar (otomatik oluşur)
```

---

## 🔄 Güncelleme Sistemi Nasıl Çalışır?

```
┌─────────────────────────────────────────────────────────────────┐
│                     GÜNCELLEME AKIŞI                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Kullanıcı uygulamayı açar]                                   │
│            │                                                    │
│            ▼                                                    │
│  [Uygulama GitHub Releases'ı kontrol eder]                     │
│            │                                                    │
│            ▼                                                    │
│  ┌─────────────────────┐                                       │
│  │ Yeni sürüm var mı? │                                        │
│  └─────────┬───────────┘                                       │
│       Evet │     │ Hayır                                       │
│            ▼     └──────► [Normal kullanım]                    │
│  [Bildirim göster]                                             │
│  "v1.0.4 mevcut"                                               │
│            │                                                    │
│            ▼                                                    │
│  [Kullanıcı "İndir" tıklar]                                    │
│            │                                                    │
│            ▼                                                    │
│  [Arka planda indirilir]                                       │
│  [İlerleme çubuğu gösterilir]                                  │
│            │                                                    │
│            ▼                                                    │
│  [İndirme tamamlandı]                                          │
│  "Yeniden Başlat" butonu                                       │
│            │                                                    │
│            ▼                                                    │
│  [Uygulama kapanır, güncelleme kurulur]                        │
│  [Yeni sürüm açılır]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Hızlı Referans Komutları

```powershell
# Geliştirme modunda çalıştır
npm start

# Sadece build (yayınlamadan)
npm run dist

# Build + GitHub'a yayınla
$env:GH_TOKEN = "TOKEN"; npm run dist -- --publish always

# Git: Değişiklikleri kaydet ve yükle
git add . ; git commit -m "Mesaj" ; git push

# Bağımlılıkları güncelle
npm update

# node_modules yeniden yükle
Remove-Item -Recurse -Force node_modules ; npm install
```

---

## 📞 Destek

Sorun yaşarsan:
1. Bu rehberi tekrar oku
2. Hata mesajını Google'da ara
3. GitHub Issues aç: https://github.com/Taxperia/TaxVideoConvert/issues

---

*Son güncelleme: 29 Aralık 2025*
