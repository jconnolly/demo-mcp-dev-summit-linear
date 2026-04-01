import React from 'react';
import { IssueStatus } from '../types';
import {
  IconBacklog, IconTodo, IconInProgress, IconInReview, IconDone, IconCancelled
} from './icons';

const STATUS_CONFIG: Record<IssueStatus, { icon: React.FC<{ size?: number; color?: string }>, color: string, label: string }> = {
  backlog: { icon: IconBacklog, color: 'var(--color-status-backlog)', label: 'Backlog' },
  todo: { icon: IconTodo, color: 'var(--color-status-todo)', label: 'Todo' },
  in_progress: { icon: IconInProgress, color: 'var(--color-status-in-progress)', label: 'In Progress' },
  in_review: { icon: IconInReview, color: 'var(--color-status-in-review)', label: 'In Review' },
  done: { icon: IconDone, color: 'var(--color-status-done)', label: 'Done' },
  cancelled: { icon: IconCancelled, color: 'var(--color-status-cancelled)', label: 'Cancelled' },
};

interface StatusIconProps {
  status: IssueStatus;
  size?: number;
}

export const StatusIcon = ({ status, size = 14 }: StatusIconProps) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return <Icon size={size} color={config.color} />;
};

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value: value as IssueStatus,
  label: config.label,
  color: config.color,
}));

export { STATUS_CONFIG };
