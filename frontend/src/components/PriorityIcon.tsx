import React from 'react';
import { IssuePriority } from '../types';
import { IconUrgent, IconPriorityHigh, IconPriorityMedium, IconPriorityLow, IconNoPriority } from './icons';

const PRIORITY_CONFIG: Record<IssuePriority, { icon: React.FC<{ size?: number }>, label: string }> = {
  no_priority: { icon: IconNoPriority, label: 'No priority' },
  urgent: { icon: IconUrgent, label: 'Urgent' },
  high: { icon: IconPriorityHigh, label: 'High' },
  medium: { icon: IconPriorityMedium, label: 'Medium' },
  low: { icon: IconPriorityLow, label: 'Low' },
};

interface PriorityIconProps {
  priority: IssuePriority;
  size?: number;
}

export const PriorityIcon = ({ priority, size = 14 }: PriorityIconProps) => {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return <Icon size={size} />;
};

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
  value: value as IssuePriority,
  label: config.label,
}));

export { PRIORITY_CONFIG };
