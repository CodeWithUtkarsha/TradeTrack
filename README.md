# TradeZella - Professional Trading Journal

A full-stack trading journal application built with React, Node.js, and MongoDB.

## 🚀 Features

- **Dashboard**: Real-time P&L tracking, win rates, and portfolio performance
- **Analytics**: Detailed trade analysis with charts and insights
- **Profile Management**: User profiles with profile picture uploads
- **Authentication**: Secure JWT-based authentication
- **Trade Logging**: Comprehensive trade entry and management

## 🏗️ Project Structure

```
TradeJournal/
├── backend/           # Node.js/Express API server
│   ├── controllers/   # API route handlers
│   ├── models/        # MongoDB models (User, Trade)
│   ├── routes/        # API route definitions
│   ├── middleware/    # Authentication & error handling
│   └── server.js      # Main server file
├── frontend/          # React/TypeScript client
│   ├── client/src/    # React application source
│   ├── shared/        # Shared TypeScript schemas
│   └── vite.config.ts # Vite configuration
└── start-servers.bat  # Quick start script
```

## 🛠️ Quick Start

1. **Clone & Install Dependencies**

   ```bash
   cd TradeJournal
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Setup**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start Application**

   ```bash
   # From project root
   ./start-servers.bat
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 Technology Stack

**Backend:**

- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Helmet Security
- CORS

**Frontend:**

- React 18 + TypeScript
- Vite Build Tool
- TanStack Query (React Query)
- Tailwind CSS
- Wouter Router

## 📊 API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/trades` - Get user trades
- `POST /api/trades` - Create new trade
- `GET /api/analytics/dashboard` - Dashboard analytics

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation

## 📱 Production Ready

- Environment-based configuration
- Error handling & logging
- Database connection management
- Responsive design
- Production build optimization

---

Built with ❤️ for professional traders
