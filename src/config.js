module.exports = {
    // Support settings
    supportRole: 'Support Staff',
    maxWaitingTime: 300000,       // 5 minutes in milliseconds
    notifyStaffDelay: 60000,      // 1 minute in milliseconds
    
    // Channel IDs (to be set in .env)
    waitingRoomId: process.env.WAITING_ROOM_ID,
    supportLogId: process.env.SUPPORT_LOG_ID,
    
    // Audio settings
    notificationSound: 'notification.mp3',
    soundRepeatDelay: 300000,    // 5 minutes between sound notifications
    
    // Add-ons (can be enabled/disabled)
    addons: {
        customCode: true,        // Custom code execution for events
        audioAlerts: true,       // Sound notifications
        staffStats: true,        // Staff performance tracking
        ratingSystem: true,      // User rating system
        notifySystem: true,      // Staff notification system
        loggingSystem: true      // Session logging
    },
    
    // Custom code hooks (add your code here)
    hooks: {
        onJoinWaitingList: async (user) => {
            // Your custom code for when a user joins the waiting list
            console.log(`${user.tag} joined the waiting list`);
        },
        onReceiveHelp: async (user, staff) => {
            // Your custom code for when a user receives help
            console.log(`${user.tag} is being helped by ${staff.tag}`);
        },
        onLeaveRating: async (user, staff, rating, reason) => {
            // Your custom code for when a user leaves a rating
            console.log(`${user.tag} rated ${staff.tag}: ${rating} - ${reason || 'No reason provided'}`);
        }
    },
    
    // Messages
    messages: {
        joinWaitingList: "You've been added to the waiting list. A support staff member will assist you shortly.",
        noStaffAvailable: "⚠️ No support staff are currently available. Please try again later.",
        staffNotification: "🔔 New user in waiting room needs assistance!",
        ratingPrompt: "Please rate your support experience:",
        sessionTimeout: "Support session has timed out due to inactivity."
    }
};
