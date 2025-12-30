#!/bin/bash

# Cloudflare Deployment Script
# This script helps deploy your Next.js app to Cloudflare Pages

set -e  # Exit on error

echo "🚀 Cloudflare Pages Deployment Script"
echo "======================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Check if logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please log in to Cloudflare:"
    wrangler login
fi

# Build the project
echo ""
echo "🔨 Building Next.js application..."
npm run build

# Check if build was successful
if [ ! -d "out" ] && [ ! -d ".next" ]; then
    echo "❌ Build failed - no output directory found"
    exit 1
fi

# Deploy to Cloudflare Pages
echo ""
echo "📤 Deploying to Cloudflare Pages..."

# Determine output directory
if [ -d "out" ]; then
    OUTPUT_DIR="out"
else
    OUTPUT_DIR=".next"
fi

# Deploy
wrangler pages deploy $OUTPUT_DIR --project-name=maweb

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Cloudflare Dashboard"
echo "2. Upload media files using: npm run upload:r2"
echo "3. Configure custom domain (optional)"
echo ""
echo "Visit: https://dash.cloudflare.com/pages"
