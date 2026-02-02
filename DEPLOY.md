# Deployment Instructions

## Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gitoutofhere7/japan-post-demo&env=TINYFISH_API_KEY&envDescription=TinyFish%20API%20Key%20from%20mino.ai&envLink=https://docs.mino.ai)

Click the button above and follow the prompts!

### Option 2: Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to project directory
cd "/Users/sn/Work/Customer Demos videos/japan-post-demo"

# Login to Vercel (use token: hIurjz2tRVOiyqlagAMZYNrl)
vercel login

# Add environment variable
vercel env add TINYFISH_API_KEY production
# When prompted, enter: sk-mino-ryawPOUEUxGTGSgoGX3Qg8DTkOV8Htm3

# Deploy to production
vercel --prod
```

### Option 3: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import git repository: `gitoutofhere7/japan-post-demo`
3. Add environment variable:
   - Key: `TINYFISH_API_KEY`
   - Value: `sk-mino-ryawPOUEUxGTGSgoGX3Qg8DTkOV8Htm3`
4. Click "Deploy"

## 🌐 Expected URL

After deployment, your demo will be live at:
```
https://japan-post-demo.vercel.app
```

Or a custom domain if you've configured one.

## 🧪 Test Deployment

Once deployed, test by visiting the URL. The demo should:
1. Auto-start within 1 second
2. Show "Starting TinyFish agent..." status
3. Navigate to Japan Post form
4. Fill form with dummy data
5. Show "Demo complete" (without submitting)

## 🐛 Troubleshooting

### Error: "TinyFish API error"
- Check that `TINYFISH_API_KEY` environment variable is set correctly
- Verify API key is valid at https://docs.mino.ai

### Error: "Demo connection lost"
- Check Vercel function logs
- Ensure serverless function timeout is set to 120s (default is 10s)

### Blank page or CSS not loading
- Check that all static files are committed to Git
- Verify Vercel build succeeded in dashboard

## 📊 Monitor

View deployment logs and analytics:
```
vercel logs --follow
```

Or visit: https://vercel.com/gitoutofhere7/japan-post-demo

---

**Deployment Status**: ✅ Pushed to GitHub
**Repository**: https://github.com/gitoutofhere7/japan-post-demo
**Next Step**: Deploy to Vercel using one of the options above
