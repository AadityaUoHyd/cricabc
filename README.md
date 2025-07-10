# CricABC - Cricket Live Score App
CricABC is a modern web application designed to provide real-time cricket scores, match updates, 
player statistics, and news for cricket enthusiasts. It features a robust backend built with 
Java Spring Boot and MongoDB for data storage, and a dynamic, responsive frontend powered by 
React with Tailwind CSS. The app supports live match updates using Pusher for real-time communication 
and includes admin dashboards for managing teams, matches, and players for both the 
Indian Premier League (IPL) and Women's Premier League (WPL). This is frontend code repository of this project.

## Features
- Live Scores: Real-time match updates with ball-by-ball commentary using Pusher.
- Match Information: View upcoming, live, and past matches with details like scores, venues, and teams.
- Player Statistics: Detailed stats for players, including top run-scorers and wicket-takers for IPL and WPL.
- News Updates: Latest cricket news articles with images and summaries.
- Points Table: Dynamic points table for IPL and WPL, including matches played, won, lost, points, and net run rate (NRR).
- Admin Dashboards: Secure dashboards for managing teams, matches, and players, with JWT-based authentication.
- Responsive Design: Mobile-friendly UI with Tailwind CSS and Framer Motion animations.
- Team and Player Management: Add, update, or delete teams and players, including logo and photo uploads.

## Project Structure

### Backend (cricabc-backend)
```
cricabc-backend/
├── src/
│   ├── main/
│   │   ├── java/com/cricabc/backend/
│   │   │   ├── controller/        # REST controllers for matches, teams, players, news
│   │   │   ├── service/           # Business logic for data processing
│   │   │   ├── repository/        # MongoDB repositories for data access
│   │   │   ├── model/             # MongoDB entities (Team, Match, Player, News)
│   │   │   ├── config/            # Configuration classes (e.g., Pusher, Security)
│   │   │   └── Application.java   # Spring Boot main class
│   │   └── resources/
│   │       ├── application.properties # Spring Boot configuration
│   │       └── .env               # Environment variables (not committed)
├── pom.xml                        # Maven dependencies
└── README.md                      # Backend documentation
```


### Frontend (cricabc)
```
cricabc/
├── public/                        # Static assets (e.g., favicon, placeholder images)
├── src/
│   ├── assets/                    # Placeholder images for teams, players, news
│   ├── components/                # Reusable React components
│   │   ├── ui/                    # ShadCN components (Button, Input, etc.)
│   │   ├── MatchCard.tsx          # Match card component
│   │   ├── Commentary.tsx         # Ball-by-ball commentary component
│   │   └── NewsCard.tsx           # News article card component
│   ├── pages/                     # Page components
│   │   ├── Home.tsx               # Home page with match cards
│   │   ├── LiveScore.tsx          # Live score page
│   │   ├── PlayerStats.tsx        # Player statistics page
│   │   ├── News.tsx               # News page
│   │   ├── IPL.tsx                # IPL page with matches, teams, stats, news
│   │   ├── WPL.tsx                # WPL page with matches, teams, stats, news
│   │   ├── AdminIPL.tsx           # Admin dashboard for IPL
│   │   └── AdminWPL.tsx           # Admin dashboard for WPL
│   ├── lib/                       # Utility functions (API calls, Pusher setup)
│   ├── styles/                    # Tailwind CSS and global styles
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── env.d.ts                   # TypeScript environment variable types
├── .env                           # Environment variables (not committed)
├── vite.config.ts                 # Vite configuration
├── package.json                   # Node dependencies
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # Frontend documentation
```


## Technologies Used

### Backend
- Java 17: Programming language for the backend.
- Spring Boot 3.x: Framework for building RESTful APIs.
- MongoDB: NoSQL database for storing teams, matches, players, and news.
- Pusher: Real-time communication for live score updates.
- Spring Security: JWT-based authentication for admin endpoints.
- Maven: Dependency management.

### Frontend
- React 18: JavaScript library for building the user interface.
- TypeScript: Typed JavaScript for better code reliability.
- Tailwind CSS: Utility-first CSS framework for styling.
- Framer Motion: Animation library for smooth transitions.
- Lucide React: Icon library for enhanced UI elements.
- ShadCN: Reusable UI components (Button, Input, etc.).
- Vite: Fast build tool and development server.
- Axios: HTTP client for API requests.

## Pending main issues:
- IPL.tsx, AdminIPL.tsx giving errors, need to implement few pending endpoints.
- WPL.tsx, AdminWPL.tsx giving errors, need to implement few pending endpoints.
- 'view player' of Teams.tsx, yet to be implemented.
- Purchase CricAPI api-key to ensure pusher works for live score update.


## Prerequisites
- Node.js (v16 or higher)
- Java (v17)
- MongoDB (local or cloud instance, e.g., MongoDB Atlas)
- Pusher Account (for real-time updates)
- Maven (for backend build)

## Setup Instructions
### Backend Setup
```
Clone the Repository:
git clone <repository-url>
cd cricabc-backend


Configure Environment Variables:Create a .env file in src/main/resources/ with the following:
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/cricabc
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
JWT_SECRET=your_jwt_secret


Install Dependencies:
mvn clean install


Run the Backend:
mvn spring-boot:run

The backend will run on http://localhost:8080.
```

### Frontend Setup
```
Navigate to Frontend Directory:
cd cricabc


Configure Environment Variables:Create a .env file in the root with:
VITE_API_URL=http://localhost:8080/api
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster


Install Dependencies:
npm install


Run the Frontend:
npm run dev

The frontend will run on http://localhost:5173 (default Vite port).

```

### MongoDB Setup
```
Local MongoDB:

Install MongoDB locally or use MongoDB Atlas.
Ensure the database cricabc is created.
Update the SPRING_DATA_MONGODB_URI in the backend .env file.

```

### Pusher Setup:
```
Create a Pusher account and obtain credentials.
Update the .env files for both backend and frontend with Pusher credentials.
```


## Some of API Endpoints
### Public Endpoints
```
GET /api/matches/tournament/{tournament}: Fetch matches for IPL or WPL.
GET /api/teams/{tournament}: Fetch teams for IPL or WPL.
GET /api/players: Fetch players with optional filters (e.g., leagueName).
GET /api/players/stats/{tournament}: Fetch top run-scorers and wicket-takers.
GET /api/points-table/{tournament}: Fetch points table for IPL or WPL.
GET /api/news: Fetch news articles with optional tournament filter.
```
### Admin Endpoints (JWT-Protected)
```
POST /api/admin/teams: Create a new team (with logo upload).
DELETE /api/admin/teams/{id}: Delete a team.
POST /api/admin/matches: Create a new match.
DELETE /api/admin/matches/{matchId}: Delete a match.
POST /api/admin/players: Create a new player (with photo upload).
DELETE /api/admin/players/{id}: Delete a player.
```

## Usage

### Access the App:

- Open http://localhost:5173 to view the frontend.
- Navigate to /ipl or /wpl for league-specific pages.
- Access admin dashboards at /admin/ipl or /admin/wpl (requires login).


### Admin Access:

- Log in with admin credentials to access the admin dashboards.
- Use the dashboards to manage teams, matches, and players.


## Live Updates:
```
Live match scores and commentary are updated in real-time via Pusher.
Check the LiveScore page for ball-by-ball updates. you need to purchase api-key [say, CricAPI (https://www.cricapi.com/)]
```


## Contributing
```
Fork the Repository:
git clone <repository-url>


Create a Feature Branch:
git checkout -b feature/your-feature


Commit Changes:
git commit -m "Add your feature"


Push and Create a Pull Request:
git push origin feature/your-feature

Submit a pull request with a clear description of your changes.

```

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For issues or suggestions, please open an issue on the repository or contact the maintainers.

## Live Project (In future)
https://cricabc.vercel.app