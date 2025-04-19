# MADX Support Assistant

A comprehensive Discord support bot with waiting list management, staff ratings, and customizable features.

![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## Features

✨ **Core Features**
- Advanced waiting list system with queue management
- Staff availability tracking and notifications
- Support session logging and statistics
- Rating system for support quality
- Audio notifications for new support requests

🛠️ **Customization**
- Custom code hooks for key events:
  - When users join the waiting list
  - When users receive help
  - When users leave ratings
- Configurable notification sounds
- Customizable messages and delays

📊 **Staff Features**
- Staff performance tracking
- Support session logging
- Time tracking for support sessions
- Positive/negative rating system
- Detailed statistics for staff members

⚙️ **Add-ons**
- Custom Code Execution
- Audio Alerts
- Staff Statistics
- Rating System
- Staff Notifications
- Session Logging

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in:
   - Bot token
   - Client ID
   - Waiting room channel ID
   - Support log channel ID

4. Create the required Discord server setup:
   - Role: "Support Staff"
   - Channel: Waiting Room (for users to wait)
   - Channel: Support Logs (for session logging)

5. Deploy slash commands:
   ```bash
   node src/deploy-commands.js
   ```
6. Start the bot:
   ```bash
   npm start
   ```

## Commands

### User Commands
- `/support request` - Join the support waiting list
- `/support stats` - View support statistics

### Staff Commands
- `/support available` - Mark yourself as available for support
- `/support unavailable` - Mark yourself as unavailable
- `/staff list` - List all staff members
- `/staff top` - View top performing staff

### Admin Commands
- `/staff add` - Add a new staff member
- `/staff remove` - Remove a staff member

## Support Flow

1. User requests support using `/support request`
2. User is added to waiting list
3. Available staff are notified (with sound)
4. Staff can view and manage the waiting list
5. After help, user can rate the support quality
6. Statistics and logs are updated

## Customization

### Custom Code Hooks
Add your own code in `config.js` for these events:
```javascript
hooks: {
    onJoinWaitingList: async (user) => {
        // Your code here
    },
    onReceiveHelp: async (user, staff) => {
        // Your code here
    },
    onLeaveRating: async (user, staff, rating, reason) => {
        // Your code here
    }
}
```

### Audio Notifications
Place your custom notification sound in `assets/sounds/notification.mp3`

## Support

Join our support server: https://discord.gg/yKQaBYpGuh
