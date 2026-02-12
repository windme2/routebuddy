import { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Expense } from '@/generated/prisma/client';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface ExpenseChartProps {
  expenses: Expense[];
}

const CATEGORIES: Record<string, { label: string, color: string }> = {
  food: { label: 'อาหาร', color: '#f97316' }, // orange-500
  transport: { label: 'เดินทาง', color: '#3b82f6' }, // blue-500
  accommodation: { label: 'ที่พัก', color: '#6366f1' }, // blue-500
  attraction: { label: 'ท่องเที่ยว', color: '#10b981' }, // emerald-500
  shopping: { label: 'ช้อปปิ้ง', color: '#ec4899' }, // pink-500
  other: { label: 'อื่นๆ', color: '#6b7280' }, // gray-500
};

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<'category' | 'daily'>('category');

  // Process data for Category Pie Chart
  const categoryData = useMemo(() => {
    if (expenses.length === 0) return [];
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      const current = categoryTotals[expense.category] || 0;
      categoryTotals[expense.category] = current + (expense.amount / 100);
    });
    return Object.entries(categoryTotals).map(([key, value]) => ({
      name: CATEGORIES[key]?.label || key,
      value: value,
      color: CATEGORIES[key]?.color || '#cbd5e1',
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Process data for Daily Bar Chart
  const dailyData = useMemo(() => {
    if (expenses.length === 0) return [];
    
    // Group by date
    const dailyTotals: Record<string, number> = {};
    const dateMap: Record<string, Date> = {}; // Keep original date object for sorting

    expenses.forEach(expense => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
      const current = dailyTotals[dateKey] || 0;
      dailyTotals[dateKey] = current + (expense.amount / 100);
      dateMap[dateKey] = new Date(expense.date);
    });

    // Sort by date and format for display
    return Object.keys(dailyTotals)
      .sort()
      .map(dateKey => ({
        date: format(dateMap[dateKey], 'd MMM', { locale: th }),
        amount: dailyTotals[dateKey],
      }));
  }, [expenses]);

  if (expenses.length === 0) return null;

  return (
    <div className="w-full flex flex-col pt-2">
      {/* Chart Type Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setChartType('category')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              chartType === 'category'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            หมวดหมู่
          </button>
          <button
            onClick={() => setChartType('daily')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              chartType === 'daily'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            รายวัน
          </button>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'category' ? (
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number | undefined) => `฿${(value || 0).toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          ) : (
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#71717A' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#71717A' }} 
                tickFormatter={(value) => `฿${value}`}
              />
              <RechartsTooltip
                cursor={{ fill: 'transparent' }}
                formatter={(value: number | undefined) => [`฿${(value || 0).toLocaleString()}`, 'รวม']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
