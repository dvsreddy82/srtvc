// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PETS: 'pets',
  BOOKINGS: 'bookings',
  MEDICAL_RECORDS: 'medical_records',
  VACCINES: 'vaccines',
  KENNELS: 'kennels',
  KENNEL_RUNS: 'kennel_runs',
  REVIEWS: 'reviews',
  STAFF_ASSIGNMENTS: 'staff_assignments',
  ADMIN_AUDIT_LOGS: 'admin_audit_logs',
  SYSTEM_METRICS: 'system_metrics',
  STAY_UPDATES: 'stay_updates',
  INVOICES: 'invoices',
  PET_CONSENTS: 'pet_consents',
  MASTER_DATA: 'master_data',
} as const;

// Storage paths
export const STORAGE_PATHS = {
  PET_PHOTOS: 'pet_photos',
  VACCINE_DOCUMENTS: 'vaccine_documents',
  STAY_PHOTOS: 'stay_photos',
  INVOICES: 'invoices',
} as const;

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  CHECKED_OUT: 'checked-out',
  CANCELLED: 'cancelled',
} as const;

// User roles
export const USER_ROLES = {
  PET_OWNER: 'petOwner',
  STAFF: 'staff',
  MANAGER: 'manager',
  VETERINARIAN: 'veterinarian',
  ADMIN: 'admin',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

// Image compression
export const IMAGE_CONFIG = {
  MAX_WIDTH: 800,
  MAX_HEIGHT: 800,
  QUALITY: 0.85,
  MAX_SIZE_MB: 1,
} as const;

// Sync intervals (in milliseconds)
export const SYNC_INTERVALS = {
  STAY_UPDATES: 15 * 60 * 1000, // 15 minutes
  DAILY: 24 * 60 * 60 * 1000, // 24 hours
  WEEKLY: 7 * 24 * 60 * 60 * 1000, // 7 days
  MONTHLY: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

