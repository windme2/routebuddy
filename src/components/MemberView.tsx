'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Users, Edit, Crown } from 'lucide-react';
import { Member } from '@/generated/prisma/client';
import { removeMember } from '@/app/actions/member.actions';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import MemberDialog from '@/components/MemberDialog';
import { useToast } from '@/components/ui/Toast';

interface MemberViewProps {
  tripId: string;
  members: Member[];
  currentUserId?: string;
}

export default function MemberView({ tripId, members }: MemberViewProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | undefined>(undefined);

  // Sort members: Leader first, then others
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'LEADER' && b.role !== 'LEADER') return -1;
    if (a.role !== 'LEADER' && b.role === 'LEADER') return 1;
    return a.name.localeCompare(b.name);
  });

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`ต้องการลบ ${name} ออกจากทริปนี้?`)) return;
    const result = await removeMember(memberId, tripId);
    if (result.success) {
      success(`ลบ ${name} สำเร็จ`);
      router.refresh();
    } else {
      error('ไม่สามารถลบสมาชิกได้');
    }
  };

  const openAddDialog = () => {
    setMemberToEdit(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: Member) => {
    setMemberToEdit(member);
    setIsDialogOpen(true);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-sky-400 to-blue-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-red-500',
      'from-pink-400 to-rose-500',
      'from-amber-400 to-orange-500',
      'from-violet-400 to-sky-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const isLeader = (role: string) => role === 'LEADER';
  
  return (
    <>
      <Card className="min-h-[500px]">
        {/* Header ... */}
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users size={20} className="text-zinc-500" />
                สมาชิกในทริป
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                จัดการสมาชิกเพื่อหารค่าใช้จ่ายและมอบหมายกิจกรรม
              </p>
            </div>
            
            <Button 
              onClick={openAddDialog}
              variant="secondary" 
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              เพิ่มสมาชิก
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedMembers.map((member) => (
              <div 
                key={member.id}
                className={`group relative flex flex-col items-center p-6 rounded-2xl border bg-white dark:bg-zinc-900/50 hover:shadow-sm transition-all text-center ${
                  isLeader(member.role) 
                    ? 'border-yellow-200 dark:border-yellow-900/30 ring-1 ring-yellow-100 dark:ring-yellow-900/20' 
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center text-white text-2xl font-bold shadow-sm mb-3`}>
                  {member.name.charAt(0).toUpperCase()}
                  {isLeader(member.role) && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                      <Crown size={12} fill="currentColor" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate w-full px-2 flex items-center justify-center gap-1">
                  {member.name}
                </h3>
                <p className={`text-xs mt-1 ${isLeader(member.role) ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {isLeader(member.role) ? 'หัวหน้าทริป' : 'สมาชิก'}
                </p>

                {/* Actions (Static Position to avoid overlap) */}
                <div className="flex gap-2 mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditDialog(member); }}
                    className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id, member.name); }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedMembers.length === 0 && (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
              <Users size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">ยังไม่มีสมาชิกในทริปนี้</p>
              <button onClick={openAddDialog} className="text-xs mt-1 text-violet-500 hover:underline">
                เพิ่มสมาชิกใหม่
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        tripId={tripId}
        memberToEdit={memberToEdit}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
