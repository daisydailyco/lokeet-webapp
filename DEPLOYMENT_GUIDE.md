# Lokeet Web App - Deployment Guide

Complete guide to deploying the Next.js web app to production.

---

## 🎯 Overview

You're migrating from:
- **Old:** `ps-webapp` (simple static site at www.parasosh.io)
- **New:** `ps-webapp-next` (full Next.js app at www.lokeet.io)

---

## 🚀 Deployment Steps

### 1. Pre-Deployment Checklist

- [ ] Test locally: `npm run dev` works
- [ ] All features tested (see TESTING_GUIDE.md)
- [ ] Backend is running (Railway)
- [ ] Vercel account ready
- [ ] Domain available (www.lokeet.io)

### 2. Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy from ps-webapp-next directory
cd ps-webapp-next
vercel --prod
```

**Follow prompts:**
- Set up and deploy? → **Yes**
- Scope? → **Your team**
- Link to existing project? → **No**
- Project name? → **lokeet-webapp**
- Directory? → **./`** (current directory)
- Override settings? → **No**

#### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select your GitHub repo: `daisydailyco/lokeet-webapp`
4. Select **Root Directory:** `ps-webapp-next`
5. Click **Deploy**

### 3. Configure Environment Variables

**In Vercel Dashboard:**
1. Go to your project
2. **Settings → Environment Variables**
3. Add variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://web-production-5630.up.railway.app/v1`
   - **Environment:** Production (and Preview)
4. Click **Save**
5. **Redeploy** (trigger new deployment for env var to take effect)

**Or via CLI:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://web-production-5630.up.railway.app/v1

vercel env add NEXT_PUBLIC_API_URL preview
# Paste: https://web-production-5630.up.railway.app/v1
```

### 4. Test the Deployment

Vercel will give you a URL like: `https://lokeet-webapp.vercel.app`

**Test thoroughly:**
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard displays
- [ ] Create save works
- [ ] Profile page loads
- [ ] Edit profile works
- [ ] Share functionality works

Use your test account: `test@lokeet.io` / `TestPassword123!`

### 5. Add Custom Domain

**In Vercel Dashboard:**
1. Go to your **lokeet-webapp** project
2. **Settings → Domains**
3. Click **Add Domain**
4. Enter: `www.lokeet.io`
5. Follow DNS instructions

**DNS Setup (depends on your provider):**

If DNS is with Vercel:
- Already configured

If DNS is external (Namecheap, GoDaddy, etc.):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Or if using A records:
```
Type: A
Name: @
Value: 76.76.21.21
```

### 6. Migrate from Old Site

**Once new site is working:**

1. **Remove domain from old project:**
   - Go to old `parasosh-webapp` project
   - Settings → Domains
   - Remove `www.parasosh.io`

2. **Add domain to new project:**
   - Already done in Step 5

3. **Update DNS** (if needed):
   - Point www.lokeet.io to new Vercel deployment

4. **Archive old project:**
   - Keep for reference or delete
   - Settings → General → Delete Project

---

## 🔧 Troubleshooting

### Build Fails

**Error:** "Module not found"
```bash
# Fix: Install dependencies
npm install
npm run build
```

**Error:** "Type errors"
```bash
# Fix: Check TypeScript errors
npm run build
# Fix errors shown, then redeploy
```

### Environment Variable Not Working

1. Check it's spelled correctly: `NEXT_PUBLIC_API_URL`
2. Must start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after adding env vars
4. Check browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)`

### API Not Connecting

1. Check Railway backend is running:
   ```
   https://web-production-5630.up.railway.app/health
   ```

2. Check CORS in backend (already configured)

3. Check browser console for errors

4. Test API directly:
   ```javascript
   fetch('https://web-production-5630.up.railway.app/v1/health')
     .then(r => r.json())
     .then(console.log)
   ```

### Domain Not Working

1. DNS takes time (up to 48 hours, usually 10-30 minutes)
2. Check DNS propagation: https://dnschecker.org
3. Verify CNAME/A records are correct
4. Try clearing browser cache
5. Try incognito mode

### 404 on Routes

If `/dashboard` or `/@username` shows 404:
1. Vercel should auto-configure Next.js routing
2. Check `vercel.json` (if exists) doesn't override routing
3. Check build logs for errors
4. Redeploy

---

## 🎨 Post-Deployment

### Update Extension

Update extension's `manifest.json`:
```json
"host_permissions": [
  "*://www.lokeet.io/*",
  "*://lokeet.io/*"
]
```

### Update Backend

If using custom domain for backend:
```javascript
// In .env.local
NEXT_PUBLIC_API_URL=https://api.lokeet.io/v1
```

### Set Up Analytics (Optional)

Add to Vercel project:
1. **Settings → Analytics**
2. Enable **Web Analytics**
3. Or integrate Google Analytics

### Enable Preview Deployments

Vercel automatically creates preview deployments for:
- Pull requests
- Non-main branches

Test features before merging to main.

---

## 📊 Monitoring

### Check Deployment Status

```bash
vercel list
vercel inspect <deployment-url>
```

### View Logs

```bash
vercel logs <deployment-url>
```

Or in dashboard: **Deployments → [Click deployment] → Logs**

### Performance

Check in Vercel Dashboard:
- **Analytics** - Page views, visitors
- **Speed Insights** - Performance scores
- **Logs** - Errors and issues

---

## 🔄 Redeployment

When you make changes:

```bash
# Option 1: Auto-deploy via Git
git push origin main
# Vercel auto-deploys on push

# Option 2: Manual deploy
vercel --prod
```

### Force Rebuild

```bash
vercel --prod --force
```

---

## 🌐 Multiple Environments

### Setup

1. **Production:** `www.lokeet.io` (main branch)
2. **Staging:** `staging.lokeet.io` (staging branch)
3. **Preview:** Auto URLs (feature branches)

### Configure

In Vercel Dashboard:
- **Settings → Git**
- Production Branch: `main`
- Enable automatic deployments

---

## 📝 Deployment Checklist

Before going live:

- [ ] Local testing complete
- [ ] Build succeeds
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Test on Vercel URL
- [ ] Custom domain added
- [ ] DNS configured
- [ ] Test on custom domain
- [ ] Old site removed
- [ ] Extension updated
- [ ] Announced to users

---

## 🆘 Rollback Plan

If something goes wrong:

### Quick Rollback

```bash
# Find previous deployment
vercel list

# Promote previous deployment
vercel promote <previous-deployment-url>
```

### Emergency: Restore Old Site

1. Go to old `parasosh-webapp` project
2. Settings → Domains → Add `www.lokeet.io`
3. Users see old site while you fix new one

---

## 📞 Support

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Next.js Issues:**
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

**Lokeet Issues:**
- Check TESTING_GUIDE.md
- Check browser console
- Check Vercel logs
- Check Railway logs (backend)

---

## ✅ Success Criteria

Deployment is successful when:

1. **Site is accessible**
   - www.lokeet.io loads
   - All pages render correctly

2. **Authentication works**
   - Can sign up
   - Can log in
   - Session persists

3. **Features work**
   - Dashboard displays saves
   - Profile pages accessible
   - Can create/delete saves
   - Share links work

4. **Performance is good**
   - Fast page loads (<3s)
   - No console errors
   - Mobile responsive

5. **SEO is configured**
   - Meta tags present
   - Social sharing works
   - Sitemap generated

---

**Ready to deploy!** Follow the steps above and your full-featured Lokeet web app will be live. 🚀
