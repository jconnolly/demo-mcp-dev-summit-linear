import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/issues" replace />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route path="/my-issues" element={<PlaceholderPage title="My Issues" />} />
          <Route path="/inbox" element={<PlaceholderPage title="Inbox" />} />
          <Route path="/projects" element={<PlaceholderPage title="Projects" />} />
          <Route path="/views" element={<PlaceholderPage title="Views" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
