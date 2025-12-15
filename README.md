# Learning Platform (Vite + React + TypeScript)

Quick start instructions to run this project locally.

Prerequisites

- Node.js 18+ (LTS) and npm or pnpm

Install dependencies

```bash
npm install
```

Run dev server

````bash
# Learning Platform (Vite + React + TypeScript)

Quick start instructions to run this project locally.

Prerequisites

- Node.js 18+ (LTS) and npm or pnpm

Install dependencies

```bash
npm install
````

Run dev server (frontend)

```bash
npm run dev
```

Build

```bash
npm run build
```

Notes

- The UI uses TailwindCSS. The Tailwind + PostCSS config is included.
- Components are in the `components/` folder (already present).
- `src/App.tsx` contains a form to add tasks dynamically and uses local component files.

## Backend API

This project includes a minimal Express API in the `server/` folder. It stores tasks in `server/data/tasks.json`.

To run the backend (in a separate terminal):

```bash
cd server
npm install
npm run dev   # or `npm start` to run without nodemon
```

Frontend will call `http://localhost:4000` by default. If you want to change the API base URL, set `VITE_API_BASE` in an env file (`.env`) or in your environment.

## Run both

Open two terminals: one running the backend (`server`) and another in the project root for the frontend:

```bash
# terminal 1
cd server
npm run dev

# terminal 2
npm install
npm run dev
```
