# Dokploy Server Dashboard

A beautiful, modern web dashboard for viewing and managing your Dokploy server information. Built with TypeScript, Vite, and vanilla JavaScript.

![Dokploy Dashboard](https://img.shields.io/badge/Dokploy-Dashboard-6366f1?style=for-the-badge)

## Features

✨ **Comprehensive Overview**
- View all projects, applications, databases, and Docker Compose services
- Beautiful card-based UI with modern design
- Real-time statistics dashboard

🔍 **Detailed Information**
- Application IDs, Environment IDs, Project IDs
- Configuration details (repositories, branches, Docker images)
- Domain and URL information
- Database credentials and settings

📋 **Easy ID Management**
- One-click copy-to-clipboard for all IDs
- Visual feedback with toast notifications
- Perfect for CI/CD pipeline configuration

🎨 **Beautiful Design**
- Modern dark theme
- Responsive layout for all devices
- Smooth animations and transitions
- Color-coded resource types

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Dokploy server with API access

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fuzzy-garbanzo
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API credentials:

**Option 1: Using the UI (Recommended)**
- Just run the dev server and enter your credentials in the form

**Option 2: Using environment variables**
- Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

- Edit `.env` and add your credentials:
```env
VITE_DOKPLOY_URL=https://your-dokploy-server.com
VITE_DOKPLOY_API_KEY=your-api-key-here
```

### Running the Application

**Development mode:**
```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## Getting Your Dokploy API Key

1. Log into your Dokploy instance
2. Navigate to **Settings** > **Profile**
3. Find the **API/CLI Section**
4. Click to generate a new API token
5. Copy the token and use it in this dashboard

## Usage

1. **Enter Credentials**: On first load, enter your Dokploy URL and API key
2. **View Overview**: See statistics for all your projects, apps, and databases
3. **Browse Resources**: Expand projects to view detailed information
4. **Copy IDs**: Click any ID to copy it to your clipboard
5. **Use in CI/CD**: Use the copied IDs in your deployment pipelines

## Project Structure

```
fuzzy-garbanzo/
├── src/
│   ├── main.ts          # Main application logic
│   ├── api.ts           # Dokploy API client
│   ├── types.ts         # TypeScript type definitions
│   └── style.css        # Styles and design system
├── index.html           # Main HTML file
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## API Endpoints Used

This dashboard uses the following Dokploy API endpoint:

- `GET /api/project.all` - Fetches all projects with their environments, applications, databases, and compose services

For more information about the Dokploy API, see [CLAUDE.md](./CLAUDE.md).

## Technologies

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vanilla JS** - No framework dependencies
- **CSS3** - Modern styling with CSS Grid and Flexbox

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

Built for use with [Dokploy](https://dokploy.com) - an open-source deployment platform.
