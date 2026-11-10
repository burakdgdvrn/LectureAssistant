import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const EXPECTED_DIRECTORIES = [
  "frontend",
  "backend",
  "audio",
  "transcription",
  "chunking",
  "retrieval",
  "qa",
  "study_materials",
  "providers",
  "providers/asr",
  "providers/llm",
  "storage",
  "shared",
  "docs",
  "tests",
];

const MANDATORY_AGENT_MD_SECTIONS = [
  "### 1. Klasörün Amacı",
  "### 2. İçerik Haritası",
  "### 3. Çalışma Mantığı",
  "### 4. Bağımlılıklar",
  "### 5. Veri ve Arayüz Sözleşmeleri",
  "### 6. Geliştirme Kuralları",
  "### 7. Değişiklik Geçmişi (Changelog)",
];

function getAllDirectories(dirPath, relativeBase = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    const relPath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
    dirs.push(relPath);
    dirs.push(...getAllDirectories(path.join(dirPath, entry.name), relPath));
  }
  return dirs;
}

test("1. Kök dizin zorunlu belgeleri ve yapılandırma dosyaları mevcut olmalı", () => {
  const requiredRootFiles = [
    "architecture.md",
    "prd.md",
    "agent.md",
    ".env.example",
    ".gitignore",
  ];

  for (const file of requiredRootFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    assert.ok(fs.existsSync(fullPath), `Eksik kök dosya: ${file}`);
    const content = fs.readFileSync(fullPath, "utf8").trim();
    assert.ok(content.length > 100, `Kök dosya boş veya çok kısa: ${file}`);
  }
});

test("2. Mimari klasör yapısı eksiksiz olmalı ve yetim klasör bulunmamalı", () => {
  const actualDirs = getAllDirectories(ROOT_DIR).sort();
  const expectedDirs = [...EXPECTED_DIRECTORIES].sort();

  assert.deepEqual(
    actualDirs,
    expectedDirs,
    "Gerçek klasör yapısı ile beklenen mimari klasör yapısı uyuşmuyor."
  );
});

test("3. Kök dizin ve her alt klasörde 7 zorunlu bölümlü agent.md bulunmalı", () => {
  const allDirsWithRoot = [".", ...EXPECTED_DIRECTORIES];

  for (const relDir of allDirsWithRoot) {
    const agentMdPath = path.join(ROOT_DIR, relDir, "agent.md");
    assert.ok(
      fs.existsSync(agentMdPath),
      `${relDir} klasöründe agent.md bulunamadı.`
    );

    const content = fs.readFileSync(agentMdPath, "utf8");
    for (const sectionHeading of MANDATORY_AGENT_MD_SECTIONS) {
      assert.ok(
        content.includes(sectionHeading),
        `${relDir}/agent.md içinde zorunlu başlık eksik: "${sectionHeading}"`
      );
    }

    assert.ok(
      content.includes("Tarih:") &&
        content.includes("Yapılan değişiklik:") &&
        content.includes("Değiştirilen/eklenen dosyalar:") &&
        content.includes("Neden yapıldı:") &&
        content.includes("Teknik olarak nasıl uygulandı:") &&
        content.includes("Diğer modüllere etkisi:") &&
        content.includes("Çalıştırılan testler ve sonuçları:"),
      `${relDir}/agent.md içinde standart formatta Changelog kaydı eksik.`
    );
  }
});

test("4. architecture.md 'Nereye Bakmalıyım?' rehberini ve tüm ana klasörleri içermeli", () => {
  const archContent = fs.readFileSync(
    path.join(ROOT_DIR, "architecture.md"),
    "utf8"
  );

  assert.ok(
    archContent.includes("Nereye Bakmalıyım?"),
    "architecture.md içinde 'Nereye Bakmalıyım?' bölümü bulunamadı."
  );

  for (const dir of EXPECTED_DIRECTORIES) {
    assert.ok(
      archContent.includes(`${dir}/`),
      `architecture.md içinde '${dir}/' klasörüne referans bulunamadı.`
    );
  }
});

test("5. prd.md P0/P1/P2 önceliklerini ve kayıt dışı bilgi üretmeme ilkesini içermeli", () => {
  const prdContent = fs.readFileSync(path.join(ROOT_DIR, "prd.md"), "utf8");

  assert.ok(prdContent.includes("P0"), "prd.md içinde P0 kapsamı eksik.");
  assert.ok(prdContent.includes("P1"), "prd.md içinde P1 kapsamı eksik.");
  assert.ok(prdContent.includes("P2"), "prd.md içinde P2 kapsamı eksik.");
  assert.ok(
    prdContent.includes("kayıtta bulunmayan") ||
      prdContent.includes("ders kaydında bulunmayan"),
    "prd.md içinde kayıtta bulunmayan bilgilere cevap vermeme ilkesi eksik."
  );
});

test("6. .env.example ve .gitignore güvenlik kurallarını sağlamalı", () => {
  const envExample = fs.readFileSync(
    path.join(ROOT_DIR, ".env.example"),
    "utf8"
  );
  const gitignore = fs.readFileSync(path.join(ROOT_DIR, ".gitignore"), "utf8");

  assert.ok(
    envExample.includes("ASR_PROVIDER=") &&
      envExample.includes("LLM_PROVIDER="),
    ".env.example içinde ASR_PROVIDER ve LLM_PROVIDER tanımları bulunmalı."
  );

  assert.ok(
    !envExample.match(/sk-[a-zA-Z0-9]{20,}/) &&
      !envExample.match(/AIza[a-zA-Z0-9_-]{30,}/) &&
      !envExample.match(/gsk_[a-zA-Z0-9]{20,}/),
    ".env.example içinde gerçek bir API anahtarı tespit edildi!"
  );

  assert.ok(
    gitignore.includes(".env") && gitignore.includes("!.env.example"),
    ".gitignore dosyası .env dosyasını gizlemeli ve .env.example dosyasını korumalı."
  );
});

test("7. shared/contracts.schema.json geçerli JSON olmalı ve chunk_id / zaman damgası kurallarını zorunlu kılmalı", () => {
  const schemaRaw = fs.readFileSync(
    path.join(ROOT_DIR, "shared", "contracts.schema.json"),
    "utf8"
  );
  const schema = JSON.parse(schemaRaw);
  const defs = schema.$defs;

  assert.ok(defs, "contracts.schema.json içinde $defs bulunamadı.");

  // TranscriptChunk içinde chunk_id, start_time, end_time zorunlu olmalı
  assert.ok(defs.TranscriptChunk, "TranscriptChunk şeması eksik.");
  for (const field of ["chunk_id", "lecture_id", "start_time", "end_time", "text"]) {
    assert.ok(
      defs.TranscriptChunk.required.includes(field),
      `TranscriptChunk.required içinde '${field}' alanı zorunlu olmalı.`
    );
  }

  // LLMGroundedAnswerPayload içinde cited_chunk_ids zorunlu olmalı, start_time/end_time OLMAMALI
  assert.ok(
    defs.LLMGroundedAnswerPayload,
    "LLMGroundedAnswerPayload şeması eksik."
  );
  assert.ok(
    defs.LLMGroundedAnswerPayload.required.includes("cited_chunk_ids"),
    "LLMGroundedAnswerPayload içinde cited_chunk_ids zorunlu olmalı."
  );
  assert.equal(
    defs.LLMGroundedAnswerPayload.properties.start_time,
    undefined,
    "LLM ham çıktı şemasında start_time bulunmamalı (LLM zaman damgası uyduramaz)."
  );
  assert.equal(
    defs.LLMGroundedAnswerPayload.properties.end_time,
    undefined,
    "LLM ham çıktı şemasında end_time bulunmamalı (LLM zaman damgası uyduramaz)."
  );

  // Citation içinde chunk_id, start_time, end_time zorunlu olmalı
  assert.ok(defs.Citation, "Citation şeması eksik.");
  for (const field of ["chunk_id", "start_time", "end_time", "quote_text"]) {
    assert.ok(
      defs.Citation.required.includes(field),
      `Citation.required içinde '${field}' alanı zorunlu olmalı.`
    );
  }

  // QAResponse status alanı answered ve unanswerable_from_recording desteklemeli
  assert.deepEqual(
    defs.QAResponse.properties.status.enum,
    ["answered", "unanswerable_from_recording"],
    "QAResponse.status hem answered hem unanswerable_from_recording durumunu içermeli."
  );
});

