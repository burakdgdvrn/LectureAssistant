# `chunking/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`chunking/` klasörü, [`transcription/`](../transcription/agent.md) modülünden gelen zaman damgalı konuşma segmentlerini (`TranscriptSegment[]`), anlam bütünlüğünü ve gerçek başlangıç/bitiş zaman aralıklarını koruyarak **benzersiz `chunk_id` kimlikli `TranscriptChunk` parçalarına** dönüştürür.
- RAG araması (`retrieval/`), kaynaklı soru-cevap (`qa/`) ve çalışma materyali üretimi (`study_materials/`) için temel referans birimini (`chunk_id`) oluşturur.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, `chunk_id` üretim kuralları ve değişiklik geçmişi. |

*(Not: Uygulama dili kesinleştiğinde zaman/uzunluk/cümle sınırlarına duyarlı parçalayıcı modül bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. Girdi olarak bir dersin normalize edilmiş `Transcript` nesnesini (`TranscriptSegment[]`) alır.
2. Ardışık kısa segmentleri, belirlenen hedef kelime/karakter veya süre penceresi (örn. 30–90 saniyelik veya ~150–300 kelimelik anlamlı pencereler, opsiyonel segment örtüşmesi ile) içinde birleştirir.
3. Üretilen her parçaya ders bazında **benzersiz ve deterministik bir `chunk_id`** (örn. `chk_<lecture_short>_0001` veya `chk_0001`) atar.
4. Parçanın zaman aralığını **matematiksel ve kesin olarak** hesaplar:
   - `chunk.start_time = ilk_segment.start_time`
   - `chunk.end_time = son_segment.end_time`
   - `chunk.segment_ids = [birleştirilen segment_id listesi]`
5. Çıktı olarak sıralı `TranscriptChunk[]` dizisini döndürür.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`Transcript`, `TranscriptSegment`, `TranscriptChunk`).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Transkripsiyon tamamlandığında parçalama adımı için çağırır).
- **Yasaklı bağımlılıklar:** `chunking/` tamamen saf (pure) ve deterministik bir veri dönüştürme modülüdür. Hiçbir AI sağlayıcısına (`providers/`), veritabanına (`storage/`) veya ağ servisine bağımlı olamaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Girdi:** `Transcript` (`lecture_id`, `segments: TranscriptSegment[]`) ve opsiyonel parçalama parametreleri (`max_words`, `max_duration_seconds`, `overlap_segments`).
- **Çıktı (`TranscriptChunk[]` - [`shared/contracts.schema.json`](../shared/contracts.schema.json)):**
  - `chunk_id`: `string` (`^chk_[a-zA-Z0-9_-]+$`, benzersiz)
  - `lecture_id`: `string`
  - `chunk_index`: `integer >= 0`
  - `start_time`: `number >= 0`
  - `end_time`: `number > start_time`
  - `text`: `string`
  - `segment_ids`: `string[]` (en az 1 `segment_id`)

---

### 6. Geliştirme Kuralları

1. **Benzersiz ve İzlenebilir `chunk_id`:** Aynı ders içindeki hiçbir iki parça aynı `chunk_id` değerini alamaz.
2. **Zaman Aralığı Bütünlüğü:** Bir `TranscriptChunk` nesnesinin `start_time` ve `end_time` değerleri, içerdiği `segment_ids` listesinin ilk ve son elemanlarının zamanlarıyla birebir örtüşmelidir.
3. **Cümle Ortasından Bölme Önleme:** Mümkün olduğunca segment sınırları korunmalı; tek bir segment aşırı uzunsa zaman damgası bütünlüğünü bozmayacak şekilde alt parçalara ayrılmalıdır.
4. **Tam Bağımsız Test Edilebilirlik:** Bu modül hiçbir harici servise ihtiyaç duymadığından, her algoritma değişikliği sabit `TranscriptSegment[]` girdileriyle birim testlerinde doğrulanmalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `chunking/` modül iskeleti ve `chunk_id` sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `chunking/` klasörü oluşturuldu ve `TranscriptSegment[]` → `TranscriptChunk[]` dönüşüm kuralları tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `chunking/agent.md`
- **Neden yapıldı:** LLM'in zaman damgası uydurmasını engellemek için her ders parçasına benzersiz `chunk_id` atayan bağımsız bir modül sınırına ihtiyaç duyulması.
- **Teknik olarak nasıl uygulandı:** Saf (pure) veri dönüşümü prensibiyle `shared/contracts.schema.json` içindeki `TranscriptChunk` şemasına bağlandı.
- **Diğer modüllere etkisi:** `retrieval/`, `qa/` ve `study_materials/` modülleri bu modülün ürettiği `chunk_id` kimliklerini referans olarak kullanacaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

