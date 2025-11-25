# Parlomo Admin Panel

A modern, full-featured admin panel built with Next.js 16 and React 19, featuring authentication, user management, dark mode, and a comprehensive component library.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.5.0-764abc)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **🔐 Authentication System** - JWT-based authentication with httpOnly cookies
- **👥 User Management** - Complete CRUD operations with search, filters, and pagination
- **🎨 Dark Mode** - Seamless theme switching with system preference detection
- **📱 Responsive Design** - Mobile-first approach with adaptive layouts and bottom navigation
- **🔄 State Management** - Hybrid approach using Redux Toolkit for business data and React Context for auth/theme
- **📝 Form Management** - Formik + Yup for robust form handling and validation
- **📁 File Upload System** - Abstracted storage layer supporting local and cloud providers
- **🎭 Component Library** - Comprehensive set of reusable UI components
- **⚡ Performance Optimized** - React Server Components, lazy loading, and caching strategies

## 🛠️ Tech Stack

### Core

- **Framework:** Next.js 16.0.1 (App Router)
- **UI Library:** React 19.2.0
- **Language:** JavaScript (ES6+)

### Styling & UI

- **CSS Framework:** Tailwind CSS v4
- **Styling Approach:** Pure CSS with CSS Custom Properties
- **Icons:** Lucide React (1000+ tree-shakeable icons)
- **Notifications:** Sonner (modern toast notifications)

### State & Data Management

- **State Management:** Redux Toolkit 2.5.0 + React Context
- **Forms:** Formik + Yup validation
- **HTTP Client:** Axios 1.7.9

### File Handling

- **Storage:** Abstracted layer (local filesystem, cloud-ready)
- **Upload:** Multipart form-data with validation

### Development Tools

- **Linting:** ESLint 9 (flat config)
- **Code Formatting:** Prettier
- **React Optimization:** React Compiler enabled

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Setup Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd parlomo-refactored
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Storage Strategy (local, cloudinary, s3, vercel-blob)
NEXT_PUBLIC_STORAGE_STRATEGY=local

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

```
parlomo-refactored/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication routes
│   │   │   └── login/
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── users/          # User management
│   │   │   ├── companies/      # Company management
│   │   │   ├── transactions/   # Transaction tracking
│   │   │   ├── packages/       # Package management
│   │   │   ├── payments/       # Payment records
│   │   │   ├── promotions/     # Promo codes
│   │   │   └── settings/       # User settings (planned)
│   │   ├── api/                # API routes
│   │   └── globals.css         # Tailwind + CSS variables
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Buttons, Cards, Modals, etc.
│   │   ├── forms/             # Form field components
│   │   ├── tables/            # Table components
│   │   └── layout/            # Layout components
│   ├── features/              # Redux slices (feature-based)
│   │   └── users/             # User feature slice
│   ├── services/              # API service layer
│   ├── lib/                   # Utilities and configs
│   │   ├── storage/          # File storage abstraction
│   │   ├── store.js          # Redux store
│   │   ├── hooks.js          # Custom hooks
│   │   └── axios.js          # Axios configuration
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.js    # Authentication
│   │   └── ThemeContext.js   # Theme switching
│   ├── schemas/               # Yup validation schemas
│   ├── hooks/                 # Custom React hooks
│   └── constants/             # App constants
├── public/
│   └── assets/
│       └── storage/           # Local file uploads
└── docs/                      # Documentation
    └── IMPLEMENTATION_PLAN.md # Detailed implementation guide
```

## 🔑 Default Login Credentials

**Admin Account:**

- Email: `admin@parlomo.com`
- Password: `Admin@123`

> ⚠️ **Important:** Change these credentials in production!

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

## 🎯 Key Features & Pages

### ✅ Completed Features

#### Authentication

- JWT-based login with httpOnly cookies
- Route protection with client-side guards
- Automatic session management
- User menu with logout

#### Dashboard

- Statistics cards (users, companies, transactions)
- Recent activity feed
- Quick action shortcuts
- System status indicators

#### User Management

- **List View:** Search, filters, pagination, sortable columns
- **Create User:** Form with validation (name, email, phone, role, status, avatar)
- **Edit User:** Update existing users with pre-populated data
- **View Details:** Comprehensive user profile display
- **Delete:** Confirmation modal with cascade handling
- **Avatar Upload:** Drag-and-drop image upload with preview

#### Layout & Navigation

- Responsive sidebar with collapse/expand
- Top header with theme toggle and user menu
- Mobile bottom navigation with center menu button
- Breadcrumb navigation
- Dark mode with smooth transitions

#### Component Library

- **Forms:** Input, Select, Textarea, Checkbox, Date/Time pickers, File upload
- **UI:** Buttons, Cards, Badges, Modals, Tabs, Pagination
- **Tables:** Sortable headers, action buttons, responsive design
- **Feedback:** Loader, Skeleton, Empty states, Toast notifications

### 🚧 Planned Features

- **Settings & Profile Management** (Phase 8.7)
    - User profile editing
    - Password change
    - Notification preferences
    - Account deletion (GDPR compliance)
- **Company Management** (Phase 8.2)
- **Transaction Tracking** (Phase 8.3)
- **Package Management** (Phase 8.4)
- **Payment Records** (Phase 8.5)
- **Promotion Codes** (Phase 8.6)
- **In-App Notifications** (Phase 10)

## 🎨 Customization

### Theme Configuration

Edit `src/app/globals.css` to customize colors:

```css
:root {
    --color-primary: #2563eb;
    --color-background: #ffffff;
    --color-text-primary: #1f2937;
    /* ... more variables ... */
}

[data-theme="dark"] {
    --color-primary: #60a5fa;
    --color-background: #0f1117;
    --color-text-primary: #f9fafb;
    /* ... dark mode overrides ... */
}
```

### Adding New Features

1. Create Redux slice in `src/features/[feature]/`
2. Add API routes in `src/app/api/[feature]/`
3. Create service layer in `src/services/[feature].service.js`
4. Add validation schema in `src/schemas/[feature]Schemas.js`
5. Build UI pages in `src/app/(dashboard)/[feature]/`

See `docs/IMPLEMENTATION_PLAN.md` for detailed patterns.

## 🔐 Security Features

- ✅ JWT token authentication with httpOnly cookies
- ✅ Input validation (client + server)
- ✅ CSRF protection ready
- ✅ File upload validation (type, size)
- ✅ XSS protection (React escaping)

## 🚀 Deployment

### Environment Variables for Production

```env
JWT_SECRET=your-secure-random-jwt-secret
NEXT_PUBLIC_STORAGE_STRATEGY=cloudinary  # or s3, vercel-blob
# Add cloud storage credentials as needed
```

### Build & Deploy

```bash
npm run build
npm run start
```

### Recommended Platforms

- **Vercel** - Seamless Next.js deployment
- **Railway** - Full-stack hosting for Node.js services
- **DigitalOcean** - VPS for complete control
- **AWS/Azure/GCP** - Enterprise-grade infrastructure

## 📚 Documentation

- **Implementation Plan:** `docs/IMPLEMENTATION_PLAN.md` - Comprehensive development roadmap
- **Pagination Patterns:** `docs/PAGINATION_PATTERNS.md` - Server-side pagination implementation guide
- **Component Examples:** Available at `/components-demo` (when logged in)
- **API Documentation:** Coming soon

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Parlomo Trade**

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment solutions
- Open source community for the incredible tools and libraries

---

**Built with ❤️ using Next.js 16, React 19, and Tailwind CSS v4**
