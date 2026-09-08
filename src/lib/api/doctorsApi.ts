import { apiClient } from "@/lib/apiClient";

export interface Doctor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  specialization?: string;
  experienceYears?: number;
  clinicName?: string;
  clinicAddress?: string;
  city?: string;
  state?: string;
  rating?: number;
  reviewsCount?: number;
  isAvailable?: boolean;
  availability?: Array<{
    dayOfWeek: string;
    shifts?: Array<{ startTime: string; endTime: string }>;
  }>;
}

export function getDoctorAvailabilityStatus(doc: {
  isAvailable?: boolean;
  availability?: Array<{ dayOfWeek: string; shifts?: Array<{ startTime: string; endTime: string }> }>;
}): { status: string; isToday: boolean } {
  if (doc.isAvailable === false) {
    return { status: "Unavailable", isToday: false };
  }

  const parseMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const todayName = days[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (doc.availability && Array.isArray(doc.availability) && doc.availability.length > 0) {
    const todaySchedule = doc.availability.find(
      (a) => a.dayOfWeek?.toLowerCase() === todayName.toLowerCase()
    );

    // Check if there is any shift scheduled today that has not ended yet
    const hasRemainingShiftToday = todaySchedule?.shifts?.some((shift) => {
      if (!shift.startTime || !shift.endTime) return false;
      const startMins = parseMinutes(shift.startTime);
      const endMins = parseMinutes(shift.endTime);
      return endMins > startMins && endMins > currentMinutes;
    });

    if (hasRemainingShiftToday) {
      return { status: "Available Today", isToday: true };
    }

    return { status: "Advance Booking", isToday: false };
  }

  return {
    status: "Advance Booking",
    isToday: false
  };
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const response = await apiClient.get('/doctors');
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}
