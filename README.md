# Lament and Quill

*Two cities. Two Ghosts. One reckoning.*

A Dark Neo-Gothic Tech Noir web application featuring the convergence of Crimson City and Silver Heights - two distinct urban landscapes bound together by fate, power, and ancient mysteries.

## 🎭 Project Overview

**Lament and Quill** is an immersive web experience that combines modern web technologies with a rich narrative universe. Built with Next.js and TypeScript, this project serves as both a content management system and community platform for users to explore, contribute to, and interact with a dark cyberpunk-gothic world.

### 🌆 The Twin Cities

- **Crimson City**: The passionate depths where blood flows like currency and ancient powers stir in the shadows
- **Silver Heights**: The gleaming peaks of technological precision where neural networks pulse with cold efficiency

## ✨ Key Features

### 📚 Content Sections
- **Dossier**: Character and location profiles with advanced search and filtering
- **Crimson Ledger**: Official journal entries from Crimson City administrators
- **Crimson Confessions**: User submissions with community tipping system
- **Fragments of Lament**: Official chronicles from Silver Heights
- **Lament Submissions**: User contributions with premium placement options
- **The Ledger and the Lament**: Community forum for cross-city discussions
- **Black Ledger Goods**: Merchandise store and services marketplace

### 🔐 User System
- User registration and authentication
- Friends system for community building
- Admin panels for both cities with unique themes
- Role-based access control

### 🎨 Design Philosophy
- **Dark Neo-Gothic Tech Noir** aesthetic
- Color scheme: Black, Red (Crimson), and Silver
- Typography: Gothic headers, tech monospace, and serif body text
- Interactive UI elements with cyberpunk flair
- Responsive design for all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom Gothic/Cyberpunk theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (planned integration)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Install Node.js**: Download and install from [nodejs.org](https://nodejs.org/)

2. **Clone and setup the project**:
   ```bash
   # Navigate to the project directory
   cd "c:\\Users\\Kenne\\OneDrive\\Documents\\Lamentandquill"
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Open in browser**: Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and theme
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── dossier/           # Character/location profiles
│   ├── crimson-ledger/    # Crimson City journal
│   ├── crimson-confessions/ # User submissions (Crimson theme)
│   ├── fragments-of-lament/ # Silver Heights journal
│   ├── lament-submissions/  # User submissions (Silver theme)
│   ├── forum/             # Community discussions
│   ├── merchandise/       # Store and services
│   └── admin/             # Admin panels
│       ├── crimson/       # Crimson City admin
│       └── silver/        # Silver Heights admin
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Main navigation
│   └── Footer.tsx         # Site footer
└── lib/                   # Utilities and configurations
```

## 🎨 Theme Customization

The project uses a custom Tailwind CSS configuration with Gothic and Cyberpunk color schemes:

### Color Palette
- **Gothic Black**: Primary background (`#0a0a0a`)
- **Charcoal**: Secondary background (`#1a1a1a`)
- **Crimson Red**: Crimson City accent (`#dc143c`)
- **Silver**: Silver Heights accent (`#c0c0c0`)
- **Steel**: Neutral accents (`#708090`)

### Typography
- **Gothic**: Cinzel (headers and titles)
- **Tech**: Orbitron (technical elements)
- **Noir**: Crimson Text (body text)

## 🔮 Planned Features

- [ ] Supabase backend integration
- [ ] User authentication system
- [ ] Real-time forum functionality
- [ ] Payment processing for merchandise
- [ ] Advanced search capabilities
- [ ] Mobile app companion
- [ ] API for third-party integrations
- [ ] Content management system for admins
- [ ] Notification system
- [ ] Achievement/badge system

## 🎭 Lore and World Building

The world of Lament and Quill exists in a near-future where two cities have evolved distinct cultures:

- **Crimson City**: Built on principles of passion, tradition, and the power of blood and flesh
- **Silver Heights**: Embracing digital transcendence, neural augmentation, and technological supremacy

The convergence of these worlds creates tension, opportunity, and the potential for either harmony or destruction.

## 🤝 Contributing

We welcome contributions from developers, writers, artists, and world-builders who want to expand the Lament and Quill universe.

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Contact

For questions, suggestions, or collaboration inquiries, please reach out through the official channels.

---

*"In the shadow of tomorrow's decay, two cities stand as monuments to what was and what might yet be. Here, in the liminal space between flesh and steel, between memory and prophecy, your story begins."*
