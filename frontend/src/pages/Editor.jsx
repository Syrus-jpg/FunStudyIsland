import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Plus,
    FileText,
    Layout,
    Eye,
    Loader2,
    CheckCircle2,
    ChevronRight,
    Book
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const Editor = () => {
    const navigate = useNavigate();
    const [islands, setIslands] = useState([]);
    const [courses, setCourses] = useState([]);
    const [pages, setPages] = useState([]);

    const [selectedIsland, setSelectedIsland] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);

    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'success', 'error'

    // Initial load: Islands
    useEffect(() => {
        fetchIslands();
    }, []);

    const fetchIslands = async () => {
        try {
            const res = await axios.get(`${API_BASE}/islands`);
            setIslands(res.data);
            if (res.data.length > 0) {
                handleIslandSelect(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch islands", err);
        } finally {
            setLoading(false);
        }
    };

    const handleIslandSelect = async (island) => {
        setSelectedIsland(island);
        setSelectedCourse(null);
        setPages([]);
        setSelectedPage(null);
        try {
            const res = await axios.get(`${API_BASE}/islands/${island.code}/courses`);
            setCourses(res.data);
            if (res.data.length > 0) {
                handleCourseSelect(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch courses", err);
        }
    };

    const handleCourseSelect = async (course) => {
        setSelectedCourse(course);
        setSelectedPage(null);
        try {
            const res = await axios.get(`${API_BASE}/courses/${course.id}/pages`);
            setPages(res.data);
            if (res.data.length > 0) {
                handlePageSelect(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch pages", err);
        }
    };

    const handlePageSelect = (page) => {
        setSelectedPage(page);
        setEditTitle(page.title);
        setEditContent(page.content || '');
    };

    const handleSave = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setSaveStatus(null);
        try {
            await axios.put(`${API_BASE}/pages/${selectedPage.id}`, {
                title: editTitle,
                content: editContent
            });
            setSaveStatus('success');
            // Update local state
            setPages(pages.map(p => p.id === selectedPage.id ? { ...p, title: editTitle, content: editContent } : p));
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error("Save failed", err);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const createNewPage = async () => {
        if (!selectedCourse) return;
        try {
            const res = await axios.post(`${API_BASE}/courses/${selectedCourse.id}/pages`, {
                title: "未命名页面",
                content: ""
            });
            setPages([...pages, res.data]);
            handlePageSelect(res.data);
        } catch (err) {
            alert("创建页面失败");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#f7f7f5] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="text-sm font-medium opacity-40 uppercase tracking-widest">初始化 Notion 引擎...</span>
        </div>
    );

    return (
        <div className="flex h-screen bg-white text-[#37352f] overflow-hidden">
            {/* Editor Sidebar */}
            <aside className="w-72 border-r border-[#edeeef] bg-[#f7f7f5] flex flex-col font-sans">
                <div className="p-4 flex items-center justify-between border-b border-[#edeeef]">
                    <button onClick={() => navigate('/')} className="hover:bg-[#efefef] p-1.5 rounded transition-colors opacity-60">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">内容管理</div>
                    <div className="w-6 h-6"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-6">
                    {/* Island Selector */}
                    <div>
                        <label className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">选择岛屿</label>
                        <div className="space-y-0.5">
                            {islands.map(island => (
                                <button
                                    key={island.id}
                                    onClick={() => handleIslandSelect(island)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${selectedIsland?.id === island.id ? 'bg-white shadow-sm font-bold border border-[#edeeef]' : 'hover:bg-[#efefef] opacity-60'}`}
                                >
                                    <span className="text-lg">{island.icon}</span>
                                    <span className="truncate">{island.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Course Selector */}
                    {selectedIsland && (
                        <div>
                            <label className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">选择课程</label>
                            <div className="space-y-0.5">
                                {courses.map(course => (
                                    <button
                                        key={course.id}
                                        onClick={() => handleCourseSelect(course)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${selectedCourse?.id === course.id ? 'bg-white shadow-sm font-bold border border-[#edeeef]' : 'hover:bg-[#efefef] opacity-60'}`}
                                    >
                                        <Book className="w-4 h-4 opacity-40 text-blue-500" />
                                        <span className="truncate">{course.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Page Selector */}
                    {selectedCourse && (
                        <div>
                            <div className="px-3 py-2 flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">页面列表</label>
                                <button onClick={createNewPage} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {pages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => handlePageSelect(page)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${selectedPage?.id === page.id ? 'bg-white shadow-sm font-bold border border-brand-primary/20 text-brand-primary' : 'hover:bg-[#efefef] opacity-60'}`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span className="truncate">{page.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 mt-auto border-t border-[#edeeef] bg-white/50">
                    <div className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                        "所有的修改都在保存后实时同步到服务器数据库。"
                    </div>
                </div>
            </aside>

            {/* Main Editing Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="h-12 border-b border-[#edeeef] flex items-center justify-between px-6 bg-white z-10">
                    <div className="flex items-center gap-3 text-[11px] font-medium opacity-40">
                        <Layout className="w-4 h-4" />
                        <span>{selectedIsland?.name}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{selectedCourse?.title}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{selectedPage?.title}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {saveStatus === 'success' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                已保存到云端
                            </motion.div>
                        )}

                        <button
                            onClick={() => navigate(`/island/${selectedIsland?.code}`)}
                            className="text-xs flex items-center gap-1.5 hover:bg-[#f7f7f5] px-3 py-1.5 rounded-lg transition-colors font-medium opacity-60 hover:opacity-100 border border-transparent hover:border-[#edeeef]"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            预览文章
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedPage}
                            className={`text-xs px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm ${selectedPage ? 'bg-[#37352f] text-white hover:bg-black active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? '正在保存...' : '立即保存'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full p-8 md:p-24 selection:bg-blue-100">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-4">
                            <div className="text-4xl opacity-10 drop-shadow-sm select-none">📄</div>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="在此输入页面标题..."
                                className="w-full text-5xl font-black border-none focus:ring-0 placeholder:opacity-10 text-[#37352f] p-0 bg-transparent tracking-tight"
                            />
                        </div>

                        <div className="min-h-[600px] relative group px-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="点击这里开始写作吧... (支持 Markdown 语法)"
                                className="w-full h-full min-h-[600px] text-xl leading-relaxed border-none focus:ring-0 resize-none font-sans bg-transparent placeholder:opacity-10 text-gray-700"
                            />
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-20 transition-opacity text-[10px] uppercase font-black tracking-widest pointer-events-none">
                                Minimalist Editor Mode
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Editor;
