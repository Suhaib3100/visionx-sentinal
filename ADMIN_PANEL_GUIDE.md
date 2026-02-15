# Admin Panel Setup - visionx-eval

## 🎯 Overview

The Admin Panel allows you to:
- ✅ Create teams with participants
- ✅ Generate access tokens for teams
- ✅ Manage team members
- ✅ View token status and statistics

## 🚀 Quick Start

### Step 1: Start the Backend

```bash
cd apps/backend  
npm run start:dev
```

Backend runs on: `http://localhost:3000`

### Step 2: Start the Dashboard

```bash
cd apps/dashboard
pnpm dev
```

Dashboard runs on: `http://localhost:3001`

### Step 3: Login as Admin

1. Go to `http://localhost:3001/login`
2. Login with admin credentials:
   - Email: `suhaib@percify.io`
   - Password: `Zaka310@`

### Step 4: Access Admin Panel

1. In the sidebar, look for **"Administration"** section
2. Click on **"Team Management"**
3. You'll see the team management interface

## 📋 How to Create a Team & Generate Token

### Creating a Team

1. Click **"Create Team"** button (top right)
2. Enter team name (e.g., "bytecrew")
3. Add participants:
   - Click **"+ Add"** to add more participant fields
   - Enter participant names
   - Remove participants with the trash icon
4. Click **"Create Team"**

### Generating a Token

1. Find your team in the table
2. Click **"Generate Token"** button
3. A dialog will appear with:
   - The JWT token
   - Copy button (click to copy)
   - Instructions for VS Code extension
4. Click **"Copy"** to copy the token
5. Use this token in the VS Code extension

## 🎨 UI Features

### Dashboard Stats Cards
- **Total Teams**: Number of active teams
- **Total Participants**: Sum of all team members
- **Tokens Generated**: Number of teams with active tokens

### Teams Table
Shows all teams with:
- Team name
- Number of participants
- Token status (Active/Not generated)
- Creation date
- Action buttons (Generate/View Token, Edit)

### Token Dialog
When you generate/view a token:
- Full JWT token displayed
- Copy button for easy copying
- Usage instructions for VS Code extension
- Professional UI similar to GitHub's personal access tokens

## 🔐 Token Usage

After generating a token:

1. **In VS Code**:
   - Open the VisionX Eval extension
   - Click the VisionX icon in Activity Bar
   - Paste the token in the "Access Token" field
   - Click "Connect"

2. **Token Details**:
   - Token is valid for 30 days
   - Contains: team name, team ID, project ID
   - Used for authentication in the extension

## 📊 API Endpoints Used

### Create Team
```http
POST /api/v1/teams
Content-Type: application/json

{
  "name": "bytecrew",
  "members": ["Alice", "Bob", "Charlie"]
}
```

### Generate Token
```http
POST /api/v1/auth/generate-custom-token
Content-Type: application/json

{
  "teamName": "bytecrew",
  "teamId": "team-bytecrew"
}
```

## 🎯 Example Workflow

### Complete Flow: Team → Token → Extension

```bash
# 1. Login to dashboard
open http://localhost:3001/login

# 2. Navigate to Admin → Team Management

# 3. Create team "bytecrew" with 3 participants

# 4. Generate token for "bytecrew"

# 5. Copy the token

# 6. Open VS Code extension

# 7. Paste token and connect

# 8. Start evaluating!
```

## 🔄 Team Management Features

### Current Features
- ✅ Create teams with multiple participants
- ✅ Generate JWT tokens for teams
- ✅ View token status
- ✅ Copy tokens to clipboard
- ✅ Search teams
- ✅ View statistics

### Coming Soon
- 🔜 Edit team details
- 🔜 Delete teams
- 🔜 Regenerate tokens
- 🔜 Add/remove participants
- 🔜 View team activity logs

## 📱 Screenshots

### Teams Management View
- Clean table layout
- Action buttons for each team
- Search functionality
- Stats cards at the top

### Create Team Dialog
- Team name input
- Dynamic participant list
- Add/remove participants easily
- Professional form design

### Token Dialog
- Full token display
- One-click copy
- Usage instructions
- Clean, readable format

## 🛠️ Troubleshooting

### "Failed to create team"
- Check if backend is running
- Verify network connectivity
- Check browser console for errors

### "Failed to generate token"
- Ensure team exists in database
- Check backend logs
- Verify JWT secret is configured

### Token not working in extension
- Verify token was copied correctly (no extra spaces)
- Check if backend API URL matches in extension
- Try regenerating the token

## 🎉 Success Confirmation

You'll know everything is working when:
1. ✅ Dashboard shows admin panel in sidebar
2. ✅ You can create a team without errors
3. ✅ Token generation shows a JWT token
4. ✅ Token can be copied successfully
5. ✅ VS Code extension accepts the token
6. ✅ Extension shows "Connected" status with team info

---

**Next Steps**: After setting up a team, install and configure the VS Code extension using the generated token!
