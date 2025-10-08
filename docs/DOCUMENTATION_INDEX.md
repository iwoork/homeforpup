# Documentation Index

This directory contains all project documentation organized by category.

## 📁 Directory Structure

```
docs/
├── README.md                          # Documentation overview
├── ARCHITECTURE.md                    # System architecture
├── CLEAN_STRUCTURE_SUMMARY.md        # Clean code structure guide
├── MONOREPO_SUMMARY.md               # Monorepo setup and structure
├── ORGANIZATION_SUMMARY.md           # Project organization guide
│
├── apps/                              # App-specific documentation
│   ├── CONTACT_FORM_SETUP.md
│   └── MESSAGE_API_MIGRATION.md
│
├── deployment/                        # Deployment guides
│   ├── AWS_CREDENTIALS_FIX.md
│   ├── AWS_CUSTOM_DOMAIN_SETUP.md
│   ├── DEPLOYMENT.md
│   ├── setup-cloudfront-ssl.md
│   ├── VERCEL_401_FIX.md
│   └── VERCEL_SETUP.md
│
├── development/                       # Development guides
│   ├── BUILD_ERRORS_FIXED.md
│   ├── debug_dogs_api.md
│   ├── DEBUG_ENDPOINTS.md
│   ├── DEBUGGING_SESSION.md
│   ├── DOG_DETAILS_SETUP.md
│   ├── ENV_CHECKLIST.md
│   ├── README.md
│   └── RESTART_INSTRUCTIONS.md
│
├── features/                          # Feature documentation
│   ├── ADD_DOG_FORM_COLOR_INTEGRATION.md
│   ├── ALL_APPS_COLOR_SELECTOR_COMPLETE.md
│   ├── BREEDER_APP_COLOR_INTEGRATION_COMPLETE.md
│   ├── BREEDS_TABLE_IAM_FIX.md
│   ├── COLOR_SELECTOR_FILES_SUMMARY.md
│   ├── COLOR_SELECTOR_IMPLEMENTATION_EXAMPLE.md
│   ├── COLOR_SELECTOR_INTEGRATION_SUMMARY.md
│   ├── COLOR_SELECTOR_USAGE.md
│   ├── DEBUG_COLOR_SELECTOR.md
│   ├── DOG_COLOR_SELECTOR_README.md
│   ├── DOG_FORMS_COLOR_INTEGRATION_COMPLETE.md
│   ├── DOG_MANAGEMENT_README.md
│   ├── MESSAGE_THREADS_IAM_FIX.md
│   ├── PUPPY_KENNEL_INTEGRATION_SUMMARY.md
│   ├── QUICK_START_COLOR_SELECTOR.md
│   └── TROUBLESHOOTING_COLOR_SELECTOR.md
│
├── migration/                         # Migration guides
│   ├── MIGRATION_COMPLETE_SUMMARY.md
│   ├── MIGRATION_GUIDE.md
│   ├── SHARED_DOG_FORM_MIGRATION.md
│   └── SHARED_PACKAGES_REFACTOR.md
│
├── mobile/                            # Mobile app documentation
│   └── BABEL_ISOLATION_COMPLETE.md
│
├── setup/                             # Initial setup guides
│   ├── AWS_IAM_SETUP.md
│   ├── DYNAMODB_SETUP.md
│   ├── GOOGLE_SEARCH_CONSOLE_SETUP.md
│   └── IMG_DOMAIN_SETUP_GUIDE.md
│
└── kennel-*.md                        # Kennel management guides
    ├── kennel-faq.md
    ├── kennel-management-guide.md
    ├── kennel-quick-start.md
    └── kennel-visual-guide.md
```

## 📚 Quick Links

### Getting Started
- [README](README.md) - Documentation overview
- [Architecture](ARCHITECTURE.md) - System architecture overview
- [Monorepo Summary](MONOREPO_SUMMARY.md) - Understanding the monorepo structure

### Setup & Configuration
- [AWS IAM Setup](setup/AWS_IAM_SETUP.md) - AWS credentials and permissions
- [DynamoDB Setup](setup/DYNAMODB_SETUP.md) - Database configuration
- [Environment Checklist](development/ENV_CHECKLIST.md) - Environment variables

### Development
- [Development README](development/README.md) - Development workflow
- [Restart Instructions](development/RESTART_INSTRUCTIONS.md) - How to restart services
- [Debug Endpoints](development/DEBUG_ENDPOINTS.md) - API debugging guide

### Features
- [Color Selector](features/DOG_COLOR_SELECTOR_README.md) - Dog color selection feature
- [Dog Management](features/DOG_MANAGEMENT_README.md) - Dog CRUD operations
- [Kennel Integration](features/PUPPY_KENNEL_INTEGRATION_SUMMARY.md) - Puppy kennel feature

### Deployment
- [Deployment Guide](deployment/DEPLOYMENT.md) - Complete deployment instructions
- [Vercel Setup](deployment/VERCEL_SETUP.md) - Vercel deployment
- [AWS Custom Domain](deployment/AWS_CUSTOM_DOMAIN_SETUP.md) - Custom domain setup

### Mobile
- [Babel Isolation](mobile/BABEL_ISOLATION_COMPLETE.md) - iOS app dependency isolation

### Migration
- [Migration Guide](migration/MIGRATION_GUIDE.md) - Project migration steps
- [Shared Packages Refactor](migration/SHARED_PACKAGES_REFACTOR.md) - Package refactoring

## 🗂️ Organization Principles

1. **apps/** - Documentation specific to individual applications
2. **deployment/** - All deployment and hosting related guides
3. **development/** - Development workflow and debugging guides
4. **features/** - Feature-specific implementation details
5. **migration/** - Historical migration and refactoring guides
6. **mobile/** - Mobile app (iOS/Android) specific documentation
7. **setup/** - Initial setup and configuration guides

## 📝 Contributing

When adding new documentation:
1. Place it in the appropriate category folder
2. Use descriptive, UPPERCASE_WITH_UNDERSCORES.md naming
3. Update this index if adding a new category
4. Keep the root README.md updated with high-level information

