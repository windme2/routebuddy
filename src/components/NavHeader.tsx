'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

interface NavHeaderProps {
  /** Optional center slot — e.g. search bar on dashboard */
  center?: React.ReactNode;
}

export default function NavHeader({ center }: NavHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-sm print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: logo */ }
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-zinc-100">
              <img src="/logo.png" alt="RouteBuddy" width={32} height={32} className="object-contain p-0.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white hidden sm:block">
              Route<span className="text-blue-500">Buddy</span>
            </span>
          </Link>
        </div>

        {/* Center slot */}
        {center && <div className="flex-1 max-w-xs">{center}</div>}

        {/* Right: profile and logout */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/account"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all shadow-sm"
            title="ตั้งค่าบัญชี"
          >
            <User size={16} />
          </a>
          <button
            onClick={async () => { await signOut({ callbackUrl: '/login' }); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all shadow-sm"
            title="ออกจากระบบ"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
