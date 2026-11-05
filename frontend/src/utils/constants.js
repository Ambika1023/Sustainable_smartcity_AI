export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CITY_ADMIN: 'CITY_ADMIN',
  DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
  DATA_ANALYST: 'DATA_ANALYST',
}

export const COMPLAINT_STATUSES = {
  SUBMITTED: { label: 'Submitted', color: 'blue' },
  UNDER_REVIEW: { label: 'Under Review', color: 'yellow' },
  ASSIGNED: { label: 'Assigned', color: 'purple' },
  IN_PROGRESS: { label: 'In Progress', color: 'orange' },
  RESOLVED: { label: 'Resolved', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
}

export const COMPLAINT_PRIORITIES = {
  LOW: { label: 'Low', color: 'gray' },
  MEDIUM: { label: 'Medium', color: 'blue' },
  HIGH: { label: 'High', color: 'orange' },
  CRITICAL: { label: 'Critical', color: 'red' },
}

export const COMPLAINT_CATEGORIES = [
  'Waste Management',
  'Water Supply',
  'Electricity',
  'Road Infrastructure',
  'Air Pollution',
  'Drainage',
  'Traffic Management',
  'Public Sanitation',
  'Street Lighting',
  'Other',
]

export const DEPARTMENTS_LIST = [
  'Waste Management',
  'Water Supply',
  'Electricity',
  'Road and Infrastructure',
  'Environmental Protection',
  'Public Health and Sanitation',
  'Traffic Management',
]

export const DOCUMENT_CATEGORIES = [
  'Policy',
  'Report',
  'Guidelines',
  'Budget',
  'Environmental',
  'Infrastructure',
  'Public Health',
  'Circular',
  'Other',
]

export const ANOMALY_SEVERITIES = {
  LOW: { label: 'Low', color: 'gray' },
  MEDIUM: { label: 'Medium', color: 'yellow' },
  HIGH: { label: 'High', color: 'orange' },
  CRITICAL: { label: 'Critical', color: 'red' },
}

export const ANOMALY_STATUSES = {
  DETECTED: { label: 'Detected', color: 'red' },
  UNDER_INVESTIGATION: { label: 'Under Investigation', color: 'yellow' },
  RESOLVED: { label: 'Resolved', color: 'green' },
  FALSE_POSITIVE: { label: 'False Positive', color: 'gray' },
}

export const RECOMMENDATION_PRIORITIES = {
  LOW: { label: 'Low', color: 'gray' },
  MEDIUM: { label: 'Medium', color: 'blue' },
  HIGH: { label: 'High', color: 'orange' },
  CRITICAL: { label: 'Critical', color: 'red' },
}

export const RECOMMENDATION_STATUSES = {
  PENDING: { label: 'Pending', color: 'yellow' },
  APPROVED: { label: 'Approved', color: 'blue' },
  IMPLEMENTING: { label: 'Implementing', color: 'purple' },
  COMPLETED: { label: 'Completed', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
}

export const PREDICTION_TYPES = [
  { value: 'water-demand', label: 'Water Demand' },
  { value: 'electricity', label: 'Electricity Consumption' },
  { value: 'waste-generation', label: 'Waste Generation' },
  { value: 'complaint-volume', label: 'Complaint Volume' },
  { value: 'sustainability', label: 'Sustainability Performance' },
]

export const WARDS = [
  { value: '', label: 'All Wards' },
  { value: '1', label: 'Ward 1' },
  { value: '2', label: 'Ward 2' },
  { value: '3', label: 'Ward 3' },
  { value: '4', label: 'Ward 4' },
  { value: '5', label: 'Ward 5' },
  { value: '6', label: 'Ward 6' },
  { value: '7', label: 'Ward 7' },
  { value: '8', label: 'Ward 8' },
]

export const NOTIFICATION_TYPES = {
  COMPLAINT: 'COMPLAINT',
  ANOMALY: 'ANOMALY',
  SYSTEM: 'SYSTEM',
  ALERT: 'ALERT',
  RECOMMENDATION: 'RECOMMENDATION',
}
