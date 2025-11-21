# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in ASTROQUERY, please help us keep the project secure by reporting it responsibly.

### How to Report

**Please DO NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security issues by:

1. **Email:** Send details to abdullajurdabii@gmail.com (replace with your actual email)
2. **GitHub Security Advisories:** Use the [Security Advisories](https://github.com/Amadan04/NASA-dashboard/security/advisories) feature

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)
- Your contact information

We will acknowledge your report within 48 hours and provide regular updates on our progress.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Best Practices

### For Users

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Keep your API keys private and secure
   - Use strong, unique API keys
   - Rotate keys regularly

2. **API Keys**
   - Store API keys in `.env` files only
   - Never hardcode API keys in source code
   - Use different keys for development and production
   - Revoke keys immediately if exposed

3. **Dependencies**
   - Keep all dependencies up to date
   - Review security advisories regularly
   - Use `npm audit` and `pip-audit` to check for vulnerabilities

### For Contributors

1. **Code Review**
   - Review all changes for potential security issues
   - Never commit sensitive data or credentials
   - Use `.gitignore` to prevent accidental commits

2. **Pull Requests**
   - Ensure PRs don't expose secrets
   - Test security implications of changes
   - Document security-relevant changes

3. **Testing**
   - Write tests for authentication/authorization features
   - Test input validation and sanitization
   - Check for common vulnerabilities (XSS, SQLi, etc.)

---

## Known Security Considerations

### API Keys

This application requires external API keys:

- **OpenRouter API Key** - Used for AI/LLM features
- **NCBI API Key** - Used for publication data access

These keys must be kept secure and should never be committed to version control.

### Data Storage

- The application stores publication data in a local SQLite database
- Sensitive research data should be handled according to your organization's policies
- No user authentication is implemented by default (mock authentication only)

### CORS Configuration

The backend is configured with `CORS(app, resources={r"/*": {"origins": "*"}})` for development. **This should be restricted in production:**

```python
# Production configuration
CORS(app, resources={r"/*": {"origins": ["https://your-domain.com"]}})
```

---

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Users will be notified through:

- GitHub Security Advisories
- Release notes
- This SECURITY.md file

---

## Acknowledgments

We appreciate the security research community's efforts in keeping open-source projects secure. If you report a valid security issue, we'll acknowledge your contribution in our release notes (unless you prefer to remain anonymous).

---

## Questions?

If you have questions about this security policy, please open a discussion in the GitHub repository.

---

**Last Updated:** 2024-01-21