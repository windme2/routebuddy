'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Member, Expense, ExpenseParticipant } from '@/generated/prisma/client';
import { Utensils, Car, Bed, MapPin, ShoppingBag, HelpCircle, CalendarDays } from 'lucide-react';

interface ExpenseListProps {
  expenses: (Expense & {
    payer: Member;
    participants: (ExpenseParticipant & { member: Member })[];
  })[];
  tripId: string;
  onEdit: (expense: Expense & {
    payer: Member;
    participants: (ExpenseParticipant & { member: Member })[];
  }) => void;
}

const CATEGORIES: Record<string, { icon: React.ElementType, color: string }> = {
  food: { icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  transport: { icon: Car, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  accommodation: { icon: Bed, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  attraction: { icon: MapPin, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  shopping: { icon: ShoppingBag, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  other: { icon: HelpCircle, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20' },
};

function ExpenseItem({ 
  expense, 
  onEdit 
}: { 
  expense: Expense & { payer: Member, participants: (ExpenseParticipant & { member: Member })[] }, 
  onEdit: (expense: Expense & { payer: Member, participants: (ExpenseParticipant & { member: Member })[] }) => void 
}) {
  const catConfig = CATEGORIES[expense.category] || CATEGORIES.other;
  const Icon = catConfig.icon;

  return (
    <div 
      onClick={() => onEdit(expense)}
      className="group relative flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${catConfig.color}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 break-words mb-1">
              {expense.description}
            </h4>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span>จ่ายโดย <span className="font-medium text-zinc-700 dark:text-zinc-300">{expense.payer.name}</span></span>
            </div>
            
            {/* Participants */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {expense.participants.map((p) => (
                 <span key={p.id} className="text-[10px] px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                   {p.member.name}
                 </span>
              ))}
            </div>
          </div>

          {/* Price at Top Right (Original Position) */}
          <div className="flex flex-col items-end shrink-0">
             <span className="block font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                {expense.currency === 'THB' ? '฿' : expense.currency + ' '}
                {(expense.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </span>
             {expense.currency !== 'THB' && expense.thbAmount > 0 && (
               <span className="text-xs text-zinc-500 dark:text-zinc-400">
                 ≈ ฿{(expense.thbAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseList({ expenses, onEdit }: ExpenseListProps) {
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof expenses> = {};
    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(expense => {
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });
    
    return groups;
  }, [expenses]);

  const sortedDates = Object.keys(groupedExpenses).sort();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400 dark:text-zinc-600 text-sm">
        ยังไม่มีรายการค่าใช้จ่าย
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((dateKey) => {
        const dateExpenses = groupedExpenses[dateKey];
        const dateObj = new Date(dateKey);
        
        return (
           <div key={dateKey} className="space-y-3">
             {/* Sticky Date Header */}
             <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm py-2 -mx-2 px-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <CalendarDays size={16} className="text-zinc-500" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  {format(dateObj, 'EEEE d MMMM yyyy', { locale: th })}
                </h3>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {dateExpenses.length} รายการ
                </span>
             </div>

             <div className="space-y-3">
               {dateExpenses.map((expense) => (
                 <ExpenseItem 
                   key={expense.id} 
                   expense={expense} 
                   onEdit={onEdit} 
                 />
               ))}
             </div>
           </div>
        );
      })}
    </div>
  );
}
