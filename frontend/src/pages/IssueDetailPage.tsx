import React, { useState, useCallback } from 'react';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi, labelsApi } from '../api';
import { IssueStatus, IssuePriority, Label } from '../types';
import { StatusIcon, STATUS_OPTIONS } from '../components/StatusIcon';
import { PriorityIcon, PRIORITY_OPTIONS } from '../components/PriorityIcon';
import { IconClose, IconChevronDown, IconTrash, IconComment } from '../components/icons';
import { formatDistanceToNow } from 'date-fns';
import styles from './IssueDetailPage.module.css';

export const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: issue, isLoading, isError } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.get(Number(id)),
    enabled: !!id,
  });

  const { data: allLabels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: labelsApi.list,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<{ title: string; description: string; status: IssueStatus; priority: IssuePriority; label_ids: number[] }>) =>
      issuesApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => issuesApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      navigate('/issues');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => issuesApi.addComment(Number(id), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      setCommentBody('');
    },
  });

  if (isLoading) return <div className={styles.state}>Loading...</div>;
  if (isError || !issue) return <div className={styles.state}>Issue not found</div>;

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== issue.title) {
      updateMutation.mutate({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescSave = () => {
    if (editDesc !== issue.description) {
      updateMutation.mutate({ description: editDesc });
    }
    setIsEditingDesc(false);
  };

  const toggleLabel = (labelId: number) => {
    const currentIds = issue.labels.map((l: Label) => l.id);
    const newIds = currentIds.includes(labelId)
      ? currentIds.filter((id: number) => id !== labelId)
      : [...currentIds, labelId];
    updateMutation.mutate({ label_ids: newIds });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button className={styles.breadcrumbLink} onClick={() => navigate('/issues')}>
            Issues
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.identifier}>{issue.identifier}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.deleteBtn}
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete issue"
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.mainContent}>
          {/* Title */}
          {isEditingTitle ? (
            <input
              autoFocus
              className={styles.titleInput}
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setIsEditingTitle(false); }}
            />
          ) : (
            <h1
              className={styles.title}
              onClick={() => { setEditTitle(issue.title); setIsEditingTitle(true); }}
              title="Click to edit"
            >
              {issue.title}
            </h1>
          )}

          {/* Description */}
          {isEditingDesc ? (
            <div className={styles.descEditContainer}>
              <textarea
                autoFocus
                className={styles.descTextarea}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={6}
              />
              <div className={styles.descBtns}>
                <button className={styles.descSaveBtn} onClick={handleDescSave}>Save</button>
                <button className={styles.descCancelBtn} onClick={() => setIsEditingDesc(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div
              className={styles.description}
              onClick={() => { setEditDesc(issue.description || ''); setIsEditingDesc(true); }}
              title="Click to edit"
            >
              {issue.description
                ? <p>{issue.description}</p>
                : <span className={styles.descPlaceholder}>Add description...</span>
              }
            </div>
          )}

          {/* Comments */}
          <div className={styles.commentsSection}>
            <div className={styles.commentsSectionHeader}>
              <IconComment size={13} color="var(--color-text-tertiary)" />
              <span>Comments</span>
              <span className={styles.commentsCount}>{issue.comments?.length ?? 0}</span>
            </div>

            {issue.comments?.map(comment => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentAvatar}>
                  {comment.author_name[0].toUpperCase()}
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.author_name}</span>
                    <span className={styles.commentTime}>
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={styles.commentBody}>{comment.body}</p>
                </div>
              </div>
            ))}

            <div className={styles.addComment}>
              <div className={styles.commentAvatar}>Y</div>
              <div className={styles.addCommentInput}>
                <textarea
                  placeholder="Leave a comment..."
                  value={commentBody}
                  onChange={e => setCommentBody(e.target.value)}
                  className={styles.commentTextarea}
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && commentBody.trim()) {
                      commentMutation.mutate(commentBody);
                    }
                  }}
                />
                {commentBody.trim() && (
                  <button
                    className={styles.commentSubmitBtn}
                    onClick={() => commentMutation.mutate(commentBody)}
                    disabled={commentMutation.isPending}
                  >
                    {commentMutation.isPending ? 'Saving...' : 'Save (⌘↵)'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar metadata */}
        <div className={styles.sidebar}>
          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Status</span>
            <div className={styles.metaItem}>
              <button
                className={styles.metaBtn}
                onClick={() => { setShowStatusMenu(v => !v); setShowPriorityMenu(false); setShowLabelMenu(false); }}
              >
                <StatusIcon status={issue.status} size={13} />
                <span>{STATUS_OPTIONS.find(o => o.value === issue.status)?.label}</span>
                <IconChevronDown size={10} />
              </button>
              {showStatusMenu && (
                <div className={styles.dropdown}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`${styles.dropdownItem} ${issue.status === opt.value ? styles.dropdownItemActive : ''}`}
                      onClick={() => { updateMutation.mutate({ status: opt.value }); setShowStatusMenu(false); }}
                    >
                      <StatusIcon status={opt.value} size={13} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Priority</span>
            <div className={styles.metaItem}>
              <button
                className={styles.metaBtn}
                onClick={() => { setShowPriorityMenu(v => !v); setShowStatusMenu(false); setShowLabelMenu(false); }}
              >
                <PriorityIcon priority={issue.priority} size={13} />
                <span>{PRIORITY_OPTIONS.find(o => o.value === issue.priority)?.label}</span>
                <IconChevronDown size={10} />
              </button>
              {showPriorityMenu && (
                <div className={styles.dropdown}>
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`${styles.dropdownItem} ${issue.priority === opt.value ? styles.dropdownItemActive : ''}`}
                      onClick={() => { updateMutation.mutate({ priority: opt.value }); setShowPriorityMenu(false); }}
                    >
                      <PriorityIcon priority={opt.value} size={13} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Labels</span>
            <div className={styles.metaItem}>
              <button
                className={styles.metaBtn}
                onClick={() => { setShowLabelMenu(v => !v); setShowStatusMenu(false); setShowPriorityMenu(false); }}
              >
                {issue.labels.length === 0 ? (
                  <span className={styles.metaBtnPlaceholder}>Add label</span>
                ) : (
                  <div className={styles.labelsDisplay}>
                    {issue.labels.map((l: Label) => (
                      <span key={l.id} className={styles.labelChip} style={{
                        color: l.color,
                        backgroundColor: hexToRgba(l.color, 0.1),
                        border: `1px solid ${hexToRgba(l.color, 0.22)}`,
                      }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
                <IconChevronDown size={10} />
              </button>
              {showLabelMenu && (
                <div className={styles.dropdown}>
                  {allLabels.map((label: Label) => (
                    <button
                      key={label.id}
                      className={`${styles.dropdownItem} ${issue.labels.some((l: Label) => l.id === label.id) ? styles.dropdownItemActive : ''}`}
                      onClick={() => toggleLabel(label.id)}
                    >
                      <span className={styles.labelDot} style={{ backgroundColor: label.color }} />
                      <span>{label.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.metaDivider} />

          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Created</span>
            <span className={styles.metaValue}>
              {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className={styles.metaGroup}>
            <span className={styles.metaLabel}>Updated</span>
            <span className={styles.metaValue}>
              {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Delete issue?</h3>
            <p className={styles.confirmText}>
              This will permanently delete <strong>{issue.identifier}</strong>. This action cannot be undone.
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmCancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
