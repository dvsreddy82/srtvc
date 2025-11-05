# Pet Management Desktop App

Electron desktop application for macOS, Windows, and Linux, built with React and Firebase.

## Architecture

- **Framework**: Electron 28+
- **Renderer**: React (uses web package)
- **Main Process**: TypeScript
- **Backend**: Firebase (Web SDK)
- **Local Storage**: SQLite (better-sqlite3)
- **File System**: Native file operations for document caching

## Features

### Desktop-Specific Features
- ✅ **SQLite Database**: Local-first storage using better-sqlite3
- ✅ **File System Caching**: PDF invoices and documents cached locally
- ✅ **Native File Dialogs**: File picker and save dialogs
- ✅ **Window Management**: Multi-window support, menu bar
- ✅ **Auto-Updates**: Electron updater integration (ready)
- ✅ **Offline Support**: Full offline functionality with local SQLite

### Shared Features
- Uses the same React web app as renderer
- All web features available in desktop
- Same Firebase backend
- Same Redux state management

## Project Structure

```
src/
├── main/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # Preload script (IPC bridge)
├── services/
│   ├── localStorageService.ts  # SQLite storage
│   ├── fileService.ts          # File system operations
│   ├── imageService.ts         # Image compression
│   └── invoiceService.ts       # Invoice PDF caching
├── config/
│   └── firebase.ts      # Firebase configuration
└── renderer/            # Uses web package build output
```

## Setup

1. **Install Dependencies**
   ```bash
   cd packages/desktop
   npm install
   # or
   pnpm install
   ```

2. **Build Shared Package**
   ```bash
   cd ../shared
   pnpm build
   ```

3. **Build Web Package (Renderer)**
   ```bash
   cd ../web
   pnpm build
   ```

4. **Development**
   ```bash
   cd ../desktop
   npm run dev
   ```

## Building for Production

### macOS
```bash
npm run build:mac
# Output: dist/mac/Pet Management Cloud.dmg
```

### Windows
```bash
npm run build:win
# Output: dist/win/Pet Management Cloud Setup.exe
```

### Linux
```bash
npm run build:linux
# Output: dist/linux/Pet Management Cloud.AppImage
```

## IPC Communication

The desktop app exposes IPC methods for:

### File Operations
- `file:showOpenDialog` - Open file picker
- `file:showSaveDialog` - Save file dialog
- `file:readFile` - Read file from disk
- `file:writeFile` - Write file to disk

### Local Storage
- `storage:saveUser` - Save user to SQLite
- `storage:getUser` - Get user from SQLite
- `storage:savePet` - Save pet to SQLite
- `storage:getPets` - Get pets from SQLite
- `storage:saveBooking` - Save booking to SQLite
- `storage:getBookings` - Get bookings from SQLite

### App Info
- `app:getVersion` - Get app version
- `app:getPath` - Get Electron paths (userData, documents, etc.)

## Local Storage (SQLite)

The desktop app uses SQLite for local-first storage:

- **Database Location**: `{userData}/pet-management.db`
- **Tables**: users, pets, bookings, medical_records, vaccines, kennels, kennel_runs, stay_updates, invoices, settings
- **Service**: `src/services/localStorageService.ts`
- **Strategy**: Local-first with background sync to Firestore

## File System Caching

Documents are cached in:
- **Invoices**: `{userData}/documents/invoices/`
- **Medical Records**: `{userData}/documents/medical_records/`

## Dependencies

- `electron` - Electron framework
- `better-sqlite3` - SQLite database
- `electron-updater` - Auto-updates
- `sharp` - Image processing (for compression)
- `@pet-management/shared` - Shared business logic
- `@pet-management/web` - React renderer (as dependency)

## Configuration

1. **Firebase**: Configure in `src/config/firebase.ts` or via environment variables
2. **Electron Builder**: Configure in `electron-builder.json`
3. **Icon**: Add app icon to `assets/icon.png` (create directory if needed)

## Development Notes

- The renderer uses the web package's build output
- In development, it loads from web dev server (http://localhost:5173)
- In production, it loads from built static files
- SQLite database is created automatically on first run
- All IPC handlers are set up in main process

## Security

- `nodeIntegration: false` - Renderer cannot access Node.js
- `contextIsolation: true` - Isolated context bridge
- IPC handlers validate all inputs
- External links open in system browser

## Next Steps

1. Add app icon and assets
2. Configure auto-updates
3. Add crash reporting
4. Implement offline queue
5. Add system tray support (optional)

