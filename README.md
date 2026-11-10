# LectureAssistant 🎙️📚

> **Öğrenciler için AI Destekli, Doğrulanabilir ve Kaynak Zaman Damgalı Ders Çalışma Asistanı**

LectureAssistant, öğrencilerin ders ses kayıtlarını yükleyerek zaman damgalı transkriptler elde etmesini, yalnızca ders kaydında geçen bilgilere dayalı sorular sormasını ve verilen her cevabın dersin tam olarak hangi saniyesinden geldiğini görerek o bölümü doğrudan dinleyebilmesini sağlayan bir çalışma asistanıdır.

---

## 🌟 Temel Özellikler

- **Zaman Damgalı Transkripsiyon:** Yüklenen ses kayıtları konuşma segmentleri ve başlangıç/bitiş zamanlarıyla metne dönüştürülür.
- **Sıfır Halüsinasyon ve Kaynak Sadakati:** Sistem kayıtta bulunmayan hiçbir bilgiyi biliyormuş gibi cevaplamaz. Soru derste geçmiyorsa açıkça belirtilir (`unanswerable_from_recording`).
- **Deterministik Kaynak Doğrulama (`chunk_id`):** LLM'lerin rastgele zaman damgası uydurması mimari düzeyde engellenmiştir. Model yalnızca referans `chunk_id` kimliklerini döndürür; gerçek zaman damgaları sistem verisinden çözümlenir.
- **Tıklanabilir Ses Oynatıcı:** Verilen her cevabın dayandığı konuşma parçası zaman aralığıyla (`Citation`) gösterilir; tıklandığında ses oynatıcı doğrudan ilgili saniyeden çalmaya başlar.
- **Sağlayıcı Bağımsızlığı (Provider-Agnostic):** Ses işleme (ASR: Gemini Transcribe, Groq Whisper, OpenAI) ve dil modelleri (LLM: Gemini, OpenAI, Groq, Cerebras) iş mantığından tamamen soyutlanmıştır.
- **P1 Çalışma Materyalleri:** Çoktan seçmeli quiz, flashcard ve Map-Reduce tabanlı ders özeti üretimi.

---

## 🏛️ Mimari ve Üç Seviyeli Dokümantasyon Sistemi

Proje, hem geliştiricilerin hem de AI agent'ların kod tabanını baştan sona taramadan güvenle çalışabilmesi için **üç seviyeli bir dokümantasyon sistemi** ile tasarlanmıştır:

1. **[architecture.md](./architecture.md):** Projenin teknik mimari haritası, veri akışı diyagramları ve modül bazlı *"Nereye Bakmalıyım?"* rehberi.
2. **[prd.md](./prd.md):** Teknikten bağımsız ürün gereksinim dokümanı (P0 MVP kapsamı, P1 hedefleri, kullanıcı akışları ve gizlilik prensipleri).
3. **Klasör Bazlı `agent.md` Belgeleri:** Her klasörün içinde o klasörün amacını, içerik haritasını, çalışma mantığını, veri sözleşmelerini ve değişiklik geçmişini (Changelog) tutan kılavuzlar.

Teknik kararların gerekçeleri için [ADR-001: Modüler Alan Mimarisi ve Kaynak Doğrulama](./docs/adr-001-modular-provider-and-citation-architecture.md) belgesini inceleyebilirsiniz.

---

## 📁 Modüler Klasör Yapısı

```text
LectureAssistant/
├── architecture.md      # Ana teknik mimari haritası
├── prd.md               # Ürün gereksinim dokümanı
├── agent.md             # Kök çalışma kılavuzu ve kurallar
├── .env.example         # Ortam değişkenleri şablonu
├── audio/               # Ses dosyası doğrulama ve hazırlama
├── backend/             # API katmanı ve iş akışı orkestrasyonu
├── chunking/            # Zaman damgalı metin parçalama (chunk_id)
├── docs/                # Mimari Karar Kayıtları (ADR)
├── frontend/            # Kullanıcı arayüzü ve ses oynatıcı
├── providers/           # Harici AI sağlayıcı adaptörleri (asr/ & llm/)
├── qa/                  # Kaynaklı soru-cevap, Abstention ve doğrulama
├── retrieval/           # İndeksleme ve RAG arama
├── shared/              # Ortak veri sözleşmeleri (contracts.schema.json)
├── storage/             # Dosya ve veri saklama
├── study_materials/     # P1: Özet, Flashcard ve Quiz üretimi
└── tests/               # İskelet, sözleşme ve birim testleri
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js (v20+)

### Yapı ve Dokümantasyon Doğrulama Testi
```powershell
node --test tests/verify_skeleton.mjs
```

### Ortam Değişkenleri
Geliştirme için `.env.example` dosyasını `.env` olarak kopyalayın:
```powershell
cp .env.example .env
```
*(Gerçek API anahtarlarınızı yalnızca yerel `.env` dosyanızda tutun; `.env` dosyası Git tarafından yoksayılmaktadır).*

