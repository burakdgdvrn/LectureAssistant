# `providers/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`providers/` klasörü, **LectureAssistant** uygulamasının harici (ve ileride opsiyonel olarak yerel) yapay zeka servisleriyle kurduğu tüm iletişimi iş mantığından soyutlayan adaptör katmanıdır.
- Uygulamanın tek bir AI sağlayıcısına kilitlenmesini (vendor lock-in) engeller.
- Ses-metin dönüştürme (**ASR**) ve büyük dil modeli (**LLM**) servislerini birbirinden bağımsız iki alt modül olarak ayırır.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün genel kuralları, alt modül haritası ve değişiklik geçmişi. |
| [`asr/`](./asr/agent.md) | Speech-to-Text (ASR) sağlayıcı arayüzü ve sağlayıcı adaptörleri (Adaylar: Gemini 3.5 Transcribe, Groq Whisper, OpenAI Transcription). |
| [`llm/`](./llm/agent.md) | Büyük Dil Modeli (LLM) sağlayıcı arayüzü ve sağlayıcı adaptörleri (Adaylar: Gemini API, OpenAI API, Groq, Cerebras). |

---

### 3. Çalışma Mantığı

1. Üst modüller (`transcription/`, `qa/`, `study_materials/`) hiçbir zaman doğrudan üçüncü parti bir SDK'yı veya HTTP uç noktasını çağırmaz; `providers/asr/` veya `providers/llm/` altındaki standart arayüzleri çağırır.
2. Hangi sağlayıcının aktif olduğu ortam değişkenlerinden (`ASR_PROVIDER`, `LLM_PROVIDER`) okunur ve ilgili fabrika (factory/registry) tarafından uygun adaptör seçilir.
3. Sağlayıcıya özel ağ hataları, zaman aşımları (timeout) ve HTTP durum kodları bu katmanda yakalanarak standart uygulama hatalarına (`PROVIDER_TIMEOUT`, `PROVIDER_UNAVAILABLE`) dönüştürülür.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`StandardError`, ortam değişkeni konfigürasyonu, loglama).
- **Bu klasöre bağımlı olan modüller:**
  - [`transcription/`](../transcription/agent.md) -> yalnızca [`providers/asr/`](./asr/agent.md) alt modülünü kullanır.
  - [`qa/`](../qa/agent.md) ve [`study_materials/`](../study_materials/agent.md) (ve opsiyonel embedding için [`retrieval/`](../retrieval/agent.md)) -> yalnızca [`providers/llm/`](./llm/agent.md) alt modülünü kullanır.
- **Yasaklı bağımlılıklar:** `providers/` klasörü iş mantığı modüllerine (`chunking/`, `qa/`, `retrieval/`, `study_materials/`, `frontend/`) kesinlikle bağımlı olamaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Ortak Sağlayıcı Davranış Sözleşmesi:**
  - Her çağrıda yapılandırılabilir `timeout_seconds` uygulanması zorunludur (`ASR_TIMEOUT_SECONDS`, `LLM_TIMEOUT_SECONDS`).
  - API anahtarları yalnızca sunucu ortam değişkenlerinden okunur; hata mesajlarında veya loglarda anahtar değeri asla yer almaz.
  - ASR ve LLM özel sözleşmeleri sırasıyla [`providers/asr/agent.md`](./asr/agent.md) ve [`providers/llm/agent.md`](./llm/agent.md) dosyalarında tanımlanmıştır.

---

### 6. Geliştirme Kuralları

1. **ASR ve LLM Kodlarını Karıştırma:** Bir sağlayıcı hem ASR hem LLM sunsa bile (örn. OpenAI veya Gemini), ASR adaptörü `providers/asr/` içinde, LLM adaptörü `providers/llm/` içinde ayrı tutulmalıdır. Böylece örneğin ASR için Groq kullanılırken LLM için Gemini sorunsuzca seçilebilir.
2. **İş Mantığı Sızdırma Yasağı:** Sağlayıcı sınıflarının içine ders özeti promptları, `chunk_id` doğrulama kuralları veya metin parçalama mantığı yazılmamalıdır.
3. **Yerel Model Genişletilebilirliği:** İleride yerel model desteği (P2) eklendiğinde mevcut arayüz değiştirilmeden yalnızca yeni bir adaptör (örn. `local_whisper` veya `local_llm`) olarak eklenmelidir.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Dokümantasyondaki proje adı referansı LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `providers/agent.md`
- **Neden yapıldı:** Proje genelindeki isimlendirme güncellemesi.
- **Teknik olarak nasıl uygulandı:** İlgili metin referansı güncellendi.
- **Diğer modüllere etkisi:** Yok.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs`

#### 2026-11-10 – `providers/` ana soyutlama klasörü ve ASR/LLM ayrımı oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `providers/` klasörü ve altındaki `asr/` ile `llm/` alt klasörleri oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `providers/agent.md`, `providers/asr/agent.md`, `providers/llm/agent.md`
- **Neden yapıldı:** Harici AI sağlayıcılarını iş mantığından ayırmak ve ASR ile LLM sağlayıcılarının birbirinden bağımsız değiştirilebilmesini sağlamak için.
- **Teknik olarak nasıl uygulandı:** Ortam değişkeni tabanlı sağlayıcı seçimi ve standart hata/timeout kuralları tanımlandı.
- **Diğer modüllere etkisi:** `transcription/`, `qa/` ve `study_materials/` modülleri yalnızca bu katmandaki soyut arayüzlerle iletişim kuracaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

