# KrashBoard V3

A modern sports analytics and betting dashboard built with Next.js 15, featuring real-time data, advanced analytics, and responsive design.

## 🚀 Features

- **Multi-Sport Support**: NFL, MLB, NBA, NHL
- **Real-Time Data**: Live stats, odds, and insights
- **Advanced Tools**: Prop Lab, Weather Analysis, DVP, Correlation Analysis
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Mode**: Theme switching with system preference detection
- **Data Accuracy**: 100% accurate data from trusted sources

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom design system
- **Database**: Google BigQuery for analytics data
- **Auth**: Supabase for user management
- **State**: Zustand for global state management
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Theme**: next-themes for light/dark mode
- **Animations**: Framer Motion

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── nfl/               # NFL-specific pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── sports/           # Sport-specific components
│   ├── shared/           # Shared components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── bigquery.ts       # BigQuery integration
│   ├── supabase.ts       # Supabase integration
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
└── types/                # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud account with BigQuery access
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KrashBoard_v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google Cloud service account key
   - `BIGQUERY_PROJECT_ID`: Your BigQuery project ID

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Sources

### BigQuery Tables
- `nfl_info.Matchups_2024/2025`: Game matchups and schedules
- `nfl_info.player_list`: Player information and rosters
- `nfl_silver.Player_Gamelogs_v3`: Individual player statistics
- `nfl_silver.Team_Gamelogs_v3`: Team statistics
- `odds.Player_Props`: Player prop betting lines
- `odds.team_markets`: Team betting markets

### NBA Player Props (The Market / +EV)
- **Data flow**: One cached payload from `/api/nba/props` (BigQuery table `nba25-475715.webapp.nba_player_props_long_v1`). Server-side in-memory cache keyed by `start_date`/`end_date`; all filtering and sorting is client-side. No refetch when filters change.
- **Env vars**: `NBA_GCP_PROJECT_ID` (default `nba25-475715`), `NBA_GCP_KEY_FILE` (same pattern as NHL/MLB), `PROPS_CACHE_TTL_SECONDS` (default 45). Response includes `Cache-Control: s-maxage=45, stale-while-revalidate=60` for edge caching.

## 🎨 Design System

### Color Palette
- **Brand Blue**: #5F85DB (primary)
- **Brand Blue Light**: #90B8F8 (accent)
- **Brand Blue Dark**: #3B5B9A (dark)

### Typography Scale
- **Mobile**: 12px base, 14px body, 16px headings
- **Tablet**: 14px base, 16px body, 18px headings
- **Desktop**: 16px base, 18px body, 20px headings

### Spacing System
- **Minimal padding**: 16px outer, 12px inner
- **Card spacing**: 24px between cards
- **Section spacing**: 32px between sections

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px (portrait), < 768px (landscape)
- **Tablet**: < 834px (portrait), < 1024px (landscape)
- **Desktop**: < 1440px
- **Ultrawide**: > 1440px (maintains max-width)

### Mobile-First Approach
1. Start with mobile layout (320px width)
2. Progressive enhancement for larger screens
3. Touch-optimized interactions
4. Stacked layouts with proper spacing

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Consistent formatting
- **Comments**: JSDoc for complex functions

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📈 Performance

### Target Metrics
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle size**: < 500KB initial

### Optimization Features
- Static generation where possible
- ISR for dynamic content
- Edge runtime for API routes
- Image optimization with Next.js Image
- Code splitting and lazy loading

## 🔒 Security

- Environment variables for sensitive data
- API route protection
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

### Phase 1 ✅
- [x] Core architecture and theming
- [x] Responsive layout and navigation
- [x] Loading states and animations
- [x] NFL Prop Lab functionality

### Phase 2 🚧
- [ ] Player dashboards and stats
- [ ] Real-time data integration
- [ ] Advanced filtering and search

### Phase 3 📋
- [ ] Additional NFL tools
- [ ] MLB, NBA, NHL sections
- [ ] User authentication and preferences
- [ ] Mobile app (React Native)

---

**Built with ❤️ by the KrashBoard Team**
