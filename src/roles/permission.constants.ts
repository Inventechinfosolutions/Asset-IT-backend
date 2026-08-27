export const Permissions = {
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_ACTIVATE: 'users.activate',
  REQUESTS_VIEW_ALL: 'requests.view_all',
  REQUESTS_VIEW_OWN: 'requests.view_own',
  REQUESTS_CREATE: 'requests.create',
  REQUESTS_APPROVE: 'requests.approve',
  DASHBOARD_VIEW: 'dashboard.view',
} as const;

export type PermissionName = (typeof Permissions)[keyof typeof Permissions];
