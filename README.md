# Professional Inventory Management System

A production-ready Next.js application for tracking inventory across multiple warehouses with layaway management capabilities.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-6-green) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## ✨ Features

### Core Capabilities
- **Multi-Warehouse Inventory**: Track items across Small and Big warehouses (or add custom locations)
- **Vendor Management**: Organize by default vendors (Ashley, Nationwide, Coaster, Global) or add custom ones
- **Layaway System**: Reserve items for customers without reducing available stock
- **Search & Filter**: Real-time search across all fields with vendor/warehouse filtering
- **Low Stock Alerts**: Automatic notifications when items reach critical levels
- **User Authentication**: Secure JWT-based auth with HTTP-only cookies
- **Admin Dashboard**: User management for administrators (first user becomes admin)

### Design System
- **8-Point Spacing Grid**: Consistent rhythm throughout the entire application
- **Professional Typography**: Clear hierarchy with Inter font family
- **Disciplined Color Palette**: High-contrast, accessible colors - no generic gradients
- **Consistent Components**: All UI elements share the same design language
- **Subtle Animations**: Natural, purposeful interactions
- **Loading States**: Proper feedback for all async operations
- **Mobile Responsive**: Works seamlessly on all devices

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS with design system |
| **Database** | MongoDB | NoSQL document storage |
| **Authentication** | JWT + HTTP-only cookies | Secure session management |
| **Password Security** | bcryptjs | Hashed password storage |
| **Validation** | Zod | Runtime type validation |

---

## 📁 Project Structure

```
inventory-system/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── me/
│   │   │   └── logout/
│   │   ├── inventory/            # Inventory CRUD
│   │   │   ├── stats/
│   │   │   ├── [id]/
│   │   │   └── [id]/layaway/
│   │   ├── vendors/              # Vendor management
│   │   ├── warehouses/           # Warehouse management
│   │   └── admin/                # Admin user management
│   ├── (auth)/                   # Auth pages (login/register)
│   ├── (dashboard)/              # Protected dashboard pages
│   ├── globals.css               # Global styles + Tailwind
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── inventory/                # Inventory-specific components
│   └── admin/                    # Admin panel components
│
├── lib/                          # Utilities
│   ├── mongodb.ts                # Database connection
│   ├── auth.ts                   # JWT utilities
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # Type definitions
│
├── .env.local                    # Environment variables (DO NOT COMMIT)
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tailwind.config.js            # Design system configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🛠️ Local Development Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** v18+ ([Download](https://nodejs.org))
- **MongoDB** v6+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn** (comes with Node.js)

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd inventory-system
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
```bash
# Start MongoDB service from Services app
# Or run: mongod --dbpath C:\data\db
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### Step 4: Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and update the values:

```env
MONGODB_URI=mongodb://localhost:27017/inventory_system
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Create First User (Admin)

1. Go to http://localhost:3000
2. Click "Create Account"
3. Enter username and password
4. **First user automatically becomes admin**

---

## 🚢 Deployment Options

### Option 1: Vercel (Easiest - Recommended)

Vercel is the platform built by the Next.js team. Free tier available.

**Prerequisites:**
- MongoDB Atlas account (free tier: 512MB)

**Steps:**

1. **Create MongoDB Atlas Cluster** (5 minutes)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create free cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0` (allow all) for Vercel
   - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

3. **Add Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add:
     - `MONGODB_URI`: Your Atlas connection string
     - `JWT_SECRET`: Generated secure random string
     - `NEXT_PUBLIC_APP_URL`: Your Vercel URL (e.g., `https://your-app.vercel.app`)

4. **Redeploy**
   ```bash
   vercel --prod
   ```

**Cost:** Free for personal projects

---

### Option 2: Railway (Backend + Frontend)

Railway provides hosting for both app and database.

**Steps:**

1. **Create Account** at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add MongoDB Plugin**
   - Click "New" → "Database" → "Add MongoDB"
   - Railway will provide a connection string automatically

4. **Configure Environment Variables**
   - Add `JWT_SECRET`
   - `MONGODB_URI` is auto-set from the MongoDB plugin

5. **Deploy**
   - Railway auto-deploys on git push
   - Get your deployment URL

**Cost:** $5/month for 500 hours (Hobby plan)

---

### Option 3: Self-Hosted VPS (DigitalOcean, Linode, etc.)

For full control, host on your own server.

**Server Requirements:**
- 1 CPU, 2GB RAM minimum
- Ubuntu 22.04 LTS
- Ports 80, 443 open

**Complete Setup:**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 4. Install PM2 (process manager)
sudo npm install -g pm2

# 5. Clone your repository
cd /var/www
git clone <your-repo-url> inventory
cd inventory

# 6. Install dependencies
npm install

# 7. Create .env.local
nano .env.local
# Add your environment variables

# 8. Build application
npm run build

# 9. Start with PM2
pm2 start npm --name "inventory" -- start
pm2 save
pm2 startup

# 10. Install Nginx (reverse proxy)
sudo apt install -y nginx

# 11. Configure Nginx
sudo nano /etc/nginx/sites-available/inventory
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 12. Install SSL Certificate (free with Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 13. Setup firewall
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

**Cost:** $6-12/month (DigitalOcean/Linode basic droplet)

---

## 🏢 Should You Make It General or Furniture-Specific?

**Recommendation: Keep it GENERAL**

### Why General is Better:

✅ **Flexibility**: Works for furniture store AND your relative's business (even if different industry)
✅ **Future-proof**: Business needs change - general system adapts
✅ **Same effort**: No extra work to build general vs. specific
✅ **Professional**: Generic systems look more polished
✅ **Reusable**: Can deploy multiple instances for different businesses

### Implementation:

The current system is **already general-purpose**:
- Fields like "Item Number", "Description", "Vendor" work for any product
- Warehouse system works for any storage locations
- Layaway feature is retail-agnostic

### Customization Options:

If you want furniture-specific features later:
- Add custom fields (dimensions, material, color)
- Create furniture-specific templates
- Add product categories

But **start general** - it's the professional approach.

---

## 🔐 Security Best Practices

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use `MONGODB_URI` with authentication enabled
- [ ] Enable HTTPS (automatic with Vercel/Railway, manual with VPS)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly
- [ ] Regular database backups
- [ ] Monitor failed login attempts
- [ ] Keep dependencies updated

### Environment Variables

**Never commit `.env.local` to git!**

It's already in `.gitignore`. For production:
- Store secrets in hosting platform's dashboard
- Use environment variable injection
- Rotate secrets regularly

---

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  username: string,
  passwordHash: string,  // bcrypt hashed
  isAdmin: boolean,
  createdAt: Date
}
```

### Inventory Collection
```typescript
{
  _id: ObjectId,
  itemNumber: string,
  description: string,
  available: number,
  vendor: string,
  warehouse: string,
  reserved: number,
  status: "Available" | "Low Stock" | "Out of Stock" | "Partially Reserved",
  notes: string,
  owner: string,  // username
  layaways: [
    {
      id: string,
      customerName: string,
      phone: string,
      date: string,
      notes: string
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Design System

### Spacing (8-Point Grid)
- 1 unit = 8px
- All margins, padding, gaps use multiples of 8

### Typography
- **Display Large**: 36px / 40px line height
- **Display Medium**: 30px / 36px line height
- **Heading**: 20px / 28px line height
- **Body**: 16px / 24px line height
- **Caption**: 14px / 20px line height

### Colors
- **Primary**: `hsl(215, 25%, 27%)` - Professional slate
- **Success**: `hsl(142, 71%, 45%)` - Clear green
- **Warning**: `hsl(38, 92%, 50%)` - Amber alert
- **Destructive**: `hsl(0, 84%, 60%)` - Intentional red

### Component Patterns
- Border radius: 8px (large), 6px (medium), 4px (small)
- Shadows: Subtle, never dramatic
- Buttons: Consistent padding, clear hover states
- Forms: Proper labels, validation feedback

---

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production (catches errors)
npm run build
```

---

## 📈 Future Enhancements

Potential features to add:
- [ ] Bulk import/export (CSV)
- [ ] Barcode scanning
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Multi-store synchronization
- [ ] Product images
- [ ] Audit logs
- [ ] API documentation (Swagger)

---

## 🤝 Support

For issues or questions:
1. Check MongoDB is running: `mongosh`
2. Verify environment variables in `.env.local`
3. Check build logs: `npm run build`
4. Review browser console for errors

---

## 📄 License

This project is private and proprietary.

---

**Built with professional standards. No vibe coding. Every pixel intentional.**
