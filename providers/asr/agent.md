# `providers/asr/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`providers/asr/` klasörü, ders ses kayıtlarını zaman damgalı metne dönüştüren **Speech-to-Text (ASR)** servislerinin ortak arayüzünü (`ASRProvider`) ve sağlayıcıya özel adaptörlerini barındırır.
- Değerlendirilen adaylar (**Gemini 3.5 Transcribe**, **Groq Whisper**, **OpenAI Transcription**) arasında kod değişikliği yapmadan yalnızca `ASR_PROVIDER` ortam değişkeniyle geçiş yapılabilmesini sağlar.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, `ASRProvider` arayüz sözleşmesi ve değişiklik geçmişi. |

*(Not: İlk ASR sağlayıcısı seçildiğinde `base` arayüzü ve ilgili adaptör dosyası bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. [`transcription/`](../../transcription/agent.md) modülü, ses dosyasını ve opsiyonel dil parametresini `ASRProvider.transcribe(...)` metoduna iletir.
2. Seçili adaptör (örn. Groq Whisper veya Gemini Transcribe), sağlayıcının beklediği HTTP/multipart formatında isteği hazırlar ve **zaman damgalı segment ayrıntı düzeyini** (`verbose_json` / `segment timestamps`) talep eder.
3. Sağlayıcıdan dönen yanıt, adaptör içinde sağlayıcıdan bağımsız `RawASRResult` yapısına (`language`, `duration_seconds`, `raw_segments: [{ start_time, end_time, text }]`) çevrilir ve `transcription/` modülüne döndürülür.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../../shared/agent.md) (`StandardError`, `ASR_PROVIDER`, `ASR_TIMEOUT_SECONDS` ve ilgili API anahtarı konfigürasyonu).
- **Bu klasöre bağımlı olan modüller:**
  - Yalnızca [`transcription/`](../../transcription/agent.md) modülü.
- **Yasaklı bağımlılıklar:** `providers/llm/`, `chunking/`, `retrieval/`, `qa/`, `study_materials/`, `frontend/`.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Arayüz (`ASRProvider`):**
  - `transcribe(audioInput, options?: { language?: string, timeoutSeconds?: number }): Promise<RawASRResult>`
- **Çıktı (`RawASRResult`):**
  - `provider_name`: `string` (`"groq" | "gemini" | "openai" | "mock"`)
  - `language`: `string`
  - `duration_seconds`: `number >= 0`
  - `segments`: `Array<{ start_time: number, end_time: number, text: string }>`
- **Hata Durumları:** Zaman aşımında `PROVIDER_TIMEOUT`, bağlantı/kota/5xx hatalarında `PROVIDER_UNAVAILABLE` veya `TRANSCRIPTION_FAILED`.

---

### 6. Geliştirme Kuralları

1. **Zaman Damgası Zorunluluğu:** Eklenen her ASR adaptörü sağlayıcıdan mutlaka segment bazlı başlangıç ve bitiş zamanlarını (`start_time`, `end_time`) almak zorundadır; yalnızca düz metin döndüren modlar kabul edilmez.
2. **Timeout ve Güvenlik:** `ASR_TIMEOUT_SECONDS` (varsayılan 120 sn) aşıldığında istek güvenli şekilde iptal edilmelidir. API anahtarları asla hata nesnesi içinde dışarı sızdırılmamalıdır.
3. **Birim Testi (Mock):** Gerçek API çağrısı yapmayan bir `MockASRProvider` adaptörü test süreçleri için desteklenmelidir.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `providers/asr/` alt modül iskeleti ve `ASRProvider` sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `providers/asr/` klasörü ve zaman damgalı ASR adaptör sözleşmesini tanımlayan `agent.md` oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `providers/asr/agent.md`
- **Neden yapıldı:** Gemini 3.5 Transcribe, Groq Whisper ve OpenAI Transcription gibi adayların birbirinin yerine takılıp çıkarılabilir olmasını sağlamak için.
- **Teknik olarak nasıl uygulandı:** `ASRProvider.transcribe` arayüzü ve `RawASRResult` veri yapısı tanımlandı.
- **Diğer modüllere etkisi:** `transcription/` modülü yalnızca bu sözleşmeyi çağıracaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

