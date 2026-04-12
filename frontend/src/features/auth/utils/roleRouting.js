const ROLE_ROUTES = {
  patient: '/dashboard',
  doctor: '/doctor-dashboard',
  admin: '/admin-dashboard',
}

const ROLE_LABELS = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
}

export function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase()
  return ROLE_LABELS[value] ? value : 'patient'
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)]
}

export function getDashboardRoute(role) {
  return ROLE_ROUTES[normalizeRole(role)]
}

export function getAllowedRoles(roleList = []) {
  return roleList.map(normalizeRole)
}
