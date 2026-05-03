<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/repo_name">
    <!-- Logo eklenebilir, şimdilik metin -->
    <h3 align="center">TaxVideoConvert</h3>
  </a>

  <p align="center">
    YouTube videolarını en yüksek kalitede önizleyin, kesin ve istediğiniz formatta dışa aktarın!
    <br />
    <a href="#usage"><strong>Belgeleri Keşfedin »</strong></a>
    <br />
    <br />
    <a href="#demo">Demo Görüntüle</a>
    ·
    <a href="#issues">Hata Bildir</a>
    ·
    <a href="#feature">Özellik İste</a>
  </p>
</div>

<!-- SHIELDS -->
<div align="center">

[![Electron][Electron-badge]][Electron-url]
[![Node][Node-badge]][Node-url]
[![MIT License][License-badge]][License-url]
[![Version][Version-badge]][Version-url]

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>İçindekiler</summary>
  <ol>
    <li>
      <a href="#about-the-project">Proje Hakkında</a>
      <ul>
        <li><a href="#built-with">Kullanılan Teknolojiler</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Başlarken</a>
      <ul>
        <li><a href="#prerequisites">Gereksinimler</a></li>
        <li><a href="#installation">Kurulum</a></li>
        <li><a href="#vendor-setup">FFmpeg ve yt-dlp Kurulumu (Vendor)</a></li>
        <li><a href="#release">Otomatik Release Yayınlama</a></li>
      </ul>
    </li>
    <li><a href="#usage">Kullanım</a></li>
    <li><a href="#security">Güvenlik Yamaları</a></li>
    <li><a href="#license">Lisans</a></li>
    <li><a href="#contact">İletişim</a></li>
  </ol>
</details>

---

## 🚀 Proje Hakkında <a name="about-the-project"></a>

**TaxVideoConvert**, içerik üreticileri için geliştirilmiş Electron tabanlı, güçlü bir video işleme aracıdır. YouTube videolarını (kendi kanalınızdakiler vb.) doğrudan bağlantı üzerinden alır, en yüksek kalitede (8K'ya kadar) önizleme sunar ve yeniden kodlamaya (transcode) gerek kalmadan veya isteğe bağlı formatlarda kırpmanıza olanak tanır.

**Öne Çıkan Özellikler:**
*   🎞️ **Kayıpsız Kesim:** "Copy" codec modu ile videoyu yeniden işlemeden saniyeler içinde kesin.
*   🎧 **Format Desteği:** MP4, MKV, WebM konteynerleri; H.264, HEVC, VP9, AV1 video codec'leri.
*   🔒 **Güvenli Proxy:** Önizleme sırasında CORS hatalarını aşan, SSRF korumalı dahili proxy.
*   🎛️ **Gelişmiş Kodekler:** ProRes, Opus, FLAC, PCM (WAV) gibi profesyonel ses ve video seçenekleri.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

### 🛠️ Kullanılan Teknolojiler <a name="built-with"></a>

Proje, modern ve güvenilir açık kaynak kütüphaneler üzerine inşa edilmiştir.

*   [![Electron][Electron-badge]][Electron-url]
*   [![Node][Node-badge]][Node-url]
*   **ffmpeg-static** & **fluent-ffmpeg**
*   **yt-dlp**
*   **Express.js** (Dahili Proxy Sunucusu)

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

---

## ⚡ Başlarken <a name="getting-started"></a>

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları takip edin.

### Gereksinimler <a name="prerequisites"></a>

*   **Node.js** (v16 veya üzeri önerilir)
*   **npm**

### Kurulum <a name="installation"></a>

1.  Repoyu klonlayın:
    ```sh
    git clone https://github.com/kullaniciadi/TaxVideoConvert.git
    ```
2.  Proje dizinine gidin ve paketleri yükleyin:
    ```sh
    cd TaxVideoConvert
    npm install
    ```

### ⚙️ FFmpeg ve yt-dlp Kurulumu (Vendor) <a name="vendor-setup"></a>

Bu uygulama, video işleme işlemleri için harici araçlara ihtiyaç duyar. Varsayılan olarak npm paketleri kullanılsa da, **manuel kurulum (vendor klasörü)** prodüksiyon ortamları için önerilir.

1.  Uygulamanın ana dizininde `vendor` adında bir klasör oluşturun.
2.  İçerisine `ffmpeg` ve `yt-dlp` klasörlerini ekleyin.

**Dosya Ağacı Yapısı:**

```
TaxVideoConvert/
├── src/
├── package.json
└── vendor/
    ├── ffmpeg/
    │   └── ffmpeg.exe    <-- FFmpeg binary dosyasını buraya koyun
    └── yt-dlp/
        └── win/
            └── yt-dlp.exe  <-- yt-dlp binary dosyasını buraya koyun
```

> **Not:** Uygulama başlatıldığında önce `vendor` klasörünü kontrol eder. Bulamazsa sistem PATH'indeki veya `node_modules` içindeki statik binary'leri kullanmaya çalışır.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

### Otomatik Release Yayınlama <a name="release"></a>

GitHub Actions, `v*` formatında tag gönderildiğinde Windows installer üretir ve GitHub Release'e yükler. Aynı tag için GitHub, kaynak kod `zip` ve `tar.gz` arşivlerini Release sayfasında otomatik gösterir.

Değişiklikleri commitledikten sonra yeni sürüm tag'ini oluşturup gönderin:

```sh
npm version patch
git push origin main --tags
```

> `npm version patch`, örneğin `1.0.9` sürümünü `1.0.10` yapar, commit oluşturur ve `v1.0.10` tag'ini ekler.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

---

## 🎮 Kullanım <a name="usage"></a>

1.  Uygulamayı başlatın:
    ```sh
    npm start
    ```
2.  Ana ekrandaki URL kutusuna işlemek istediğiniz YouTube video bağlantısını yapıştırın.
3.  Editör ekranında:
    *   **Timeline:** Videoyu izleyin ve kesmek istediğiniz başlangıç/bitiş noktalarını belirleyin.
    *   **Ayarlar Paneli (Sağ Taraf):**
        *   **Mod:** Sadece Video, Sadece Ses veya İkisi Bir Arada.
        *   **Kalite:** 144p'den 8K'ya kadar seçim yapın.
        *   **Codec:** H.264 (Hızlı), HEVC (Verimli) veya Copy (Kayıpsız/Hızlı).
4.  "Dışa Aktar" butonuna basın ve işlemin tamamlanmasını bekleyin.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

---

## 🛡️ Güvenlik Yamaları <a name="security"></a>

Uygulama güvenliği en üst düzeyde tutulmuş ve bilinen kritik Node.js modül zafiyetlerine karşı 2026 itibarıyla **manuel yamalar** uygulanmıştır:

*   ✅ **SSRF Koruması:** Dahili proxy sunucusu, yerel ağ saldırılarını (localhost, 192.168.x.x vb.) engeller.
*   ✅ **Prototype Pollution:** `lodash` ve `js-yaml` kütüphanelerindeki prototip kirliliği açıkları kapatıldı.
*   ✅ **Zip/Tar Traversal:** `node-tar` modülü sembolik bağlantı saldırılarına karşı sertleştirildi.
*   ✅ **DoS Koruması:** `qs` modülündeki bellek taşırma (memory exhaustion) açığı giderildi.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

---

## 📜 Lisans <a name="license"></a>

Bu proje **Apache License 2.0** altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Electron-badge]: https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white
[Electron-url]: https://www.electronjs.org/
[Node-badge]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[License-badge]: https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge
[License-url]: https://opensource.org/licenses/Apache-2.0
[Version-badge]: https://img.shields.io/badge/version-1.0.9-orange?style=for-the-badge&logo=none
[Version-url]: #
