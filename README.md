# TradeSense AI - Prop Trading Challenge Platform

TradeSense AI is a full-stack proprietary trading challenge platform built with Flask (Python) and React (Vite). It offers trading challenges, real-time market data, AI-powered insights, leaderboards, and multi-language support (English, French, Arabic).

## Features

- **🎯 Trading Challenges**: Multiple challenge tiers (Starter, Pro, Elite) with different capital levels
- **📊 Real-time Market Data**: Live stock prices, charts, and trading data
- **🤖 AI-Powered Insights**: Trading signals and risk analysis (coming soon)
- **💼 Portfolio Management**: Track positions with real-time P&L calculations
- **🏆 Leaderboard**: Monthly rankings and performance tracking
- **🌍 Multi-Language**: Support for English, French, and Arabic (RTL)
- **🌙 Dark Mode**: System-wide dark/light theme support
- **💳 Payment Integration**: CMI, Crypto, and PayPal payment options (mock)
- **👨‍💼 Admin Panel**: User management and system monitoring

## Tech Stack

**Backend:**
- Flask (Python 3.8+)
- PostgreSQL / SQLite
- Flask-SQLAlchemy (ORM)
- Flask-CORS
- PyJWT (Authentication)
- yfinance (Market Data)
- BeautifulSoup4 (Web Scraping)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router v7
- Axios
- react-i18next (Internationalization)
- Recharts & Lightweight Charts

## Project Structure

```
tradeapp/
├── backend/                    # Flask REST API
│   ├── app.py                 # Flask application factory
│   ├── config.py              # Configuration settings
│   ├── models.py              # SQLAlchemy models
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API route blueprints
│   │   ├── auth/              # Authentication
│   │   ├── challenges/        # Challenge management
│   │   ├── trades/            # Trade execution
│   │   ├── leaderboard/       # Rankings
│   │   ├── payments/          # Payment processing
│   │   ├── market.py          # Market data
│   │   └── admin.py           # Admin operations
│   ├── services/              # Business logic
│   │   ├── challenge_engine.py
│   │   ├── market_data.py
│   │   └── morocco_scraper.py
│   └── utils/                 # Helper functions
│
├── frontend/                   # React + Vite application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json            # Vercel deployment config
│   ├── .env.example           # Environment variables template
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── i18n.js            # i18n configuration
│       ├── components/        # Reusable components
│       ├── pages/             # Page components
│       ├── context/           # React Context (Auth, Theme)
│       ├── services/          # API services
│       ├── hooks/             # Custom React hooks
│       └── locales/           # Translation files (en, fr, ar)
│
├── render.yaml                 # Render.com deployment config
├── railway.toml                # Railway deployment config
└── README.md                   # This file
```

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL (for production) or SQLite (for development)
- Git

## Local Development Setup

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables (create a `.env` file):**
   ```bash
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key
   DATABASE_URL=sqlite:///tradesense.db
   FLASK_ENV=development
   ```

5. **Run the Flask application:**
   ```bash
   python app.py
   ```

   The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Copy the example file
   cp .env.example .env.development
   
   # Edit .env.development
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend application will be available at `http://localhost:5173`

## Deployment

### Backend Deployment (Render.com or Railway)

#### Option 1: Render.com (Recommended)

1. **Push your code to GitHub**

2. **Create a Render account** at [render.com](https://render.com)

3. **Create a new Web Service:**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Set environment variables:
     ```
     FLASK_ENV=production
     SECRET_KEY=<generate-secure-random-key>
     JWT_SECRET_KEY=<generate-secure-random-key>
     CORS_ORIGINS=https://your-frontend-domain.vercel.app
     ```
   - The `DATABASE_URL` will be automatically set from PostgreSQL database

4. **Create a PostgreSQL database:**
   - Add a PostgreSQL database in Render
   - It will automatically be linked to your web service

5. **Deploy:**
   - Render will automatically deploy using the configuration in `render.yaml`
   - Your API will be available at `https://your-app-name.onrender.com`

#### Option 2: Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project:**
   - Connect your GitHub repository
   - Railway will detect `railway.toml`

3. **Add PostgreSQL:**
   - Add PostgreSQL service from Railway marketplace
   - Railway will automatically set `DATABASE_URL`

4. **Set environment variables:**
   ```
   FLASK_ENV=production
   SECRET_KEY=<generate-secure-random-key>
   JWT_SECRET_KEY=<generate-secure-random-key>
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```

5. **Deploy:**
   - Railway will automatically deploy
   - Your API will be available at the provided Railway URL

### Frontend Deployment (Vercel)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Import your project:**
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

3. **Configure build settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Set environment variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   ⚠️ **Important:** Use your actual backend URL from Render/Railway

5. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be available at `https://your-app-name.vercel.app`

6. **Update backend CORS:**
   - Go back to Render/Railway
   - Update `CORS_ORIGINS` environment variable with your Vercel URL:
     ```
     CORS_ORIGINS=https://your-app-name.vercel.app
     ```

### Post-Deployment Checklist

- [ ] Backend API is accessible at the deployment URL
- [ ] PostgreSQL database is connected and migrations ran successfully
- [ ] Frontend can successfully connect to backend API
- [ ] CORS is properly configured with frontend domain
- [ ] Environment variables are set correctly
- [ ] User registration and login work
- [ ] Trading features are functional
- [ ] Leaderboard updates correctly
- [ ] Admin panel is accessible (for admin users)

### Environment Variables Reference

**Backend (Render/Railway):**
```bash
# Required
DATABASE_URL=<auto-set-by-postgres-service>
SECRET_KEY=<generate-random-64-char-string>
JWT_SECRET_KEY=<generate-random-64-char-string>
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app

# Optional
PORT=5000  # Usually auto-set by platform
```

**Frontend (Vercel):**
```bash
# Required
VITE_API_URL=https://your-backend.onrender.com/api
```

### Troubleshooting Deployment

**Backend Issues:**
- **Database connection errors**: Verify `DATABASE_URL` is set and PostgreSQL service is running
- **CORS errors**: Check `CORS_ORIGINS` includes your Vercel domain
- **Import errors**: Ensure all dependencies are in `requirements.txt`
- **Gunicorn errors**: Check logs in Render/Railway dashboard

**Frontend Issues:**
- **API connection failed**: Verify `VITE_API_URL` is correct and backend is accessible
- **Blank page**: Check browser console for errors, verify build succeeded
- **404 on refresh**: Ensure `vercel.json` is present with proper rewrites
- **Environment variables not working**: Rebuild after setting env vars in Vercel

**Common Solutions:**
```bash
# Generate secure random keys (Python)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Test backend API
curl https://your-backend.onrender.com/api/health

# Check frontend build locally
cd frontend
npm run build
npm run preview
```

### Database Migration to PostgreSQL

To export your local SQLite database and import it to PostgreSQL:

1. **Export SQLite database:**
   ```bash
   cd backend
   python export_db.py
   ```
   This creates `database.sql` with all tables and sample data.

2. **Import to PostgreSQL (Render/Railway):**
   ```bash
   # Connect to PostgreSQL
   psql $DATABASE_URL
   
   # Run the SQL file
   \i database.sql
   
   # OR from command line
   psql $DATABASE_URL < database.sql
   ```

3. **Verify import:**
   ```sql
   -- Check tables
   \dt
   
   -- Check data
   SELECT * FROM users;
   SELECT * FROM challenges;
   ```

**Sample Users (created by export script):**
- Username: `john_trader` / Password: `password123`
- Username: `sarah_pro` / Password: `password123`
- Username: `admin_user` / Password: `password123` (admin)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/user` - Get current user info (requires auth)

### Challenges
- `GET /api/challenges` - Get user's active challenges
- `POST /api/challenges` - Create a new challenge
- `GET /api/challenges/<id>` - Get challenge details
- `PATCH /api/challenges/<id>` - Update challenge status

### Trades
- `GET /api/trades` - Get user's trades
- `POST /api/trades` - Execute a new trade
  ```json
  {
    "challenge_id": 1,
    "symbol": "AAPL",
    "quantity": 10,
    "price": 150.50,
    "trade_type": "buy"
  }
  ```
- `GET /api/trades/<id>` - Get specific trade

### Leaderboard
- `GET /api/leaderboard/monthly` - Get monthly leaderboard rankings
- `GET /api/leaderboard/all-time` - Get all-time rankings

### Market Data
- `GET /api/market/<symbol>` - Get real-time market data for symbol
- `GET /api/market/<symbol>/chart` - Get historical price chart data

### Payments (Mock)
- `POST /api/payments/process` - Process payment for challenge

### Admin (Requires admin role)
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/<id>` - Update user (make admin, etc.)
- `GET /api/admin/stats` - Get system statistics

## Development

### Backend Development

The backend uses:
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Cross-origin resource sharing
- **PyJWT** - JWT token authentication
- **yfinance** - Real-time stock market data
- **BeautifulSoup4** - Web scraping for Morocco market data
- **PostgreSQL** (production) / SQLite (development)

### Frontend Development

The frontend uses:
- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Axios** - HTTP client for API requests
- **react-i18next** - Internationalization (i18n)
- **Recharts** - Chart components
- **Lightweight Charts** - Advanced trading charts

### Key Features Implementation

**Multi-Language Support:**
- Uses `react-i18next` for translations
- Supports English, French, and Arabic
- RTL (Right-to-Left) layout for Arabic
- Language selector in navbar
- Translations stored in `frontend/src/locales/`

**Dark Mode:**
- Context-based theme management
- Persists to localStorage
- Applies to all components
- Smooth transitions between themes

**Authentication:**
- JWT token-based authentication
- Protected routes with `ProtectedRoute` component
- Token stored in localStorage
- Auto-logout on token expiration

**Trading Challenge System:**
- Multiple challenge tiers with different capital
- Real-time P&L tracking
- Daily loss limits enforcement
- Challenge status management (active, passed, failed)

### Running Tests

```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm run test
```

## Database

The application supports both SQLite (development) and PostgreSQL (production).

**Development (SQLite):**
- Database file: `backend/instance/tradesense.db`
- Automatically created on first run
- No additional setup required

**Production (PostgreSQL):**
- Set `DATABASE_URL` environment variable
- Render/Railway automatically provision PostgreSQL
- Database schema created automatically on first deployment

**Models:**
- `User` - User accounts with authentication
- `Challenge` - Trading challenges with rules and status
- `Trade` - Individual trade executions
- `Position` - Current portfolio positions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Notes

⚠️ **Important for Production:**

1. **Never commit sensitive data:**
   - Add `.env` files to `.gitignore`
   - Use environment variables for all secrets
   - Generate strong random keys for production

2. **Backend security:**
   - Use HTTPS in production
   - Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
   - Configure CORS to only allow your frontend domain
   - Implement rate limiting for API endpoints
   - Add input validation and sanitization
   - Use prepared statements (SQLAlchemy handles this)

3. **Frontend security:**
   - Never expose API keys in frontend code
   - Implement CSRF protection for forms
   - Sanitize user inputs
   - Use Content Security Policy (CSP) headers

4. **Database security:**
   - Use SSL for database connections in production
   - Regular backups (Render/Railway provide automatic backups)
   - Limit database user permissions

## Roadmap

- [ ] Real-time WebSocket price updates
- [ ] Advanced trading charts with technical indicators
- [ ] AI-powered trading signals and analysis
- [ ] Social trading features (copy trading)
- [ ] Mobile app (React Native)
- [ ] Advanced risk management tools
- [ ] Multi-asset support (Forex, Crypto, Commodities)
- [ ] Backtesting engine
- [ ] API for third-party integrations
- [ ] Performance analytics dashboard

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- 📧 Email: support@tradesense.ai
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/tradeapp/issues)
- 📖 Docs: [Documentation](https://docs.tradesense.ai)

## Acknowledgments

- **yfinance** - Yahoo Finance market data
- **Tailwind CSS** - UI styling
- **React** - Frontend framework
- **Flask** - Backend framework
- **Render** - Hosting platform
- **Vercel** - Frontend deployment

---

Built with ❤️ by the TradeSense Team

