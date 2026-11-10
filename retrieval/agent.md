# `retrieval/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`retrieval/` klasörü, bir derse ait `TranscriptChunk` parçalarının aranabilir biçimde indekslenmesinden ve öğrencinin sorduğu soruya en alakalı ders parçalarının (`chunk_id` ve metinleriyle birlikte) bulunup getirilmesinden (RAG - Retrieval) sorumludur.
- Yalnızca **aday kaynak parçalarını bulma** sorumluluğunu taşır; cevap üretmez ve kaynak doğrulaması yapmaz.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, arama sınırları ve değişiklik geçmişi. |

*(Not: Arama stratejisi kesinleştiğinde `indexer` ve `searcher` modülleri bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. **İndeksleme (`indexLectureChunks`):**
   - [`chunking/`](../chunking/agent.md) modülünden çıkan `TranscriptChunk[]` listesini alır.
   - Seçilen arama yöntemine göre (MVP için hafif anahtar kelime/BM25, TF-IDF veya API tabanlı vektör/hibrit arama) ders bazında (`lecture_id` filtresiyle izole edilmiş olarak) indeksler.
2. **Arama (`retrieveRelevantChunks`):**
   - Öğrencinin sorusunu (`question`), hedef `lecture_id` değerini ve maksimum parça sayısını (`top_k`) alır.
   - Yalnızca ilgili `lecture_id` içerisindeki parçalar arasından en yüksek alaka skoruna sahip `TranscriptChunk[]` adaylarını döndürür.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`TranscriptChunk`, `StandardError`).
  - *(Opsiyonel)* [`providers/llm/`](../providers/llm/agent.md) (Yalnızca API tabanlı embedding kullanılması kararlaştırılırsa).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Ders yükleme sonunda indeksleme ve soru-cevap akışında aday parça getirme için çağırır).
- **Yasaklı bağımlılıklar:** `retrieval/` modülü cevap üretmek için LLM çağıramaz, `qa/` veya `study_materials/` modüllerine bağımlı olamaz ve kullanıcı cihazında ağır yerel GPU modelleri çalıştıramaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **İndeksleme Girdisi:** `lecture_id: string`, `chunks: TranscriptChunk[]`
- **Arama Girdisi:** `lecture_id: string`, `query: string`, `top_k: integer` (varsayılan örn. 5–8)
- **Arama Çıktısı:** Sıralı aday `TranscriptChunk[]` listesi (her elemanda `chunk_id`, `text`, `start_time`, `end_time` korunur).

---

### 6. Geliştirme Kuralları

1. **Ders İzolasyonu (Cross-Lecture Sızıntı Yasağı):** Bir soru yanıtlanırken yalnızca o `lecture_id` değerine ait `TranscriptChunk` parçaları aranmalıdır; başka bir dersin parçaları kesinlikle sonuçlara karışmamalıdır.
2. **Cevap Verilememe Kararını Burada Verme:** `retrieval/` en yakın aday parçaları (veya eşik altındaysa boş liste) döndürür; bağlamın soruyu yanıtlamaya yetip yetmediğine [`qa/`](../qa/agent.md) modülü karar verir.
3. **Düşük Donanım Prensibi:** Arama mekanizması öğrenci bilgisayarında ağır yerel vektör sunucuları veya büyük modeller kurmayı zorunlu tutmamalıdır.
4. **Testler:** Belirli bir soru için doğru `chunk_id` parçalarının üst sırada geldiği ve farklı `lecture_id` verilerinin birbirine karışmadığı birim testleriyle doğrulanmalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `retrieval/` modül iskeleti ve RAG arama sınırları oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `retrieval/` klasörü ve ders parçalarının indekslenip aranmasına ilişkin `agent.md` oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `retrieval/agent.md`
- **Neden yapıldı:** Arama/getirme (Retrieval) sorumluluğunu cevap üretimi ve kaynak doğrulama (`qa/`) sorumluluklarından ayırmak için.
- **Teknik olarak nasıl uygulandı:** Ders bazlı (`lecture_id`) izole arama sözleşmesi ve `TranscriptChunk[]` çıktı modeli tanımlandı.
- **Diğer modüllere etkisi:** `backend/` soru-cevap akışında `qa/` modülünü çağırmadan önce aday parçaları bu modülden alacaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

