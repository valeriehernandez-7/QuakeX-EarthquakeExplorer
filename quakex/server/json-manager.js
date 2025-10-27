/**
 * JSON Manager Server
 * Minimal Express server for saving JSON files to data directory
 * Used by frontend to persist enriched data for Apache Drill queries
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, '../data');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(DATA_DIR));

// CORS middleware for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'json-manager',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        dataDirectory: DATA_DIR
    });
});

/**
 * Save JSON data to file
 * POST /api/save-json
 * Body: { filename: string, data: any }
 */
app.post('/api/save-json', async (req, res) => {
    try {
        const { filename, data } = req.body;

        // Validate request
        if (!filename || typeof filename !== 'string') {
            return res.status(400).json({
                error: 'Invalid filename',
                details: 'Filename must be a non-empty string'
            });
        }

        if (!data) {
            return res.status(400).json({
                error: 'Invalid data',
                details: 'Data field is required'
            });
        }

        // Security: Validate filename format
        if (!isValidFilename(filename)) {
            return res.status(400).json({
                error: 'Invalid filename format',
                details: 'Filename can only contain letters, numbers, hyphens, underscores, and dots'
            });
        }

        const filepath = path.join(DATA_DIR, filename);

        // Ensure data directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        // Write file with proper formatting
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(filepath, jsonData, 'utf8');

        // Get file stats for response
        const stats = await fs.stat(filepath);

        console.log(`JSON file saved: ${filename} (${formatFileSize(stats.size)})`);

        res.json({
            success: true,
            filename,
            filepath,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            itemCount: Array.isArray(data) ? data.length : 1,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error saving JSON file:', error.message);

        res.status(500).json({
            error: 'Failed to save file',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * List available JSON files
 * GET /api/files
 */
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);

        const jsonFiles = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async (file) => {
                    const filepath = path.join(DATA_DIR, file);
                    const stats = await fs.stat(filepath);
                    return {
                        name: file,
                        size: stats.size,
                        sizeFormatted: formatFileSize(stats.size),
                        modified: stats.mtime,
                        isDirectory: stats.isDirectory()
                    };
                })
        );

        res.json({
            success: true,
            directory: DATA_DIR,
            files: jsonFiles,
            count: jsonFiles.length
        });

    } catch (error) {
        console.error('Error reading data directory:', error.message);
        res.status(500).json({
            error: 'Failed to read data directory',
            details: error.message
        });
    }
});

/**
 * Get JSON file content
 * GET /api/files/:filename
 */
app.get('/api/files/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // Validate filename
        if (!isValidFilename(filename)) {
            return res.status(400).json({
                error: 'Invalid filename format',
                details: 'Filename can only contain letters, numbers, hyphens, underscores, and dots'
            });
        }

        const filepath = path.join(DATA_DIR, filename);

        // Check if file exists
        try {
            await fs.access(filepath);
        } catch {
            return res.status(404).json({
                error: 'File not found',
                filename,
                timestamp: new Date().toISOString()
            });
        }

        // Read and return file content
        const content = await fs.readFile(filepath, 'utf8');
        const data = JSON.parse(content);
        const stats = await fs.stat(filepath);

        res.json({
            success: true,
            filename,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            itemCount: Array.isArray(data) ? data.length : 1,
            data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error reading JSON file:', error.message);
        res.status(500).json({
            error: 'Failed to read file',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Validate filename for security
 */
function isValidFilename(filename) {
    const validPattern = /^[a-zA-Z0-9_.\-]+\.json$/;
    return validPattern.test(filename) && !filename.includes('..');
}

/**
 * Format file size for human readability
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        availableEndpoints: {
            'GET /api/health': 'Service health check',
            'POST /api/save-json': 'Save JSON data to file',
            'GET /api/files': 'List available JSON files',
            'GET /api/files/:filename': 'Get JSON file content'
        },
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('JSON Manager Server started successfully');
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
    console.log('\nAvailable endpoints:');
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  POST http://localhost:${PORT}/api/save-json`);
    console.log(`  GET  http://localhost:${PORT}/api/files`);
    console.log(`  GET  http://localhost:${PORT}/api/files/:filename`);
    console.log('\nPress Ctrl+C to stop the server');
});