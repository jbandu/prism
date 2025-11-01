# PRISM Web Application

**Portfolio Risk Intelligence & Savings Management**

A production-ready Next.js 14 application for enterprise software asset management and AI-powered cost optimization.

## Features

- **Admin Dashboard**: Manage multiple companies and their software portfolios
- **Company Dashboards**: Detailed view of software spend and optimization opportunities
- **Cost Optimization**: AI-powered analysis for immediate savings
- **Alternative Discovery**: Find better, cheaper software alternatives
- **Vendor Intelligence**: Track vendor health and market trends
- **Reports & Analytics**: Executive summaries and detailed insights

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom PRISM brand colors
- **UI Components**: shadcn/ui + Radix UI
- **Database**: PostgreSQL (Neon serverless)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prism.git
cd prism/prism-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
prism-web/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (admin)/             # Admin-only routes
│   │   ├── dashboard/
│   │   ├── companies/
│   │   └── layout.tsx
│   ├── (company)/           # Company-specific routes
│   │   └── [companyId]/
│   │       ├── dashboard/
│   │       ├── software/
│   │       ├── alternatives/
│   │       ├── reports/
│   │       └── settings/
│   ├── api/                 # API routes
│   │   ├── companies/
│   │   ├── software/
│   │   └── agents/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/
│   ├── charts/
│   └── shared/
├── lib/
│   ├── db.ts               # Database connection
│   ├── auth.ts
│   └── utils.ts
├── types/
│   └── index.ts            # TypeScript types
└── public/
```

## Brand Colors

PRISM uses a carefully crafted color palette:

- **Primary**: `#0066FF` (Electric Blue) - Main actions, primary navigation
- **Secondary**: `#00C9A7` (Emerald) - Success states, positive metrics
- **Accent**: `#FF6B6B` (Coral) - Alerts, warnings, critical items
- **Dark**: `#1A1A2E` (Navy) - Text, backgrounds, sidebars

Access colors in Tailwind:
```tsx
className="bg-prism-primary text-prism-secondary"
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Routes

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create new company

### Software
- `GET /api/software?companyId=xxx` - List software for company
- `POST /api/software` - Add new software

### Agents
- `POST /api/agents/cost-optimization` - Run cost optimization analysis

## Database Setup

The application expects a PostgreSQL database with the PRISM schema. See the main PRISM repository for the complete schema (`prism_schema_fixed.sql`).

## Authentication

Authentication is configured for NextAuth.js. Currently showing demo pages - implement auth providers as needed:

- Email/Password
- OAuth (Google, Microsoft, etc.)
- SAML for enterprise

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

### Docker

```bash
# Build
docker build -t prism-web .

# Run
docker run -p 3000:3000 prism-web
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/prism/issues](https://github.com/yourusername/prism/issues)
- Email: support@prism.example.com

---

Built with ❤️ using Next.js 14 and shadcn/ui
