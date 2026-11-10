# `shared/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`shared/` klasörü, **LectureAssistant** içerisindeki tüm modüllerin ortaklaşa kullandığı **kanonik veri sözleşmelerini (domain & DTO şemalarını)**, ortam değişkeni (`env`) konfigürasyon okuyucu kurallarını, merkezi hata zarflarını ve hassas veri sızdırmayan loglama standartlarını barındırır.
- Modüllerin birbirlerinin iç sınıflarına bağımlı olmasını engeller.
- `TranscriptChunk` (`chunk_id`), `Citation` ve `QAResponse` gibi kritik sözleşmelerin tek doğruluk kaynağıdır (Single Source of Truth).

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, sözleşme kuralları ve değişiklik geçmişi. |
| [`contracts.schema.json`](./contracts.schema.json) | Programlama dili ve framework'ten bağımsız JSON Schema (2020-12) formatında temel veri modelleri (`Lecture`, `TranscriptSegment`, `TranscriptChunk`, `LLMGroundedAnswerPayload`, `Citation`, `QAResponse`, `SummaryResult`, `Flashcard`, `QuizQuestion`, `StandardError`). |

*(Not: Uygulama dili kesinleştiğinde bu şemalara karşılık gelen tip/model tanımları, `config` okuyucusu ve `errors` yardımcı modülü bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. Herhangi bir modül (`transcription/`, `chunking/`, `retrieval/`, `qa/`, `study_materials/`, `backend/`, `frontend/`) girdi veya çıktı modeli tanımlarken [`contracts.schema.json`](./contracts.schema.json) içerisindeki şema tanımlarına uyar.
2. Konfigürasyon değerleri (API anahtarları, sağlayıcı seçimleri, dosya boyut limitleri) doğrudan iş mantığı modüllerinin içinde dağınık biçimde okunmaz; merkezi konfigürasyon katmanı üzerinden doğrulanarak sağlanır.
3. Modüllerde oluşan hatalar, kullanıcıya iç yığın izi (stack trace) veya API anahtarı göstermeyen `StandardError` sözleşmesine dönüştürülür.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:** **Yoktur.** `shared/` projenin en alt temel katmanıdır; hiçbir iç modüle (`backend/`, `providers/`, `qa/` vb.) bağımlı olamaz.
- **Bu klasöre bağımlı olan modüller:** Tüm sistem modülleri (`audio/`, `transcription/`, `chunking/`, `retrieval/`, `qa/`, `study_materials/`, `providers/`, `storage/`, `backend/`, `frontend/`, `tests/`).
- **Bağımlılık yönü:** Daima `Diğer Modüller ──> shared/` yönündedir.

---

### 5. Veri ve Arayüz Sözleşmeleri

[`contracts.schema.json`](./contracts.schema.json) içindeki değiştirilemez temel sözleşme kuralları:

1. **`TranscriptChunk`:**
   - `chunk_id` (`^chk_[a-zA-Z0-9_-]+$` formatında benzersiz kimlik)
   - `lecture_id`, `chunk_index`, `start_time`, `end_time`, `text`, `segment_ids`
2. **`LLMGroundedAnswerPayload` (LLM Ham Çıktı Sözleşmesi):**
   - `is_answerable` (`boolean`), `answer` (`string`), `cited_chunk_ids` (`string[]`)
   - **Kritik Kural:** Bu şemada `start_time` veya `end_time` alanı **bulunmaz**. LLM zaman damgası üretemez.
3. **`Citation` (Doğrulanmış Kaynak Sözleşmesi):**
   - `chunk_id`, `start_time`, `end_time`, `quote_text`
   - Bu nesne yalnızca uygulama katmanı (`qa/` veya `study_materials/`) tarafından `chunk_id` doğrulanıp gerçek zaman damgaları `storage/` üzerinden alındıktan sonra oluşturulur.
4. **`QAResponse`:**
   - `status`: `"answered"` veya `"unanswerable_from_recording"`

---

### 6. Geliştirme Kuralları

1. **`shared/` İçine İş Mantığı Koyma:** Bu klasöre ses işleme, veritabanı sorgusu, HTTP istemcisi veya LLM prompt mantığı kesinlikle eklenmemelidir.
2. **Geriye Dönük Uyumluluk:** `contracts.schema.json` içinde bir alan adı değiştirildiğinde bundan etkilenen tüm modüllerin `agent.md` belgeleri ve testleri güncellenmelidir.
3. **Log Güvenliği:** Loglama yardımcıları `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `CEREBRAS_API_KEY` gibi ortam değişkenlerini ve ham kullanıcı ses/transkript verilerini maskelemek zorundadır.
4. **Test Çalıştırma:** Şema geçerliliğini doğrulamak için kök dizinde `node --test tests/verify_skeleton.mjs` çalıştırılır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı ve şema LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `contracts.schema.json` ($id, title, description) ve dokümantasyondaki proje adı LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `shared/agent.md`, `shared/contracts.schema.json`
- **Neden yapıldı:** Proje genelindeki isimlendirme güncellemesi.
- **Teknik olarak nasıl uygulandı:** İlgili metin ve şema alanları güncellendi.
- **Diğer modüllere etkisi:** Yok.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs`

#### 2026-11-10 – Ortak veri sözleşmeleri (`contracts.schema.json`) ve klasör kılavuzu oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `shared/` klasörü ve tüm modüller arası veri sözleşmelerini tanımlayan `contracts.schema.json` dosyası oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `shared/agent.md`, `shared/contracts.schema.json`
- **Neden yapıldı:** Modüller arasında gevşek bağlılık sağlamak ve `chunk_id` tabanlı kaynak doğrulama ile zaman damgası çözümleme sözleşmesini resmi şema altına almak için.
- **Teknik olarak nasıl uygulandı:** JSON Schema Draft 2020-12 standardında 13 temel veri modeli (`AudioMetadata`, `Lecture`, `TranscriptSegment`, `Transcript`, `TranscriptChunk`, `LLMGroundedAnswerPayload`, `Citation`, `QAResponse`, `SummarySection`, `SummaryResult`, `Flashcard`, `QuizQuestion`, `StandardError`) tanımlandı.
- **Diğer modüllere etkisi:** Tüm domain modülleri girdi/çıktı sözleşmesi olarak bu şemayı referans alır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` ile JSON parse ve zorunlu şema tanımları doğrulandı (Başarılı).

