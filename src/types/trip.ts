export interface TripFormData {
  name: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  budget: number;
  description?: string;
  coverImage?: string;
}

export interface TripWithMemberCount {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  budget: number;
  createdAt: Date;
  description?: string | null;
  coverImage?: string | null;
  images?: { url: string }[];
  _count: {
    members: number;
  };
  expenses?: { thbAmount: number }[];
}
