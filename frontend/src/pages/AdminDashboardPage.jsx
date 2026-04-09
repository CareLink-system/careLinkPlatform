import React from 'react'
import ProtectedRoute from '../components/dashboard/ProtectedRoute'
import RoleDashboardContent from '../components/dashboard/RoleDashboardContent'

const adminDashboardConfig = {
  title: 'Admin Dashboard',
  subtitle: 'Monitor users, roles, and service health from a single control center.',
  heroBadge: 'Platform Oversight',
  heroTitle: 'Keep the platform healthy, secure, and organized.',
  heroCopy: 'Track active users, review access requests, and react quickly when a service or workflow needs attention.',
  heroTags: ['Users', 'Roles', 'System Health'],
  heroStats: [
    { label: 'Users', value: '1.2k' },
    { label: 'Flags', value: '8' },
    { label: 'Healthy', value: '6/7' },
  ],
  stats: [
    { label: 'Active users', value: '1,248', description: 'Accounts active in the last 30 days', delta: '+42 this week' },
    { label: 'Pending requests', value: '14', description: 'Role changes and access reviews', delta: '5 urgent' },
    { label: 'Services online', value: '7/7', description: 'Core services responding normally', delta: 'All green' },
  ],
  focusTitle: 'Administration queue',
  focusSubtitle: 'The items that need a platform owner’s attention.',
  focusAction: 'Open console',
  focusItems: [
    { title: 'Role requests', description: 'Approve or reject pending access changes from the admin team.', meta: '14 items' },
    { title: 'Security review', description: 'Inspect suspicious activity and login anomalies.', meta: '2 alerts' },
    { title: 'Service checks', description: 'Verify API and background jobs are healthy.', meta: 'Healthy' },
    { title: 'Audit trail', description: 'Review the latest privileged operations and config changes.', meta: 'Fresh' },
  ],
  actionsTitle: 'Quick actions',
  actionsSubtitle: 'Common admin tasks surfaced as fast shortcuts.',
  actions: [
    { label: 'Manage users', description: 'Search, update, and activate accounts.', icon: '👥' },
    { label: 'Adjust roles', description: 'Assign patient, doctor, or admin access.', icon: '🛡' },
    { label: 'Inspect logs', description: 'Review recent platform events.', icon: '🧾' },
  ],
  activityTitle: 'Recent activity',
  activitySubtitle: 'Recent platform and access events.',
  activity: [
    { title: 'User role updated', description: 'Doctor access assigned to a verified account.', time: '3m', icon: '🛡' },
    { title: 'Service health check passed', description: 'Gateway and auth services responded normally.', time: '12m', icon: '✓' },
    { title: 'New account approved', description: 'A pending request moved to active status.', time: '35m', icon: '⤴' },
  ],
  summaryTitle: 'Platform snapshot',
  summarySubtitle: 'Quick indicators for the current environment.',
  summaryItems: [
    { label: 'Uptime', value: '99.98%', note: 'Stable' },
    { label: 'Open alerts', value: '2', note: 'Needs attention' },
    { label: 'Audit depth', value: '24h', note: 'Fresh logs' },
  ],
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']} redirectTo="/admin-dashboard">
      <RoleDashboardContent config={adminDashboardConfig} />
    </ProtectedRoute>
  )
}
