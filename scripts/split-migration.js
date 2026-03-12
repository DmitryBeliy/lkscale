#!/usr/bin/env node

/**
 * Split large SQL migration file into smaller chunks
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'docs', 'base', 'migration_sql', 'migration_complete.sql');
const outputDir = path.join(__dirname, '..', 'docs', 'base', 'migration_sql', 'chunks');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read SQL file
const sql = fs.readFileSync(inputFile, 'utf8');

// Split by semicolon, keeping statements intact
const statements = sql.split(';').filter(s => s.trim().length > 0);

console.log(`Total statements: ${statements.length}`);

// Group statements into chunks (max 1000 statements per file)
const chunkSize = 1000;
const chunks = [];

for (let i = 0; i < statements.length; i += chunkSize) {
  chunks.push(statements.slice(i, i + chunkSize));
}

console.log(`Creating ${chunks.length} chunks...`);

// Write chunks
chunks.forEach((chunk, index) => {
  const chunkFile = path.join(outputDir, `chunk_${String(index + 1).padStart(3, '0')}.sql`);
  const content = chunk.map(s => s.trim() + ';').join('\n\n');
  fs.writeFileSync(chunkFile, content);
  console.log(`Created: ${chunkFile} (${chunk.length} statements)`);
});

console.log('\nDone! Run chunks in order:');
console.log('1. chunk_001.sql - CREATE TABLES');
console.log('2. chunk_002.sql - INSERT CATEGORIES, SUPPLIERS');
console.log('3. chunk_003.sql - INSERT PRODUCTS (part 1)');
console.log('... etc');
