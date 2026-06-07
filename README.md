# ⚡ VoltHub — EEE Bilgi Merkezi

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-blueviolet?style=flat)

**VoltHub**, Elektrik-Elektronik Mühendisliği öğrencileri için geliştirilmiş, kâr amacı gütmeyen, topluluk odaklı bir bilgi merkezi ve interaktif mühendislik aracıdır. Öğrencilerin ders notlarını, geçmiş sınavlarını ve formül listelerini paylaşabilmesini sağlarken, aynı zamanda laboratuvar ve ödevlerde sıkça ihtiyaç duyulan teknik hesaplamaları tek bir platformda sunar.


## 🚀 Öne Çıkan Özellikler

* **📚 Geniş Kaynak Arşivi:** Ders notları, sınavlar, kitap özetleri ve formül kağıtları. Ders koduna veya kategoriye göre hızlı filtreleme.
* **🧮 İnteraktif Hesaplayıcılar:**
    * Ohm Yasası ve Güç Hesaplayıcı
    * 4, 5 ve 6 Bantlı Direnç Renk Kodu Çözücü
    * Seri & Paralel Direnç Eşdeğer Hesaplayıcı
    * Reaktans ve Rezonans (XL, XC) Hesaplayıcı
    * GANO (GPA) Hesaplayıcı
* **📥 İstek Panosu:** Öğrencilerin bulamadıkları materyalleri talep edebileceği ve diğerlerinin bu talepleri karşılayabileceği bir sistem.
* **🏅 Topluluk ve Liderlik Tablosu:** Yükleme, indirme ve beğenilere dayalı puanlama sistemiyle en çok katkı sağlayanların listelenmesi.
* **📱 PWA Desteği:** Masaüstü veya mobil cihazlara bir uygulama gibi yüklenebilir ve Service Worker sayesinde hızlı çalışır.
* **🌓 Tema Desteği:** Kullanıcı tercihine göre Aydınlık (Light) ve Karanlık (Dark) mod.

## 🛠️ Kullanılan Teknolojiler

* **Frontend:** Vanilla HTML5, CSS3, JavaScript (Tek dosya mimarisi - Single File Architecture)
* **Backend & Veritabanı:** Supabase (PostgreSQL, Authentication, Storage)
* **Hosting:** GitHub Pages
* **Mimari:** Progressive Web App (PWA)

## ⚙️ Kurulum ve Geliştirme

Proje tamamen statik frontend dosyalarından oluştuğu için yerel ortamda çalıştırmak çok kolaydır:

1.  Projeyi bilgisayarına klonla:
    ```bash
    git clone [https://github.com/YusufUzun03/volthub.git](https://github.com/YusufUzun03/volthub.git)
    ```
2.  Proje dizinine gir:
    ```bash
    cd volthub
    ```
3.  Herhangi bir yerel web sunucusu ile `index.html` dosyasını çalıştır. (Örn: VS Code Live Server eklentisi veya Python):
    ```bash
    python -m http.server 8000
    ```
4.  Tarayıcında `http://localhost:8000` adresine git.

*(Not: Sistemin veritabanı ve kimlik doğrulama özellikleri, yapılandırılmış bir Supabase projesi gerektirir. Canlı sistem mevcut Supabase projesine bağlı olarak çalışmaktadır.)*

## 🤝 Katkıda Bulunma

Hata bildirimleri, yeni özellik önerileri (örneğin yeni bir hesaplayıcı modülü) veya tasarım iyileştirmeleri için **Pull Request** açmaktan veya **Issue** oluşturmaktan çekinmeyin.

## 👨‍💻 Geliştirici

**Yusuf Uzun**
Elektrik-Elektronik Mühendisliği Öğrencisi
* [GitHub Profilim](https://github.com/YusufUzun03)
