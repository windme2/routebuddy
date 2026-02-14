'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteTrip } from '@/app/actions/trip.actions';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Calendar, Users, Wallet,
  MapPin, Image as ImageIcon, Printer, Download, Map, ArrowLeft
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import NavHeader from '@/components/NavHeader';
import ItineraryView from '@/components/ItineraryView';
import ExpenseView from '@/components/ExpenseView';
import MemberView from '@/components/MemberView';
import TripFormDialog from '@/components/TripFormDialog';
import GalleryView from '@/components/GalleryView';
import MapView from '@/components/MapView';
import { useToast } from '@/components/ui/Toast';
import type { Trip, Member, Activity, Expense, ExpenseParticipant, TripImage, Settlement } from '@/generated/prisma/client';

interface TripWithRelations extends Trip {
  members: Member[];
  activities: Activity[];
  expenses: (Expense & {
    payer: Member;
    participants: (ExpenseParticipant & { member: Member })[];
  })[];
  images: TripImage[];
  settlements: (Settlement & {
    debtor: Member;
    creditor: Member;
  })[];
  _count: {
    members: number;
    activities: number;
    expenses: number;
  };
}

interface TripDetailClientProps {
  trip: TripWithRelations;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function TripDetailClient({ trip, status }: TripDetailClientProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses' | 'members' | 'gallery' | 'map'>('itinerary');

  const statusConfig = {
    upcoming: { label: 'กำลังจะไป', variant: 'info' as const },
    ongoing: { label: 'กำลังเที่ยว', variant: 'success' as const },
    completed: { label: 'เสร็จสิ้น', variant: 'default' as const },
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'EEE d MMM yyyy', { locale: th });
  };

  const handleDeleteTrip = async () => {
    if (!confirm('คุณแน่ใจว่าต้องการลบทริปนี้? การกระทำนี้ไม่สามารถกู้คืนได้')) return;
    setIsDeleting(true);
    const result = await deleteTrip(trip.id);
    if (result.success) {
      success('ลบทริปสำเร็จ');
      router.push('/');
    } else {
      toastError(result.error || 'ไม่สามารถลบทริปได้');
      setIsDeleting(false);
    }
  };

  const totalExpense = trip.expenses.reduce((sum, exp) => sum + (exp.thbAmount || exp.amount), 0);
  const budget = trip.budget;
  const percentUsed = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;
  const isOverBudget = budget > 0 && totalExpense > budget;

  const tabs = [
    { id: 'itinerary' as const, label: 'แผนการเดินทาง', icon: MapPin },
    { id: 'expenses' as const, label: 'ค่าใช้จ่าย', icon: Wallet },
    { id: 'members' as const, label: 'สมาชิก', icon: Users },
    { id: 'gallery' as const, label: 'รูปภาพ', icon: ImageIcon },
    { id: 'map' as const, label: 'แผนที่', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavHeader />

    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={16} />
          กลับหน้าหลัก
        </Link>
      </div>

      {/* Trip Header */}
      <Card variant="gradient" className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {trip.name}
                </h1>
                <Badge variant={statusConfig[status].variant}>
                  {statusConfig[status].label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-zinc-400" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-zinc-400" />
                  <span>{trip._count.members} คน</span>
                </div>
              </div>

              {trip.description && (
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                  {trip.description}
                </p>
              )}
            </div>
            <div className="w-full sm:w-auto sm:min-w-[280px] bg-white/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-white/20 dark:border-zinc-700/30">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">งบประมาณ</span>
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  ฿{(trip.budget / 100).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>

              {budget > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">ใช้ไป ฿{(totalExpense / 100).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    <span className={`${isOverBudget ? 'text-red-500 font-bold' : 'text-zinc-500 dark:text-zinc-400 font-medium'}`}>
                      {isOverBudget ? 'เกินงบประมาณ!' : `เหลือ ฿${((budget - totalExpense) / 100).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner flex">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 print:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
                const a = document.createElement('a');
                a.setAttribute("href", dataStr);
                a.setAttribute("download", `routebuddy_${trip.name.replace(/\s+/g, '_')}_export.json`);
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            >
              <Download size={16} className="mr-2" />
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer size={16} className="mr-2" />
              Print / PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              แก้ไขทริป
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteTrip}
            >
              ลบทริป
            </Button>
          </div>
        </CardContent>
      </Card>

      <TripFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        tripToEdit={trip}
      />

      {/* Main Content (Tabs) */}
      <div className="space-y-6">
        {/* Tabs Header */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-x-auto print:hidden no-scrollbar">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap min-w-[100px] ${
                activeTab === id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'itinerary' ? (
          <Card className="min-h-[500px]">
            <CardContent className="pt-6">
              <ItineraryView
                tripId={trip.id}
                startDate={trip.startDate}
                endDate={trip.endDate}
                activities={trip.activities}
                timezone={trip.timezone}
              />
            </CardContent>
          </Card>
        ) : activeTab === 'expenses' ? (
          <ExpenseView
            tripId={trip.id}
            expenses={trip.expenses}
            members={trip.members}
            activities={trip.activities}
            timezone={trip.timezone}
            settlements={trip.settlements}
          />
        ) : activeTab === 'members' ? (
          <MemberView
            tripId={trip.id}
            members={trip.members}
          />
        ) : activeTab === 'gallery' ? (
          <Card className="min-h-[500px]">
            <CardContent className="pt-6">
              <GalleryView images={trip.images || []} tripId={trip.id} />
            </CardContent>
          </Card>
        ) : (
          <Card className="min-h-[500px]">
            <CardContent className="pt-6">
              <MapView activities={trip.activities} tripName={trip.name} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print-only: show all sections */}
      <div className="hidden print:block space-y-8 mt-8">
        <div>
          <h2 className="text-lg font-bold mb-4 border-b pb-2">แผนการเดินทาง</h2>
          <ItineraryView
            tripId={trip.id}
            startDate={trip.startDate}
            endDate={trip.endDate}
            activities={trip.activities}
            timezone={trip.timezone}
          />
        </div>
      </div>
    </main>
    </div>
  );
}
