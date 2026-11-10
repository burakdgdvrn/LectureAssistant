# `study_materials/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`study_materials/` klasörü, [`prd.md`](../prd.md) içerisinde **P1 (MVP sonrası)** olarak tanımlanan ek ders çalışma materyallerinin — **Ders Özeti (Map-Reduce), Flashcard ve Çoktan Seçmeli Quiz** — üretilmesinden ve üretilen her materyalin `chunk_id` kaynak doğrulamasından geçirilmesinden sorumludur.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, P1 materyal üretim kuralları ve değişiklik geçmişi. |

*(Not: P0 MVP akışı tamamlandıktan sonra bu klasöre `summarizer` (Map-Reduce özetleyici), `flashcard_generator` ve `quiz_generator` alt modülleri eklenecektir.)*

---

### 3. Çalışma Mantığı

1. **Ders Özeti (Map-Reduce):**
   - **Map Aşaması:** Uzun dersin `TranscriptChunk[]` dizisi kronolojik pencerelere/bölümlere ayrılır. Her bölüm için LLM'den ilgili `chunk_id` kimliklerini referans gösteren ara özetler alınır.
   - **Reduce Aşaması:** Ara özetler birleştirilerek dersin genel özeti (`overview`) ve konu başlıkları (`SummarySection[]`) oluşturulur. Her bölümdeki `chunk_id` referansları doğrulanarak gerçek `Citation[]` nesnelerine dönüştürülür.
2. **Flashcard Üretimi:**
   - Ders parçalarından önemli kavram ve tanımlar çıkarılır (`front_prompt`, `back_answer` ve `cited_chunk_ids`).
   - `chunk_id` doğrulamasından geçen kartlar gerçek zaman damgalı `Citation[]` ile `Flashcard[]` olarak döndürülür.
3. **Çoktan Seçmeli Quiz Üretimi:**
   - Yalnızca ders kaydında anlatılan bilgilere dayalı 4 seçenekli sorular (`question_text`, `options`, `correct_option_index`, `explanation`, `cited_chunk_ids`) üretilir.
   - Kaynağı (`chunk_id`) doğrulanamayan hiçbir soru kullanıcıya sunulmaz.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`TranscriptChunk`, `Citation`, `SummaryResult`, `Flashcard`, `QuizQuestion`, `StandardError`).
  - [`providers/llm/`](../providers/llm/agent.md) (`LLMProvider`).
  - *(Opsiyonel)* [`qa/`](../qa/agent.md) (`chunk_id` -> `Citation` doğrulama mantığının paylaşımı).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Özet, flashcard ve quiz API uç noktaları üzerinden çağırır).
- **Yasaklı bağımlılıklar:** `providers/asr/`, `audio/`, `transcription/`, `frontend/`.

---

### 5. Veri ve Arayüz Sözleşmeleri

[`shared/contracts.schema.json`](../shared/contracts.schema.json) içinde tanımlı çıktı modelleri:
- **`SummaryResult`:** `lecture_id`, `overview`, `sections: SummarySection[]` (her bölümde en az 1 doğrulanmış `Citation`).
- **`Flashcard`:** `card_id`, `front_prompt`, `back_answer`, `citations: Citation[]` (en az 1 doğrulanmış `Citation`).
- **`QuizQuestion`:** `question_id`, `question_text`, `options` (4 adet), `correct_option_index` (`0..3`), `explanation`, `citations: Citation[]` (en az 1 doğrulanmış `Citation`).

---

### 6. Geliştirme Kuralları

1. **MVP Öncelik Kuralı (P1):** P0 kapsamındaki çekirdek akış (ses yükleme -> transkripsiyon -> parçalama -> RAG -> kaynaklı Q&A) tamamlanmadan bu modülün kodlamasına öncelik verilmemelidir.
2. **Zorunlu Kaynak Doğrulaması:** Tıpkı `qa/` modülünde olduğu gibi, LLM hiçbir materyalde doğrudan zaman damgası üretemez; döndürdüğü `chunk_id` kimlikleri sistem tarafından doğrulanmalıdır.
3. **Kayıt Dışı Quiz Sorusu Yasağı:** Quiz sorularının doğru cevabı ve çeldiricilerinin açıklaması yalnızca ders kaydında geçen bilgilere dayanmalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `study_materials/` modül iskeleti ve P1 sözleşmeleri oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `study_materials/` klasörü oluşturuldu; Map-Reduce özet, flashcard ve quiz üretimi için kaynak doğrulama sınırları tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `study_materials/agent.md`
- **Neden yapıldı:** P1 çalışma materyali üretimini P0 çekirdek soru-cevap (`qa/`) modülünden ayırarak modülerliği korumak için.
- **Teknik olarak nasıl uygulandı:** `shared/contracts.schema.json` içerisindeki `SummaryResult`, `Flashcard` ve `QuizQuestion` şemalarıyla ilişkilendirildi.
- **Diğer modüllere etkisi:** `backend/` P1 uç noktaları bu modülü çağıracaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

