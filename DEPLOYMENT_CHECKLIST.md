# 🚀 PRISM Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [x] All TypeScript errors resolved
- [x] No console errors in browser
- [x] ESLint passing
- [x] Build successful (`npm run build`)
- [x] All pages load without errors
- [x] Mobile responsive tested

### Environment Variables
- [ ] `DATABASE_URL` - Neon production database
- [ ] `NEXTAUTH_URL` - Production URL (https://prism-hazel.vercel.app)
- [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `ANTHROPIC_API_KEY` - For AI analyses (optional)
- [ ] `OPENAI_API_KEY` - For AI analyses (optional)
- [ ] `SENDGRID_API_KEY` - For emails (optional)

### Database Setup
- [ ] Production database created on Neon
- [ ] Connection string obtained
- [ ] Schema migrated: `npm run db:migrate`
- [ ] Test data seeded: `npm run db:seed`
- [ ] Database accessible from Vercel

### Git Repository
- [x] All changes committed
- [x] Pushed to GitHub main branch
- [x] No sensitive data in repo (check .gitignore)
- [x] README.md complete

## Vercel Deployment

### Initial Setup
- [ ] Log in to Vercel (https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import from GitHub
- [ ] Select `jbandu/prism` repository
- [ ] Authorize Vercel to access repo

### Build Configuration
- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: **Leave blank** (vercel.json handles this)
- [ ] Build Command: Uses `vercel.json` configuration
- [ ] Output Directory: `prism-web/.next`
- [ ] Install Command: Uses `vercel.json` configuration

### Environment Variables

Add in Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/prism
NEXTAUTH_URL=https://prism-hazel.vercel.app
NEXTAUTH_SECRET=[generate with openssl rand -base64 32]
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
```

**For each variable**:
- Name: [KEY_NAME]
- Value: [SECRET_VALUE]
- Environment: Production, Preview, Development (select all)
- Click "Save"

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Check build logs for errors
- [ ] Deployment successful ✅

### Post-Deployment Verification
- [ ] Visit production URL
- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Client dashboard accessible
- [ ] No console errors
- [ ] All routes working

## Testing Checklist

### Admin Testing
- [ ] Log in as admin (jbandu@gmail.com)
- [ ] View admin dashboard
- [ ] See client list (BioRad, CoorsTek)
- [ ] Click client row → Detail modal opens
- [ ] Click "Add Client" → Multi-step form works
- [ ] Go to Analytics → Charts render
- [ ] Go to Settings → All sections display
- [ ] Navigate between pages → No errors

### Client Testing
- [ ] Log in as client (mhanif@bio-rad.com)
- [ ] View BioRad dashboard
- [ ] All metrics display correctly
- [ ] Charts render properly
- [ ] Portfolio breakdown shows data
- [ ] Replacement opportunities table works
- [ ] Cost trend chart displays
- [ ] Risk alerts show
- [ ] Recent activity displays
- [ ] Quick actions buttons present

### Mobile Testing
- [ ] Open on mobile device
- [ ] Responsive layout works
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Navigation works
- [ ] Forms usable
- [ ] Charts display correctly
- [ ] No horizontal scroll

### Performance Testing
- [ ] Homepage loads in <2s
- [ ] Dashboard loads in <3s
- [ ] Lighthouse score >90
- [ ] Images optimized
- [ ] No blocking resources

## Monitoring Setup

### Vercel Analytics
- [ ] Enable Vercel Analytics in dashboard
- [ ] Web Analytics enabled
- [ ] Speed Insights enabled

### Error Tracking (Optional)
- [ ] Sentry account created
- [ ] Sentry DSN added to env vars
- [ ] Test error tracking
- [ ] Configure alert rules

### Uptime Monitoring (Optional)
- [ ] UptimeRobot configured
- [ ] Check every 5 minutes
- [ ] Email alerts enabled

## Custom Domain (Optional)

- [ ] Domain purchased (e.g., prism.app)
- [ ] Add domain in Vercel
- [ ] Update DNS records:
  - A record: 76.76.19.19
  - CNAME: cname.vercel-dns.com
- [ ] Wait for DNS propagation (up to 48h)
- [ ] SSL certificate auto-issued
- [ ] Update NEXTAUTH_URL to custom domain

## Documentation

- [x] README.md complete
- [x] USER_GUIDE.md created
- [x] ADMIN_GUIDE.md created
- [ ] API documentation updated
- [ ] Deployment docs written

## Final Checks

### Security
- [ ] No API keys in code
- [ ] .env.local in .gitignore
- [ ] HTTPS enforced
- [ ] Authentication working
- [ ] CORS configured correctly

### SEO (Optional)
- [ ] Meta tags added
- [ ] Open Graph tags
- [ ] Favicon present
- [ ] Sitemap generated

### Legal (If Required)
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent banner

## Launch

- [ ] All above items checked ✅
- [ ] Stakeholders notified
- [ ] Welcome emails sent to clients
- [ ] Support ready
- [ ] Monitoring active

## Post-Launch

- [ ] Monitor first 24 hours closely
- [ ] Check error logs
- [ ] Gather user feedback
- [ ] Address any issues immediately
- [ ] Celebrate! 🎉

---

## Emergency Contacts

- **Technical Issues**: jbandu@gmail.com
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/support

## Rollback Plan

If critical issues found:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Investigate issue in staging
5. Fix and redeploy

---

**Date Deployed**: _____________
**Deployed By**: _____________
**Production URL**: https://prism-hazel.vercel.app

✅ **Deployment Complete!**
