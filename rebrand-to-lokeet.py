"""
Automated rebrand script: LoopLocal/ParaSosh → Lokeet
"""
import os
import re
import shutil
from pathlib import Path
from datetime import datetime

class LokeetRebrander:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.backup_dir = self.root_dir / f"_rebrand_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.changes_made = []
        self.files_modified = []

        # Define replacement patterns
        self.text_replacements = [
            # Brand names
            ('ParaSosh', 'Lokeet'),
            ('parasosh', 'lokeet'),
            ('LoopLocal', 'Lokeet'),
            ('looplocal', 'lokeet'),
        ]

        # CSS class replacements (more specific)
        self.css_class_replacements = [
            (r'\.looplocal-', '.lokeet-'),
            (r'looplocal-', 'lokeet-'),
        ]

        # Storage key replacements
        self.storage_key_replacements = [
            ('looplocal_session', 'lokeet_session'),
            ('looplocal_user', 'lokeet_user'),
        ]

        # JavaScript class names
        self.js_class_replacements = [
            ('ParaSoshPopup', 'LokeetPopup'),
            ('ParaSoshAPI', 'LokeetAPI'),
            ('InstagramParaSosh', 'InstagramLokeet'),
            ('TikTokParaSosh', 'TikTokLokeet'),
        ]

        # File renames
        self.file_renames = [
            ('parasosh-styles.css', 'lokeet-styles.css'),
            ('parasosh.db', 'lokeet.db'),
        ]

        # Files to skip
        self.skip_files = [
            '.git',
            'node_modules',
            '__pycache__',
            '.venv',
            'venv',
            '_rebrand_backup_',
            '.pyc',
            'rebrand-to-lokeet.py',
            'LOKEET_REBRAND_CHECKLIST.md',
            'REBRAND_AUDIT.md',
            'REBRAND_COMPLETE.md',
            'REBRAND_FINAL_REPORT.md',
        ]

        # Extensions to process
        self.process_extensions = [
            '.js', '.json', '.html', '.css', '.py', '.md', '.txt',
            '.jsx', '.ts', '.tsx', '.yml', '.yaml'
        ]

    def should_skip(self, path):
        """Check if file/directory should be skipped"""
        path_str = str(path)
        for skip in self.skip_files:
            if skip in path_str:
                return True
        return False

    def create_backup(self):
        """Create backup of important files"""
        print(f"\n[BACKUP] Creating backup at: {self.backup_dir}")
        self.backup_dir.mkdir(exist_ok=True)

        # Backup critical files
        critical_files = [
            'manifest.json',
            'popup.html',
            'popup.js',
            'background.js',
            'ext-auth.js',
            'content-scripts/instagram.js',
            'content-scripts/tiktok.js',
            'parasosh-styles.css',
        ]

        for file_rel in critical_files:
            src = self.root_dir / file_rel
            if src.exists():
                dst = self.backup_dir / file_rel
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
                print(f"  [OK] Backed up: {file_rel}")

        print(f"[BACKUP] Backup complete")

    def rename_files(self):
        """Rename files with old branding"""
        print(f"\n[RENAME] Renaming files...")

        for old_name, new_name in self.file_renames:
            # Search for files with old names
            for file_path in self.root_dir.rglob(old_name):
                if self.should_skip(file_path):
                    continue

                new_path = file_path.parent / new_name
                if file_path.exists() and not new_path.exists():
                    file_path.rename(new_path)
                    self.changes_made.append(f"Renamed: {file_path} -> {new_path}")
                    print(f"  [OK] {old_name} -> {new_name}")

    def process_file(self, file_path):
        """Process a single file for text replacements"""
        try:
            # Read file
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            original_content = content
            changes_in_file = 0

            # Apply text replacements
            for old, new in self.text_replacements:
                count = content.count(old)
                if count > 0:
                    content = content.replace(old, new)
                    changes_in_file += count

            # Apply CSS class replacements (regex)
            for pattern, replacement in self.css_class_replacements:
                matches = len(re.findall(pattern, content))
                if matches > 0:
                    content = re.sub(pattern, replacement, content)
                    changes_in_file += matches

            # Apply storage key replacements
            for old, new in self.storage_key_replacements:
                count = content.count(old)
                if count > 0:
                    content = content.replace(old, new)
                    changes_in_file += count

            # Apply JS class replacements
            for old, new in self.js_class_replacements:
                count = content.count(old)
                if count > 0:
                    content = content.replace(old, new)
                    changes_in_file += count

            # Write back if changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8', errors='ignore') as f:
                    f.write(content)

                self.files_modified.append(str(file_path.relative_to(self.root_dir)))
                self.changes_made.append(f"Modified {file_path.name}: {changes_in_file} replacements")
                return changes_in_file

            return 0

        except Exception as e:
            print(f"  [WARNING] Error processing {file_path}: {e}")
            return 0

    def process_directory(self):
        """Process all files in directory"""
        print(f"\n[PROCESS] Processing files...")

        total_changes = 0
        files_processed = 0

        for file_path in self.root_dir.rglob('*'):
            # Skip directories and unwanted files
            if not file_path.is_file() or self.should_skip(file_path):
                continue

            # Only process certain extensions
            if file_path.suffix not in self.process_extensions:
                continue

            files_processed += 1
            changes = self.process_file(file_path)
            if changes > 0:
                total_changes += changes
                rel_path = file_path.relative_to(self.root_dir)
                print(f"  [OK] {rel_path}: {changes} changes")

        print(f"\n[PROCESS] Processed {files_processed} files, made {total_changes} changes")
        return total_changes

    def add_storage_migration(self):
        """Add code to migrate old storage keys"""
        print(f"\n[MIGRATE] Adding storage key migration code...")

        ext_auth_path = self.root_dir / 'ext-auth.js'
        if not ext_auth_path.exists():
            print(f"  [WARNING] ext-auth.js not found, skipping migration code")
            return

        with open(ext_auth_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if migration already exists
        if 'looplocal_session' in content and 'Migration' not in content:
            # Add migration code after the constructor or init
            migration_code = '''
  // Migration: Move old storage keys to new Lokeet keys
  async migrateOldStorageKeys() {
    try {
      const result = await chrome.storage.local.get(['looplocal_session', 'looplocal_user']);

      if (result.looplocal_session || result.looplocal_user) {
        console.log('[AUTH] Migrating old storage keys to Lokeet...');

        const updates = {};
        if (result.looplocal_session) {
          updates.lokeet_session = result.looplocal_session;
        }
        if (result.looplocal_user) {
          updates.lokeet_user = result.looplocal_user;
        }

        await chrome.storage.local.set(updates);
        await chrome.storage.local.remove(['looplocal_session', 'looplocal_user']);

        console.log('[AUTH] ✓ Migration complete');
      }
    } catch (error) {
      console.error('[AUTH] Migration error:', error);
    }
  }
'''

            # Find a good place to insert (after constructor)
            insert_pos = content.find('constructor(')
            if insert_pos > 0:
                # Find the end of constructor
                constructor_end = content.find('}', insert_pos)
                if constructor_end > 0:
                    # Insert after constructor
                    content = content[:constructor_end + 1] + '\n' + migration_code + content[constructor_end + 1:]

                    # Also add call in init or constructor
                    init_pos = content.find('async init()')
                    if init_pos > 0:
                        init_body_start = content.find('{', init_pos)
                        if init_body_start > 0:
                            content = content[:init_body_start + 1] + '\n    await this.migrateOldStorageKeys();' + content[init_body_start + 1:]

                    with open(ext_auth_path, 'w', encoding='utf-8') as f:
                        f.write(content)

                    print(f"  [OK] Added migration code to ext-auth.js")
                    self.changes_made.append("Added storage key migration to ext-auth.js")

    def generate_report(self):
        """Generate summary report"""
        print(f"\n{'='*60}")
        print(f"  REBRAND COMPLETE: LoopLocal/ParaSosh -> Lokeet")
        print(f"{'='*60}")

        print(f"\n[SUMMARY]:")
        print(f"  - Files modified: {len(self.files_modified)}")
        print(f"  - Total changes: {len(self.changes_made)}")
        print(f"  - Backup location: {self.backup_dir}")

        print(f"\n[FILES] Modified:")
        for file in sorted(self.files_modified)[:20]:  # Show first 20
            print(f"  - {file}")

        if len(self.files_modified) > 20:
            print(f"  ... and {len(self.files_modified) - 20} more")

        # Write detailed report
        report_path = self.root_dir / f"REBRAND_REPORT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("Lokeet Rebrand Report\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Date: {datetime.now().isoformat()}\n")
            f.write(f"Files modified: {len(self.files_modified)}\n")
            f.write(f"Changes made: {len(self.changes_made)}\n\n")
            f.write("Files Modified:\n")
            for file in sorted(self.files_modified):
                f.write(f"  - {file}\n")
            f.write("\n\nDetailed Changes:\n")
            for change in self.changes_made:
                f.write(f"  - {change}\n")

        print(f"\n[REPORT] Detailed report: {report_path.name}")

        print(f"\n{'='*60}")
        print(f"  [SUCCESS] Rebrand Complete!")
        print(f"{'='*60}")

        print(f"\n[NEXT STEPS]:")
        print(f"  1. Review the changes in your code editor")
        print(f"  2. Update manifest.json version (bump to 1.6.0)")
        print(f"  3. Test the extension thoroughly")
        print(f"  4. Update domain references (lokeet.io)")
        print(f"  5. Deploy backend with new branding")
        print(f"  6. If anything breaks, restore from: {self.backup_dir}")

    def run(self):
        """Run the complete rebrand process"""
        print("\n[START] LOKEET REBRAND")
        print(f"Working directory: {self.root_dir}")

        try:
            # Step 1: Backup
            self.create_backup()

            # Step 2: Rename files
            self.rename_files()

            # Step 3: Process all files
            self.process_directory()

            # Step 4: Add migration code
            self.add_storage_migration()

            # Step 5: Generate report
            self.generate_report()

        except Exception as e:
            print(f"\n[ERROR]: {e}")
            print(f"Restore from backup: {self.backup_dir}")
            raise

if __name__ == '__main__':
    # Get the directory where the script is located
    script_dir = Path(__file__).parent

    print("="*60)
    print("  Lokeet Rebrand Script")
    print("="*60)
    print(f"\nThis will rebrand:")
    print("  - ParaSosh -> Lokeet")
    print("  - LoopLocal -> Lokeet")
    print("  - parasosh -> lokeet")
    print("  - looplocal -> lokeet")
    print(f"\nWorking directory: {script_dir}")
    print("\nA backup will be created before making changes.")

    confirm = input("\nProceed with rebrand? (yes/no): ").strip().lower()

    if confirm in ['yes', 'y']:
        rebrander = LokeetRebrander(script_dir)
        rebrander.run()
    else:
        print("\n[CANCELLED] Rebrand cancelled")
