# UNListings - Student Marketplace

A specialized peer-to-peer marketplace web application optimized for University of Nebraska students. This project allows users to buy and sell "Husker Gear" and "Dorm Market" items via fixed-price listings or auctions.

## Features Implemented

### Backend (NestJS)
*   **Modular Architecture**: Organized into `Users`, `Auth`, `Listings`, `Bids`, and `Cart` modules.
*   **Authentication**: Secure JWT-based authentication with Passport strategies.
*   **Database**: PostgreSQL integration using TypeORM.
*   **Listings Management**:
    *   Support for **Fixed Price** and **Auction** listings.
    *   **Popularity Tracking**: Tracks views to sort by "Popular" vs "Recent".
    *   **Market Types**: Segregated into "University" (Husker Gear) and "General" (Dorm Market).
*   **Auction Engine**:
    *   Real-time bidding validation.
    *   Automated scheduler (Cron job) to handle auction expiration and winner determination.
*   **Shopping Cart**: Persistent cart management for users.

### Frontend (React + Vite + Tailwind)
*   **Branded UI**: Custom "Nebraska" theme with specific color palettes (`#C8102E`) and fonts.
*   **Landing Page**: 
    *   Split-view layout featuring "Husker Gear" and "Dorm Market".
    *   **Interactive Tabs**: Toggle between "Recent" and "Popular" listings.
    *   **Visuals**: 3:1 landscape listing previews.
*   **Marketplace Sections**:
    *   Dedicated feeds for different market types.
    *   Advanced filtering (Search, Price Range, Listing Type).
*   **Listing Details**:
    *   Dynamic display for Auctions (Bid history, Timer) vs Fixed Price.
    *   "Add to Cart" functionality.
*   **User Dashboard**:
    *   "Your Listings" management.
    *   Shopping Cart view.
    *   Profile management.

## 🛠 Tech Stack

*   **Backend**: Node.js, NestJS, TypeORM, PostgreSQL
*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
*   **Infrastructure**: Docker Compose (PostgreSQL)

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Docker Desktop

### Installation & Run

1.  **Start the Database**
    ```bash
    docker compose up -d
    ```

2.  **Start the Backend**
    ```bash
    cd backend
    npm install
    npm run start:dev
    ```
    *Server runs on http://localhost:3000*

3.  **Start the Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *App runs on http://localhost:5173*

### One-Command Startup (Root)

If you want to start the full stack from one command:

```bash
npm run start:all
```

This command installs root + backend + frontend dependencies, starts Postgres, and then runs backend/frontend dev servers together.

If dependencies are already installed, use the faster command:

1.  **One-time setup**
    ```bash
    npm install
    npm run install:all
    ```

2.  **Start everything**
    ```bash
    npm run dev
    ```

3.  **Stop database container when done**
    ```bash
    npm run stop
    ```

## 📚 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/listings` | Get listings (supports `?market_type=`, `?sort_by=popular`) |
| `POST` | `/listings` | Create a new listing |
| `GET` | `/listings/:id` | Get listing details (increments view count) |
| `POST` | `/bids` | Place a bid on an auction |
| `POST` | `/cart` | Add item to cart |
| `GET` | `/cart` | View user's cart |
| `DELETE` | `/cart/:id` | Remove item from cart |

## 🏗 Project Structure

```
studentAuctionSite/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── bids/           # Bidding logic
│   │   ├── cart/           # Shopping cart
│   │   ├── listings/       # Listings & Scheduler
│   │   └── users/          # User management
├── frontend/                # React App
│   ├── src/
│   │   ├── components/     # UI Components (ListingCard, Layout, etc.)
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Home, HuskerMarketplace, ListingDetail, etc.
│   │   └── lib/            # API configuration
└── docker-compose.yml       # Database orchestration
```
