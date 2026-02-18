const { createApp, ref, computed, onMounted, nextTick } = Vue;

const USE_API = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');

let DEFAULT_DATA = null;

async function loadDefaultData() {
    if (DEFAULT_DATA) return DEFAULT_DATA;
    try {
        const response = await fetch('default-data.json');
        DEFAULT_DATA = await response.json();
        return DEFAULT_DATA;
    } catch (e) {
        console.error('加载默认数据失败:', e);
        return { methods: [], cases: [], notes: [], countdowns: [] };
    }
}

function getLocalData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function setLocalData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

createApp({
    setup() {
        const navItems = ref([
            { id: 'home', name: '首页', icon: '🏠' },
            { id: 'methods', name: '增进感情', icon: '💝' },
            { id: 'cases', name: '交流案例', icon: '📝' },
            { id: 'notes', name: '注意事项', icon: '⚠️' },
            { id: 'countdowns', name: '倒数日', icon: '⏰' },
            { id: 'ai-chat', name: 'AI助手', icon: '🤖' },
            { id: 'settings', name: '设置', icon: '⚙️' }
        ]);

        const currentSection = ref('home');
        const isLoading = ref(true);
        
        const stats = ref({
            methodsCount: 0,
            casesCount: 0,
            notesCount: 0,
            nextCountdown: null
        });

        const methods = ref([]);
        const cases = ref([]);
        const notes = ref([]);
        const countdowns = ref([]);
        
        const methodFilter = ref('');
        const caseFilter = ref('');
        const noteFilter = ref('');
        const countdownFilter = ref('');

        const filteredMethods = computed(() => {
            if (!methodFilter.value) return methods.value;
            return methods.value.filter(m => m.category === methodFilter.value);
        });

        const filteredCases = computed(() => {
            if (!caseFilter.value) return cases.value;
            return cases.value.filter(c => c.mood === caseFilter.value);
        });

        const filteredNotes = computed(() => {
            if (!noteFilter.value) return notes.value;
            return notes.value.filter(n => n.priority === noteFilter.value);
        });

        const filteredCountdowns = computed(() => {
            if (!countdownFilter.value) return countdowns.value;
            return countdowns.value.filter(c => c.type === countdownFilter.value);
        });

        const showMethodModal = ref(false);
        const showCaseModal = ref(false);
        const showNoteModal = ref(false);
        const showCountdownModal = ref(false);

        const editingMethod = ref(null);
        const editingCase = ref(null);
        const editingNote = ref(null);
        const editingCountdown = ref(null);

        const methodForm = ref({ title: '', description: '', category: '日常', difficulty: '简单' });
        const caseForm = ref({ title: '', content: '', date: '', mood: '开心' });
        const noteForm = ref({ title: '', content: '', priority: '中' });
        const countdownForm = ref({ name: '', date: '', type: 'anniversary' });

        const aiConfig = ref({
            api_key: '',
            api_endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-3.5-turbo',
            system_prompt: '你是一个专业的恋爱顾问，帮助用户更好地与女朋友相处，提供温馨、体贴的建议。'
        });

        const chatHistory = ref([]);
        const chatInput = ref('');
        const isTyping = ref(false);
        const chatContainer = ref(null);

        const toast = ref({ show: false, message: '', type: 'success' });

        const showToast = (message, type = 'success') => {
            toast.value = { show: true, message, type };
            setTimeout(() => {
                toast.value.show = false;
            }, 3000);
        };

        const showSection = (section) => {
            currentSection.value = section;
        };

        const calculateStats = () => {
            stats.value.methodsCount = methods.value.length;
            stats.value.casesCount = cases.value.length;
            stats.value.notesCount = notes.value.length;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const sortedCountdowns = [...countdowns.value].sort((a, b) => new Date(a.date) - new Date(b.date));
            for (const c of sortedCountdowns) {
                const targetDate = new Date(c.date);
                targetDate.setHours(0, 0, 0, 0);
                const diffTime = targetDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0) {
                    stats.value.nextCountdown = { ...c, daysLeft: diffDays };
                    break;
                }
            }
        };

        const loadStats = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/stats');
                    stats.value = response.data;
                } catch (error) {
                    console.error('加载统计数据失败:', error);
                    calculateStats();
                }
            } else {
                calculateStats();
            }
        };

        const loadMethods = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/methods');
                    methods.value = response.data;
                } catch (error) {
                    console.error('加载方法失败:', error);
                }
            } else {
                const saved = getLocalData('love_methods');
                if (saved) {
                    methods.value = saved;
                } else {
                    const defaultData = await loadDefaultData();
                    methods.value = defaultData.methods || [];
                }
            }
        };

        const loadCases = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/cases');
                    cases.value = response.data;
                } catch (error) {
                    console.error('加载案例失败:', error);
                }
            } else {
                const saved = getLocalData('love_cases');
                if (saved) {
                    cases.value = saved;
                } else {
                    const defaultData = await loadDefaultData();
                    cases.value = defaultData.cases || [];
                }
            }
        };

        const loadNotes = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/notes');
                    notes.value = response.data;
                } catch (error) {
                    console.error('加载注意事项失败:', error);
                }
            } else {
                const saved = getLocalData('love_notes');
                if (saved) {
                    notes.value = saved;
                } else {
                    const defaultData = await loadDefaultData();
                    notes.value = defaultData.notes || [];
                }
            }
        };

        const loadCountdowns = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/countdowns');
                    countdowns.value = response.data;
                } catch (error) {
                    console.error('加载倒数日失败:', error);
                }
            } else {
                const saved = getLocalData('love_countdowns');
                if (saved) {
                    countdowns.value = saved;
                } else {
                    const defaultData = await loadDefaultData();
                    countdowns.value = defaultData.countdowns || [];
                }
            }
        };

        const loadAIConfig = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/ai-config');
                    if (response.data) {
                        aiConfig.value = response.data;
                    }
                } catch (error) {
                    console.error('加载AI配置失败:', error);
                }
            } else {
                const saved = getLocalData('love_ai_config');
                if (saved) aiConfig.value = saved;
            }
        };

        const loadChatHistory = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/chat-history');
                    chatHistory.value = response.data;
                } catch (error) {
                    console.error('加载聊天记录失败:', error);
                }
            } else {
                const saved = getLocalData('love_chat_history');
                if (saved) chatHistory.value = saved;
            }
        };

        const getNextId = (items) => {
            if (items.length === 0) return 1;
            return Math.max(...items.map(i => i.id || 0)) + 1;
        };

        const openMethodModal = (method = null) => {
            if (method) {
                editingMethod.value = method;
                methodForm.value = { ...method };
            } else {
                editingMethod.value = null;
                methodForm.value = { title: '', description: '', category: '日常', difficulty: '简单' };
            }
            showMethodModal.value = true;
        };

        const closeMethodModal = () => {
            showMethodModal.value = false;
            editingMethod.value = null;
        };

        const saveMethod = async () => {
            if (!methodForm.value.title.trim()) {
                showToast('请输入方法名称', 'error');
                return;
            }
            try {
                if (USE_API) {
                    if (editingMethod.value) {
                        await axios.put(`/api/methods/${editingMethod.value.id}`, methodForm.value);
                        showToast('方法更新成功');
                    } else {
                        await axios.post('/api/methods', methodForm.value);
                        showToast('方法添加成功');
                    }
                    await loadMethods();
                } else {
                    if (editingMethod.value) {
                        const index = methods.value.findIndex(m => m.id === editingMethod.value.id);
                        if (index !== -1) {
                            methods.value[index] = { ...methods.value[index], ...methodForm.value };
                        }
                    } else {
                        methods.value.push({
                            id: getNextId(methods.value),
                            ...methodForm.value,
                            created_at: new Date().toISOString()
                        });
                    }
                    setLocalData('love_methods', methods.value);
                    showToast(editingMethod.value ? '方法更新成功' : '方法添加成功');
                }
                closeMethodModal();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteMethod = async (id) => {
            if (!confirm('确定要删除这个方法吗？')) return;
            try {
                if (USE_API) {
                    await axios.delete(`/api/methods/${id}`);
                    showToast('方法已删除');
                    await loadMethods();
                } else {
                    methods.value = methods.value.filter(m => m.id !== id);
                    setLocalData('love_methods', methods.value);
                    showToast('方法已删除');
                }
                loadStats();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        };

        const openCaseModal = (caseItem = null) => {
            if (caseItem) {
                editingCase.value = caseItem;
                caseForm.value = { ...caseItem };
            } else {
                editingCase.value = null;
                caseForm.value = { title: '', content: '', date: '', mood: '开心' };
            }
            showCaseModal.value = true;
        };

        const closeCaseModal = () => {
            showCaseModal.value = false;
            editingCase.value = null;
        };

        const saveCase = async () => {
            if (!caseForm.value.title.trim()) {
                showToast('请输入案例标题', 'error');
                return;
            }
            try {
                const date = new Date().toISOString().split('T')[0];
                if (USE_API) {
                    if (editingCase.value) {
                        await axios.put(`/api/cases/${editingCase.value.id}`, caseForm.value);
                        showToast('案例更新成功');
                    } else {
                        await axios.post('/api/cases', caseForm.value);
                        showToast('案例添加成功');
                    }
                    await loadCases();
                } else {
                    if (editingCase.value) {
                        const index = cases.value.findIndex(c => c.id === editingCase.value.id);
                        if (index !== -1) {
                            cases.value[index] = { ...cases.value[index], ...caseForm.value };
                        }
                    } else {
                        cases.value.push({
                            id: getNextId(cases.value),
                            ...caseForm.value,
                            date: date,
                            created_at: new Date().toISOString()
                        });
                    }
                    setLocalData('love_cases', cases.value);
                    showToast(editingCase.value ? '案例更新成功' : '案例添加成功');
                }
                closeCaseModal();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteCase = async (id) => {
            if (!confirm('确定要删除这个案例吗？')) return;
            try {
                if (USE_API) {
                    await axios.delete(`/api/cases/${id}`);
                    showToast('案例已删除');
                    await loadCases();
                } else {
                    cases.value = cases.value.filter(c => c.id !== id);
                    setLocalData('love_cases', cases.value);
                    showToast('案例已删除');
                }
                loadStats();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        };

        const openNoteModal = (note = null) => {
            if (note) {
                editingNote.value = note;
                noteForm.value = { ...note };
            } else {
                editingNote.value = null;
                noteForm.value = { title: '', content: '', priority: '中' };
            }
            showNoteModal.value = true;
        };

        const closeNoteModal = () => {
            showNoteModal.value = false;
            editingNote.value = null;
        };

        const saveNote = async () => {
            if (!noteForm.value.title.trim()) {
                showToast('请输入事项标题', 'error');
                return;
            }
            try {
                if (USE_API) {
                    if (editingNote.value) {
                        await axios.put(`/api/notes/${editingNote.value.id}`, noteForm.value);
                        showToast('注意事项更新成功');
                    } else {
                        await axios.post('/api/notes', noteForm.value);
                        showToast('注意事项添加成功');
                    }
                    await loadNotes();
                } else {
                    if (editingNote.value) {
                        const index = notes.value.findIndex(n => n.id === editingNote.value.id);
                        if (index !== -1) {
                            notes.value[index] = { ...notes.value[index], ...noteForm.value };
                        }
                    } else {
                        notes.value.push({
                            id: getNextId(notes.value),
                            ...noteForm.value,
                            created_at: new Date().toISOString()
                        });
                    }
                    setLocalData('love_notes', notes.value);
                    showToast(editingNote.value ? '注意事项更新成功' : '注意事项添加成功');
                }
                closeNoteModal();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteNote = async (id) => {
            if (!confirm('确定要删除这个注意事项吗？')) return;
            try {
                if (USE_API) {
                    await axios.delete(`/api/notes/${id}`);
                    showToast('注意事项已删除');
                    await loadNotes();
                } else {
                    notes.value = notes.value.filter(n => n.id !== id);
                    setLocalData('love_notes', notes.value);
                    showToast('注意事项已删除');
                }
                loadStats();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        };

        const openCountdownModal = (countdown = null) => {
            if (countdown) {
                editingCountdown.value = countdown;
                countdownForm.value = { ...countdown };
            } else {
                editingCountdown.value = null;
                countdownForm.value = { name: '', date: '', type: 'anniversary' };
            }
            showCountdownModal.value = true;
        };

        const closeCountdownModal = () => {
            showCountdownModal.value = false;
            editingCountdown.value = null;
        };

        const saveCountdown = async () => {
            if (!countdownForm.value.name.trim()) {
                showToast('请输入事件名称', 'error');
                return;
            }
            if (!countdownForm.value.date) {
                showToast('请选择目标日期', 'error');
                return;
            }
            try {
                if (USE_API) {
                    if (editingCountdown.value) {
                        await axios.put(`/api/countdowns/${editingCountdown.value.id}`, countdownForm.value);
                        showToast('倒数日更新成功');
                    } else {
                        await axios.post('/api/countdowns', countdownForm.value);
                        showToast('倒数日添加成功');
                    }
                    await loadCountdowns();
                } else {
                    if (editingCountdown.value) {
                        const index = countdowns.value.findIndex(c => c.id === editingCountdown.value.id);
                        if (index !== -1) {
                            countdowns.value[index] = { ...countdowns.value[index], ...countdownForm.value };
                        }
                    } else {
                        countdowns.value.push({
                            id: getNextId(countdowns.value),
                            ...countdownForm.value,
                            created_at: new Date().toISOString()
                        });
                    }
                    setLocalData('love_countdowns', countdowns.value);
                    showToast(editingCountdown.value ? '倒数日更新成功' : '倒数日添加成功');
                }
                closeCountdownModal();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteCountdown = async (id) => {
            if (!confirm('确定要删除这个倒数日吗？')) return;
            try {
                if (USE_API) {
                    await axios.delete(`/api/countdowns/${id}`);
                    showToast('倒数日已删除');
                    await loadCountdowns();
                } else {
                    countdowns.value = countdowns.value.filter(c => c.id !== id);
                    setLocalData('love_countdowns', countdowns.value);
                    showToast('倒数日已删除');
                }
                loadStats();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        };

        const saveAIConfig = async () => {
            try {
                if (USE_API) {
                    await axios.post('/api/ai-config', aiConfig.value);
                    showToast('AI配置保存成功');
                } else {
                    setLocalData('love_ai_config', aiConfig.value);
                    showToast('AI配置保存成功');
                }
            } catch (error) {
                showToast('保存失败', 'error');
            }
        };

        const sendMessage = async () => {
            if (!chatInput.value.trim() || isTyping.value) return;
            
            const message = chatInput.value.trim();
            chatInput.value = '';
            
            chatHistory.value.push({ role: 'user', content: message });
            
            await nextTick();
            if (chatContainer.value) {
                chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
            }
            
            isTyping.value = true;
            
            try {
                if (USE_API) {
                    const response = await axios.post('/api/ai-chat', { message });
                    chatHistory.value.push({ role: 'assistant', content: response.data.reply });
                } else {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const reply = '抱歉，AI 功能需要服务器支持。请在本地运行服务器后使用此功能。';
                    chatHistory.value.push({ role: 'assistant', content: reply });
                    setLocalData('love_chat_history', chatHistory.value);
                }
                
                await nextTick();
                if (chatContainer.value) {
                    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
                }
            } catch (error) {
                const errorMsg = error.response?.data?.error || 'AI调用失败，请检查配置';
                showToast(errorMsg, 'error');
                chatHistory.value.pop();
            } finally {
                isTyping.value = false;
            }
        };

        const clearChatHistory = async () => {
            if (!confirm('确定要清空聊天记录吗？')) return;
            try {
                if (USE_API) {
                    await axios.delete('/api/chat-history');
                    showToast('聊天记录已清空');
                } else {
                    chatHistory.value = [];
                    setLocalData('love_chat_history', []);
                    showToast('聊天记录已清空');
                }
            } catch (error) {
                showToast('清空失败', 'error');
            }
        };

        const exportData = async () => {
            try {
                const data = {
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    methods: methods.value,
                    cases: cases.value,
                    notes: notes.value,
                    countdowns: countdowns.value,
                    aiConfig: aiConfig.value,
                    chatHistory: chatHistory.value
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `love-data-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('数据导出成功');
            } catch (error) {
                showToast('导出失败', 'error');
            }
        };

        const exportDatabase = async () => {
            if (USE_API) {
                try {
                    const response = await axios.get('/api/export-database', { responseType: 'blob' });
                    const url = URL.createObjectURL(response.data);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `love-database-${new Date().toISOString().split('T')[0]}.sqlite`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('数据库导出成功');
                } catch (error) {
                    showToast('导出失败', 'error');
                }
            } else {
                showToast('本地存储模式不支持导出数据库，请使用 JSON 导出', 'error');
            }
        };

        const importData = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.methods && Array.isArray(data.methods)) {
                        methods.value = data.methods;
                        if (!USE_API) setLocalData('love_methods', methods.value);
                    }
                    if (data.cases && Array.isArray(data.cases)) {
                        cases.value = data.cases;
                        if (!USE_API) setLocalData('love_cases', cases.value);
                    }
                    if (data.notes && Array.isArray(data.notes)) {
                        notes.value = data.notes;
                        if (!USE_API) setLocalData('love_notes', notes.value);
                    }
                    if (data.countdowns && Array.isArray(data.countdowns)) {
                        countdowns.value = data.countdowns;
                        if (!USE_API) setLocalData('love_countdowns', countdowns.value);
                    }
                    if (data.aiConfig) {
                        aiConfig.value = data.aiConfig;
                        if (!USE_API) setLocalData('love_ai_config', aiConfig.value);
                    }
                    if (data.chatHistory && Array.isArray(data.chatHistory)) {
                        chatHistory.value = data.chatHistory;
                        if (!USE_API) setLocalData('love_chat_history', chatHistory.value);
                    }
                    
                    if (USE_API) {
                        try {
                            await axios.post('/api/import-json', data);
                        } catch (err) {
                            console.error('服务器导入失败:', err);
                        }
                    }
                    
                    loadStats();
                    showToast('数据导入成功');
                } catch (error) {
                    showToast('导入失败，请检查文件格式', 'error');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        };

        const importDatabase = async (event) => {
            if (USE_API) {
                const file = event.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const base64 = btoa(
                            new Uint8Array(e.target.result).reduce(
                                (data, byte) => data + String.fromCharCode(byte), ''
                            )
                        );
                        await axios.post('/api/import-database', { database: base64 });
                        showToast('数据库导入成功，页面将刷新');
                        setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                        showToast('数据库导入失败', 'error');
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                showToast('本地存储模式不支持导入数据库，请使用 JSON 导入', 'error');
            }
            event.target.value = '';
        };

        const clearAllData = async () => {
            if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
            if (!confirm('再次确认：这将删除所有方法、案例、注意事项和倒数日！')) return;
            
            try {
                if (USE_API) {
                    await axios.delete('/api/methods');
                    await axios.delete('/api/cases');
                    await axios.delete('/api/notes');
                    await axios.delete('/api/countdowns');
                    await axios.delete('/api/chat-history');
                    await loadMethods();
                    await loadCases();
                    await loadNotes();
                    await loadCountdowns();
                } else {
                    methods.value = [];
                    cases.value = [];
                    notes.value = [];
                    countdowns.value = [];
                    chatHistory.value = [];
                    setLocalData('love_methods', []);
                    setLocalData('love_cases', []);
                    setLocalData('love_notes', []);
                    setLocalData('love_countdowns', []);
                    setLocalData('love_chat_history', []);
                }
                loadStats();
                showToast('所有数据已清空');
            } catch (error) {
                showToast('清空失败', 'error');
            }
        };

        const resetToDefault = async () => {
            if (!confirm('确定要重置为默认数据吗？这将覆盖当前所有数据！')) return;
            
            try {
                const defaultData = await loadDefaultData();
                
                methods.value = defaultData.methods || [];
                cases.value = defaultData.cases || [];
                notes.value = defaultData.notes || [];
                countdowns.value = defaultData.countdowns || [];
                
                if (!USE_API) {
                    setLocalData('love_methods', methods.value);
                    setLocalData('love_cases', cases.value);
                    setLocalData('love_notes', notes.value);
                    setLocalData('love_countdowns', countdowns.value);
                }
                
                loadStats();
                showToast('已重置为默认数据');
            } catch (error) {
                showToast('重置失败', 'error');
            }
        };

        onMounted(async () => {
            await Promise.all([
                loadMethods(),
                loadCases(),
                loadNotes(),
                loadCountdowns(),
                loadAIConfig(),
                loadChatHistory()
            ]);
            loadStats();
            isLoading.value = false;
        });

        return {
            navItems,
            currentSection,
            isLoading,
            stats,
            methods,
            cases,
            notes,
            countdowns,
            methodFilter,
            caseFilter,
            noteFilter,
            countdownFilter,
            filteredMethods,
            filteredCases,
            filteredNotes,
            filteredCountdowns,
            showMethodModal,
            showCaseModal,
            showNoteModal,
            showCountdownModal,
            editingMethod,
            editingCase,
            editingNote,
            editingCountdown,
            methodForm,
            caseForm,
            noteForm,
            countdownForm,
            aiConfig,
            chatHistory,
            chatInput,
            isTyping,
            chatContainer,
            toast,
            showSection,
            openMethodModal,
            closeMethodModal,
            saveMethod,
            deleteMethod,
            openCaseModal,
            closeCaseModal,
            saveCase,
            deleteCase,
            openNoteModal,
            closeNoteModal,
            saveNote,
            deleteNote,
            openCountdownModal,
            closeCountdownModal,
            saveCountdown,
            deleteCountdown,
            saveAIConfig,
            sendMessage,
            clearChatHistory,
            exportData,
            exportDatabase,
            importData,
            importDatabase,
            clearAllData,
            resetToDefault
        };
    }
}).mount('#app');
