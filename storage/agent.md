# `storage/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`storage/` klasörü, yüklenen ders ses dosyalarının güvenli biçimde saklanmasından, geçici dosyaların temizlenmesinden ve ders (`Lecture`), transkript (`Transcript`), parça (`TranscriptChunk`) ile çalışma materyali verilerinin kalıcılığından (persistence) sorumludur.
- `qa/` ve `study_materials/` modüllerinin doğruladığı `chunk_id` kimliklerine karşılık gelen **gerçek `start_time` ve `end_time` zaman damgalarının** sorgulandığı otoriter veri deposudur.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, repository sözleşmesi, veri silme politikaları ve değişiklik geçmişi. |

*(Not: Kalıcılık teknolojisi kesinleştiğinde `audio_file_store` ve `lecture_repository` modülleri bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. **Ses Dosyası Saklama (`AudioFileStore`):**
   - `audio/` tarafından doğrulanmış ses dosyasını Git dışı güvenli dizine (`STORAGE_BASE_DIR`) `lecture_id` ile izole ederek kaydeder.
   - `frontend/` ses oynatıcısının belirli bir saniye aralığını dinleyebilmesi için (HTTP Range isteklerine uygun) dosya akışı erişimi sağlar.
2. **Metin ve Parça Saklama (`LectureRepository`):**
   - `Lecture` durumunu (`uploaded` -> `ready`), normalize `Transcript` nesnesini ve `TranscriptChunk[]` dizisini kaydeder.
   - `getChunksByIds(lecture_id, chunk_ids[])` metodu ile doğrulanan parçaların gerçek `start_time`, `end_time` ve `text` değerlerini hızlıca döndürür.
3. **Veri Silme ve Geçici Dosya Temizliği:**
   - İşlem sırasında oluşan geçici dosyalar (`TEMP_FILE_TTL_MINUTES`) temizlenir.
   - Kullanıcı bir dersi sildiğinde hem ses dosyası hem de üretilen tüm transkript/chunk/indeks kayıtları kalıcı olarak silinir.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`Lecture`, `Transcript`, `TranscriptChunk`, `StandardError`, `STORAGE_BASE_DIR`).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Dosya ve veri okuma/yazma koordinasyonu için).
- **Yasaklı bağımlılıklar:** `providers/`, `qa/`, `study_materials/`, `frontend/`.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **`LectureRepository` Temel Arayüzü:**
  - `saveLecture(lecture: Lecture): Promise<void>`
  - `getLecture(lecture_id: string): Promise<Lecture | null>`
  - `saveTranscriptAndChunks(lecture_id: string, transcript: Transcript, chunks: TranscriptChunk[]): Promise<void>`
  - `getChunksByLecture(lecture_id: string): Promise<TranscriptChunk[]>`
  - `getChunksByIds(lecture_id: string, chunk_ids: string[]): Promise<TranscriptChunk[]>`
  - `deleteLectureData(lecture_id: string): Promise<void>`

---

### 6. Geliştirme Kuralları

1. **Git Deposuna Veri Yazma Yasağı:** Yüklenen hiçbir ses dosyası veya veritabanı dosyası Git tarafından izlenen klasörlere yazılmamalıdır; `.gitignore` içinde tanımlı `.local_storage/` (veya yapılandırılan harici dizin) kullanılmalıdır.
2. **Zaman Damgası Değişmezliği (Immutability):** Kaydedilen bir `TranscriptChunk` nesnesinin `chunk_id`, `start_time` ve `end_time` alanları sonradan soru-cevap akışı tarafından değiştirilemez.
3. **Tam Silme Garantisi:** `deleteLectureData(lecture_id)` çağrıldığında yetim (orphan) ses dosyası veya transkript parçası kalmamalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `storage/` modül iskeleti ve repository sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `storage/` klasörü oluşturuldu; ses dosyası saklama, `TranscriptChunk` sorgulama ve veri silme kuralları tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `storage/agent.md`
- **Neden yapıldı:** Dosya/veritabanı kalıcılığını iş mantığı modüllerinden ayırmak ve `chunk_id` -> gerçek zaman aralığı çözümlemesi için tek bir otoriter kaynak sağlamak için.
- **Teknik olarak nasıl uygulandı:** `LectureRepository` ve `AudioFileStore` sorumlulukları `shared/contracts.schema.json` modellerine bağlandı.
- **Diğer modüllere etkisi:** `backend/` tüm kalıcılık işlemlerini bu modül üzerinden yürütecektir.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

