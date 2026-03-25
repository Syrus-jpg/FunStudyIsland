import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import logoImg from '../assets/images/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // 模拟登陆逻辑，包含测试账号
        setTimeout(() => {
            if (email === '666@163.com' && password === '666666') {
                localStorage.setItem('user_role', 'student');
                localStorage.setItem('user_email', email);
                navigate('/');
            } else if ((email === 'admin@163.com' || email === 'partner@163.com') && password === 'admin123') {
                // 预留的管理员/编辑账号
                localStorage.setItem('user_role', 'editor');
                localStorage.setItem('user_email', email);
                navigate('/');
            } else {
                setError('邮箱或密码错误，请尝试测试账号 666@163.com');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#edeeef] p-8"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src={logoImg} alt="Logo" className="w-24 h-24 object-contain drop-shadow-md" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#37352f]">欢迎来到趣学岛</h1>
                    <p className="text-sm text-gray-500 mt-2 text-center uppercase tracking-widest">捣蛋计划 1.0 登陆</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">邮箱地址</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#f7f7f5] border-transparent focus:border-brand-primary focus:bg-white rounded-xl text-sm transition-all focus:ring-0"
                                placeholder="666@163.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">密码</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#f7f7f5] border-transparent focus:border-brand-primary focus:bg-white rounded-xl text-sm transition-all focus:ring-0"
                                placeholder="••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 font-medium text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#37352f] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '登 陆'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#edeeef] text-center">
                    <p className="text-xs text-gray-400 italic">
                        首次登陆将自动通过验证码注册
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
