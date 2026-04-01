import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { issuesApi } from '../api';
import { Issue, IssueStatus } from '../types';
import { IssueGroup } from '../components/IssueGroup';
import { CreateIssueModal } from '../components/CreateIssueModal';
import { IconPlus, IconSearch } from '../components/icons';
import styles from './IssuesPage.module.css';

const STATUS_ORDER: IssueStatus[] = ['in_progress', 'in_review', 'todo', 'backlog', 'done', 'cancelled'];

export const IssuesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['issues', search],
    queryFn: () => issuesApi.list(search ? { search } : undefined),
  });

  const grouped = STATUS_ORDER.reduce<Record<IssueStatus, Issue[]>>((acc, status) => {
    acc[status] = issues.filter((i: Issue) => i.status === status);
    return acc;
  }, {} as Record<IssueStatus, Issue[]>);

  const totalCount = issues.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Issues</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <IconSearch size={12} color="var(--color-text-tertiary)" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <IconPlus size={12} color="currentColor" />
            <span>New issue</span>
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarCount}>
            {totalCount} issue{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.toolbarBtn}>Filters</button>
          <div className={styles.toolbarDivider} />
          <button className={styles.toolbarBtn}>Display</button>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading && (
          <div className={styles.state}>Loading issues...</div>
        )}
        {isError && (
          <div className={styles.state}>
            Failed to load issues. Is the backend running?
          </div>
        )}
        {!isLoading && !isError && totalCount === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              {search ? `No issues matching "${search}"` : 'No issues yet'}
            </p>
            {!search && (
              <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                <IconPlus size={12} />
                Create your first issue
              </button>
            )}
          </div>
        )}
        {!isLoading && !isError && STATUS_ORDER.map(status => (
          <IssueGroup
            key={status}
            status={status}
            issues={grouped[status]}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
