## Phase 1: Native iOS Enhancements

### 1. Biometric Authentication (Face ID / Touch ID)
- Install `@capacitor-community/biometric-auth` or `@aparajita/capacitor-biometric-auth`
- Add biometric lock option in Profile/Settings
- Prompt biometric on app resume
- Add `NSFaceIDUsageDescription` to Info.plist

### 2. iOS Permissions & Info.plist
- Add `NSCameraUsageDescription` for receipt scanning
- Add `NSFaceIDUsageDescription` for biometric auth

### 3. Auto-Logout on Inactivity
- Track last activity timestamp
- Auto-logout after configurable inactivity period (e.g., 5 min)
- Show lock screen requiring biometric or password

### 4. Predictive Balance
- Calculate end-of-month balance estimate based on recurring transactions and spending trends
- Show on dashboard as a card

### 5. Export Reports
- Export transactions as CSV
- Generate simple PDF summary report

Each phase builds on the existing codebase without restructuring. Shall I proceed?