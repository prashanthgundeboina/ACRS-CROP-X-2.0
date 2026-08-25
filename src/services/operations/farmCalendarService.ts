import { FarmTask, FarmTaskCategory } from '../../types/operations/farmOperationsTypes';

export interface CalendarDayBucket {
  dateIso: string;
  dayLabel: string; // e.g. "Mon, Aug 18"
  isToday: boolean;
  tasks: FarmTask[];
}

export const farmCalendarService = {
  getCategoryIcon(category: FarmTaskCategory): string {
    switch (category) {
      case 'irrigation': return '💧';
      case 'fertilizer': return '🧪';
      case 'crop_inspection': return '🌱';
      case 'pest_monitoring': return '🐛';
      case 'harvest': return '🌾';
      case 'market': return '💰';
      case 'soil_management': return '🪴';
      default: return '📋';
    }
  },

  getCategoryColor(category: FarmTaskCategory): { bg: string; text: string; border: string } {
    switch (category) {
      case 'irrigation':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'fertilizer':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'crop_inspection':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'pest_monitoring':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'harvest':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'market':
        return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  },

  getCalendarView(
    tasks: FarmTask[],
    viewMode: 'Today' | 'This Week' | 'This Month',
    filterCategory: string = 'all'
  ): CalendarDayBucket[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredTasks = filterCategory === 'all' 
      ? tasks 
      : tasks.filter(t => t.category === filterCategory);

    let daysCount = 1;
    if (viewMode === 'Today') daysCount = 1;
    else if (viewMode === 'This Week') daysCount = 7;
    else if (viewMode === 'This Month') daysCount = 30;

    const buckets: CalendarDayBucket[] = [];

    for (let i = 0; i < daysCount; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() + i);
      const dateIso = current.toISOString().split('T')[0];

      const dayTasks = filteredTasks.filter(t => t.due_date === dateIso);

      const dayLabel = i === 0 
        ? 'Today' 
        : i === 1 
          ? 'Tomorrow' 
          : current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      buckets.push({
        dateIso,
        dayLabel,
        isToday: i === 0,
        tasks: dayTasks
      });
    }

    return buckets;
  }
};
