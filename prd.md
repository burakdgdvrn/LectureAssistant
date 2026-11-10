# LectureAssistant — Ürün Gereksinim Dokümanı (PRD)

> **Belge Amacı:** Bu doküman, **LectureAssistant** ürününün ne olduğunu, hangi kullanıcı problemini çözdüğünü, fonksiyonel ve fonksiyonel olmayan gereksinimlerini, MVP kapsamını ve gizlilik beklentilerini tanımlar. Teknik mimari ve kod organizasyonu kararlarından bağımsızdır; teknik detaylar için [`architecture.md`](./architecture.md) dosyasına bakılmalıdır.

---

## 1. LectureAssistant Nedir?

**LectureAssistant**, öğrencilerin ders ses kayıtlarını yükleyerek zaman damgalı metin transkriptleri elde etmesini, ders içeriği hakkında yalnızca o derste anlatılanlara dayalı sorular sormasını, verilen her cevabın dersin tam olarak hangi saniyesinden geldiğini görerek o bölümü doğrudan dinleyebilmesini ve ders içeriğinden özet, flashcard ile çoktan seçmeli quiz üretebilmesini sağlayan AI destekli bir ders çalışma asistanıdır.

### Temel Ürün Prensibi (Sıfır Halüsinasyon ve Kaynak Sadakati)
**Sistem, ders kaydında bulunmayan hiçbir bilgiyi biliyormuş gibi cevaplamamalıdır.**
- Üretilen her cevap ve çalışma materyali yalnızca yüklenen ders kaydındaki ifadelere dayanmalıdır.
- Öğrencinin sorduğu sorunun cevabı ders kaydında geçmiyorsa, sistem genel kültür veya harici model bilgisiyle boşluğu doldurmamalı; cevabın bu ders kaydında yer almadığını açıkça belirtmelidir.
- Gösterilen tüm zaman aralıkları gerçek ders kaydındaki doğrulanmış zaman damgalarına karşılık gelmelidir; sistem hiçbir koşulda tahmini veya uydurma zaman damgası göstermemelidir.

---

## 2. Hangi Problemi Çözmektedir?

Öğrenciler uzun ders kayıtlarını (45–180 dakikalık dersler, amfi kayıtları, çevrimiçi ders tekrarları) tekrar çalışırken şu temel sorunlarla karşılaşmaktadır:

1. **Zaman Kaybı ve Gezinme Zorluğu:** 2 saatlik bir ses kaydında belirli bir kavramın veya sınav ipucunun anlatıldığı 2 dakikalık bölümü bulmak için kaydı ileri-geri sarmak ciddi zaman kaybına yol açar.
2. **Genel Amaçlı AI Araçlarının Güvenilmezliği:** Öğrenciler standart sohbet botlarına soru sorduğunda, araçlar ders hocasının yaklaşımı veya derste işlenen kapsam yerine internetteki genel bilgileri verir; hatta bazen yanlış veya müfredat dışı bilgiler üretir.
3. **Kaynak Doğrulama Eksikliği:** Bir özet veya cevap üretildiğinde, öğrenci "Hoca gerçekten bunu böyle mi söyledi?" sorusunu doğrulamak için orijinal ses kaydındaki ilgili ana geri dönemez.
4. **Pasif Dinlemeden Aktif Çalışmaya Geçiş Güçlüğü:** Ham ses kaydını dinlemek pasif bir süreçtir; kayıttan çalışma kartları (flashcard), özet ve öz-değerlendirme soruları (quiz) çıkarmak manuel olarak saatler sürer.

---

## 3. Bu Ürün Neden Geliştirilmektedir?

LectureAssistant, ham ders ses kayıtlarını **aranabilir, doğrulanabilir ve etkileşimli bir çalışma kaynağına** dönüştürmek için geliştirilmektedir. Amaç, öğrenciye genel bir ansiklopedi sunmak değil; **yalnızca o dersin kaydına sadık kalan, her iddiasını ses kaydındaki gerçek zaman aralığıyla kanıtlayan** güvenilir bir çalışma asistanı sağlamaktır.

---

## 4. Hedef Kullanıcı Kimdir?

### Birincil Hedef Kitle
- **Üniversite ve Lise Öğrencileri:** Derslerini ses kaydına alan veya ders kayıtlarına erişimi olan, sınavlara hazırlanırken ders hocasının vurguladığı noktaları hızlıca bulmak, doğrulamak ve tekrar etmek isteyen öğrenciler.

### İkincil Hedef Kitle
- **Sertifika / Mesleki Eğitim Katılımcıları ve Araştırmacılar:** Uzun seminer, eğitim veya ders kayıtlarından yalnızca konuşmada geçen bilgilere dayalı notlar ve çalışma soruları çıkarmak isteyen bireyler.

### Kullanıcı Cihaz ve Ortam Varsayımları
- Kullanıcıların güçlü işlemciye, yüksek RAM kapasitesine veya harici GPU'ya sahip bilgisayarlar kullandığı **varsayılmaz**.
- Ürün, standart/düşük donanımlı dizüstü bilgisayarlarda dahi akıcı çalışabilmelidir.

---

## 5. Kullanıcının Temel İhtiyaçları Nelerdir?

1. **Hızlı Metne Dönüştürme:** Ses kaydını yükleyip konuşulanların zaman damgalı metnini görebilme.
2. **Derse Sadık Soru-Cevap:** "Hoca X konusunu nasıl tanımladı?" veya "Sınavda çıkacak dediği konular neler?" gibi sorulara yalnızca kayıt içeriğinden yanıt alabilme.
3. **Kanıt ve Sesli Doğrulama:** Verilen cevabın hangi konuşma bölümünden alındığını görme ve tek tıklamayla ses kaydını tam o saniyeden dinleyebilme.
4. **Dürüst Bilinmezlik Bildirimi:** Derste işlenmeyen bir konu sorulduğunda yanıltılmama; bilginin kayıtta olmadığının açıkça söylenmesi.
5. **Verimli Tekrar Materyalleri:** Uzun dersin yapılandırılmış özetini, önemli kavramlar için flashcard'ları ve kendini test etmek için çoktan seçmeli quiz sorularını hızlıca elde edebilme.

---

## 6. Ürünün Temel Kullanım Senaryoları (Use Cases)

| Senaryo Kodu | Senaryo Adı | Açıklama |
| :--- | :--- | :--- |
| **UC-01** | Ders Kaydı Yükleme ve Transkripsiyon | Öğrenci ders ses dosyasını yükler; sistem dosyayı doğrular ve zaman damgalı transkripti oluşturur. |
| **UC-02** | Kaynaklı Soru Sorma (Cevap Kayıtta Var) | Öğrenci dersle ilgili bir soru sorar; sistem yalnızca kayıttaki ilgili bölümlere dayanarak cevap verir ve ilgili konuşma kesitlerini zaman aralıklarıyla listeler. |
| **UC-03** | Kaynak Zaman Aralığından Ses Dinleme | Öğrenci cevabın altında gösterilen kaynak kartındaki zaman aralığına tıklar; ses oynatıcı doğrudan o saniyeye giderek ilgili bölümü oynatır. |
| **UC-04** | Kayıt Dışı Soru Sorma (Cevap Kayıtta Yok) | Öğrenci derste hiç bahsedilmemiş bir kavramı sorar; sistem kayıtta bu bilginin yer almadığını açıkça belirtir ve uydurma cevap üretmez. |
| **UC-05** | Ders Özeti Oluşturma (P1) | Öğrenci uzun bir ders kaydı için özet talep eder; sistem dersi bölümler halinde özetleyip kaynak referanslı bütünsel bir ders özeti sunar. |
| **UC-06** | Flashcard Üretimi (P1) | Öğrenci dersteki temel kavramları tekrar etmek için soru-cevap kartları oluşturur; her kart ilgili transkript kaynağına bağlanır. |
| **UC-07** | Çoktan Seçmeli Quiz Üretimi (P1) | Öğrenci sınava hazırlık için çoktan seçmeli test oluşturur; her sorunun doğru cevabı, açıklaması ve ders kaydındaki kaynak zaman aralığı gösterilir. |

---

## 7. Kullanıcı Ürünü Nasıl Kullanır? (Kullanıcı Yolculuğu)

1. **Yükleme ve Bilgilendirme:** Öğrenci uygulamayı açar, ses verisinin işleme amacıyla harici AI servislerine iletilebileceğine dair gizlilik bildirimini görür/onaylar ve ders ses dosyasını seçerek yükler.
2. **İşleme Takibi:** Sistem dosyayı doğrular, sesi metne dönüştürür ve soru-cevaba hazır hale getirir. Kullanıcı işlem durumunu adım adım ekranda görür.
3. **Transkript ve Ses İnceleme:** İşlem tamamlandığında öğrenci ekranın bir bölümünde ses oynatıcıyı ve zaman damgalı transkripti görür; istediği transkript satırına tıklayarak sesi o noktadan dinleyebilir.
4. **Soru-Cevap Etkileşimi:** Öğrenci soru kutusuna dersle ilgili sorusunu yazar:
   - Cevap kayıtta varsa: Yanıt metni ve yanıtın dayandığı konuşma parçaları (başlangıç-bitiş zaman damgaları ve alıntı metni ile) gösterilir.
   - Öğrenci kaynak zaman damgasına tıkladığında ses oynatıcı doğrudan ilgili saniyeden çalmaya başlar.
   - Cevap kayıtta yoksa: Sistem *"Bu sorunun cevabı yüklenen ders kaydında bulunmamaktadır."* şeklinde net bir bilgilendirme yapar.
5. **Çalışma Materyali Üretimi (P1):** Öğrenci dilerse aynı ders kaydı üzerinden "Özet Oluştur", "Flashcard Oluştur" veya "Quiz Oluştur" seçeneklerini kullanarak sınava hazırlık materyalleri üretir ve her materyalin dayandığı ders bölümünü zaman damgasıyla doğrular.

---

## 8. Fonksiyonel Gereksinimler ve Önceliklendirme

Özellikler üç öncelik seviyesinde sınıflandırılmıştır:
- **P0 (Zorunlu MVP Kapsamı):** İlk çalışan ürün sürümü için vazgeçilmez çekirdek özellikler.
- **P1 (MVP Sonrası Önemli Özellikler):** Çekirdek soru-cevap akışı doğrulandıktan hemen sonra eklenecek çalışma materyali özellikleri.
- **P2 (Gelecek Değerlendirmeler):** İlerleyen sürümlerde kullanıcı geri bildirimlerine göre değerlendirilecek özellikler.

### P0 — İlk Çalışan MVP İçin Zorunlu Gereksinimler

| Kod | Gereksinim | Kabul Kriteri |
| :--- | :--- | :--- |
| **FR-P0-01** | **Ses Dosyası Yükleme ve Doğrulama** | Kullanıcı yaygın ses formatlarındaki (örn. MP3, WAV, M4A, OGG) ders kayıtlarını yükleyebilmelidir. Desteklenmeyen dosya türü, boş dosya veya izin verilen boyut sınırını aşan dosyalar işleme alınmadan anlaşılır bir hata mesajıyla reddedilmelidir. |
| **FR-P0-02** | **Zaman Damgalı Transkripsiyon** | Yüklenen ses kaydı metne dönüştürülmeli ve her konuşma segmentinin başlangıç ve bitiş zamanı (`start_time`, `end_time`) korunmalıdır. |
| **FR-P0-03** | **Zaman Damgalı Transkript Görünümü** | Kullanıcı dönüştürülen ders metnini kronolojik sırayla ve zaman aralıklarıyla birlikte okuyabilmelidir. |
| **FR-P0-04** | **Ders Kaydına Dayalı Soru-Cevap (Grounded Q&A)** | Kullanıcı ders hakkında doğal dilde soru sorabilmeli ve sistem yalnızca ilgili ders kaydındaki bilgilere dayanarak cevap üretmelidir. |
| **FR-P0-05** | **Kaynak Parçalarının ve Gerçek Zaman Aralıklarının Gösterilmesi** | Üretilen her cevabın yanında, cevabın dayandığı transkript parçaları ve bu parçaların sistem tarafından doğrulanmış gerçek başlangıç/bitiş zaman damgaları gösterilmelidir. Sistem uydurma zaman damgası göstermemelidir. |
| **FR-P0-06** | **İlgili Ses Bölümüne Doğrudan Erişim** | Kullanıcı bir cevabın kaynağındaki zaman aralığını seçtiğinde, ses oynatıcı doğrudan o zaman aralığına konumlanmalı ve kaydı oradan oynatabilmelidir. |
| **FR-P0-07** | **Kaynakta Bulunmayan Sorulara Cevap Vermeme (Abstention)** | Sorulan sorunun cevabı ders kaydında yer almıyorsa veya kayıttaki bilgi soruyu yanıtlamak için yetersizse, sistem tahmin yürütmemeli veya harici bilgi kullanmamalı; bilginin ders kaydında bulunmadığını açıkça bildirmelidir. |

### P1 — MVP Sonrasında Geliştirilecek Önemli Gereksinimler

| Kod | Gereksinim | Kabul Kriteri |
| :--- | :--- | :--- |
| **FR-P1-01** | **Ders Özeti Üretimi (Map-Reduce)** | Uzun ders kayıtları anlamlı bölümlere ayrılarak özetlenmeli ve sonuçlar birleştirilerek dersin bütünsel özeti oluşturulmalıdır. Özetteki ana başlıklar ilgili ders zaman aralıklarına referans vermelidir. |
| **FR-P1-02** | **Flashcard (Soru-Cevap Kartları) Üretimi** | Ders içeriğindeki önemli kavram, tanım ve ilişkilerden ön yüz (soru/kavram) ve arka yüz (cevap/açıklama) içeren çalışma kartları üretilmeli; her kart doğrulanan kaynak zaman aralığıyla ilişkilendirilmelidir. |
| **FR-P1-03** | **Çoktan Seçmeli Quiz Üretimi** | Ders içeriğinden çoktan seçmeli sorular, seçenekler, doğru cevap, çözüm açıklaması ve bilginin geçtiği kaynak zaman aralığı üretilmelidir. |
| **FR-P1-04** | **Çalışma Materyallerinde Kaynak Doğrulaması** | Özet, flashcard ve quiz üretiminde de soru-cevap modülündekiyle aynı kaynak doğrulama kuralı geçerli olmalı; kaynağı doğrulanamayan veya kayıtta bulunmayan içerik kullanıcıya sunulmamalıdır. |

### P2 — İleride Değerlendirilebilecek Özellikler

| Kod | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-P2-01** | **Yerel (Offline) Model Çalıştırma** | İnternet bağlantısı veya harici API kullanmak istemeyen ve yeterli donanıma sahip kullanıcılar için yerel ASR/LLM çalıştırma seçeneği. |
| **FR-P2-02** | **Çoklu Ders Kütüphanesi ve Klasörleme** | Öğrencinin dönem boyunca farklı derslere ait kayıtları ders bazında gruplayıp saklayabilmesi. |
| **FR-P2-03** | **Dışa Aktarma (Export)** | Transkript, özet, flashcard ve quiz içeriklerinin Markdown, PDF veya Anki formatında dışa aktarılması. |
| **FR-P2-04** | **Konuşmacı Ayrımı (Speaker Diarization)** | Kayıttaki eğitmen ve öğrenci konuşmalarının farklı konuşmacılar olarak ayrıştırılması. |

---

## 9. Fonksiyonel Olmayan Gereksinimler (NFR)

1. **Kaynak Doğruluğu ve İzlenebilirlik:** Sistemde gösterilen hiçbir zaman damgası AI modeli tarafından serbest metin olarak üretilmemeli; her zaman damgası benzersiz parça kimliği (`chunk_id`) üzerinden sistem verisinden deterministik olarak çözümlenmelidir.
2. **Düşük İstemci Donanım İhtiyacı:** Ağır ses işleme ve dil modeli çıkarımları varsayılan olarak API tabanlı servisler üzerinden yürütülmeli; kullanıcı cihazında yüksek CPU/GPU/RAM tüketimi oluşturulmamalıdır.
3. **Sağlayıcı Bağımsızlığı:** Ürün deneyimi tek bir ticari AI sağlayıcısına bağımlı olmamalı; alttaki ASR veya LLM servisi değiştiğinde kullanıcının gördüğü işlevsellik ve veri doğrulaması aynı kalmalıdır.
4. **Anlaşılır Geri Bildirim:** Uzun sürebilecek ses yükleme ve transkripsiyon işlemlerinde kullanıcıya işlemin devam ettiği ve hangi aşamada olduğu net biçimde gösterilmelidir.
5. **Güvenlik:** Harici servis API anahtarları hiçbir koşulda kullanıcı tarayıcısına/istemcisine gönderilmemelidir.

---

## 10. MVP Kapsamı (P0 Sınırları)

MVP sürümü, **tek bir ders ses kaydının uçtan uca yüklenmesi, zaman damgalı transkripte dönüştürülmesi, kayıt üzerinden kaynak doğrulanmış soru-cevap yapılması, kaynak zaman aralığından sesin dinlenmesi ve kayıtta olmayan soruların reddedilmesi** akışını kapsar.

MVP'nin tamamlanmış sayılması için:
- Öğrenci ses dosyasını yükleyip transkripti zaman damgalarıyla görebilmeli,
- Soru sorduğunda yalnızca kayda dayalı cevap ve tıklanabilir/oynatılabilir doğru zaman aralıkları alabilmeli,
- Kayıtta olmayan bir soru sorduğunda sistem bilgi uydurmadan bunu reddedebilmelidir.

---

## 11. İlk Sürümde (MVP) Yapılmayacak Özellikler (Out-of-Scope)

Aşağıdaki özellikler P0 MVP kapsamı **dışındadır** ve ilk sürümde geliştirilmeyecektir:
- Canlı (gerçek zamanlı) ders dinleme ve anlık transkripsiyon.
- Video görüntü analizi veya slayt/tahta OCR okuma.
- Kullanıcı hesap sistemi, çok kullanıcılı yetkilendirme, abonelik ve ödeme altyapısı.
- Dersler arası çapraz arama (birden fazla kaydı aynı anda sorgulama).
- Mobil yerel (native iOS/Android) uygulama.
- Yerel (on-device) büyük dil modeli veya yerel ASR kurulumu (P2 kapsamında değerlendirilecektir).
- P1 kapsamındaki Özet, Flashcard ve Quiz özellikleri (P0 tamamlandıktan sonra ele alınacaktır).

---

## 12. Ürünün Başarı Kriterleri

1. **Sıfır Uydurma Zaman Damgası (%100 Kaynak Kimliği Doğrulaması):** Kullanıcıya gösterilen her kaynak referansının gerçek bir transkript parçasına (`chunk_id`) ve gerçek bir ses zaman aralığına karşılık gelmesi.
2. **Kayıt Dışı Sorularda Doğru Reddetme (Abstention) Başarısı:** Ders kaydında cevabı bulunmayan kontrol sorularında sistemin dış bilgi kullanmadan "kayıtta bulunmuyor" yanıtı vermesi.
3. **Ses-Kaynak Senkronizasyonu:** Kaynak kartındaki zaman aralığına tıklandığında ses oynatıcının ilgili konuşma kesitini doğru saniye aralığından başlatması.
4. **Düşük Donanım Erişilebilirliği:** Standart bir öğrenci bilgisayarında yerel GPU gerektirmeden tüm akışın tamamlanabilmesi.

---

## 13. Hata ve Başarısızlık Durumlarında Sistem Davranışı

| Durum | Beklenen Sistem Davranışı |
| :--- | :--- |
| **Geçersiz Dosya Türü veya Aşırı Boyut** | Yükleme aşamasında işlemi durdurur; desteklenen formatları ve maksimum dosya boyutunu belirten açık bir uyarı gösterir. |
| **Bozuk, Sessiz veya Anlaşılamayan Ses Kaydı** | Transkripsiyon boş veya anlamsız dönerse, ses kaydında anlaşılır konuşma tespit edilemediğini kullanıcıya bildirir; boş transkript üzerinden soru-cevap başlatmaz. |
| **Harici AI Sağlayıcı Hatası / Zaman Aşımı (Timeout)** | Kullanıcıya teknik yığın izi (stack trace) veya API anahtarı bilgisi sızdırmadan, servisin geçici olarak yanıt veremediğini ve tekrar denenebileceğini bildirir. |
| **Cevabı Kayıtta Olmayan Soru** | Hata fırlatmaz; normal bir yanıt durumu olarak sorunun cevabının bu ders kaydında yer almadığını açıkça belirtir. |
| **Modelin Geçersiz Kaynak Kimliği Döndürmesi** | Sistem doğrulanamayan kaynak kimliğini reddeder; eğer geçerli hiçbir kaynak kalmazsa cevabı güvenli biçimde "kayıttan doğrulanamadı" durumuna düşürür. |

---

## 14. Gizlilik ve Kullanıcı Verileri Açısından Beklentiler

Ders ses kayıtları ve transkriptler kullanıcılara ve eğitim kurumlarına ait hassas içeriklerdir:

1. **Şeffaf Harici Servis Bildirimi ve Onay:** Ses kayıtlarının metne dönüştürülmek üzere harici ASR API servislerine ve transkript parçalarının cevap/materyal üretimi için harici LLM API servislerine gönderilebileceği kullanıcıya açıkça belirtilmeli ve işlem öncesinde kullanıcı onayı alınmalıdır.
2. **Minimum Veri Saklama (Data Minimization):** Kullanıcı verileri yalnızca ders çalışma işlevini yerine getirmek için gerekli olduğu sürece saklanmalıdır.
3. **Geçici Dosyaların ve Kayıtların Silinmesi:** İşleme sırasında oluşan geçici ses parçaları işlem bitiminde temizlenmeli; kullanıcı istediğinde yüklediği ses kaydını ve üretilen tüm transkript/çalışma verilerini sistemden tamamen silebilmelidir.
4. **Log Güvenliği:** Uygulama loglarında hiçbir koşulda API anahtarları, kimlik bilgileri veya kullanıcıların tam ders transkriptleri/ses içerikleri düz metin olarak kaydedilmemelidir.
5. **İstemci Güvenliği:** Harici AI servis anahtarları yalnızca sunucu (backend) ortam değişkenlerinde tutulmalı, istemci (frontend) koduna veya ağ yanıtlarına asla dahil edilmemelidir.

