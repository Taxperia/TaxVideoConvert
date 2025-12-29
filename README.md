# YT Studio Trimmer (Electron)

YouTube videolarını (kendi kanal videoların) en yüksek mevcut kalitede önizleyip başlangıç/bitiş noktaları belirleyerek kırpman ve farklı konteyner/codec seçenekleriyle dışa aktarman için Electron tabanlı bir masaüstü uygulaması.

## Özellikler

- URL girişi: Ana sayfada sadece bağlantı girişi.
- Editör sayfası:
  - Video oynatıcı, basit timeline ve In/Out “tırnakları”.
  - Sağ panelde:
    - Mod: Video+Ses / Sadece Video / Sadece Ses
    - Kalite (144p — 8K): Videonun maks. kalitesine göre seçim.
    - Konteyner: mp4, mkv, webm
    - Video codec: copy, H.264 (libx264), HEVC (libx265), VP9 (libvpx-vp9), AV1 (libaom-av1), ProRes (prores_ks)
    - Audio codec: copy, AAC, Opus, MP3, FLAC, PCM (WAV)
    - Çıkış dosya adı ve konumu seçimi
  - Dışa aktar: ffmpeg ile trim + mux/transcode
- Önizleme: Progressive akış bulunursa yerel proxy üzerinden oynatılır (CORS ve Range destekli).

## Kurulum

```bash
npm install
npm start
```

Gereksinimler:
- `yt-dlp-exec` paketi ilk kullanımda `yt-dlp` ikili dosyasını indirir.
- `ffmpeg-static` ffmpeg ikilisini birlikte getirir.

## Notlar ve İpuçları

- Önizleme için progressive (video+ses tek akış) format bulunamazsa oynatma mümkün olmayabilir; yine de dışa aktarım çalışır.
- “copy” codec seçimi, yeniden kodlama yapmadan mümkün olduğunda akışları birleştirir; trim noktaları GOP dışındaysa bazı konteynerlerde keyframe’e yuvarlama görülebilir. Kesin çerçeve kesimi istiyorsan yeniden kodlama (`libx264`, `libx265`, `libvpx-vp9`, `libaom-av1`) tercih edebilirsin.
- Yüksek çözünürlükler (1440p, 4K, 8K) tipik olarak ayrı video+ses akar; uygulama önce indirir, sonra birleştirir.
- Audio-only modunda konteyner/codec’e göre uzantı otomatik önerilir (m4a/mp3/ogg/flac/wav vs).

## Yol Haritası

- Timeline üzerinde thumbnail şeritleri (ffmpeg ile kare örnekleme).
- Bitrate/CRF ve preset gibi ileri ayarlar.
- Toplu indirme: kanal/playlist URL’sinden listeleme ve seçim.
- GPU encoder seçenekleri (h264_nvenc, hevc_nvenc, h264_qsv vb.) sistemde mevcutsa.
- Gelişmiş hata yönetimi ve log ekranı.

## Uyarı

Bu yazılımı yalnızca telif haklarına sahip olduğun içerikler ve ilgili platformların hizmet şartlarına uygun şekilde kullanmalısın. Hukuki sorumluluk kullanıcıya aittir.
