// Trip status utility function
export function getTripStatus(
  startDate: Date,
  endDate: Date,
): "upcoming" | "ongoing" | "completed" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

// Date formatting utilities
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString(
    "th-TH",
    options || {
      day: "numeric",
      month: "short",
    },
  );
}

export function formatDateLong(date: Date): string {
  return new Date(date).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Calculate trip duration in days
export function getTripDuration(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}
