const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = path.join(__dirname, 'database.sqlite');

const studentLongDistanceMethods = [
    { title: '一起上网课', description: '视频连线一起上网课，互相监督，下课还能讨论问题', category: '日常', difficulty: '简单' },
    { title: '共享学习计划', description: '制定共同的学习计划表，互相督促完成作业和复习', category: '成长', difficulty: '简单' },
    { title: '图书馆打卡', description: '每天在图书馆学习时拍张照片发给对方，一起努力', category: '日常', difficulty: '简单' },
    { title: '同步考试周', description: '考试周一起熬夜复习，互相打气加油', category: '成长', difficulty: '中等' },
    { title: '分享课堂趣事', description: '课堂上发生的有趣事情及时分享给对方', category: '日常', difficulty: '简单' },
    { title: '一起写作业', description: '视频一起写作业，遇到问题可以讨论', category: '成长', difficulty: '简单' },
    { title: '周末云约会', description: '周末一起看电影、听音乐、打游戏', category: '娱乐', difficulty: '简单' },
    { title: '寄明信片', description: '用学校的明信片写封信寄给对方', category: '浪漫', difficulty: '简单' },
    { title: '共享美食', description: '各自在学校食堂点相似的菜，视频一起吃', category: '日常', difficulty: '简单' },
    { title: '一起晨跑', description: '约定时间一起早起晨跑，视频打卡', category: '成长', difficulty: '中等' },
    { title: '参加线上活动', description: '一起参加线上讲座、比赛等活动', category: '成长', difficulty: '简单' },
    { title: '分享校园风景', description: '拍一拍学校的风景发给对方', category: '日常', difficulty: '简单' },
    { title: '组队学习', description: '和对方组队参加学科竞赛', category: '成长', difficulty: '中等' },
    { title: '互相批改作业', description: '写完作业互相检查，共同进步', category: '成长', difficulty: '简单' },
    { title: '分享书单', description: '互相推荐好书，一起阅读', category: '成长', difficulty: '简单' },
    { title: '约定见面时间', description: '约定国庆、寒假等假期见面', category: '浪漫', difficulty: '简单' },
    { title: '一起参加社团', description: '虽然异地但可以参加同类型的社团活动', category: '成长', difficulty: '中等' },
    { title: '分享课程表', description: '了解对方的课程安排，方便找时间聊天', category: '日常', difficulty: '简单' },
    { title: '云自习室', description: '开着视频一起上自习，就像在身边一样', category: '日常', difficulty: '简单' },
    { title: '互相送特产', description: '放假回来给对方带学校当地的特产', category: '浪漫', difficulty: '中等' },
    { title: '一起备考', description: '一起准备四六级、考研等重要考试', category: '成长', difficulty: '中等' },
    { title: '分享笔记', description: '整理好的笔记分享给对方', category: '成长', difficulty: '简单' },
    { title: '生日惊喜', description: '在对方生日时订蛋糕送到学校', category: '浪漫', difficulty: '中等' },
    { title: '一起参加线上班会', description: '如果可以的话，陪对方参加线上班会', category: '日常', difficulty: '简单' },
    { title: '云逛校园', description: '视频带着对方逛自己的校园', category: '浪漫', difficulty: '简单' },
    { title: '分享食堂美食', description: '今天食堂吃了什么拍给对方看', category: '日常', difficulty: '简单' },
    { title: '一起选课', description: '选课季帮对方一起参谋', category: '成长', difficulty: '简单' },
    { title: '互相鼓励', description: '对方遇到挫折时及时鼓励支持', category: '日常', difficulty: '简单' },
    { title: '分享获奖消息', description: '有什么好消息第一时间告诉对方', category: '日常', difficulty: '简单' },
    { title: '一起听讲座', description: '线上讲座一起听，听完讨论', category: '成长', difficulty: '简单' }
];

const chatMethods = [
    { title: '主动分享日常', description: '主动告诉对方今天发生了什么，哪怕是小事', category: '日常', difficulty: '简单' },
    { title: '认真倾听', description: '对方说话时认真听，不要打断', category: '日常', difficulty: '简单' },
    { title: '及时回应', description: '看到消息及时回复，不要让对方等太久', category: '日常', difficulty: '简单' },
    { title: '使用表情包', description: '适当使用表情包增加聊天趣味性', category: '娱乐', difficulty: '简单' },
    { title: '分享照片视频', description: '拍一些照片和小视频分享生活', category: '日常', difficulty: '简单' },
    { title: '询问对方感受', description: '多问问对方今天过得怎么样', category: '日常', difficulty: '简单' },
    { title: '记住细节', description: '记住对方说过的小事，让对方知道你在乎', category: '日常', difficulty: '中等' },
    { title: '语音消息', description: '偶尔发语音消息，比文字更温暖', category: '日常', difficulty: '简单' },
    { title: '视频通话', description: '经常视频通话，看到对方的表情', category: '日常', difficulty: '简单' },
    { title: '早晚安问候', description: '每天说早安和晚安', category: '日常', difficulty: '简单' },
    { title: '分享歌曲', description: '听到好听的歌分享给对方', category: '娱乐', difficulty: '简单' },
    { title: '讨论共同话题', description: '找你们都感兴趣的话题讨论', category: '娱乐', difficulty: '简单' },
    { title: '适当撒娇', description: '适当撒娇增加情趣', category: '浪漫', difficulty: '简单' },
    { title: '表达关心', description: '天凉了提醒加衣，生病了提醒吃药', category: '日常', difficulty: '简单' },
    { title: '分享梦想', description: '和对方分享你的梦想和规划', category: '成长', difficulty: '中等' },
    { title: '倾听烦恼', description: '对方有烦恼时认真倾听，给出建议', category: '日常', difficulty: '中等' },
    { title: '适时赞美', description: '不要吝啬赞美，让对方开心', category: '浪漫', difficulty: '简单' },
    { title: '制造期待', description: '说一些让对方期待的话，比如"等见面了我们..."', category: '浪漫', difficulty: '简单' },
    { title: '不敷衍', description: '认真回复，不要只发"嗯""哦"', category: '日常', difficulty: '简单' },
    { title: '分享趣事', description: '把看到的趣事分享给对方', category: '娱乐', difficulty: '简单' },
    { title: '适当吃醋', description: '适当吃醋让对方知道你在乎，但不要过度', category: '浪漫', difficulty: '中等' },
    { title: '说心里话', description: '偶尔说说心里话，让对方更了解你', category: '日常', difficulty: '中等' },
    { title: '分享美食', description: '吃到好吃的拍给对方看', category: '日常', difficulty: '简单' },
    { title: '一起追剧', description: '一起追同一部剧，讨论剧情', category: '娱乐', difficulty: '简单' },
    { title: '分享知识', description: '学到的新知识分享给对方', category: '成长', difficulty: '简单' },
    { title: '不查岗', description: '不要像查岗一样追问对方行踪', category: '成长', difficulty: '中等' },
    { title: '尊重隐私', description: '尊重对方的隐私，不强行看手机', category: '成长', difficulty: '中等' },
    { title: '不冷暴力', description: '吵架了不要冷战，主动沟通', category: '成长', difficulty: '中等' },
    { title: '不翻旧账', description: '吵架时不要翻旧账', category: '成长', difficulty: '中等' },
    { title: '不说狠话', description: '生气时也不要说伤害对方的话', category: '成长', difficulty: '中等' }
];

const comfortMethods = [
    { title: '她生气时先认错', description: '不管谁对谁错，先认错让她消气', category: '浪漫', difficulty: '简单' },
    { title: '不要讲道理', description: '她生气时不要讲道理，先哄好再说', category: '浪漫', difficulty: '简单' },
    { title: '说"我错了"', description: '直接说"我错了"，不要辩解', category: '浪漫', difficulty: '简单' },
    { title: '送小礼物', description: '准备一个小礼物哄她开心', category: '浪漫', difficulty: '中等' },
    { title: '说甜言蜜语', description: '多说一些甜言蜜语', category: '浪漫', difficulty: '简单' },
    { title: '抱抱她', description: '如果在身边，直接抱抱她', category: '浪漫', difficulty: '简单' },
    { title: '亲亲她', description: '在她额头或脸颊亲一下', category: '浪漫', difficulty: '简单' },
    { title: '买她爱吃的', description: '买她喜欢吃的东西给她', category: '浪漫', difficulty: '简单' },
    { title: '带她去吃好吃的', description: '带她去吃一顿好吃的大餐', category: '浪漫', difficulty: '中等' },
    { title: '陪她逛街', description: '陪她逛街买东西', category: '日常', difficulty: '中等' },
    { title: '帮她按摩', description: '帮她按摩肩膀或头部', category: '日常', difficulty: '简单' },
    { title: '帮她做家务', description: '主动帮她做家务', category: '日常', difficulty: '简单' },
    { title: '写情书', description: '写一封情书给她', category: '浪漫', difficulty: '中等' },
    { title: '唱首歌', description: '唱首她喜欢的歌', category: '浪漫', difficulty: '中等' },
    { title: '跳支舞', description: '跳支搞笑的舞逗她笑', category: '娱乐', difficulty: '中等' },
    { title: '讲笑话', description: '讲几个笑话逗她开心', category: '娱乐', difficulty: '简单' },
    { title: '看喜剧电影', description: '一起看一部喜剧电影', category: '娱乐', difficulty: '简单' },
    { title: '给她惊喜', description: '准备一个小惊喜', category: '浪漫', difficulty: '中等' },
    { title: '说"我爱你"', description: '认真地说"我爱你"', category: '浪漫', difficulty: '简单' },
    { title: '陪她聊天', description: '陪她聊她感兴趣的话题', category: '日常', difficulty: '简单' },
    { title: '听她倾诉', description: '认真听她倾诉，不要打断', category: '日常', difficulty: '简单' },
    { title: '给她安全感', description: '让她知道你会一直在', category: '浪漫', difficulty: '中等' },
    { title: '帮她解决问题', description: '帮她解决遇到的问题', category: '成长', difficulty: '中等' },
    { title: '送花', description: '送一束她喜欢的花', category: '浪漫', difficulty: '中等' },
    { title: '订外卖', description: '帮她订一份外卖', category: '日常', difficulty: '简单' },
    { title: '发红包', description: '发个红包哄她开心', category: '浪漫', difficulty: '简单' },
    { title: '写保证书', description: '写一份保证书，保证下次不会再犯', category: '浪漫', difficulty: '中等' },
    { title: '陪她散步', description: '陪她出去散散心', category: '日常', difficulty: '简单' },
    { title: '给她梳头', description: '帮她梳梳头', category: '日常', difficulty: '简单' },
    { title: '一起做饭', description: '一起做一顿饭', category: '日常', difficulty: '中等' }
];

const warningMethods = [
    { title: '不要"哦""嗯"敷衍', description: '不要只回复"哦""嗯"，会让对方觉得你不在乎', category: '成长', difficulty: '简单' },
    { title: '不要已读不回', description: '看到消息及时回复，不要让对方等', category: '成长', difficulty: '简单' },
    { title: '不要冷战', description: '吵架了不要冷战，主动沟通', category: '成长', difficulty: '中等' },
    { title: '不要翻旧账', description: '吵架时不要翻旧账', category: '成长', difficulty: '中等' },
    { title: '不要说分手', description: '分手两个字不要轻易说出口', category: '成长', difficulty: '高' },
    { title: '不要和异性暧昧', description: '和其他异性保持适当距离', category: '成长', difficulty: '高' },
    { title: '不要拿她和别人比较', description: '不要说"你看别人多好"', category: '成长', difficulty: '高' },
    { title: '不要贬低她', description: '多夸奖，少批评', category: '成长', difficulty: '高' },
    { title: '不要说谎', description: '即使是善意的谎言也尽量不要说', category: '成长', difficulty: '高' },
    { title: '不要忽略她的感受', description: '多关注她的情绪变化', category: '成长', difficulty: '高' },
    { title: '不要太自私', description: '多为她着想', category: '成长', difficulty: '中等' },
    { title: '不要太大男子主义', description: '平等对待，互相尊重', category: '成长', difficulty: '高' },
    { title: '不要沉迷游戏', description: '不要因为游戏忽略她', category: '成长', difficulty: '中等' },
    { title: '不要总是玩手机', description: '在一起时多陪陪她', category: '成长', difficulty: '中等' },
    { title: '不要敷衍了事', description: '答应的事情要做到', category: '成长', difficulty: '高' },
    { title: '不要说"多喝热水"', description: '不要只说"多喝热水"，要拿出实际行动', category: '成长', difficulty: '简单' },
    { title: '不要讲道理', description: '她生气时不要讲道理，先哄好再说', category: '成长', difficulty: '中等' },
    { title: '不要说"别闹了"', description: '她红着眼眶时说这句话等于原地自爆', category: '成长', difficulty: '高' },
    { title: '不要查岗', description: '不要像查岗一样追问对方行踪', category: '成长', difficulty: '中等' },
    { title: '不要看她手机', description: '尊重对方的隐私，不强行看手机', category: '成长', difficulty: '中等' },
    { title: '不要冷暴力', description: '吵架了不要冷战，主动沟通', category: '成长', difficulty: '高' },
    { title: '不要翻旧账', description: '吵架时不要翻旧账', category: '成长', difficulty: '中等' },
    { title: '不要说狠话', description: '生气时也不要说伤害对方的话', category: '成长', difficulty: '高' },
    { title: '不要和异性单独相处', description: '尽量避免和其他异性单独相处', category: '成长', difficulty: '中等' },
    { title: '不要提前任', description: '不要在对方面前提前任', category: '成长', difficulty: '高' },
    { title: '不要忘记重要日期', description: '生日、纪念日等重要日期一定要记住', category: '成长', difficulty: '高' },
    { title: '不要敷衍评价', description: '她问你怎么样时，不要只说"好看"，要添油加醋', category: '成长', difficulty: '简单' },
    { title: '不要小气', description: '不要想着自己会吃亏', category: '成长', difficulty: '中等' },
    { title: '不要无原则顺从', description: '不要一味无原则顺从，要有自己的原则', category: '成长', difficulty: '中等' },
    { title: '不要说要死要活的话', description: '不要说"没有你我活不了"之类的话', category: '成长', difficulty: '高' }
];

const caseMethods = [
    { title: '她来例假了', content: '不要只说"多喝热水"，要说"我给你买了红糖姜茶和暖宝宝，还有你爱吃的小蛋糕，等我一下就到"', date: '2024-03-01', mood: '温馨' },
    { title: '她心情不好', content: '不要问"你怎么了"，要说"我知道你现在很难受，我陪着你，想说话就说，不想说就靠在我身上"', date: '2024-03-05', mood: '温馨' },
    { title: '她生气了', content: '不要讲道理，直接说"我错了，你想怎么罚我都行，不要生气了好不好"', date: '2024-03-10', mood: '感动' },
    { title: '她想你了', content: '不要说"我也想你"，要说"我马上买票去找你，等我"', date: '2024-03-15', mood: '浪漫' },
    { title: '她累了', content: '不要说"休息一下"，要说"我来帮你按按肩膀，你好好休息"', date: '2024-03-20', mood: '温馨' },
    { title: '她受委屈了', content: '不要说"别跟她一般见识"，要说"谁欺负你了？我帮你出气"', date: '2024-03-25', mood: '感动' },
    { title: '她考试失利', content: '不要说"下次加油"，要说"一次考试而已，你在我心里永远是最棒的，走，我带你去吃好吃的"', date: '2024-04-01', mood: '开心' },
    { title: '她失眠了', content: '不要说"早点睡"，要说"我陪你聊聊天，等你睡着了我再挂"', date: '2024-04-05', mood: '温馨' },
    { title: '她饿了', content: '不要说"去吃东西"，要说"你想吃什么？我给你订外卖/我带你去吃"', date: '2024-04-10', mood: '开心' },
    { title: '她害怕了', content: '不要说"别怕"，要说"有我在，我会一直陪着你"', date: '2024-04-15', mood: '感动' },
    { title: '查岗式聊天', content: '错误："你在哪？跟谁在一起？什么时候回来？" 正确："在干嘛呢？想你了"', date: '2024-02-01', mood: '感动' },
    { title: '敷衍式回复', content: '错误："哦""嗯""好的" 正确："哇，这个好有趣！""原来是这样！""太厉害了！"', date: '2024-02-05', mood: '感动' },
    { title: '讲道理式哄人', content: '错误："你听我跟你讲道理..." 正确："我错了，你说什么都对"', date: '2024-02-10', mood: '感动' },
    { title: '冷战式处理', content: '错误：不回消息、冷战 正确：主动沟通，即使只是说"我们聊聊好吗"', date: '2024-02-15', mood: '感动' },
    { title: '比较式伤害', content: '错误："你看别人多好" 正确："你在我心里是最好的"', date: '2024-02-20', mood: '感动' }
];

async function addMoreMethods() {
    try {
        const SQL = await initSqlJs();
        
        if (!fs.existsSync(DB_FILE)) {
            console.log('数据库文件不存在！');
            return;
        }
        
        const fileBuffer = fs.readFileSync(DB_FILE);
        const db = new SQL.Database(fileBuffer);
        
        const insertMethod = db.prepare('INSERT INTO methods (title, description, category, difficulty) VALUES (?, ?, ?, ?)');
        for (const method of studentLongDistanceMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        for (const method of chatMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        for (const method of comfortMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        for (const method of warningMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        insertMethod.free();
        
        const insertCase = db.prepare('INSERT INTO cases (title, content, date, mood) VALUES (?, ?, ?, ?)');
        for (const c of caseMethods) {
            insertCase.run([c.title, c.content, c.date, c.mood]);
        }
        insertCase.free();
        
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_FILE, buffer);
        
        console.log(`成功添加 ${studentLongDistanceMethods.length} 个大学生异地恋方法！`);
        console.log(`成功添加 ${chatMethods.length} 个线上聊天技巧！`);
        console.log(`成功添加 ${comfortMethods.length} 个哄人方法！`);
        console.log(`成功添加 ${warningMethods.length} 个避雷方法！`);
        console.log(`成功添加 ${caseMethods.length} 个案例！`);
        console.log('全部添加完成！');
        
    } catch (error) {
        console.error('添加时出错:', error);
    }
}

addMoreMethods();
