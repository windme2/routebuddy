export interface ExpenseFormData {
  description: string;
  amount: number;
  currency: string;
  thbAmount: number;
  category: string;
  date: string;
  payerId: string;
  involvedMemberIds: string[];
  splitType: "EQUAL" | "EXACT";
  exactShares?: Record<string, number>;
  tripId: string;
  activityId?: string;
}

export interface ActivityFormData {
  name: string;
  date: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  category: string; // 'food' | 'transport' | 'accommodation' | 'attraction' | 'shopping' | 'other'
  location?: string;
  notes?: string;
  tripId: string;
}
