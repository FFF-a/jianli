import { api } from './client';
import type { JobListResponse, JobDetail, FilterOptionsResponse, FavoriteStatusResponse, SearchParams } from './types';

export function getJobs(page = 0, size = 20): Promise<JobListResponse> {
  return api.get<JobListResponse>(`/api/jobs?page=${page}&size=${size}`);
}

export function getJobDetail(id: number): Promise<JobDetail> {
  return api.get<JobDetail>(`/api/jobs/${id}`);
}

export function searchJobs(params: SearchParams): Promise<JobListResponse> {
  const qs = new URLSearchParams();
  if (params.keyword) qs.set('keyword', params.keyword);
  if (params.city) qs.set('city', params.city);
  if (params.type) qs.set('type', params.type);
  if (params.edu) qs.set('edu', params.edu);
  if (params.exp) qs.set('exp', params.exp);
  qs.set('page', String(params.page ?? 0));
  qs.set('size', String(params.size ?? 20));
  return api.get<JobListResponse>(`/api/jobs/search?${qs.toString()}`);
}

export function getHotSearches(): Promise<string[]> {
  return api.get<string[]>('/api/jobs/hot-searches');
}

export function getRecentSearches(): Promise<string[]> {
  return api.get<string[]>('/api/jobs/recent-searches');
}

export function getFilterOptions(): Promise<FilterOptionsResponse> {
  return api.get<FilterOptionsResponse>('/api/jobs/filter-options');
}

export function toggleFavorite(jobId: number): Promise<FavoriteStatusResponse> {
  return api.post<FavoriteStatusResponse>(`/api/jobs/${jobId}/favorite`);
}

export function applyJob(jobId: number): Promise<null> {
  return api.post<null>(`/api/jobs/${jobId}/apply`);
}

export function cancelApplication(jobId: number): Promise<null> {
  return api.del<null>(`/api/jobs/${jobId}/apply`);
}
