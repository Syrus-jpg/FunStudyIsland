import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    Settings,
    LogOut,
    Map
} from 'lucide-react';

// 导入图标和岛屿图片
import logoImg from '../assets/images/logo.png';
import speechImg from '../assets/images/speech_island.png';
import wealthImg from '../assets/images/wealth_island.png';

const Home = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('user_role');

    const handleLogout = () => {
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white text-[#37352f] flex flex-col font-sans">
            {/* Notion-style Top Bar */}
            <nav className="h-12 border-b border-[#edeeef] flex items-center justify-between px-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 hover:bg-[#efefef] px-2 py-1 rounded transition-colors cursor-pointer whitespace-nowrap">
                        <img src={logoImg} alt="Logo" className="w-5 h-5 object-contain" />
                        <span className="font-semibold text-sm">趣学岛 (Fun Island)</span>
                    </div>
                    <span className="text-gray-300">/</span>
                    <div className="text-sm truncate opacity-60">岛屿主页</div>
                </div>
                <div className="flex items-center gap-3">
                    {userRole === 'editor' && (
                        <button
                            onClick={() => navigate('/editor')}
                            className="text-sm bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-md font-bold hover:bg-brand-primary hover:text-white transition-all flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            进入编辑端
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-sm flex items-center gap-1 hover:bg-[#efefef] px-3 py-1 rounded transition-colors"
                    >
                        <LogOut className="w-4 h-4 opacity-60" />
                        退出系统
                    </button>
                    <button className="text-sm hover:bg-[#efefef] px-1 py-1 rounded transition-colors">
                        <Settings className="w-4 h-4 opacity-60" />
                    </button>
                </div>
            </nav>

            {/* Main Content Area - Removed Gray Banner */}
            <main className="max-w-6xl mx-auto w-full px-6 py-20 flex-1">
                {/* Header Section */}
                <header className="mb-20">
                    <div className="mb-8">
                        <motion.img
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={logoImg}
                            alt="Main Logo"
                            className="w-20 h-20 object-contain drop-shadow-sm p-1"
                        />
                    </div>
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">欢迎来到趣学岛</h1>
                    <p className="text-xl opacity-50 font-medium">游戏化人生 × 知识库 × 终身学习</p>
                </header>

                {/* Island Display Area */}
                <div className="relative w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 md:gap-28">
                        {/* 言岛 (Speech) */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/speech')}
                        >
                            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
                                <img
                                    src={speechImg}
                                    alt="言岛"
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-blue-600 transition-colors">言岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Speech Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                名人学习 · 雅思 · 场景英语
                            </div>
                        </motion.div>

                        {/* 财岛 (Wealth) */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/wealth')}
                        >
                            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
                                <img
                                    src={wealthImg}
                                    alt="财岛"
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-amber-600 transition-colors">财岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Wealth Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                创业 · 副业 · 赚钱
                            </div>
                        </motion.div>

                        {/* 占位符 - 未来岛屿 */}
                        <div className="flex flex-col items-center justify-center opacity-[0.05] border-2 border-dashed border-[#edeeef] rounded-[60px] aspect-square max-w-[320px]">
                            <div className="text-5xl text-gray-400">💎</div>
                            <p className="mt-6 font-bold text-[10px] tracking-[0.3em] uppercase text-center px-8 leading-relaxed">
                                群众投票解锁<br />开发进度中
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footnote */}
                <div className="mt-32 text-center border-t border-[#f7f7f5] pt-12">
                    <p className="text-sm opacity-20 font-medium italic tracking-wide">
                        "一本书解决一类人的问题，让爱宠陪伴你终身趣味学习。"
                    </p>
                </div>
            </main>

            {/* AI Pet Egg - More Minimalist */}
            <motion.div
                drag
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                className="fixed bottom-12 right-12 z-50 group"
            >
                <div className="relative">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#edeeef] flex items-center justify-center cursor-grab active:cursor-grabbing hover:shadow-xl hover:border-brand-primary transition-all duration-500"
                    >
                        <span className="text-3xl">🥚</span>
                    </motion.div>
                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
