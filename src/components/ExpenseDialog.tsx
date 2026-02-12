import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expense.actions';
import { ExpenseFormData } from '@/types/forms';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Member, Activity } from '@/generated/prisma/client';
import { useToast } from '@/components/ui/Toast';
import { 
  Utensils, Car, Bed, MapPin, ShoppingBag, 
  HelpCircle, Check, Trash2
} from 'lucide-react';

interface ExpenseParticipantData {
  memberId: string;
  share: number;
}

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  members: Member[];
  activities: Activity[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expenseToEdit?: any;
  defaultDate?: Date;
  timezone: string;
}

const CATEGORIES = [
  { id: 'food', label: 'อาหาร', icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  { id: 'transport', label: 'เดินทาง', icon: Car, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'accommodation', label: 'ที่พัก', icon: Bed, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'attraction', label: 'ท่องเที่ยว', icon: MapPin, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'shopping', label: 'ช้อปปิ้ง', icon: ShoppingBag, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  { id: 'other', label: 'อื่นๆ', icon: HelpCircle, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20' },
];

const CURRENCIES = ['THB', 'JPY', 'KRW', 'TWD', 'SGD', 'VND', 'USD', 'EUR', 'GBP'];

export default function ExpenseDialog({ 
  isOpen, 
  onClose, 
  tripId, 
  members,
  activities,
  expenseToEdit,
  defaultDate,
  timezone
}: ExpenseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: toastError } = useToast();

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('THB');
  const [thbAmount, setThbAmount] = useState('');
  
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState('');
  const [activityId, setActivityId] = useState('');
  
  const [payerId, setPayerId] = useState('');
  const [involvedMemberIds, setInvolvedMemberIds] = useState<string[]>([]);
  
  // Split Logic State
  const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT'>('EQUAL');
  const [exactShares, setExactShares] = useState<Record<string, string>>({});

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (expenseToEdit) {
          setDescription(expenseToEdit.description);
          setAmount((expenseToEdit.amount / 100).toString());
          setCurrency(expenseToEdit.currency || 'THB');
          setThbAmount(expenseToEdit.thbAmount ? (expenseToEdit.thbAmount / 100).toString() : (expenseToEdit.amount / 100).toString());
          setCategory(expenseToEdit.category);
          setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
          setActivityId(expenseToEdit.activityId || '');
          setPayerId(expenseToEdit.payerId);
          
          const participants = expenseToEdit.participants || [];
          setInvolvedMemberIds(participants.map((p: ExpenseParticipantData) => p.memberId));

          // Attempt to determine if it was EQUAL or EXACT based on shares
          if (participants.length > 0) {
            const uniqueShares = new Set(participants.map((p: ExpenseParticipantData) => p.share));
            if (uniqueShares.size > 1) {
              setSplitType('EXACT');
              // Reconstruct local shares from THB shares
              const totalThb = expenseToEdit.thbAmount || expenseToEdit.amount;
              const shares: Record<string, string> = {};
              participants.forEach((p: ExpenseParticipantData) => {
                 // p.share is in THB satangs
                 const proportion = p.share / totalThb;
                 const localAmount = proportion * (expenseToEdit.amount / 100);
                 shares[p.memberId] = localAmount.toFixed(2);
              });
              setExactShares(shares);
            } else {
              setSplitType('EQUAL');
              setExactShares({});
            }
          }
        } else {
          setDescription('');
          setAmount('');
          setCurrency('THB');
          setThbAmount('');
          setCategory('food');
          setDate(defaultDate ? new Date(defaultDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
          setActivityId('');
          if (members.length > 0) {
            setPayerId(prev => prev || members[0].id);
            setInvolvedMemberIds(prev => prev.length === 0 ? members.map(m => m.id) : prev);
          }
          setSplitType('EQUAL');
          setExactShares({});
        }
        setErrors({});
      }, 0);
    }
  }, [isOpen, expenseToEdit, members, defaultDate]);

  // Sync basic thbAmount when amount changes and currency is THB
  useEffect(() => {
    if (currency === 'THB') {
      setTimeout(() => setThbAmount(amount), 0);
    }
  }, [amount, currency]);

  const toggleInvolvedMember = (memberId: string) => {
    setInvolvedMemberIds(prev => {
      const newIds = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId];
        
      if (!newIds.includes(memberId)) {
        // Remove from exact shares if deselected
        const nextExact = { ...exactShares };
        delete nextExact[memberId];
        setExactShares(nextExact);
      }
      return newIds;
    });
  };

  const handleSelectAll = () => {
    if (involvedMemberIds.length === members.length) {
      setInvolvedMemberIds([]);
      setExactShares({});
    } else {
      setInvolvedMemberIds(members.map(m => m.id));
    }
  };

  const handleExactShareChange = (memberId: string, val: string) => {
    setExactShares(prev => ({
      ...prev,
      [memberId]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const parsedAmount = parseFloat(amount);
    const parsedThbAmount = parseFloat(thbAmount);

    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'กรุณาระบุรายการ';
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) newErrors.amount = 'กรุณาระบุจำนวนเงิน';
    if (!thbAmount || isNaN(parsedThbAmount) || parsedThbAmount <= 0) newErrors.thbAmount = 'กรุณาระบุยอดเงินเทียบเท่าบาท';
    if (!date) newErrors.date = 'กรุณาระบุวันที่';
    if (!payerId) newErrors.payerId = 'กรุณาระบุผู้จ่าย';
    if (involvedMemberIds.length === 0) newErrors.involvedMemberIds = 'ต้องมีผู้รับผิดชอบอย่างน้อย 1 คน';

    if (splitType === 'EXACT') {
      let sum = 0;
      for (const id of involvedMemberIds) {
        sum += parseFloat(exactShares[id] || '0');
      }
      if (Math.abs(sum - parsedAmount) > 0.01) {
        newErrors.split = `ยอดรวมที่ระบุ (${sum.toFixed(2)}) ไม่ตรงกับยอดเต็ม (${parsedAmount})`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const payload: ExpenseFormData = {
      description: description.trim(),
      amount: parsedAmount,
      currency,
      thbAmount: parsedThbAmount,
      category,
      date: new Date(`${date}T12:00:00Z`).toISOString(), // generic midday UTC fallback for simple date picking
      payerId,
      involvedMemberIds,
      splitType,
      exactShares: splitType === 'EXACT' 
        ? Object.fromEntries(Object.entries(exactShares).map(([k,v]) => [k, parseFloat(v) || 0]))
        : undefined,
      tripId,
      activityId: activityId || undefined,
    };

    let result;
    if (expenseToEdit) {
      result = await updateExpense(expenseToEdit.id, payload);
    } else {
      result = await createExpense(payload);
    }

    setIsLoading(false);

    if (result.success) {
      success(expenseToEdit ? 'แก้ไขค่าใช้จ่ายสำเร็จ' : 'บันทึกค่าใช้จ่ายสำเร็จ');
      onClose();
    } else {
      toastError(result.error || 'เกิดข้อผิดพลาด');
      setErrors({ form: result.error || 'เกิดข้อผิดพลาด' });
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={expenseToEdit ? "แก้ไขค่าใช้จ่าย" : "บันทึกค่าใช้จ่าย"} 
      size="4xl"
    > 
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-y-auto">
        {errors.form && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {/* Left Column: Details */}
          <div className="space-y-4">
            {/* Linked Activity */}
            <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                กิจกรรมที่เกี่ยวข้อง (ไม่บังคับ)
              </label>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none focus:border-zinc-500 cursor-pointer"
              >
                <option value="">ไม่มี</option>
                {activities
                  .filter(a => {
                    if (!date) return true;
                    const activityDate = formatInTimeZone(new Date(a.date), timezone, 'yyyy-MM-dd');
                    return activityDate === date;
                  })
                  .map((activity) => (
                  <option key={activity.id} value={activity.id}>
                     {formatInTimeZone(new Date(activity.startTime), timezone, 'HH:mm')} - {activity.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <Input
                label="วันที่จ่าย"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
            />

            <Input
              label="รายการ"
              placeholder="เช่น ค่าอาหาร, ค่าตั๋วรถไฟ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
            />

            {/* Amount and Currency */}
            <div className="grid grid-cols-[1fr_100px] gap-2 items-end">
              <Input
                label="จำนวนเงิน"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={errors.amount}
              />
              <div className="mb-1">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none focus:border-zinc-500 cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* THB Amount (if not THB) */}
            {currency !== 'THB' && (
              <div className="bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Input
                  label="ยอดเงินเทียบเท่าบาท (THB Equivalent)"
                  type="number"
                  step="0.01"
                  placeholder="เงินบาทที่ตัดบัตรหรือคำนวณจากเรท"
                  value={thbAmount}
                  onChange={(e) => setThbAmount(e.target.value)}
                  error={errors.thbAmount}
                />
                <p className="text-xs text-zinc-500 mt-2">
                  ระบบจะใช้ยอดเงินบาทนี้ในการคำนวณหนี้เพื่อความแม่นยำ
                </p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                หมวดหมู่
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        isSelected 
                          ? `${cat.color} border-current ring-1 ring-current` 
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: People */}
          <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            {/* Payer */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                🟢 ใครเป็นคนจ่ายเงิน? (คนสำรองจ่าย)
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPayerId(member.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      payerId === member.id
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm' 
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
              {errors.payerId && <p className="mt-1 text-sm text-red-500">{errors.payerId}</p>}
            </div>

            {/* Split Among */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex-1">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  🔴 หารกับใครบ้าง?
                </label>
                <button 
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  {involvedMemberIds.length === members.length ? 'ยกเลิกทั้งหมด' : 'เลือกทุกคน'}
                </button>
              </div>

              {/* Split Mode Tabs */}
              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${splitType === 'EQUAL' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
                >
                  หารเท่ากัน
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('EXACT')}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${splitType === 'EXACT' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
                >
                  ระบุยอดแยก
                </button>
              </div>
              
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                {members.map((member) => {
                  const isSelected = involvedMemberIds.includes(member.id);
                  return (
                    <div key={member.id} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-violet-50 border-violet-200 dark:bg-violet-900/10 dark:border-violet-800'
                          : 'bg-white border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 hover:border-zinc-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleInvolvedMember(member.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-violet-600 border-violet-600' : 'border-zinc-300 dark:border-zinc-600'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-violet-900 dark:text-violet-100 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {member.name}
                        </span>
                      </button>

                      {isSelected && splitType === 'EXACT' && (
                        <div className="w-24 relative">
                          <input
                            type="number"
                            step="0.01"
                            value={exactShares[member.id] || ''}
                            onChange={(e) => handleExactShareChange(member.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full text-right p-1.5 pr-8 text-sm rounded bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-violet-500 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-zinc-400">{currency}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.split && <p className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">{errors.split}</p>}
              {errors.involvedMemberIds && <p className="mt-2 text-sm text-red-500">{errors.involvedMemberIds}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 pb-2">
          {expenseToEdit && (
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                if (!confirm('ต้องการลบรายการนี้?')) return;
                setIsLoading(true);
                const result = await deleteExpense(expenseToEdit.id, tripId);
                setIsLoading(false);
                if (result.success) {
                  success('ลบค่าใช้จ่ายสำเร็จ');
                  onClose();
                } else {
                  toastError('ไม่สามารถลบค่าใช้จ่ายได้');
                }
              }}
              className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={20} />
            </Button>
          )}
          <div className="flex-1"></div>
          <Button type="button" variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {expenseToEdit ? "บันทึกแก้ไข" : "บันทึก"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
