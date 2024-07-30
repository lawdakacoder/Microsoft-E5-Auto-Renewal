// To generate encryption and hmac key run:
// python get-keys.py

export const config = {
    encryption: {
        ENCRYPTION_KEY: 'encyption_key_here',
        HMAC_KEY: 'hmac_key_here'
    },

    worker: {
        WORKER_URL: 'https://example.workers.dev',
        REDIRECT_URL: 'https://example.workers.dev/auth'
    },

    oauth: {
        TOKEN_ENDPOINT: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        AUTH_SCOPES: [
            'Directory.Read.All',
            'Directory.ReadWrite.All',
            'Files.Read',
            'Files.Read.All',
            'Files.ReadWrite',
            'Files.ReadWrite.All',
            'Mail.Read',
            'Mail.ReadWrite',
            'MailboxSettings.Read',
            'MailboxSettings.ReadWrite',
            'offline_access',
            'Sites.Read.All',
            'Sites.ReadWrite.All',
            'User.Read',
            'User.Read.All',
            'User.ReadWrite.All'
        ].join('+')
    },

    graph: {
        GRAPH_ENDPOINTS: [
            'https://graph.microsoft.com/v1.0/me/drive/root',
            'https://graph.microsoft.com/v1.0/me/drive',
            'https://graph.microsoft.com/v1.0/drive/root',
            'https://graph.microsoft.com/v1.0/users',
            'https://graph.microsoft.com/v1.0/me/messages',
            'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messageRules',
            'https://graph.microsoft.com/v1.0/me/drive/root/children',
            'https://api.powerbi.com/v1.0/myorg/apps',
            'https://graph.microsoft.com/v1.0/me/mailFolders',
            'https://graph.microsoft.com/v1.0/me/outlook/masterCategories',
            'https://graph.microsoft.com/v1.0/applications?$count=true',
            'https://graph.microsoft.com/v1.0/me/?$select=displayName,skills',
            'https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages/delta',
            'https://graph.microsoft.com/beta/me/outlook/masterCategories',
            'https://graph.microsoft.com/beta/me/messages?$select=internetMessageHeaders&$top=1',
            'https://graph.microsoft.com/v1.0/sites/root/lists',
            'https://graph.microsoft.com/v1.0/sites/root',
            'https://graph.microsoft.com/v1.0/sites/root/drives'
        ]
    }
};
