# `providers/llm/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`providers/llm/` klasörü, soru-cevap (`qa/`) ve çalışma materyali üretimi (`study_materials/`) için kullanılan **Büyük Dil Modeli (LLM)** servislerinin ortak arayüzünü (`LLMProvider`) ve sağlayıcıya özel adaptörlerini barındırır.
- Değerlendirilen adaylar (**Gemini API**, **OpenAI API**, **Groq**, **Cerebras**) arasında üst modülleri değiştirmeden `LLM_PROVIDER` ortam değişkeniyle geçiş yapılabilmesini sağlar.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, `LLMProvider` arayüz sözleşmesi ve değişiklik geçmişi. |

*(Not: İlk LLM sağlayıcısı seçildiğinde `base` arayüzü ve ilgili adaptör dosyası bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. `qa/` veya `study_materials/` modülü, sistem talimatını (`systemPrompt`), kullanıcı girdisini (`userPrompt`) ve beklenen yanıt JSON şemasını (`responseSchema`) `LLMProvider.generateStructured(...)` metoduna iletir.
2. Seçili adaptör (örn. Gemini, OpenAI, Groq veya Cerebras), ilgili sağlayıcının yapılandırılmış çıktı (JSON Schema / Structured Output) mekanizmasını kullanarak modeli çağırır.
3. Dönen yanıt JSON olarak ayrıştırılır, şemaya uygunluğu kontrol edilir ve çağıran modüle teslim edilir.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../../shared/agent.md) (`StandardError`, `LLM_PROVIDER`, `LLM_TIMEOUT_SECONDS` ve ilgili API anahtarı konfigürasyonu).
- **Bu klasöre bağımlı olan modüller:**
  - [`qa/`](../../qa/agent.md)
  - [`study_materials/`](../../study_materials/agent.md)
  - *(Opsiyonel)* [`retrieval/`](../../retrieval/agent.md) (Yalnızca API tabanlı metin gömme/embedding kullanılırsa).
- **Yasaklı bağımlılıklar:** `providers/asr/`, `audio/`, `transcription/`, `chunking/`, `frontend/`.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Arayüz (`LLMProvider`):**
  - `generateStructured<T>(request: { systemPrompt: string, userPrompt: string, schema: object, temperature?: number, timeoutSeconds?: number }): Promise<T>`
  - *(Opsiyonel)* `embedTexts?(texts: string[]): Promise<number[][]>`
- **Hata Durumları:** Zaman aşımında `PROVIDER_TIMEOUT`, kota/5xx/bağlantı hatalarında `PROVIDER_UNAVAILABLE`, geçersiz JSON çıktısında `VALIDATION_ERROR`.

---

### 6. Geliştirme Kuralları

1. **Düşük Sıcaklık (Low Temperature) Varsayılanı:** Ders kaydına sadık kalmak ve halüsinasyonu en aza indirmek için kaynaklı soru-cevap çağrılarında varsayılan `temperature` değeri düşük (`0.0` – `0.2`) tutulmalıdır.
2. **Yapılandırılmış Çıktı Zorunluluğu:** `qa/` ve `study_materials/` modülleri serbest metin ayrıştırmaya (regex parsing) güvenmemeli; `LLMProvider` her zaman `cited_chunk_ids` dizisini içeren doğrulanabilir JSON yapısı döndürmelidir.
3. **İş Mantığından Bağımsızlık:** Prompt şablonları veya `chunk_id` doğrulama kuralları bu klasöre yazılmaz; ilgili domain modülünde (`qa/` veya `study_materials/`) tutulur.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `providers/llm/` alt modül iskeleti ve `LLMProvider` sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `providers/llm/` klasörü ve yapılandırılmış çıktı üreten `LLMProvider` sözleşmesini tanımlayan `agent.md` oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `providers/llm/agent.md`
- **Neden yapıldı:** Gemini API, OpenAI API, Groq ve Cerebras gibi LLM adaylarını iş mantığından soyutlamak için.
- **Teknik olarak nasıl uygulandı:** `generateStructured` ve opsiyonel `embedTexts` sözleşmeleri tanımlandı.
- **Diğer modüllere etkisi:** `qa/` ve `study_materials/` modülleri LLM çağrılarını yalnızca bu arayüz üzerinden gerçekleştirecektir.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

