# Lokeet Data Migration Guide

## Overview
We've upgraded Lokeet to use cloud storage (PostgreSQL database) so your saves persist across devices and extension updates!

## What Changed?
- ✅ All saves now sync to the cloud automatically when you're logged in
- ✅ Your data persists across browser sessions and extension updates
- ✅ Access your saves from any device with the extension installed
- ✅ No more data loss on extension updates

## Migration Steps

### Step 1: Update Extension
1. Load the updated extension in Chrome (v1.5.0+)
2. The extension will reload with the new code

### Step 2: Verify Login
1. Click the Lokeet extension icon
2. Make sure you're logged in
3. If not, log in with your account

### Step 3: Run Migration (One-Time)
If you have existing local saves that need to be uploaded to the cloud:

1. Right-click the Lokeet extension icon
2. Click "Inspect pop-up" or "Inspect service worker"
3. Go to the **Console** tab
4. Type: `migrateLocalDataToBackend()`
5. Press Enter

The migration will:
- Check for duplicates (won't upload items that already exist)
- Upload all local saves to your cloud account
- Show progress in the console

**Example output:**
```
[MIGRATION] Starting local data migration...
[MIGRATION] Found 25 local items
[MIGRATION] Backend has 3 existing items
[MIGRATION] ✅ Migrated: 22 items
[MIGRATION] ⏭️ Skipped (duplicates): 3 items
[MIGRATION] ✅ Migration complete!
```

### Step 4: Verify Migration
1. Close and reopen the Lokeet popup
2. Your saves should now load from the cloud
3. Check that all your items are there

## For New Users
No migration needed! Just log in and start saving. All your saves will automatically sync to the cloud.

## Troubleshooting

### Migration Script Not Found
- Make sure you're using extension version 1.5.0 or higher
- Try reloading the extension: chrome://extensions → click reload

### Authentication Error
- Log out and log back in from the extension popup
- Try the migration again

### Some Items Missing
- The migration skips duplicates based on URL
- If you saved the same post twice, only one copy will be uploaded
- Check your saves in the popup - they should all be there

### Migration Failed
- Check your internet connection
- Make sure you're logged in
- Try running the migration again (it's safe to run multiple times)

## Need Help?
Contact support at: support@lokeet.io
