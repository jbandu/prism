# PRISM - Portfolio Risk Intelligence & Savings Management

AI-powered enterprise software asset management and cost optimization platform.

![PRISM Dashboard](https://img.shields.io/badge/Status-Production-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## 🚀 Features

### For Clients (Company Users)
- **📊 Comprehensive Dashboard** - Real-time portfolio overview with interactive charts
- **💰 Cost Optimization** - AI-powered analysis identifying immediate savings opportunities
- **🔄 Alternative Discovery** - Find better, cheaper software alternatives
- **📈 Usage Analytics** - Track license utilization and waste
- **🔔 Renewal Alerts** - Never miss a contract renewal
- **📑 Executive Reports** - Beautiful, shareable insights

### For Admins (Platform Operators)
- **👥 Client Management** - Manage multiple clients from one dashboard
- **📊 Platform Analytics** - Track portfolio value, savings delivered, client acquisition
- **⚙️ Configuration** - Customize AI agents, email templates, branding
- **🔑 API Management** - Secure key management for integrations
- **👤 User Management** - Add team members and manage permissions

### AI-Powered Features
- **Cost Optimization Agent** - Analyzes licenses, tiers, and negotiation leverage
- **Alternative Discovery Agent** - Intelligent software matching with feature comparison
- **Vendor Intelligence** - Real-time monitoring of vendor health and market trends
- **Risk Analysis** - Identifies financial and operational risks

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Authentication**: NextAuth.js
- **AI**: Anthropic Claude, OpenAI GPT-4
- **Deployment**: Vercel

## 📦 Project Structure

```
prism/
├── prism-web/              # Next.js application
│   ├── app/
│   │   ├── (admin)/        # Admin dashboard routes
│   │   ├── (company)/      # Client dashboard routes
│   │   ├── (auth)/         # Authentication routes
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   └── shared/         # Shared components
│   ├── lib/                # Utilities and helpers
│   └── types/              # TypeScript types
├── agents/                 # AI agent scripts (Python)
├── database/               # Database migrations and seeds
├── config/                 # Configuration files
└── utils/                  # Shared utilities
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database (Neon recommended)
- API keys: Anthropic, OpenAI (optional)

### Environment Variables

Create `.env` file in `prism-web/`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host/prism"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI APIs (optional)
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-..."

# Email (optional)
SENDGRID_API_KEY="SG...."
```

### Installation

```bash
# Clone the repository
git clone https://github.com/jbandu/prism.git
cd prism

# Install dependencies
cd prism-web
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment (Vercel)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jbandu/prism)

### Manual Deployment

1. **Connect GitHub Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env` file

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Build Configuration

The project uses `vercel.json` to configure the build from the `prism-web` subdirectory:

```json
{
  "version": 2,
  "builds": [{
    "src": "prism-web/package.json",
    "use": "@vercel/next"
  }]
}
```

## 📝 Development Workflow

### Running Locally

```bash
cd prism-web
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Database Commands

```bash
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:reset       # Reset database
```

### Testing

```bash
npm run test           # Run tests
npm run test:e2e       # Run E2E tests
```

## 🧪 Testing Checklist

- [ ] Login as admin (jbandu@gmail.com)
- [ ] View all companies
- [ ] Add new company with multi-step form
- [ ] Login as client (mhanif@bio-rad.com)
- [ ] View BioRad dashboard
- [ ] Add software manually
- [ ] View alternatives page
- [ ] Check renewals page
- [ ] Generate report
- [ ] Test mobile responsive design
- [ ] Verify fast loading (<2s)
- [ ] Check browser console for errors

## 📊 Database Schema

Key tables:
- `companies` - Client organizations
- `users` - Admin and client users
- `software` - Software inventory
- `usage_analytics` - License utilization tracking
- `alternatives` - AI-generated alternative recommendations
- `vendor_intelligence` - Vendor risk and market data
- `agent_analyses` - AI analysis results
- `client_reports` - Generated reports

## 🔐 Security

- Authentication via NextAuth.js with secure sessions
- API routes protected with middleware
- SQL injection prevention with parameterized queries
- Environment variables for sensitive data
- HTTPS enforced in production
- CORS configured for API routes

## 🎨 UI/UX Features

- **Animations**: Smooth page transitions, fade-ins, zoom effects
- **Loading States**: Skeleton loaders, progress indicators
- **Empty States**: Beautiful illustrations and clear CTAs
- **Error Handling**: Friendly messages with retry options
- **Mobile Optimized**: Responsive breakpoints, touch-friendly
- **Accessibility**: Keyboard navigation, ARIA labels, WCAG AA compliant

## 📈 Performance

- Lighthouse Score: 90+
- Code splitting and lazy loading
- Image optimization
- Database query optimization
- API response caching
- Fast page loads (<2s)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [User Guide](./USER_GUIDE.md) - For client users
- [Admin Guide](./ADMIN_GUIDE.md) - For platform administrators
- [API Documentation](./prism-web/API_DOCUMENTATION.md) - API reference

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Email: jbandu@gmail.com

## 🙏 Acknowledgments

- Built with Next.js, TypeScript, and shadcn/ui
- AI powered by Anthropic Claude
- Charts by Recharts
- Database by Neon
- Deployed on Vercel

---

**Made with ❤️ for enterprise software asset management**
