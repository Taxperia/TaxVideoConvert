# Contributing

TaxVideoConvert'e katkıda bulunmak için teşekkürler. Bu rehber, değişikliklerin daha kolay incelenmesi ve yayınlanması için kullanılır.

## Başlamadan Önce

- Node.js 18 veya üzeri kullanın.
- Bağımlılıkları kurun:

```powershell
npm install
```

- Uygulamayı geliştirme modunda çalıştırın:

```powershell
npm start
```

## Değişiklik Akışı

1. Repoyu fork edin veya yeni bir branch açın.
2. Değişikliği küçük ve anlaşılır tutun.
3. Gerekirse README veya ilgili dokümantasyonu güncelleyin.
4. Yerelde temel kontrolleri çalıştırın.
5. Pull request açın.

## Branch Adları

Önerilen branch adları:

```text
fix/video-preview-error
feat/export-settings
docs/release-guide
security/proxy-validation
```

## Commit Mesajları

Kısa ve açık commit mesajları kullanın:

```text
fix: handle proxy timeout
feat: add export preset setting
docs: update release instructions
```

## Build Kontrolü

Windows installer build kontrolü:

```powershell
npm run dist-win -- --publish never
```

## Repo'ya Eklenmemesi Gerekenler

Aşağıdaki dosya ve klasörleri commit etmeyin:

```text
node_modules/
dist/
.npm-cache/
*.log
vendor/ffmpeg/*.exe
```

Installer dosyaları GitHub Releases'a otomatik yüklenir. Code sekmesine build çıktıları eklenmemelidir.

## Issue Açmadan Önce

- Aynı sorun için mevcut issue var mı kontrol edin.
- Uygulama sürümünü, Windows sürümünü ve hatayı yeniden üretme adımlarını yazın.
- Güvenlik açığı bildiriyorsanız public issue açmak yerine `SECURITY.md` dosyasındaki süreci izleyin.

## Pull Request Beklentileri

- PR açıklamasında neyin değiştiğini yazın.
- Test veya build sonucunu belirtin.
- UI değişikliği varsa ekran görüntüsü ekleyin.
- İlgisiz refactor veya format değişikliği yapmayın.
