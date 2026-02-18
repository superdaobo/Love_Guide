const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let db = null;
const DB_FILE = path.join(__dirname, 'database.sqlite');

async function initDatabase() {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_FILE)) {
        const fileBuffer = fs.readFileSync(DB_FILE);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
        
        db.run(`
            CREATE TABLE IF NOT EXISTS methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                difficulty TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                date DATE,
                mood TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                priority TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS countdowns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date DATE,
                type TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS ai_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_key TEXT,
                api_endpoint TEXT,
                model TEXT,
                system_prompt TEXT
            )
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const defaultMethods = [
            ['一起做饭', '一起下厨做一顿美食，增进感情', '日常', '简单'],
            ['看电影', '一起看一部浪漫电影，分享感受', '娱乐', '简单'],
            ['周末旅行', '计划一次周末小旅行，创造美好回忆', '出行', '中等'],
            ['写情书', '亲手写一封情书，表达爱意', '浪漫', '简单'],
            ['学习新技能', '一起学习一项新技能，共同成长', '成长', '中等']
        ];
        
        defaultMethods.forEach(m => {
            db.run('INSERT INTO methods (title, description, category, difficulty) VALUES (?, ?, ?, ?)', m);
        });
        
        const defaultCases = [
            ['第一次约会', '选择一个安静舒适的咖啡厅，聊聊彼此的兴趣爱好...', '2024-01-15', '开心'],
            ['生日惊喜', '准备了一个小惊喜派对，邀请了她最好的朋友...', '2024-02-20', '感动']
        ];
        
        defaultCases.forEach(c => {
            db.run('INSERT INTO cases (title, content, date, mood) VALUES (?, ?, ?, ?)', c);
        });
        
        const defaultNotes = [
            ['记住重要日期', '生日、纪念日等重要日期一定要记住', '高'],
            ['倾听很重要', '当她说话时，认真倾听，不要打断', '高'],
            ['小惊喜', '偶尔准备一些小惊喜，不需要太贵重', '中']
        ];
        
        defaultNotes.forEach(n => {
            db.run('INSERT INTO notes (title, content, priority) VALUES (?, ?, ?)', n);
        });
        
        const defaultCountdowns = [
            ['恋爱纪念日', '2024-06-15', 'anniversary'],
            ['她的生日', '2024-08-20', 'birthday'],
            ['下次约会', '2024-03-10', 'date']
        ];
        
        defaultCountdowns.forEach(c => {
            db.run('INSERT INTO countdowns (name, date, type) VALUES (?, ?, ?)', c);
        });
        
        db.run(`INSERT INTO ai_config (api_key, api_endpoint, model, system_prompt) VALUES (?, ?, ?, ?)`, [
            '',
            'https://api.openai.com/v1/chat/completions',
            'gpt-3.5-turbo',
            '你是一个专业的恋爱顾问，帮助用户更好地与女朋友相处，提供温馨、体贴的建议。'
        ]);
        
        saveDatabase();
    }
    
    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_FILE, buffer);
    }
}

function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
        stmt.bind(params);
    }
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function queryOne(sql, params = []) {
    const results = queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
}

function runSql(sql, params = []) {
    db.run(sql, params);
    saveDatabase();
    return { lastInsertRowId: db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] };
}

app.get('/api/methods', (req, res) => {
    const methods = queryAll('SELECT * FROM methods ORDER BY created_at DESC');
    res.json(methods);
});

app.post('/api/methods', (req, res) => {
    const { title, description, category, difficulty } = req.body;
    const result = runSql(
        'INSERT INTO methods (title, description, category, difficulty) VALUES (?, ?, ?, ?)',
        [title, description, category, difficulty]
    );
    const method = queryOne('SELECT * FROM methods WHERE id = ?', [result.lastInsertRowId]);
    res.json(method);
});

app.put('/api/methods/:id', (req, res) => {
    const { title, description, category, difficulty } = req.body;
    runSql(
        'UPDATE methods SET title = ?, description = ?, category = ?, difficulty = ? WHERE id = ?',
        [title, description, category, difficulty, req.params.id]
    );
    const method = queryOne('SELECT * FROM methods WHERE id = ?', [req.params.id]);
    res.json(method);
});

app.delete('/api/methods/:id', (req, res) => {
    runSql('DELETE FROM methods WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/cases', (req, res) => {
    const cases = queryAll('SELECT * FROM cases ORDER BY date DESC');
    res.json(cases);
});

app.post('/api/cases', (req, res) => {
    const { title, content, mood } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const result = runSql(
        'INSERT INTO cases (title, content, date, mood) VALUES (?, ?, ?, ?)',
        [title, content, date, mood]
    );
    const caseItem = queryOne('SELECT * FROM cases WHERE id = ?', [result.lastInsertRowId]);
    res.json(caseItem);
});

app.put('/api/cases/:id', (req, res) => {
    const { title, content, date, mood } = req.body;
    runSql(
        'UPDATE cases SET title = ?, content = ?, date = ?, mood = ? WHERE id = ?',
        [title, content, date, mood, req.params.id]
    );
    const caseItem = queryOne('SELECT * FROM cases WHERE id = ?', [req.params.id]);
    res.json(caseItem);
});

app.delete('/api/cases/:id', (req, res) => {
    runSql('DELETE FROM cases WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/notes', (req, res) => {
    const notes = queryAll('SELECT * FROM notes ORDER BY priority DESC, created_at DESC');
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const { title, content, priority } = req.body;
    const result = runSql(
        'INSERT INTO notes (title, content, priority) VALUES (?, ?, ?)',
        [title, content, priority]
    );
    const note = queryOne('SELECT * FROM notes WHERE id = ?', [result.lastInsertRowId]);
    res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
    const { title, content, priority } = req.body;
    runSql(
        'UPDATE notes SET title = ?, content = ?, priority = ? WHERE id = ?',
        [title, content, priority, req.params.id]
    );
    const note = queryOne('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
    runSql('DELETE FROM notes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/countdowns', (req, res) => {
    const countdowns = queryAll('SELECT * FROM countdowns ORDER BY date ASC');
    const result = countdowns.map(c => {
        const targetDate = new Date(c.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...c, daysLeft: diffDays };
    });
    res.json(result);
});

app.post('/api/countdowns', (req, res) => {
    const { name, date, type } = req.body;
    const result = runSql(
        'INSERT INTO countdowns (name, date, type) VALUES (?, ?, ?)',
        [name, date, type]
    );
    const countdown = queryOne('SELECT * FROM countdowns WHERE id = ?', [result.lastInsertRowId]);
    res.json(countdown);
});

app.put('/api/countdowns/:id', (req, res) => {
    const { name, date, type } = req.body;
    runSql(
        'UPDATE countdowns SET name = ?, date = ?, type = ? WHERE id = ?',
        [name, date, type, req.params.id]
    );
    const countdown = queryOne('SELECT * FROM countdowns WHERE id = ?', [req.params.id]);
    res.json(countdown);
});

app.delete('/api/countdowns/:id', (req, res) => {
    runSql('DELETE FROM countdowns WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

app.get('/api/ai-config', (req, res) => {
    const config = queryOne('SELECT * FROM ai_config WHERE id = 1');
    res.json(config || {});
});

app.post('/api/ai-config', (req, res) => {
    const { api_key, api_endpoint, model, system_prompt } = req.body;
    const existing = queryOne('SELECT * FROM ai_config WHERE id = 1');
    
    if (existing) {
        runSql(
            'UPDATE ai_config SET api_key = ?, api_endpoint = ?, model = ?, system_prompt = ? WHERE id = 1',
            [api_key, api_endpoint, model, system_prompt]
        );
    } else {
        runSql(
            'INSERT INTO ai_config (id, api_key, api_endpoint, model, system_prompt) VALUES (1, ?, ?, ?, ?)',
            [api_key, api_endpoint, model, system_prompt]
        );
    }
    
    const config = queryOne('SELECT * FROM ai_config WHERE id = 1');
    res.json(config);
});

app.get('/api/chat-history', (req, res) => {
    const history = queryAll('SELECT * FROM chat_history ORDER BY created_at ASC LIMIT 50');
    res.json(history);
});

app.delete('/api/chat-history', (req, res) => {
    runSql('DELETE FROM chat_history');
    res.json({ success: true });
});

app.post('/api/ai-chat', async (req, res) => {
    const { message } = req.body;
    const config = queryOne('SELECT * FROM ai_config WHERE id = 1');
    
    if (!config || !config.api_key) {
        return res.status(400).json({ error: '请先配置 API Key' });
    }
    
    runSql('INSERT INTO chat_history (role, content) VALUES (?, ?)', ['user', message]);
    
    const history = queryAll('SELECT role, content FROM chat_history ORDER BY created_at ASC LIMIT 20');
    const messages = history.map(h => ({ role: h.role, content: h.content }));
    
    try {
        const response = await axios.post(config.api_endpoint, {
            model: config.model,
            messages: [
                { role: 'system', content: config.system_prompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${config.api_key}`,
                'Content-Type': 'application/json'
            }
        });
        
        const reply = response.data.choices[0].message.content;
        runSql('INSERT INTO chat_history (role, content) VALUES (?, ?)', ['assistant', reply]);
        
        res.json({ reply });
    } catch (error) {
        console.error('AI API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'AI 调用失败，请检查配置' });
    }
});

app.get('/api/stats', (req, res) => {
    const methodsCount = queryOne('SELECT COUNT(*) as count FROM methods')?.count || 0;
    const casesCount = queryOne('SELECT COUNT(*) as count FROM cases')?.count || 0;
    const notesCount = queryOne('SELECT COUNT(*) as count FROM notes')?.count || 0;
    
    const countdowns = queryAll('SELECT * FROM countdowns ORDER BY date ASC');
    let nextCountdown = null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const c of countdowns) {
        const targetDate = new Date(c.date);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
            nextCountdown = { ...c, daysLeft: diffDays };
            break;
        }
    }
    
    res.json({
        methodsCount,
        casesCount,
        notesCount,
        nextCountdown
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('数据库初始化失败:', err);
});
