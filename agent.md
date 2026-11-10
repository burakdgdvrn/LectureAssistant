# LectureAssistant — Kök Dizin Agent Kılavuzu ve Çalışma Anayasası (`agent.md`)

> **ZORUNLU KURAL:** Bu projede görev alan her AI agent, herhangi bir kod veya doküman değişikliği yapmadan önce bu dosyadaki çalışma kurallarını okumak ve uygulamakla yükümlüdür. Amaç, her görevde tüm projeyi baştan taramak yerine yalnızca ilgili modülün dokümantasyonunu ve kodunu okuyarak hızlı, güvenli ve tutarlı geliştirme yapmaktır.

---

### 1. Klasörün Amacı

Kök dizin (`ROOT`), **LectureAssistant** projesinin üst düzey yönetim, mimari haritalama, ürün kapsamı ve tüm alt modüllerin koordinasyon merkezidir.
- Projenin üç seviyeli dokümantasyon sisteminin üst iki seviyesini ([`architecture.md`](./architecture.md) ve [`prd.md`](./prd.md)) ve genel agent kurallarını (`agent.md`) barındırır.
- Ortam değişkeni şablonunu ([`.env.example`](./.env.example)) ve versiyon kontrol güvenlik sınırlarını ([`.gitignore`](./.gitignore)) tanımlar.

---

### 2. İçerik Haritası

#### Kök Dizin Dosyaları
| Dosya | Görevi |
| :--- | :--- |
| [`architecture.md`](./architecture.md) | Projenin ana teknik haritası, modül sorumlulukları, veri akışı, bağımlılık yönleri ve "Nereye Bakmalıyım?" rehberi. |
| [`prd.md`](./prd.md) | Ürün Gereksinim Dokümanı: ürün vizyonu, P0/P1/P2 gereksinimleri, MVP sınırları, hata davranışları ve gizlilik ilkeleri. |
| [`agent.md`](./agent.md) | (Bu dosya) Kök dizin kılavuzu, agent çalışma protokolü, dokümantasyon güncelleme kuralları ve kök dizin değişiklik geçmişi. |
| [`.env.example`](./.env.example) | Harici AI sağlayıcıları ve uygulama ayarları için örnek ortam değişkeni şablonu (gerçek anahtar içermez). |
| [`.gitignore`](./.gitignore) | Gizli anahtarların (`.env`), yüklenen ses dosyalarının ve geçici çıktıların Git'e eklenmesini önleyen kurallar. |

#### Alt Klasörler (Modüller)
| Klasör | Kılavuz Dosyası | Özeti |
| :--- | :--- | :--- |
| `frontend/` | [`frontend/agent.md`](./frontend/agent.md) | Öğrenci kullanıcı arayüzü, zaman damgalı transkript ve ses oynatıcı etkileşimi. |
| `backend/` | [`backend/agent.md`](./backend/agent.md) | HTTP API katmanı, istek doğrulama ve modüller arası iş akışı orkestrasyonu. |
| `audio/` | [`audio/agent.md`](./audio/agent.md) | Ses dosyası doğrulama (format, boyut, süre) ve ön hazırlık işlemleri. |
| `transcription/` | [`transcription/agent.md`](./transcription/agent.md) | ASR servis çağrısı ve zaman damgalı `Transcript` normalizasyonu. |
| `chunking/` | [`chunking/agent.md`](./chunking/agent.md) | Transkript segmentlerini benzersiz `chunk_id` kimlikli `TranscriptChunk` parçalarına ayırma. |
| `retrieval/` | [`retrieval/agent.md`](./retrieval/agent.md) | Parçaların indekslenmesi ve soruya göre ilgili `TranscriptChunk` parçalarının bulunması (RAG). |
| `qa/` | [`qa/agent.md`](./qa/agent.md) | Kaynaklı soru-cevap, cevap verilememe (Abstention) ve `chunk_id` → zaman aralığı doğrulaması. |
| `study_materials/` | [`study_materials/agent.md`](./study_materials/agent.md) | P1 kapsamındaki Özet (Map-Reduce), Flashcard ve Quiz üretimi ve kaynak doğrulaması. |
| `providers/` | [`providers/agent.md`](./providers/agent.md) | Harici AI servis soyutlamaları (`providers/asr/` ve `providers/llm/`). |
| `storage/` | [`storage/agent.md`](./storage/agent.md) | Ses dosyalarının, geçici dosyaların ve transkript/chunk verilerinin saklanması. |
| `shared/` | [`shared/agent.md`](./shared/agent.md) | Ortak veri sözleşmeleri (`contracts.schema.json`), konfigürasyon, hata ve log yardımcıları. |
| `docs/` | [`docs/agent.md`](./docs/agent.md) | Mimari Karar Kayıtları (ADR) ve ek teknik tasarım belgeleri. |
| `tests/` | [`tests/agent.md`](./tests/agent.md) | İskelet doğrulama, sözleşme, birim ve entegrasyon testleri. |

---

### 3. Çalışma Mantığı (Agent Görev Yürütme Protokolü)

#### A. Yeni Bir Görev Geldiğinde İzlenecek 10 Adımlı Zorunlu Sıra
Her yeni görev veya hata bildiriminde **bütün projeyi baştan tarama**. Kesinlikle şu sırayı izle:

1. **Kök Kuralları Oku:** Bu dosyadaki (`ROOT/agent.md`) çalışma ve kalite kurallarını kontrol et.
2. **Modülü Tespit Et:** [`architecture.md`](./architecture.md) içindeki *"10. Nereye Bakmalıyım?"* tablosundan sorunun veya özelliğin hangi modülle ilgili olduğunu belirle.
3. **Ürün Kapsamını Doğrula:** [`prd.md`](./prd.md) dosyasından ilgili ürün gereksinimini ve öncelik seviyesini (P0/P1/P2) kontrol et.
4. **Hedef Klasör Kılavuzunu Oku:** Yalnızca ilgili klasörün `agent.md` dosyasını oku.
5. **Bağlı Kılavuzları Oku (Gerekirse):** Değişiklik başka bir modülle veri alışverişini etkiliyorsa, yalnızca o bağlı klasörlerin `agent.md` dosyalarını oku.
6. **Hedef Kodları İncele:** Yalnızca ihtiyaç duyduğun kod ve şema dosyalarını incele. İlgisiz modülleri okuma.
7. **Değişikliği Uygula:** Modüler sınırları ve veri sözleşmelerini bozmadan değişikliği kodla.
8. **Testleri Çalıştır:** İlgili birim/sözleşme testlerini ve `node --test tests/verify_skeleton.mjs` doğrulamasını çalıştır.
9. **Changelog Güncelle:** Değişiklik yaptığın tüm klasörlerin `agent.md` dosyalarındaki `7. Değişiklik Geçmişi (Changelog)` bölümünün **en üstüne** yeni kayıt ekle.
10. **Üst Belgeleri Güncelle (Gerekirse):** Klasör yapısı, veri akışı veya ürün gereksinimi değiştiyse `architecture.md` ve/veya `prd.md` dosyalarını güncelle.

> **Uyuşmazlık Kuralı:** Dokümantasyonda olmayan bir bilgiye ihtiyaç duyarsan ilgili kodu inceleyebilirsin. Kod ile dokümantasyon çelişiyorsa bunu tespit et ve dokümantasyonu gerçek uygulamaya göre düzelt.

---

### 4. Bağımlılıklar

Kök dizin tüm alt klasörlerin üst kapsayıcısıdır. Alt modüller arasındaki bağımlılık kuralları [`architecture.md`](./architecture.md) Bölüm 7'de tanımlanmıştır ve özetle:
- Tüm modüller [`shared/`](./shared/agent.md) içindeki veri sözleşmelerine bağımlı olabilir.
- Hiçbir alt modül [`frontend/`](./frontend/agent.md) veya [`backend/`](./backend/agent.md) katmanına tersine bağımlılık kuramaz.
- AI sağlayıcıları (`providers/asr/`, `providers/llm/`) iş mantığından izole edilmiştir; sağlayıcı değişimi diğer modülleri etkilememelidir.

---

### 5. Veri ve Arayüz Sözleşmeleri

Proje genelinde bağlayıcı olan 3 temel veri sözleşmesi kuralı vardır:

1. **Benzersiz `chunk_id` Zorunluluğu:** Her `TranscriptChunk` nesnesi benzersiz bir `chunk_id` taşır.
2. **Deterministik Zaman Damgası Çözümleme:** LLM hiçbir zaman doğrudan saniye/zaman damgası döndürmez; yalnızca `chunk_id` referanslarını döndürür. Gerçek `start_time` ve `end_time` değerleri uygulama tarafından `storage/` üzerinden çözümlenir.
3. **Kayıt Dışı Sorularda Cevap Vermeme (Abstention):** Ders kaydında bulunmayan bilgiler için `QAResponse.status = "unanswerable_from_recording"` döndürülür ve dış bilgi uydurulmaz.

Tüm veri yapılarının resmi şeması [`shared/contracts.schema.json`](./shared/contracts.schema.json) dosyasındadır.

---

### 6. Geliştirme Kuralları

#### A. Dokümantasyon Güncelleme Kuralları
- Yeni klasör veya modül oluşturulduğunda [`architecture.md`](./architecture.md) güncellenmelidir.
- Bir modülün sorumluluğu, dosyaları veya arayüz sözleşmesi değiştiğinde o klasörün `agent.md` dosyası güncellenmelidir.
- Yeni bir kullanıcı özelliği veya ürün gereksinimi kararlaştırıldığında [`prd.md`](./prd.md) güncellenmelidir.
- Her kod değişikliği ilgili klasörün `agent.md` dosyasındaki Changelog bölümünün **en üstüne** eklenmelidir. Eski kayıtlar asla silinmez veya sessizce değiştirilmez.
- Küçük bir iç kod düzenlemesi için etkilenmeyen klasörlerin belgeleri gereksiz yere değiştirilmemelidir.

#### B. Kodlama, Kalite ve Güvenlik Kuralları
- **Tek Sorumluluk:** Fonksiyon ve sınıflara tek bir net sorumluluk ver; gereksiz uzun dosyalardan ve kod tekrarından kaçın.
- **Sırların Korunması:** API anahtarları kesinlikle frontend koduna, loglara veya Git deposuna konulamaz; yalnızca sunucu tarafında ortam değişkenlerinden (`process.env` / `os.environ`) okunur.
- **Hata ve Timeout Yönetimi:** Tüm harici API çağrılarında zaman aşımı (timeout) tanımlanmalı ve hatalar kullanıcıya hassas detay sızdırmadan anlaşılır mesajlarla dönülmelidir.
- **Gizlilik:** Kullanıcı ses kayıtları ve transkriptler gereksiz yere saklanmamalı; yüklemelerde tür ve boyut doğrulaması yapılmalı; geçici dosyalar temizlenmelidir.
- **Dürüstlük:** Çalışmayan sahte (stub) implementasyonlar tamamlanmış özellik gibi gösterilmemeli; test edilmeyen kod tamamlanmış sayılmamalıdır.

#### C. Doğrulama Testini Çalıştırma
```powershell
node --test tests/verify_skeleton.mjs
```

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı LectureLens yerine LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Kullanıcı talebi doğrultusunda projenin adı tüm dokümantasyon (PRD, mimari harita, ADR, agent kılavuzları), yapılandırma dosyaları (.env.example, .gitignore) ve şema sözleşmelerinde (`contracts.schema.json`) LectureLens yerine LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `agent.md`, `architecture.md`, `prd.md`, `.env.example`, `.gitignore`, `shared/contracts.schema.json`, `docs/adr-001-modular-provider-and-citation-architecture.md`, `backend/agent.md`, `frontend/agent.md`, `providers/agent.md`, `qa/agent.md`, `shared/agent.md`, `tests/agent.md`
- **Neden yapıldı:** Proje isminin LectureAssistant olarak standardize edilmesi.
- **Teknik olarak nasıl uygulandı:** İlgili metinler, şema `$id`, `title` ve `description` alanları ile klasör içi referanslar güncellendi.
- **Diğer modüllere etkisi:** Tüm modüller LectureAssistant adını referans alır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` (7 test başarılı).

#### 2026-11-10 – LectureAssistant mimari temeli ve üç seviyeli dokümantasyon sistemi kuruldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Proje sıfırdan incelendi; modüler klasör yapısı, `architecture.md`, `prd.md`, kök ve alt klasör `agent.md` dosyaları, `.env.example`, `.gitignore`, kanonik veri sözleşmeleri (`shared/contracts.schema.json`), ilk mimari karar kaydı (`docs/adr-001`) ve iskelet doğrulama testleri (`tests/verify_skeleton.mjs`) oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `architecture.md`, `prd.md`, `agent.md`, `.env.example`, `.gitignore` ve tüm alt klasör `agent.md` dosyaları.
- **Neden yapıldı:** Uzun süre geliştirilebilir, sağlayıcı bağımsız ve başka AI agent'lar tarafından tüm projeyi taramaya gerek kalmadan yönetilebilir bir yazılım altyapısı kurmak için.
- **Teknik olarak nasıl uygulandı:** Sorumluluklarına göre ayrılmış 12 ana modül klasörü (ve `providers/` altında `asr/` ile `llm/` alt klasörleri) oluşturuldu; henüz kesinleşmemiş teknoloji kararları (dil, web framework, spesifik ASR/LLM sağlayıcısı) zorunlu tutulmadan JSON Schema tabanlı veri sözleşmeleriyle sınırlar belirlendi.
- **Diğer modüllere etkisi:** Tüm alt modüllerin sınırları ve başlangıç `agent.md` kılavuzları tanımlandı.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve tüm yapı/dokümantasyon/şema kontrolleri başarılı geçti.

