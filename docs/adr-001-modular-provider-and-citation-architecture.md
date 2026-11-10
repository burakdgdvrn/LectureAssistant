# ADR-001: Modüler Alan Mimarisi, Sağlayıcı Soyutlaması ve `chunk_id` Tabanlı Kaynak Doğrulama

- **Durum:** Kabul Edildi (Accepted)
- **Tarih:** 2026-11-10
- **İlgili Belgeler:** [`architecture.md`](../architecture.md), [`prd.md`](../prd.md), [`shared/contracts.schema.json`](../shared/contracts.schema.json)

---

## 1. Bağlam ve Problem

**LectureAssistant**, öğrencilerin ders ses kayıtlarını yükleyerek zaman damgalı transkript elde etmesini, yalnızca ders kaydındaki bilgilere dayalı soru-cevap yapmasını ve verilen cevapların hangi ses aralığından geldiğini görerek o bölümü doğrudan dinleyebilmesini sağlar.

Bu ürünü geliştirirken üç kritik mimari risk bulunmaktadır:

1. **Zaman Damgası ve Bilgi Halüsinasyonu Riski:** Büyük dil modelleri (LLM) doğrudan zaman aralığı (`14:22 - 15:10` gibi) üretmeye bırakıldığında gerçekte var olmayan zaman damgaları uydurabilmektedir. Ayrıca model, ders kaydında olmayan bir soruya kendi ön eğitim bilgisiyle cevap vererek öğrenciyi yanıltabilmektedir.
2. **Sağlayıcı Kilitlenmesi (Vendor Lock-in) ve Donanım Kısıtları:** Öğrenci bilgisayarlarının güçlü GPU/RAM donanımına sahip olduğu varsayılamaz. Öte yandan hem ASR (Gemini 3.5 Transcribe, Groq Whisper, OpenAI Transcription) hem de LLM (Gemini API, OpenAI API, Groq, Cerebras) tarafında hız, maliyet ve kalite dengesi sürekli değişmektedir.
3. **AI Agent ve Geliştirici Bilişsel Yükü:** Proje büyüdükçe bir özellik üzerinde çalışırken tüm kod tabanını baştan sona taramak hem zaman kaybına hem de modüller arası istenmeyen bağımlılıklara yol açmaktadır.

---

## 2. Alınan Kararlar

### Karar 1: Deterministik `chunk_id` Kaynak Doğrulaması (LLM Zaman Damgası Üretemez)
- `chunking/` modülü her transkript parçasına benzersiz bir `chunk_id` (`chk_...`) atar ve gerçek `start_time` / `end_time` değerlerini bu parçayla birlikte `storage/` katmanına kaydeder.
- `qa/` ve `study_materials/` modülleri LLM'den zaman damgası **istemez**; yalnızca kullanılan parçaların `chunk_id` kimliklerini (`cited_chunk_ids`) ister.
- Uygulama katmanı dönen `chunk_id` değerlerinin gerçekliğini doğrular ve saniye cinsinden `start_time` / `end_time` değerlerini kendi veri deposundan çözümler.

### Karar 2: RAG, Kaynak Doğrulama ve Cevap Verilememe (Abstention) Ayrımı
- İlgili ders parçalarını arama sorumluluğu `retrieval/` modülüne verilmiştir.
- Sağlanan parçaların soruyu yanıtlamak için yeterli olup olmadığına karar verme (`unanswerable_from_recording`), yanıt üretme ve `chunk_id` doğrulama sorumluluğu `qa/` modülüne verilmiştir.

### Karar 3: Ayrık ASR ve LLM Sağlayıcı Katmanları (`providers/asr/` & `providers/llm/`)
- Varsayılan çalışma modeli API tabanlı servislerdir; yerel model desteği P2 kapsamında aynı arayüzün yeni bir adaptörü olarak değerlendirilecektir.
- ASR ve LLM adaptörleri birbirinden ayrılmıştır; böylece farklı sağlayıcı kombinasyonları (örn. ASR için Groq Whisper + LLM için Gemini API) iş mantığı değişmeden kullanılabilir.

### Karar 4: Üç Seviyeli Yaşayan Dokümantasyon Sistemi
- Seviye 1: `ROOT/architecture.md` (Teknik harita ve "Nereye Bakmalıyım?" rehberi)
- Seviye 2: `ROOT/prd.md` (Teknikten bağımsız ürün gereksinimleri ve P0/P1/P2 kapsamı)
- Seviye 3: Her klasörde `agent.md` (Klasör kullanım kılavuzu, sözleşmeler ve zorunlu Changelog)

---

## 3. Sonuçlar ve Etkiler

- **Olumlu:** LLM'in uydurma zaman damgası üretmesi mimari olarak imkansız hale gelmiştir. Sağlayıcı değişiklikleri yalnızca `providers/` klasörüyle sınırlandırılmıştır. Bir AI agent yalnızca ilgili klasörün `agent.md` dosyasını okuyarak güvenle geliştirme yapabilir.
- **Ödünleşim (Trade-off):** Her klasörde `agent.md` ve Changelog güncelleme disiplini gerektirir; bu disiplin `tests/verify_skeleton.mjs` ile otomatik olarak denetlenir.

