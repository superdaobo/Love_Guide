const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = path.join(__dirname, 'database.sqlite');

const methodsData = [
    { title: '一起做饭', description: '一起下厨做一顿美食，增进感情', category: '日常', difficulty: '简单' },
    { title: '看电影', description: '一起看一部浪漫电影，分享感受', category: '娱乐', difficulty: '简单' },
    { title: '周末旅行', description: '计划一次周末小旅行，创造美好回忆', category: '出行', difficulty: '中等' },
    { title: '写情书', description: '亲手写一封情书，表达爱意', category: '浪漫', difficulty: '简单' },
    { title: '学习新技能', description: '一起学习一项新技能，共同成长', category: '成长', difficulty: '中等' },
    { title: '在众人面前拥抱', description: '在众人面前大方地给对方一个温暖的拥抱', category: '日常', difficulty: '简单' },
    { title: '互相依偎', description: '两人共处一室，整晚只是相互依偎、亲吻，不越界', category: '浪漫', difficulty: '简单' },
    { title: '泡一杯茶', description: '餐后一起用同一个杯子泡一杯茶，慢慢品味', category: '日常', difficulty: '简单' },
    { title: '写恋爱日记', description: '试着为对方写日记，哪怕只是简单的几个字', category: '成长', difficulty: '简单' },
    { title: '互相倾诉', description: '在情绪起伏时，抱着对方放声大哭，诉说内心的喜怒哀乐', category: '日常', difficulty: '中等' },
    { title: '短暂分开', description: '有时故意短暂分开一段时间，感受思念的滋味', category: '成长', difficulty: '中等' },
    { title: '一起走神', description: '一起看一部其实都不太感兴趣的电影，然后一起走神', category: '娱乐', difficulty: '简单' },
    { title: '说我爱你', description: '一定要亲口说出那句我爱你，不要吝啬表达', category: '浪漫', difficulty: '简单' },
    { title: '山顶相拥', description: '在山顶上紧紧相拥，背靠背仰望星空', category: '出行', difficulty: '中等' },
    { title: '专属铃声', description: '把对方的声音设成你的专属来电铃声', category: '浪漫', difficulty: '简单' },
    { title: '炫耀幸福', description: '适时地炫耀幸福，做一对让人羡慕的情侣', category: '浪漫', difficulty: '简单' },
    { title: '坦诚沟通', description: '敞开心扉，真实地表达自己的想法和感受', category: '日常', difficulty: '中等' },
    { title: '尊重边界', description: '学会尊重对方的边界，不去触碰对方的敏感点', category: '成长', difficulty: '中等' },
    { title: '寻找共同乐趣', description: '一起参与有趣的活动，分享快乐的时光', category: '娱乐', difficulty: '简单' },
    { title: '适度肢体接触', description: '适度的肢体接触，比如拥抱、牵手、亲吻', category: '日常', difficulty: '简单' },
    { title: '理解包容', description: '学会理解和包容，不去过于苛责对方', category: '成长', difficulty: '中等' },
    { title: '给予回报', description: '适当地给予回报，让对方觉得自己很特别', category: '日常', difficulty: '简单' },
    { title: '不要一成不变', description: '保持新鲜感，让对方觉得你有趣', category: '成长', difficulty: '中等' },
    { title: '保持浪漫', description: '让爱情始终保持浪漫，增加感情浓度', category: '浪漫', difficulty: '中等' },
    { title: '做美食', description: '女方想吃什么，就给女方做什么', category: '日常', difficulty: '中等' },
    { title: '制造惊喜', description: '偶尔的惊喜能让女生感动', category: '浪漫', difficulty: '中等' },
    { title: '了解对方', description: '了解女方的兴趣爱好，偶尔带她出去玩', category: '日常', difficulty: '简单' },
    { title: '一起散步', description: '晚上一起手牵手散步，聊聊心事', category: '日常', difficulty: '简单' },
    { title: '一起健身', description: '一起去健身房或者晨跑，互相监督', category: '成长', difficulty: '中等' },
    { title: '一起逛超市', description: '一起去超市采购，规划下周的食谱', category: '日常', difficulty: '简单' },
    { title: '一起做家务', description: '分工合作做家务，增加互动', category: '日常', difficulty: '简单' },
    { title: '一起打游戏', description: '一起玩一款游戏，享受欢乐时光', category: '娱乐', difficulty: '简单' },
    { title: '一起看日出', description: '早起一起看日出，感受大自然的美好', category: '出行', difficulty: '中等' },
    { title: '一起看星星', description: '晚上一起在阳台看星星', category: '浪漫', difficulty: '简单' },
    { title: '一起拍照片', description: '用相机记录下美好的瞬间', category: '娱乐', difficulty: '简单' },
    { title: '一起养宠物', description: '一起养一只小猫或小狗，共同照顾', category: '成长', difficulty: '中等' },
    { title: '一起种植', description: '一起种一盆花或蔬菜，看着它成长', category: '成长', difficulty: '简单' },
    { title: '一起学乐器', description: '一起学习弹奏一种乐器', category: '成长', difficulty: '中等' },
    { title: '一起画画', description: '一起画画，即使画得不好也没关系', category: '娱乐', difficulty: '简单' },
    { title: '一起拼图', description: '一起完成一幅拼图', category: '娱乐', difficulty: '简单' },
    { title: '一起做手工', description: '一起动手做一些手工制品', category: '娱乐', difficulty: '中等' },
    { title: '一起看展览', description: '一起去看艺术展览或博物馆', category: '出行', difficulty: '简单' },
    { title: '一起听音乐会', description: '一起去听一场音乐会', category: '出行', difficulty: '中等' },
    { title: '一起露营', description: '一起去露营，体验大自然', category: '出行', difficulty: '中等' },
    { title: '一起野餐', description: '在公园或郊外一起野餐', category: '出行', difficulty: '简单' },
    { title: '一起骑行', description: '一起骑自行车去周边探索', category: '出行', difficulty: '简单' },
    { title: '一起游泳', description: '夏天一起去游泳', category: '娱乐', difficulty: '简单' },
    { title: '一起滑雪', description: '冬天一起去滑雪', category: '出行', difficulty: '中等' },
    { title: '一起泡温泉', description: '一起去泡温泉放松', category: '出行', difficulty: '中等' },
    { title: '一起做SPA', description: '一起去做SPA，享受放松时光', category: '浪漫', difficulty: '中等' },
    { title: '一起去书店', description: '一起去书店，各自选一本喜欢的书', category: '成长', difficulty: '简单' },
    { title: '一起读书', description: '一起读同一本书，然后讨论', category: '成长', difficulty: '中等' },
    { title: '一起写愿望清单', description: '一起写下共同的愿望清单', category: '浪漫', difficulty: '简单' },
    { title: '一起规划未来', description: '一起规划未来的生活', category: '成长', difficulty: '中等' },
    { title: '一起做饭', description: '一起下厨做一顿美食，增进感情', category: '日常', difficulty: '简单' },
    { title: '看电影', description: '一起看一部浪漫电影，分享感受', category: '娱乐', difficulty: '简单' },
    { title: '周末旅行', description: '计划一次周末小旅行，创造美好回忆', category: '出行', difficulty: '中等' },
    { title: '写情书', description: '亲手写一封情书，表达爱意', category: '浪漫', difficulty: '简单' },
    { title: '学习新技能', description: '一起学习一项新技能，共同成长', category: '成长', difficulty: '中等' },
    { title: '在众人面前拥抱', description: '在众人面前大方地给对方一个温暖的拥抱', category: '日常', difficulty: '简单' },
    { title: '互相依偎', description: '两人共处一室，整晚只是相互依偎、亲吻，不越界', category: '浪漫', difficulty: '简单' },
    { title: '泡一杯茶', description: '餐后一起用同一个杯子泡一杯茶，慢慢品味', category: '日常', difficulty: '简单' },
    { title: '写恋爱日记', description: '试着为对方写日记，哪怕只是简单的几个字', category: '成长', difficulty: '简单' },
    { title: '互相倾诉', description: '在情绪起伏时，抱着对方放声大哭，诉说内心的喜怒哀乐', category: '日常', difficulty: '中等' },
    { title: '短暂分开', description: '有时故意短暂分开一段时间，感受思念的滋味', category: '成长', difficulty: '中等' },
    { title: '一起走神', description: '一起看一部其实都不太感兴趣的电影，然后一起走神', category: '娱乐', difficulty: '简单' },
    { title: '说我爱你', description: '一定要亲口说出那句我爱你，不要吝啬表达', category: '浪漫', difficulty: '简单' },
    { title: '山顶相拥', description: '在山顶上紧紧相拥，背靠背仰望星空', category: '出行', difficulty: '中等' },
    { title: '专属铃声', description: '把对方的声音设成你的专属来电铃声', category: '浪漫', difficulty: '简单' },
    { title: '炫耀幸福', description: '适时地炫耀幸福，做一对让人羡慕的情侣', category: '浪漫', difficulty: '简单' },
    { title: '坦诚沟通', description: '敞开心扉，真实地表达自己的想法和感受', category: '日常', difficulty: '中等' },
    { title: '尊重边界', description: '学会尊重对方的边界，不去触碰对方的敏感点', category: '成长', difficulty: '中等' },
    { title: '寻找共同乐趣', description: '一起参与有趣的活动，分享快乐的时光', category: '娱乐', difficulty: '简单' },
    { title: '适度肢体接触', description: '适度的肢体接触，比如拥抱、牵手、亲吻', category: '日常', difficulty: '简单' },
    { title: '理解包容', description: '学会理解和包容，不去过于苛责对方', category: '成长', difficulty: '中等' },
    { title: '给予回报', description: '适当地给予回报，让对方觉得自己很特别', category: '日常', difficulty: '简单' },
    { title: '不要一成不变', description: '保持新鲜感，让对方觉得你有趣', category: '成长', difficulty: '中等' },
    { title: '保持浪漫', description: '让爱情始终保持浪漫，增加感情浓度', category: '浪漫', difficulty: '中等' },
    { title: '做美食', description: '女方想吃什么，就给女方做什么', category: '日常', difficulty: '中等' },
    { title: '制造惊喜', description: '偶尔的惊喜能让女生感动', category: '浪漫', difficulty: '中等' },
    { title: '了解对方', description: '了解女方的兴趣爱好，偶尔带她出去玩', category: '日常', difficulty: '简单' },
    { title: '一起散步', description: '晚上一起手牵手散步，聊聊心事', category: '日常', difficulty: '简单' },
    { title: '一起健身', description: '一起去健身房或者晨跑，互相监督', category: '成长', difficulty: '中等' },
    { title: '一起逛超市', description: '一起去超市采购，规划下周的食谱', category: '日常', difficulty: '简单' },
    { title: '一起做家务', description: '分工合作做家务，增加互动', category: '日常', difficulty: '简单' },
    { title: '一起打游戏', description: '一起玩一款游戏，享受欢乐时光', category: '娱乐', difficulty: '简单' },
    { title: '一起看日出', description: '早起一起看日出，感受大自然的美好', category: '出行', difficulty: '中等' },
    { title: '一起看星星', description: '晚上一起在阳台看星星', category: '浪漫', difficulty: '简单' },
    { title: '一起拍照片', description: '用相机记录下美好的瞬间', category: '娱乐', difficulty: '简单' },
    { title: '一起养宠物', description: '一起养一只小猫或小狗，共同照顾', category: '成长', difficulty: '中等' },
    { title: '一起种植', description: '一起种一盆花或蔬菜，看着它成长', category: '成长', difficulty: '简单' },
    { title: '一起学乐器', description: '一起学习弹奏一种乐器', category: '成长', difficulty: '中等' },
    { title: '一起画画', description: '一起画画，即使画得不好也没关系', category: '娱乐', difficulty: '简单' },
    { title: '一起拼图', description: '一起完成一幅拼图', category: '娱乐', difficulty: '简单' },
    { title: '一起做手工', description: '一起动手做一些手工制品', category: '娱乐', difficulty: '中等' },
    { title: '一起看展览', description: '一起去看艺术展览或博物馆', category: '出行', difficulty: '简单' },
    { title: '一起听音乐会', description: '一起去听一场音乐会', category: '出行', difficulty: '中等' },
    { title: '一起露营', description: '一起去露营，体验大自然', category: '出行', difficulty: '中等' },
    { title: '一起野餐', description: '在公园或郊外一起野餐', category: '出行', difficulty: '简单' },
    { title: '一起骑行', description: '一起骑自行车去周边探索', category: '出行', difficulty: '简单' },
    { title: '一起游泳', description: '夏天一起去游泳', category: '娱乐', difficulty: '简单' },
    { title: '一起滑雪', description: '冬天一起去滑雪', category: '出行', difficulty: '中等' },
    { title: '一起泡温泉', description: '一起去泡温泉放松', category: '出行', difficulty: '中等' },
    { title: '一起做SPA', description: '一起去做SPA，享受放松时光', category: '浪漫', difficulty: '中等' },
    { title: '一起去书店', description: '一起去书店，各自选一本喜欢的书', category: '成长', difficulty: '简单' },
    { title: '一起读书', description: '一起读同一本书，然后讨论', category: '成长', difficulty: '中等' },
    { title: '一起写愿望清单', description: '一起写下共同的愿望清单', category: '浪漫', difficulty: '简单' },
    { title: '一起规划未来', description: '一起规划未来的生活', category: '成长', difficulty: '中等' }
];

const casesData = [
    { title: '第一次约会', content: '选择一个安静舒适的咖啡厅，聊聊彼此的兴趣爱好...', date: '2024-01-15', mood: '开心' },
    { title: '生日惊喜', content: '准备了一个小惊喜派对，邀请了她最好的朋友...', date: '2024-02-20', mood: '感动' },
    { title: '一起做饭', content: '周末一起做了一顿大餐，虽然手忙脚乱但很开心...', date: '2024-03-01', mood: '温馨' },
    { title: '看电影', content: '一起看了一部浪漫电影，她感动得哭了...', date: '2024-03-10', mood: '温馨' },
    { title: '公园散步', content: '晚上在公园手牵手散步，聊了很多心里话...', date: '2024-03-15', mood: '开心' },
    { title: '一起旅行', content: '第一次一起旅行，去了海边，留下了很多美好回忆...', date: '2024-04-01', mood: '开心' },
    { title: '纪念日', content: '恋爱一周年，准备了惊喜礼物，她很喜欢...', date: '2024-04-15', mood: '感动' },
    { title: '一起打游戏', content: '一起玩游戏，虽然她总是输，但玩得很开心...', date: '2024-04-20', mood: '有趣' },
    { title: '一起看日出', content: '早起一起去山顶看日出，景色很美...', date: '2024-05-01', mood: '浪漫' },
    { title: '一起养宠物', content: '领养了一只小猫，取名叫小宝贝...', date: '2024-05-10', mood: '温馨' },
    { title: '深圳程序员的故事', content: '深圳一位程序员因穿着优衣库而被女友嘲讽，最终导致两人分手。这种以"爱"的名义进行的精神控制，其实是情感虐待的表现。尊严是爱情的基石，任何时候都不应被侵蚀。', date: '2024-01-20', mood: '感动' },
    { title: '北京情侣的冷战', content: '北京一对情侣因"已读不回"而冷战72小时，最终选择分手。沟通的缺失让误会在心中滋长。良好的沟通可以化解无数的矛盾，爱需要在对话中升华。', date: '2024-02-01', mood: '感动' },
    { title: '杭州女生的选择', content: '杭州一位女生为了爱情放弃了MIT的录取，最终却发现自己迷失了方向。爱情固然美好，但放弃自我价值观和人生目标的代价是无比惨痛的。', date: '2024-02-10', mood: '感动' },
    { title: '信任危机', content: '一对夫妻因隐藏前任的礼物而引发离婚诉讼。夫妻之间的信任建立在透明和诚实之上，任何小谎言都可能导致信任的崩塌。', date: '2024-02-20', mood: '感动' },
    { title: '成都情侣的监控', content: '成都一对情侣因查看手机定位而分手，法院对此作出判决，认为双方的隐私权应得到尊重。过度依赖和监控不仅会导致情感的失衡，还会让爱情变成牢笼。', date: '2024-03-05', mood: '感动' }
];

const notesData = [
    { title: '记住重要日期', content: '生日、纪念日等重要日期一定要记住', priority: '高' },
    { title: '倾听很重要', content: '当她说话时，认真倾听，不要打断', priority: '高' },
    { title: '小惊喜', content: '偶尔准备一些小惊喜，不需要太贵重', priority: '中' },
    { title: '不要冷战', content: '吵架后不要冷战，主动沟通解决问题', priority: '高' },
    { title: '不要讲道理', content: '她生气时不要讲道理，先哄好再说', priority: '高' },
    { title: '不要敷衍', content: '不要说"多喝热水"这种敷衍的话', priority: '高' },
    { title: '不要和异性暧昧', content: '和其他异性保持适当距离', priority: '高' },
    { title: '不要拿她和别人比较', content: '不要说"你看别人多好"这种话', priority: '高' },
    { title: '不要忘记纪念日', content: '纪念日一定要有所表示', priority: '高' },
    { title: '不要翻旧账', content: '吵架时不要翻旧账', priority: '中' },
    { title: '不要说谎', content: '即使是善意的谎言也尽量不要说', priority: '高' },
    { title: '不要忽略她的感受', content: '多关注她的情绪变化', priority: '高' },
    { title: '不要太自私', content: '多为她着想', priority: '中' },
    { title: '不要太大男子主义', content: '平等对待，互相尊重', priority: '高' },
    { title: '不要说脏话', content: '在她面前保持礼貌', priority: '中' },
    { title: '不要沉迷游戏', content: '不要因为游戏忽略她', priority: '中' },
    { title: '不要总是玩手机', content: '在一起时多陪陪她', priority: '高' },
    { title: '不要敷衍了事', content: '答应的事情要做到', priority: '高' },
    { title: '不要贬低她', content: '多夸奖，少批评', priority: '高' },
    { title: '不要轻易说分手', content: '分手两个字不要轻易说出口', priority: '高' },
    { title: '站立时双脚分的不够开', content: '站立时双脚并得太拢显示出你害怕侵犯到别人的空间，大概最好分开半米左右', priority: '中' },
    { title: '说话时使用过度的手势', content: '手势比划太多好像你是在打手语，显示你害怕仅仅是讲话不能保持住别人的注意力', priority: '低' },
    { title: '向女人前倾', content: '在和女人讲话时，身体微微向前冲，试图更接近她，这是把对方社交价值看得比自己高的表现', priority: '中' },
    { title: '追赶女人', content: '女人一边回话一边继续走，你不要跟上去追，如果女人身体移开你，你也要移开你的身体', priority: '高' },
    { title: '容忍女人做你不喜欢的事', content: '假装无所谓，给美女特别待遇，女人在察觉这类事情上天生比男人灵敏10倍', priority: '高' },
    { title: '不要渣', content: '没发生关系前，宝贝长宝贝短，发生关系后就说分手，这是渣', priority: '高' },
    { title: '不要站在道德最高点', content: '把自己置于道德最高点对别人的生活指手画脚，这种行为真的很掉价', priority: '高' },
    { title: '不要做嘴强王者', content: '语言上的巨人，话从来就没有兑现过，什么买买买请吃饭都是骗人的', priority: '高' },
    { title: '不要太油腻', content: '刚见面根本不熟就有肢体接触，开门揽一下肩膀，过马路拉个手，上电梯搂个腰，这些行为会让人觉得油腻恶心', priority: '高' },
    { title: '不要过度自黑', content: '自黑是一种娱乐开玩笑的方式，但不要黑得特别严重，总是自损自我贬低', priority: '低' },
    { title: '不要总是给对方解决问题', content: '女生迷茫时不要去指点人生迷津，规划未来，她需要的是倾听和陪伴', priority: '中' },
    { title: '不要说"别闹了"', content: '她红着眼眶，你要真敢回"别闹了"，基本等于原地自爆', priority: '高' },
    { title: '不要只说对不起', content: '光说"对不起"已被列为"最敷衍回复TOP1"，要拿出实际行动', priority: '高' },
    { title: '不要让手机替你谈恋爱', content: 'AI给你五个选项，你挑最不像AI的那条，自己再改俩字，发出去后立刻线下出现', priority: '中' },
    { title: '不要冷处理', content: '女生莫名其妙不开心的时候去问她为何不开心，学会放下你的身姿去哄哄她', priority: '高' },
    { title: '不要无原则顺从', content: '哄女人开心，并不是一味的无原则的顺从，那样女人会看不起你', priority: '中' },
    { title: '不要说要死要活的话', content: '不要对女孩说什么我的生命是你的，没有你我也活不了之类的话，女生最讨厌一个男孩子在她面前要死要活的没出息', priority: '高' },
    { title: '不要敷衍评价', content: '她穿什么衣服化什么妆问你怎么样，你一定要说"好看"，但这两个字远远不够，还要添油加醋的大吹一番', priority: '中' },
    { title: '不要小气', content: '不管任何事首先要替她着想，不要想着自己会吃亏之类的，这样就显得小气了', priority: '高' },
    { title: '经期要包容', content: '女生经期前的一周里，情绪常常是不可控的，不管她怎么歇斯底里，不讲道理，喜怒无常，你都要包容她', priority: '高' },
    { title: '不要翻旧账', content: '遇到问题不要纠结对错，赢了争吵的那一方，却在不知不觉中输掉了感情', priority: '高' },
    { title: '不要只讲道理', content: '女生通常都是比较感性的，男生则偏于理性，遇到问题男生喜欢讲道理，而女生更看重的是态度', priority: '高' }
];

const countdownsData = [
    { name: '恋爱纪念日', date: '2024-06-15', type: 'anniversary' },
    { name: '她的生日', date: '2024-08-20', type: 'birthday' },
    { name: '下次约会', date: '2024-03-10', type: 'date' },
    { name: '情人节', date: '2025-02-14', type: 'anniversary' },
    { name: '520', date: '2025-05-20', type: 'anniversary' },
    { name: '七夕节', date: '2025-08-29', type: 'anniversary' },
    { name: '圣诞节', date: '2025-12-25', type: 'other' },
    { name: '跨年', date: '2026-01-01', type: 'other' }
];

async function populateDatabase() {
    try {
        const SQL = await initSqlJs();
        
        let db;
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
            
            db.run(`INSERT INTO ai_config (api_key, api_endpoint, model, system_prompt) VALUES (?, ?, ?, ?)`, [
                '',
                'https://api.openai.com/v1/chat/completions',
                'gpt-3.5-turbo',
                '你是一个专业的恋爱顾问，帮助用户更好地与女朋友相处，提供温馨、体贴的建议。'
            ]);
        }
        
        const insertMethod = db.prepare('INSERT INTO methods (title, description, category, difficulty) VALUES (?, ?, ?, ?)');
        methodsData.forEach(method => {
            insertMethod.run([method.title, method.description, method.category, method.difficulty]);
        });
        insertMethod.free();
        
        const insertCase = db.prepare('INSERT INTO cases (title, content, date, mood) VALUES (?, ?, ?, ?)');
        casesData.forEach(c => {
            insertCase.run([c.title, c.content, c.date, c.mood]);
        });
        insertCase.free();
        
        const insertNote = db.prepare('INSERT INTO notes (title, content, priority) VALUES (?, ?, ?)');
        notesData.forEach(note => {
            insertNote.run([note.title, note.content, note.priority]);
        });
        insertNote.free();
        
        const insertCountdown = db.prepare('INSERT INTO countdowns (name, date, type) VALUES (?, ?, ?)');
        countdownsData.forEach(countdown => {
            insertCountdown.run([countdown.name, countdown.date, countdown.type]);
        });
        insertCountdown.free();
        
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_FILE, buffer);
        
        console.log(`成功添加 ${methodsData.length} 个增进感情方法`);
        console.log(`成功添加 ${casesData.length} 个交流案例`);
        console.log(`成功添加 ${notesData.length} 个注意事项`);
        console.log(`成功添加 ${countdownsData.length} 个倒数日`);
        console.log('数据库填充完成！');
        
    } catch (error) {
        console.error('填充数据库时出错:', error);
    }
}

populateDatabase();
