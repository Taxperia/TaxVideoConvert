!include "MUI2.nsh"

; Dil seçimi diyalogunu etkinleştir
!define MUI_LANGDLL_ALLLANGUAGES
!insertmacro MUI_RESERVEFILE_LANGDLL

; Seçimi hatırla (opsiyonel)
!define MUI_LANGDLL_REGISTRY_ROOT "HKCU"
!define MUI_LANGDLL_REGISTRY_KEY "Software\\TaxVideoConvert"
!define MUI_LANGDLL_REGISTRY_VALUENAME "InstallerLanguage"

; DİKKAT: Burada MUI_LANGUAGE makroları YOK.
; Diller electron-builder tarafından installerLanguages ile eklenecek.

; Her dil için lisans dosyası (sayısal dil kimliği)
; 1055 = Turkish (Türkiye), 1033 = English (United States)
LicenseLangString MUILicense 1055 "${BUILD_RESOURCES_DIR}\license_tr.rtf"
LicenseLangString MUILicense 1033 "${BUILD_RESOURCES_DIR}\license_en.rtf"

; Kurulum başında dil seçim penceresi
!macro preInit
  !insertmacro MUI_LANGDLL_DISPLAY
!macroend

; Çok dilli lisans sayfasını ekle
!insertmacro MUI_PAGE_LICENSE "$(MUILicense)"