#!/usr/bin/env node
import { gzipSync } from "node:zlib";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(currentDir, "..");
const buildDir = path.join(appRoot, ".next");
const chunksDir = path.join(buildDir, "static", "chunks");

const MAX_GZ_BYTES = 200 * 1024;
const HERO_WEBGL_PATTERNS = [
  /three/i,
  /react-three[-_]fiber/i,
  /react-three[-_]drei/i,
  /HeroLiquidWebGL/,
];

const formatKb = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

const collectChunkFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectChunkFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
};

const isHeroWebglChunk = (filePath, contents) =>
  HERO_WEBGL_PATTERNS.some(
    (pattern) => pattern.test(filePath) || pattern.test(contents)
  );

const main = async () => {
  if (!(await exists(buildDir))) {
    console.error(
      `[check-hero-webgl-bundle] .next not found at ${buildDir}. Run \`next build\` first.`
    );
    process.exitCode = 2;
    return;
  }

  if (!(await exists(chunksDir))) {
    console.log(
      "[check-hero-webgl-bundle] No chunks directory yet — nothing to verify. PASS."
    );
    return;
  }

  const chunkFiles = await collectChunkFiles(chunksDir);
  if (chunkFiles.length === 0) {
    console.log("[check-hero-webgl-bundle] No chunk files found. PASS.");
    return;
  }

  let totalGz = 0;
  const matched = [];
  for (const file of chunkFiles) {
    const contents = await readFile(file);
    if (!isHeroWebglChunk(file, contents.toString("utf8"))) continue;
    const gz = gzipSync(contents).byteLength;
    matched.push({ file: path.relative(buildDir, file), gz });
    totalGz += gz;
  }

  if (matched.length === 0) {
    console.log(
      "[check-hero-webgl-bundle] No hero/WebGL chunks detected (three / r3f / drei / HeroLiquidWebGL). PASS."
    );
    return;
  }

  console.log("[check-hero-webgl-bundle] Hero WebGL chunks (gzipped):");
  for (const entry of matched) {
    console.log(`  ${entry.file} → ${formatKb(entry.gz)}`);
  }
  console.log(
    `[check-hero-webgl-bundle] Total: ${formatKb(totalGz)} / Budget: ${formatKb(MAX_GZ_BYTES)}`
  );

  if (totalGz > MAX_GZ_BYTES) {
    console.error(
      `[check-hero-webgl-bundle] FAIL — hero WebGL bundle ${formatKb(totalGz)} exceeds ${formatKb(MAX_GZ_BYTES)}.`
    );
    process.exitCode = 1;
    return;
  }

  console.log("[check-hero-webgl-bundle] PASS — within budget.");
};

await main();
