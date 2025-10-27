# Prettier and ESLint Setup

This project is now configured with Prettier for code formatting and ESLint for linting.

## Installed Packages

- `prettier` - Code formatter
- `eslint` - JavaScript/TypeScript linter
- `@eslint/js` - ESLint JavaScript configs
- `typescript-eslint` - TypeScript support for ESLint
- `eslint-plugin-prettier` - Runs Prettier as an ESLint rule
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier
- `eslint-plugin-react-hooks` - React Hooks linting rules
- `eslint-plugin-react-refresh` - React Refresh linting rules
- `globals` - Global variables definitions

## Configuration Files

### `.prettierrc.json`
Prettier configuration with the following settings:
- Semi-colons: enabled
- Single quotes: enabled
- Print width: 100 characters
- Tab width: 2 spaces
- Trailing commas: ES5 style
- Arrow function parentheses: avoid when possible

### `eslint.config.mjs`
ESLint v9 flat configuration with:
- TypeScript support
- React Hooks rules
- Prettier integration
- Custom rules for warnings on unused variables, console statements, etc.

### `.vscode/settings.json`
VS Code workspace settings to:
- Format on save
- Use Prettier as default formatter
- Run ESLint fixes on save

## NPM Scripts

### Linting
```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues where possible
```

### Formatting
```bash
npm run format        # Format all code files
npm run format:check  # Check if files are formatted correctly
```

## VS Code Extensions

The workspace recommends installing:
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

## Usage

### Auto-format files
```bash
npm run format
```

### Check for linting errors
```bash
npm run lint
```

### Auto-fix linting errors
```bash
npm run lint:fix
```

### In VS Code
- Files will auto-format on save
- ESLint errors will show in the Problems panel
- Hover over warnings/errors for details

## Ignoring Files

### Prettier
Edit `.prettierignore` to exclude files/folders from formatting

### ESLint
The `ignores` section in `eslint.config.mjs` controls which files ESLint skips

## Notes

- The project uses ESLint v9 with the new flat config format
- Prettier and ESLint are integrated - Prettier runs as an ESLint rule
- Most formatting issues can be auto-fixed with `npm run format` or `npm run lint:fix`

