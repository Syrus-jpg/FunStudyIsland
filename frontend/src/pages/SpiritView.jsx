import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Flame,
    Heart,
    Sparkles,
    Upload,
    X,
    RefreshCw,
    ArrowRight
} from 'lucide-react';
import eggImg from '../assets/images/egg.png';
import dogNpcImg from '../assets/images/dog_npc.png';

const SpiritView = () => {
    const navigate = useNavigate();
    const [hatchProgress, setHatchProgress] = useState(65);
    const [favorability, setFavorability] = useState(12);
    const [isUploaded, setIsUploaded] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isHatching, setIsHatching] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const creatureVariants = {
        eggIdle: {
            y: [0, -15, 0],
            transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        },
        shake: {
            rotate: [0, -15, 15, -15, 15, -15, 15, 0],
            scale: [1, 1.1, 0.95, 1.1, 1],
            transition: { duration: 0.3, repeat: Infinity }
        },
        hatchExit: {
            scale: 0,
            opacity: 0,
            transition: { duration: 0.4 }
        },
        dogInitial: {
            scale: 0,
            opacity: 0,
            y: 50
        },
        dogIdle: {
            scale: 1,
            opacity: 1,
            scaleY: [1, 0.99, 1],
            scaleX: [1, 1.01, 1],
            y: [0, -5, 0],
            transition: {
                scale: { type: "spring", stiffness: 260, damping: 20 },
                opacity: { duration: 0.4 },
                scaleY: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scaleX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }
        },
        tap: {
            scale: 0.95,
            rotate: [0, -3, 3, 0],
            transition: { duration: 0.2 }
        }
    };

    const handleHatch = () => {
        setIsHatching(true);
        setTimeout(() => setShowUploadModal(false), 800);
        setTimeout(() => {
            setIsUploaded(true);
            setIsHatching(false);
        }, 1400);
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] text-[#37352f] selection:bg-[#fbefd1] flex flex-col font-sans" onMouseMove={handleMouseMove}>
            <nav className="h-14 w-full flex items-center justify-between px-6 fixed top-0 bg-white/40 backdrop-blur-md z-50">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#efefed] rounded-lg transition-all group">
                    <ChevronLeft className="w-4 h-4 text-[#787774] group-hover:text-[#37352f]" />
                    <span className="text-sm font-medium text-[#787774] group-hover:text-[#37352f]">回大本营</span>
                </button>
                <div className="flex items-center gap-4">
                    {isUploaded && (
                        <button onClick={() => setIsUploaded(false)} className="flex items-center gap-1.5 bg-white/60 hover:bg-white px-3 py-1 rounded-full border border-[#eeeeec] shadow-sm transition-all text-[#787774] hover:text-rose-500">
                            <RefreshCw className="w-3 h-3" />
                            <span className="text-[10px] font-bold">重新孵化</span>
                        </button>
                    )}
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center relative pt-20 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0abab5]/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="z-10 w-full max-w-5xl flex flex-col items-center">
                    <div className="relative w-80 flex flex-col items-center justify-center mb-32">
                        <div className="absolute top-[260px] w-48 h-6 bg-black/5 rounded-[50%] blur-md"></div>
                        <AnimatePresence>
                            {!isUploaded ? (
                                <motion.div key="egg" variants={creatureVariants} initial="eggIdle" animate={isHatching ? "shake" : "eggIdle"} exit="hatchExit" whileHover={!isHatching ? "shake" : ""} className="relative w-64 h-64 cursor-pointer">
                                    <img src={eggImg} alt="Egg" className="w-full h-full object-contain drop-shadow-xl" />
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center gap-8">
                                    <motion.div key="dog" variants={creatureVariants} initial="dogInitial" animate="dogIdle" whileTap="tap" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-80 h-80 flex flex-col items-center cursor-pointer">
                                        <img src={dogNpcImg} alt="Dog NPC" className="w-full h-full object-contain drop-shadow-2xl scale-110 pointer-events-none" />
                                    </motion.div>

                                    {/* Favorability Progress Bar - Fuller Gamer Style */}
                                    <div className="flex items-center gap-4 w-80">
                                        <div className="h-2.5 flex-1 bg-[#eeeeec] rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${favorability}%` }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400 relative"
                                            >
                                                <div className="absolute inset-0 bg-white/20 h-1/2 rounded-t-full" />
                                            </motion.div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-[9px] font-bold opacity-40">好感度等级</span>
                                            <span className="text-sm font-black text-rose-500 italic">LV 1</span>
                                            <span className="text-[10px] font-black opacity-20 tabular-nums">({favorability}%)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isUploaded && !isHatching && (
                        <div className="flex flex-col items-center gap-4 mb-12">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#37352f] text-white rounded-xl shadow-lg hover:bg-black transition-all"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold tracking-wide">上传宠物照片, 加速小宠孵化!</span>
                            </motion.button>

                            {/* Hatching Progress Bar - Fuller Version */}
                            <div className="flex items-center gap-4 w-72">
                                <div className="h-2.5 flex-1 bg-[#eeeeec] rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${hatchProgress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full rounded-full bg-gradient-to-r from-[#0abab5] to-[#7eeed1]"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[9px] font-bold opacity-40">破壳率</span>
                                    <span className="text-sm font-black text-[#0abab5] tabular-nums">{hatchProgress}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mac-style Minimal Oval Action Buttons */}
                    <div className="flex gap-10 justify-center w-full max-w-5xl">
                        <MacFlipCard emoji="🎤" title="口语陪练" sub="Oral Training" desc="1V1 沉浸式口语对练" color="#0abab5" />
                        <MacFlipCard emoji="✉️" title="知识总结" sub="Insight Digest" desc="提炼每日核心知识卡片" color="#8b5cf6" />
                        <MacFlipCard emoji="✈️" title="小宠旅行" sub="Pet Travel" desc="搜寻灵性启发与明信片" color="#f59e0b" />
                        <MacFlipCard emoji="💖" title="好感攻略" sub="Favorability" desc="查看羁绊等级与互动动作" color="#ec4899" />
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => !isHatching && setShowUploadModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#eeeeec]">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold italic underline decoration-[#0abab5]/30">注入灵魂</h3>
                                    <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-[#f7f7f5] rounded-full transition-colors"><X className="w-4 h-4 opacity-40" /></button>
                                </div>
                                {!isHatching ? (
                                    <div onClick={handleHatch} className="border-2 border-dashed border-[#eeeeec] rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#0abab5] transition-all bg-[#fafaf9] group">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform"><Upload className="w-6 h-6 text-[#0abab5]" /></div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold">请放置你的宠物日常照</p>
                                            <p className="text-[10px] opacity-40 font-medium mt-1 uppercase tracking-wider">支持 JPG, PNG, WEBP</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center gap-6">
                                        <div className="relative">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 border-4 border-[#0abab5]/10 border-t-[#0abab5] rounded-full" />
                                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0abab5] w-6 h-6 animate-pulse" />
                                        </div>
                                        <div className="text-center font-bold animate-pulse text-[#0abab5]">小宠正在孵化中...</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <footer className="h-16 flex items-center justify-center opacity-40"><p className="text-[10px] font-bold tracking-[3px] uppercase">Spirit Sanctuary · Level Up Your Soul</p></footer>
        </div>
    );
};

const MacFlipCard = ({ emoji, title, sub, desc, color }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="relative h-16 w-52 cursor-pointer perspective-1000 group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front Side - Mac-style Pill */}
                <div className="absolute inset-0 backface-hidden bg-white/70 backdrop-blur-md rounded-full border border-white flex items-center px-6 gap-4 shadow-sm group-hover:shadow-md group-hover:bg-white transition-all duration-300">
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#37352f] leading-tight">{title}</span>
                        <span className="text-[9px] opacity-30 font-black uppercase tracking-wider mt-0.5">{sub}</span>
                    </div>
                </div>

                {/* Back Side - Compact Detail */}
                <div
                    className="absolute inset-0 backface-hidden bg-white rounded-full border px-6 flex items-center justify-between shadow-lg"
                    style={{
                        transform: "rotateX(180deg)",
                        borderColor: color
                    }}
                >
                    <span className="text-[11px] font-bold opacity-70 truncate pr-2" style={{ color }}>{desc}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color }} />
                </div>
            </motion.div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default SpiritView;
