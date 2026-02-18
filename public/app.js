const { createApp, ref, computed, onMounted, nextTick, watch } = Vue;

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

        const loadStats = async () => {
            try {
                const response = await axios.get('/api/stats');
                stats.value = response.data;
            } catch (error) {
                console.error('加载统计数据失败:', error);
            }
        };

        const loadMethods = async () => {
            try {
                const response = await axios.get('/api/methods');
                methods.value = response.data;
            } catch (error) {
                console.error('加载方法失败:', error);
            }
        };

        const loadCases = async () => {
            try {
                const response = await axios.get('/api/cases');
                cases.value = response.data;
            } catch (error) {
                console.error('加载案例失败:', error);
            }
        };

        const loadNotes = async () => {
            try {
                const response = await axios.get('/api/notes');
                notes.value = response.data;
            } catch (error) {
                console.error('加载注意事项失败:', error);
            }
        };

        const loadCountdowns = async () => {
            try {
                const response = await axios.get('/api/countdowns');
                countdowns.value = response.data;
            } catch (error) {
                console.error('加载倒数日失败:', error);
            }
        };

        const loadAIConfig = async () => {
            try {
                const response = await axios.get('/api/ai-config');
                if (response.data) {
                    aiConfig.value = response.data;
                }
            } catch (error) {
                console.error('加载AI配置失败:', error);
            }
        };

        const loadChatHistory = async () => {
            try {
                const response = await axios.get('/api/chat-history');
                chatHistory.value = response.data;
            } catch (error) {
                console.error('加载聊天记录失败:', error);
            }
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
                if (editingMethod.value) {
                    await axios.put(`/api/methods/${editingMethod.value.id}`, methodForm.value);
                    showToast('方法更新成功');
                } else {
                    await axios.post('/api/methods', methodForm.value);
                    showToast('方法添加成功');
                }
                closeMethodModal();
                loadMethods();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteMethod = async (id) => {
            if (!confirm('确定要删除这个方法吗？')) return;
            try {
                await axios.delete(`/api/methods/${id}`);
                showToast('方法已删除');
                loadMethods();
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
                if (editingCase.value) {
                    await axios.put(`/api/cases/${editingCase.value.id}`, caseForm.value);
                    showToast('案例更新成功');
                } else {
                    await axios.post('/api/cases', caseForm.value);
                    showToast('案例添加成功');
                }
                closeCaseModal();
                loadCases();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteCase = async (id) => {
            if (!confirm('确定要删除这个案例吗？')) return;
            try {
                await axios.delete(`/api/cases/${id}`);
                showToast('案例已删除');
                loadCases();
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
                if (editingNote.value) {
                    await axios.put(`/api/notes/${editingNote.value.id}`, noteForm.value);
                    showToast('注意事项更新成功');
                } else {
                    await axios.post('/api/notes', noteForm.value);
                    showToast('注意事项添加成功');
                }
                closeNoteModal();
                loadNotes();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteNote = async (id) => {
            if (!confirm('确定要删除这个注意事项吗？')) return;
            try {
                await axios.delete(`/api/notes/${id}`);
                showToast('注意事项已删除');
                loadNotes();
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
                if (editingCountdown.value) {
                    await axios.put(`/api/countdowns/${editingCountdown.value.id}`, countdownForm.value);
                    showToast('倒数日更新成功');
                } else {
                    await axios.post('/api/countdowns', countdownForm.value);
                    showToast('倒数日添加成功');
                }
                closeCountdownModal();
                loadCountdowns();
                loadStats();
            } catch (error) {
                showToast('操作失败', 'error');
            }
        };

        const deleteCountdown = async (id) => {
            if (!confirm('确定要删除这个倒数日吗？')) return;
            try {
                await axios.delete(`/api/countdowns/${id}`);
                showToast('倒数日已删除');
                loadCountdowns();
                loadStats();
            } catch (error) {
                showToast('删除失败', 'error');
            }
        };

        const saveAIConfig = async () => {
            try {
                await axios.post('/api/ai-config', aiConfig.value);
                showToast('AI配置保存成功');
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
                const response = await axios.post('/api/ai-chat', { message });
                chatHistory.value.push({ role: 'assistant', content: response.data.reply });
                
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
                await axios.delete('/api/chat-history');
                chatHistory.value = [];
                showToast('聊天记录已清空');
            } catch (error) {
                showToast('清空失败', 'error');
            }
        };

        const exportData = async () => {
            try {
                const response = await axios.get('/api/export-json');
                const data = response.data;
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
        };

        const importData = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    await axios.post('/api/import-json', data);
                    loadMethods();
                    loadCases();
                    loadNotes();
                    loadCountdowns();
                    loadAIConfig();
                    loadChatHistory();
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
                    loadMethods();
                    loadCases();
                    loadNotes();
                    loadCountdowns();
                    loadAIConfig();
                    loadChatHistory();
                    loadStats();
                    showToast('数据库导入成功，页面将刷新');
                    setTimeout(() => window.location.reload(), 1500);
                } catch (error) {
                    showToast('数据库导入失败', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
            event.target.value = '';
        };

        const clearAllData = async () => {
            if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
            if (!confirm('再次确认：这将删除所有方法、案例、注意事项和倒数日！')) return;
            
            try {
                await axios.delete('/api/methods');
                await axios.delete('/api/cases');
                await axios.delete('/api/notes');
                await axios.delete('/api/countdowns');
                await axios.delete('/api/chat-history');
                loadMethods();
                loadCases();
                loadNotes();
                loadCountdowns();
                loadChatHistory();
                loadStats();
                showToast('所有数据已清空');
            } catch (error) {
                showToast('清空失败', 'error');
            }
        };

        onMounted(() => {
            loadStats();
            loadMethods();
            loadCases();
            loadNotes();
            loadCountdowns();
            loadAIConfig();
            loadChatHistory();
        });

        return {
            navItems,
            currentSection,
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
            clearAllData
        };
    }
}).mount('#app');
