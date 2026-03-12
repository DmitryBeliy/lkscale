#!/usr/bin/env node

/**
 * Supabase Migration Script
 * Разбивает большие SQL файлы на части и выполняет миграцию
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const CHUNKS_DIR = path.join(MIGRATIONS_DIR, 'chunks');
const OUTPUT_DIR = path.join(__dirname, '..', 'supabase', 'migrations', 'ready');

// Создаём директорию для готовых файлов
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

const log = {
    info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`),
};

/**
 * Разбивает SQL файл на части по размеру
 * @param {string} inputPath - путь к входному файлу
 * @param {string} outputPrefix - префикс для выходных файлов
 * @param {number} maxSizeBytes - максимальный размер части (default: 350KB)
 */
function splitSqlFile(inputPath, outputPrefix, maxSizeBytes = 350 * 1024) {
    const content = fs.readFileSync(inputPath, 'utf8');
    const lines = content.split('\n');
    
    let partNumber = 1;
    let currentContent = '';
    let currentSize = 0;
    const parts = [];
    
    // Находим начало INSERT (пропускаем комментарии в начале)
    let inInsert = false;
    let header = '';
    
    for (const line of lines) {
        // Сохраняем заголовок (комментарии до первого INSERT)
        if (!inInsert && !line.trim().startsWith('INSERT')) {
            header += line + '\n';
            continue;
        }
        
        inInsert = true;
        const lineSize = Buffer.byteLength(line + '\n', 'utf8');
        
        // Если добавление этой строки превысит лимит - сохраняем текущую часть
        if (currentSize + lineSize > maxSizeBytes && currentContent.includes('VALUES')) {
            // Закрываем текущий INSERT
            let partContent = header + currentContent.trim();
            if (partContent.endsWith(',')) {
                partContent = partContent.slice(0, -1) + ';';
            } else if (!partContent.endsWith(';')) {
                partContent += ';';
            }
            
            const outputPath = path.join(OUTPUT_DIR, `${outputPrefix}_part${partNumber.toString().padStart(3, '0')}.sql`);
            fs.writeFileSync(outputPath, partContent);
            parts.push(outputPath);
            
            log.info(`Создан файл: ${path.basename(outputPath)} (${(currentSize / 1024).toFixed(1)} KB)`);
            
            // Начинаем новую часть
            partNumber++;
            currentContent = '';
            currentSize = 0;
        }
        
        currentContent += line + '\n';
        currentSize += lineSize;
    }
    
    // Сохраняем последнюю часть
    if (currentContent.trim()) {
        let partContent = header + currentContent.trim();
        if (partContent.endsWith(',')) {
            partContent = partContent.slice(0, -1) + ';';
        } else if (!partContent.endsWith(';')) {
            partContent += ';';
        }
        
        const outputPath = path.join(OUTPUT_DIR, `${outputPrefix}_part${partNumber.toString().padStart(3, '0')}.sql`);
        fs.writeFileSync(outputPath, partContent);
        parts.push(outputPath);
        
        log.info(`Создан файл: ${path.basename(outputPath)} (${(currentSize / 1024).toFixed(1)} KB)`);
    }
    
    return parts;
}

/**
 * Копирует файл в output директорию если он меньше лимита
 */
function copySmallFile(inputPath, outputName) {
    const content = fs.readFileSync(inputPath, 'utf8');
    const size = Buffer.byteLength(content, 'utf8');
    
    const outputPath = path.join(OUTPUT_DIR, outputName);
    fs.writeFileSync(outputPath, content);
    
    log.success(`${outputName} скопирован (${(size / 1024).toFixed(1)} KB)`);
    return outputPath;
}

/**
 * Получает размер файла в KB
 */
function getFileSizeKB(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size / 1024;
}

/**
 * Основная функция миграции
 */
async function prepareMigration() {
    log.step('Подготовка файлов миграции');
    
    // Очистка output директории
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, { recursive: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    
    log.info('Output директория очищена');
    
    // 1. Копируем setup и truncate
    log.step('Шаг 1: Подготовка setup файлов');
    copySmallFile(
        path.join(MIGRATIONS_DIR, '00_setup.sql'),
        '00_setup.sql'
    );
    copySmallFile(
        path.join(MIGRATIONS_DIR, '00_truncate.sql'),
        '00_truncate.sql'
    );
    
    // 2. Обрабатываем part файлы
    log.step('Шаг 2: Обработка part файлов');
    
    const partFiles = [
        { name: 'part_001.sql', maxSize: 350 },
        { name: 'part_002.sql', maxSize: 350 },
        { name: 'part_003.sql', maxSize: 350 },
        { name: 'part_004.sql', maxSize: 350 },
        { name: 'part_005.sql', maxSize: 350 },
        { name: 'part_006.sql', maxSize: 350 },
        { name: 'part_007.sql', maxSize: 350 },
        { name: 'part_008.sql', maxSize: 350 },
        { name: 'part_009.sql', maxSize: 350 },
    ];
    
    let totalParts = 2; // setup + truncate
    
    for (const { name, maxSize } of partFiles) {
        const filePath = path.join(CHUNKS_DIR, name);
        
        if (!fs.existsSync(filePath)) {
            log.warn(`Файл не найден: ${name}`);
            continue;
        }
        
        const sizeKB = getFileSizeKB(filePath);
        
        if (sizeKB > maxSize) {
            log.info(`${name} (${sizeKB.toFixed(1)} KB) - требуется разбиение`);
            const parts = splitSqlFile(filePath, name.replace('.sql', ''), maxSize * 1024);
            totalParts += parts.length;
        } else {
            log.success(`${name} (${sizeKB.toFixed(1)} KB) - копирование`);
            copySmallFile(filePath, name);
            totalParts++;
        }
    }
    
    // 3. Создаём манифест
    log.step('Шаг 3: Создание манифеста');
    
    const manifest = {
        created: new Date().toISOString(),
        files: fs.readdirSync(OUTPUT_DIR)
            .filter(f => f.endsWith('.sql'))
            .map(f => ({
                name: f,
                sizeKB: getFileSizeKB(path.join(OUTPUT_DIR, f)),
                path: `supabase/migrations/ready/${f}`
            }))
            .sort((a, b) => {
                // Сортировка: 00_setup.sql, 00_truncate.sql, затем part файлы
                if (a.name === '00_setup.sql') return -1;
                if (b.name === '00_setup.sql') return 1;
                if (a.name === '00_truncate.sql') return -1;
                if (b.name === '00_truncate.sql') return 1;
                return a.name.localeCompare(b.name);
            })
    };
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    
    log.success(`Манифест создан: ${manifest.files.length} файлов`);
    
    // 4. Выводим итог
    log.step('Готово! Созданные файлы:');
    manifest.files.forEach((f, i) => {
        console.log(`  ${i + 1}. ${f.name} (${f.sizeKB.toFixed(1)} KB)`);
    });
    
    console.log(`\n${colors.green}✓ Все файлы готовы в:${colors.reset} ${OUTPUT_DIR}`);
    console.log(`${colors.cyan}➤ Следующий шаг:${colors.reset} Выполните SQL файлы по порядку в Supabase SQL Editor`);
    
    return manifest;
}

// Запуск
prepareMigration().catch(err => {
    log.error(err.message);
    process.exit(1);
});
