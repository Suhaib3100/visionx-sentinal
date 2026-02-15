# VisionX Eval - VS Code Extension

Automated hackathon project evaluation extension that snapshots your project periodically and sends it for AI-powered evaluation.

## Features

- **Automatic Authentication**: Securely connect your VS Code workspace to VisionX evaluation platform
- **Smart Snapshots**: Automatically creates project snapshots every 45 minutes
- **Intelligent Diffing**: Only uploads when changes are detected
- **Tech Stack Detection**: Automatically detects languages, frameworks, and dependencies
- **Real-time Stats**: View your current rank, score, and evaluation history
- **Final Submission**: Lock your submission when ready

## Getting Started

1. **Install the Extension**
   - Download from VS Code Marketplace or install from `.vsix` file

2. **Authenticate**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "VisionX: Authenticate Team"
   - Enter your team authentication token from the VisionX dashboard

3. **Start Building**
   - The extension automatically scans your workspace
   - Snapshots are created every 45 minutes
   - View status in the status bar (bottom-left)

4. **Manual Evaluation**
   - Use "VisionX: Evaluate Now" command to create an immediate snapshot
   - Useful before demos or when you want instant feedback

5. **Final Submission**
   - When ready, use "VisionX: Final Submission"
   - This locks further submissions - use carefully!

## Commands

- `VisionX: Authenticate Team` - Connect to VisionX platform
- `VisionX: Evaluate Now` - Create and upload snapshot immediately
- `VisionX: Final Submission` - Submit final version and lock submissions
- `VisionX: View Project Stats` - View your current rank and scores
- `VisionX: Disconnect` - Logout from VisionX

## Configuration

Access settings via File > Preferences > Settings > VisionX Eval

- `visionx.apiUrl`: Backend API URL (default: http://localhost:3000/api)
- `visionx.autoEvaluate`: Enable/disable automatic evaluations (default: true)

## What Gets Included

The extension automatically:
- ✅ Includes all source code files
- ✅ Detects programming languages and frameworks
- ✅ Counts lines of code per language
- ✅ Extracts dependency lists
- ❌ Excludes `node_modules/`, `dist/`, build outputs
- ❌ Respects your `.gitignore` patterns

## Status Bar

Monitor your connection status in the bottom-left corner:

- 🔴 **Not Connected**: Click to authenticate
- ✅ **Connected**: Extension is active
- 🔄 **Evaluating**: Creating snapshot
- ✔️ **Final Submitted**: Submission locked
- ❌ **Error**: Click to retry

## Evaluation Frequency

- **Automatic**: Every 45 minutes (if enabled)
- **Manual**: Anytime via "Evaluate Now" command
- **Smart Skipping**: No upload if no changes detected

## Privacy & Security

- Only tracks files not in `.gitignore`
- Excludes sensitive files (`.env`, credentials)
- Token stored securely in VS Code secrets
- All data transmitted over HTTPS

## Troubleshooting

**Extension not working?**
1. Check status bar for error messages
2. Verify authentication token is valid
3. Ensure workspace folder is open
4. Check VS Code Output panel (VisionX channel)

**Snapshot upload failing?**
- Verify internet connection
- Check API URL configuration
- Ensure project size is under limit (50MB compressed)

## Support

For issues or questions:
- Email: support@visionx-eval.com
- GitHub: github.com/visionx/visionx-eval

## Privacy

VisionX Eval respects your privacy. See our privacy policy at visionx-eval.com/privacy

## License

MIT License - See LICENSE file for details
