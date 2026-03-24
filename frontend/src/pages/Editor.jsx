import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Book,
    Trash2,
    Settings,
    Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import TipTapEditor from '../components/TipTapEditor';

const API_BASE = 'http://localhost:8000/api/v1';

const Editor = () => {
    const navigate = useNavigate();
    const [islands, setIslands] = useState([]);
    const [courses, setCourses] = useState([]);
    const [pages, setPages] = useState([]);

    const [selectedIsland, setSelectedIsland] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);

    // Page Editing State
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editThumbnail, setEditThumbnail] = useState('');
    const [editIcon, setEditIcon] = useState('');

    // Island Editing State
    const [islandEditName, setIslandEditName] = useState('');
    const [islandEditSubtitle, setIslandEditSubtitle] = useState('');
    const [islandEditIcon, setIslandEditIcon] = useState('');
    const [islandEditCover, setIslandEditCover] = useState('');
    const [showIslandSettings, setShowIslandSettings] = useState(false);

    const [loading, setLoading] = useState(true);
    const [editVideoUrl, setEditVideoUrl] = useState('');
    const [editMetadataJson, setEditMetadataJson] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'success', 'error'

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
        setIslandEditName(island.name);
        setIslandEditSubtitle(island.subtitle || '');
        setIslandEditIcon(island.icon || '🏝️');
        setIslandEditCover(island.cover_image || '');

        setSelectedCourse(null);
        setPages([]);
        setSelectedPage(null);
        setShowIslandSettings(false);
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
        setShowIslandSettings(false);
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
        setEditDescription(page.description || '');
        setEditThumbnail(page.thumbnail_image || '');
        setEditIcon(page.icon || '');
        setEditVideoUrl(page.video_url || '');
        setEditMetadataJson(page.metadata_json || '');
        setShowIslandSettings(false);
    };

    const handleSavePage = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setSaveStatus(null);
        try {
            await axios.put(`${API_BASE}/pages/${selectedPage.id}`, {
                title: editTitle,
                content: editContent,
                description: editDescription,
                thumbnail_image: editThumbnail,
                icon: editIcon,
                video_url: editVideoUrl,
                metadata_json: editMetadataJson
            });
            setSaveStatus('success');
            setPages(pages.map(p => p.id === selectedPage.id ? {
                ...p,
                title: editTitle,
                content: editContent,
                description: editDescription,
                thumbnail_image: editThumbnail,
                icon: editIcon,
                video_url: editVideoUrl,
                metadata_json: editMetadataJson
            } : p));
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (_) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveIsland = async () => {
        if (!selectedIsland) return;
        setSaving(true);
        try {
            const res = await axios.put(`${API_BASE}/islands/${selectedIsland.code}`, {
                name: islandEditName,
                subtitle: islandEditSubtitle,
                icon: islandEditIcon,
                cover_image: islandEditCover
            });
            setSelectedIsland(res.data);
            setIslands(islands.map(i => i.id === res.data.id ? res.data : i));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (_) {
            console.error("Failed to save island");
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const createNewCourse = async () => {
        if (!selectedIsland) return;
        const title = window.prompt("请输入新分栏（模块）的名称:");
        if (!title) return;
        try {
            const res = await axios.post(`${API_BASE}/courses`, {
                title: title,
                island_id: selectedIsland.id
            });
            setCourses([...courses, res.data]);
            handleCourseSelect(res.data);
        } catch (err) {
            alert("创建分栏失败");
        }
    };

    const deleteCourse = async (courseId) => {
        if (!window.confirm("确定要删除整个分栏及其所有内容吗？此操作不可撤销。")) return;
        try {
            await axios.delete(`${API_BASE}/courses/${courseId}`);
            setCourses(courses.filter(c => c.id !== courseId));
            if (selectedCourse?.id === courseId) {
                setSelectedCourse(null);
                setPages([]);
            }
        } catch (err) {
            alert("删除失败");
        }
    };

    const createNewPage = async () => {
        if (!selectedCourse) return;
        try {
            const res = await axios.post(`${API_BASE}/courses/${selectedCourse.id}/pages`, {
                title: "未命名页面",
                content: "",
                description: "",
                thumbnail_image: "",
                icon: "📄"
            });
            setPages([...pages, res.data]);
            handlePageSelect(res.data);
        } catch (err) {
            alert("创建页面失败");
        }
    };

    const deletePage = async (e, pageId) => {
        e.stopPropagation();
        if (!window.confirm("确定要删除此文章吗？")) return;
        try {
            await axios.delete(`${API_BASE}/pages/${pageId}`);
            setPages(pages.filter(p => p.id !== pageId));
            if (selectedPage?.id === pageId) {
                setSelectedPage(null);
            }
        } catch (err) {
            alert("删除失败");
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
            {/* Sidebar */}
            <aside className="w-72 border-r border-[#edeeef] bg-[#f7f7f5] flex flex-col font-sans">
                <div className="p-4 flex items-center justify-between border-b border-[#edeeef]">
                    <button onClick={() => navigate('/')} className="hover:bg-[#efefef] p-1.5 rounded transition-colors opacity-60">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">内容管理院</div>
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

                    {/* Course / Section Management */}
                    {selectedIsland && (
                        <div>
                            <div className="px-3 py-2 flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">岛屿分栏 (Modules)</label>
                                <button onClick={createNewCourse} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {courses.map(course => (
                                    <div key={course.id} className="group relative">
                                        <button
                                            onClick={() => handleCourseSelect(course)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${selectedCourse?.id === course.id ? 'bg-white shadow-sm font-bold border border-[#edeeef]' : 'hover:bg-[#efefef] opacity-50'}`}
                                        >
                                            <Book className="w-3.5 h-3.5 opacity-40" />
                                            <span className="truncate">{course.title}</span>
                                        </button>
                                        <button
                                            onClick={() => deleteCourse(course.id)}
                                            className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-40 hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setShowIslandSettings(true)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg mt-4 border border-dashed border-gray-200 opacity-40 hover:opacity-100 hover:bg-white transition-all`}
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>编辑岛屿主页配置</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Page Selector */}
                    {selectedCourse && (
                        <div>
                            <div className="px-3 py-2 flex items-center justify-between mt-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">作品列表</label>
                                <button onClick={createNewPage} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {pages.map(page => (
                                    <div key={page.id} className="group relative">
                                        <button
                                            onClick={() => handlePageSelect(page)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${selectedPage?.id === page.id ? 'bg-[#37352f] text-white shadow-md font-bold' : 'hover:bg-[#efefef] opacity-60'}`}
                                        >
                                            <span className="w-4 text-center">{page.icon || '📄'}</span>
                                            <span className="truncate">{page.title}</span>
                                        </button>
                                        <button
                                            onClick={(e) => deletePage(e, page.id)}
                                            className={`absolute right-2 top-1.5 opacity-0 group-hover:opacity-40 hover:opacity-100 p-1 transition-all ${selectedPage?.id === page.id ? 'text-white' : 'hover:text-red-500'}`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="h-12 border-b border-[#edeeef] flex items-center justify-between px-6 bg-white z-10 text-sm">
                    <div className="flex items-center gap-3 text-[11px] font-medium opacity-40 uppercase tracking-widest">
                        {showIslandSettings ? (
                            <>
                                <Settings className="w-4 h-4" />
                                <span>{selectedIsland?.name} / 主页配置</span>
                            </>
                        ) : (
                            <>
                                <Layout className="w-4 h-4" />
                                <span>{selectedIsland?.name}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span>{selectedCourse?.title}</span>
                                {selectedPage && (
                                    <>
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="truncate max-w-[100px]">{selectedPage.title}</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {saveStatus === 'success' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-green-600 text-xs font-bold mr-4">
                                <CheckCircle2 className="w-4 h-4" />
                                已保存至云端
                            </motion.div>
                        )}
                        <button onClick={showIslandSettings ? handleSaveIsland : handleSavePage} disabled={saving} className={`text-xs px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg ${saving ? 'bg-gray-100 text-gray-400' : 'bg-[#37352f] text-white hover:bg-black active:scale-95'}`}>
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? '同步中...' : '同步修改'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {showIslandSettings ? (
                        <div className="max-w-4xl mx-auto p-12 md:p-24 space-y-12 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter mb-8">岛屿主页配置</h2>
                                <div className="space-y-8 bg-[#fcfcfb] p-8 rounded-3xl border border-[#edeeef]">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-30">岛屿名称</label>
                                            <input type="text" value={islandEditName} onChange={e => setIslandEditName(e.target.value)} className="w-full bg-white border border-[#edeeef] rounded-xl px-4 py-2.5 text-sm focus:ring-0" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-30">主页图标</label>
                                            <input type="text" value={islandEditIcon} onChange={e => setIslandEditIcon(e.target.value)} className="w-full bg-white border border-[#edeeef] rounded-xl px-4 py-2.5 text-sm focus:ring-0 text-center" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30">副标题 / 导语</label>
                                        <input type="text" value={islandEditSubtitle} onChange={e => setIslandEditSubtitle(e.target.value)} className="w-full bg-white border border-[#edeeef] rounded-xl px-4 py-2.5 text-sm focus:ring-0" placeholder="Discover, Shoot, and Save..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30">主页封面图 URL</label>
                                        <input type="text" value={islandEditCover} onChange={e => setIslandEditCover(e.target.value)} className="w-full bg-white border border-[#edeeef] rounded-xl px-4 py-2.5 text-sm focus:ring-0" placeholder="https://unsplash.com/..." />
                                        {islandEditCover && (
                                            <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-[#edeeef] shadow-inner bg-gray-50">
                                                <img src={islandEditCover} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : selectedPage ? (
                        <div className="max-w-4xl mx-auto p-8 md:p-24 selection:bg-[#fbefd1]">
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <div className="group relative w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                                        <input
                                            type="text"
                                            value={editIcon}
                                            onChange={e => setEditIcon(e.target.value)}
                                            className="w-full text-center text-4xl bg-transparent border-none focus:ring-0"
                                            placeholder="📄"
                                        />
                                        <div className="absolute -bottom-6 left-0 text-[10px] font-black opacity-10 tracking-[0.2em]">图标 ICON</div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            placeholder="在此输入页面标题..."
                                            className="w-full text-5xl font-black border-none focus:ring-0 placeholder:opacity-10 text-[#37352f] p-0 bg-transparent tracking-tighter"
                                        />

                                        <div className="flex flex-col gap-6 py-8 border-y border-[#f7f7f5]">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ImageIcon className="w-3 h-3 opacity-30" />
                                                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">16:9 展示主图 (Thumbnail)</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editThumbnail}
                                                    onChange={e => setEditThumbnail(e.target.value)}
                                                    placeholder="粘贴 16:9 的图片 URL..."
                                                    className="w-full text-sm py-2 px-4 bg-[#fcfcfb] border border-[#edeeef] rounded-xl focus:ring-0 transition-opacity"
                                                />
                                                {editThumbnail && (
                                                    <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-[#edeeef] shadow-sm">
                                                        <img src={editThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">摘要描述 (Description)</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={e => setEditDescription(e.target.value)}
                                                    placeholder="简单介绍一下这个板块的内容..."
                                                    className="w-full text-sm py-3 px-4 bg-[#fcfcfb] border border-[#edeeef] rounded-xl focus:ring-0 resize-none h-24"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">YouTube 视频 URL (AI 模式)</label>
                                                <input
                                                    type="text"
                                                    value={editVideoUrl}
                                                    onChange={e => setEditVideoUrl(e.target.value)}
                                                    placeholder="例如: https://www.youtube.com/watch?v=..."
                                                    className="w-full text-sm py-2 px-4 bg-[#fcfcfb] border border-[#edeeef] rounded-xl focus:ring-0"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">AI 学习元数据 (JSON)</label>
                                                <textarea
                                                    value={editMetadataJson}
                                                    onChange={e => setEditMetadataJson(e.target.value)}
                                                    placeholder='{"vocab": [...], "segments": [...]}'
                                                    className="w-full text-[11px] font-mono py-3 px-4 bg-[#fcfcfb] border border-[#edeeef] rounded-xl focus:ring-0 h-40"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-h-[600px] prose prose-notion max-w-none">
                                    <TipTapEditor
                                        content={editContent}
                                        onChange={setEditContent}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-300">
                            <div className="text-center opacity-40">
                                <Layout className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-sm font-medium tracking-widest uppercase">请从侧边栏选择一个分栏或页面开始编辑</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Editor;
