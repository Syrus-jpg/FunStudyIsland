import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Menu,
    FileText,
    Bookmark,
    ArrowLeft,
    Layout,
    Plus,
    Heart,
    X,
    Settings,
    Bookmark as BookmarkIcon,
    Share2,
    MessageSquare,
    BookOpen,
    Languages,
    RefreshCcw,
    Volume2,
    EyeOff,
    Eye,
    Play,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(...inputs));
}

const API_BASE = 'http://localhost:8000/api/v1';

const Reader = () => {
    const { islandCode } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedPage, setSelectedPage] = useState(null);
    const [islandInfo, setIslandInfo] = useState(null);
    const [isIslandHome, setIsIslandHome] = useState(true);
    const [loading, setLoading] = useState(true);
    const [islandName, setIslandName] = useState('');
    const [courses, setCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('vocab');
    const [hiddenTranslations, setHiddenTranslations] = useState(false);

    const playerRef = useRef(null);
    const [playerState, setPlayerState] = useState({
        playing: false,
        playedSeconds: 0
    });

    // Auth & Favorites
    const [userRole] = useState(localStorage.getItem('user_role') || 'student');
    const [favorites, setFavorites] = useState([]);

    // Snippet Management
    const [showSnippetMenu, setShowSnippetMenu] = useState(false);
    const [snippetPos, setSnippetPos] = useState({ top: 0, left: 0 });
    const [selectedText, setSelectedText] = useState("");

    useEffect(() => {
        const fetchIslandContent = async () => {
            setLoading(true);
            try {
                const islandRes = await axios.get(`${API_BASE}/islands/${islandCode}`);
                setIslandInfo(islandRes.data);
                setIslandName(islandRes.data.name);

                const coursesRes = await axios.get(`${API_BASE}/islands/${islandCode}/courses`);
                setCourses(coursesRes.data);

                try {
                    const favRes = await axios.get(`${API_BASE}/favorites/1`);
                    setFavorites(favRes.data);
                } catch (e) {
                    console.log("No favorites found");
                }

                setIsIslandHome(true);
                setSelectedPage(null);
            } catch (err) {
                console.error("Failed to fetch island content", err);
            } finally {
                setLoading(false);
            }
        };

        fetchIslandContent();
    }, [islandCode]);

    const handlePageSelect = (page) => {
        setSelectedPage(page);
        setIsIslandHome(false);
        window.scrollTo(0, 0);
    };

    const handleGoHome = () => {
        setSelectedPage(null);
        setIsIslandHome(true);
    };

    const handleSeek = (timeStr) => {
        if (!playerRef.current) return;
        const parts = timeStr.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 2) {
            seconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        playerRef.current.seekTo(seconds, 'seconds');
        setPlayerState(prev => ({ ...prev, playing: true }));
    };

    const toggleFavoritePage = async (pageId) => {
        const isFav = favorites.find(f => f.item_id === pageId && f.item_type === 'article');
        if (isFav) {
            await axios.delete(`${API_BASE}/favorites/${isFav.id}`);
            setFavorites(favorites.filter(f => f.id !== isFav.id));
        } else {
            const res = await axios.post(`${API_BASE}/favorites`, {
                user_id: 1,
                item_id: pageId,
                item_type: 'article',
                content: selectedPage?.title
            });
            setFavorites([...favorites, res.data]);
        }
    };

    const handleTextSelection = () => {
        if (userRole !== 'student') return;
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text && text.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSnippetPos({
                top: rect.top + window.scrollY - 45,
                left: rect.left + rect.width / 2 - 40
            });
            setSelectedText(text);
            setShowSnippetMenu(true);
        } else {
            setShowSnippetMenu(false);
        }
    };

    const saveSnippet = async (e) => {
        e.stopPropagation();
        if (!selectedText) return;
        try {
            const res = await axios.post(`${API_BASE}/favorites`, {
                user_id: 1,
                item_id: selectedPage?.id || 0,
                item_type: 'snippet',
                content: selectedText
            });
            setFavorites([...favorites, res.data]);
            setShowSnippetMenu(false);
            window.getSelection().removeAllRanges();
            alert("已成功收藏该语料片段！");
        } catch (err) {
            alert("收藏失败");
        }
    };

    useEffect(() => {
        if (userRole === 'student') {
            const handleCopy = (e) => {
                e.preventDefault();
                alert("抱歉，当前内容受版权保护，禁止直接复制粘贴。");
            };
            const handleContextMenu = (e) => e.preventDefault();

            document.addEventListener('copy', handleCopy);
            document.addEventListener('contextmenu', handleContextMenu);
            return () => {
                document.removeEventListener('copy', handleCopy);
                document.removeEventListener('contextmenu', handleContextMenu);
            };
        }
    }, [userRole]);

    const parseMetadata = (jsonStr) => {
        try {
            return JSON.parse(jsonStr || '{}');
        } catch (e) {
            return {};
        }
    };

    const metadata = parseMetadata(selectedPage?.metadata_json);
    const isLearningMode = !!selectedPage?.video_url;

    return (
        <div className="flex h-screen bg-white text-[#37352f] overflow-hidden font-sans">
            {/* Snippet Menu (Floating) */}
            {showSnippetMenu && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'absolute', top: snippetPos.top, left: snippetPos.left }}
                    className="z-50 bg-[#37352f] text-white px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-black transition-all border border-white/20 whitespace-nowrap"
                    onClick={saveSnippet}
                >
                    <BookmarkIcon className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">收藏语料</span>
                </motion.div>
            )}

            {/* Notion-style Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r border-[#edeeef] bg-[#f7f7f5] flex flex-col z-[60] overflow-hidden"
                    >
                        <div className="h-12 flex items-center justify-between px-4 shrink-0 transition-opacity">
                            <div
                                onClick={handleGoHome}
                                className="flex items-center gap-2 hover:bg-[#efefef] p-1 rounded transition-colors cursor-pointer overflow-hidden max-w-[200px]"
                            >
                                <div className="w-5 h-5 bg-[#edeeef] rounded flex items-center justify-center text-[10px]">
                                    {islandInfo?.icon || '🏝️'}
                                </div>
                                <span className="text-sm font-semibold truncate leading-none pt-0.5">趣学岛 / {islandName}</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="hover:bg-[#efefef] p-1 rounded opacity-60">
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-hide">
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[#efefef] rounded transition-colors opacity-60 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>返回大地图</span>
                            </button>

                            <button
                                onClick={handleGoHome}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${isIslandHome ? 'bg-[#efefef] font-bold text-black opacity-100' : 'hover:bg-[#efefef] opacity-50'}`}
                            >
                                <Menu className="w-4 h-4" />
                                <span>岛屿概览</span>
                            </button>

                            <div className="pt-8 pb-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                <span>目录结构</span>
                                {userRole === 'editor' && (
                                    <button onClick={() => navigate('/editor')} className="hover:text-black transition-colors">
                                        <Settings className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {courses.map(course => (
                                <div key={course.id} className="space-y-0.5 mb-4">
                                    <div className="px-3 py-1.5 text-[10px] font-black flex items-center gap-2 opacity-30 uppercase tracking-tighter">
                                        {course.title}
                                    </div>
                                    {(course.contents || course.pages || []).map(page => (
                                        <button
                                            key={page.id}
                                            onClick={() => handlePageSelect(page)}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-all ${selectedPage?.id === page.id ? 'bg-white shadow-sm font-bold border border-[#edeeef]' : 'hover:bg-[#efefef] opacity-60'}`}
                                        >
                                            <span className="w-4 text-center">{page.icon || '📄'}</span>
                                            <span className="truncate">{page.title}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}

                            {favorites.length > 0 && (
                                <div className="mt-8">
                                    <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">我的收藏</div>
                                    <div className="space-y-2">
                                        {favorites.filter(f => f.item_type === 'snippet').map(fav => (
                                            <div key={fav.id} className="px-3 py-2 text-xs bg-yellow-50/50 border border-yellow-100/50 rounded-lg mx-1 group relative">
                                                <div className="line-clamp-2 opacity-60 italic leading-relaxed">"{fav.content}"</div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        axios.delete(`${API_BASE}/favorites/${fav.id}`).then(() => setFavorites(favorites.filter(f => f.id !== fav.id)));
                                                    }}
                                                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-white shadow-sm rounded-full p-0.5 hover:text-red-500 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
                <header className="h-12 border-b border-transparent fixed top-0 w-full flex items-center justify-between px-4 font-sans text-sm z-30 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="hover:bg-[#f7f7f5] p-1.5 rounded mr-2 transition-colors">
                                <Menu className="w-4 h-4" />
                            </button>
                        )}
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">
                            {isIslandHome ? 'Station / 首页' : `Reader / ${selectedPage?.title}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedPage && (
                            <button
                                onClick={() => toggleFavoritePage(selectedPage.id)}
                                className={`p-1.5 rounded-full transition-all ${favorites.find(f => f.item_id === selectedPage.id && f.item_type === 'article') ? 'bg-rose-50 text-rose-500 scale-110' : 'hover:bg-gray-100 text-gray-300'}`}
                            >
                                <Heart className={`w-4 h-4 ${favorites.find(f => f.item_id === selectedPage.id && f.item_type === 'article') ? 'fill-current' : ''}`} />
                            </button>
                        )}
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 hidden md:block">
                            {userRole === 'student' ? 'Student View' : 'Editor Mode'}
                        </div>
                    </div>
                </header>

                <div
                    className={`flex-1 overflow-y-auto pt-12 ${userRole === 'student' ? 'select-none' : ''}`}
                    onMouseUp={handleTextSelection}
                >
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-[#edeeef] border-t-black rounded-full" />
                        </div>
                    ) : isIslandHome ? (
                        <div className="animate-in fade-in duration-1000">
                            <div className="h-64 w-full relative">
                                <img src={islandInfo?.cover_image || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2000"} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>

                            <div className="max-w-6xl mx-auto px-8 lg:px-24 pb-20">
                                <div className="relative mt-8 mb-16">
                                    <h1 className="text-5xl font-black text-[#37352f] tracking-tight mb-4">{islandName}</h1>
                                    <p className="text-xl text-[#37352f]/40 font-medium max-w-2xl">{islandInfo?.subtitle || islandInfo?.description}</p>
                                </div>

                                <div className="space-y-20 pb-40">
                                    {courses.map(course => (
                                        <section key={course.id}>
                                            <h3 className="text-xl font-bold text-[#37352f] mb-6 flex items-center gap-3">
                                                {course.title}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {(course.contents || course.pages || []).map(page => (
                                                    <motion.div
                                                        key={page.id}
                                                        whileHover={{ y: -4 }}
                                                        onClick={() => handlePageSelect(page)}
                                                        className="bg-white rounded-lg border border-[#edeeef] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                                                    >
                                                        <div className="aspect-[16/9] bg-[#f7f7f5] relative overflow-hidden">
                                                            {page.thumbnail_image ? (
                                                                <img src={page.thumbnail_image} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                                                                    {page.icon || '📄'}
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/5" />
                                                        </div>
                                                        <div className="px-3 py-2 border-t border-[#f7f7f5] flex items-center gap-2">
                                                            <span className="text-sm">{page.icon || '📄'}</span>
                                                            <span className="text-[13px] font-medium text-[#37352f] truncate">{page.title}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : isLearningMode ? (
                        /* Learning Mode Layout */
                        <div className="h-full flex p-4 gap-4 bg-[#f7f7f5]">
                            {/* Left: Video */}
                            <div className="w-[32%] flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar">
                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 group">
                                    <ReactPlayer
                                        ref={playerRef}
                                        url={selectedPage.video_url}
                                        width="100%"
                                        height="100%"
                                        playing={playerState.playing}
                                        onProgress={(p) => setPlayerState(prev => ({ ...prev, playedSeconds: p.playedSeconds }))}
                                        onPlay={() => setPlayerState(prev => ({ ...prev, playing: true }))}
                                        onPause={() => setPlayerState(prev => ({ ...prev, playing: false }))}
                                        controls
                                    />
                                </div>
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="flex items-center gap-2 text-sm font-black mb-4 opacity-70">
                                        <BookOpen className="w-4 h-4" /> 视频简介
                                    </h3>
                                    <div
                                        className="text-sm leading-relaxed opacity-60 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedPage.content }}
                                    />
                                </div>
                            </div>

                            {/* Center: Subtitles */}
                            <div className="w-[38%] bg-white rounded-3xl flex flex-col shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                    <h3 className="text-sm font-black">动态字幕</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setHiddenTranslations(!hiddenTranslations)} className={cn("p-1.5 rounded-lg transition-all", !hiddenTranslations ? "bg-blue-50 text-blue-600" : "text-gray-300")}>
                                            <Languages className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-300 hover:text-black transition-colors">
                                            <RefreshCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {metadata.segments?.map((seg, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSeek(seg.time)}
                                            className="p-4 rounded-2xl hover:bg-[#f7f7f5] group transition-all cursor-pointer relative"
                                        >
                                            <div className="text-[10px] font-bold text-gray-300 group-hover:text-amber-500 mb-1">{seg.time}</div>
                                            <div className="text-[15px] font-bold text-[#37352f] leading-snug">
                                                {seg.text.split(new RegExp(`(${seg.highlight})`, 'gi')).map((part, i) =>
                                                    part.toLowerCase() === seg.highlight?.toLowerCase() ? (
                                                        <span key={i} className="bg-emerald-50 text-emerald-700 px-1 rounded mx-0.5">{part}</span>
                                                    ) : <span key={i}>{part}</span>
                                                )}
                                            </div>
                                            {!hiddenTranslations && <div className="text-xs text-gray-400 mt-1">{seg.translation}</div>}
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Play className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Vocab */}
                            <div className="w-[30%] bg-white rounded-3xl flex flex-col shadow-sm border border-gray-100 overflow-hidden">
                                <div className="flex border-b border-gray-50">
                                    <button onClick={() => setActiveTab('vocab')} className={cn("flex-1 py-4 text-xs font-black transition-all", activeTab === 'vocab' ? "text-blue-600 border-b-2 border-blue-600" : "opacity-30")}>
                                        单词 ({metadata.vocab?.length || 0})
                                    </button>
                                    <button onClick={() => setActiveTab('phrases')} className={cn("flex-1 py-4 text-xs font-black transition-all", activeTab === 'phrases' ? "text-blue-600 border-b-2 border-blue-600" : "opacity-30")}>
                                        短语
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {metadata.vocab?.map((v, i) => (
                                        <div key={i} className="p-5 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-black">{v.word}</h4>
                                                <div className="flex gap-1">
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 rounded text-[10px] font-bold">认识</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mb-3">{v.phonetic} • {v.meaning}</div>
                                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                <div className="text-xs font-bold text-gray-700">"{v.example}"</div>
                                                <div className="text-[10px] text-gray-400">"{v.example_cn}"</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-700 max-w-4xl mx-auto px-8 md:px-24 py-20 pb-40">
                            <div className="mb-20">
                                <div className="text-8xl mb-6">{selectedPage?.icon || '📄'}</div>
                                <h1 className="text-6xl font-black text-[#37352f] tracking-tighter mb-4 leading-tight">{selectedPage?.title}</h1>
                                {selectedPage?.description && <p className="text-xl text-gray-400 font-medium italic border-l-4 border-gray-100 pl-6">{selectedPage.description}</p>}
                            </div>

                            <div
                                className="tiptap prose prose-notion max-w-none select-text"
                                dangerouslySetInnerHTML={{ __html: selectedPage?.content }}
                            />

                            {userRole === 'student' && (
                                <div className="mt-32 pt-8 border-t border-gray-100 text-center opacity-40">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">© 2026 Quxuedao Platform</div>
                                    <p className="text-[10px] italic">版权所有，禁止任何形式的转载或抓取</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Reader;
