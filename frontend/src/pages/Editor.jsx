import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import speechIsland from '../assets/images/speech_island.png';
import wealthIsland from '../assets/images/wealth_island.png';
import resilienceIsland from '../assets/images/resilience_island.png';
import artIsland from '../assets/images/art_island.png';
import wisdomIsland from '../assets/images/wisdom_island.png';
import executionIsland from '../assets/images/execution_island.png';
import socialIsland from '../assets/images/social_island.png';
import spiritIsland from '../assets/images/spirit_island.png';
import logoImg from '../assets/images/logo.png';

const islandImages = {
    speech: speechIsland,
    wealth: wealthIsland,
    resilience: resilienceIsland,
    art: artIsland,
    wisdom: wisdomIsland,
    execution: executionIsland,
    social: socialIsland,
    spirit: spiritIsland
};

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

    // Card Specific Editing State
    const [editDateRange, setEditDateRange] = useState('');
    const [editStatusLabel, setEditStatusLabel] = useState('');
    const [editTags, setEditTags] = useState('');
    const [editLocation, setEditLocation] = useState('');

    // Island Editing State
    const [islandEditName, setIslandEditName] = useState('');
    const [islandEditSubtitle, setIslandEditSubtitle] = useState('');
    const [islandEditIcon, setIslandEditIcon] = useState('');
    const [islandEditCover, setIslandEditCover] = useState('');
    const [showIslandSettings, setShowIslandSettings] = useState(false);

    const [loading, setLoading] = useState(true);
    const [editVideoUrl, setEditVideoUrl] = useState('');
    const [editSegments, setEditSegments] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'success', 'error'
    const location = useLocation();
    const pageIdFromNav = location.state?.pageId;


    useEffect(() => {
        fetchIslands();
    }, []);

    const fetchIslands = async () => {
        try {
            const res = await axios.get(`${API_BASE}/islands`);
            setIslands(res.data);
            // Auto-selection removed: let the user pick an island manually
        } catch (err) {
            console.error("Failed to fetch islands", err);
        } finally {
            setLoading(false);
        }
    };

    // If navigated from Reader with a specific page ID, load that page directly
    useEffect(() => {
        if (pageIdFromNav) {
            (async () => {
                try {
                    const res = await axios.get(`${API_BASE}/pages/${pageIdFromNav}`);
                    const page = res.data;
                    // Set selected page and populate edit fields
                    setSelectedPage(page);
                    setEditTitle(page.title);
                    setEditContent(page.content || '');
                    setEditDescription(page.description || '');
                    setEditThumbnail(page.thumbnail_image || '');
                    setEditIcon(page.icon || '');
                    setEditVideoUrl(page.video_url || '');
                    const meta = JSON.parse(page.metadata_json || '{}');
                    const card = meta.card_info || {};
                    setEditSegments(meta.segments || []);
                    setEditDateRange(card.date_range || '');
                    setEditStatusLabel(card.status_label || '');
                    setEditTags((card.tags || []).join(', '));
                    setEditLocation(card.location || '');
                } catch (e) {
                    console.error('Failed to load page from navigation', e);
                }
            })();
        }
    }, [pageIdFromNav]);

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
                // Set the first course as default (for createNewPage)
                setSelectedCourse(res.data[0]);
                // Aggregate pages from ALL courses so the page picker shows everything
                const allPagesResults = await Promise.all(
                    res.data.map(c => axios.get(`${API_BASE}/courses/${c.id}/pages`))
                );
                const allPages = allPagesResults.flatMap(r => r.data);
                setPages(allPages);
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
            // Auto-select first page removed; user selects manually.

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
        
        try {
            const meta = JSON.parse(page.metadata_json || '{}');
            const card = meta.card_info || {};
            setEditSegments(meta.segments || []);
            setEditDateRange(card.date_range || '');
            setEditStatusLabel(card.status_label || '');
            setEditTags((card.tags || []).join(', '));
            setEditLocation(card.location || '');
        } catch (e) {
            setEditSegments([]);
            setEditDateRange('');
            setEditStatusLabel('');
            setEditTags('');
            setEditLocation('');
        }
        
        setShowIslandSettings(false);
    };

    const handleSavePage = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setSaveStatus(null);
        
        const finalMetadataJson = JSON.stringify({
            card_info: {
                date_range: editDateRange,
                status_label: editStatusLabel,
                tags: editTags.split(',').map(s => s.trim()).filter(Boolean),
                location: editLocation
            },
            segments: editSegments
        }, null, 2);

        try {
            await axios.put(`${API_BASE}/pages/${selectedPage.id}`, {
                title: editTitle,
                content: editContent,
                description: editDescription,
                thumbnail_image: editThumbnail,
                icon: editIcon,
                video_url: editVideoUrl,
                metadata_json: finalMetadataJson
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
                metadata_json: finalMetadataJson
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

    // If no island is selected yet, show a full-screen island picker UI
    if (!selectedIsland) {
        return (
            <div className="flex flex-col items-center min-h-screen bg-[#fcfcfb] p-8 md:p-12 overflow-y-auto w-full">
                <div className="max-w-6xl w-full mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500 pt-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-5xl font-black tracking-tighter text-[#37352f]">请选择要编辑的岛屿</h2>
                        <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Select an Island to start editing</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                        {islands.map(island => (
                            <button
                                key={island.id}
                                onClick={() => handleIslandSelect(island)}
                                className="group relative flex items-center p-6 bg-white border border-[#edeeef] rounded-[32px] hover:border-[#dcdcdf] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left"
                            >
                                <div className="flex items-center gap-6 w-full relative z-10">
                                    <div className="w-24 h-24 shrink-0 bg-[#f7f7f5] border border-[#edeeef] rounded-[24px] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm group-hover:scale-105 transition-all duration-500">
                                        <img src={islandImages[island.code] || logoImg} alt={island.name} className="w-16 h-16 object-contain drop-shadow-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-black text-[#37352f] mb-2 tracking-tight truncate">{island.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium opacity-80 pr-4">
                                            {island.subtitle || '管理并编辑该岛屿下的所有模块、体系内容与视频附件组件'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 shrink-0 rounded-full border border-[#edeeef] bg-gray-50 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-black" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-3 px-8 py-4 bg-white border border-[#edeeef] text-[#37352f] text-sm font-black tracking-widest uppercase rounded-full hover:bg-[#37352f] hover:border-transparent hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            返回世界大地图
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If island selected but no page selected, show page picker in main area
    if (selectedIsland && !selectedPage) {
        return (
            <div className="flex flex-col items-center min-h-screen bg-[#fcfcfb] p-8 md:p-12 overflow-y-auto w-full">
                <div className="max-w-6xl w-full mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10">
                    <div className="flex items-center justify-between w-full px-4">
                        <button
                            onClick={() => setSelectedIsland(null)}
                            className="group flex items-center justify-center w-14 h-14 bg-white border border-[#edeeef] rounded-full hover:bg-[#37352f] hover:text-white transition-colors shadow-sm active:scale-95 z-20"
                        >
                            <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                        </button>
                        <div className="text-center space-y-2 absolute left-1/2 -translate-x-1/2 z-10">
                            <h2 className="text-4xl font-black tracking-tighter text-[#37352f]">{selectedIsland.name} / 文章模块</h2>
                            <p className="text-gray-400 font-bold tracking-widest text-sm flex items-center justify-center gap-2 uppercase">
                                请选择要编辑的文章
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white border border-[#edeeef] rounded-full flex items-center justify-center shadow-inner overflow-hidden z-20 bg-opacity-80 backdrop-blur-md">
                            <img src={islandImages[selectedIsland.code] || logoImg} alt={selectedIsland.name} className="w-10 h-10 object-contain scale-[1.15] translate-y-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full px-4 pt-6 pb-12">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => handlePageSelect(page)}
                                className="group flex flex-col bg-white border border-[#edeeef] rounded-[24px] overflow-hidden hover:border-[#dcdcdf] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-300 text-left"
                            >
                                <div className="w-full aspect-[16/10] bg-[#f7f7f5] relative overflow-hidden flex items-center justify-center border-b border-[#edeeef]">
                                    {page.thumbnail_image ? (
                                        <img src={page.thumbnail_image} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-5xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                                            {page.icon || '📄'}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 w-full bg-white flex flex-col justify-center gap-1.5 relative min-h-[80px]">
                                    <h3 className="text-[17px] font-black tracking-tight text-[#37352f] truncate pr-8">
                                        {page.title || '未命名页面'}
                                    </h3>
                                    <button
                                        onClick={(e) => deletePage(e, page.id)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-500 p-2 transition-all bg-white rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </button>
                        ))}
                        
                        <button
                            onClick={createNewPage}
                            className="group flex flex-col bg-[#fcfcfb] border-2 border-dashed border-[#edeeef] rounded-[24px] overflow-hidden hover:border-[#37352f] hover:bg-[#fafafa] hover:-translate-y-1 transition-all duration-300 items-center justify-center min-h-[220px] shadow-sm w-full"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#37352f] transition-colors">
                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-[15px] font-black tracking-tight text-gray-400 group-hover:text-[#37352f] transition-colors">新建文章</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white text-[#37352f] overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="h-14 border-b border-[#edeeef] flex items-center justify-between px-6 bg-white z-10 text-sm">
                    <div className="flex items-center justify-center gap-3 text-[12px] font-bold uppercase tracking-widest text-[#37352f]">
                        <button
                            onClick={() => setSelectedPage(null)}
                            className="flex items-center gap-1.5 opacity-60 hover:opacity-100 hover:bg-gray-100 p-1.5 px-3 -ml-3 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>返回目录</span>
                        </button>
                        
                        <div className="w-[1px] h-4 bg-gray-200 mx-2"></div>

                        {showIslandSettings ? (
                            <span className="opacity-40">{selectedIsland?.name} / 主页配置</span>
                        ) : (
                            <div className="flex items-center gap-2 opacity-40">
                                <img src={islandImages[selectedIsland?.code] || logoImg} alt="" className="w-4 h-4 object-contain mix-blend-multiply drop-shadow-sm" />
                                <span>{selectedIsland?.name}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="truncate max-w-[200px] text-black opacity-80">{selectedPage?.title || '未命名'}</span>
                            </div>
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
                        <div className="absolute inset-0 z-[100] flex p-4 gap-4 bg-[#f3f4f6] font-sans overflow-hidden">
                            {/* Left Column (60%) */}
                            <div className="w-[60%] flex flex-col gap-4 h-full">
                                {/* Top Video Card Editor */}
                                <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm flex flex-col shrink-0 p-5 gap-3">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        placeholder="未命名课程标题..."
                                        className="w-full text-2xl font-black border-none focus:ring-0 text-[#37352f] p-0 bg-transparent tracking-tighter"
                                    />
                                    <div className="flex items-center gap-3 w-full bg-gray-50 border border-gray-100 rounded-lg p-2">
                                        <div className="text-[11px] font-bold text-gray-400 whitespace-nowrap px-2">点此绑入视频 🔗</div>
                                        <input
                                            type="text"
                                            value={editVideoUrl}
                                            onChange={e => setEditVideoUrl(e.target.value)}
                                            placeholder="YouTube 视频链接..."
                                            className="flex-1 bg-transparent border-none text-[13px] focus:ring-0 p-0 text-gray-700"
                                        />
                                    </div>
                                <div className="w-full bg-black rounded-lg overflow-hidden relative shadow-inner" style={{ resize: 'vertical', overflow: 'auto', minHeight: '120px', height: '360px', maxHeight: '70vh' }}>
                                    {editVideoUrl ? (
                                        <iframe src={editVideoUrl.replace('watch?v=', 'embed/')} className="w-full h-full border-none" allowFullScreen />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
                                            <Layout className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-sm font-bold opacity-50">填入上方视频链接后预览</span>
                                        </div>
                                    )}
                                </div>
                                </div>
                                {/* Bottom Content & Config Card */}
                                <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm flex-1 overflow-y-auto min-h-0">
                                    <div className="p-5 space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-bold text-gray-800 flex items-center gap-2"><Book className="w-4 h-4 text-blue-500" /> 视频/图文简介</label>
                                            <textarea
                                                value={editDescription}
                                                onChange={e => setEditDescription(e.target.value)}
                                                placeholder="用一两句话勾起学习欲望..."
                                                className="w-full text-sm py-3 px-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl focus:ring-0 resize-none h-20"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-bold text-gray-800 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-purple-500" /> 外显16:9卡片主图</label>
                                            <input
                                                type="text"
                                                value={editThumbnail}
                                                onChange={e => setEditThumbnail(e.target.value)}
                                                placeholder="图片外链URL..."
                                                className="w-full text-sm py-2 px-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl focus:ring-0"
                                            />
                                            {editThumbnail && <img src={editThumbnail} className="w-40 rounded-lg aspect-video object-cover" />}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex flex-col gap-1.5"><label className="text-[10px] uppercase font-bold text-gray-400">时间标识 (Date Range)</label><input type="text" value={editDateRange} onChange={e => setEditDateRange(e.target.value)} className="w-full text-[12px] py-1.5 px-3 bg-gray-50 border border-gray-100 rounded focus:bg-white" /></div>
                                            <div className="flex flex-col gap-1.5"><label className="text-[10px] uppercase font-bold text-gray-400">右上角章 (Status Label)</label><input type="text" value={editStatusLabel} onChange={e => setEditStatusLabel(e.target.value)} className="w-full text-[12px] py-1.5 px-3 bg-gray-50 border border-gray-100 rounded focus:bg-white" /></div>
                                            <div className="flex flex-col gap-1.5"><label className="text-[10px] uppercase font-bold text-gray-400">底部核心标签群 (Tags)</label><input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full text-[12px] py-1.5 px-3 bg-gray-50 border border-gray-100 rounded focus:bg-white" placeholder="逗号分隔" /></div>
                                            <div className="flex flex-col gap-1.5"><label className="text-[10px] uppercase font-bold text-gray-400">右下角地点 (Location)</label><input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full text-[12px] py-1.5 px-3 bg-gray-50 border border-gray-100 rounded focus:bg-white" /></div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100">
                                            <label className="text-[12px] font-bold text-gray-800 mb-3 block">深度内容正文编辑 (Markdown)</label>
                                            <div className="min-h-[400px] prose prose-sm prose-notion max-w-none border rounded-xl overflow-hidden">
                                                <TipTapEditor content={editContent} onChange={setEditContent} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column (40%) - Visual Subtitle Editor */}
                            <div className="w-[40%] bg-[#f9fafb] rounded-[16px] border border-gray-200 shadow-sm flex flex-col h-full relative overflow-hidden">
                                <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-200 z-10 shrink-0">
                                    <h3 className="text-[14px] font-bold text-gray-900">动态字幕注入舱区</h3>
                                    <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">所见即所得设计流</div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                                    {editSegments.map((seg, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:border-gray-300 transition-colors">
                                            <button onClick={() => setEditSegments(editSegments.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 p-1 bg-red-50 hover:bg-red-100 rounded transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="flex gap-2 mb-2 pr-6">
                                                <input value={seg.time} onChange={e => {const s=[...editSegments];s[idx].time=e.target.value;setEditSegments(s);}} placeholder="0:00" className="w-16 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded px-2 py-1 focus:bg-white outline-none" />
                                                <input value={seg.highlight} onChange={e => {const s=[...editSegments];s[idx].highlight=e.target.value;setEditSegments(s);}} placeholder="绿色双划线高亮词（可选）" className="flex-1 text-[11px] text-[#15803d] placeholder-green-300 bg-[#f0fdf4] border border-[#bbf7d0] rounded px-2 py-1 focus:bg-white outline-none" />
                                            </div>
                                            <textarea value={seg.text} onChange={e => {const s=[...editSegments];s[idx].text=e.target.value;setEditSegments(s);}} placeholder="🎤 原始听力文本..." className="w-full text-[13px] font-bold text-[#37352f] leading-snug bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded px-2 py-1.5 mb-2 resize-none h-16 outline-none shadow-inner" />
                                            <textarea value={seg.translation} onChange={e => {const s=[...editSegments];s[idx].translation=e.target.value;setEditSegments(s);}} placeholder="🇨🇳 对照翻译内容..." className="w-full text-[12px] text-gray-500 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded px-2 py-1.5 resize-none h-12 outline-none" />
                                        </div>
                                    ))}
                                    <button onClick={() => setEditSegments([...editSegments, { time: '', text: '', highlight: '', translation: '' }])} className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> 新增一组字幕块
                                    </button>
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

            {/* Floating Save Button - Bottom Right */}
            {selectedPage && (
                <motion.button
                    onClick={handleSavePage}
                    disabled={saving}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 px-6 py-4 rounded-full font-black text-sm shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all ${
                        saveStatus === 'success'
                            ? 'bg-green-500 text-white'
                            : saving
                                ? 'bg-gray-200 text-gray-400'
                                : 'bg-[#37352f] text-white hover:bg-black'
                    }`}
                >
                    {saveStatus === 'success' ? (
                        <><CheckCircle2 className="w-5 h-5" /> 已保存</>
                    ) : saving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> 保存中...</>
                    ) : (
                        <><Save className="w-5 h-5" /> 保存</>
                    )}
                </motion.button>
            )}
        </div>
    );
};

export default Editor;
