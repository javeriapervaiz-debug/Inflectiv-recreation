# GitHub Setup Guide

Follow these steps to upload your project to GitHub.

## Step 1: Check Current Git Status

```bash
git status
```

You should see untracked files. If you see "not a git repository", initialize it first:
```bash
git init
```

## Step 2: Add Remote Repository

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/javeriapervaiz-debug/Inflectiv-recreation.git

# Verify it was added
git remote -v
```

**Note:** If the remote already exists, remove it first:
```bash
git remote remove origin
git remote add origin https://github.com/javeriapervaiz-debug/Inflectiv-recreation.git
```

## Step 3: Stage All Files

```bash
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status
```

You should see:
- ✅ All source files (src/, contracts/, supabase/)
- ✅ Configuration files (package.json, tsconfig.json, etc.)
- ✅ Documentation (README.md, summary.md, DEPLOYMENT.md)
- ❌ node_modules/ (ignored)
- ❌ .env.local (ignored)
- ❌ .next/ (ignored)
- ❌ build artifacts (ignored)

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Inflectiv Web3 Data Marketplace

- Complete Next.js frontend with Windows-style desktop UI
- Smart contracts (DataNFT, AccessToken, Marketplace)
- Supabase database integration
- Web3Auth authentication
- AI-powered data ingestion with LangChain + Gemini
- Marketplace and earnings dashboard
- Full tokenization and access control system"
```

## Step 5: Push to GitHub

### Option A: If Repository is Empty

```bash
# Push to master branch
git push -u origin master
```

### Option B: If Repository Has Content (README, .gitignore, etc.)

```bash
# First, pull and merge
git pull origin master --allow-unrelated-histories

# Resolve any conflicts if prompted
# Then push
git push -u origin master
```

### Option C: If Default Branch is 'main'

```bash
# Push to main branch instead
git push -u origin master:main
```

## Step 6: Verify Upload

1. Go to https://github.com/javeriapervaiz-debug/Inflectiv-recreation
2. Verify all files are present
3. Check that sensitive files (.env.local) are NOT visible

## Troubleshooting

### Error: "Repository not found"
- Verify the repository URL is correct
- Check that you have push access to the repository
- You may need to authenticate with GitHub

### Error: "Permission denied"
- Set up SSH keys or use HTTPS with personal access token
- For HTTPS: `git remote set-url origin https://YOUR_TOKEN@github.com/javeriapervaiz-debug/Inflectiv-recreation.git`

### Error: "Updates were rejected"
- The remote has commits you don't have locally
- Pull first: `git pull origin master --rebase`
- Then push: `git push -u origin master`

### Large File Warnings
- If you see warnings about large files, check `.gitignore`
- Remove large files from git history if needed:
  ```bash
  git rm --cached large-file.ext
  git commit -m "Remove large file"
  ```

## Next Steps

After successfully pushing to GitHub:
1. ✅ Proceed to Railway deployment (see DEPLOYMENT.md)
2. ✅ Set up environment variables in Railway
3. ✅ Deploy and test your application

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway deployment instructions.

