# `transcription/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`transcription/` klasörü, doğrulanmış ders ses kayıtlarının [`providers/asr/`](../providers/asr/agent.md) soyutlaması üzerinden metne dönüştürülmesini ve farklı ASR sağlayıcılarından dönen ham sonuçların **zaman damgaları korunmuş standart `Transcript` ve `TranscriptSegment` modellerine** normalize edilmesini sağlar.
- Hangi ASR sağlayıcısı (Gemini 3.5 Transcribe, Groq Whisper, OpenAI Transcription vb.) kullanılırsa kullanılsın, sistemin geri kalanına tek tip zaman damgalı transkript sunar.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, normalizasyon kuralları ve değişiklik geçmişi. |

*(Not: Uygulama dili kesinleştiğinde `service` (transkripsiyon akış yöneticisi) ve `normalizer` (ham ASR çıktısını `TranscriptSegment[]` dizisine dönüştüren modül) bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. `backend/`, doğrulanmış ses dosyasının referansını ve `lecture_id` bilgisini `transcription/` modülüne verir.
2. `transcription/`, aktif `ASRProvider` adaptörünü (`providers/asr/`) çağırarak zaman damgalı transkripsiyon talep eder.
3. Sağlayıcıdan dönen ham segmentler **Normalizasyon** adımından geçirilir:
   - Boş veya yalnızca boşluk içeren segmentler temizlenir.
   - Her segmente sıralı ve deterministik bir `segment_id` (`seg_0001`, `seg_0002`...) atanır.
   - `start_time >= 0` ve `end_time > start_time` kuralları doğrulanır; kronolojik sıralama garanti altına alınır.
4. Eğer ses kaydından hiçbir anlamlı metin çıkmazsa (tamamen sessiz veya bozuk kayıt), boş transkript üretmek yerine `TRANSCRIPTION_FAILED` / `EMPTY_OR_CORRUPT_AUDIO` hatası döndürülür.
5. Çıktı olarak standart `Transcript` nesnesi `backend/` katmanına teslim edilir.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`Transcript`, `TranscriptSegment`, `StandardError`).
  - [`providers/asr/`](../providers/asr/agent.md) (`ASRProvider` arayüzü).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Ses yükleme sonrası transkripsiyon adımı için çağırır).
- **Yasaklı bağımlılıklar:** `transcription/` modülü doğrudan belirli bir ASR SDK'sını (örn. doğrudan OpenAI veya Groq kütüphanesini) import edemez; yalnızca `providers/asr/` arayüzünü kullanır. Ayrıca `chunking/`, `retrieval/` veya `qa/` modüllerine bağımlı olamaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Girdi:** `lecture_id` (`string`), ses dosyası yolu/akışı, opsiyonel dil kodu (`languageHint`).
- **Çıktı (`Transcript` - [`shared/contracts.schema.json`](../shared/contracts.schema.json)):**
  - `lecture_id`: `string` (`^lec_...`)
  - `language`: `string`
  - `duration_seconds`: `number >= 0`
  - `segments`: `TranscriptSegment[]`
    - `segment_id`: `string` (`^seg_...`)
    - `start_time`: `number >= 0` (saniye)
    - `end_time`: `number > start_time` (saniye)
    - `text`: `string` (kırpılmış, boş olmayan konuşma metni)

---

### 6. Geliştirme Kuralları

1. **Zaman Damgalarını Asla Kaybetme veya YuvarlayarakBozma:** Saniye cinsinden ondalıklı zaman damgaları (`start_time`, `end_time`) kayıpsız korunmalıdır.
2. **Sağlayıcıya Özel Alan Sızdırma:** Sağlayıcıların döndürdüğü özel alanlar (`avg_logprob`, `tokens`, `no_speech_prob` vb.) `TranscriptSegment` modeline sızdırılmamalıdır.
3. **Parçalama (Chunking) Yapma:** Bu modül yalnızca ASR segmentlerini normalize eder; RAG için metin birleştirme/bölme ve `chunk_id` atama işi [`chunking/`](../chunking/agent.md) modülüne aittir.
4. **Testler:** Sahte (mock) `ASRProvider` çıktılarıyla zaman damgası sıralaması, boş segment filtreleme ve hata durumları birim testleriyle doğrulanmalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `transcription/` modül iskeleti ve normalizasyon sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `transcription/` klasörü oluşturuldu ve ASR çıktılarının standart `Transcript` / `TranscriptSegment` modellerine dönüştürülme kuralları tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `transcription/agent.md`
- **Neden yapıldı:** Farklı ASR sağlayıcılarının farklı zaman damgası formatlarını tek bir iç veri sözleşmesinde birleştirmek için.
- **Teknik olarak nasıl uygulandı:** `providers/asr/` soyutlamasını tüketen ve `shared/contracts.schema.json` içindeki `Transcript` modelini üreten sınırlar belirlendi.
- **Diğer modüllere etkisi:** `chunking/` modülü doğrudan bu modülün ürettiği normalize `TranscriptSegment[]` dizisini girdi olarak kullanacaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

