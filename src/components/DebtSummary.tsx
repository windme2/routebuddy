'use client';

import { useMemo, useState } from 'react';
import { Member, Expense, ExpenseParticipant, Settlement } from '@/generated/prisma/client';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Wallet, ArrowRight, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { confirmSettlement, deleteSettlement } from '@/app/actions/settlement.actions';
import { useToast } from '@/components/ui/Toast';
import SettlementSlipDialog from '@/components/SettlementSlipDialog';

interface DebtSummaryProps {
  tripId: string;
  expenses: (Expense & {
    payer: Member;
    participants: (ExpenseParticipant & { member: Member })[];
  })[];
  members: Member[];
  settlements: (Settlement & {
    debtor: Member;
    creditor: Member;
  })[];
}

interface Transfer {
  from: Member;
  to: Member;
  amount: number;
}

export default function DebtSummary({ tripId, expenses, members, settlements }: DebtSummaryProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [slipDialog, setSlipDialog] = useState<Transfer | null>(null);
  const [viewSlip, setViewSlip] = useState<string | null>(null);
  const { success, error } = useToast();

  const transfers = useMemo(() => {
    const balances: Record<string, number> = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(expense => {
      balances[expense.payerId] += (expense.thbAmount || expense.amount);
      expense.participants.forEach(p => {
        balances[p.memberId] -= p.share;
      });
    });

    // Add CONFIRMED settlements
    if (settlements) {
      settlements.filter(s => s.status === 'CONFIRMED').forEach(s => {
        if (balances[s.debtorId] !== undefined) balances[s.debtorId] += s.amount;
        if (balances[s.creditorId] !== undefined) balances[s.creditorId] -= s.amount;
      });
    }

    const debtors: { memberId: string; amount: number }[] = [];
    const creditors: { memberId: string; amount: number }[] = [];

    Object.entries(balances).forEach(([memberId, amount]) => {
      if (amount < -1) debtors.push({ memberId, amount });
      if (amount > 1) creditors.push({ memberId, amount });
    });

    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const result: Transfer[] = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      const fromMember = members.find(m => m.id === debtor.memberId);
      const toMember = members.find(m => m.id === creditor.memberId);

      if (fromMember && toMember) {
        result.push({ from: fromMember, to: toMember, amount: Math.round(amount) });
      }

      debtor.amount += amount;
      creditor.amount -= amount;
      if (Math.abs(debtor.amount) < 1) i++;
      if (creditor.amount < 1) j++;
    }

    return result;
  }, [expenses, members, settlements]);

  const handleConfirmSettlement = async (settlementId: string) => {
    setIsLoading(`confirm-${settlementId}`);
    const result = await confirmSettlement(settlementId, tripId);
    setIsLoading(null);
    if (result.success) {
      success('ยืนยันรับเงินสำเร็จ');
    } else {
      error(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    setIsLoading(`delete-${settlementId}`);
    const result = await deleteSettlement(settlementId, tripId);
    setIsLoading(null);
    if (result.success) {
      success('ยกเลิกรายการแล้ว');
    } else {
      error(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  if (transfers.length === 0) {
    return (
      <Card className="bg-zinc-50 dark:bg-zinc-900 border-dashed h-full">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center h-full">
          <Wallet size={32} className="text-zinc-300 dark:text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">ยังไม่มีรายการที่ต้องเคลียร์ หรือเคลียร์ครบแล้ว</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-zinc-500" />
            สรุปค่าใช้จ่าย
          </h3>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {transfers.map((t, idx) => {
            const pendingSettlement = settlements?.find(
              s => s.status === 'PENDING' &&
                s.debtorId === t.from.id &&
                s.creditorId === t.to.id &&
                Math.abs(s.amount - t.amount) < 100
            );

            return (
              <div key={idx} className="flex flex-col gap-3 p-3 lg:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {t.from.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{t.from.name}</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 mx-1 shrink-0" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {t.to.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{t.to.name}</span>
                    </div>
                  </div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-lg whitespace-nowrap shrink-0">
                    ฿{(t.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {pendingSettlement ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Show slip if available */}
                    {pendingSettlement.slipUrl && (
                      <button
                        onClick={() => setViewSlip(pendingSettlement.slipUrl!)}
                        className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        <Eye size={12} />
                        ดูสลิป
                      </button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                      isLoading={isLoading === `confirm-${pendingSettlement.id}`}
                      onClick={() => handleConfirmSettlement(pendingSettlement.id)}
                    >
                      <CheckCircle2 size={14} className="mr-1.5" />
                      ยืนยันรับเงิน
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                      isLoading={isLoading === `delete-${pendingSettlement.id}`}
                      onClick={() => handleDeleteSettlement(pendingSettlement.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setSlipDialog(t)}
                  >
                    แจ้งโอนเงิน
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Settlement Slip Dialog */}
      {slipDialog && (
        <SettlementSlipDialog
          isOpen={!!slipDialog}
          onClose={() => setSlipDialog(null)}
          tripId={tripId}
          debtorId={slipDialog.from.id}
          creditorId={slipDialog.to.id}
          amount={slipDialog.amount}
          debtorName={slipDialog.from.name}
          creditorName={slipDialog.to.name}
        />
      )}

      {/* Slip Viewer Modal */}
      {viewSlip && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewSlip(null)}
        >
          <div className="max-w-lg w-full max-h-[90vh] overflow-hidden rounded-2xl" onClick={e => e.stopPropagation()}>
            <img src={viewSlip} alt="Slip" className="w-full h-auto max-h-[90vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
