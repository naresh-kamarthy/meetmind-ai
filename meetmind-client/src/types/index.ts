export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  avatarType?: 'upload' | 'url' | 'generated';
  role: 'user' | 'admin';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AISummary {
  overview: string;
  keyHighlights: string[];
  actionItems: string[];
  productivityInsights: string;
}

export interface Meeting {
  _id: string;
  title: string;
  rawNotes: string;
  aiSummary?: AISummary;
  followUpEmail?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  linkedMeeting?: { _id: string; title: string } | null;
  createdBy: string;
  assignedUser: { _id: string; name: string; email: string; avatar: string; avatarType?: string } | null;
  createdAt: string;
  updatedAt: string;
}
