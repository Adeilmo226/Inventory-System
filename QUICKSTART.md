# Quick Start Guide

## Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy template
cp .env.example .env.local

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env.local and paste the generated secret into JWT_SECRET
```

### 3. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Windows - Start MongoDB service
# Linux
sudo systemctl start mongod
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Open Browser
Go to http://localhost:3000 and create your first account (becomes admin automatically)

---

## Deploy to Vercel (5 minutes)

### Prerequisites
1. Create MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas/register
2. Create a cluster and get connection string
3. Create Vercel account (free): https://vercel.com

### Steps
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/inventory_system
# - JWT_SECRET: (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - NEXT_PUBLIC_APP_URL: https://your-app.vercel.app

# Redeploy with env vars
vercel --prod
```

Done! Your app is live at `https://your-app.vercel.app`

---

## Common Issues

### "Can't connect to MongoDB"
- Check MongoDB is running: `mongosh`
- Verify MONGODB_URI in .env.local

### "JWT_SECRET is not defined"
- Make sure you copied .env.example to .env.local
- Generate a secret and add it

### "Port 3000 already in use"
- Kill the process: `lsof -ti:3000 | xargs kill`
- Or use different port: `PORT=3001 npm run dev`

---

## Next Steps

1. **Customize**:
   - Update metadata in `app/layout.tsx`
   - Add your company name/logo
   - Adjust colors in `tailwind.config.js`

2. **Deploy**:
   - See README.md for full deployment guide
   - Vercel (easiest), Railway, or VPS

3. **Secure**:
   - Change JWT_SECRET before production
   - Enable MongoDB authentication
   - Use HTTPS

---

**Need help?** Check the full README.md
