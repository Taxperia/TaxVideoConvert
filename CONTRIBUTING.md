# Contributing

TaxVideoConvert'e katkida bulunmak icin tesekkurler. Bu rehber, degisikliklerin daha kolay incelenmesi ve yayinlanmasi icin kullanilir.

## Baslamadan once

- Node.js 18 veya uzeri kullanin.
- Bagimliliklari kurun:

```powershell
npm install
```

- Uygulamayi gelistirme modunda calistirin:

```powershell
npm start
```

## Degisiklik akisi

1. Repoyu fork edin veya yeni bir branch acin.
2. Degisikligi kucuk ve anlasilir tutun.
3. Gerekirse README veya ilgili dokumantasyonu guncelleyin.
4. Yerelde temel kontrolleri calistirin.
5. Pull request acin.

## Branch adlari

Onerilen branch adlari:

```text
fix/video-preview-error
feat/export-settings
docs/release-guide
security/proxy-validation
```

## Commit mesajlari

Kisa ve acik commit mesajlari kullanin:

```text
fix: handle proxy timeout
feat: add export preset setting
docs: update release instructions
```

## Build kontrolu

Windows installer build kontrolu:

```powershell
npm run dist-win -- --publish never
```

## Repo'ya eklenmemesi gerekenler

Asagidaki dosya ve klasorleri commit etmeyin:

```text
node_modules/
dist/
.npm-cache/
*.log
vendor/ffmpeg/*.exe
```

Installer dosyalari GitHub Releases'a otomatik yuklenir. Code sekmesine build ciktilari eklenmemelidir.

## Issue acmadan once

- Ayni sorun icin mevcut issue var mi kontrol edin.
- Uygulama surumunu, Windows surumunu ve hatayi yeniden uretme adimlarini yazin.
- Guvenlik acigi bildiriyorsaniz public issue acmak yerine `SECURITY.md` dosyasindaki sureci izleyin.

## Pull request beklentileri

- PR aciklamasinda neyin degistigini yazin.
- Test veya build sonucunu belirtin.
- UI degisikligi varsa ekran goruntusu ekleyin.
- Ilgisiz refactor veya format degisikligi yapmayin.
