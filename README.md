# Cricket Quiz Arena

A simple full-stack cricket quiz for an Open Source Systems (OSS) project.
Players enter their name, answer random multiple-choice cricket questions, see their score with the
correct answers, and appear on a leaderboard. **All data is saved in MongoDB**, and you can view it in
**MongoDB Compass**.

| Part     | Technology                                |
|----------|-------------------------------------------|
| Frontend | HTML, CSS, JavaScript (no frameworks)     |
| Backend  | Node.js + Express.js                      |
| Database | MongoDB (local Community Server or Atlas) with Mongoose |

---

## 1. Folder structure

```
cricket-quiz-arena/
├── README.md
├── .gitignore
├── frontend/                    # what the user sees
│   ├── index.html               # home page: title, name form, top-5 leaderboard
│   ├── quiz.html                # one question at a time
│   ├── result.html              # score + correct answers
│   ├── leaderboard.html         # full leaderboard + totals
│   ├── css/style.css            # green / white / dark cricket theme
│   ├── images/ball.svg
│   └── js/
│       ├── api.js               # fetch() helper used by every page
│       ├── home.js
│       ├── quiz.js
│       ├── result.js
│       └── leaderboard.js
└── backend/                     # API + database
    ├── package.json
    ├── .env.example             # copy to .env
    ├── server.js                # Express app (also serves the frontend folder)
    ├── config/db.js             # MongoDB connection
    ├── models/
    │   ├── Player.js            # -> "players" collection
    │   ├── Question.js          # -> "questions" collection
    │   └── QuizResult.js        # -> "quizresults" collection
    ├── routes/
    │   ├── questionRoutes.js    # GET /api/questions
    │   ├── quizRoutes.js        # start / load / submit a quiz
    │   └── resultRoutes.js      # result, leaderboard, stats
    ├── utils/validation.js      # input checks
    ├── data/sampleQuestions.js  # 25 sample cricket questions
    └── scripts/seed.js          # npm run seed
```

---

## 2. What you need

1. **Node.js (LTS)** – <https://nodejs.org>. Check in a terminal: `node -v` and `npm -v`.
2. **VS Code** – <https://code.visualstudio.com>.
3. **A MongoDB server** – choose ONE:
   - **Option A – Local MongoDB Community Server** (recommended for Compass):
     <https://www.mongodb.com/try/download/community> → Windows → `.msi`.
     During setup keep **"Install MongoD as a Service"** ticked, and keep **"Install MongoDB Compass"** ticked.
   - **Option B – MongoDB Atlas** (free cloud database): <https://cloud.mongodb.com>.
4. **MongoDB Compass** – <https://www.mongodb.com/try/download/compass> (if not installed with the server).

> **Important:** MongoDB Compass is only a **graphical viewer**. It does **not** run a database by itself.
> Compass needs a running MongoDB server to connect to – either the local **MongoDB Community Server**
> (Option A, running on `localhost:27017`) or a **MongoDB Atlas** cluster (Option B).
> If no server is running, both this app and Compass will show a connection error.

To check the local server is running on Windows: press **Win + R**, type `services.msc`, find
**MongoDB Server (MongoDB)** and make sure its status is **Running** (right-click → Start if not).

---

## 3. Run the project in VS Code

1. **Extract** `cricket-quiz-arena.zip`.
2. In VS Code: **File → Open Folder…** → select the `cricket-quiz-arena` folder.
3. Open a terminal: **Terminal → New Terminal**.
4. Go into the backend folder:
   ```
   cd backend
   ```
5. Create your settings file:
   ```
   copy .env.example .env
   ```
   (macOS/Linux: `cp .env.example .env`)
6. **Configure the MongoDB connection** in `backend/.env`:
   - **Local MongoDB (Option A)** – nothing to change. The default line is:
     ```
     MONGODB_URI=mongodb://127.0.0.1:27017/cricket_quiz_arena_oss
     ```
   - **Atlas (Option B)** – put `#` in front of the local line, and add your Atlas string with the
     database name `cricket_quiz_arena_oss` after `.mongodb.net/`:
     ```
     MONGODB_URI=mongodb+srv://myUser:myPassword@cluster0.abcde.mongodb.net/cricket_quiz_arena_oss?retryWrites=true&w=majority
     ```
     In Atlas also open **Network Access → Add IP Address → Add Current IP Address**.
7. Install the packages:
   ```
   npm install
   ```
8. Add the 25 sample cricket questions to MongoDB:
   ```
   npm run seed
   ```
   Expected: `The "questions" collection now has 25 documents.`
   (The server also adds them automatically on first start if the collection is empty.)
9. Start the backend **and** frontend (the backend serves the frontend folder, so one command runs both):
   ```
   npm run dev
   ```
   Expected:
   ```
   [DB] Connected to MongoDB at 127.0.0.1:27017 - database "cricket_quiz_arena_oss"
   [Server] Cricket Quiz Arena is running at http://localhost:3000
   ```
   Keep this terminal open. Stop the server with **Ctrl + C**.
10. Open **<http://localhost:3000>** in your browser.
11. Enter your name, click **Start Quiz**, answer the questions and click **Submit Quiz**.
    You will see your score, the correct answers, and your place on the leaderboard.

*Optional:* you can also open `frontend/index.html` with the VS Code **Live Server** extension
(port 5500). The pages then call the backend at `http://localhost:3000`, so `npm run dev` must still be running.

---

## 4. Verify the data in MongoDB Compass

1. Open **MongoDB Compass**.
2. In **New Connection**, enter the URI:
   - Local: `mongodb://localhost:27017`
   - Atlas: your Atlas connection string (Atlas → *Connect* → *Compass*), with your password.
3. Click **Connect**.
4. In the left sidebar open the database **`cricket_quiz_arena_oss`**.
5. You will see three collections:

   | Collection    | Created when                    | What it stores |
   |---------------|---------------------------------|----------------|
   | `questions`   | `npm run seed` / first start    | question text, 4 options, correct answer index, category, difficulty, explanation |
   | `players`     | a player clicks **Start Quiz**  | name, email, college/team, quizzes played, best %, last played |
   | `quizresults` | quiz start → updated on submit  | player name & id, every question with the selected answer and correct answer, correct/wrong/unanswered counts, score, percentage, result label, start/end time, time taken |

6. Click **`quizresults`** → **Documents** to see your submitted quiz. Open the `answers` array to see
   each question, `selectedText`, `correctText` and `isCorrect`.
   A finished quiz has `status: "completed"`; a quiz that was started but not submitted shows `"in-progress"`.
7. After playing another quiz, click the **Refresh** button in Compass to see the new document.

Useful Compass filters (type in the *Filter* box and click *Find*):
- Only finished quizzes: `{ "status": "completed" }`
- One player's results: `{ "playerName": "Sangeeth" }`
- Scores of 80% or more: `{ "percentage": { "$gte": 80 } }`

---

## 5. How it works (for the demo)

1. **Home page** → the form sends `POST /api/quiz/start` with `{ name, email, college }`.
   The backend validates it, saves/updates the **player**, picks 10 random **questions**, and creates a
   **quizresults** document with status `in-progress`. The correct answers stay on the server.
2. **Quiz page** → loads the questions with `GET /api/quiz/:id` (no correct answers are sent).
3. **Submit** → `POST /api/quiz/:id/submit` with `{ answers: [2, 0, null, ...] }`.
   The **server** compares them with the correct answers, calculates the score and saves everything.
   A quiz can only be submitted once.
4. **Result page** → `GET /api/results/:id` reads the saved result (now with correct answers).
5. **Leaderboard** → `GET /api/leaderboard` sorts completed results by percentage, then fastest time.

### API list

| Method | URL | Purpose |
|--------|-----|---------|
| GET  | `/api/health` | Server and database status |
| GET  | `/api/questions` | All questions (without answers) |
| POST | `/api/quiz/start` | Save player + start a quiz |
| GET  | `/api/quiz/:id` | Questions of a running quiz |
| POST | `/api/quiz/:id/submit` | Submit answers, calculate and save the score |
| GET  | `/api/results/:id` | Saved result with correct answers |
| GET  | `/api/leaderboard?limit=10` | Top results |
| GET  | `/api/stats` | Totals (players, quizzes, average, best) |

You can try them in the browser, e.g. <http://localhost:3000/api/health> and
<http://localhost:3000/api/leaderboard>.

---

## 6. Commands (run inside the `backend` folder)

| Command | What it does |
|---------|--------------|
| `npm install` | Install the packages (first time only) |
| `npm run seed` | Insert/refresh the 25 sample questions (safe to repeat, no duplicates) |
| `npm run dev` | Start the server with auto-restart on file changes |
| `npm start` | Start the server without auto-restart |

To change the number of questions per quiz, edit `QUESTIONS_PER_QUIZ` in `backend/.env` and restart.

---

## 7. Troubleshooting

| Problem | Fix |
|---------|-----|
| `connect ECONNREFUSED 127.0.0.1:27017` | The local MongoDB server is not running. Start the **MongoDB Server** service in `services.msc`, or use Atlas. |
| Compass: *connect ECONNREFUSED* | Same reason – Compass needs a running MongoDB server. |
| `bad auth : authentication failed` (Atlas) | Wrong Atlas **database user** name/password in `MONGODB_URI`. Special characters in the password must be URL-encoded (e.g. `@` → `%40`). |
| Atlas connection timeout | Add your IP in Atlas **Network Access**. |
| `MONGODB_URI is missing` | You did not create `backend/.env` – run `copy .env.example .env` in the backend folder. |
| `EADDRINUSE :::3000` | Port 3000 is busy. Set `PORT=3001` in `.env` and open `http://localhost:3001`. |
| Page says *Cannot reach the backend* | The server is not running – run `npm run dev` in the `backend` folder. |
| `'npm' is not recognized` | Install Node.js, then close and reopen VS Code. |
| `npm audit` warnings | They come from the dev tool `nodemon` only. Do not run `npm audit fix --force`. |
