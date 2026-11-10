# `docs/` Klasörü Agent Kılavuzu (`agent.md`)

### 1. Klasörün Amacı

`docs/` klasörü, kök dizindeki [`architecture.md`](../architecture.md) ve [`prd.md`](../prd.md) dosyalarını şişirmeden saklanması gereken derinlemesine teknik belgeleri, **Mimari Karar Kayıtlarını (ADR - Architecture Decision Records)** ve sağlayıcı karşılaştırma/değerlendirme notlarını barındırır.

---

### 2. İçerik Haritası

| Dosya / Alt Klasör | Görevi |
| :--- | :--- |
| [`agent.md`](./agent.md) | Bu klasörün kullanım kılavuzu ve değişiklik geçmişi. |
| [`adr-001-modular-provider-and-citation-architecture.md`](./adr-001-modular-provider-and-citation-architecture.md) | `chunk_id` kaynak doğrulaması, ASR/LLM sağlayıcı ayrımı ve üç seviyeli dokümantasyon sisteminin mimari karar kaydı. |

---

### 3. Çalışma Mantığı

1. Proje genelini etkileyen önemli bir teknik karar alındığında (örn. backend framework seçimi, varsayılan ASR/LLM sağlayıcı seçimi veya arama algoritması kararı) bu klasöre `adr-00X-baslik.md` formatında yeni bir karar kaydı eklenir.
2. Kök dizindeki [`architecture.md`](../architecture.md) özeti güncel tutulur ve detaylar için bu klasördeki ADR dosyalarına bağlantı verilir.

---

### 4. Bağımlılıklar

- **Bu klasörün bağımlı olduğu modüller:** Yoktur (yalnızca dokümantasyon içerir).
- **Bu klasöre bağımlı olan modüller:** [`architecture.md`](../architecture.md) (referans bağlantısı olarak).

---

### 5. Veri ve Arayüz Sözleşmeleri

Her ADR belgesi şu standart bölümleri içermelidir:
1. `Durum` (`Önerildi` | `Kabul Edildi` | `Yürürlükten Kaldırıldı`), `Tarih`, `İlgili Belgeler`
2. `1. Bağlam ve Problem`
3. `2. Alınan Kararlar`
4. `3. Sonuçlar ve Etkiler`

---

### 6. Geliştirme Kuralları

1. **Kesinleşmemiş Kararları Kesinleşmiş Gibi Yazma:** Henüz değerlendirme aşamasında olan teknoloji seçenekleri ADR içinde açıkça "Aday / Değerlendiriliyor" olarak belirtilmelidir.
2. **Eski ADR Kayıtlarını Silme:** Bir mimari karar değiştiğinde eski ADR silinmez; durumu `Yürürlükten Kaldırıldı (Superseded by ADR-00Y)` olarak işaretlenir ve yeni ADR eklenir.

---

### 7. Değişiklik Geçmişi (Changelog)

#### 2026-11-10 – `docs/` klasörü ve `ADR-001` oluşturuldu
- **Tarih:** 2026-11-10
- **Yapılan değişiklik:** `docs/` klasörü, `docs/agent.md` ve `docs/adr-001-modular-provider-and-citation-architecture.md` oluşturuldu.
- **Değiştirilen/eklenen dosyalar:** `docs/agent.md`, `docs/adr-001-modular-provider-and-citation-architecture.md`
- **Neden yapıldı:** Temel mimari kararların (`chunk_id` doğrulaması, sağlayıcı izolasyonu ve üç seviyeli dokümantasyon) gerekçelerini kalıcı olarak kayıt altına almak için.
- **Teknik olarak nasıl uygulandı:** Standart ADR şablonuyla `adr-001` yazıldı ve `architecture.md` içerisinden referans verildi.
- **Diğer modüllere etkisi:** Tüm modüller `ADR-001` içindeki mimari prensiplere tabidir.
- **Çalıştırılan testler ve sonuçları:** `node --test tests/verify_skeleton.mjs` çalıştırıldı ve başarılı geçti.

