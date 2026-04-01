import React, { useState } from 'react';
import { Issue, IssueStatus } from '../types';
import { StatusIcon, STATUS_CONFIG } from './StatusIcon';
import { IssueRow } from './IssueRow';
import { IconChevronDown, IconChevronRight } from './icons';
import styles from './IssueGroup.module.css';

const COMPLETED_STATUSES: IssueStatus[] = ['done', 'cancelled'];

interface IssueGroupProps {
  status: IssueStatus;
  issues: Issue[];
}

export const IssueGroup = ({ status, issues }: IssueGroupProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const config = STATUS_CONFIG[status];
  const isCompleted = COMPLETED_STATUSES.includes(status);

  if (issues.length === 0) return null;

  return (
    <div className={`${styles.group} ${isCompleted ? styles.completedGroup : ''}`}>
      <button
        className={`${styles.header} ${isCompleted ? styles.headerCompleted : ''}`}
        onClick={() => setCollapsed(c => !c)}
      >
        <span className={styles.chevron}>
          {collapsed
            ? <IconChevronRight size={12} color="var(--color-text-tertiary)" />
            : <IconChevronDown size={12} color="var(--color-text-tertiary)" />
          }
        </span>
        <StatusIcon status={status} size={14} />
        <span className={`${styles.label} ${isCompleted ? styles.labelCompleted : ''}`} style={{ color: config.color }}>
          {config.label}
        </span>
        <span className={styles.count}>{issues.length}</span>
      </button>

      {!collapsed && (
        <div className={`${styles.rows} ${isCompleted ? styles.rowsCompleted : ''}`}>
          {issues.map(issue => (
            <IssueRow key={issue.id} issue={issue} dimmed={isCompleted} />
          ))}
        </div>
      )}
    </div>
  );
};
