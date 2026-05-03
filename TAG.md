# Repository Topics Rehberi

Bu dosya GitHub'daki repo "Topics" alaninda kullanilacak arama etiketlerini listeler.

GitHub topics, projenin aramada daha iyi bulunmasini saglar. Ornek: `mp4`, `nodejs`, `electron`, `ffmpeg`.

## Onerilen topics

Bu proje icin onerilen GitHub topics:

```text
mp4
video-converter
electron
nodejs
ffmpeg
yt-dlp
youtube
video-editing
desktop-app
windows
media-tools
webm
mkv
h264
hevc
av1
video-export
open-source
nsis
electron-builder
```

## En onemli 10 topic

GitHub aramalarinda daha sade gorunmesi icin once sunlari kullanmak yeterlidir:

```text
mp4
video-converter
electron
nodejs
ffmpeg
yt-dlp
youtube
desktop-app
windows
video-editing
```

## GitHub'da manuel ekleme

1. GitHub'da repo sayfasini acin.
2. Sag tarafta veya repo ust kisminda "About" bolumundeki disli ikonuna tiklayin.
3. "Topics" alanina etiketleri tek tek yazin.
4. "Save changes" ile kaydedin.

## GitHub CLI ile ekleme

Bilgisayarda GitHub CLI (`gh`) kuruluysa:

```powershell
gh repo edit Taxperia/TaxVideoConvert `
  --add-topic mp4 `
  --add-topic video-converter `
  --add-topic electron `
  --add-topic nodejs `
  --add-topic ffmpeg `
  --add-topic yt-dlp `
  --add-topic youtube `
  --add-topic desktop-app `
  --add-topic windows `
  --add-topic video-editing
```

## Not

Bu dosyadaki liste sadece referanstir. GitHub topics alanini degistirmek icin GitHub arayuzunden kaydetmek veya `gh repo edit` komutunu calistirmak gerekir.
