import { Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950 mt-auto print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md shadow-black/5 overflow-hidden border border-zinc-100">
                <img src="/logo.png" alt="RouteBuddy" width={32} height={32} className="object-contain p-0.5" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                Route<span className="text-blue-500">Buddy</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              จัดการทริปท่องเที่ยวที่ช่วยให้การวางแผน กิจกรรม และการแชร์ค่าใช้จ่ายกับเพื่อนเป็นเรื่องง่ายแบบสวยงามและจบในที่เดียว
            </p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            &copy; {new Date().getFullYear()} RouteBuddy. All rights reserved.
          </p>
          <p className="text-zinc-500 text-sm mt-4 md:mt-0 flex items-center justify-center md:justify-end gap-1">
          </p>
        </div>
      </div>
    </footer>
  );
}
