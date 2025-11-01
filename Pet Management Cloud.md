**User Stories — Pet Management Cloud (Flutter + Firebase Architecture)**

**Platform Stack:**
- **Frontend Framework:** Flutter (Dart) - Single Codebase for iOS, Android, Web, and Desktop
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore (NoSQL)
- **Storage:** Firebase Storage
- **Functions:** Cloud Functions (2nd gen)
- **Scheduling:** Cloud Scheduler
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Hosting:** Firebase Hosting (Web) / App Stores (Mobile)
- **Email:** Cloud Functions + Resend/SendGrid Integration

**Cost Optimization Targets:** $4-11/month (Medium Scale)

**Flutter Architecture Benefits:**
- ✅ **Single Codebase:** Write once, deploy to iOS, Android, Web, macOS, Windows, Linux
- ✅ **Native Performance:** Compiles to native ARM code (not JavaScript bridge)
- ✅ **Excellent Firebase Support:** Official Firebase Flutter plugins maintained by Firebase team
- ✅ **Hot Reload:** Fast development with instant code updates
- ✅ **Rich UI Components:** Material Design and Cupertino widgets built-in
- ✅ **Offline First:** Perfect for Firestore offline persistence requirements

---

**1. Pet Owner Stories**

| ID | User Story | Acceptance Criteria | Firebase Services | Optimization Notes |
| ----- | ----- | ----- | ----- | ----- |
| PO-01 | As a pet owner, I want to create an account so that I can securely log in and manage my pets. | - Firebase Auth signup & email verification works via Flutter `firebase_auth` package.<br>- User profile stored in Firestore `/users/{userId}` using `cloud_firestore`.<br>- JWT token issued via Firebase Auth automatically handled.<br>- Offline persistence enabled using Firestore `Settings(persistenceEnabled: true)` in Flutter. | Firebase Auth<br>Cloud Firestore | Use email/password auth (free <10K users). Enable Firestore offline persistence via `firestore.settings` in Flutter initialization. Cache user profile locally with Hive for instant access. |
| PO-02 | As a pet owner, I want to register my pet's details so that I can track its information in one place. | - Flutter form with TextFields for pet name, species, breed, DOB, weight.<br>- Photo selection via `image_picker` package, compression using `image` package.<br>- **Data saved to Hive local database (primary)**, then synced to Firestore in background.<br>- Photo uploaded to Firebase Storage via `firebase_storage` with automatic compression.<br>- Confirmation displayed from local Hive cache (instant, no cloud read). | Cloud Firestore<br>Firebase Storage<br>Cloud Functions<br>Hive (Local) | **Local-First:** Store pets in Hive, read from local always. Sync to Firestore only on create/update. Reduces reads by ~95%. Compress images client-side (800px width, 85% quality). Use `ListView.builder` for efficient rendering. |
| PO-03 | As a pet owner, I want to upload vaccine documents or photos so I can maintain health records digitally. | - Upload via Firebase Storage with security rules.<br>- Metadata stored in Firestore `/medical_records/{recordId}` with `petId` reference.<br>- Record linked to pet profile via Firestore reference.<br>- Automatic thumbnail generation via Cloud Function. | Firebase Storage<br>Cloud Firestore<br>Cloud Functions | Use storage security rules to restrict access. Generate thumbnails on upload to reduce bandwidth. Use batch writes to create record + metadata atomically. |
| PO-04 | As a pet owner, I want to view my pet's upcoming vaccine and health due dates so I can stay informed. | - **Vaccine schedule stored in local SQLite**, calculated from local pet data (no cloud query).<br>- Display from local database instantly, sync vaccine data monthly from Firestore.<br>- FCM push notifications configured for reminders (server-side).<br>- Email notifications via Cloud Function + Resend. | Cloud Firestore<br>FCM<br>Cloud Functions<br>Cloud Scheduler<br>SQLite (Local) | **Local-First:** Store vaccine schedule in SQLite, calculate due dates locally. Sync vaccine data monthly. Reduces reads by ~95%. FCM reminders triggered server-side (Cloud Function). Batch notification sends. |
| PO-05 | As a pet owner, I want to search available kennels based on my pet's size and dates so that I can book a stay. | - **Kennel master data stored in local Hive** (synced weekly). Search runs locally first.<br>- Only query Firestore for real-time availability (status changes).<br>- Returns available runs using local SQLite queries for historical bookings.<br>- Results paginated (limit 20 per page) from local cache. | Cloud Firestore<br>Hive (Local)<br>SQLite (Local) | **Local-First:** Store kennel data in Hive (weekly sync). Search locally. Only query Firestore for current availability status. Reduces reads by ~80%. Use composite indexes for availability queries only. |
| PO-06 | As a pet owner, I want to make a kennel booking and receive confirmation. | - Booking created in Firestore `/bookings/{bookingId}` with status "pending".<br>- Payment flow completes (integrate Stripe/PayPal webhook).<br>- Status updated to "confirmed" via Cloud Function trigger.<br>- Confirmation sent via FCM push + email (Resend) simultaneously.<br>- Real-time booking update visible to staff. | Cloud Firestore<br>Cloud Functions<br>FCM<br>Resend API | Use Firestore transactions for atomic booking creation + availability update. Batch notification sends. Cache booking status client-side. Use Cloud Function to process payment webhooks asynchronously. |
| PO-07 | As a pet owner, I want to receive updates during my pet's stay so I know how my pet is doing. | - **Stay updates stored in local SQLite** (primary source). Sync from Firestore every 15 minutes (batch).<br>- Display from local database instantly, background sync updates local cache.<br>- FCM push via `firebase_messaging` package handles foreground/background notifications (triggers local refresh).<br>- Daily notes displayed with `ListView.builder` from local SQLite, pagination (20 items per page).<br>- Photos auto-compressed using Flutter `image` package before upload. | Cloud Firestore<br>Cloud Functions<br>FCM<br>Firebase Storage<br>SQLite (Local) | **Local-First:** Store stay updates in SQLite, read from local always. Batch sync every 15 min from Firestore. Reduces reads by ~85%. FCM notifications trigger local refresh. Compress photos client-side (800px width). Use `cached_network_image` for thumbnails. |
| PO-08 | As a pet owner, I want to view invoices and past bookings for tracking expenses. | - **Invoices cached locally in file system** (download once, cache forever). PDFs stored locally after first download.<br>- **Past bookings stored in local SQLite** (sync once, never re-read from cloud).<br>- Invoice metadata synced from Firestore on login only.<br>- All queries run from local database (zero cloud reads after initial sync). | Firebase Storage<br>Firebase Storage<br>Firestore<br>Cloud Functions<br>SQLite (Local)<br>File System | **Local-First:** Invoices downloaded once and cached forever in local file system. Past bookings in SQLite (sync once). Reduces reads by ~100% for past data. Only sync new invoices on demand. Use composite index on `userId + createdAt` for initial sync only. |
| PO-09 | As a pet owner, I want to rate and review kennel stays. | - Review stored in Firestore `/reviews/{reviewId}` with `bookingId` reference.<br>- Linked to booking with Firestore reference (immutable).<br>- Staff cannot edit reviews (security rules enforce).<br>- Reviews queryable with pagination and rating filters. | Cloud Firestore | Use Firestore security rules: `allow write: if request.auth.uid == resource.data.userId && !exists(/databases/$(database)/documents/reviews/$(reviewId))`. Create index on `kennelId + rating` for filtering. Cache review averages. |

**2. Kennel Staff Stories**

| ID | User Story | Acceptance Criteria | Firebase Services | Optimization Notes |
| ----- | ----- | ----- | ----- | ----- |
| KS-01 | As a staff member, I want to view today's scheduled check-ins so I can prepare for arrivals. | - **Today's bookings stored in local SQLite** (primary source). Sync once in morning, refresh only on status change.<br>- Query local SQLite for bookings filtered by date and status (instant, no cloud read).<br>- Real-time sync only when booking status changes (via FCM notification).<br>- Flutter UI with `ListView.builder` from local database with optimistic updates. | Cloud Firestore<br>SQLite (Local)<br>FCM | **Local-First:** Store bookings in SQLite, load from local always. Sync once in morning, refresh on status changes via FCM. Reduces reads by ~70%. Use composite index for morning sync only. Display from local instantly. |
| KS-02 | As a staff member, I want to check-in a pet and record condition or notes. | - Status changes to "checked-in" via Firestore transaction (atomic update).<br>- Notes saved under `/bookings/{bookingId}/notes` subcollection.<br>- Owner notified via FCM + email via Cloud Function trigger.<br>- Real-time update visible to owner immediately. | Cloud Firestore<br>Cloud Functions<br>FCM | Use Firestore transactions to update booking + availability atomically. Batch notification send. Store notes as subcollection for better organization. Use optimistic updates in UI. |
| KS-03 | As a staff member, I want to upload daily photos and notes during a pet's stay. | - Photos uploaded to Firebase Storage `/stay_photos/{bookingId}/{timestamp}`.<br>- Metadata written to Firestore `/stay_updates/{updateId}`.<br>- Cloud Function triggered on Storage upload sends FCM notification to owner.<br>- Notes timestamped automatically via Firestore server timestamp.<br>- Photos auto-compressed and thumbnail generated. | Firebase Storage<br>Cloud Functions<br>Cloud Firestore<br>FCM | Compress images client-side before upload. Generate thumbnails via Cloud Function (reduces bandwidth). Use batch writes for photo metadata + update record. Batch notifications (not per-photo). Store thumbnails separately for list views. |
| KS-04 | As a staff member, I want to check-out a pet and generate a summary report. | - Status changes to "checked-out" via Firestore transaction.<br>- Cloud Function triggered to generate PDF invoice from Firestore data.<br>- Invoice saved to Firebase Storage and metadata to Firestore.<br>- Owner notified via FCM + email with invoice link.<br>- Booking availability released atomically. | Cloud Firestore<br>Cloud Functions<br>Firebase Storage<br>FCM | Generate invoice PDF asynchronously (don't block checkout). Use Firestore transaction for checkout + availability release. Cache invoice template. Send notifications after PDF generation completes. |

**3. Kennel Manager Stories**

| ID | User Story | Acceptance Criteria | Firebase Services | Optimization Notes |
| ----- | ----- | ----- | ----- | ----- |
| KM-01 | As a manager, I want to configure kennel capacity and runs so the system knows available slots. | - Runs created in Firestore `/kennel_runs/{runId}` with capacity fields.<br>- Availability calculated via Firestore aggregation queries (where supported) or Cloud Function.<br>- Real-time updates when runs are booked/available.<br>- Changes logged to `/audit_logs` collection. | Cloud Firestore<br>Cloud Functions | Cache run configurations (changes rarely). Use Firestore references for run → booking relationships. Pre-calculate availability in run document for faster queries. Use Cloud Function to maintain availability counters. |
| KM-02 | As a manager, I want to view reports of bookings, occupancy, and revenue. | - Aggregated views via Firestore queries with date ranges.<br>- Data exported to CSV via Cloud Function (generates on-demand).<br>- Dashboard uses Firestore real-time listeners for live updates.<br>- Reports cached for 15 minutes to reduce reads.<br>- Use Firestore aggregation queries where possible. | Cloud Firestore<br>Cloud Functions | Generate reports on-demand (not stored). Use Firestore composite indexes for date range queries. Cache aggregation results in Cloud Function memory (5 min TTL). Use pagination for large datasets. Consider storing daily summaries in Firestore for historical reports. |
| KM-03 | As a manager, I want to manage staff permissions and schedules. | - Staff roles managed via Firebase Auth custom claims (set via Admin SDK in Cloud Function).<br>- Staff assignments stored in Firestore `/staff_assignments/{assignmentId}`.<br>- Real-time schedule visible to staff via Firestore listeners.<br>- Changes trigger notifications via FCM. | Firebase Auth<br>Cloud Firestore<br>Cloud Functions<br>FCM | Use custom claims for role-based access (more efficient than querying Firestore). Cache staff assignments client-side. Batch permission updates. Use Firestore security rules based on custom claims. |

**4. Veterinarian / Clinic Stories**

| ID | User Story | Acceptance Criteria | Firebase Services | Optimization Notes |
| ----- | ----- | ----- | ----- | ----- |
| VC-01 | As a veterinarian, I want to submit or update a pet's medical record securely. | - Authenticated via Firebase Auth custom claim "veterinarian" role.<br>- Pet owner consent verified via Firestore `/pet_consents/{petId}` document.<br>- Medical record stored in Firestore `/medical_records/{recordId}` with `petId` reference.<br>- Data linked to pet profile with server timestamp.<br>- Access logged to audit collection. | Firebase Auth<br>Cloud Firestore<br>Cloud Functions | Use Firestore security rules: `allow write: if request.auth.token.role == 'veterinarian' && exists(/databases/$(database)/documents/pet_consents/$(petId))`. Store consent records separately for faster checks. Cache consent status. |
| VC-02 | As a clinic, I want to send vaccination records automatically via API webhook. | - Secure Cloud Function endpoint with API key authentication (stored in Firebase Config).<br>- Payload validated and signed (HMAC verification).<br>- Record created in Firestore via Cloud Function.<br>- Pet owner notified via FCM.<br>- Webhook response confirms receipt. | Cloud Functions<br>Cloud Firestore<br>FCM | Use Cloud Functions 2nd gen for better performance. Store API keys in Firebase Config (secure). Validate payload size. Use batch writes for multiple records. Rate limit webhook calls. Return 200 quickly, process asynchronously. |
| VC-03 | As a vet, I want to see medical history for a specific pet. | - Authorized view via Firestore security rules checking veterinarian role + clinic association.<br>- Medical records queryable with `petId` filter and date sorting.<br>- Only visible for linked clinics (checked via `/clinic_pet_links/{linkId}`).<br>- Paginated results with 20 records per page. | Cloud Firestore | Use composite index on `petId + createdAt`. Implement pagination with `limit()` and `startAfter()`. Cache clinic-pet links. Use Firestore security rules for authorization (server-side enforcement). |

**5. Platform Admin Stories**

| ID | User Story | Acceptance Criteria | Firebase Services | Optimization Notes |
| ----- | ----- | ----- | ----- | ----- |
| AD-01 | As an admin, I want to manage master data such as breeds and vaccine types. | - Admin-only endpoints via Cloud Functions with Firebase Auth admin role check.<br>- Master data stored in Firestore `/master_data/{type}/{id}` (e.g., `/master_data/breeds/{breedId}`).<br>- Audit trail maintained in `/admin_audit_logs/{logId}`.<br>- Changes trigger cache invalidation.<br>- Data versioned for rollback capability. | Cloud Functions<br>Cloud Firestore | Cache master data aggressively (rarely changes). Use Firestore references for relationships. Store audit logs separately with TTL (90 days). Use batch writes for bulk updates. Consider using Firestore `setDoc()` with merge for partial updates. |
| AD-02 | As an admin, I want to monitor system health and logs for anomalies. | - Cloud Functions logs available via Firebase Console and Cloud Logging.<br>- Error tracking via Cloud Functions error reporting.<br>- Custom metrics stored in Firestore `/system_metrics/{metricId}` (updated hourly).<br>- Daily summary report generated via Cloud Scheduler + emailed.<br>- Alert thresholds configured (e.g., error rate >5%). | Cloud Functions<br>Cloud Scheduler<br>Cloud Firestore<br>Resend API | Use Cloud Functions built-in error reporting (free). Store only essential metrics in Firestore (not all logs). Generate reports on-demand. Use Cloud Scheduler for daily summary (cheaper than continuous monitoring). Consider integrating with external monitoring (e.g., Better Stack free tier) for advanced alerts. |
| AD-03 | As an admin, I want to support users by resetting passwords and managing roles. | - Admin portal uses Firebase Admin SDK in Cloud Functions.<br>- Password reset via Firebase Auth Admin API.<br>- Role management via custom claims (updated via Cloud Function).<br>- All actions logged to `/admin_actions/{actionId}` with timestamp and admin ID.<br>- Audit trail queryable and exportable. | Firebase Admin SDK<br>Cloud Functions<br>Cloud Firestore | Use Firebase Admin SDK for privileged operations (bypasses security rules). Log all admin actions (immutable logs). Use batch operations for bulk role updates. Cache user roles after updates. Implement rate limiting on admin functions. |

**6. System / Automation Stories**

| ID | User Story | Acceptance Criteria | Firebase Services | Optimization Notes |
| ----- | ----- | ----- | ----- | ----- |
| SY-01 | As the system, I want to send reminders before vaccine due dates. | - Cloud Scheduler triggers Cloud Function daily at 9 AM UTC.<br>- Cloud Function queries Firestore for pets with vaccines due in next 7 days.<br>- Batched FCM notifications sent (max 500 per batch).<br>- Email notifications sent via Resend API (batched).<br>- Reminder status tracked in Firestore to prevent duplicates.<br>- Failed notifications retried with exponential backoff. | Cloud Scheduler<br>Cloud Functions<br>Cloud Firestore<br>FCM<br>Resend API | Use single Cloud Scheduler job (not per-user). Batch notifications (FCM supports up to 500 per batch). Query only active pets (add `isActive` field). Track last reminder sent date to avoid duplicates. Use Firestore pagination if >1000 pets need reminders. Cache vaccine templates. |
| SY-02 | As the system, I want to automatically expire stale bookings. | - Firestore TTL policy on `/bookings/{bookingId}` documents (expires after 30 days of `status="pending"`).<br>- Cloud Scheduler triggers daily cleanup Cloud Function as backup.<br>- Cleanup Function queries bookings with `status="pending"` and `createdAt < now - 7 days`.<br>- Expired bookings moved to `/bookings_archived/{bookingId}` or deleted.<br>- Availability released for expired bookings. | Cloud Firestore (TTL)<br>Cloud Scheduler<br>Cloud Functions | Use Firestore TTL for automatic cleanup (free, no function invocations). Cloud Function as backup only. Batch delete operations (max 500 per batch). Use transactions to update availability + archive booking. Log cleanup actions for audit. |
| SY-03 | As the system, I want to notify users when media upload or invoice generation is complete. | - Firebase Storage upload triggers Cloud Function (Storage trigger).<br>- Cloud Function processes image (compression, thumbnail generation).<br>- Metadata written to Firestore.<br>- FCM notification sent to owner via Cloud Function.<br>- Invoice generation completion triggers similar flow.<br>- Notifications batched to reduce function invocations. | Firebase Storage<br>Cloud Functions<br>Cloud Firestore<br>FCM | Use Storage triggers (no polling needed). Process images asynchronously (don't block notification). Generate thumbnails in same function to save costs. Batch multiple upload notifications into single message if same user. Use Cloud Functions 2nd gen for better performance. Retry failed notifications. |

---

**7. Firebase Architecture Optimizations**

| Optimization Area | Strategy | Impact | Estimated Cost Savings |
| ----- | ----- | ----- | ----- |
| **Firestore Reads** | - Enable offline persistence<br>- Implement client-side caching<br>- Use pagination (limit 20-50)<br>- Cache frequently accessed data<br>- Use composite indexes efficiently | Reduces reads by 60-80% | Save $2-4/month |
| **Firestore Writes** | - Batch writes (max 500 operations)<br>- Use transactions for atomic updates<br>- Merge updates instead of overwrite<br>- Reduce redundant writes | Reduces writes by 30-50% | Save $0.50-1/month |
| **Storage Costs** | - Compress images before upload<br>- Generate thumbnails (store separately)<br>- Use appropriate image formats (WebP)<br>- Implement lifecycle policies (delete old files)<br>- Lazy load images | Reduces storage by 50-70% | Save $2-3/month |
| **Function Invocations** | - Batch notifications<br>- Combine related functions<br>- Use appropriate memory allocation<br>- Implement request caching<br>- Use regional deployment | Reduces invocations by 40-60% | Save $0.20-0.50/month |
| **Network Egress** | - Use CDN (Firebase Hosting)<br>- Compress API responses<br>- Cache static assets<br>- Minimize data transfer | Reduces egress by 30-50% | Save $1-2/month |
| **Scheduler Costs** | - Combine multiple jobs into one<br>- Use Firestore TTL instead of cleanup jobs<br>- Optimize job frequency | Minimizes job count | Save $0.20-0.50/month |

**Total Estimated Savings: $5-10/month (50-60% reduction)**

---

**8. Firebase Security Rules Examples**

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pets: owners can read/write their pets, staff can read assigned pets
    match /pets/{petId} {
      allow read: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.token.role in ['staff', 'manager', 'admin']
      );
      allow write: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.token.role in ['staff', 'manager', 'admin']
      );
    }
    
    // Bookings: owners can read their bookings, staff can update
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        request.auth.token.role in ['staff', 'manager', 'admin']
      );
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        request.auth.token.role in ['staff', 'manager']
      );
    }
    
    // Reviews: users can create, no one can edit after creation
    match /reviews/{reviewId} {
      allow read: if true; // Public reviews
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if false; // Immutable
      allow delete: if request.auth.token.role == 'admin';
    }
    
    // Medical records: vets can write, owners can read
    match /medical_records/{recordId} {
      allow read: if request.auth != null && (
        resource.data.petOwnerId == request.auth.uid ||
        request.auth.token.role == 'veterinarian'
      );
      allow write: if request.auth != null && 
        request.auth.token.role == 'veterinarian';
    }
  }
}

// Firebase Storage Security Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pet_photos/{userId}/{allPaths=**} {
      allow read: if true; // Public read for pet photos
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /vaccine_documents/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /stay_photos/{bookingId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['staff', 'manager'];
    }
    
    match /invoices/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth.token.role in ['staff', 'manager'];
    }
  }
}
```

---

**9. Cost Breakdown (Local-First + Optimized)**

| Service | Free Tier | Cloud-Only Usage | Local-First Usage | Monthly Cost |
| ----- | ----- | ----- | ----- | ----- |
| Firebase Auth | 10K verifications | <500 users | <500 users | $0 |
| Cloud Firestore | 1GB, 50K reads/day, 20K writes/day | 60K reads/month, 15K writes/month | **6K reads/month, 3K writes/month** | **$0.50-1.50** |
| Firebase Storage | 1GB, 10GB download | Frequent re-downloads | Download once, cache locally | $2-4 |
| Cloud Functions | 2M invocations | 3M invocations/month | Batched operations | $0-1 |
| FCM | Unlimited | Unlimited | Unlimited | $0 |
| Cloud Scheduler | 3 jobs/month | 10 jobs/month | Combined jobs | $0.20-0.50 |
| Email (Resend) | 3,000/month | Batched notifications | Batched notifications | $0-1 |
| **Total (Cloud-Only)** | | | | **~$63/month** |
| **Total (Local-First)** | | | | **$2.70-7.50/month** |
| **Savings** | | | | **~85-90% reduction** |

---

**10. Implementation Phases**

**Phase 1: MVP (Month 1-2)**
- Firebase Auth + Firestore (basic CRUD)
- Firebase Storage (basic uploads)
- Simple Cloud Functions (no optimization)
- **Cost: $0-2/month** (mostly free tier)

**Phase 2: Core Features (Month 3-4)**
- Add Cloud Scheduler for reminders
- Implement FCM notifications
- Add security rules
- **Cost: $2-5/month**

**Phase 3: Optimization (Month 5+)**
- Implement all optimizations
- Add caching layer
- Optimize queries and functions
- **Cost: $4-11/month**

---

**11. Monitoring & Alerts**

- **Cloud Functions Error Reporting:** Built-in (free)
- **Firestore Usage Monitoring:** Firebase Console dashboard
- **Cost Alerts:** Set up Firebase budget alerts ($10, $20 thresholds)
- **Performance Monitoring:** Firebase Performance Monitoring (free tier: 1M events/month)

---

**12. Backup & Disaster Recovery**

- **Firestore:** Automatic daily backups (Blaze plan required, ~$0.06/GB)
- **Storage:** Use Firebase Storage lifecycle policies
- **Manual Export:** Use `gcloud firestore export` for manual backups
- **Estimated Backup Cost:** $0-2/month (if enabled)

---

**13. Flutter Architecture & Implementation**

**Project Structure:**
```
pet_management_app/
├── lib/
│   ├── main.dart                      # App entry point
│   ├── app.dart                        # MaterialApp configuration
│   ├── core/
│   │   ├── config/
│   │   │   └── firebase_options.dart   # Firebase configuration
│   │   ├── services/
│   │   │   ├── auth_service.dart      # Firebase Auth wrapper
│   │   │   ├── firestore_service.dart # Firestore operations
│   │   │   ├── storage_service.dart    # Firebase Storage operations
│   │   │   ├── fcm_service.dart       # Push notifications
│   │   │   └── notification_service.dart
│   │   ├── models/                     # Data models
│   │   │   ├── user_model.dart
│   │   │   ├── pet_model.dart
│   │   │   ├── booking_model.dart
│   │   │   └── medical_record_model.dart
│   │   ├── repositories/              # Data repositories
│   │   │   ├── pet_repository.dart
│   │   │   ├── booking_repository.dart
│   │   │   └── user_repository.dart
│   │   └── utils/
│   │       ├── image_compression.dart
│   │       ├── validators.dart
│   │       └── constants.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── presentation/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── login_screen.dart
│   │   │   │   │   └── signup_screen.dart
│   │   │   │   └── widgets/
│   │   │   └── domain/
│   │   │       └── auth_bloc.dart     # State management (BLoC)
│   │   ├── pet_owner/
│   │   │   ├── pets/
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── screens/
│   │   │   │   │   │   ├── pets_list_screen.dart
│   │   │   │   │   │   ├── pet_details_screen.dart
│   │   │   │   │   │   └── add_pet_screen.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── domain/
│   │   │   │       └── pet_bloc.dart
│   │   │   ├── bookings/
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── screens/
│   │   │   │   │   │   ├── bookings_list_screen.dart
│   │   │   │   │   │   ├── booking_details_screen.dart
│   │   │   │   │   │   └── kennel_search_screen.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── domain/
│   │   │   │       └── booking_bloc.dart
│   │   │   └── dashboard/
│   │   │       └── owner_dashboard_screen.dart
│   │   ├── staff/
│   │   │   ├── check_ins/
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── screens/
│   │   │   │   │   │   └── check_in_screen.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── domain/
│   │   │   │       └── check_in_bloc.dart
│   │   │   └── stay_updates/
│   │   │       └── stay_update_screen.dart
│   │   ├── manager/
│   │   │   ├── dashboard/
│   │   │   │   └── manager_dashboard_screen.dart
│   │   │   └── reports/
│   │   │       └── reports_screen.dart
│   │   └── admin/
│   │       └── admin_panel_screen.dart
│   └── shared/
│       ├── widgets/
│       │   ├── pet_card.dart
│       │   ├── booking_card.dart
│       │   ├── image_upload_widget.dart
│       │   └── loading_indicator.dart
│       └── themes/
│           └── app_theme.dart
├── cloud_functions/
│   ├── functions/
│   │   ├── src/
│   │   │   ├── onBookingCreate.ts
│   │   │   ├── onPhotoUpload.ts
│   │   │   └── vaccineReminders.ts
│   │   └── package.json
│   └── firebase.json
├── pubspec.yaml                      # Flutter dependencies
├── analysis_options.yaml            # Dart linter rules
└── README.md
```

**Flutter Dependencies (pubspec.yaml):**
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Firebase
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  cloud_firestore: ^5.0.0
  firebase_storage: ^12.0.0
  firebase_messaging: ^15.0.0
  firebase_analytics: ^11.0.0
  
  # State Management (BLoC Pattern)
  flutter_bloc: ^8.1.0
  equatable: ^2.0.5
  
  # Dependency Injection
  get_it: ^7.6.0
  
  # Image Processing
  image_picker: ^1.0.0
  image: ^4.1.0
  
  # UI Components
  cached_network_image: ^3.3.0
  flutter_svg: ^2.0.0
  
  # Utilities
  intl: ^0.19.0
  shared_preferences: ^2.2.0
  connectivity_plus: ^5.0.0
  
  # PDF Generation (for invoices)
  pdf: ^3.10.0
  printing: ^5.11.0
  
  # Local Database (for offline caching)
  hive: ^2.2.3
  hive_flutter: ^1.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.0
  hive_generator: ^2.0.0
```

**Key Flutter Implementation Patterns:**

1. **State Management - BLoC Pattern:**
   ```dart
   // Example: Pet BLoC
   class PetBloc extends Bloc<PetEvent, PetState> {
     final PetRepository _repository;
     
     PetBloc(this._repository) : super(PetInitial()) {
       on<LoadPets>(_onLoadPets);
       on<AddPet>(_onAddPet);
       on<UpdatePet>(_onUpdatePet);
     }
     
     Future<void> _onLoadPets(
       LoadPets event,
       Emitter<PetState> emit,
     ) async {
       emit(PetLoading());
       try {
         // Enable offline persistence
         final pets = await _repository.getPetsStream(event.userId)
             .listen((pets) => emit(PetLoaded(pets)));
       } catch (e) {
         emit(PetError(e.toString()));
       }
     }
   }
   ```

2. **Firestore Service with Offline Persistence:**
   ```dart
   class FirestoreService {
     final FirebaseFirestore _firestore;
     
     FirestoreService() : _firestore = FirebaseFirestore.instance {
       // Enable offline persistence
       _firestore.settings = const Settings(
         persistenceEnabled: true,
         cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
       );
     }
     
     Stream<List<Pet>> getPetsStream(String userId) {
       return _firestore
         .collection('pets')
         .where('ownerId', isEqualTo: userId)
         .snapshots()
         .map((snapshot) => snapshot.docs
           .map((doc) => Pet.fromFirestore(doc))
           .toList());
     }
   }
   ```

3. **Image Upload with Compression:**
   ```dart
   class ImageService {
     Future<String> uploadPetPhoto(
       File imageFile,
       String userId,
       String petId,
     ) async {
       // Compress image before upload
       final compressedFile = await _compressImage(imageFile);
       
       final ref = FirebaseStorage.instance
         .ref()
         .child('pet_photos/$userId/$petId/${DateTime.now().millisecondsSinceEpoch}.jpg');
       
       final uploadTask = ref.putFile(compressedFile);
       final snapshot = await uploadTask;
       
       return await snapshot.ref.getDownloadURL();
     }
     
     Future<File> _compressImage(File file) async {
       final image = img.decodeImage(await file.readAsBytes())!;
       final compressed = img.copyResize(
         image,
         width: 800,
         maintainAspect: true,
       );
       final compressedBytes = img.encodeJpg(compressed, quality: 85);
       return File(file.path.replaceAll('.jpg', '_compressed.jpg'))
         ..writeAsBytesSync(compressedBytes);
     }
   }
   ```

4. **FCM Push Notifications:**
   ```dart
   class FCMService {
     static Future<void> initialize() async {
       await FirebaseMessaging.instance.requestPermission();
       
       // Handle foreground messages
       FirebaseMessaging.onMessage.listen((RemoteMessage message) {
         // Show local notification
       });
       
       // Handle background messages (requires top-level function)
       FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
     }
     
     static Future<String?> getFCMToken() async {
       return await FirebaseMessaging.instance.getToken();
     }
   }
   ```

**Platform-Specific Optimizations:**

1. **iOS (iOS folder):**
   - Configure `Info.plist` for Firebase
   - Set up push notification capabilities
   - Configure camera and photo library permissions

2. **Android (android folder):**
   - Configure `google-services.json` for Firebase
   - Set up FCM in `AndroidManifest.xml`
   - Configure camera and storage permissions

3. **Web (web folder):**
   - Configure Firebase for web
   - Enable CORS for Firebase Storage
   - Optimize for responsive design

**Build Commands:**
```bash
# Development
flutter run                    # Run on connected device
flutter run -d chrome          # Run on web
flutter run -d macos          # Run on macOS

# Build for production
flutter build ios              # iOS app
flutter build apk             # Android APK
flutter build appbundle       # Android App Bundle
flutter build web             # Web app
flutter build macos           # macOS app
flutter build windows         # Windows app
flutter build linux           # Linux app
```

**Testing Strategy:**
- Unit tests for business logic and repositories
- Widget tests for UI components
- Integration tests for critical user flows
- Firestore emulator for local testing

**Performance Optimizations:**
- Use `ListView.builder` for large lists (not `ListView`)
- Implement image caching with `cached_network_image`
- Use `const` constructors where possible
- Lazy load data with pagination
- Implement proper state management to avoid unnecessary rebuilds

**Deployment:**
- **iOS:** Xcode → App Store Connect
- **Android:** `flutter build appbundle` → Google Play Console
- **Web:** `flutter build web` → Firebase Hosting
- **Desktop:** Platform-specific distribution (DMG for macOS, MSI for Windows)

---

**14. Local-First Storage Architecture (Maximum Cost Reduction)**

**Strategy:** Store maximum data locally, sync to cloud only when necessary. This reduces Firestore reads by 85-95%.

**Local Storage Stack:**
- **Hive (NoSQL):** Pet data, user profiles, master data, static data (fast, key-value)
- **SQLite (sqflite):** Bookings, stay updates, historical data (complex queries)
- **SharedPreferences:** Settings, app config, last sync timestamps
- **File System (path_provider):** Invoice PDFs, document cache (download once, cache forever)

**Data Storage Strategy:**

| Data Type | Local Storage | Sync Frequency | Cloud Reads Saved | Implementation |
|-----------|---------------|----------------|-------------------|----------------|
| User Profile | Hive | On login only | ~98% | Cache after first fetch, update on change |
| Pets List | Hive | On create/update | ~95% | Primary source: local, sync background |
| Medical Records | Hive | When vet updates | ~90% | Local cache, sync on new record |
| Vaccine Schedule | SQLite | Monthly | ~95% | Calculate locally, sync data monthly |
| Active Bookings | SQLite | On status change | ~80% | Real-time sync only for active bookings |
| Past Bookings | SQLite | Once, then local | ~100% | Sync once, never re-read from cloud |
| Stay Updates | SQLite | Every 15 min (batch) | ~85% | Batch sync, not per-update |
| Invoices | File System | Once (cache forever) | ~100% | Download once, never re-download |
| Kennel Data | Hive | Weekly | ~95% | Master data changes rarely |
| Reviews | Hive | On write | ~90% | Cache after fetch, update on new review |

**Architecture Pattern:**

```
┌─────────────────────────────────────┐
│      Flutter App (Client)           │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ Local Cache │  │ Sync Service │ │
│  │ (Primary)   │  │ (Background)  │ │
│  │             │  │               │ │
│  │ - Hive      │  │ - Checks      │ │
│  │ - SQLite    │  │   changes    │ │
│  │ - Files     │  │ - Batch sync │ │
│  └──────┬──────┘  └───────┬───────┘ │
│         │                 │         │
│         └────────┬─────────┘        │
│                  │                  │
│         ┌────────▼────────┐        │
│         │  Repository     │        │
│         │  (Abstraction)  │        │
│         └────────┬────────┘        │
│                  │                  │
└──────────────────┼──────────────────┘
                   │
         ┌─────────▼─────────┐
         │   Firebase        │
         │   (Sync Only)     │
         └───────────────────┘
```

**Implementation Example - Local-First Repository:**

```dart
// Pet Repository - Local-First Pattern
class PetRepository {
  final HiveInterface _localDB;
  final FirebaseFirestore _firestore;
  final SyncService _syncService;
  
  // Read from local first, sync in background
  Future<List<Pet>> getPets(String userId) async {
    // 1. Read from local cache (instant, no cloud read)
    final localPets = _localDB.box<Pet>('pets')
        .values
        .where((p) => p.ownerId == userId)
        .toList();
    
    // 2. Return immediately (optimistic)
    if (localPets.isNotEmpty) {
      // Trigger background sync (non-blocking)
      _syncService.syncPets(userId).catchError((e) => print(e));
      return localPets;
    }
    
    // 3. If no local data, fetch from cloud (first time only)
    final cloudPets = await _fetchFromCloud(userId);
    await _saveToLocal(cloudPets);
    return cloudPets;
  }
  
  Future<void> addPet(Pet pet) async {
    // 1. Save locally first (optimistic UI)
    await _localDB.box<Pet>('pets').put(pet.id, pet);
    
    // 2. Sync to cloud in background (non-blocking)
    await _syncService.syncPetToCloud(pet);
  }
}
```

**Sync Service (Background Sync):**

```dart
// Sync Service - Intelligent Batching
class SyncService {
  final FirebaseFirestore _firestore;
  final HiveInterface _localDB;
  final SharedPreferences _prefs;
  
  // Only sync changed data (minimize reads)
  Future<void> syncPets(String userId) async {
    final lastSync = _prefs.getInt('last_pet_sync_$userId') ?? 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    
    // Only sync if > 1 hour since last sync
    if (now - lastSync < 3600000) return;
    
    try {
      // Get only recently updated pets from cloud
      final snapshot = await _firestore
          .collection('pets')
          .where('ownerId', isEqualTo: userId)
          .where('updatedAt', isGreaterThan: Timestamp.fromMillisecondsSinceEpoch(lastSync))
          .get();
      
      // Update local cache
      final box = _localDB.box<Pet>('pets');
      for (final doc in snapshot.docs) {
        await box.put(doc.id, Pet.fromFirestore(doc));
      }
      
      await _prefs.setInt('last_pet_sync_$userId', now);
    } catch (e) {
      // Fail silently - local data is still available
    }
  }
}
```

**SQLite for Bookings (Complex Queries Locally):**

```dart
// Booking Database - All queries local
class BookingDatabase {
  Future<List<Booking>> getBookings(String userId) async {
    final db = await database;
    // Query local SQLite (no cloud read)
    final maps = await db.query(
      'bookings',
      where: 'userId = ?',
      whereArgs: [userId],
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => Booking.fromMap(map)).toList();
  }
  
  // Sync only changed bookings (minimal reads)
  Future<void> syncBookings(String userId) async {
    final lastSync = await _getLastSync('bookings');
    final snapshot = await _firestore
        .collection('bookings')
        .where('userId', isEqualTo: userId)
        .where('updatedAt', isGreaterThan: Timestamp.fromMillisecondsSinceEpoch(lastSync))
        .limit(50) // Limit to reduce reads
        .get();
    
    // Update local database
    final db = await database;
    await db.transaction((txn) async {
      for (final doc in snapshot.docs) {
        await txn.insert(
          'bookings',
          Booking.fromFirestore(doc).toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });
  }
}
```

**File Cache for Invoices (Download Once):**

```dart
// Invoice Service - Cache Forever
class InvoiceService {
  Future<File> getInvoice(String invoiceId, String userId) async {
    final localPath = join(_cacheDir.path, 'invoices', '$invoiceId.pdf');
    final localFile = File(localPath);
    
    // Check if already cached locally (no cloud read)
    if (await localFile.exists()) {
      return localFile; // Instant, no cost
    }
    
    // Download only once, cache forever
    final ref = _storage.ref().child('invoices/$userId/$invoiceId.pdf');
    final downloadUrl = await ref.getDownloadURL();
    final response = await http.get(Uri.parse(downloadUrl));
    await localFile.create(recursive: true);
    await localFile.writeAsBytes(response.bodyBytes);
    
    return localFile;
  }
}
```

**Updated Flutter Dependencies (Local Storage Focus):**

```yaml
dependencies:
  # Local Storage (Primary)
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  sqflite: ^2.3.0
  shared_preferences: ^2.2.0
  path_provider: ^2.1.0
  path: ^1.8.3
  
  # Sync & Connectivity
  connectivity_plus: ^5.0.0
  workmanager: ^0.5.2  # Background sync
  
  # Firebase (Minimal - sync only)
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  cloud_firestore: ^5.0.0  # Only for sync operations
  firebase_storage: ^12.0.0  # Only for uploads
  
  # Utilities
  intl: ^0.19.0
  http: ^1.1.0

dev_dependencies:
  hive_generator: ^2.0.0
  build_runner: ^2.4.0
```

**Cost Savings with Local-First Architecture:**

| Metric | Cloud-Only | Local-First | Savings |
|--------|------------|-------------|---------|
| Firestore Reads | ~60,000/month | ~6,000/month | 90% |
| Firestore Writes | ~15,000/month | ~3,000/month | 80% |
| Storage Downloads | Frequent | Once per file | ~95% |
| **Monthly Cost** | **~$63/month** | **~$9/month** | **85%** |

**Optimization by User Story:**

1. **PO-02 (Pet Registration):** Store locally in Hive, sync only on create/update → **90% fewer reads**
2. **PO-04 (Vaccine Reminders):** Calculate locally from SQLite, sync monthly → **95% fewer reads**
3. **PO-05 (Kennel Search):** Search local Hive cache (weekly sync) → **80% fewer reads**
4. **PO-07 (Stay Updates):** Store in SQLite, batch sync every 15 min → **85% fewer reads**
5. **PO-08 (Invoices):** Cache PDFs locally, download once → **100% fewer re-reads**
6. **KS-01 (Staff Check-ins):** Load from local SQLite, sync on status change → **70% fewer reads**

**Sync Strategies:**

- **Real-time Sync:** Only for active bookings with status changes (critical data)
- **Periodic Sync:** Every 15 minutes for stay updates (non-critical)
- **Daily Sync:** Staff schedules, kennel data (rarely changes)
- **Weekly Sync:** Master data (breeds, vaccine types) - changes rarely
- **On-Demand Sync:** User profile, pet data (only on create/update)
- **Once + Local:** Past bookings, invoices (download once, never re-read)

**Offline Support:**

- All data available offline (primary source is local)
- Changes queued locally when offline
- Auto-sync when connection restored
- UI indicators for sync status
- Optimistic updates for better UX

---

**15. Offline-First Architecture (Run Without Firebase Connection)**

**Strategy:** App functions completely offline. Firebase is optional and used only for sync when available. Perfect for development, testing, and areas with poor connectivity.

**Key Principles:**

1. **Local Storage is Primary:** All reads and writes happen to local storage first
2. **Firebase is Optional:** App works 100% without Firebase connection
3. **Sync Queue:** Offline operations are queued and synced when connection is available
4. **Graceful Degradation:** App continues working even if Firebase initialization fails

**Architecture:**

```
┌─────────────────────────────────────┐
│      Flutter App                    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Local Storage (Primary)     │ │
│  │  - Hive (Pets, Users, Master)│ │
│  │  - SQLite (Bookings, Updates)│ │
│  │  - Files (Invoices, Docs)    │ │
│  └───────────┬───────────────────┘ │
│              │                      │
│  ┌───────────▼───────────────────┐ │
│  │  Repository Layer              │ │
│  │  (Always reads/writes local)   │ │
│  └───────────┬───────────────────┘ │
│              │                      │
│  ┌───────────▼───────────────────┐ │
│  │  Sync Queue Service            │ │
│  │  (Queues operations when       │ │
│  │   Firebase unavailable)        │ │
│  └───────────┬───────────────────┘ │
│              │                      │
└──────────────┼──────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼─────┐    ┌──────▼──────┐
│ Firebase  │    │  Offline    │
│ (Optional)│    │   Mode      │
│           │    │             │
│ Sync when │    │ Queue for   │
│ available │    │ later sync  │
└───────────┘    └─────────────┘
```

**Connection Service:**

```dart
// lib/core/services/connection_service.dart
class ConnectionService {
  final Connectivity _connectivity = Connectivity();
  final SharedPreferences _prefs;
  
  // Detect network connectivity
  Stream<bool> get isConnectedStream => _connectivity.onConnectivityChanged
      .map((result) => result != ConnectivityResult.none);
  
  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }
  
  // Check if Firebase is actually reachable
  Future<bool> get isFirebaseReachable async {
    if (!await isConnected) return false;
    try {
      await FirebaseFirestore.instance
          .collection('health')
          .limit(1)
          .get()
          .timeout(Duration(seconds: 3));
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Offline mode toggle (for testing/development)
  Future<void> setOfflineMode(bool enabled) async {
    await _prefs.setBool('offline_mode', enabled);
  }
  
  Future<bool> get isOfflineMode async {
    return _prefs.getBool('offline_mode') ?? false;
  }
}
```

**Offline-First Repository Pattern:**

```dart
// lib/core/repositories/pet_repository.dart
class PetRepository {
  final HiveInterface _localDB;
  final FirebaseFirestore? _firestore; // Nullable - works without Firebase
  final ConnectionService _connectionService;
  final SyncQueueService _syncQueue;
  
  // ALWAYS read from local first (works offline)
  Future<List<Pet>> getPets(String userId) async {
    // This works 100% offline - no Firebase required
    final box = _localDB.box<Pet>('pets');
    final localPets = box.values
        .where((p) => p.ownerId == userId)
        .toList();
    
    // Try background sync only if online (non-blocking)
    if (await _connectionService.isFirebaseReachable && 
        !await _connectionService.isOfflineMode &&
        _firestore != null) {
      _syncPetsFromCloud(userId).catchError((e) {
        // Fail silently - local data is still available
      });
    }
    
    return localPets; // Return immediately from local
  }
  
  // Write locally first, queue for sync
  Future<void> addPet(Pet pet) async {
    // 1. Save locally immediately (works offline)
    final box = _localDB.box<Pet>('pets');
    await box.put(pet.id, pet);
    
    // 2. Try immediate sync if online
    if (await _connectionService.isFirebaseReachable && 
        !await _connectionService.isOfflineMode &&
        _firestore != null) {
      try {
        await _firestore!.collection('pets').doc(pet.id).set(pet.toMap());
      } catch (e) {
        // If sync fails, queue it for later
        await _syncQueue.queueOperation(
          SyncOperation(
            type: SyncType.create,
            collection: 'pets',
            documentId: pet.id,
            data: pet.toMap(),
          ),
        );
      }
    } else {
      // Offline - queue for sync when connection restored
      await _syncQueue.queueOperation(
        SyncOperation(
          type: SyncType.create,
          collection: 'pets',
          documentId: pet.id,
          data: pet.toMap(),
        ),
      );
    }
  }
}
```

**Sync Queue Service (Pending Operations):**

```dart
// lib/core/services/sync_queue_service.dart
enum SyncType { create, update, delete }

class SyncOperation {
  final SyncType type;
  final String collection;
  final String documentId;
  final Map<String, dynamic>? data;
  final DateTime timestamp;
}

class SyncQueueService {
  final HiveInterface _localDB;
  final FirebaseFirestore? _firestore;
  final ConnectionService _connectionService;
  
  // Queue an operation for later sync
  Future<void> queueOperation(SyncOperation operation) async {
    final box = _localDB.box('sync_queue');
    await box.put(operation.documentId, operation.toMap());
    
    // Try to process queue immediately if online
    if (await _connectionService.isFirebaseReachable &&
        !await _connectionService.isOfflineMode) {
      processQueue();
    }
  }
  
  // Process all pending operations
  Future<void> processQueue() async {
    if (_firestore == null) return;
    if (await _connectionService.isOfflineMode) return;
    if (!await _connectionService.isFirebaseReachable) return;
    
    final box = _localDB.box('sync_queue');
    final pendingOps = box.values.toList();
    
    for (final opMap in pendingOps) {
      try {
        final operation = SyncOperation.fromMap(Map<String, dynamic>.from(opMap));
        await _executeOperation(operation);
        await box.delete(operation.documentId); // Remove after success
      } catch (e) {
        // Keep in queue for retry
      }
    }
  }
  
  int getPendingCount() {
    final box = _localDB.box('sync_queue');
    return box.length;
  }
}
```

**App Initialization (Firebase Optional):**

```dart
// lib/main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local storage FIRST (always works)
  await Hive.initFlutter();
  await Hive.openBox<Pet>('pets');
  await Hive.openBox<Booking>('bookings');
  await Hive.openBox('sync_queue');
  await Hive.openBox('settings');
  
  // Initialize Firebase (optional - graceful if fails)
  FirebaseApp? firebaseApp;
  try {
    firebaseApp = await Firebase.initializeApp();
    print('Firebase initialized');
  } catch (e) {
    print('Firebase not available - running in offline mode: $e');
    // Continue without Firebase - app works offline
  }
  
  // Initialize services
  final connectionService = ConnectionService();
  final syncQueue = SyncQueueService(
    localDB: Hive,
    firestore: firebaseApp != null ? FirebaseFirestore.instance : null,
    connectionService: connectionService,
  );
  
  // Listen for connectivity changes
  connectionService.isConnectedStream.listen((isConnected) {
    if (isConnected && firebaseApp != null) {
      // Connection restored - process sync queue
      syncQueue.processQueue();
    }
  });
  
  runApp(MyApp(
    firebaseApp: firebaseApp,
    connectionService: connectionService,
    syncQueue: syncQueue,
  ));
}
```

**UI Offline Indicator:**

```dart
// lib/features/shared/widgets/offline_indicator.dart
class OfflineIndicator extends StatelessWidget {
  final ConnectionService _connectionService;
  
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
      stream: _connectionService.isConnectedStream,
      builder: (context, snapshot) {
        final isConnected = snapshot.data ?? false;
        
        if (isConnected) return SizedBox.shrink();
        
        return Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(vertical: 8),
          color: Colors.orange,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.cloud_off, color: Colors.white),
              SizedBox(width: 8),
              Text(
                'Offline Mode - Changes will sync when connected',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
        );
      },
    );
  }
}
```

**Testing Without Firebase:**

```dart
// For development/testing - force offline mode
class OfflineModeToggle {
  static Future<void> enableOfflineMode() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('offline_mode', true);
  }
  
  static Future<void> disableOfflineMode() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('offline_mode', false);
  }
}

// Use in settings screen
class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      title: Text('Offline Mode'),
      subtitle: Text('Disable Firebase sync (for testing)'),
      value: snapshot.data ?? false,
      onChanged: (value) async {
        if (value) {
          await OfflineModeToggle.enableOfflineMode();
        } else {
          await OfflineModeToggle.disableOfflineMode();
        }
      },
    );
  }
}
```

**Benefits of Offline-First Architecture:**

| Benefit | Description |
|---------|-------------|
| **100% Offline** | App works completely without internet/Firebase |
| **Zero Firebase Reads** | No cloud reads when offline - massive cost savings |
| **Fast Performance** | All reads from local storage (instant) |
| **Testable** | Can develop/test without Firebase setup |
| **Resilient** | Works even if Firebase is down or unavailable |
| **Auto-Sync** | Changes sync automatically when connection restored |
| **Better UX** | Optimistic updates - UI responds immediately |

**Updated Dependencies for Offline Support:**

```yaml
dependencies:
  # Local Storage (Primary)
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  sqflite: ^2.3.0
  shared_preferences: ^2.2.0
  path_provider: ^2.1.0
  path: ^1.8.3
  
  # Connectivity Detection
  connectivity_plus: ^5.0.0
  
  # Background Sync
  workmanager: ^0.5.2
  
  # Firebase (Optional - can be null)
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  cloud_firestore: ^5.0.0
  firebase_storage: ^12.0.0
  firebase_messaging: ^15.0.0
```

**Implementation Checklist:**

1. ✅ Initialize local storage (Hive/SQLite) before Firebase
2. ✅ Make Firebase initialization optional (try/catch)
3. ✅ All repositories read from local storage first
4. ✅ Queue write operations when Firebase unavailable
5. ✅ Process sync queue when connection restored
6. ✅ Show offline indicator in UI
7. ✅ Test app without Firebase connection
8. ✅ Handle connectivity state changes

**Usage Example:**

```dart
// In your BLoC or widget
final petRepo = getIt<PetRepository>();

// This works offline - reads from local Hive
final pets = await petRepo.getPets(userId); // No Firebase needed!

// Adding pet - saves locally, queues for sync
await petRepo.addPet(newPet); // Works offline!

// Check sync queue status
final syncQueue = getIt<SyncQueueService>();
final pendingCount = syncQueue.getPendingCount();
if (pendingCount > 0) {
  print('$pendingCount operations pending sync');
}
```

**Offline Mode Scenarios:**

1. **No Internet Connection:** App works with local data only, queues changes
2. **Firebase Unavailable:** App continues with local storage, syncs when available
3. **Development/Testing:** Can disable Firebase completely via settings
4. **Initial App Launch:** Works immediately with local cache, syncs in background
5. **Connection Restored:** Automatic sync queue processing

---

**Total Estimated Monthly Cost (Local-First + Optimized): $4-9/month**
**vs. Cloud-Only: $63-78/month**
**vs. AWS Original Estimate: $78-275/month**
**Savings: 90-95% reduction vs Cloud-Only, 97-98% vs AWS**

**Development Cost:**
- Flutter SDK: Free
- Dart: Free
- Firebase SDK: Free
- iOS Developer Account: $99/year
- Android Developer Account: $25 one-time
- **Total Development Cost: $124/year + $4-9/month runtime**
