# Contributing to AeroFlight AM

Thank you for your interest in contributing to AeroFlight AM!

## Development Workflow

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/your-username/AeroFlightAm.git
   cd AeroFlightAm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up local environment**:
   Copy `.env.example` to `.env.local` if you have OpenSky API credentials (optional):
   ```bash
   cp .env.example .env.local
   ```

4. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the display.

## Code Standards

- **TypeScript**: Strict types with no `any` where avoidable.
- **Canvas Rendering**: Keep grid operations integer-aligned. All drawing primitives should use `LEDBoard` paths and standard color palettes in `lib/led-board.ts`.
- **Validation**: Ensure all checks pass before submitting a PR:
  ```bash
  npm run typecheck
  npm run build
  ```

## Pull Request Guidelines

- Create a feature branch with a descriptive name (e.g., `feat/add-new-airline-logo` or `fix/map-projection-offset`).
- Fill out the PR template completely.
- Keep PRs focused on a single concern.
