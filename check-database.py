"""
Check Lokeet database contents on Railway PostgreSQL
"""
import requests
import json
from datetime import datetime

BASE_URL = "https://web-production-5630.up.railway.app"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def check_health():
    """Check API health"""
    print_section("API Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        print(f"Status: {data.get('status')}")
        print(f"OpenAI Configured: {data.get('openai_configured')}")
        print(f"Supabase Configured: {data.get('supabase_configured')}")
        print(f"Timestamp: {data.get('timestamp')}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def get_database_stats(token):
    """Get statistics from database"""
    print_section("Database Statistics")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Get user's saves
        response = requests.get(f"{BASE_URL}/v1/user/saves", headers=headers)
        if response.ok:
            data = response.json()
            saves = data.get('saves', [])

            print(f"\nTotal Saves: {len(saves)}")

            # Category breakdown
            categories = {}
            platforms = {}
            ai_processed_count = 0

            for save in saves:
                # Categories
                cat = save.get('category') or 'Uncategorized'
                categories[cat] = categories.get(cat, 0) + 1

                # Platforms
                plat = save.get('platform', 'unknown')
                platforms[plat] = platforms.get(plat, 0) + 1

                # AI processing
                if save.get('ai_processed'):
                    ai_processed_count += 1

            print(f"\n[CATEGORIES] Breakdown by Category:")
            for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
                print(f"  - {cat}: {count} saves")

            print(f"\n[PLATFORMS] Breakdown by Platform:")
            for plat, count in sorted(platforms.items(), key=lambda x: x[1], reverse=True):
                print(f"  - {plat}: {count} saves")

            print(f"\n[AI] AI Processing:")
            print(f"  - Processed: {ai_processed_count}/{len(saves)} ({ai_processed_count/len(saves)*100 if saves else 0:.1f}%)")

            # Show recent saves
            if saves:
                print(f"\n[RECENT] Most Recent Saves (last 5):")
                for i, save in enumerate(saves[:5], 1):
                    print(f"\n  {i}. {save.get('event_name') or save.get('venue_name') or save.get('content', '')[:50]}")
                    print(f"     Category: {save.get('category') or 'None'}")
                    print(f"     Platform: {save.get('platform')}")
                    print(f"     Saved: {save.get('saved_at', '')[:10]}")
                    if save.get('tags'):
                        print(f"     Tags: {', '.join(save.get('tags', []))}")
        else:
            print(f"Error fetching saves: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

def get_profile_info(token):
    """Get user profile info"""
    print_section("User Profile")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(f"{BASE_URL}/v1/user/profile", headers=headers)
        if response.ok:
            data = response.json()
            profile = data.get('profile', {})

            print(f"\n[USER] User Information:")
            print(f"  - Email: {profile.get('email', 'N/A')}")
            print(f"  - Display Name: {profile.get('display_name', 'N/A')}")
            print(f"  - Username: {profile.get('username', 'N/A')}")
            print(f"  - Zip Code: {profile.get('zip_code', 'N/A')}")
            print(f"  - Birthday: {profile.get('birthday', 'N/A')}")

            collections = profile.get('collections')
            if collections:
                print(f"  - Collections: {len(collections)} defined")
            else:
                print(f"  - Collections: None")
        else:
            print(f"Error fetching profile: {response.status_code}")

    except Exception as e:
        print(f"Error: {e}")

def main():
    print("\n" + "LOKEET DATABASE CONTENTS CHECK")
    print(f"Backend: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")

    # Check health
    if not check_health():
        print("\n❌ API is not healthy. Cannot continue.")
        return

    print("\n" + "="*60)
    print("To view database contents, you need to provide an auth token.")
    print("="*60)
    print("\nOptions:")
    print("1. Provide an existing user's auth token")
    print("2. Create a test user and use that token")
    print("\n")

    choice = input("Enter 1 or 2: ").strip()

    if choice == "1":
        token = input("Enter auth token (Bearer token from browser): ").strip()
        if token.startswith("Bearer "):
            token = token[7:]

        get_profile_info(token)
        get_database_stats(token)

    elif choice == "2":
        print("\n[CREATE] Creating test user...")
        email = f"dbcheck_{int(datetime.now().timestamp())}@lokeet.io"
        password = "TestPassword123!"

        # Signup
        response = requests.post(
            f"{BASE_URL}/v1/auth/signup",
            json={"email": email, "password": password}
        )

        if response.ok:
            data = response.json()
            if data.get('success'):
                token = data.get('session', {}).get('access_token')
                if token:
                    print(f"[SUCCESS] Test user created: {email}")
                    get_profile_info(token)
                    get_database_stats(token)
                else:
                    print("[ERROR] No token received")
            else:
                print(f"[ERROR] Signup failed: {data.get('error')}")
        else:
            print(f"[ERROR] Signup request failed: {response.status_code}")

    else:
        print("Invalid choice")

    print("\n" + "="*60)
    print("Database check complete!")
    print("="*60)

if __name__ == "__main__":
    main()
