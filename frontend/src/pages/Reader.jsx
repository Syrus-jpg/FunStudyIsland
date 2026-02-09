import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Menu,
    X,
    ChevronRight,
    Search,
    Clock,
    MessageSquare,
    FileText,
    Bookmark
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Robust Mock Data for offline preview
const MOCK_CONTENT = {
    speech: {
        title: "言岛",
        courses: [
            { id: 1, title: "名人演讲精选", pages: [{ id: 101, title: "乔布斯斯坦福演讲记录", content: "# 乔布斯斯坦福演讲\n\nStay Hungry, Stay Foolish.\n\n这是乔布斯在2005年斯坦福大学毕业典礼上的演讲。\n\n### 核心要点\n- 串联起生命中的点滴\n- 关于爱与失去\n- 关于死亡" }] },
            { id: 2, title: "场景英语", pages: [{ id: 102, title: "商务会议常用表达", content: "# 商务会议常用表达\n\n在本章中，我们将学习如何在地道的商务环境中表达观点。" }] }
        ]
    },
    wealth: {
        title: "财岛",
        courses: [
            { id: 3, title: "创业基础课", pages: [{ id: 103, title: "如何发现市场痛点", content: "# 市场痛点分析\n\n成功的创业往往始于一个深刻的行业洞察。" }] }
        ]
    }
};

const Reader = () => {
    const { islandCode } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedPage, setSelectedPage] = useState(null);
    const [islandData, setIslandData] = useState(null);

    useEffect(() => {
        // Priority: use mock data if local server is not accessible
        const data = MOCK_CONTENT[islandCode] || {
            title: "未知岛屿",
            courses: [{ title: "正在建设中", pages: [{ title: "暂无内容", content: "请期待后续内容更新..." }] }]
        };
        setIslandData(data);
        setSelectedPage(data.courses[0].pages[0]);
    }, [islandCode]);

    return (
        <div className="flex h-screen bg-white text-[#37352f] overflow-hidden font-sans">
            {/* Notion-style Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r border-[#edeeef] bg-[#f7f7f5] flex flex-col z-20"
                    >
                        <div className="h-12 flex items-center justify-between px-4">
                            <div className="flex items-center gap-2 hover:bg-[#efefef] p-1 rounded transition-colors cursor-pointer overflow-hidden">
                                <div className="w-5 h-5 bg-[#edeeef] rounded flex items-center justify-center text-[10px] font-bold">趣</div>
                                <span className="text-sm font-semibold truncate">趣学岛 / {islandData?.title}</span>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="hover:bg-[#efefef] p-1 rounded opacity-60"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[#efefef] rounded transition-colors opacity-60"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>返回大地图</span>
                            </button>

                            <div className="pt-4 pb-2 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                目录结构
                            </div>

                            {islandData?.courses.map(course => (
                                <div key={course.id} className="space-y-0.5">
                                    <div className="px-3 py-1.5 text-sm font-semibold flex items-center gap-2 opacity-50 truncate">
                                        <Bookmark className="w-3 h-3" />
                                        {course.title}
                                    </div>
                                    {course.pages.map(page => (
                                        <button
                                            key={page.id}
                                            onClick={() => setSelectedPage(page)}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${selectedPage?.id === page.id ? 'bg-white shadow-sm font-medium' : 'hover:bg-[#efefef]'}`}
                                        >
                                            <FileText className="w-4 h-4 opacity-40" />
                                            <span className="truncate">{page.title}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* AI Assistant Mini Widget */}
                        <div className="p-4 mt-auto border-t border-[#edeeef]">
                            <div className="bg-white p-3 rounded-lg border border-[#edeeef] shadow-sm flex items-center gap-3">
                                <div className="text-xl">🥚</div>
                                <div className="text-[11px]">
                                    <p className="font-bold">Gemini Assistant</p>
                                    <p className="opacity-50">随时为您解答</p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
                {/* Top Header */}
                <header className="h-12 border-b border-[#edeeef] flex items-center justify-between px-4 font-sans text-sm">
                    <div className="flex items-center gap-2">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="hover:bg-[#f7f7f5] p-1.5 rounded transition-colors mr-2">
                                <Menu className="w-4 h-4" />
                            </button>
                        )}
                        <div className="flex items-center gap-2 opacity-60">
                            <FileText className="w-4 h-4" />
                            <span className="truncate">{selectedPage?.title}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 opacity-40 text-xs hidden md:flex">
                            <Clock className="w-3 h-3" />
                            <span>上次于 刚才 编辑</span>
                        </div>
                        <button className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-bold text-xs hover:bg-brand-primary hover:text-white transition-all">
                            解锁宝箱
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-3xl mx-auto px-8 py-20">
                        {selectedPage ? (
                            <div className="animate-in fade-in duration-700">
                                <div className="flex items-center gap-4 mb-4 opacity-40">
                                    <span className="text-4xl">📄</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                                    {selectedPage.title}
                                </h1>
                                <div className="prose prose-notion select-text">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {selectedPage.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full animate-pulse"></div>
                                <p className="font-medium tracking-widest text-sm uppercase">正在加载岛屿内容...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Action Button (Pet Chat) */}
                {!selectedPage ? null : (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="fixed bottom-8 right-8 w-14 h-14 bg-[#37352f] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-primary transition-colors cursor-pointer"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </motion.button>
                )}
            </main>
        </div>
    );
};

export default Reader;
