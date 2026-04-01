import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconMyIssues, IconInbox, IconProjects, IconViews,
  IconIssues, IconSettings, IconHash, IconTeam
} from './icons';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/inbox', icon: IconInbox, label: 'Inbox' },
  { to: '/my-issues', icon: IconMyIssues, label: 'My Issues' },
];

const TEAM_NAV_ITEMS = [
  { to: '/issues', icon: IconIssues, label: 'Issues' },
  { to: '/projects', icon: IconProjects, label: 'Projects' },
  { to: '/views', icon: IconViews, label: 'Views' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.workspaceHeader}>
        <div className={styles.workspaceLogo}>
          <span>E</span>
        </div>
        <span className={styles.workspaceName}>Engineering</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Icon size={16} color="currentColor" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className={styles.navSectionDivider} />

        <div className={styles.navSection}>
          <div className={styles.teamHeader}>
            <div className={styles.teamIcon}>E</div>
            <span className={styles.teamName}>Engineering</span>
          </div>

          {TEAM_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${styles.navItemIndented} ${
                  (isActive || (to === '/issues' && location.pathname === '/')) ? styles.navItemActive : ''
                }`
              }
            >
              <Icon size={16} color="currentColor" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
        >
          <IconSettings size={16} color="currentColor" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
