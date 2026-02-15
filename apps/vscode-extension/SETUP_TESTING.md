# VS Code Extension Setup & Testing Guide

## 🚀 Quick Start

### Step 1: Start the Backend

```bash
cd apps/backend
npm run start:dev
```

The backend will start on `http://localhost:3000`

### Step 2: Generate a Custom Token

Use the provided script to generate a token for your team:

```bash
./scripts/generate-token.sh bytecrew
```

This will output:
- A JWT token you'll use in the VS Code extension
- Team ID and Project ID associated with the token

**Example Output:**
```
✅ Token generated successfully!

📋 Copy this token to use in VS Code extension:

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

================================================
Team Name: bytecrew
Team ID:   team-bytecrew
Project ID: project-bytecrew
================================================
```

### Step 3: Install the VS Code Extension

#### Option A: Install from VSIX (Recommended)

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Extensions: Install from VSIX..."
4. Navigate to `apps/vscode-extension/visionx-eval-0.0.1.vsix`
5. Click "Install"
6. Reload VS Code if prompted

#### Option B: Run in Development Mode

1. Open VS Code
2. Open the project folder: `apps/vscode-extension`
3. Press `F5` to start debugging
4. A new VS Code window will open with the extension loaded

### Step 4: Configure and Authenticate

1. Look for the **VisionX Eval** icon in the VS Code Activity Bar (left sidebar)
2. Click it to open the VisionX panel
3. You'll see the **Dashboard** view with an authentication form
4. Paste the token you generated in Step 2
5. Click **Connect**

### Step 5: Verify Authentication

Once authenticated, you should see:
- ✅ Connected status badge
- Your team name: `bytecrew`
- Your team ID: `team-bytecrew`
- Your project ID: `project-bytecrew`
- Action buttons: Capture & Evaluate, Refresh Status, Logout

## 🎨 UI Features

The new extension UI includes:

### Dashboard View
- **Authentication Section**: Enter your token directly in the sidebar
- **Team Status**: See your connection status and team information
- **Actions**: Quick access to evaluate, refresh, and logout

### Recent Snapshots View
- Shows your recent project snapshots
- Click to view snapshot details

## 🔧 Configuration

The extension uses the following default settings:

- **API URL**: `http://localhost:3000/api` (configurable in VS Code settings)
- **Token Storage**: Securely stored in VS Code's global state

To change the API URL:
1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "VisionX"
3. Update the "API URL" setting

## 📝 Available Commands

Access these via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- **VisionX: Authenticate Team** - Open authentication dialog
- **VisionX: Evaluate Now** - Capture and evaluate current project state
- **VisionX: View Stats** - See your team's statistics and ranking
- **VisionX: Disconnect** - Logout from VisionX

## 🐛 Troubleshooting

### "Not configured" or "Authentication failed"

1. Make sure the backend is running on `http://localhost:3000`
2. Verify the token is valid by running:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/validate \
     -H "Content-Type: application/json" \
     -d '{"token": "YOUR_TOKEN_HERE"}'
   ```
3. Check VS Code Developer Tools for errors:
   - `Help` → `Toggle Developer Tools`
   - Check the Console tab

### Extension not showing in Activity Bar

1. Uninstall any previous versions
2. Reload VS Code
3. Reinstall the extension

### Changes not reflecting

1. Rebuild the extension:
   ```bash
   cd apps/vscode-extension
   npm run compile
   npx @vscode/vsce package
   ```
2. Uninstall old version from VS Code
3. Install the new VSIX file

## 🔄 Development Workflow

When making changes to the extension:

```bash
# 1. Make your code changes

# 2. Compile
cd apps/vscode-extension
npm run compile

# 3. Package
npx @vscode/vsce package

# 4. Test in VS Code
# - Uninstall old version
# - Install new VSIX
# - Reload window
```

Or use the Debug mode (F5) for faster iteration.

## 📚 API Endpoints

### Generate Custom Token
```bash
POST http://localhost:3000/api/v1/auth/generate-custom-token
Content-Type: application/json

{
  "teamName": "bytecrew",
  "teamId": "team-bytecrew",      // optional
  "projectId": "project-bytecrew"  // optional
}
```

### Validate Token
```bash
POST http://localhost:3000/api/v1/auth/validate
Content-Type: application/json

{
  "token": "YOUR_JWT_TOKEN"
}
```

## 🎯 Next Steps

1. **Customize Your Token**: Generate tokens for different teams
2. **Test Evaluation**: Click "Capture & Evaluate" to test snapshot creation
3. **View Snapshots**: Check the "Recent Snapshots" view
4. **Explore Commands**: Try all commands from the Command Palette

---

Need help? Check the main [README.md](../README.md) or [QUICKSTART.md](../QUICKSTART.md) for more information.
