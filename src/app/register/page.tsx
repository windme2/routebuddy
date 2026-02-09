'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/actions/auth.actions';
import { User, Lock, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    const result = await register({ name, username, password });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/login?registered=1');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/10 overflow-hidden border border-blue-50">
            <img src="/logo.png" alt="RouteBuddy Logo" width={56} height={56} className="object-contain p-1" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Route<span className="text-blue-500">Buddy</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">ชื่อ</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">ชื่อผู้ใช้งาน</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                minLength={6}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">ยืนยันรหัสผ่าน</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                minLength={6}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-4">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
