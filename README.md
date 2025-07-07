# CricLive
A cricket live score app. Java-Springboot as backend and React as Frontend. we will use Mongodb for database.

## Backend
```
criclive-backend/ 
├── src/ 
│ ├── main/ 
│ │ ├── java/com/criclive/backend/ 
│ │ │ ├── controller/ # REST controllers 
│ │ │ ├── service/ # Business logic 
│ │ │ ├── repository/ # MongoDB repositories 
│ │ │ ├── model/ # MongoDB entities 
│ │ │ ├── config/ # Configuration classes (e.g., Pusher) 
│ │ │ └── Application.java # Spring Boot main class 
│ │ └── resources/ 
│ │ ├── application.properties # Spring Boot configuration 
│ │ └── .env # Environment variables (not committed) 
├── pom.xml # Maven dependencies 
└── README.md # Project documentation
```

## Frontend
```
criclive/ 
├── public/ # Static assets (e.g., favicon, placeholder images) 
├── src/ 
│ ├── assets/ # Placeholder images (for Sora AI-generated PNGs) 
│ ├── components/ # Reusable React components 
│ │ ├── ui/ # ShadCN components 
│ │ ├── MatchCard.tsx # Match card component 
│ │ ├── Commentary.tsx # Ball-by-ball commentary 
│ │ └── NewsCard.tsx # News article card 
│ ├── pages/ # Page components 
│ │ ├── Home.tsx # Home page with match cards 
│ │ ├── LiveScore.tsx # Live score page 
│ │ ├── PlayerStats.tsx # Player stats page 
│ │ └── News.tsx # News page 
│ ├── lib/ # Utility functions (e.g., API calls, Pusher setup) 
│ ├── styles/ # Tailwind CSS and global styles 
│ ├── App.tsx # Main app component 
│ ├── main.tsx # Entry point 
│ └── env.d.ts # TypeScript environment variable types 
├── .env # Environment variables (not committed) 
├── vite.config.ts # Vite configuration 
├── package.json # Node dependencies 
├── tsconfig.json # TypeScript configuration 
├── tailwind.config.js # Tailwind CSS configuration 
└── README.md # Project documentation
```