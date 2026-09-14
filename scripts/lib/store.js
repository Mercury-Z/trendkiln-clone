// store.js — JSON read/write helpers relative to the repo root.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..'); // repo root (E:\复刻钟政)
const DATA_DIR = path.join(ROOT, 'data');

function dataPath(name) {
  return path.join(DATA_DIR, name);
}

function readJson(name, fallback) {
  const p = dataPath(name);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(name, value) {
  const p = dataPath(name);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function readFileIfExists(name) {
  const p = dataPath(name);
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

module.exports = { ROOT, DATA_DIR, readJson, writeJson, readFileIfExists };
