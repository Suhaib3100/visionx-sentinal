# VS Code Extension - Development Guide

## Quick Start

```bash
cd apps/vscode-extension
npm install
npm run compile
```

## Development

### Build Extension
```bash
npm run compile
```

### Watch Mode (for development)
```bash
npm run watch
```

### Run Extension Locally
1. Press `F5` in VS Code with the extension folder open
2. A new VS Code window opens with the extension loaded
3. Test commands via Command Palette (`Cmd+Shift+P`)

## Testing in Development

1. Open the extension folder in VS Code:
   ```bash
   code apps/vscode-extension
   ```

2. Press `F5` to launch Extension Development Host

3. In the new window, open a test workspace/project

4. Test the extension:
   - Run `VisionX: Authenticate Team`
   - Run `VisionX: Evaluate Now`
   - Check status bar for updates

## Package Extension

```bash
npm run package
```

This creates `visionx-eval-0.0.1.vsix` file.

## Install Packaged Extension

```bash
code --install-extension visionx-eval-0.0.1.vsix
```

Or in VS Code:
1. Go to Extensions view
2. Click `...` menu
3. Select "Install from VSIX..."
4. Choose the `.vsix` file

## Directory Structure

```
apps/vscode-extension/
├── src/
│   ├── extension.ts           # Entry point
│   ├── auth/
│   │   └── auth-manager.ts    # Token management
│   ├── api/
│   │   └── api-client.ts      # Backend API calls
│   ├── workspace/
│   │   └── workspace-scanner.ts  # Code analysis
│   ├── snapshot/
│   │   └── snapshot-engine.ts    # Snapshot creation
│   └── ui/
│       └── statusbar-manager.ts  # Status bar UI
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # User documentation
```

## Extension Features

### 1. Authentication
- Securely stores team tokens in VS Code secrets
- Validates tokens with backend API
- Retrieves team and project IDs

### 2. Workspace Scanning
- Detects tech stack (languages, frameworks)
- Counts lines of code per language
- Builds file tree (respecting .gitignore)
- Generates project hash for change detection

### 3. Snapshot Creation
- Creates compressed .tar.gz archives
- Only includes changed files
- Skips uploads if no changes detected
- Automatic cleanup of temporary files

### 4. Auto-Evaluation
- Runs every 45 minutes (configurable)
- Can be triggered manually anytime
- Smart skipping when no changes

### 5. Status Bar Integration
- Shows connection status
- Displays evaluation progress
- Clickable for quick actions

## Configuration

Users can customize via VS Code settings:

```json
{
  "visionx.apiUrl": "https://api.visionx-eval.com",
  "visionx.autoEvaluate": true
}
```

## API Integration

The extension integrates with these backend endpoints:

- `POST /auth/validate` - Validate team token
- `POST /projects/:id/snapshots` - Upload snapshot
- `GET /projects/:id/stats` - Get project stats
- `GET /projects/:id/snapshots/latest` - Get last snapshot hash

## Publishing (Future)

To publish to VS Code Marketplace:

1. Get a Personal Access Token from Azure DevOps
2. Create publisher account
3. Update `package.json` with correct publisher name
4. Run:
   ```bash
   vsce publish
   ```

## Troubleshooting

**Build errors:**
- Ensure TypeScript is installed: `npm install -g typescript`
- Check Node version: `node -v` (needs 18+)

**Extension not loading:**
- Check VS Code Output panel (VisionX channel)
- Verify `dist/extension.js` was created
- Try cleaning and rebuilding: `rm -rf dist && npm run compile`

**Can't connect to backend:**
- Check `visionx.apiUrl` setting
- Verify backend is running
- Check network/firewall settings

## Contributing

When adding new features:

1. Create new files in appropriate directories
2. Update `extension.ts` to wire up commands
3. Add commands to `package.json` contributes section
4. Update README.md with new features
5. Test thoroughly in Extension Development Host
