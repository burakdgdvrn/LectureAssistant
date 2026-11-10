# `qa/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`qa/` klasörü, **LectureAssistant** ürününün en kritik iş kuralını uygular: **Yalnızca ders kaydındaki bilgilere dayanarak soru-cevap üretmek, kayıtta olmayan sorulara cevap vermemek (Abstention) ve LLM'in döndürdüğü `chunk_id` kimliklerini doğrulayarak gerçek ses zaman aralıklarıyla eşleştirmek.**
- LLM'in kendi başına zaman damgası uydurmasını veya ders dışı genel kültür bilgisiyle cevap vermesini engeller.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, kaynak doğrulama kuralları ve değişiklik geçmişi. |

*(Not: Uygulama dili kesinleştiğinde bu klasörde üç ayrı alt sorumluluk birimi yer alacaktır: `answer_generator` (LLM çağrısı), `abstention_guard` (cevap verilememe denetimi) ve `citation_verifier` (`chunk_id` doğrulama ve zaman damgası eşleştirme).)*

---

### 3. Çalışma Mantığı

`qa/` modülü içerisindeki işlem üç ayrık adımda yürütülür:

1. **Ön Kontrol ve Cevap Üretimi (`answer_generator`):**
   - Eğer `retrieval/` modülünden hiçbir aday `TranscriptChunk` gelmemişse, LLM bile çağrılmadan doğrudan `status: "unanswerable_from_recording"` yanıtı üretilir.
   - Aday parçalar varsa, LLM'e yalnızca her parçanın `chunk_id` ve `text` içeriği verilir (LLM'e zaman damgası uydurma fırsatı verilmez).
   - Sistem talimatı (system prompt), modelin **yalnızca verilen parçalardaki bilgiyi kullanmasını**, bilgi parçalarda yoksa `is_answerable: false` döndürmesini ve kullandığı parçaların `chunk_id` kimliklerini `cited_chunk_ids` dizisinde listelemesini zorunlu kılar.
2. **Kaynak Kimliği Doğrulaması (`citation_verifier`):**
   - LLM'den dönen `LLMGroundedAnswerPayload.cited_chunk_ids` içindeki her bir `chunk_id`, gerçekten o çağrıda sağlanan aday `TranscriptChunk[]` listesinde (veya dersin gerçek chunk deposunda) var mı diye kontrol edilir.
   - Var olmayan / uydurulmuş `chunk_id` değerleri derhal elenir.
   - Doğrulanan her `chunk_id` için gerçek `start_time`, `end_time` ve `quote_text` değerleri **sistemdeki `TranscriptChunk` nesnesinden** alınarak `Citation` nesnesi oluşturulur.
3. **Cevap Verilememe Kararı (`abstention_guard`):**
   - Eğer `is_answerable === false` ise VEYA doğrulama sonunda geçerli hiçbir `Citation` kalmamışsa (`citations.length === 0`), sistem cevabı reddeder ve `status: "unanswerable_from_recording"`, `citations: []` ile sorunun cevabının ders kaydında yer almadığını bildirir.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`TranscriptChunk`, `LLMGroundedAnswerPayload`, `Citation`, `QAResponse`, `StandardError`).
  - [`providers/llm/`](../providers/llm/agent.md) (`LLMProvider` yapılandırılmış çıktı arayüzü).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Soru-cevap API akışında çağırır).
  - *(Opsiyonel ortak doğrulayıcı kullanımı)* [`study_materials/`](../study_materials/agent.md) (`citation_verifier` mantığını paylaşabilir).
- **Yasaklı bağımlılıklar:** `qa/` modülü `providers/asr/`, `audio/`, `transcription/` veya `frontend/` modüllerine bağımlı olamaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Girdi:**
  - `lecture_id`: `string`
  - `question`: `string`
  - `candidate_chunks`: `TranscriptChunk[]` (`retrieval/` tarafından bulunan parçalar)
- **LLM Ham Çıktı Sözleşmesi (`LLMGroundedAnswerPayload`):**
  - `is_answerable`: `boolean`
  - `answer`: `string`
  - `cited_chunk_ids`: `string[]` *(Zaman damgası içermez!)*
- **Modül Çıktısı (`QAResponse` - [`shared/contracts.schema.json`](../shared/contracts.schema.json)):**
  - `lecture_id`: `string`
  - `question`: `string`
  - `status`: `"answered" | "unanswerable_from_recording"`
  - `answer`: `string`
  - `citations`: `Citation[]` (`chunk_id`, `start_time`, `end_time`, `quote_text`)

---

### 6. Geliştirme Kuralları

1. **Asla Kaynaksız `"answered"` Döndürme:** `QAResponse.status === "answered"` olduğunda `citations` dizisinde en az 1 adet sistem tarafından doğrulanmış `Citation` bulunması zorunludur.
2. **Zaman Damgasını LLM'den Alma:** `Citation.start_time` ve `Citation.end_time` değerleri her zaman `TranscriptChunk` nesnesinden kopyalanmalıdır.
3. **Kayıt Dışı Bilgi Yasağı:** Prompt tasarımında modelin kendi ön eğitim bilgisini (pre-trained knowledge) kullanması açıkça yasaklanmalıdır.
4. **Testler:**
   - Kayıtta cevabı olan soru -> Doğru `chunk_id` ve gerçek `start_time`/`end_time` kontrolü.
   - Kayıtta cevabı olmayan soru -> `unanswerable_from_recording` kontrolü.
   - LLM'in uydurma `chk_9999` döndürdüğü senaryo -> Uydurma kaynağın elenmesi ve güvenlik düşüşü (fallback) kontrolü.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Dokümantasyondaki proje adı referansı LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `qa/agent.md`
- **Neden yapıldı:** Proje genelindeki isimlendirme güncellemesi.
- **Teknik olarak nasıl uygulandı:** İlgili metin referansı güncellendi.
- **Diğer modüllere etkisi:** Yok.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs`

#### 2026-11-10 – `qa/` modül iskeleti, Abstention ve `chunk_id` doğrulama kuralları oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `qa/` klasörü oluşturuldu; kaynaklı cevap üretimi, cevap verilememe (Abstention) ve `chunk_id` doğrulama adımları tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `qa/agent.md`
- **Neden yapıldı:** LLM'in ders dışı bilgi vermesini ve zaman damgası uydurmasını mimari düzeyde imkansız kılmak için.
- **Teknik olarak nasıl uygulandı:** `LLMGroundedAnswerPayload` (yalnızca `cited_chunk_ids`) ile `QAResponse` (`Citation` içinde sistemden çözümlenen `start_time`/`end_time`) sözleşmeleri ayrıştırıldı.
- **Diğer modüllere etkisi:** `backend/` soru-cevap uç noktası doğrudan bu modülün ürettiği `QAResponse` nesnesini döndürecektir.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

