# 🚀 Quick Setup Instructions

Follow these 4 steps to get the project running locally:

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- npm (v9+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example file to `.env.local`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**Windows (CMD):**
```cmd
copy .env.example .env.local
```

**macOS / Linux:**
```bash
cp .env.example .env.local
```

*(No external API keys required! The app includes offline fallbacks and mock data.)*

### 4. Run the Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Demo Accounts & Persona Switcher
Use the **Persona Switcher** in the bottom sidebar / login page to instantly switch between:
- **Admin**: `admin@shantibschool.edu.in`
- **Faculty**: `prof.patel@shantibschool.edu.in`
- **Reviewer**: `dr.iyer@shantibschool.edu.in`
- **Student**: `student1@shantibschool.edu.in`

For comprehensive documentation, see `README.md` and `FULL_DOCUMENTATION.md`.
