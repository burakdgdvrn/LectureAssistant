# `tests/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`tests/` klasörü, **LectureAssistant** projesinin mimari bütünlüğünü, üç seviyeli dokümantasyon kurallarını, ortak veri sözleşmelerini (`shared/contracts.schema.json`), birim (unit) mantığını ve modüller arası entegrasyon akışlarını doğrulayan testleri barındırır.
- "Test edilemeyen veya doğrulanmamış kodu tamamlanmış gibi gösterme" ilkesinin güvencesidir.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, test stratejisi ve değişiklik geçmişi. |
| [`verify_skeleton.mjs`](./verify_skeleton.mjs) | Klasör yapısını, tüm klasörlerdeki `agent.md` dosyalarının 7 zorunlu bölümünü, `architecture.md` / `prd.md` tutarlılığını, `.env.example` güvenliğini ve `shared/contracts.schema.json` içindeki `chunk_id` sözleşmelerini denetleyen sıfır bağımlılıklı otomatik doğrulama testi. |

*(Not: Uygulama dili kesinleşip modüller kodlandıkça bu klasöre `unit/`, `contract/` ve `integration/` test paketleri ile sahte (mock) AI sağlayıcıları eklenecektir.)*

---

### 3. Çalışma Mantığı

1. **İskelet, Dokümantasyon ve Sözleşme Testi (`verify_skeleton.mjs`):**
   - Projede bulunan her klasörün bir `agent.md` dosyasına sahip olduğunu denetler.
   - Her `agent.md` dosyasının 7 zorunlu başlığı ve Changelog kaydını içerdiğini doğrular.
   - `shared/contracts.schema.json` dosyasının geçerli JSON olduğunu, `TranscriptChunk` modelinde `chunk_id` bulunduğunu ve `LLMGroundedAnswerPayload` modelinde LLM'in zaman damgası döndürmesinin yasaklandığını doğrular.
2. **Modül Birim ve Entegrasyon Testleri (Modüller geliştirildikçe):**
   - Gerçek harici ASR/LLM API'lerine ağ çağrısı yapmadan, sahte (mock/fake) sağlayıcılarla `chunking/`, `retrieval/`, `qa/` (`chunk_id` doğrulaması ve `unanswerable_from_recording` durumu) ve `study_materials/` modüllerini test eder.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - Test edilen tüm proje modülleri ve [`shared/contracts.schema.json`](../shared/contracts.schema.json).
- **Bu klasöre bağımlı olan modüller:** **Yoktur.** Üretim/uygulama kodları `tests/` klasörüne bağımlı olamaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- Testler, [`shared/contracts.schema.json`](../shared/contracts.schema.json) içindeki şemaları referans doğruluk kaynağı olarak kullanır.
- Harici AI sağlayıcılarını taklit eden tüm test dublörleri (mocks/fakes), [`providers/asr/agent.md`](../providers/asr/agent.md) ve [`providers/llm/agent.md`](../providers/llm/agent.md) içerisindeki arayüz sözleşmelerine birebir uymalıdır.

---

### 6. Geliştirme Kuralları

1. **Birim Testlerinde Gerçek API Çağrısı Yasağı:** Otomatik birim ve entegrasyon testleri gerçek API anahtarı gerektirmemeli ve harici servislere ücretli/ağ bağımlı istek atmamalıdır.
2. **Her Değişiklik Sonrası Test Çalıştırma:** Herhangi bir modülde veya dokümanda değişiklik yapıldığında `verify_skeleton.mjs` ve ilgili modül testleri çalıştırılmadan görev tamamlanmış sayılmaz.
3. **Çalıştırma Komutu:**
   ```powershell
   node --test tests/verify_skeleton.mjs
   ```

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Dokümantasyondaki proje adı referansı LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `tests/agent.md`
- **Neden yapıldı:** Proje genelindeki isimlendirme güncellemesi.
- **Teknik olarak nasıl uygulandı:** İlgili metin referansı güncellendi.
- **Diğer modüllere etkisi:** Yok.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs`

#### 2026-11-10 – `tests/` klasörü ve `verify_skeleton.mjs` doğrulama testi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `tests/` klasörü, `tests/agent.md` ve mimari/dokümantasyon/şema bütünlüğünü otomatik denetleyen `tests/verify_skeleton.mjs` dosyası oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `tests/agent.md`, `tests/verify_skeleton.mjs`
- **Neden yapıldı:** Üç seviyeli dokümantasyon kurallarının, klasör yapısının ve `chunk_id` veri sözleşmelerinin bozulmadığını her adımda otomatik olarak doğrulayabilmek için.
- **Teknik olarak nasıl uygulandı:** Harici kütüphane gerektirmeyen yerleşik `node:test` ve `node:assert/strict` modülleriyle 7 kapsamlı test senaryosu yazıldı.
- **Diğer modüllere etkisi:** Tüm klasörlerdeki `agent.md` dosyalarını ve `shared/contracts.schema.json` şemasını denetler.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve tüm testler başarılı geçti.

