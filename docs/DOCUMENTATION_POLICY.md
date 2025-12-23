# Documentation Policy

## Documentation Location

**All markdown (`.md`) documentation files should be stored in the `docs/` folder.**

This includes:
- Setup guides
- Deployment guides
- Architecture documentation
- Feature documentation
- Migration guides
- Troubleshooting guides
- Any other markdown documentation

## Folder Structure

Documentation is organized by category in the `docs/` folder:

```
docs/
├── infrastructure/     # Infrastructure and AWS setup
├── deployment/         # Deployment guides
├── setup/              # Initial setup guides
├── features/           # Feature documentation
├── migration/          # Migration guides
└── development/       # Development guides
```

## Exceptions

The following are exceptions and may remain in their respective locations:

- `README.md` files in project roots (e.g., `apps/homeforpup-infrastructure/README.md`)
- `CHANGELOG.md` files
- `LICENSE.md` files
- Package-specific documentation in `packages/` (if needed)

## Benefits

Organizing documentation in the `docs/` folder provides:

1. **Centralized Location**: Easy to find all documentation
2. **Better Organization**: Categorized by purpose
3. **Easier Maintenance**: Update documentation in one place
4. **Consistency**: Standard location across the monorepo
5. **Version Control**: All docs tracked together

## Migration

When creating new documentation:

1. Determine the appropriate category folder in `docs/`
2. Create the markdown file in that location
3. If the file is in an app folder, move it to `docs/` and update any references

## Examples

✅ **Good**:
- `docs/infrastructure/DEPLOYMENT_GUIDE.md`
- `docs/setup/DYNAMODB_SETUP.md`
- `docs/features/MESSAGING.md`

❌ **Avoid**:
- `apps/homeforpup-api/DEPLOYMENT.md` (should be in `docs/`)
- `scripts/SETUP_GUIDE.md` (should be in `docs/`)

## Related

- [Documentation Index](./DOCUMENTATION_INDEX.md)
- [Infrastructure Documentation](./infrastructure/README.md)


