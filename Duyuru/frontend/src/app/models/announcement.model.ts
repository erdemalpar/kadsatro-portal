export type Role = 'Admin' | 'Editor' | 'Moderator' | 'User';
export type AnnouncementStatus = 'PendingEditor' | 'PendingModerator' | 'Published' | 'Rejected' | 'Withdrawn';
export type AnnouncementFormat = 'Glassmorphism' | 'Cinematic' | 'Story' | 'Toast';
export type DisplayFrequency = 'Once' | 'Daily' | 'Always';

export interface AnnouncementResponseDto {
    id: number;
    title: string;
    content: string;
    format: AnnouncementFormat;
    status: AnnouncementStatus;
    rejectionReason?: string;
    categoryName: string;
    createdByName: string;
    createdAt: string;
    publishedAt?: string;
    startDate?: string | null;
    endDate?: string | null;
    frequency: DisplayFrequency;
    onceDurationMinutes?: number | null;
}

export interface CreateAnnouncementDto {
    title: string;
    content: string;
    format: AnnouncementFormat;
    categoryId: number;
    createdById: number;
    startDate?: string | null;
    endDate?: string | null;
    frequency: DisplayFrequency;
    onceDurationMinutes?: number | null;
}

export interface UpdateAnnouncementStatusDto {
    status: AnnouncementStatus;
    rejectionReason?: string;
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  format: string;
  categoryId: number;
  startDate?: string | null;
  endDate?: string | null;
  frequency: DisplayFrequency;
  onceDurationMinutes?: number | null;
}

export interface DashboardStatsDto {
  publishedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalViews: number;
}
