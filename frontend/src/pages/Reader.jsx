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

import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const Reader = () => {
    const { islandCode } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedPage, setSelectedPage] = useState(null);
    const [islandName, setIslandName] = useState("");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIslandContent = async () => {
            setLoading(true);
            try {
                // 1. Get Island info to get the name
                const islandsRes = await axios.get(`${API_BASE}/islands`);
                const currentIsland = islandsRes.data.find(is => is.code === islandCode);
                if (currentIsland) {
                    setIslandName(currentIsland.name);
                }

                // 2. Get Courses for this island
                const coursesRes = await axios.get(`${API_BASE}/islands/${islandCode}/courses`);
                const coursesData = coursesRes.data;

                // 3. For each course, fetch its pages
                const coursesWithPages = await Promise.all(coursesData.map(async (course) => {
                    const pagesRes = await axios.get(`${API_BASE}/courses/${course.id}/pages`);
                    return { ...course, pages: pagesRes.data };
                }));

                setCourses(coursesWithPages);

                // Default selection: first page of first course
                if (coursesWithPages.length > 0 && coursesWithPages[0].pages.length > 0) {
                    setSelectedPage(coursesWithPages[0].pages[0]);
                }
            } catch (err) {
                console.error("Failed to fetch island content", err);
            } finally {
                setLoading(false);
            }
        };

        fetchIslandContent();
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
                                <span className="text-sm font-semibold truncate">趣学岛 / {islandName}</span>
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

                            {courses.map(course => (
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
                        {loading ? (
                            <div className="h-screen flex items-center justify-center -mt-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 border-2 border-[#edeeef] border-t-brand-primary rounded-full"
                                />
                            </div>
                        ) : selectedPage ? (
                            <div className="animate-in fade-in duration-700">
                                <div className="flex items-center gap-4 mb-4 opacity-40">
                                    <span className="text-4xl">📄</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-[#37352f]">
                                    {selectedPage.title}
                                </h1>
                                <div className="prose prose-notion select-text max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {selectedPage.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full animate-pulse"></div>
                                <p className="font-medium tracking-widest text-sm uppercase text-center">
                                    该岛屿暂无课程内容<br />
                                    <span className="text-[10px] mt-2 block">请在编辑器中添加新页面</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Reader;
