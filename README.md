# ✨ Modern Expense Tracker

A full-stack, premium expense management application built with **Next.js 16**, **TypeScript**, and **Redux Toolkit**. Feature-rich, highly interactive, and designed with a sleek glassmorphism dark theme.

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/expense-tracker?style=flat-square&color=6366f1)
![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)
![Redux](https://img.shields.io/badge/Redux_Toolkit-latest-764ABC?style=flat-square&logo=redux)

---

## 🚀 Features

### 💎 Premium User Experience
- **Sleek Dark UI**: Modern glassmorphism design with mesh gradients and custom animations.
- **Micro-animations**: Smooth page transitions and interactive hover effects.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile views.

### 📊 Powerful Analytics
- **Dynamic Charts**: Interactive Pie charts for category breakdown and Bar charts for daily spending trends using `Recharts`.
- **Smart Summaries**: Real-time calculation of Total Spent, Budget Progress, and Daily Averages.

### ⚙️ Core Functionality
- **Full CRUD**: Log, view, edit, and delete expenses across various categories.
- **Monthly Budgeting**: Set and track monthly limits with intelligent progress indicators.
- **Global Search & Filter**: Instant filtering by category, date range, amount, and text search.
- **Multi-Currency Support**: Instant currency switching (USD, EUR, GBP, INR) with browser persistence.

### 🛡️ Technical Excellence
- **Global State**: Robust state management using Redux Toolkit/Thunks.
- **API Architecture**: Clean RESTful API routes with server-side validation.
- **Middleware Protection**: Route guards for protected areas.
- **Typesafe**: End-to-end TypeScript for stability and developer experience.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js App Router, React, TypeScript
- **Styling**: Tailwind CSS v4 (Custom Design System)
- **State Management**: Redux Toolkit + React-Redux
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Persistence**: In-Memory Shared Store (Server), LocalStorage (Browser Prefs)

---

## 📦 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Access the app**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> **Authentication Check**: This demo uses a middleware guard. To access protected routes during local development, open your browser console and run:
> `document.cookie = "user_session=demo; path=/"`

---

## 📁 Project Structure

```text
src/
├── app/          # App Router (Pages, API Routes, Layouts)
├── components/   # UI Components (Dashboards, Charts, Cards)
├── context/      # Context API (Currency, Theme)
├── hooks/        # Custom Hooks (Data processing, Forms, Redux)
├── lib/          # Utilities & In-memory data store
├── store/        # Redux Toolkit (Slices, Store config)
└── types/        # TypeScript Definitions
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Your Name]
