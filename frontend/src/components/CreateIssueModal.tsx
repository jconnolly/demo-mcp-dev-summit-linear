import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issuesApi, labelsApi } from '../api';
import { IssueStatus, IssuePriority, Label } from '../types';
import { StatusIcon, STATUS_OPTIONS } from './StatusIcon';
import { PriorityIcon, PRIORITY_OPTIONS } from './PriorityIcon';
import { IconClose, IconChevronDown } from './icons';
import styles from './CreateIssueModal.module.css';

interface CreateIssueModalProps {
  onClose: () => void;
}

export const CreateIssueModal = ({ onClose }: CreateIssueModalProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('backlog');
  const [priority, setPriority] = useState<IssuePriority>('no_priority');
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const { data: labels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: labelsApi.list,
  });

  const mutation = useMutation({
    mutationFn: issuesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      onClose();
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate({
      title: title.trim(),
      description,
      status,
      priority,
      label_ids: selectedLabelIds,
    });
  };

  const toggleLabel = (labelId: number) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  const selectedLabels = labels.filter((l: Label) => selectedLabelIds.includes(l.id));

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Create Issue">
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Create Issue</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconClose size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formBody}>
            <input
              ref={titleRef}
              type="text"
              className={styles.titleInput}
              placeholder="Issue title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <textarea
              className={styles.descriptionInput}
              placeholder="Add description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.metaRow}>
            {/* Status */}
            <div className={styles.metaItem}>
              <button
                type="button"
                className={styles.metaBtn}
                onClick={() => { setShowStatusMenu(v => !v); setShowPriorityMenu(false); setShowLabelMenu(false); }}
              >
                <StatusIcon status={status} size={13} />
                <span>{STATUS_OPTIONS.find(o => o.value === status)?.label}</span>
                <IconChevronDown size={10} />
              </button>
              {showStatusMenu && (
                <div className={styles.dropdown}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownItem} ${status === opt.value ? styles.dropdownItemActive : ''}`}
                      onClick={() => { setStatus(opt.value); setShowStatusMenu(false); }}
                    >
                      <StatusIcon status={opt.value} size={13} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className={styles.metaItem}>
              <button
                type="button"
                className={styles.metaBtn}
                onClick={() => { setShowPriorityMenu(v => !v); setShowStatusMenu(false); setShowLabelMenu(false); }}
              >
                <PriorityIcon priority={priority} size={13} />
                <span>{PRIORITY_OPTIONS.find(o => o.value === priority)?.label}</span>
                <IconChevronDown size={10} />
              </button>
              {showPriorityMenu && (
                <div className={styles.dropdown}>
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownItem} ${priority === opt.value ? styles.dropdownItemActive : ''}`}
                      onClick={() => { setPriority(opt.value); setShowPriorityMenu(false); }}
                    >
                      <PriorityIcon priority={opt.value} size={13} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Labels */}
            <div className={styles.metaItem}>
              <button
                type="button"
                className={styles.metaBtn}
                onClick={() => { setShowLabelMenu(v => !v); setShowStatusMenu(false); setShowPriorityMenu(false); }}
              >
                {selectedLabels.length === 0 ? (
                  <span className={styles.metaBtnPlaceholder}>Label</span>
                ) : (
                  <span>{selectedLabels.map((l: Label) => l.name).join(', ')}</span>
                )}
                <IconChevronDown size={10} />
              </button>
              {showLabelMenu && (
                <div className={styles.dropdown}>
                  {labels.map((label: Label) => (
                    <button
                      key={label.id}
                      type="button"
                      className={`${styles.dropdownItem} ${selectedLabelIds.includes(label.id) ? styles.dropdownItemActive : ''}`}
                      onClick={() => toggleLabel(label.id)}
                    >
                      <span
                        className={styles.labelDot}
                        style={{ backgroundColor: label.color }}
                      />
                      <span>{label.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!title.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Creating...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
