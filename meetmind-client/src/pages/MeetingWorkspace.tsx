import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { Skeleton } from '../components/Skeleton';
import {
  Search,
  Plus,
  Clock,
  Save,
  Sparkles,
  Mail,
  ListTodo,
  Download,
  Trash2,
  Tag,
  Loader2,
  CheckCircle2,
  Copy,
  FileText,
} from 'lucide-react';
import type { Meeting } from '../types';
import { useStore } from '../store/useStore';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { AiLoadingIndicator } from '../components/ui/AiLoadingIndicator';

export const MeetingWorkspace: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('id') || '';

  // Local state for active editor
  const [title, setTitle] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'summary' | 'highlights' | 'email'>('editor');

  const { addToast } = useStore();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [rawCopied, setRawCopied] = useState(false);

  const handleCopyRaw = () => {
    if (!rawNotes) return;
    navigator.clipboard.writeText(rawNotes);
    setRawCopied(true);
    setTimeout(() => setRawCopied(false), 2000);
    addToast("Notes copied to clipboard", "success");
  };
  
  // Search and filter meetings list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // 1. Fetch meetings list
  const { data: meetingsRes, isLoading: listLoading } = useQuery({
    queryKey: ['meetings', searchQuery, selectedTag],
    queryFn: () => api.get(`/meetings?search=${searchQuery}&tag=${selectedTag}`).then((res: any) => res.data)
  });
  const meetingsList = meetingsRes?.meetings || [];

  // Extract all unique tags for filter dropdown
  const allTags = Array.from(
    new Set(meetingsList.flatMap((m: Meeting) => m.tags || []))
  ) as string[];

  // 2. Fetch active meeting details if activeId is set
  const { data: activeMeeting, isLoading: detailsLoading } = useQuery<Meeting>({
    queryKey: ['meeting', activeId],
    queryFn: () => api.get(`/meetings/${activeId}`).then((res: any) => res.data),
    enabled: !!activeId
  });

  // Reset tab only when the active meeting ID changes
  useEffect(() => {
    setActiveTab('editor');
  }, [activeId]);

  // Sync state with loaded meeting data
  useEffect(() => {
    if (activeMeeting) {
      setTitle(activeMeeting.title);
      setRawNotes(activeMeeting.rawNotes);
      setTagsInput(activeMeeting.tags.join(', '));
    } else if (!activeId) {
      setTitle('');
      setRawNotes('');
      setTagsInput('');
    }
  }, [activeMeeting, activeId]);

  // Mutations
  // A. Create meeting
  const createMutation = useMutation({
    mutationFn: (newMeeting: { title: string; rawNotes: string; tags: string[] }) =>
      api.post('/meetings', newMeeting).then((res: any) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setSearchParams({ id: data._id });
      addToast("Meeting note created successfully", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || "Failed to create meeting note", "error");
    }
  });

  // B. Update meeting notes
  const updateMutation = useMutation({
    mutationFn: (updated: { id: string; title?: string; rawNotes?: string; tags?: string[] }) =>
      api.put(`/meetings/${updated.id}`, updated).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', activeId] });
      addToast("Meeting draft saved successfully", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || "Failed to save meeting notes", "error");
    }
  });

  // C. Delete meeting
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/meetings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Linked tasks deleted too
      setSearchParams({});
      addToast("Meeting note deleted successfully", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || "Failed to delete meeting note", "error");
    }
  });

  // D. AI: Generate summary
  const summaryMutation = useMutation({
    mutationFn: (id: string) => api.post(`/meetings/${id}/summary`).then((res: any) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', activeId] });
      addToast(data.message || "Meeting summary compiled successfully by Gemini AI!", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || "Failed to compile summary via Gemini", "error");
    }
  });

  // E. AI: Draft follow-up email
  const emailMutation = useMutation({
    mutationFn: (id: string) => api.post(`/meetings/${id}/email`).then((res: any) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', activeId] });
      addToast(data.message || "Follow-up email drafted successfully by Gemini AI!", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || "Failed to draft follow-up email via Gemini", "error");
    }
  });

  // F. AI: Extract and create tasks
  const tasksMutation = useMutation({
    mutationFn: (id: string) => api.post(`/meetings/${id}/tasks`).then((res: any) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      addToast(data.message || "Tasks successfully generated and added to task board!", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || "Failed to generate tasks via Gemini", "error");
    }
  });

  const handleSave = () => {
    if (!title.trim()) return addToast("Meeting title is required!", "error");
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (activeId) {
      updateMutation.mutate({ id: activeId, title, rawNotes, tags: parsedTags });
    } else {
      createMutation.mutate({ title, rawNotes, tags: parsedTags });
    }
  };

  const handleCreateNew = () => {
    setSearchParams({});
    setTitle('');
    setRawNotes('');
    setTagsInput('');
    setActiveTab('editor');
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    deleteMutation.mutate(activeId, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
      }
    });
  };

  const handleExport = () => {
    if (!activeMeeting) return;
    const content = `
TITLE: ${activeMeeting.title}
DATE: ${new Date(activeMeeting.createdAt).toLocaleString()}
TAGS: ${activeMeeting.tags.join(', ')}

==================================================
RAW MEETING NOTES & DRAFTS:
==================================================
${activeMeeting.rawNotes}

==================================================
AI SUMMARY OVERVIEW:
==================================================
${activeMeeting.aiSummary?.overview || 'Not generated yet.'}

==================================================
KEY DISCUSSION HIGHLIGHTS:
==================================================
${activeMeeting.aiSummary?.keyHighlights?.map(h => `- ${h}`).join('\n') || 'Not generated yet.'}

==================================================
EXTRACTED ACTION ITEMS:
==================================================
${activeMeeting.aiSummary?.actionItems?.map(a => `- ${a}`).join('\n') || 'Not generated yet.'}

==================================================
AI GENERATED FOLLOW-UP EMAIL:
==================================================
${activeMeeting.followUpEmail || 'Not generated yet.'}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeMeeting.title.toLowerCase().replace(/\s+/g, '_')}_summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 min-h-0 lg:min-h-[calc(100vh-12rem)]">
      <div className="lg:col-span-4 flex flex-col min-h-[280px] lg:min-h-0 lg:max-h-[calc(100vh-12rem)] space-y-3 sm:space-y-4">
        {/* Actions header */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <Search size={15} aria-hidden />
            </span>
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            onClick={handleCreateNew}
            className="
              p-2.5 
              rounded-xl 
              bg-brand-600 
              hover:bg-brand-500 
              text-white 
              shadow-lg 
              shadow-brand-500/10 
              transition-colors
              shrink-0
            "
            title="Create new meeting note"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Tags filter drop */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-slate-500" />
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="select-field py-1.5 text-[10px] w-auto min-w-[120px]"
            >
              <option value="">All Tags</option>
              {allTags.map((t: string) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        {/* Meetings List */}
        <GlassCard className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2">
          {listLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : meetingsList.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No meetings"
              description={searchQuery || selectedTag ? 'No results match your filters.' : 'Create your first meeting note to get started.'}
              action={!searchQuery && !selectedTag ? { label: 'New meeting', onClick: handleCreateNew } : undefined}
            />
          ) : (
            meetingsList.map((m: Meeting) => (
              <div
                key={m._id}
                onClick={() => setSearchParams({ id: m._id })}
                className={`
                  p-4 
                  rounded-xl 
                  border 
                  cursor-pointer 
                  transition-all 
                  space-y-2
                  ${m._id === activeId 
                    ? 'bg-brand-500/10 border-brand-500/30' 
                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs text-white line-clamp-1">{m.title}</h4>
                  {m.aiSummary?.overview && (
                    <Sparkles size={12} className="text-brand-400 shrink-0" />
                  )}
                </div>
                
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {m.rawNotes || "No contents recorded yet."}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] text-slate-500 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(m.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {m.tags.length > 0 && (
                    <div className="flex gap-1">
                      {m.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="text-[8px] px-1 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 uppercase font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </GlassCard>
      </div>

      {/* Right Details/Editor Column */}
      <div className="lg:col-span-8 flex flex-col min-h-[400px] lg:min-h-0 lg:max-h-[calc(100vh-12rem)]">
        {detailsLoading ? (
          <GlassCard className="flex-1 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-64" />
          </GlassCard>
        ) : (
          <div className="flex-1 flex flex-col h-full space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/5 rounded-xl">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'editor' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Notes Editor
                </button>
                {activeId && (
                  <>
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${activeTab === 'summary' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      AI Summary
                    </button>
                    <button
                      onClick={() => setActiveTab('highlights')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'highlights' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Highlights
                    </button>
                    <button
                      onClick={() => setActiveTab('email')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${activeTab === 'email' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <Mail size={12} />
                      Follow-up Email
                    </button>
                  </>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="
                    px-4 
                    py-2 
                    rounded-xl 
                    bg-white/5 
                    border 
                    border-white/5 
                    hover:bg-white/10 
                    text-xs 
                    font-semibold 
                    flex 
                    items-center 
                    gap-2 
                    text-slate-200 
                    transition-all
                    disabled:opacity-50
                  "
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save Draft
                </button>

                {activeId && (
                  <>
                    <button
                      onClick={handleExport}
                      className="
                        p-2.5 
                        rounded-xl 
                        bg-white/5 
                        border 
                        border-white/5 
                        hover:bg-white/10 
                        text-slate-400 
                        hover:text-white 
                        transition-colors
                      "
                      title="Export Meeting Summary"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="
                        p-2.5 
                        rounded-xl 
                        bg-rose-500/10 
                        border 
                        border-rose-500/10 
                        hover:bg-rose-500/20 
                        text-rose-400 
                        transition-colors
                      "
                      title="Delete Meeting"
                    >
                      {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Split Screen Editor / AI Viewers */}
            <GlassCard className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 overflow-hidden">
              {activeTab === 'editor' ? (
                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
                  {/* Title input */}
                  <input
                    type="text"
                    placeholder="Enter meeting title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="
                      w-full 
                      bg-transparent 
                      text-2xl 
                      font-bold 
                      text-white 
                      placeholder-slate-600 
                      focus:outline-none 
                      border-b 
                      border-white/5 
                      pb-3
                    "
                  />

                  {/* Tags Input */}
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <Tag size={14} className="text-slate-500" />
                    <input
                      type="text"
                      placeholder="marketing, updates, sprint (comma separated)..."
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      className="
                        w-full 
                        bg-transparent 
                        text-xs 
                        text-slate-300 
                        placeholder-slate-600 
                        focus:outline-none
                      "
                    />
                  </div>

                  {/* Raw notes content with floating copy button */}
                  <div className="relative flex-1 flex flex-col group min-h-[250px]">
                    <button
                      onClick={handleCopyRaw}
                      disabled={!rawNotes}
                      className="
                        absolute 
                        top-2 
                        right-2 
                        p-2 
                        rounded-xl 
                        bg-slate-800/80 
                        hover:bg-slate-700 
                        text-slate-400 
                        hover:text-white 
                        opacity-0 
                        group-hover:opacity-100 
                        disabled:opacity-0
                        transition-all 
                        duration-200
                        z-10
                      "
                      title="Copy Raw Notes"
                    >
                      {rawCopied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <textarea
                      placeholder="Type raw notes, updates, discussion items, or paste meeting transcription transcripts here..."
                      value={rawNotes}
                      onChange={e => setRawNotes(e.target.value)}
                      className="
                        w-full 
                        flex-1 
                        bg-transparent 
                        text-sm 
                        text-slate-300 
                        placeholder-slate-500 
                        focus:outline-none 
                        resize-none 
                        leading-relaxed
                      "
                    />
                  </div>
                </div>
              ) : (
                /* AI Outputs */
                <div className="flex-grow overflow-y-auto flex flex-col space-y-4">
                  {/* AI Quick Actions inside Panel */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-brand-500/5 rounded-2xl border border-brand-500/10 justify-between">
                    <span className="text-[10px] text-brand-300 font-semibold uppercase tracking-wider flex items-center gap-1.5 pl-2">
                      <Sparkles size={12} className="animate-pulse" />
                      Gemini Cognitive Suite
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => summaryMutation.mutate(activeId)}
                        disabled={summaryMutation.isPending}
                        className="
                          px-3 
                          py-1.5 
                          rounded-xl 
                          bg-brand-600 
                          hover:bg-brand-500 
                          text-[10px] 
                          font-semibold 
                          text-white 
                          flex 
                          items-center 
                          gap-1.5 
                          transition-all
                        "
                      >
                        {summaryMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        Analyze Summary
                      </button>

                      <button
                        onClick={() => emailMutation.mutate(activeId)}
                        disabled={emailMutation.isPending}
                        className="
                          px-3 
                          py-1.5 
                          rounded-xl 
                          bg-[#0f172a] 
                          border 
                          border-white/5 
                          hover:bg-white/5 
                          text-[10px] 
                          font-semibold 
                          text-slate-300 
                          flex 
                          items-center 
                          gap-1.5 
                          transition-all
                        "
                      >
                        {emailMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <Mail size={10} />}
                        Write Follow-up
                      </button>

                      <button
                        onClick={() => tasksMutation.mutate(activeId)}
                        disabled={tasksMutation.isPending}
                        className="
                          px-3 
                          py-1.5 
                          rounded-xl 
                          bg-[#0f172a] 
                          border 
                          border-white/5 
                          hover:bg-white/5 
                          text-[10px] 
                          font-semibold 
                          text-slate-300 
                          flex 
                          items-center 
                          gap-1.5 
                          transition-all
                        "
                      >
                        {tasksMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <ListTodo size={10} />}
                        Generate Tasks
                      </button>
                    </div>
                  </div>

                  {/* Rendering Tab Outputs with min-height layout-shift prevention */}
                  <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {activeTab === 'summary' && (
                      <div className="space-y-6">
                        {summaryMutation.isPending ? (
                          <AiLoadingIndicator message="Generating executive overview…" />
                        ) : (
                          <>
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Executive Overview</h4>
                              <p className="text-slate-200 leading-relaxed text-sm bg-slate-900/40 p-4 border border-white/5 rounded-xl">
                                {activeMeeting?.aiSummary?.overview || "No overview summary generated yet. Click 'Analyze Summary' above to compile notes via Gemini AI."}
                              </p>
                            </div>
                            {activeMeeting?.aiSummary?.productivityInsights && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Productivity Insights</h4>
                                <p className="text-slate-300 text-xs italic bg-brand-500/5 p-4 border border-brand-500/10 rounded-xl">
                                  💡 {activeMeeting.aiSummary.productivityInsights}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === 'highlights' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {summaryMutation.isPending ? (
                          <>
                            <div className="space-y-4 col-span-1">
                              <h4 className="text-xs font-semibold uppercase text-brand-400 tracking-wider flex items-center gap-2 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                Extracting highlights...
                              </h4>
                              <div className="space-y-2 p-5 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                <Skeleton className="h-8 w-full bg-slate-800/40 rounded-xl" />
                                <Skeleton className="h-8 w-full bg-slate-800/40 rounded-xl" />
                              </div>
                            </div>
                            <div className="space-y-4 col-span-1">
                              <h4 className="text-xs font-semibold uppercase text-brand-400 tracking-wider flex items-center gap-2 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                Extracting action items...
                              </h4>
                              <div className="space-y-2 p-5 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                <Skeleton className="h-8 w-full bg-slate-800/40 rounded-xl" />
                                <Skeleton className="h-8 w-full bg-slate-800/40 rounded-xl" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Discussion Highlights */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Discussion Highlights</h4>
                              {activeMeeting?.aiSummary?.keyHighlights && activeMeeting.aiSummary.keyHighlights.length > 0 ? (
                                <ul className="space-y-2">
                                  {activeMeeting.aiSummary.keyHighlights.map((h, i) => (
                                    <li key={i} className="p-3 bg-slate-900/30 border border-white/5 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                                      {h}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No highlights recorded. Click 'Analyze Summary' to process notes.</p>
                              )}
                            </div>

                            {/* Action items */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Extracted Action Items</h4>
                              {activeMeeting?.aiSummary?.actionItems && activeMeeting.aiSummary.actionItems.length > 0 ? (
                                <ul className="space-y-2">
                                  {activeMeeting.aiSummary.actionItems.map((a, i) => (
                                    <li key={i} className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                                      {a}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No action items found. Click 'Analyze Summary' to extract.</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === 'email' && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Follow-up Email Template</h4>
                        {emailMutation.isPending ? (
                          <AiLoadingIndicator message="Drafting follow-up email…" />
                        ) : activeMeeting?.followUpEmail ? (
                          <MarkdownViewer content={activeMeeting.followUpEmail} />
                        ) : (
                          <div className="text-center py-12 text-slate-500">
                            <Mail size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm italic">No follow-up email has been generated yet.</p>
                            <button
                              onClick={() => emailMutation.mutate(activeId)}
                              disabled={emailMutation.isPending}
                              className="text-xs text-brand-400 underline mt-1"
                            >
                              Generate now
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>

      {/* Modern Confirm Modal for Meeting Note Deletion */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Meeting Note"
        message="Are you sure you want to permanently delete this meeting note? All linked tasks on the Kanban board will also be cascade deleted."
        confirmText="Delete Note"
        cancelText="Cancel"
        isPending={deleteMutation.isPending}
        type="danger"
      />
    </div>
  );
};
