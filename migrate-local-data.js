/**
 * One-time migration script to upload local chrome.storage data to backend
 * Run this from the extension's service worker console
 */

async function migrateLocalDataToBackend() {
  console.log('[MIGRATION] Starting local data migration to PostgreSQL backend...');

  try {
    // Check if user is authenticated
    const isAuth = await extAuth.isLoggedIn();
    if (!isAuth) {
      console.error('[MIGRATION] ❌ User not authenticated. Please log in first.');
      return { success: false, error: 'Not authenticated' };
    }

    const user = await extAuth.getUser();
    console.log(`[MIGRATION] User authenticated: ${user.email}`);

    // Get local saved items
    const storage = await chrome.storage.local.get(['savedItems']);
    const localItems = storage.savedItems || [];

    if (localItems.length === 0) {
      console.log('[MIGRATION] ✅ No local items to migrate');
      return { success: true, migrated: 0, message: 'No items to migrate' };
    }

    console.log(`[MIGRATION] Found ${localItems.length} local items`);

    // Get current backend items to avoid duplicates
    const headers = await extAuth.getAuthHeaders();
    const backendResponse = await fetch('https://web-production-5630.up.railway.app/v1/user/saves', {
      headers: headers
    });

    if (!backendResponse.ok) {
      throw new Error(`Failed to fetch backend items: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    const backendUrls = new Set(backendData.saves.map(item => item.url));

    console.log(`[MIGRATION] Backend has ${backendData.saves.length} existing items`);

    // Upload each local item that doesn't exist in backend
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of localItems) {
      // Skip if already exists in backend
      if (backendUrls.has(item.url)) {
        console.log(`[MIGRATION] ⏭️  Skipping duplicate: ${item.url}`);
        skipped++;
        continue;
      }

      try {
        // Upload to backend
        const response = await fetch('https://web-production-5630.up.railway.app/v1/user/saves', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            platform: item.platform || 'unknown',
            url: item.url,
            content: item.content || '',
            images: item.images || [],
            author: item.author || 'unknown',
            category: item.category || null
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`[MIGRATION] ✅ Migrated: ${item.url}`);
          migrated++;
        } else {
          console.error(`[MIGRATION] ❌ Failed to migrate: ${item.url} (Status: ${response.status})`);
          failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`[MIGRATION] ❌ Error migrating item:`, error);
        failed++;
      }
    }

    console.log('[MIGRATION] ================== SUMMARY ==================');
    console.log(`[MIGRATION] ✅ Migrated: ${migrated} items`);
    console.log(`[MIGRATION] ⏭️  Skipped (duplicates): ${skipped} items`);
    console.log(`[MIGRATION] ❌ Failed: ${failed} items`);
    console.log(`[MIGRATION] Total local items: ${localItems.length}`);
    console.log('[MIGRATION] ================================================');

    if (migrated > 0) {
      console.log('[MIGRATION] 🎉 Migration complete! Your data is now synced to the cloud.');
      console.log('[MIGRATION] You can now clear local storage if you wish (optional)');
    }

    return {
      success: true,
      migrated: migrated,
      skipped: skipped,
      failed: failed,
      total: localItems.length
    };

  } catch (error) {
    console.error('[MIGRATION] ❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Make function available globally
self.migrateLocalDataToBackend = migrateLocalDataToBackend;

console.log('[MIGRATION] Migration script loaded. Run: migrateLocalDataToBackend()');
