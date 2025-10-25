# 📚 BookProject

React Native ve Expo ile oluşturulmuş kapsamlı bir kitap okuma ve dil öğrenme uygulaması. Bu uygulama, kullanıcıların çeşitli yeterlilik seviyelerindeki İngilizce kitapları okuyabilmelerini, okuma ilerlemelerini takip etmelerini, kişisel kitap koleksiyonlarını yönetmelerini ve sözlük ve çevirici gibi entegre dil araçlarını kullanabilmelerini sağlar.

## ✨ Özellikler

### 📖 Kitap Yönetimi
- **Kitaplara Göz Atın**: CEFR seviyelerine göre kategorize edilmiş (A1-C2) seçkin İngilizce kitap koleksiyonunu keşfedin
- **İndirin ve Çevrimdışı Okuyun**: Kitapları çevrimdışı erişim ve sorunsuz okuma deneyimi için indirin
- **Okuma İlerlemesini Takip Edin**: Her kitap için okuma ilerlemenizi otomatik olarak kaydedin ve takip edin
- **Kişisel Kitaplığınız**: Koleksiyona kendi kitaplarınızı ekleyin

### 🔍 Keşif ve Arama
- **Arama İşlevselliği**: Kitap başlığı veya yazara göre arama yapın
- **Seviye Filtreleme**: Yeterlilik seviyelerine göre kitapları filtreleyin
- **Favoriler Sistemi**: Favori kitaplarınızı işaretleyin ve organize edin

### 🛠️ Dil Öğrenme Araçları
- **Entegre Sözlük**: Okurken kelime tanımları için anında arama yapın
- **Çevirici**: Metin parçalarını anında çevirin
- **Kart Oyunu**: Etkileşimli kart oyunları ile kelime dağarcığınızı pratik edin

### 👤 Kullanıcı Özellikleri
- **Kimlik Doğrulama**: Firebase Kimlik Doğrulama ve Google Giriş ile güvenli giriş
- **Profil Yönetimi**: Şifreyi değiştirin ve hesap ayarlarınızı yönetin
- **Koyu Mod Desteği**: Açık ve koyu temalar arasında geçiş yapın
- **Çok Dilli Arayüz**: İngilizce, Türkçe, Almanca, İspanyolca, Fransızca ve İtalyanca desteği

### 📱 Platform Desteği
- **iOS ve Android**: Yerel mobil uygulama deneyimi
- **Web Desteği**: Tarayıcı erişimi için web sürümü mevcut
- **Cihazlar Arası Senkronizasyon**: Kitaplarınıza ve ilerlemenize cihazlar arasında erişim sağlayın

## 🚀 Başlarken

### Ön Gereksinimler
- Node.js (sürüm 18 veya üstü)
- npm veya yarn
- Expo CLI
- Git

### Kurulum

1. **Depoyu klonlayın**
   ```bash
   git clone https://github.com/kullaniciadiniz/BookProject.git
   cd BookProject
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   # veya
   yarn install
   ```

3. **Firebase'i yapılandırın**
   - [Firebase Konsolu](https://console.firebase.google.com/) üzerinde bir Firebase projesi oluşturun
   - `google-services.json` dosyanızı indirin ve `src/` dizinine yerleştirin
   - Yapılandırmadaki Firebase API anahtarlarını güncelleyin

4. **Ortamı yapılandırın**
   - İlgili yapılandırma dosyalarındaki sunucu API uç noktalarınızı ayarlayın

5. **Geliştirme sunucusunu başlatın**
   ```bash
   npm start
   # veya
   yarn start
   ```

6. **Cihazlarda çalıştırın**
   - **iOS**: `npm run ios`
   - **Android**: `npm run android`
   - **Web**: `npm run web`
   - **Expo Go Uygulaması**: Telefonunuzda Expo Go ile QR kodu tarayın

## 📁 Proje Yapısı

```
BookProject/
├── App.js                     # Ana uygulama bileşeni
├── app.json                   # Expo yapılandırması
├── babel.config.js           # Babel yapılandırması
├── src/
│   └── google-services.json   # Firebase yapılandırması
│   └── SQLiteService.js      # Yerel veritabanı servisi
├── atomics/
│   ├── screens/              # Ekran bileşenleri
│   ├── api/                  # API fonksiyonları
│   ├── utils/                # Yardımcı fonksiyonlar
│   └── data/                 # Statik veriler
├── components/               # Yeniden kullanılabilir bileşenler
├── securestore/              # Güvenli depolama yardımcıları
├── styles/                   # Stil sabitleri
└── assets/                   # Görseller ve simgeler
```

## 🛠️ Teknoloji Yığını

### Temel Teknolojiler
- **React Native 0.74.5** - Çapraz platform mobil geliştirme
- **Expo 51** - React Native uygulamalarını oluşturma ve dağıtım
- **React Navigation** - Navigasyon ve yönlendirme

### Backend ve Veritabanı
- **Firebase Kimlik Doğrulama** - Kullanıcı kimlik doğrulaması
- **Async Storage** -İstemci tarafı veri depolama
- **SQLite** - Çevrimdışı işlevsellik için yerel veritabanı

### UI ve UX
- **Expo Vector Icons** - Simgeler kütüphanesi
- **React Native Reanimated** - Yumuşak animasyonlar
- **Linear Gradient** - Görsel geliştirmeler

### API ve Ağ
- **Axios** - HTTP istemcisi
- **Expo Secure Store** - Güvenli token depolama

### Uluslararasılaştırma ve Yardımcılar
- **i18n-js** - Çoklu dil desteği
- **Expo Localization** - Cihaz yerel ayar tespiti

### Doküman ve Medya
- **Expo Document Picker** - Dosya seçimi
- **Expo Sharing** - İçerik paylaşımı
- **React Native Blob Util** - İkili veri işleme
- **React Native PDF** - PDF görüntüleyici
- **Expo Speech** - Metin okuma işlevi

## 🙏 Teşekkürler

- Expo ve React Native ile oluşturulmuştur
- Backend servisleri için Firebase

## 📞 İletişim

unluu.denizz@gmail.com
---

**Mutlu okumalar! 📖✨**
