'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, MapPin, Wallet, Calendar, Plane, Search, X, GripVertical, Check } from 'lucide-react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import NavHeader from '@/components/NavHeader';
import TripCard from '@/components/TripCard';
import TripFormDialog from '@/components/TripFormDialog';
import { TripWithMemberCount } from '@/types/trip';
import { reorderTrips } from '@/app/actions/trip.actions';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface DashboardClientProps {
  trips: TripWithMemberCount[];
}

type FilterType = 'all' | 'upcoming' | 'past';

// Compact sortable row for sort mode
function SortableRow({
  trip,
  index,
}: {
  trip: TripWithMemberCount;
  index: number;
}) {
  const controls = useDragControls();
  const formatDate = (d: Date) =>
    format(new Date(d), 'd MMM', { locale: th });

  return (
    <Reorder.Item
      value={trip}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm select-none"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing touch-none p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex-shrink-0"
      >
        <GripVertical size={20} />
      </div>
      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{trip.name}</p>
        <p className="text-xs text-zinc-400">
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {trip._count.members} คน
        </p>
      </div>
    </Reorder.Item>
  );
}

export default function DashboardClient({ trips }: DashboardClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortMode, setSortMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const now = new Date();
  const [activeTrips, setActiveTrips] = useState(() =>
    trips.filter(t => new Date(t.endDate) >= now)
  );
  const pastTrips = useMemo(
    () => trips.filter(t => new Date(t.endDate) < new Date()),
    [trips]
  );
  const allTrips = useMemo(() => [...activeTrips, ...pastTrips], [activeTrips, pastTrips]);

  // Save reorder
  const handleSaveSort = useCallback(async () => {
    setIsSaving(true);
    await reorderTrips(activeTrips.map(t => t.id));
    setIsSaving(false);
    setSortMode(false);
  }, [activeTrips]);

  const filteredActive = useMemo(() => {
    if (!searchQuery) return activeTrips;
    return activeTrips.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeTrips, searchQuery]);

  const filteredPast = useMemo(() => {
    if (!searchQuery) return pastTrips;
    return pastTrips.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pastTrips, searchQuery]);

  const showActive = filter === 'all' || filter === 'upcoming';
  const showPast = filter === 'all' || filter === 'past';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <NavHeader
        center={
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาทริป..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X size={14} />
              </button>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

          {/* สร้างทริป button — top right of hero card ONLY */}
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="absolute top-5 right-6 z-10 flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all"
          >
            <Plus size={16} />
            สร้างทริป
          </button>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="space-y-3 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 border border-white/10">
                  <Plane size={12} className="-rotate-45" />
                  จัดการทริปอัจฉริยะ
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  วางแผนเที่ยว
                  <br />
                  หารค่าใช้จ่ายง่ายๆ
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  สร้างทริป เพิ่มกิจกรรม บันทึกค่าใช้จ่าย
                  <br className="hidden sm:block" />
                  แชร์หารเงินกับเพื่อนจบในที่เดียว
                </p>
              </div>

              <div className="flex gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{allTrips.length}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">ทริปทั้งหมด</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-400">{activeTrips.length}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">กำลังมาถึง</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-zinc-500">{pastTrips.length}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">เสร็จสิ้น</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        {allTrips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              {([['all', 'ทั้งหมด'], ['upcoming', 'กำลังมาถึง'], ['past', 'เสร็จสิ้น']] as [FilterType, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === val ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-sm text-zinc-400 ml-1">
              {searchQuery ? `"${searchQuery}" · ` : ''}{filteredActive.length + filteredPast.length} ทริป
            </span>
          </div>
        )}

        {/* Active Trips */}
        {showActive && activeTrips.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                ทริปของคุณ
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {activeTrips.length} ทริป
                </span>
                {!sortMode ? (
                  <button
                    onClick={() => setSortMode(true)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
                  >
                    <GripVertical size={12} />
                    จัดเรียง
                  </button>
                ) : (
                  <button
                    onClick={handleSaveSort}
                    disabled={isSaving}
                    className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Check size={12} />
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกลำดับ'}
                  </button>
                )}
              </div>
            </div>

            {/* Sort Mode: vertical list with drag handles */}
            {sortMode ? (
              <Reorder.Group
                axis="y"
                values={activeTrips}
                onReorder={setActiveTrips}
                className="flex flex-col gap-2"
              >
                {activeTrips.map((trip, i) => (
                  <SortableRow key={trip.id} trip={trip} index={i} />
                ))}
              </Reorder.Group>
            ) : (
              /* Normal: grid view */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActive.map((trip, idx) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <TripCard trip={trip} />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Past Trips */}
        {showPast && filteredPast.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5 mt-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Wallet size={18} className="text-zinc-400" />
                ประวัติการเดินทาง
              </h2>
              <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                {filteredPast.length} ทริป
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
              {filteredPast.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* No search results */}
        {searchQuery && filteredActive.length === 0 && filteredPast.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">ไม่พบทริปที่ชื่อ &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery('')} className="text-blue-500 text-sm mt-2 hover:underline">
              ล้างการค้นหา
            </button>
          </div>
        )}

        {/* Empty State */}
        {allTrips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/50">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-4">
              <MapPin size={28} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              เริ่มต้นการเดินทางครั้งใหม่
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
              สร้างทริปแรกของคุณเพื่อเริ่มวางแผนและจดบันทึกค่าใช้จ่าย
            </p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              สร้างทริปแรก
            </button>
          </div>
        )}
      </main>

      <TripFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
