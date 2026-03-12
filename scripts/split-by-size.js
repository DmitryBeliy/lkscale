#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'docs', 'base', 'migration_sql', 'migration_complete.sql');
const outputDir = path.join(__dirname, '..', 'docs', 'base', 'migration_sql', 'chunks');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sql = fs.readFileSync(inputFile, 'utf8');
const maxSize = 400 * 1024; // 400 KB max per file

// Split by INSERT statements
const parts = sql.split(/(?=INSERT INTO)/);

let currentChunk = '';
let chunkNum = 1;

parts.forEach((part, index) => {
  if ((currentChunk.length + part.length) > maxSize && currentChunk.length > 0) {
    // Save current chunk
    const chunkFile = path.join(outputDir, `part_${String(chunkNum).padStart(3, '0')}.sql`);
    fs.writeFileSync(chunkFile, currentChunk.trim());
    console.log(`Created: part_${String(chunkNum).padStart(3, '0')}.sql (${(currentChunk.length/1024).toFixed(1)} KB)`);
    
    chunkNum++;
    currentChunk = part;
  } else {
    currentChunk += part;
  }
});

// Save last chunk
if (currentChunk.length > 0) {
  const chunkFile = path.join(outputDir, `part_${String(chunkNum).padStart(3, '0')}.sql`);
  fs.writeFileSync(chunkFile, currentChunk.trim());
  console.log(`Created: part_${String(chunkNum).padStart(3, '0')}.sql (${(currentChunk.length/1024).toFixed(1)} KB)`);
}

console.log(`\nTotal chunks: ${chunkNum}`);
console.log('Execute in order via Supabase SQL Editor');
