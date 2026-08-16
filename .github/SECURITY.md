# Security Policy

## Supported Versions

Only the latest version on the `main` branch is actively supported with security updates.

## API Keys & Credentials Safety

- **Never commit `.env.local` or any file containing API keys, passwords, or client secrets to GitHub.**
- The repository `.gitignore` is pre-configured to exclude all `.env*` files except `.env.example`.
- All OpenSky API credentials (`OPENSKY_CLIENT_ID`, `OPENSKY_CLIENT_SECRET`) are server-only environment variables and are never bundled into client-side code.

## Reporting a Vulnerability

If you discover a security vulnerability, please do **NOT** open a public issue. Instead, report it privately via GitHub Security Advisories or by emailing the project maintainers.

Please include:
- A description of the vulnerability and its potential impact
- Step-by-step instructions to reproduce the issue
- Proof of concept or suggested fix if available
