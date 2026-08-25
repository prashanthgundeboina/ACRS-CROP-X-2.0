import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  ListTodo
} from 'lucide-react';
import { FarmTask, FarmTaskCategory, FarmTaskStatus } from '../../types/operations/farmOperationsTypes';
import { farmCalendarService } from '../../services/operations/farmCalendarService';
import { FarmTaskCard } from './FarmTaskCard';

interface FarmCalendarProps {
  tasks: FarmTask[];
  isExpertMode?: boolean;
  onUpdateTaskStatus: (taskId: string, status: FarmTaskStatus) => void;
  onSnoozeTask: (taskId: string, days: number) => void;
  onAddTask: (task: Omit<FarmTask, 'task_id'>) => void;
  onOpenAskCroperX?: (question: string) => void;
  onSelectTab?: (tabId: string) => void;
}

export const FarmCalendar: React.FC<FarmCalendarProps> = ({
  tasks,
  isExpertMode = false,
  onUpdateTaskStatus,
  onSnoozeTask,
  onAddTask,
  onOpenAskCroperX,
  onSelectTab
}) => {
  const [viewMode, setViewMode] = useState<'Today' | 'This Week' | 'This Month'>('This Week');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<FarmTaskCategory>('crop_inspection');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('08:00 AM');
  const [newZone, setNewZone] = useState('Main Field');
  const [newPriority, setNewPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [newReason, setNewReason] = useState('');

  const dayBuckets = farmCalendarService.getCalendarView(tasks, viewMode, categoryFilter);

  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      due_date: newDueDate,
      due_time: newDueTime,
      zone: newZone,
      priority: newPriority,
      reason: newReason.trim() || 'Manual farm operation planned by grower.',
      status: 'Pending',
      created_from: 'farmer_manual'
    });

    setNewTitle('');
    setNewReason('');
    setIsAddingTask(false);
  };

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Tasks', icon: '📋' },
    { id: 'irrigation', label: 'Watering', icon: '💧' },
    { id: 'fertilizer', label: 'Fertilizer', icon: '🧪' },
    { id: 'crop_inspection', label: 'Inspection', icon: '🌱' },
    { id: 'pest_monitoring', label: 'Pest Watch', icon: '🐛' },
    { id: 'harvest', label: 'Harvest', icon: '🌾' },
    { id: 'market', label: 'Market', icon: '💰' }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32] shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                Farm Calendar
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {pendingCount} Pending • {completedCount} Done
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Scheduled Operations & Tasks
            </h2>
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl p-1 bg-gray-100 border border-gray-200">
            {(['Today', 'This Week', 'This Month'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-white text-[#2e7d32] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="px-3.5 py-2 rounded-xl bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              categoryFilter === cat.id
                ? 'bg-[#2e7d32] text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Add Task Modal / Form */}
      {isAddingTask && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreateTask}
          className="p-5 rounded-2xl bg-[#fbfdfb] border border-[#c8e6c9] space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#1b2e1b]">Schedule New Farm Operation</span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Task Title / Action</label>
              <input
                type="text"
                required
                placeholder="e.g. Inspect Drip Valves & Flush Main Filter"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FarmTaskCategory)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="irrigation">💧 Irrigation</option>
                <option value="fertilizer">🧪 Fertilizer</option>
                <option value="crop_inspection">🌱 Crop Inspection</option>
                <option value="pest_monitoring">🐛 Pest Monitoring</option>
                <option value="harvest">🌾 Harvest</option>
                <option value="market">💰 Market</option>
                <option value="general">📋 General Task</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Time</label>
              <input
                type="text"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                placeholder="06:30 AM"
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Farm Zone</label>
              <input
                type="text"
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                placeholder="North Field"
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Agronomic Reason / Notes</label>
              <input
                type="text"
                placeholder="Reason for scheduling this task..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2e7d32] text-white text-xs font-bold hover:bg-[#1b5e20] shadow-sm"
            >
              Save Scheduled Task
            </button>
          </div>
        </motion.form>
      )}

      {/* Calendar Timeline View */}
      <div className="space-y-6">
        {dayBuckets.map((bucket) => {
          const hasTasks = bucket.tasks.length > 0;

          return (
            <div key={bucket.dateIso} className="space-y-3">
              {/* Day Header Bar */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                  bucket.isToday
                    ? 'bg-[#2e7d32] text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {bucket.dayLabel}
                </div>
                <div className="h-[1px] flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400 font-mono">
                  {bucket.tasks.length} {bucket.tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Tasks List for the Day */}
              {hasTasks ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bucket.tasks.map((task) => (
                    <FarmTaskCard
                      key={task.task_id}
                      task={task}
                      isExpertMode={isExpertMode}
                      onUpdateStatus={onUpdateTaskStatus}
                      onSnooze={onSnoozeTask}
                      onOpenAskCroperX={onOpenAskCroperX}
                      onSelectTab={onSelectTab}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gray-50/60 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  No operations scheduled for this date.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
