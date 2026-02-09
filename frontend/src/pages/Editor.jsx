import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ChevronRight,
    FileText,
    Layout,
    Eye
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const Editor = () => {
    const navigate = useNavigate();
    const [islands, setIslands] = useState([]);
    const [selectedIsland, setSelectedIsland] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIslands = async () => {
            try {
                const res = await axios.get(`${API_BASE}/islands`);
                setIslands(res.data);
                if (res.data.length > 0) {
                    setSelectedIsland(res.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch islands", err);
            } finally {
                setLoading(false);
            }
        };
        fetchIslands();
    }, []);

    const handleSave = async () => {
        if (!selectedPage) return;
        // In a real scenario, this would be a PUT/POST request to the backend
        console.log("Saving content:", { title: editTitle, content: editContent });
        alert("内容已保存 (由于目前是预览环境，修改仅在控制台显示)");
    };

    if (loading) return <div className="flex items-center justify-center h-screen italic opacity-50">加载编辑器中...</div>;

    return (
        <div className="flex h-screen bg-white text-[#37352f] overflow-hidden">
            {/* Editor Sidebar */}
            <aside className="w-72 border-r border-[#edeeef] bg-[#f7f7f5] flex flex-col">
                <div className="p-4 border-b border-[#edeeef] flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="hover:bg-[#efefef] p-1 rounded opacity-60">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">编辑控制台</span>
                    <div className="w-4 h-4"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    <div>
                        <label className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider block">选择岛屿</label>
                        <div className="space-y-0.5">
                            {islands.map(island => (
                                <button
                                    key={island.id}
                                    onClick={() => setSelectedIsland(island)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${selectedIsland?.id === island.id ? 'bg-[#efefef] font-medium' : 'hover:bg-[#efefef]'}`}
                                >
                                    <span>{island.icon}</span>
                                    <span className="truncate">{island.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedIsland && (
                        <div>
                            <label className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider block">内容页面</label>
                            <div className="space-y-0.5">
                                {/* Mock pages based on selected island */}
                                <button
                                    onClick={() => {
                                        setEditTitle(`欢迎来到${selectedIsland.name}`);
                                        setEditContent(`# 欢迎来到${selectedIsland.name}\n\n在这里开始编写你的精彩课程内容...\n\n### 课程目标\n- 掌握核心词汇\n- 理解场景表达`);
                                        setSelectedPage({ id: 1, title: `欢迎来到${selectedIsland.name}` });
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${selectedPage?.title.includes(selectedIsland.name) ? 'bg-white shadow-sm font-medium border border-[#edeeef]' : 'hover:bg-[#efefef]'}`}
                                >
                                    <FileText className="w-4 h-4 opacity-40" />
                                    <span className="truncate">课程导读</span>
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded opacity-40 hover:bg-[#efefef] transition-colors border-2 border-dashed border-gray-200 mt-2">
                                    <Plus className="w-3 h-3" />
                                    <span>添加新页面</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-orange-50/50 border-t border-orange-100 italic text-[11px] text-orange-700">
                    提示：当前处于预览编辑模式，修改暂未同步到持久化数据库。
                </div>
            </aside>

            {/* Main Editing Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-12 border-b border-[#edeeef] flex items-center justify-between px-6">
                    <div className="flex items-center gap-2 text-xs opacity-50">
                        <Layout className="w-4 h-4" />
                        <span>{selectedIsland?.name} / {selectedPage?.title || '未选择页面'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/island/${selectedIsland?.code}`)}
                            className="text-xs flex items-center gap-1 hover:bg-[#f7f7f5] px-3 py-1.5 rounded transition-colors"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            预览文章
                        </button>
                        <button
                            onClick={handleSave}
                            className="text-xs bg-[#37352f] text-white px-4 py-1.5 rounded-md font-bold flex items-center gap-1.5 hover:bg-black transition-all"
                        >
                            <Save className="w-3.5 h-3.5" />
                            保存更改
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full p-8 md:p-16">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="输入页面标题..."
                            className="w-full text-5xl font-bold border-none focus:ring-0 placeholder:opacity-20 text-[#37352f]"
                        />

                        <div className="min-h-[500px] group relative">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="开始写作吧 (支持 Markdown)..."
                                className="w-full h-full min-h-[500px] text-lg leading-relaxed border-none focus:ring-0 resize-none font-mono bg-transparent placeholder:opacity-20"
                            />
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-40 transition-opacity text-[10px] uppercase font-bold tracking-widest">
                                Markdown 编辑区
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Editor;
