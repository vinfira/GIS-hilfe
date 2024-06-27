const http = require('http');
const { parse } = require('url');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const hostname = '127.0.0.1';
const port = 3000;

let db;

async function openDatabase() {
    try {
        const dbFilePath = './myDatabase.db';
        db = await sqlite.open({
            filename: dbFilePath,
            driver: sqlite3.Database
        });
        console.log('SQLite-Datenbank erfolgreich geöffnet');
    } catch (error) {
        console.error('Fehler beim Öffnen der SQLite-Datenbank:', error.message);
    }
}

async function createTable() {
    try {
        await db.exec(`CREATE TABLE IF NOT EXISTS kühlschrank (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            expiry REAL NOT NULL,
        )`);
        console.log('Tabelle "kühlschrank" erfolgreich erstellt');
    } catch (error) {
        console.error('Fehler beim Erstellen der Tabelle:', error.message);
    }
}

const server = http.createServer(async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const { pathname, query } = parse(req.url, true);

    if (pathname === '/inhalt' && req.method === 'GET') {
        try {
            const rows = await db.all('SELECT * FROM inhalt');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        } catch (error) {
            console.error('Fehler beim Abrufen des Kühlschranks:', error.message);
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    } else if (pathname === '/addItem' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const newItem = JSON.parse(body);
            try {
                const result = await db.run('INSERT INTO inhalt (itemName, expiryDate) VALUES (?, ?)',
                    [newItem.name, newItem.expiry || '']);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Lebensmittel hinzugefügt', id: result.lastID }));
            } catch (error) {
                console.error('Fehler beim Hinzufügen des Lebensmittels:', error.message);
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        });
    } else if (pathname.startsWith('/remove') && req.method === 'DELETE') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { id } = JSON.parse(body);
            try {
                await db.run('DELETE FROM inhalt WHERE id = ?', id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Lebensmittel gelöscht', id }));
            } catch (error) {
                console.error('Fehler beim Löschen des Lebensmittels:', error.message);
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Page not found');
    }
});

async function startServer() {
    await openDatabase();
    await createTable();
    server.listen(port, hostname, () => {
        console.log(`Server läuft unter http://${hostname}:${port}/`);
    });
}

startServer();