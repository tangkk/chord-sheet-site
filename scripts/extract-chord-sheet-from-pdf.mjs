#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node scripts/extract-chord-sheet-from-pdf.mjs <input.pdf>');
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) usage();
if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

function extractWithGhostscript(pdfPath) {
  return execFileSync('gs', ['-sDEVICE=txtwrite', '-o', '-', pdfPath], { encoding: 'utf8' });
}

function normalizePdfText(raw) {
  return raw
    .replace(/\u3000/g, ' ')
    .replace(/\r/g, '')
    .replace(/^Page\s+\d+\s*$/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function main() {
  let extracted = '';

  try {
    extracted = extractWithGhostscript(inputPath);
  } catch (error) {
    console.error('Ghostscript text extraction failed.');
    console.error(String(error));
    process.exit(1);
  }

  const normalized = normalizePdfText(extracted);
  process.stdout.write(normalized + '\n');
  process.stderr.write('\n[info] extracted via Ghostscript txtwrite\n');
  process.stderr.write('[info] next step: review spacing / alignment before normalization\n');
}

main();
