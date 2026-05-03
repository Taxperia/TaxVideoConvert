# Surum ve Tag Rehberi

Bu proje GitHub Actions ile tag uzerinden otomatik release alacak sekilde ayarlanmistir.

## Tag formati

Tag adlari semantik surum formatinda olmalidir:

```text
vMAJOR.MINOR.PATCH
```

Ornekler:

```text
v1.0.9
v1.0.10
v1.1.0
v2.0.0
```

## Mevcut surum

Projenin mevcut `package.json` surumu:

```text
1.0.9
```

Bu surum icin tag:

```text
v1.0.9
```

## Yeni release cikarma

Patch surum icin:

```powershell
npm version patch
git push origin main --tags
```

Minor surum icin:

```powershell
npm version minor
git push origin main --tags
```

Major surum icin:

```powershell
npm version major
git push origin main --tags
```

## Ne olur?

`v*` formatinda tag GitHub'a gonderildiginde:

1. GitHub Actions Windows ortaminda projeyi kurar.
2. `npm run dist-win -- --publish never` komutu ile installer uretir.
3. GitHub Release olusturur veya mevcut release'i gunceller.
4. `dist/*.exe`, `dist/*.exe.blockmap` ve `dist/latest.yml` dosyalarini Release'e yukler.
5. GitHub kaynak kod arsivlerini otomatik ekler:
   - `Source code (zip)`
   - `Source code (tar.gz)`

## Dikkat edilmesi gerekenler

- `package.json` surumu ile tag adi ayni olmalidir.
- `dist/`, `node_modules/` ve `.npm-cache/` repo'ya eklenmemelidir.
- Installer dosyalari Code sekmesine degil, Releases sekmesine yuklenir.
- Kaynak kod dosyalari Code sekmesine `git add`, `git commit`, `git push` ile gider.
