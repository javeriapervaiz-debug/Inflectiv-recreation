# Deployment Guide - Railway

This guide will walk you through deploying the Inflectiv app to Railway.

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Supabase Project** - Database and auth setup
4. **Environment Variables** - All required API keys and secrets

## Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)

```bash
# Check if git is initialized
git status

# If not initialized, initialize it
git init
```

### 1.2 Add Remote Repository

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/javeriapervaiz-debug/Inflectiv-recreation.git

# Verify remote
git remote -v
```

### 1.3 Stage and Commit Files

```bash
# Add all files (respects .gitignore)
git add .

# Commit with a message
git commit -m "Initial commit: Inflectiv Web3 Data Marketplace"

# Push to GitHub
git push -u origin master
# or if your default branch is 'main':
git push -u origin master:main
```

**Note:** If the repository already has content, you may need to pull first:
```bash
git pull origin master --allow-unrelated-histories
```

## Step 2: Set Up Railway Project

### 2.1 Create New Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `javeriapervaiz-debug/Inflectiv-recreation`
5. Railway will automatically detect it's a Next.js project

### 2.2 Configure Build Settings

Railway should auto-detect Next.js, but verify:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `/` (root)

## Step 3: Configure Environment Variables

In Railway, go to your project → **Variables** tab and add:

### Required Variables

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Web3Auth
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# Smart Contract Addresses
NEXT_PUBLIC_DATA_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_ACCESS_TOKEN_FACTORY=0x...
NEXT_PUBLIC_CHAIN_ID=80002

# Node Environment
NODE_ENV=production
```

### Getting Your API Keys

1. **Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

2. **Supabase Credentials**
   - Go to your Supabase project dashboard
   - Settings → API
   - Copy `URL` and `anon public` key
   - Copy `service_role` key (keep this secret!)

3. **Web3Auth Client ID**
   - Go to [Web3Auth Dashboard](https://dashboard.web3auth.io/)
   - Create a project
   - Copy the Client ID

4. **Smart Contract Addresses**
   - Deploy contracts first (see contracts/README.md)
   - Copy the deployed addresses

## Step 4: Database Setup

### 4.1 Run Migrations

Make sure your Supabase database has all migrations applied:

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `supabase/migrations/001_add_blockchain_fields.sql`
   - `supabase/migrations/002_add_transactions_table.sql`

### 4.2 Verify Database Schema

Ensure these tables exist:
- `users`
- `assets`
- `transactions`

## Step 5: Deploy

### 5.1 Trigger Deployment

1. Railway will automatically deploy when you push to GitHub
2. Or manually trigger: Project → **Deployments** → **Redeploy**

### 5.2 Monitor Deployment

1. Watch the build logs in Railway dashboard
2. Check for any build errors
3. Verify the deployment completes successfully

### 5.3 Get Your Domain

1. Railway provides a default domain: `your-project.railway.app`
2. Or add a custom domain: **Settings** → **Domains** → **Add Domain**

## Step 6: Post-Deployment Checklist

- [ ] Verify the app loads at your Railway URL
- [ ] Test authentication (Web3Auth login)
- [ ] Test database connection (create a dataset)
- [ ] Test smart contract interactions (if deployed)
- [ ] Check environment variables are set correctly
- [ ] Monitor logs for errors

## Troubleshooting

### Build Fails

1. **Check build logs** in Railway dashboard
2. **Verify Node version** - Railway uses Node 18+ by default
3. **Check dependencies** - Ensure `package.json` is correct
4. **Verify environment variables** - All required vars must be set

### Runtime Errors

1. **Check application logs** in Railway
2. **Verify database connection** - Check Supabase URL and keys
3. **Check API keys** - Ensure all API keys are valid
4. **Verify contract addresses** - If using smart contracts

### Common Issues

**Issue:** "Module not found"
- **Solution:** Ensure all dependencies are in `package.json`

**Issue:** "Environment variable missing"
- **Solution:** Add all required env vars in Railway Variables

**Issue:** "Database connection failed"
- **Solution:** Check Supabase URL and service role key

**Issue:** "Web3Auth not working"
- **Solution:** Verify `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` is set correctly

## Updating the Deployment

To update your deployment:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin master
```

Railway will automatically detect the push and redeploy.

## Monitoring

- **Logs:** Railway dashboard → **Deployments** → Click on deployment → **Logs**
- **Metrics:** Railway dashboard → **Metrics** tab
- **Alerts:** Set up alerts in Railway for deployment failures

## Cost Optimization

- Railway offers a free tier with usage limits
- Monitor your usage in the **Usage** tab
- Consider upgrading if you exceed free tier limits

---

**Need Help?** Check Railway's [documentation](https://docs.railway.app) or open an issue in the repository.

