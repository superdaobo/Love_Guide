const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = path.join(__dirname, 'database.sqlite');

const longDistanceMethods = [
    { title: '每天视频通话', description: '每天约定固定时间视频通话，即使只是简短的几分钟，让对方感觉就在身边', category: '日常', difficulty: '简单' },
    { title: '一起看电影', description: '使用同步播放软件一起看同一部电影，边看边讨论', category: '娱乐', difficulty: '简单' },
    { title: '分享日常', description: '随手拍一些日常照片和小视频，分享生活中的点滴', category: '日常', difficulty: '简单' },
    { title: '同步时间', description: '在同一时间做同样的事情，比如一起喝咖啡、一起吃饭', category: '浪漫', difficulty: '简单' },
    { title: '寄送小惊喜', description: '不定期寄送小礼物或手写情书，给对方惊喜', category: '浪漫', difficulty: '中等' },
    { title: '制定计划见面', description: '一起制定下次见面的计划，让彼此有期待', category: '浪漫', difficulty: '中等' },
    { title: '共同目标', description: '设定共同的目标，比如一起学习一门语言或技能', category: '成长', difficulty: '中等' },
    { title: '睡前聊天', description: '睡前通电话或语音，说晚安，分享一天的心情', category: '日常', difficulty: '简单' },
    { title: '互相信任', description: '建立信任是异地恋最重要的基础，不要猜疑', category: '成长', difficulty: '中等' },
    { title: '保持独立', description: '各自有自己的生活和朋友圈，不要把全部精力放在对方身上', category: '成长', difficulty: '中等' },
    { title: '表达思念', description: '直接告诉对方你想她了，不要害羞', category: '浪漫', difficulty: '简单' },
    { title: '制定规则', description: '一起制定一些相处规则，比如多久见一次面、吵架了怎么解决', category: '成长', difficulty: '中等' },
    { title: '一起打游戏', description: '一起玩在线游戏，增加互动和乐趣', category: '娱乐', difficulty: '简单' },
    { title: '送早餐', description: '远程为对方点一份早餐或外卖', category: '浪漫', difficulty: '简单' },
    { title: '记住细节', description: '记住对方说过的小事，让对方知道你在乎', category: '日常', difficulty: '简单' },
    { title: '一起读书', description: '一起读同一本书，然后分享感受', category: '成长', difficulty: '中等' },
    { title: '规划未来', description: '一起畅想和规划你们的未来，让彼此有奔头', category: '成长', difficulty: '中等' },
    { title: '分享音乐', description: '创建一个共享歌单，分享喜欢的音乐', category: '娱乐', difficulty: '简单' },
    { title: '突然出现', description: '如果条件允许，突然出现在对方面前给惊喜', category: '浪漫', difficulty: '中等' },
    { title: '写日记', description: '记录你们的故事，见面时交换', category: '浪漫', difficulty: '中等' },
    { title: '保持积极', description: '保持积极乐观的态度，不要传递负面情绪', category: '成长', difficulty: '中等' },
    { title: '互相鼓励', description: '在对方遇到困难时鼓励支持', category: '日常', difficulty: '简单' },
    { title: '视频约会', description: '精心准备一次视频约会，打扮一下，营造氛围', category: '浪漫', difficulty: '中等' },
    { title: '分享美食', description: '视频时一起吃饭，分享自己做的菜', category: '日常', difficulty: '简单' },
    { title: '约定暗号', description: '创造属于你们的专属暗号', category: '浪漫', difficulty: '简单' },
    { title: '一起健身', description: '视频一起运动健身', category: '成长', difficulty: '中等' },
    { title: '送晚安', description: '录一段语音或视频说晚安', category: '浪漫', difficulty: '简单' },
    { title: '一起旅行', description: '虽然异地也可以云旅行，看同一个地方的直播', category: '出行', difficulty: '简单' },
    { title: '分享穿搭', description: '分享今天的穿搭，给对方建议', category: '日常', difficulty: '简单' },
    { title: '一起学习', description: '视频一起学习或工作', category: '成长', difficulty: '简单' },
    { title: '送花', description: '在特殊日子送花到对方办公室或家', category: '浪漫', difficulty: '中等' },
    { title: '分享天气', description: '分享当地的天气和风景', category: '日常', difficulty: '简单' },
    { title: '制定纪念日', description: '创造属于你们的特殊纪念日', category: '浪漫', difficulty: '简单' },
    { title: '一起追剧', description: '一起追同一部剧，同步更新', category: '娱乐', difficulty: '简单' },
    { title: '分享梦境', description: '分享自己做的梦', category: '日常', difficulty: '简单' },
    { title: '送祝福', description: '在对方重要的日子送祝福和鼓励', category: '日常', difficulty: '简单' },
    { title: '一起做饭', description: '视频一起学做同一道菜', category: '日常', difficulty: '中等' },
    { title: '分享朋友', description: '让对方认识自己的朋友', category: '成长', difficulty: '中等' },
    { title: '规划见面', description: '每次见面都留下美好的回忆', category: '浪漫', difficulty: '中等' },
    { title: '保持联系', description: '即使很忙也要保持联系，不要让对方感到被忽视', category: '日常', difficulty: '简单' }
];

async function addLongDistanceMethods() {
    try {
        const SQL = await initSqlJs();
        
        if (!fs.existsSync(DB_FILE)) {
            console.log('数据库文件不存在！');
            return;
        }
        
        const fileBuffer = fs.readFileSync(DB_FILE);
        const db = new SQL.Database(fileBuffer);
        
        const insertMethod = db.prepare('INSERT INTO methods (title, description, category, difficulty) VALUES (?, ?, ?, ?)');
        for (const method of longDistanceMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        insertMethod.free();
        
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_FILE, buffer);
        
        console.log(`成功添加 ${longDistanceMethods.length} 个异地恋维持感情方法！`);
        
    } catch (error) {
        console.error('添加异地恋方法时出错:', error);
    }
}

addLongDistanceMethods();
