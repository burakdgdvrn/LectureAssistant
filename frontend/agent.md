# `frontend/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`frontend/` klasörü, öğrencinin **LectureAssistant** ile etkileşime girdiği kullanıcı arayüzü katmanıdır.
- Ses dosyası yükleme ekranını, gizlilik/harici servis bilgilendirme onayını, zaman damgalı etkileşimli transkript görünümünü, kaynak kartlarıyla desteklenen soru-cevap (Q&A) arayüzünü, ilgili zaman aralığından (`start_time`) ses çalabilen oynatıcıyı ve P1 çalışma materyali (özet, flashcard, quiz) ekranlarını barındırır.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu, UI/UX sorumluluk sınırları ve değişiklik geçmişi. |

*(Not: Frontend framework seçimi kesinleştiğinde bileşenler (`AudioUploader`, `TimestampedPlayer`, `TranscriptViewer`, `GroundedQAPanel`, `CitationBadge`, `StudyMaterialsPanel`) ve API istemcisi bu klasöre eklenecektir.)*

---

### 3. Çalışma Mantığı

1. **Ses Yükleme ve Onay:** Kullanıcıdan ses dosyasını alır, istemci tarafında ön boyut/uzantı uyarısı yapar, harici AI işleme bilgilendirmesini gösterir ve dosyayı `backend/` API'sine (`POST /api/lectures`) gönderir.
2. **Zaman Damgalı Transkript ve Ses Oynatıcı Senkronizasyonu:**
   - `Transcript.segments` dizisini zaman damgalarıyla (`MM:SS`) listeler.
   - Bir transkript satırına veya bir cevabın altındaki `Citation` kartına tıklandığında, ses oynatıcıyı doğrudan `citation.start_time` saniyesine (`audioElement.currentTime = citation.start_time`) konumlandırıp oynatmayı başlatır.
3. **Kaynaklı Soru-Cevap Gösterimi:**
   - `QAResponse.status === "answered"` ise cevabı ve altında doğrulanan tüm `Citation` kartlarını (`start_time - end_time` ve `quote_text` ile) gösterir.
   - `QAResponse.status === "unanswerable_from_recording"` ise sorunun cevabının ders kaydında bulunmadığını belirten net bir bilgi kartı gösterir.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:**
  - Yalnızca [`backend/`](../backend/agent.md) tarafından sunulan HTTP API uç noktaları ve [`shared/contracts.schema.json`](../shared/contracts.schema.json) içinde tanımlı JSON veri şemaları.
- **Bu klasöre bağımlı olan modüller:** **Yoktur.** Hiçbir sunucu modülü `frontend/` klasörüne bağımlı olamaz.
- **Yasaklı bağımlılıklar:** `frontend/` hiçbir zaman doğrudan `providers/asr/`, `providers/llm/` veya `storage/` ile iletişim kuramaz; hiçbir AI API anahtarı (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `CEREBRAS_API_KEY`) frontend ortam değişkenlerine veya paketine dahil edilemez.

---

### 5. Veri ve Arayüz Sözleşmeleri

- İstemci, sunucudan gelen `Lecture`, `Transcript`, `QAResponse`, `Citation`, `SummaryResult`, `Flashcard`, `QuizQuestion` ve `StandardError` JSON nesnelerini [`shared/contracts.schema.json`](../shared/contracts.schema.json) şemasına uygun olarak tüketir.
- **Ses Oynatıcı Arayüz Kuralı:** `seekAndPlay(startTimeSeconds: number, endTimeSeconds?: number)` fonksiyonu `Citation.start_time` değerini doğrudan saniye cinsinden kabul etmelidir.

---

### 6. Geliştirme Kuralları

1. **Sıfır API Anahtarı:** İstemci kodunda hiçbir koşulda AI servis anahtarı veya doğrudan üçüncü parti AI API çağrısı bulunmamalıdır.
2. **Zaman Damgası Hesaplama Yasağı:** İstemci kendi başına kaynak zaman damgası tahmin etmez; yalnızca sunucudan gelen `Citation.start_time` ve `Citation.end_time` değerlerini biçimlendirip (`MM:SS` / `HH:MM:SS`) gösterir.
3. **Anlaşılır Hata Gösterimi:** Sunucudan dönen `StandardError.user_message` değeri kullanıcıya anlaşılır bir bildirim olarak gösterilmeli; ham JSON veya teknik hata kodları doğrudan ekrana basılmamalıdır.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – Proje adı LectureAssistant olarak güncellendi
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** Dokümantasyondaki proje adı referansı LectureAssistant olarak güncellendi.
- **Değiştirilen/eklenen dosyalar:** `frontend/agent.md`
- **Neden yapıldı:** Proje genelindeki isimlendirme güncellemesi.
- **Teknik olarak nasıl uygulandı:** İlgili metin referansı güncellendi.
- **Diğer modüllere etkisi:** Yok.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs`

#### 2026-11-10 – `frontend/` modül iskeleti ve ses-kaynak etkileşim sözleşmesi oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `frontend/` klasörü oluşturuldu; zaman damgalı ses oynatıcı, kaynak kartları ve güvenlik sınırları tanımlandı.
- **Değiştirilen/eklenen dosyalar:** `frontend/agent.md`
- **Neden yapıldı:** Kullanıcı arayüzü sorumluluklarını sunucu iş mantığından ve AI sağlayıcılarından tamamen ayırmak için.
- **Teknik olarak nasıl uygulandı:** `Citation` nesnesindeki `start_time` / `end_time` alanlarının ses oynatıcıyla senkronizasyon sözleşmesi belirlendi.
- **Diğer modüllere etkisi:** `backend/` API yanıtlarını bu sözleşmeye uygun olarak sunacaktır.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

