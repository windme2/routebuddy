'use client';

import { useState, useEffect } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Member } from '@/generated/prisma/client';
import { addMember, updateMember, getAllUniqueMembers } from '@/app/actions/member.actions';
import { Crown, User } from 'lucide-react';

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  memberToEdit?: Member;
  onSuccess?: () => void;
}

export default function MemberDialog({ 
  isOpen, 
  onClose, 
  tripId, 
  memberToEdit,
  onSuccess 
}: MemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'LEADER' | 'MEMBER'>('MEMBER');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (memberToEdit) {
          setName(memberToEdit.name);
          setRole((memberToEdit.role as 'LEADER' | 'MEMBER') || 'MEMBER');
        } else {
          setName('');
          setRole('MEMBER');
          // Fetch suggestions for new member
          getAllUniqueMembers().then(setSuggestions);
        }
        setError('');
      }, 0);
    }
  }, [isOpen, memberToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อสมาชิก');
      return;
    }

    setIsLoading(true);
    let result;

    if (memberToEdit) {
      result = await updateMember(memberToEdit.id, tripId, { name: name.trim(), role });
    } else {
      result = await addMember(tripId, name.trim(), role);
    }

    setIsLoading(false);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Name Input with Suggestions */}
        <div className="space-y-2">
          <Input
            label="ชื่อสมาชิก"
            placeholder="ระบุชื่อ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          
          {!memberToEdit && suggestions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">เลือกจากประวัติ:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions
                  .filter(s => !name || s.toLowerCase().includes(name.toLowerCase()))
                  .slice(0, 8) // Limit to 8 suggestions
                  .map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setName(suggestion)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            บทบาท
          </label>
          <div className="grid grid-cols-2 gap-3">
             <button
              type="button"
              onClick={() => setRole('LEADER')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                role === 'LEADER'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
             >
               <Crown size={18} />
               <span className="font-medium">หัวหน้าทริป</span>
             </button>
             <button
              type="button"
              onClick={() => setRole('MEMBER')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                role === 'MEMBER'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
             >
               <User size={18} />
               <span className="font-medium">สมาชิก</span>
             </button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            * หัวหน้าทริปจะมีสัญลักษณ์มงกุฎแสดงหน้ารายชื่อ
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
            {memberToEdit ? 'บันทึกแก้ไข' : 'เพิ่มสมาชิก'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
