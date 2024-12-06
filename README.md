# Saffron

## Disclaimer
This project was created as a test implementation using Cursor Agents, an AI-powered development tool. It was built specifically to demonstrate capabilities to Impulse and should not be considered a production-ready application.

## About
Saffron is a simple portfolio management prototype that includes:
- Basic authentication (configurable via environment variables)
- Portfolio qualification questionnaire
- Portfolio builder interface
- Investment simulation tools

## Technical Stack
- React with TypeScript
- Redux for state management
- Material-UI (MUI) for components
- SCSS for styling
- Vercel Analytics integration
- OpenAI API for portfolio suggestions

## Testing

### Running Tests
```bash
# Run all tests
yarn test

# Run tests in watch mode (recommended during development)
yarn test --watch

# Run tests with coverage report
yarn test --coverage

# Run specific test file
yarn test src/features/auth/__tests__/Login.test.tsx
```

### Test Structure
```
src/
├── __tests__/          # Global test files
├── features/
│   ├── auth/
│   │   └── __tests__/  # Authentication tests
│   ├── portfolio/
│   │   └── __tests__/  # Portfolio tests
│   └── ...
└── utils/
    └── test-utils.tsx  # Test utilities
```

### Test Coverage
The test suite covers:
- Redux state management
- Component rendering
- User interactions
- Form submissions
- Error handling
- Environment variable handling

### Writing Tests
Tests are written using:
- Jest as the test runner
- React Testing Library for component testing
- Custom test utilities for Redux and Material-UI integration

Example test:
```typescript
import { render, screen, fireEvent } from '../utils/test-utils';

describe('Component Test', () => {
  it('should handle user interaction', () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager
- Git
- OpenAI API key (for portfolio suggestions)

### Step 1: Clone the Repository
```bash
git clone https://github.com/runonthespot/Saffron.git
cd Saffron/saffron
```

### Step 2: Environment Setup
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your specific values:
```env
# Analytics
REACT_APP_VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Authentication (default: guest/impulse)
REACT_APP_AUTH_USERNAME=guest
REACT_APP_AUTH_PASSWORD=impulse

# OpenAI API (Required for portfolio suggestions)
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

For local development:
- You can keep the default authentication credentials (guest/impulse)
- Replace `your_openai_api_key` with your actual OpenAI API key
- The Vercel Analytics ID is optional for local development

For production deployment:
- Change the authentication credentials
- Ensure all API keys are properly set
- Never commit your `.env` file to version control

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
The demo uses environment variables for authentication:
- Username: Set via `REACT_APP_AUTH_USERNAME` (default: guest)
- Password: Set via `REACT_APP_AUTH_PASSWORD` (default: impulse)

For development and testing purposes, you can use the default credentials, but make sure to change them for any other use.

### API Keys
- OpenAI API key is required for portfolio suggestions functionality
- Never commit API keys to version control
- Use environment variables for all sensitive credentials

### Deployment
The project is configured for deployment on Vercel:
1. Fork the repository
2. Create a new project on Vercel
3. Connect your forked repository
4. Add environment variables in Vercel dashboard:
   - `REACT_APP_VERCEL_ANALYTICS_ID`
   - `REACT_APP_AUTH_USERNAME`
   - `REACT_APP_AUTH_PASSWORD`
   - `REACT_APP_OPENAI_API_KEY`
5. Deploy

## Purpose
This repository serves as a demonstration of:
- Rapid prototyping using AI assistance
- Modern React development practices
- Clean architecture and code organization
- Integration of various frontend technologies

## Note
This is not intended for production use and comes with no warranties or guarantees. All code and functionality should be thoroughly reviewed and tested before any real-world application. 