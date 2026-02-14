'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { updateProfile, changePassword } from '@/app/actions/auth.actions';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

interface AccountClientProps {
  user: {
    id: string;
    name: string;
    username: string;
    createdAt: Date;
  };
}

export default function AccountClient({ user }: AccountClientProps) {
  const { success, error: toastError } = useToast();

  // Profile state
  const [name, setName] = useState(user.name);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) { toastError('กรุณาระบุชื่อ'); return; }
    setIsSavingProfile(true);
    const result = await updateProfile({ name });
    setIsSavingProfile(false);
    if (result.success) {
      success('บันทึกข้อมูลสำเร็จ');
    } else {
      toastError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastError('กรุณากรอกข้อมูลให้ครบ'); return;
    }
    if (newPassword !== confirmPassword) {
      toastError('รหัสผ่านใหม่ไม่ตรงกัน'); return;
    }
    if (newPassword.length < 6) {
      toastError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return;
    }
    setIsSavingPassword(true);
    const result = await changePassword({ currentPassword, newPassword });
    setIsSavingPassword(false);
    if (result.success) {
      success('เปลี่ยนรหัสผ่านสำเร็จ');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toastError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Standard Header */}
      <NavHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back Link Moved Down */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2">
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">กลับหน้าหลัก</span>
        </Link>
        {/* Profile Info */}
        <Card>
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <User size={18} className="text-zinc-500" />
              ข้อมูลส่วนตัว
            </h2>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                <p className="text-sm text-zinc-500">@{user.username}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  สมาชิกตั้งแต่ {format(new Date(user.createdAt), 'd MMM yyyy', { locale: th })}
                </p>
              </div>
            </div>

            <Input
              label="ชื่อที่แสดง"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
            />
            <div className="text-sm text-zinc-500">
              <span className="font-medium">Username:</span> @{user.username}
              <span className="ml-2 text-xs text-zinc-400">(ไม่สามารถเปลี่ยน username ได้)</span>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" onClick={handleSaveProfile} isLoading={isSavingProfile}>
                <Save size={16} className="mr-2" />
                บันทึก
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Lock size={18} className="text-zinc-500" />
              เปลี่ยนรหัสผ่าน
            </h2>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="relative">
              <Input
                label="รหัสผ่านปัจจุบัน"
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="รหัสผ่านใหม่"
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="ยืนยันรหัสผ่านใหม่"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex justify-end">
              <Button variant="primary" onClick={handleChangePassword} isLoading={isSavingPassword}>
                <Lock size={16} className="mr-2" />
                เปลี่ยนรหัสผ่าน
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
