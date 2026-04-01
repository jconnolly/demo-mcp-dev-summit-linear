import axios from 'axios';
import { Issue, IssueWithComments, Label, Team, CreateIssueData, UpdateIssueData } from './types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const issuesApi = {
  list: (params?: { status?: string; priority?: string; search?: string }) =>
    api.get<Issue[]>('/issues', { params }).then(r => r.data),

  get: (id: number) =>
    api.get<IssueWithComments>(`/issues/${id}`).then(r => r.data),

  create: (data: CreateIssueData) =>
    api.post<Issue>('/issues', data).then(r => r.data),

  update: (id: number, data: UpdateIssueData) =>
    api.put<Issue>(`/issues/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/issues/${id}`).then(r => r.data),

  addComment: (id: number, body: string) =>
    api.post(`/issues/${id}/comments`, { body }).then(r => r.data),
};

export const labelsApi = {
  list: () => api.get<Label[]>('/labels').then(r => r.data),
};

export const teamsApi = {
  list: () => api.get<Team[]>('/teams').then(r => r.data),
};
