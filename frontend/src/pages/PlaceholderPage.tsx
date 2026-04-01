import React from 'react';
import styles from './PlaceholderPage.module.css';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className={styles.page}>
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
    </div>
    <div className={styles.content}>
      <p>Coming soon</p>
    </div>
  </div>
);
