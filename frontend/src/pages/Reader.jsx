import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
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
    Loader2,
    AlignLeft,
    BookMarked,
    Copy
} from 'lucide-react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapPin } from 'lucide-react';
import speechIsland from '../assets/images/speech_island.png';
import wealthIsland from '../assets/images/wealth_island.png';
import resilienceIsland from '../assets/images/resilience_island.png';
import artIsland from '../assets/images/art_island.png';
import wisdomIsland from '../assets/images/wisdom_island.png';
import executionIsland from '../assets/images/execution_island.png';
import socialIsland from '../assets/images/social_island.png';
import spiritIsland from '../assets/images/spirit_island.png';
import logoImg from '../assets/images/logo.png';
import kaifazhongImg from '../assets/images/kaifazhong.png';

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

function cn(...inputs) {
    return twMerge(clsx(...inputs));
}

const getCardInfo = (page) => {
    try {
        const meta = JSON.parse(page.metadata_json || '{}');
        return meta.card_info || {};
    } catch (e) {
        return {};
    }
};

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

    // 叙岛：和灵岛一样，内容区别于其他岛屿，显示"正在开发中"
    if (islandCode === 'social') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white text-[#37352f] font-sans">
                <img src={kaifazhongImg} alt="开发中" className="w-72 h-72 object-contain mb-12 drop-shadow-sm" />
                <button
                    onClick={() => navigate('/')}
                    className="mt-10 px-6 py-2.5 bg-[#37352f] text-white text-sm font-bold rounded-full hover:bg-black transition-colors active:scale-95"
                >
                    返回大地图
                </button>
            </div>
        );
    }

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
                                className="flex items-center gap-2.5 hover:bg-[#efefef] py-1.5 px-2 -ml-1 rounded transition-colors cursor-pointer overflow-hidden w-full"
                            >
                                <div className="w-8 h-8 flex items-center justify-center shrink-0 mix-blend-multiply">
                                    <img src={islandImages[islandCode] || logoImg} alt="Logo" className="w-[150%] h-[150%] object-contain scale-110 drop-shadow-sm" />
                                </div>
                                <span className="text-[16px] font-black truncate leading-none pt-0.5 tracking-tight text-gray-800">{islandName}</span>
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

                            <div className="pt-8 pb-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                <span>目录结构</span>
                            </div>

                            <div className="space-y-0.5 mb-8 pb-4">
                                {courses.flatMap(course => course.contents || course.pages || []).map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => handlePageSelect(page)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-all ${selectedPage?.id === page.id ? 'bg-white shadow-sm font-bold border border-[#edeeef] text-gray-900' : 'hover:bg-[#efefef] opacity-70 text-gray-600'}`}
                                    >
                                        <span className="w-4 text-center opacity-70">{page.icon || '📄'}</span>
                                        <span className="truncate">{page.title}</span>
                                    </button>
                                ))}
                            </div>

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
                        <div className="animate-in fade-in duration-1000 h-full overflow-y-auto w-full">
                            <div className="max-w-[1400px] mx-auto px-6 py-12 pb-32 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 w-full">
                                    {courses.flatMap(course => course.contents || course.pages || []).map(page => {
                                        const cardInfo = getCardInfo(page);
                                        return (
                                            <motion.div
                                                key={page.id}
                                                whileHover={{ y: -4 }}
                                                onClick={() => handlePageSelect(page)}
                                                className="bg-white rounded-[1.25rem] border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
                                            >
                                                <div className="aspect-[16/9] bg-[#f7f7f5] relative overflow-hidden shrink-0">
                                                    {page.thumbnail_image ? (
                                                        <img src={page.thumbnail_image} alt={page.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                                                            {page.icon || '📄'}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {cardInfo.status_label && (
                                                        <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-md text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                                            {cardInfo.status_label}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 flex flex-col flex-1 bg-white">
                                                    {cardInfo.date_range && (
                                                        <div className="text-[10.5px] text-gray-500/80 font-medium mb-1.5 tracking-tight">
                                                            {cardInfo.date_range}
                                                        </div>
                                                    )}
                                                    <div className="text-[14px] font-[800] text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight">
                                                        {page.title}
                                                    </div>
                                                    
                                                    <div className="mt-auto pt-5 flex items-center justify-between">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(cardInfo.tags || []).map((tag, i) => (
                                                                <span key={i} className="text-[10px] text-indigo-500 bg-indigo-50/80 px-2 py-[3px] rounded-md font-bold tracking-wide">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {cardInfo.location && (
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                                <MapPin className="w-3 h-3" />
                                                                {cardInfo.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : selectedPage ? (
                        /* Learning Mode Layout for ALL pages */
                        <div className="absolute inset-0 z-[100] flex p-4 gap-4 bg-[#f3f4f6] font-sans">
                            
                            {/* Left Column (60%) */}
                            <div className="w-[60%] flex flex-col gap-4 h-full">
                                {/* Top Video Card */}
                                <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm flex flex-col shrink-0">
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <button onClick={handleGoHome} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                                            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                                            <h2 className="text-[16px] font-bold tracking-tight text-gray-900">{selectedPage.title}</h2>
                                        </button>
                                        <div className="flex items-center gap-4 text-[12px] text-gray-500 font-medium">
                                            <span>时长: {metadata.card_info?.duration || "1:50"}</span>
                                            <span>难度: {metadata.card_info?.difficulty || "初级"}</span>
                                        </div>
                                    </div>
                                    <div className="w-full aspect-video bg-black relative">
                                        {selectedPage.video_url ? (
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
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 flex-col gap-3">
                                                <Play className="w-10 h-10 text-gray-600" />
                                                <span className="text-gray-500 text-sm font-bold tracking-widest">请在后台配置您的视频源 (Video URL)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Bottom Description Card */}
                                <div className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-sm flex-1 overflow-y-auto min-h-0">
                                    <div className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-800">
                                        <BookOpen className="w-4 h-4 text-gray-600" /> 视频简介
                                    </div>
                                    <div
                                        className="text-[13px] leading-relaxed text-gray-500 font-medium prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedPage.content || '<p class="opacity-40 italic">暂无课程描述信息...</p>' }}
                                    />
                                </div>
                            </div>

                            {/* Right Column (40%) */}
                            <div className="w-[40%] bg-[#f9fafb] rounded-[16px] border border-gray-200 shadow-sm flex flex-col h-full relative overflow-hidden">
                                {/* Header */}
                                <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-gray-200 z-10 shrink-0">
                                    <h3 className="text-[14px] font-bold text-gray-900">动态字幕</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setHiddenTranslations(!hiddenTranslations)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm", hiddenTranslations ? "opacity-40" : "")}>
                                            <Languages className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                            <RefreshCcw className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                            <AlignLeft className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                            <BookMarked className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                            <Copy className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                {/* Scrollable Subtitles */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                                    {metadata.segments?.map((seg, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSeek(seg.time)}
                                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-blue-200 cursor-pointer transition-colors group relative"
                                        >
                                            <div className="text-[11px] font-bold text-gray-400 mb-2">{seg.time}</div>
                                            <div className="text-[14px] font-bold text-[#37352f] leading-relaxed mb-1.5">
                                                {seg.text.split(new RegExp(`(${seg.highlight})`, 'gi')).map((part, i) =>
                                                    part.toLowerCase() === seg.highlight?.toLowerCase() ? (
                                                        <span key={i} className="text-[#15803d] border-b-2 border-[#86efac]">{part}</span>
                                                    ) : <span key={i}>{part}</span>
                                                )}
                                            </div>
                                            {!hiddenTranslations && <div className="text-[12px] text-gray-500 font-medium">{seg.translation}</div>}
                                        </div>
                                    )) || (
                                        <div className="text-center text-sm text-gray-400 mt-20">暂无动态字幕数据，可在编辑模式注入 JSON。</div>
                                    )}
                                </div>
                                {/* Floating Buttons */}
                                <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-none">
                                    <button className="pointer-events-auto bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all text-[13px] flex items-center gap-1.5">
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                        自动
                                    </button>
                                    <button className="pointer-events-auto bg-[#3b82f6] text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-600 transition-all text-[14px] flex items-center gap-1.5">
                                        <Volume2 className="w-4 h-4" />
                                        跟读模式
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default Reader;
