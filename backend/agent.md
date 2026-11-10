# `backend/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`backend/` klasörü, **LectureAssistant** sunucu uygulamasının giriş noktasını (entry point), HTTP API uç noktalarını (endpoints), istek/yanıt doğrulamasını ve alt domain modülleri (`audio/`, `transcription/`, `chunking/`, `retrieval/`, `qa/`, `study_materials/`, `storage/`) arasındaki **iş akışı orkestrasyonunu** barındırır.
- Kendi içinde ses işleme, metin parçalama veya AI prompt mantığı barındırmaz; yalnızca modülleri doğru sırayla koordine eder ve `frontend/` ile HTTP/JSON üzerinden konuşur.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, API uç nokta sözleşmeleri ve değişiklik geçmişi. |

*(Not: Sunucu framework seçimi kesinleştiğinde `app` (giriş noktası), `routes` (API uç noktaları) ve `orchestrators` (ingestion ve Q&A akış koordinatörleri) bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. **Ders Yükleme ve Hazırlama Orkestrasyonu (`POST /api/lectures`):**
   - Yüklenen dosyayı [`audio/`](../audio/agent.md) ile doğrular.
   - Dosyayı ve `Lecture` kaydını [`storage/`](../storage/agent.md) ile saklar.
   - [`transcription/`](../transcription/agent.md) ile zaman damgalı `Transcript` üretir.
   - [`chunking/`](../chunking/agent.md) ile benzersiz `chunk_id` kimlikli `TranscriptChunk[]` parçalarını oluşturur.
   - Parçaları [`storage/`](../storage/agent.md) içine kaydeder ve [`retrieval/`](../retrieval/agent.md) içinde indeksler.
2. **Kaynaklı Soru-Cevap Orkestrasyonu (`POST /api/lectures/:lecture_id/qa`):**
   - [`retrieval/`](../retrieval/agent.md) üzerinden soruya uygun aday `TranscriptChunk[]` parçalarını getirir.
   - [`qa/`](../qa/agent.md) modülünü çağırarak kaynak doğrulanmış `QAResponse` (veya `unanswerable_from_recording`) yanıtını oluşturur ve istemciye döndürür.
3. **Ses Akışı ve Silme (`GET /api/lectures/:lecture_id/audio`, `DELETE /api/lectures/:lecture_id`):**
   - İstemcinin belirli bir zaman aralığından (`start_time`) ses dinleyebilmesi için ses akışı sunar ve talep edildiğinde ders verilerini tamamen siler.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md)
  - [`audio/`](../audio/agent.md)
  - [`transcription/`](../transcription/agent.md)
  - [`chunking/`](../chunking/agent.md)
  - [`retrieval/`](../retrieval/agent.md)
  - [`qa/`](../qa/agent.md)
  - [`study_materials/`](../study_materials/agent.md)
  - [`storage/`](../storage/agent.md)
  - [`providers/`](../providers/agent.md) *(yalnızca başlangıçta bağımlılık enjeksiyonu / provider kaydı için)*
- **Bu klasöre bağımlı olan modüller:**
  - [`frontend/`](../frontend/agent.md) *(yalnızca HTTP API üzerinden, kod importu olmadan)*.
- **Yasaklı bağımlılıklar:** `backend/` hiçbir zaman `frontend/` kodunu import etmez.

---

### 5. Veri ve Arayüz Sözleşmeleri

Planlanan temel HTTP API sözleşmeleri ([`shared/contracts.schema.json`](../shared/contracts.schema.json) modellerini taşır):

| Metod ve Yol | Amaç | İstek Gövdesi | Yanıt Modeli |
| :--- | :--- | :--- | :--- |
| `POST /api/lectures` | Ders ses dosyası yükle ve işle | `multipart/form-data (file, title)` | `Lecture` + `Transcript` |
| `GET /api/lectures/:id` | Ders durumu ve transkript bilgisi | - | `Lecture` + `Transcript` |
| `GET /api/lectures/:id/audio` | Zaman aralığına duyarlı ses akışı | `Range` başlığı | Ses akışı (`audio/*`) |
| `POST /api/lectures/:id/qa` | Ders kaydına dayalı soru sor | `{ "question": "..." }` | `QAResponse` |
| `POST /api/lectures/:id/summary` | (P1) Ders özeti üret | - | `SummaryResult` |
| `POST /api/lectures/:id/flashcards` | (P1) Flashcard üret | - | `Flashcard[]` |
| `POST /api/lectures/:id/quiz` | (P1) Çoktan seçmeli quiz üret | - | `QuizQuestion[]` |
| `DELETE /api/lectures/:id` | Ders kaydını ve verilerini sil | - | `{ "deleted": true }` |

Tüm hata yanıtları `StandardError` (`error_code`, `user_message`, `retryable`) şemasına uymalıdır.

---

### 6. Geliştirme Kuralları

1. **İnce Controller / Orkestratör Prensibi:** Route handler (endpoint) fonksiyonları içinde doğrudan metin bölme, prompt oluşturma veya SQL/dosya işlemleri yapılmamalıdır; ilgili domain modülü çağrılmalıdır.
2. **Merkezi Hata Yakalama:** Yakalanmayan tüm istisnalar merkezi middleware tarafından yakalanmalı, hassas bilgiler loglardan arındırılmalı ve istemciye `StandardError` olarak dönülmelidir.
3. **Sırların Sızdırılmaması:** Hiçbir endpoint yanıtında sunucu ortam değişkenleri veya API anahtarları yer almamalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Dokümantasyondaki proje adı referansı LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `backend/agent.md`
- **Neden yapıldı:** Proje genelindeki isimlendirme güncellemesi.
- **Teknik olarak nasıl uygulandı:** İlgili metin referansı güncellendi.
- **Diğer modüllere etkisi:** Yok.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs`

#### 2026-11-10 – `backend/` orkestrasyon klasörü ve HTTP API sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `backend/` klasörü oluşturuldu; domain modüllerini koordine eden akış ve REST API uç nokta sözleşmeleri tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `backend/agent.md`
- **Neden yapıldı:** İstemci ile domain modülleri arasında ince ve güvenli bir orkestrasyon sınırı kurmak için.
- **Teknik olarak nasıl uygulandı:** P0 ve P1 uç noktaları `shared/contracts.schema.json` şemalarına bağlandı.
- **Diğer modüllere etkisi:** `frontend/` yalnızca burada tanımlanan HTTP sözleşmeleriyle konuşacaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

