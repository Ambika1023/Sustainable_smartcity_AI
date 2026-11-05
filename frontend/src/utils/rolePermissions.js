export const PERMISSIONS = {
  VIEW_ALL_COMPLAINTS: ['SUPER_ADMIN', 'CITY_ADMIN'],
  MANAGE_COMPLAINTS: ['SUPER_ADMIN', 'CITY_ADMIN', 'DEPARTMENT_OFFICER'],
  MANAGE_USERS: ['SUPER_ADMIN'],
  MANAGE_DEPARTMENTS: ['SUPER_ADMIN', 'CITY_ADMIN'],
  VIEW_ANALYTICS: ['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'],
  VIEW_PREDICTIONS: ['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'],
  TRAIN_MODELS: ['SUPER_ADMIN', 'DATA_ANALYST'],
  MANAGE_DOCUMENTS: ['SUPER_ADMIN', 'CITY_ADMIN'],
  VIEW_AUDIT_LOGS: ['SUPER_ADMIN'],
  EXPORT_DATA: ['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'],
  SEED_DATA: ['SUPER_ADMIN'],
  MANAGE_RECOMMENDATIONS: ['SUPER_ADMIN', 'CITY_ADMIN'],
  VIEW_ANOMALIES: ['SUPER_ADMIN', 'CITY_ADMIN', 'DATA_ANALYST'],
  DETECT_ANOMALIES: ['SUPER_ADMIN', 'DATA_ANALYST'],
  ASSIGN_COMPLAINTS: ['SUPER_ADMIN', 'CITY_ADMIN'],
  UPDATE_COMPLAINT_STATUS: ['SUPER_ADMIN', 'CITY_ADMIN', 'DEPARTMENT_OFFICER'],
}

export function hasPermission(userRole, permission) {
  return PERMISSIONS[permission]?.includes(userRole) ?? false
}

export function getRoleDisplayName(role) {
  const names = {
    SUPER_ADMIN: 'Super Administrator',
    CITY_ADMIN: 'City Administrator',
    DEPARTMENT_OFFICER: 'Department Officer',
    DATA_ANALYST: 'Data Analyst',
  }
  return names[role] || role
}

export function getRoleColor(role) {
  const colors = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    CITY_ADMIN: 'bg-blue-100 text-blue-700',
    DEPARTMENT_OFFICER: 'bg-green-100 text-green-700',
    DATA_ANALYST: 'bg-purple-100 text-purple-700',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

export function getRoleBadgeVariant(role) {
  const variants = {
    SUPER_ADMIN: 'red',
    CITY_ADMIN: 'blue',
    DEPARTMENT_OFFICER: 'green',
    DATA_ANALYST: 'purple',
  }
  return variants[role] || 'gray'
}
