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
import resilienceImg from '../assets/images/resilience_island.png';
import artImg from '../assets/images/art_island.png';
import wisdomImg from '../assets/images/wisdom_island.png';
import executionImg from '../assets/images/execution_island.png';
import socialImg from '../assets/images/social_island.png';
import spiritImg from '../assets/images/spirit_island.png';

const Home = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('user_role');

    const handleLogout = () => {
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#fff] text-[#37352f] selection:bg-[#fbefd1] flex flex-col">
            {/* Notion Style Border-less Navigation */}
            <nav className="h-12 w-full flex items-center justify-between px-4 fixed top-0 bg-white/80 backdrop-blur-sm z-50">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#efefef] rounded cursor-pointer transition-colors">
                        <img src={logoImg} alt="Logo" className="w-5 h-5 object-contain" />
                        <span className="font-semibold text-sm">趣学岛 (Fun Learning Island)</span>
                    </div>
                    <span className="text-gray-300">/</span>
                    <div className="text-sm truncate opacity-60">岛屿主页</div>
                </div>
                <div className="flex items-center gap-3">
                    {userRole === 'editor' && (
                        <button
                            onClick={() => navigate('/editor')}
                            className="text-sm flex items-center gap-1 hover:bg-[#efefef] px-3 py-1 rounded transition-colors"
                        >
                            <Plus className="w-4 h-4 opacity-60" />
                            进入编辑端
                        </button>
                    )}
                    <button className="p-1 hover:bg-[#efefef] rounded transition-colors">
                        <Settings className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-1 hover:bg-[#efefef] rounded transition-colors"
                    >
                        <LogOut className="w-4 h-4 opacity-40 hover:opacity-100" />
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto w-full px-6 py-20 flex-1">
                {/* Header Section */}
                <header className="mb-20 pt-10">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 md:gap-x-28 gap-y-0 items-end">
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
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#166534] transition-colors">言岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Speech Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
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
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#f59e0b] transition-colors">财岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Wealth Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                财商培养 · 副业探索 · 创业思维
                            </div>
                        </motion.div>

                        {/* 逆岛 (Resilience) */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/resilience')}
                        >
                            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
                                <img
                                    src={resilienceImg}
                                    alt="逆岛"
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-gray-500 transition-colors">逆岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Resilience Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                抗风险 · 心理建设 · 逆境成长
                            </div>
                        </motion.div>

                        {/* 艺岛 (Art) - Positioned under Speech Island */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/art')}
                        >
                            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
                                <img
                                    src={artImg}
                                    alt="艺岛"
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#f9a8d4] transition-colors">艺岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Art Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                审美 · 艺术史 · 创意表达
                            </div>
                        </motion.div>

                        {/* 行岛 (Execution) - Positioned under Wealth Island */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/execution')}
                        >
                            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
                                <img
                                    src={executionImg}
                                    alt="行岛"
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#fbbf24] transition-colors">行岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Execution Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                执行力 · 时间管理 · 目标闭环
                            </div>
                        </motion.div>

                        {/* 智岛 (Wisdom) - Positioned under Resilience Island */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/wisdom')}
                        >
                            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
                                <img
                                    src={wisdomImg}
                                    alt="智岛"
                                    className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#78350f] transition-colors">智岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Wisdom Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                深度思考 · 哲学 · 认知升级
                            </div>
                        </motion.div>

                        {/* 叙岛 (Social) - Positioned under Art Island (Row 3, Col 1) */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/social')}
                        >
                            <div className="relative w-full aspect-square max-w-[380px] flex items-center justify-center">
                                <img
                                    src={socialImg}
                                    alt="叙岛"
                                    className="w-full h-full object-contain scale-110 transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#8b9d77] transition-colors">叙岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Social Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                煮茶论道 · 英语对练 · 话题广场
                            </div>
                        </motion.div>

                        {/* 灵岛 (Spirit) - Positioned under Execution Island (Row 3, Col 2) */}
                        <motion.div
                            whileHover={{ y: -12 }}
                            className="flex flex-col items-center group cursor-pointer"
                            onClick={() => navigate('/island/spirit')}
                        >
                            <div className="relative w-full aspect-square max-w-[380px] flex items-center justify-center">
                                <img
                                    src={spiritImg}
                                    alt="灵岛"
                                    className="w-full h-full object-contain scale-110 transition-all duration-700 group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                                />
                            </div>
                            <h2 className="mt-10 text-2xl font-bold text-[#37352f] tracking-tight group-hover:text-[#0abab5] transition-colors">灵岛</h2>
                            <p className="text-[10px] opacity-30 font-black mt-2 tracking-[0.3em] uppercase">Spirit Island</p>
                            <div className="mt-4 px-5 py-2 bg-[#f7f7f5] rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                                AI 互动 · 宠物陪练 · 情感成长
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Footnote */}
                <div className="mt-32 text-center border-t border-[#f7f7f5] pt-12">
                    <p className="text-sm opacity-20 font-medium italic tracking-wide">
                        "一边养宠，一边趣味学英语"
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Home;
