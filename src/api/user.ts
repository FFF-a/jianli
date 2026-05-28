import { api } from './client';
import type { UserProfileResponse, UserStatsResponse, ResumeResponse, JobListResponse, ApplicationResponse, UpdateProfileRequest, UpdateResumeRequest } from './types';

export function getProfile(): Promise<UserProfileResponse> {
  return api.get<UserProfileResponse>('/api/user/profile');
}

export function updateProfile(data: UpdateProfileRequest): Promise<null> {
  return api.put<null>('/api/user/profile', data);
}

export function getStats(): Promise<UserStatsResponse> {
  return api.get<UserStatsResponse>('/api/user/stats');
}

export function getResume(): Promise<ResumeResponse> {
  return api.get<ResumeResponse>('/api/user/resume');
}

export function updateResume(data: UpdateResumeRequest): Promise<null> {
  return api.put<null>('/api/user/resume', data);
}

export function getFavorites(page = 0, size = 20): Promise<JobListResponse> {
  return api.get<JobListResponse>(`/api/user/favorites?page=${page}&size=${size}`);
}

export function getApplications(status?: string, page = 0, size = 20): Promise<ApplicationResponse[]> {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  qs.set('page', String(page));
  qs.set('size', String(size));
  return api.get<ApplicationResponse[]>(`/api/user/applications?${qs.toString()}`);
}
