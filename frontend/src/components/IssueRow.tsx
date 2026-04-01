import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '../types';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';
import styles from './IssueRow.module.css';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface IssueRowProps {
  issue: Issue;
  dimmed?: boolean;
}

export const IssueRow = ({ issue, dimmed }: IssueRowProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.row}
      onClick={() => navigate(`/issues/${issue.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/issues/${issue.id}`)}
    >
      <div className={styles.priority}>
        <PriorityIcon priority={issue.priority} size={14} />
      </div>
      <div className={styles.status}>
        <StatusIcon status={issue.status} size={14} />
      </div>
      <span className={styles.identifier}>{issue.identifier}</span>
      <span className={styles.title}>{issue.title}</span>
      <div className={styles.labels}>
        {issue.labels.map(label => (
          <span
            key={label.id}
            className={styles.label}
            style={{
              color: label.color,
              backgroundColor: hexToRgba(label.color, 0.1),
              border: `1px solid ${hexToRgba(label.color, 0.22)}`,
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: label.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {label.name}
          </span>
        ))}
      </div>
    </div>
  );
};
