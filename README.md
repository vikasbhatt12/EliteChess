
# # EliteChess ♟️

EliteChess is a full-featured **online multiplayer chess game** that allows users to play with friends, compete against a powerful AI, or chat with opponents in real-time. With seamless matchmaking, a beautiful UI, and smooth gameplay, EliteChess offers an engaging experience for chess lovers.


## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Authentication:** Firebase
- **Real-time Communication:** Socket.IO
- **AI Opponent:** Chess.js + Stockfish
- **Game Logic:** Chessboard.js / React Chessboard
## 🔑 Features
- ♞ **Online Multiplayer Mode** with real-time gameplay
- 🤝 **Automatic Matchmaking System** – get paired instantly with other players
- 🤖 Play against AI with decent difficulty
- 💬 In-game **chat system** for player communication
- ⏱️ Game timer for each player
- 🏳️ Resign and request draw options
- 🔄 Undo/Redo (client-side visualization)
- 🔐 Firebase-based secure login/signup
- 📱 Responsive and interactive user interface
## 🖼️ Screenshots
> *(Add game UI screenshots here)*  
> `![Screenshot](link-to-your-image)`
## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/EliteChess.git
cd EliteChess
```

2. Install dependencies:
```bash
npm install
```
3. Start the development servers:
```bash
# In one terminal (for client)
npm start

# In another terminal (for backend)
cd server
npm install
npm run dev
```


## ⚙️ How Matchmaking Works
- Players who select "Play Online" are added to a matchmaking waiting queue.

- Once two players are available, the backend pairs them and initiates a new game room.

- Both players are connected via Socket.IO and redirected to the match.

- Match data (room ID, players, game state) is tracked on the server.
## 📂 Project Structure
```csharp
EliteChess/
├── client/         # React frontend
├── server/         # Express backend
```


## 🧠 Future Improvements
- 🧩 Chess puzzles & training mode

- 🎥 Game history & replay viewer

- 📱 Mobile app version (React Native or PWA)

- 🏆 Leaderboards & user profiles

- 📊 Analytics (time spent, move patterns, etc.)
