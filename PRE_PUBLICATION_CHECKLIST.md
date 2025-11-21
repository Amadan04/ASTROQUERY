# 🔒 PRE-PUBLICATION SECURITY CHECKLIST

## ⚠️ CRITICAL - DO BEFORE MAKING REPOSITORY PUBLIC

This checklist ensures your repository is safe to publish. Complete ALL items before changing visibility to public.

---

## 🔴 IMMEDIATE ACTIONS (CRITICAL)

### ✅ 1. Revoke Exposed API Keys

Your old API keys were exposed in the `.env` file. Even though we deleted it, **they still exist in Git history**.

**Action Required:**

- [ ] **OpenRouter API Key**
  - Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
  - **DELETE** the old key: `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`
  - Generate a **NEW** API key
  - Save it securely (we'll use it later)

- [ ] **NCBI API Key**
  - Go to [https://www.ncbi.nlm.nih.gov/account/](https://www.ncbi.nlm.nih.gov/account/)
  - Regenerate your API key
  - Save it securely

---

### ✅ 2. Clean Git History (CHOOSE ONE OPTION)

The old `.env` file with secrets exists in previous commits. You must remove it from history.

**OPTION A: Nuclear Option (Recommended - Easiest)**

Start fresh with a clean history:

```bash
# Back up your current code first!
cd ..
cp -r NASA-dashboard NASA-dashboard-backup

# Remove all git history
cd NASA-dashboard
rm -rf .git

# Initialize fresh repository
git init
git add .
git commit -m "Initial commit - Public release v1.0"
```

**OPTION B: Remove Specific Files from History (Advanced)**

Use BFG Repo-Cleaner:

```bash
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env from all history
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**OPTION C: Use git-filter-repo (Advanced)**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove .env from history
git filter-repo --path nasa-dashboard-backend-master/.env --invert-paths
```

- [ ] Completed Git history cleanup

---

### ✅ 3. Verify Clean State

```bash
# Check that no sensitive files are tracked
git status

# Should NOT see any .env files or large data files
# Should see new files ready to be added
```

Expected output:
- ✅ New files: README.md, LICENSE, SECURITY.md, .env.example, setup scripts
- ✅ Modified: .gitignore, package.json
- ✅ Deleted: Large data files (.npy, .index, .db)
- ❌ NO .env files visible

- [ ] Verified clean git status
- [ ] No `.env` files in git status
- [ ] No large data files (*.db, *.npy, *.index)

---

## 🟡 CONFIGURATION UPDATES

### ✅ 4. Update Repository Information

Edit these files and replace placeholders:

**package.json** - Update:
```json
"author": "Your Name <your-email@example.com>",
"repository": {
  "url": "https://github.com/YOUR_USERNAME/NASA-dashboard.git"
}
```

**SECURITY.md** - Update:
- Line 10: Replace `your-email@example.com` with your actual email
- Line 12: Replace `YOUR_USERNAME` with your GitHub username

**README.md** - Update:
- Line 77: Replace `YOUR_USERNAME` with your GitHub username
- Multiple lines: Replace repository URLs

- [ ] Updated package.json author and repository URL
- [ ] Updated SECURITY.md email and URLs
- [ ] Updated README.md repository URLs
- [ ] Replaced all `YOUR_USERNAME` placeholders

---

### ✅ 5. Create Your Local .env File

For your own development, create a `.env` file with your NEW API keys:

```bash
cd nasa-dashboard-backend-master
cp .env.example .env

# Edit .env and add your NEW keys
# Use notepad, vim, nano, or any text editor
```

Edit `.env` and add:
- Your NEW OpenRouter API key
- Your NEW NCBI API key

**IMPORTANT:** This `.env` file should NEVER be committed!

- [ ] Created local .env file
- [ ] Added NEW API keys to .env
- [ ] Verified .env is in .gitignore

---

## 🟢 REPOSITORY PREPARATION

### ✅ 6. Stage and Commit Changes

```bash
# Add all new and modified files
git add .

# Create commit
git commit -m "Prepare repository for public release

- Add comprehensive README with setup instructions
- Add MIT License
- Add Security policy
- Create .env.example templates
- Update .gitignore for sensitive files
- Add setup scripts for Windows and Linux/macOS
- Remove sensitive data and large files
- Update package.json metadata"
```

- [ ] Staged all changes
- [ ] Created commit
- [ ] Verified commit message is descriptive

---

### ✅ 7. Final Verification

Before pushing, do a final check:

```bash
# Check what will be pushed
git log --oneline

# Verify no secrets in files
git grep -i "sk-or-v1"  # Should return nothing
git grep -i "67dd8fef"  # Should return nothing

# List all files that will be in the repo
git ls-files
```

- [ ] Verified no old API keys in repository
- [ ] Checked commit history looks clean
- [ ] Listed files - no .env or large data files

---

### ✅ 8. Update GitHub Repository Settings

After pushing, configure your GitHub repository:

**Basic Settings:**
- [ ] Set repository description: "AI-powered NASA space biology research dashboard with semantic search and knowledge graph visualization"
- [ ] Add website URL (if deployed)
- [ ] Add topics/tags: `nasa`, `space-biology`, `ai`, `semantic-search`, `flask`, `vite`, `machine-learning`

**Security Settings:**
Go to Settings → Security:
- [ ] Enable **Dependabot alerts**
- [ ] Enable **Dependabot security updates**
- [ ] Enable **Secret scanning**
- [ ] Enable **Code scanning** (if available)

**Features:**
- [ ] Enable **Issues**
- [ ] Enable **Discussions** (optional)
- [ ] Disable **Wikis** (unless needed)
- [ ] Disable **Projects** (unless needed)

---

## 📝 FINAL STEPS

### ✅ 9. Push to GitHub

```bash
# If this is a fresh repo (Option A from step 2):
git remote add origin https://github.com/YOUR_USERNAME/NASA-dashboard.git
git branch -M main
git push -u origin main --force

# If you cleaned history (Options B or C from step 2):
git push origin main --force

# If you kept history clean from the start:
git push origin main
```

**WARNING:** The `--force` flag rewrites history. Only use if you cleaned the history.

- [ ] Pushed to GitHub
- [ ] Verified push was successful

---

### ✅ 10. Change Repository Visibility

**ONLY AFTER ALL ABOVE STEPS ARE COMPLETE:**

1. Go to GitHub repository Settings
2. Scroll to bottom → "Danger Zone"
3. Click "Change visibility"
4. Select "Public"
5. Type repository name to confirm
6. Click "I understand, change repository visibility"

- [ ] Changed repository to public
- [ ] Verified repository is accessible at public URL

---

## 🎉 POST-PUBLICATION

### ✅ 11. Test the Public Repository

Clone your repository as a new user would:

```bash
# In a different directory
cd /tmp
git clone https://github.com/YOUR_USERNAME/NASA-dashboard.git
cd NASA-dashboard

# Test setup process
./setup.sh  # On Linux/macOS
# OR
setup.bat   # On Windows
```

- [ ] Successfully cloned repository
- [ ] Setup script runs without errors
- [ ] No sensitive data visible in repository

---

### ✅ 12. Update Documentation Links

Create a new issue or discussion to track:
- Setup instructions feedback
- Bug reports
- Feature requests

- [ ] Created initial GitHub Issue templates (optional)
- [ ] Posted welcome message in Discussions (optional)

---

## 📊 COMPLETION STATUS

Mark when complete:

- [ ] **Phase 1:** Revoked old API keys ✅ CRITICAL
- [ ] **Phase 2:** Cleaned Git history ✅ CRITICAL
- [ ] **Phase 3:** Verified clean state ✅ CRITICAL
- [ ] **Phase 4:** Updated configuration
- [ ] **Phase 5:** Created local .env
- [ ] **Phase 6:** Committed changes
- [ ] **Phase 7:** Final verification
- [ ] **Phase 8:** GitHub settings
- [ ] **Phase 9:** Pushed to GitHub
- [ ] **Phase 10:** Made repository public
- [ ] **Phase 11:** Tested public clone
- [ ] **Phase 12:** Post-publication tasks

---

## 🆘 TROUBLESHOOTING

### If You Accidentally Pushed Secrets:

1. **Immediately** revoke the exposed API keys
2. Delete the repository from GitHub
3. Clean Git history locally (see Step 2)
4. Create a new repository and push cleaned version
5. Generate new API keys

### If Setup Fails:

1. Check Python version: `python --version` (need 3.8+)
2. Check Node.js version: `node --version` (need 16+)
3. Verify .env file exists and has valid keys
4. Check virtual environment activation

### If Large Files Won't Push:

```bash
# Check file sizes
git ls-files | xargs ls -lh | sort -k5 -h

# Files larger than 50MB should be in .gitignore
# Ensure biodash.db and *.npy files are ignored
```

---

## ✅ READY TO PUBLISH?

You are ready to make your repository public when:

- ✅ All old API keys are revoked
- ✅ New API keys are generated and secure
- ✅ Git history is clean (no .env in history)
- ✅ All sensitive files are deleted
- ✅ .gitignore is comprehensive
- ✅ README.md is complete and professional
- ✅ LICENSE file exists
- ✅ SECURITY.md policy exists
- ✅ All placeholders (YOUR_USERNAME, etc.) are replaced
- ✅ Repository settings are configured
- ✅ You can successfully clone and run the project

---

**Good luck with your public release! 🚀**