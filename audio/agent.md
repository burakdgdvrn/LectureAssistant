# `audio/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`audio/` klasörü, öğrencinin yüklediği ders ses dosyalarının sisteme kabul edilmeden önce doğrulanmasından ve transkripsiyona (ASR) hazır hale getirilmesinden sorumludur.
- İzin verilmeyen dosya türlerini, sıfır baytlık/bozuk dosyaları ve boyut sınırını aşan yüklemeleri erken aşamada reddeder.
- Dosya adı sanitizasyonu (path traversal önleme) ve ses üst verilerinin (`AudioMetadata`) çıkarılmasını sağlar.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün sorumluluk sınırları, doğrulama kuralları ve değişiklik geçmişi. |

*(Not: Uygulama dili kesinleştiğinde `validator` (format/MIME/boyut doğrulayıcı) ve `inspector` (süre/bütünlük okuyucu) modülleri bu klasörde yer alacaktır.)*

---

### 3. Çalışma Mantığı

1. `backend/` yükleme isteğini aldığında ham dosya bilgilerini ve akışını `audio/` modülüne iletir.
2. **Boyut Kontrolü:** Dosya boyutunun `MAX_AUDIO_UPLOAD_MB` sınırını aşmadığı ve `0` bayttan büyük olduğu kontrol edilir.
3. **Tür ve İmza (Magic Bytes / MIME) Kontrolü:** Yalnızca dosya uzantısına güvenilmez; dosyanın `ALLOWED_AUDIO_FORMATS` (`mp3`, `wav`, `m4a`, `ogg`, `webm`) içinde olduğu doğrulanır.
4. **Dosya Adı Güvenliği:** Kullanıcıdan gelen dosya adındaki tehlikeli karakterler (`..`, `/`, `\`) temizlenir.
5. Doğrulama başarılıysa standart `AudioMetadata` nesnesi üretilir; başarısızsa ilgili `StandardError` (`INVALID_AUDIO_FORMAT`, `AUDIO_TOO_LARGE`, `EMPTY_OR_CORRUPT_AUDIO`) döndürülür.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - [`shared/`](../shared/agent.md) (`AudioMetadata`, `StandardError`, dosya boyut/format konfigürasyonları).
- **Bu klasöre bağımlı olan modüller:**
  - [`backend/`](../backend/agent.md) (Ses yükleme iş akışında doğrulama adımı için çağırır).
- **Yasaklı bağımlılıklar:** `audio/` modülü hiçbir AI sağlayıcısına (`providers/`), veritabanına (`storage/`) veya `qa/` modülüne bağımlı olamaz.

---

### 5. Veri ve Arayüz Sözleşmeleri

- **Girdi:** Yüklenen dosya akışı/tamponu, orijinal dosya adı, bildirilen MIME türü ve bayt cinsinden boyut.
- **Çıktı (`AudioMetadata` - [`shared/contracts.schema.json`](../shared/contracts.schema.json)):**
  - `original_filename`: `string`
  - `mime_type`: `string`
  - `format`: `"mp3" | "wav" | "m4a" | "ogg" | "webm"`
  - `size_bytes`: `integer > 0`
  - `duration_seconds`: `number >= 0` (opsiyonel/tespit edilebildiğinde)
- **Hata Kodları:** `INVALID_AUDIO_FORMAT`, `AUDIO_TOO_LARGE`, `EMPTY_OR_CORRUPT_AUDIO`.

---

### 6. Geliştirme Kuralları

1. **İstemci Uzantısına Güvenme:** `.mp3` uzantılı bir metin veya çalıştırılabilir dosya yüklendiğinde imza/başlık doğrulaması bunu reddetmelidir.
2. **Düşük Donanım Prensibi:** Ağır ses yeniden kodlama (transcoding) işlemlerini zorunlu kılma; yalnızca ASR sağlayıcısının gerektirdiği hafif doğrulama ve hazırlık işlemlerini uygula.
3. **Kalıcı Saklama Yapma:** `audio/` klasörü dosyaları kalıcı diske kendisi kaydetmez; saklama sorumluluğu [`storage/`](../storage/agent.md) modülündedir.
4. **Testler:** Geçerli ses başlıkları, aşırı büyük dosya, boş dosya ve sahte uzantılı dosya senaryoları için birim testleri yazılmalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `audio/` modül iskeleti ve doğrulama sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `audio/` klasörü ve ses doğrulama/hazırlama sınırlarını tanımlayan `agent.md` oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `audio/agent.md`
- **Neden yapıldı:** Ses dosyası doğrulama ve güvenlik kontrollerini transkripsiyon (`transcription/`) ve depolama (`storage/`) katmanlarından ayırmak için.
- **Teknik olarak nasıl uygulandı:** `shared/contracts.schema.json` içindeki `AudioMetadata` ve ilgili hata kodları ile uyumlu arayüz sözleşmesi tanımlandı.
- **Diğer modüllere etkisi:** `backend/` yükleme akışı dosyayı `storage/` ve `transcription/` katmanlarına göndermeden önce bu modülü kullanacaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

