#!/bin/bash

# Add environment variable to Vercel
echo "Adding NEXT_PUBLIC_API_URL environment variable..."
echo "https://web-production-5630.up.railway.app/v1" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "Now redeploying to apply the environment variable..."
vercel --prod --yes

echo ""
echo "✅ Done! Your app now has the correct API URL."
