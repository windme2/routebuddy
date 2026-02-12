'use client';

import { useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import ExpenseList from '@/components/ExpenseList';
import ExpenseChart from '@/components/ExpenseChart';
import DebtSummary from '@/components/DebtSummary';
import ExpenseDialog from '@/components/ExpenseDialog';
import { Member, Activity, Expense, ExpenseParticipant, Settlement } from '@/generated/prisma/client';

interface ExpenseViewProps {
  tripId: string;
  expenses: (Expense & {
    payer: Member;
    participants: (ExpenseParticipant & { member: Member })[];
  })[];
  members: Member[];
  activities: Activity[];
  timezone: string;
  settlements: (Settlement & {
    debtor: Member;
    creditor: Member;
  })[];
}

export default function ExpenseView({ 
  tripId, 
  expenses, 
  members, 
  activities,
  timezone,
  settlements
}: ExpenseViewProps) {
  /* const [selectedDayIndex, setSelectedDayIndex] = useState(-1); // Removed as per request */
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-lg">
        </h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => {
            setExpenseToEdit(undefined);
            setShowExpenseDialog(true);
          }}
        >
          <Plus size={16} />
          จดบันทึก
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart */}
          <Card className="h-full">
          <CardHeader className="pb-2 border-b border-zinc-50 dark:border-zinc-800/50">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">สัดส่วนค่าใช้จ่าย</h2>
          </CardHeader>
          <CardContent className="pt-6">
            {expenses.length > 0 ? (
              <ExpenseChart expenses={expenses} />
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                <Wallet size={48} className="mb-2 opacity-20" />
                <p className="text-sm">ยังไม่มีข้อมูล</p>
              </div>
            )}
          </CardContent>
          </Card>

        {/* Debt Summary */}
        <div>
          <DebtSummary expenses={expenses} members={members} settlements={settlements} tripId={tripId} />
        </div>
      </div>

      {/* Expense List */}
      <div className="pt-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4 px-1">
          รายการทั้งหมด
        </h3>
        <Card className="print:shadow-none print:border-none">
          <CardContent className="pt-6">
            <ExpenseList 
              expenses={expenses} 
              tripId={tripId} 
              onEdit={(expense) => {
                setExpenseToEdit(expense);
                setShowExpenseDialog(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <ExpenseDialog 
        isOpen={showExpenseDialog}
        onClose={() => setShowExpenseDialog(false)}
        tripId={tripId}
        members={members}
        activities={activities}
        expenseToEdit={expenseToEdit}
        timezone={timezone}
      />
    </div>
  );
}
