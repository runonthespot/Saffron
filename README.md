# Saffron

## Disclaimer
This project was created as a test implementation using Cursor Agents, an AI-powered development tool. It was built specifically to demonstrate capabilities to Impulse and should not be considered a production-ready application.

## About
Saffron is a simple portfolio management prototype that includes:
- Basic authentication (username: guest / password: impulse)
- Portfolio qualification questionnaire
- Portfolio builder interface
- Investment simulation tools

## Technical Stack
- React with TypeScript
- Redux for state management
- Material-UI (MUI) for components
- SCSS for styling
- Vercel Analytics integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/runonthespot/Saffron.git
cd Saffron/saffron
```

### Step 2: Environment Setup
Create a `.env` file in the `saffron` directory:
```env
REACT_APP_VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### Step 3: Install Dependencies
```bash
yarn install
```

### Step 4: Start Development Server
```bash
yarn start
```
The application will be available at `http://localhost:3000`

### Step 5: Build for Production
```bash
yarn build
```

## Development Notes

### Project Structure
```
saffron/
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific components and logic
│   │   ├── auth/       # Authentication
│   │   ├── portfolio/  # Portfolio management
│   │   ├── qualification/  # User qualification
│   │   └── simulation/ # Investment simulation
│   ├── store/         # Redux store configuration
│   ├── styles/        # Global styles and theme
│   └── types/         # TypeScript type definitions
```

### Authentication
The demo uses a simple hardcoded authentication:
- Username: `guest`
- Password: `impulse`

### Deployment
The project is configured for deployment on Vercel:
1. Fork the repository
2. Create a new project on Vercel
3. Connect your forked repository
4. Add environment variables in Vercel dashboard
5. Deploy

## Purpose
This repository serves as a demonstration of:
- Rapid prototyping using AI assistance
- Modern React development practices
- Clean architecture and code organization
- Integration of various frontend technologies

## Note
This is not intended for production use and comes with no warranties or guarantees. All code and functionality should be thoroughly reviewed and tested before any real-world application. 