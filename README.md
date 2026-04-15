# 🏗️ AspalCalc: Sales & Analysis System

AspalCalc (formerly BituCalc) is a premium, mobile-first application designed to streamline the sales and analysis of asphalt products including **Bitumax**, **Hijau**, and **Hitam**. Built with modern technologies, it offers a native-app experience directly from your browser.

## 🚀 Key Features

- **📱 Mobile-First Experience**: Designed specifically for field use with a clean, premium interface.
- **🔢 Smart Calculator**: Real-time sales calculations with support for custom weights and automatic bulk discount logic.
- **📊 Sales Analytics**: 
  - Daily & Monthly revenue timelines.
  - Interactive product distribution charts.
  - Quick summary of Revenue, Cost, and Profit (Fee).
- **📝 Formal Reports**: Generate professional sales reports ready for print or PDF.
- **☁️ Cloud Database**: Fully integrated with MySQL (Aiven Cloud) for reliable and persistend data storage.
- **📲 PWA Support**: Install directly to Android (Chrome) or iOS (Safari) home screens.
- **🔔 Pro Feedback**: Custom slide-down notifications and premium confirmation modals.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS & Framer Motion
- **Icons**: Lucide React
- **Database**: MySQL (mysql2)
- **Charts**: Recharts

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Moharrafi/aspalcalc.git
cd aspalcalc
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL credentials:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Initialize Database
Run the script to create the necessary tables in your MySQL database:
```bash
node scratch/init_db.js
```

### 5. Run Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License
This project is for internal sales management and distribution monitoring.

---
Built with ❤️ by Moharrafi
