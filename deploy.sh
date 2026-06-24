#!/bin/bash

# Lokeet Web App Deployment Script

echo "🚀 Deploying Lokeet Web App to Vercel..."

# Check if in correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this from ps-webapp-next directory"
  exit 1
fi

# Build the app first
echo "📦 Building Next.js app..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix errors before deploying."
  exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Visit the deployment URL to test"
echo "2. Add environment variable: NEXT_PUBLIC_API_URL"
echo "3. Add your domain in Vercel dashboard"
echo "4. Test thoroughly before removing old site"
echo ""
echo "Environment variable to add:"
echo "NEXT_PUBLIC_API_URL=https://web-production-5630.up.railway.app/v1"
