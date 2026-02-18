const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = path.join(__dirname, 'database.sqlite');

const moreCases = [
    { title: '第一次视频约会', content: '我们第一次视频约会，我特意打扮了一下，她也很用心。我们一起看了一部电影，边看边聊，感觉就像在身边一样。虽然隔着屏幕，但能看到她的笑容，我就很满足了。', date: '2024-01-05', mood: '开心' },
    { title: '第一次寄礼物', content: '她生日快到了，我精心挑选了一条她之前说过喜欢的项链。收到快递的那天，她拍了视频给我看，哭得稀里哗啦的，说我怎么这么懂她。那一刻，我觉得异地恋再辛苦也值得。', date: '2024-01-20', mood: '感动' },
    { title: '一起跨年', content: '跨年那天，我们视频到十二点，一起倒数。虽然不能一起放烟花，但我们各自在自己的城市看着烟花，视频里一起许愿。她说希望我们能早点结束异地恋，我说一定会的。', date: '2024-01-01', mood: '浪漫' },
    { title: '吵架后的和好', content: '那次吵架吵得很凶，我们都很激动。挂了电话后我冷静了一下，觉得自己不应该那样。我给她发了很多条长长的消息，认真反思了自己的问题，也表达了我有多在乎她。第二天早上她回复了我，说她也有错，我们和好了。从那以后，我们约定吵架不过夜。', date: '2024-02-10', mood: '感动' },
    { title: '第一次见面', content: '终于见面了！我在火车站等她，看到她出来的那一刻，我冲上去紧紧抱住了她。她在我怀里哭了，说终于见到我了。那几天我们过得特别开心，一起逛遍了我的城市。送她走的时候，我在火车站哭得像个傻子，但我知道，这只是暂时的。', date: '2024-02-14', mood: '感动' },
    { title: '一起上网课', content: '这学期有一门课我们选了一样的，虽然不在一个学校，但我们会一起上课。老师提问时我们会在视频里小声讨论，下课了一起写作业。感觉就像真的同学一样。', date: '2024-02-20', mood: '开心' },
    { title: '图书馆打卡', content: '我们约定每天晚上一起去图书馆学习，视频开着静音，偶尔抬头看看对方。累了就在视频里比个心，或者发个消息鼓励一下对方。那段时间我们的成绩都进步了很多。', date: '2024-03-01', mood: '温馨' },
    { title: '一起晨跑', content: '我们约定每天早上6点半一起晨跑，虽然不在一个地方，但我们会同时开始，跑完步在视频里打卡。一开始我真的起不来，但想到她也在跑，我就有动力了。现在晨跑已经成了我们的习惯。', date: '2024-03-10', mood: '开心' },
    { title: '寄明信片', content: '我用学校的明信片写了一封长长的信给她，把我平时不好意思说的话都写下来了。她收到后拍给我看，说她哭了很久，把明信片夹在她的日记本里。现在我每到一个地方都会给她寄明信片。', date: '2024-03-15', mood: '浪漫' },
    { title: '共享美食', content: '我们发现两个学校食堂有一道很像的菜，于是约定同一天吃这道菜，视频里一起吃。虽然味道不完全一样，但感觉就像在一起吃饭一样。', date: '2024-03-20', mood: '温馨' },
    { title: '云逛校园', content: '我带着她逛了我的学校，从宿舍到教学楼，从食堂到图书馆，每一个地方都给她介绍。她说以后要来我的学校看看，走走我走过的路。', date: '2024-03-25', mood: '浪漫' },
    { title: '一起听讲座', content: '我们学校有一个线上讲座，我叫她一起听。听完后我们讨论了很久，分享了各自的想法。感觉我们的三观越来越合了。', date: '2024-04-01', mood: '开心' },
    { title: '她生病的时候', content: '她感冒发烧了，我特别着急，但又不在她身边。我给她订了药和粥，还一直陪着她视频，直到她睡着。第二天她好点了，说感觉我就在身边一样。', date: '2024-04-05', mood: '感动' },
    { title: '我生日那天', content: '我生日那天，我以为她忘了。结果零点刚过，她给我发了一条很长的视频，是她提前录好的，还有她给我准备的礼物。我一个大男生，哭得稀里哗啦的。', date: '2024-04-10', mood: '感动' },
    { title: '一起看星星', content: '那天晚上星星特别多，我拍了照片给她看。她说她们那里星星也很亮，于是我们视频一起看星星，对着星星许愿。那一刻，我觉得我们之间的距离一点都不远。', date: '2024-04-15', mood: '浪漫' },
    { title: '期末周一起熬夜', content: '期末周我们都很忙，每天一起熬夜复习。累了就在视频里聊几句，给对方加油打气。那段时间虽然辛苦，但有她陪着，我觉得很幸福。', date: '2024-04-20', mood: '温馨' },
    { title: '约定国庆见面', content: '我们早早地就开始规划国庆见面的行程，查攻略、订酒店、抢车票。每天都在倒计时，感觉日子过得特别慢，但一想到要见面了，就特别开心。', date: '2024-04-25', mood: '开心' },
    { title: '分享课程表', content: '我们把各自的课程表分享给对方，这样就能知道对方什么时候有空，不会打扰到对方上课。有时候看到对方没课，就会发个消息聊几句。', date: '2024-05-01', mood: '温馨' },
    { title: '一起参加线上活动', content: '我们报名参加了一个线上的知识竞赛，虽然不在一个队，但我们互相加油。最后我们都获奖了，特别开心。', date: '2024-05-05', mood: '开心' },
    { title: '互相送特产', content: '放假回来，我给她带了我们学校当地的特产，她也给我带了她们那里的好吃的。我们约定以后每次放假都要给对方带特产。', date: '2024-05-10', mood: '开心' },
    { title: '我吃醋了', content: '看到她和别的男生合影，我有点吃醋。我没有藏着掖着，直接告诉了她我的感受。她认真地跟我解释，还哄了我好久。从那以后，她会主动和我讲她和异性朋友的事情。', date: '2024-05-15', mood: '感动' },
    { title: '她吃醋了', content: '我发了一张和女同学的合影，她吃醋了。我赶紧跟她解释，还主动把手机给她看。哄了她好久，她才开心起来。我知道她是在乎我才会吃醋。', date: '2024-05-20', mood: '温馨' },
    { title: '一起看日出', content: '我们约定早起一起看日出，虽然不在一个地方，但我们同时起床，视频一起看太阳升起。那一刻，我觉得特别浪漫。', date: '2024-05-25', mood: '浪漫' },
    { title: '一起追剧', content: '我们一起追一部剧，每天同步更新，看完就一起讨论剧情。有时候会为了剧中的人物争论，但都是笑着争论的。', date: '2024-06-01', mood: '有趣' },
    { title: '分享梦想', content: '我们聊到了各自的梦想，发现我们的目标很一致。我们约定一起努力，为了我们的未来奋斗。', date: '2024-06-05', mood: '感动' },
    { title: '她陪我度过低谷', content: '那段时间我特别低落，觉得什么都不顺。她一直陪着我，鼓励我，听我倾诉。如果没有她，我真的不知道该怎么熬过来。', date: '2024-06-10', mood: '感动' },
    { title: '我陪她度过低谷', content: '她那段时间状态不好，我每天都陪着她，听她说话，给她加油打气。看到她慢慢好起来，我特别开心。', date: '2024-06-15', mood: '温馨' },
    { title: '恋爱一周年', content: '恋爱一周年那天，我偷偷买了票去看她。当我出现在她面前的时候，她惊呆了，然后抱着我哭了很久。那是我过得最开心的一个纪念日。', date: '2024-06-20', mood: '浪漫' },
    { title: '一起做饭', content: '虽然异地，但我们视频一起学做同一道菜。我做砸了，她做得很好吃。我们笑着说等见面了她做给我吃。', date: '2024-06-25', mood: '有趣' },
    { title: '一起写作业', content: '我们有一门课的作业是一样的，于是视频一起写。遇到问题就一起讨论，感觉效率特别高。最后我们的作业都得了高分。', date: '2024-07-01', mood: '开心' },
    { title: '分享书单', content: '我们互相推荐好书，然后一起读，读完分享感受。通过读书，我们更了解对方了。', date: '2024-07-05', mood: '温馨' },
    { title: '一起听音乐', content: '我们创建了一个共享歌单，把喜欢的歌都加进去。有时候会一起听歌，分享自己喜欢的歌词。', date: '2024-07-10', mood: '浪漫' },
    { title: '她给我惊喜', content: '我生日那天，她偷偷订了蛋糕送到我的学校。当我收到蛋糕的时候，特别感动。虽然不在身边，但她的心意我收到了。', date: '2024-07-15', mood: '感动' },
    { title: '我给她惊喜', content: '她生日那天，我提前录了很多朋友的祝福视频，还有我自己准备的惊喜。她看完哭得稀里哗啦的，说这是她过得最开心的生日。', date: '2024-07-20', mood: '浪漫' },
    { title: '一起逛超市', content: '我们视频一起逛各自学校的超市，给对方看自己想买什么，就像真的在一起逛超市一样。', date: '2024-07-25', mood: '温馨' },
    { title: '一起打游戏', content: '我们一起玩一款游戏，虽然技术都不好，但玩得特别开心。有时候会一起坑队友，笑得不行。', date: '2024-08-01', mood: '有趣' },
    { title: '一起看电影', content: '我们找到一个可以同步播放的软件，周末一起看电影，边看边讨论，感觉就像在电影院一样。', date: '2024-08-05', mood: '开心' },
    { title: '一起去图书馆', content: '我们约定周末一起去各自学校的图书馆学习，视频开着，偶尔抬头看看对方，累了就休息一下聊聊天。', date: '2024-08-10', mood: '温馨' },
    { title: '分享日常照片', content: '我们每天都会拍一些日常照片发给对方，比如今天吃了什么，天气怎么样，看到了什么有趣的事情。虽然不在身边，但感觉参与了对方的生活。', date: '2024-08-15', mood: '温馨' },
    { title: '早晚安问候', content: '我们每天都会说早安和晚安，即使再忙也不会忘记。这已经成了我们的习惯，感觉每一天都是从她开始，以她结束。', date: '2024-08-20', mood: '浪漫' },
    { title: '一起备考', content: '我们一起准备四六级考试，每天一起背单词，互相听写，互相批改。最后我们都考了不错的成绩。', date: '2024-08-25', mood: '开心' },
    { title: '一起做饭比赛', content: '我们视频一起做同一道菜，看谁做得更好吃。虽然我输了，但我们都很开心。', date: '2024-09-01', mood: '有趣' },
    { title: '分享课堂笔记', content: '我们会把各自整理的课堂笔记分享给对方，互相学习，共同进步。', date: '2024-09-05', mood: '温馨' },
    { title: '一起参加线上比赛', content: '我们一起参加了一个线上编程比赛，虽然没有获奖，但过程很开心，我们一起努力的感觉特别好。', date: '2024-09-10', mood: '开心' },
    { title: '约定下次见面', content: '我们已经开始规划寒假见面的行程了，每天都在倒计时，期待见面的那天。', date: '2024-09-15', mood: '开心' }
];

const moreComfortMethods = [
    { title: '异地恋：她生病时', description: '不在身边时，立刻给她订药、订粥、订水果，然后一直陪着她视频，直到她睡着', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：她心情不好时', description: '不要说"别难过"，要说"我知道你现在很难受，我陪着你，想说话就说，不想说就靠在我身上（视频里）"', category: '浪漫', difficulty: '简单' },
    { title: '异地恋：她生气时', description: '不要讲道理，直接说"我错了，你想怎么罚我都行，不要生气了好不好"，然后立刻给她订个小礼物', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：她想你时', description: '不要说"我也想你"，要说"我看看什么时候有空买票去找你"，然后真的去查车票', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：她累了时', description: '不要说"休息一下"，要说"我给你讲个笑话/唱首歌/陪你聊聊天，你好好放松"', category: '日常', difficulty: '简单' },
    { title: '异地恋：她受委屈时', description: '不要说"别跟她一般见识"，要说"谁欺负你了？告诉我，我帮你出气"，然后认真听她倾诉', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：她考试失利时', description: '不要说"下次加油"，要说"一次考试而已，你在我心里永远是最棒的，走，我带你云吃好吃的"', category: '日常', difficulty: '简单' },
    { title: '异地恋：她失眠时', description: '不要说"早点睡"，要说"我陪你聊聊天/给你讲故事/唱摇篮曲，等你睡着了我再挂"', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：她饿了时', description: '不要说"去吃东西"，要说"你想吃什么？我给你订外卖"，然后立刻给她订', category: '日常', difficulty: '简单' },
    { title: '异地恋：她害怕时', description: '不要说"别怕"，要说"有我在，我会一直陪着你，我们开着视频睡"', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：突然出现', description: '如果条件允许，偷偷买了票出现在她面前，这是最好的惊喜', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：订花到学校', description: '在她生日或纪念日，订一束花送到她的宿舍或教室', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：寄手写情书', description: '手写一封情书，比打字更有温度', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：录视频说晚安', description: '录一段视频说晚安，她睡前可以看', category: '浪漫', difficulty: '简单' },
    { title: '异地恋：一起云吃饭', description: '视频一起吃饭，就像真的在一起', category: '日常', difficulty: '简单' },
    { title: '异地恋：一起看电影', description: '用同步播放软件一起看电影', category: '娱乐', difficulty: '简单' },
    { title: '异地恋：一起打游戏', description: '一起玩游戏，增加互动', category: '娱乐', difficulty: '简单' },
    { title: '异地恋：一起学习', description: '视频一起学习，互相监督', category: '成长', difficulty: '简单' },
    { title: '异地恋：送她喜欢的零食', description: '记住她喜欢吃的零食，定期给她寄一箱', category: '日常', difficulty: '中等' },
    { title: '异地恋：记住她的生理期', description: '记住她的生理期，提前给她准备红糖姜茶和暖宝宝', category: '日常', difficulty: '中等' },
    { title: '异地恋：分享每一天', description: '主动分享自己的生活，让她感觉参与了你的生活', category: '日常', difficulty: '简单' },
    { title: '异地恋：认真听她说话', description: '她说话时认真听，不要打断，不要敷衍', category: '日常', difficulty: '简单' },
    { title: '异地恋：及时回复消息', description: '看到消息及时回复，不要让她等太久', category: '日常', difficulty: '简单' },
    { title: '异地恋：早晚安问候', description: '每天说早安和晚安，不要忘记', category: '日常', difficulty: '简单' },
    { title: '异地恋：偶尔发语音', description: '偶尔发语音消息，比文字更温暖', category: '日常', difficulty: '简单' },
    { title: '异地恋：经常视频通话', description: '经常视频通话，看到对方的表情', category: '日常', difficulty: '简单' },
    { title: '异地恋：给她安全感', description: '让她知道你会一直在，主动和异性保持距离', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要冷战', description: '吵架了不要冷战，主动沟通', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要翻旧账', description: '吵架时不要翻旧账', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要说分手', description: '分手两个字不要轻易说出口', category: '成长', difficulty: '高' },
    { title: '异地恋：规划见面', description: '一起规划下次见面，让彼此有期待', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：送她专属礼物', description: '定制一个专属礼物，比如刻名字的项链', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：一起听音乐', description: '创建共享歌单，一起听音乐', category: '娱乐', difficulty: '简单' },
    { title: '异地恋：一起追剧', description: '一起追同一部剧，同步更新', category: '娱乐', difficulty: '简单' },
    { title: '异地恋：分享梦想', description: '和对方分享你的梦想，一起规划未来', category: '成长', difficulty: '中等' },
    { title: '异地恋：互相鼓励', description: '对方遇到困难时及时鼓励支持', category: '日常', difficulty: '简单' },
    { title: '异地恋：记住细节', description: '记住对方说过的小事，让对方知道你在乎', category: '日常', difficulty: '中等' },
    { title: '异地恋：适当撒娇', description: '适当撒娇增加情趣', category: '浪漫', difficulty: '简单' },
    { title: '异地恋：表达关心', description: '天凉了提醒加衣，生病了提醒吃药', category: '日常', difficulty: '简单' },
    { title: '异地恋：制造期待', description: '说一些让对方期待的话，比如"等见面了我们..."', category: '浪漫', difficulty: '简单' },
    { title: '异地恋：不敷衍', description: '认真回复，不要只发"嗯""哦"', category: '日常', difficulty: '简单' },
    { title: '异地恋：分享趣事', description: '把看到的趣事分享给对方', category: '娱乐', difficulty: '简单' },
    { title: '异地恋：适当吃醋', description: '适当吃醋让对方知道你在乎，但不要过度', category: '浪漫', difficulty: '中等' },
    { title: '异地恋：说心里话', description: '偶尔说说心里话，让对方更了解你', category: '日常', difficulty: '中等' },
    { title: '异地恋：分享美食', description: '吃到好吃的拍给对方看', category: '日常', difficulty: '简单' },
    { title: '异地恋：分享知识', description: '学到的新知识分享给对方', category: '成长', difficulty: '简单' },
    { title: '异地恋：不查岗', description: '不要像查岗一样追问对方行踪', category: '成长', difficulty: '中等' },
    { title: '异地恋：尊重隐私', description: '尊重对方的隐私，不强行看手机', category: '成长', difficulty: '中等' },
    { title: '异地恋：不说狠话', description: '生气时也不要说伤害对方的话', category: '成长', difficulty: '高' }
];

const longDistanceWarningMethods = [
    { title: '异地恋：不要"哦""嗯"敷衍', description: '不要只回复"哦""嗯"，会让对方觉得你不在乎', category: '成长', difficulty: '简单' },
    { title: '异地恋：不要已读不回', description: '看到消息及时回复，不要让对方等太久', category: '成长', difficulty: '简单' },
    { title: '异地恋：不要冷战', description: '吵架了不要冷战，主动沟通', category: '成长', difficulty: '高' },
    { title: '异地恋：不要翻旧账', description: '吵架时不要翻旧账', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要说分手', description: '分手两个字不要轻易说出口', category: '成长', difficulty: '高' },
    { title: '异地恋：不要和异性暧昧', description: '和其他异性保持适当距离', category: '成长', difficulty: '高' },
    { title: '异地恋：不要拿对方和别人比较', description: '不要说"你看别人多好"', category: '成长', difficulty: '高' },
    { title: '异地恋：不要贬低对方', description: '多夸奖，少批评', category: '成长', difficulty: '高' },
    { title: '异地恋：不要说谎', description: '即使是善意的谎言也尽量不要说', category: '成长', difficulty: '高' },
    { title: '异地恋：不要忽略对方的感受', description: '多关注对方的情绪变化', category: '成长', difficulty: '高' },
    { title: '异地恋：不要太自私', description: '多为对方着想', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要沉迷游戏', description: '不要因为游戏忽略对方', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要总是玩手机', description: '视频时多看看对方，不要一直玩手机', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要敷衍了事', description: '答应的事情要做到', category: '成长', difficulty: '高' },
    { title: '异地恋：不要只说"多喝热水"', description: '不要只说"多喝热水"，要拿出实际行动', category: '成长', difficulty: '简单' },
    { title: '异地恋：不要讲道理', description: '对方生气时不要讲道理，先哄好再说', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要说"别闹了"', description: '对方红着眼眶时说这句话等于原地自爆', category: '成长', difficulty: '高' },
    { title: '异地恋：不要查岗', description: '不要像查岗一样追问对方行踪', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要强行看手机', description: '尊重对方的隐私，不强行看手机', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要说狠话', description: '生气时也不要说伤害对方的话', category: '成长', difficulty: '高' },
    { title: '异地恋：不要和异性单独相处', description: '尽量避免和其他异性单独相处', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要提前任', description: '不要在对方面前提前任', category: '成长', difficulty: '高' },
    { title: '异地恋：不要忘记重要日期', description: '生日、纪念日等重要日期一定要记住', category: '成长', difficulty: '高' },
    { title: '异地恋：不要小气', description: '不要想着自己会吃亏', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要无原则顺从', description: '不要一味无原则顺从，要有自己的原则', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要说要死要活的话', description: '不要说"没有你我活不了"之类的话', category: '成长', difficulty: '高' },
    { title: '异地恋：不要只有睡前才聊天', description: '不要只有睡前才想起对方，白天也可以分享', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要总是让对方主动', description: '感情是相互的，你也要主动', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要隐瞒自己的行踪', description: '主动告诉对方你在做什么，让对方安心', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要只分享开心的事', description: '不开心的事也可以分享，一起承担', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要总是要求对方改变', description: '接受对方的缺点，不要总是要求对方改变', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要忽略仪式感', description: '节日和纪念日要有仪式感', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要只想着见面', description: '过好各自的生活，一起成长', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要把对方当出气筒', description: '不要把自己的负面情绪发泄到对方身上', category: '成长', difficulty: '高' },
    { title: '异地恋：不要总是说"我很忙"', description: '即使忙也要抽时间陪对方，哪怕只是几分钟', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要敷衍对方的分享', description: '对方分享时认真回应，不要敷衍', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要和别人吐槽对方', description: '有问题直接和对方沟通，不要和别人吐槽', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要试探对方', description: '不要用各种方式试探对方是否爱你', category: '成长', difficulty: '中等' },
    { title: '异地恋：不要轻易放弃', description: '异地恋很难，但不要轻易放弃', category: '成长', difficulty: '高' }
];

const longDistanceMethods = [
    { title: '异地恋：每天视频通话', description: '每天约定固定时间视频通话，即使只是简短的几分钟', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起看电影', description: '使用同步播放软件一起看同一部电影，边看边讨论', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：分享日常', description: '随手拍一些日常照片和小视频，分享生活中的点滴', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：同步时间', description: '在同一时间做同样的事情，比如一起喝咖啡、一起吃饭', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：寄送小惊喜', description: '不定期寄送小礼物或手写情书，给对方惊喜', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：制定计划见面', description: '一起制定下次见面的计划，让彼此有期待', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：共同目标', description: '设定共同的目标，比如一起学习一门语言或技能', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：睡前聊天', description: '睡前通电话或语音，说晚安，分享一天的心情', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：互相信任', description: '建立信任是异地恋最重要的基础，不要猜疑', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：保持独立', description: '各自有自己的生活和朋友圈，不要把全部精力放在对方身上', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：表达思念', description: '直接告诉对方你想她了，不要害羞', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：制定规则', description: '一起制定一些相处规则，比如多久见一次面、吵架了怎么解决', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：一起打游戏', description: '一起玩在线游戏，增加互动和乐趣', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：送早餐', description: '远程为对方点一份早餐或外卖', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：记住细节', description: '记住对方说过的小事，让对方知道你在乎', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起读书', description: '一起读同一本书，然后分享感受', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：规划未来', description: '一起畅想和规划你们的未来，让彼此有奔头', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：分享音乐', description: '创建一个共享歌单，分享喜欢的音乐', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：突然出现', description: '如果条件允许，突然出现在对方面前给惊喜', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：写日记', description: '记录你们的故事，见面时交换', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：保持积极', description: '保持积极乐观的态度，不要传递负面情绪', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：互相鼓励', description: '在对方遇到困难时鼓励支持', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：视频约会', description: '精心准备一次视频约会，打扮一下，营造氛围', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：分享美食', description: '视频时一起吃饭，分享自己做的菜', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：约定暗号', description: '创造属于你们的专属暗号', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起健身', description: '视频一起运动健身', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：送晚安', description: '录一段语音或视频说晚安', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起旅行', description: '虽然异地也可以云旅行，看同一个地方的直播', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：分享穿搭', description: '分享今天的穿搭，给对方建议', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起学习', description: '视频一起学习或工作', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：送花', description: '在特殊日子送花到对方办公室或家', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：分享天气', description: '分享当地的天气和风景', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：制定纪念日', description: '创造属于你们的特殊纪念日', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起追剧', description: '一起追同一部剧，同步更新', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：分享梦境', description: '分享自己做的梦', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：送祝福', description: '在对方重要的日子送祝福和鼓励', category: '异地恋', difficulty: '简单' },
    { title: '异地恋：一起做饭', description: '视频一起学做同一道菜', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：分享朋友', description: '让对方认识自己的朋友', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：规划见面', description: '每次见面都留下美好的回忆', category: '异地恋', difficulty: '中等' },
    { title: '异地恋：保持联系', description: '即使很忙也要保持联系，不要让对方感到被忽视', category: '异地恋', difficulty: '简单' }
];

async function addEvenMoreData() {
    try {
        const SQL = await initSqlJs();
        
        if (!fs.existsSync(DB_FILE)) {
            console.log('数据库文件不存在！');
            return;
        }
        
        const fileBuffer = fs.readFileSync(DB_FILE);
        const db = new SQL.Database(fileBuffer);
        
        const insertMethod = db.prepare('INSERT INTO methods (title, description, category, difficulty) VALUES (?, ?, ?, ?)');
        for (const method of moreComfortMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        for (const method of longDistanceWarningMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        for (const method of longDistanceMethods) {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        }
        insertMethod.free();
        
        const insertCase = db.prepare('INSERT INTO cases (title, content, date, mood) VALUES (?, ?, ?, ?)');
        for (const c of moreCases) {
            insertCase.run([c.title, c.content, c.date, c.mood]);
        }
        insertCase.free();
        
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_FILE, buffer);
        
        console.log(`成功添加 ${moreCases.length} 个交流案例！`);
        console.log(`成功添加 ${moreComfortMethods.length} 个哄人方法！`);
        console.log(`成功添加 ${longDistanceWarningMethods.length} 个异地恋避雷方法！`);
        console.log(`成功添加 ${longDistanceMethods.length} 个异地恋专属方法！`);
        console.log('全部添加完成！');
        
    } catch (error) {
        console.error('添加时出错:', error);
    }
}

addEvenMoreData();
