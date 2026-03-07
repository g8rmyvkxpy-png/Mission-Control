#!/bin/bash

echo "=== PPVentures Vercel Deployment ==="
echo ""

# Check if logged in
echo "1. Checking Vercel login..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Not logged in. Run: vercel login"
    exit 1
fi

echo "2. Linking project..."
vercel link --yes

echo "3. Adding environment variables..."
# Add Supabase keys
vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://hizmosyxhwgighzxvbrj.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "4. Deploying to production..."
vercel --prod

echo ""
echo "=== Done! ==="
