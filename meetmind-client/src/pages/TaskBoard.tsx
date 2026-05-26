import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { Modal } from '../components/Modal';
import { Skeleton } from '../components/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Link as LinkIcon,
  Trash2,
  Calendar,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import type { Task, TaskStatus, Meeting } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { ConfirmModal } from '../components/ConfirmModal';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Todo', 'In Progress', 'Completed']),
  dueDate: z.string().optional().nullable().or(z.literal('')),
  linkedMeeting: z.string().optional().nullable().or(z.literal('')),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export const TaskBoard: React.FC = () => {
  const queryClient = useQueryClient();
  const { taskFilters, setTaskFilters, addToast } = useStore();

  // Dialog / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Custom Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Drag over tracking
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);

  // 1. Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', taskFilters],
    queryFn: () => api.get(`/tasks?search=${taskFilters.search}&priority=${taskFilters.priority}`).then((res: any) => res.data || [])
  });

  // 2. Fetch meetings for selection
  const { data: meetingsRes } = useQuery({
    queryKey: ['meetings-select'],
    queryFn: () => api.get('/meetings?limit=100').then((res: any) => res.data.meetings || [])
  });
  const meetingsList: Meeting[] = meetingsRes || [];

  // Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      dueDate: '',
      linkedMeeting: ''
    }
  });

  // Mutations
  // Create task
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormValues) => api.post('/tasks', data).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      reset();
      addToast("Task created successfully", "success");
    }
  });

  // Update task
  const updateTaskMutation = useMutation({
    mutationFn: (updated: { id: string; data: Partial<TaskFormValues> }) =>
      api.put(`/tasks/${updated.id}`, updated.data).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setSelectedTask(null);
      reset();
      addToast("Task updated successfully", "success");
    }
  });

  // Quick drag & drop update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (updated: { id: string; status: TaskStatus }) =>
      api.put(`/tasks/${updated.id}`, { status: updated.status }).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      addToast("Task status updated", "success");
    }
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setSelectedTask(null);
      reset();
      addToast("Task deleted successfully", "success");
    }
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const id = e.dataTransfer.getData('text/plain');
    setDraggedOverColumn(null);
    if (id) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  // Form submission
  const onSubmit = (data: TaskFormValues) => {
    // Format empty values to null for server
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      linkedMeeting: data.linkedMeeting || null
    };

    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask._id, data: payload });
    } else {
      createTaskMutation.mutate(payload);
    }
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    reset({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      dueDate: '',
      linkedMeeting: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '',
      linkedMeeting: task.linkedMeeting?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete, {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setTaskToDelete(null);
        }
      });
    }
  };

  // Sort columns
  const columns: { name: TaskStatus; title: string; color: string }[] = [
    { name: 'Todo', title: 'To Do', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
    { name: 'In Progress', title: 'In Progress', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    { name: 'Completed', title: 'Completed', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
  ];

  const renderColumnTasks = (status: TaskStatus) => {
    const filtered = tasks.filter(t => t.status === status);

    if (tasksLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={CheckSquare}
          title={`No ${status === 'In Progress' ? 'in-progress' : status.toLowerCase()} tasks`}
          description="Drag tasks here or create one for this column."
          action={{
            label: 'Add task',
            onClick: () => {
              setSelectedTask(null);
              reset({
                title: '',
                description: '',
                priority: 'Medium',
                status,
                dueDate: '',
                linkedMeeting: '',
              });
              setIsModalOpen(true);
            },
          }}
          className="py-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]"
        />
      );
    }

    return (
      <AnimatePresence mode="popLayout">
        {filtered.map(task => (
          <motion.div
            key={task._id}
            layoutId={task._id}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task._id)}
            onClick={() => openEditModal(task)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="
              p-4 
              rounded-2xl 
              bg-slate-900/60 
              border 
              border-white/5 
              hover:border-brand-500/20 
              hover:bg-slate-900/80 
              cursor-grab 
              active:cursor-grabbing 
              transition-all 
              space-y-3 
              group 
              relative
              shadow-[0_4px_12px_rgba(0,0,0,0.15)]
              hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)]
            "
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-brand-300 transition-colors">
                {task.title}
              </h4>
              <span className={`
                px-2 
                py-0.5 
                rounded-lg 
                text-[9px] 
                font-semibold 
                uppercase 
                shrink-0
                border
                ${task.priority === 'High' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.05)]' 
                  : task.priority === 'Medium' 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.05)]' 
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.05)]'
                }
              `}>
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[9px] text-slate-500 border-t border-white/5">
              {task.dueDate ? (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              ) : (
                <div />
              )}

              {task.linkedMeeting && (
                <span className="flex items-center gap-1 text-brand-400 max-w-[120px] truncate">
                  <LinkIcon size={8} />
                  {task.linkedMeeting.title}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Tasks Board"
        description="Organize work across columns. Drag cards to update status."
        action={
          <button type="button" onClick={openCreateModal} className="btn-primary">
            <Plus size={16} aria-hidden />
            Create task
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <Search size={15} aria-hidden />
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={taskFilters.search}
              onChange={e => setTaskFilters({ search: e.target.value })}
              className="search-input"
            />
          </div>

          {/* Priority filter */}
          <select
            value={taskFilters.priority}
            onChange={e => setTaskFilters({ priority: e.target.value })}
            className="select-field py-2.5 text-xs w-auto min-w-[140px]"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start pb-4">
        {columns.map(col => (
          <div
            key={col.name}
            onDragOver={(e) => handleDragOver(e, col.name)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.name)}
            className={`
              flex 
              flex-col 
              h-full 
              bg-[#0f172a]/30 
              border 
              rounded-3xl 
              p-4 
              space-y-4 
              min-h-[280px] md:min-h-[360px]
              max-h-[calc(100vh-16rem)]
              transition-all 
              duration-300
              ${draggedOverColumn === col.name 
                ? 'border-brand-500/40 bg-brand-950/5 shadow-[0_0_20px_rgba(99,102,241,0.08)]' 
                : 'border-white/5'
              }
            `}
          >
            {/* Column Header */}
            <div className={`p-3 rounded-2xl border ${col.color} flex items-center justify-between shrink-0`}>
              <span className="text-xs font-bold font-sans uppercase tracking-wider">{col.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5">
                {tasks.filter(t => t.status === col.name).length}
              </span>
            </div>

            {/* Column Tasks List Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
              {renderColumnTasks(col.name)}
            </div>
          </div>
        ))}
      </div>

      {/* Modern Confirm Modal for Task Deletion */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDeleteTask}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This cannot be undone."
        confirmText="Delete Task"
        cancelText="Cancel"
        isPending={deleteTaskMutation.isPending}
        type="danger"
      />

      {/* Task Modal Editor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? "Task Details" : "Create New Task"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Task Title</label>
            <input
              {...register('title')}
              type="text"
              placeholder="Deploy project updates..."
              className="
                w-full 
                px-4 
                py-3 
                rounded-xl 
                bg-[#0d1222] 
                border 
                border-white/5 
                text-sm 
                text-slate-200 
                placeholder-slate-600 
                focus:outline-none 
                focus:border-brand-500/30
              "
            />
            {errors.title && <span className="text-[10px] text-rose-400">{errors.title.message}</span>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Description</label>
            <textarea
              {...register('description')}
              placeholder="Additional logs, assignee names, or details..."
              className="
                w-full 
                px-4 
                py-3 
                rounded-xl 
                bg-[#0d1222] 
                border 
                border-white/5 
                text-sm 
                text-slate-200 
                placeholder-slate-600 
                focus:outline-none 
                focus:border-brand-500/30 
                h-24 
                resize-none
              "
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Priority</label>
              <select
                {...register('priority')}
                className="select-field py-3"
              >
                <option value="High">🔥 High</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Low">💤 Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Status</label>
              <select
                {...register('status')}
                className="select-field py-3"
              >
                <option value="Todo">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Due Date</label>
              <input
                {...register('dueDate')}
                type="date"
                className="
                  w-full 
                  px-4 
                  py-3 
                  rounded-xl 
                  bg-[#0d1222] 
                  border 
                  border-white/5 
                  text-sm 
                  text-slate-200 
                  focus:outline-none
                "
              />
            </div>

            {/* Linked Meeting */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Linked Meeting</label>
              <select
                {...register('linkedMeeting')}
                className="select-field py-3"
              >
                <option value="">Unlinked</option>
                {meetingsList.map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons panel */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
            {selectedTask ? (
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask._id)}
                disabled={deleteTaskMutation.isPending}
                className="
                  px-4 
                  py-2.5 
                  rounded-xl 
                  bg-rose-500/10 
                  hover:bg-rose-500/20 
                  text-rose-400 
                  text-xs 
                  font-semibold 
                  flex 
                  items-center 
                  gap-2 
                  transition-colors
                "
              >
                {deleteTaskMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="
                  px-4 
                  py-2.5 
                  rounded-xl 
                  bg-white/5 
                  hover:bg-white/10 
                  text-slate-400 
                  hover:text-slate-200 
                  text-xs 
                  font-semibold 
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                className="
                  px-5 
                  py-2.5 
                  rounded-xl 
                  bg-brand-600 
                  hover:bg-brand-500 
                  text-white 
                  text-xs 
                  font-semibold 
                  flex 
                  items-center 
                  gap-2 
                  transition-colors
                "
              >
                {(createTaskMutation.isPending || updateTaskMutation.isPending) && <Loader2 size={12} className="animate-spin" />}
                {selectedTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
