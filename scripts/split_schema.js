const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schemaDir = path.join(__dirname, '../prisma/schema');

// Define groupings
const groupings = {
    'ai.prisma': [
        'ai_assistance', 'ai_cache', 'ai_conversations', 'ai_feedback', 'ai_fraud_detections',
        'ai_image_analysis', 'ai_interactions', 'ai_messages', 'ai_models', 'ai_quotas',
        'ai_recommendations', 'ai_review_analysis', 'ai_search_queries', 'ai_search_rankings',
        'ai_smart_notifications', 'user_preferences_ai'
    ],
    'analytics.prisma': ['user_behaviors'],
    'auth.prisma': ['users', 'roles', 'permissions', 'role_permissions', 'refresh_tokens'],
    'base.prisma': ['activity_logs', 'audit_logs', 'files', 'settings'],
    'booking.prisma': [
        'bookings', 'booking_addons', 'booking_status_history', 'booking_waitlist',
        'recurring_bookings', 'refund_policies', 'refund_rules'
    ],
    'cms.prisma': [
        'contents', 'banners', 'blog_posts', 'email_templates', 'faqs', 'notifications',
        'policies', 'promotion_contents', 'reports', 'reviews', 'review_images',
        'support_tickets', 'system_announcement_reads', 'system_announcements',
        'notification_settings'
    ],
    'payment.prisma': [
        'payments', 'invoices', 'invoice_items', 'transactions', 'wallets',
        'payout_requests', 'point_transactions', 'user_vouchers',
        'promotions', 'promotion_usage', 'promotion_courts', 'promotion_venues',
        'transaction_disputes', 'pricing_rules', 'user_points', 'membership_tiers',
        'user_subscriptions', 'subscription_plans'
    ],
    'social.prisma': [
        'posts', 'post_comments', 'social_likes', 'social_media', 'friendships',
        'user_followers', 'user_blocks', 'teams', 'team_members', 'team_invitations',
        'team_join_requests', 'chat_conversations', 'chat_members', 'chat_messages',
        'chat_message_reactions', 'chat_message_receipts', 'chat_settings', 'chat_templates',
        'user_achievements', 'favorite_venues', 'user_devices'
    ],
    'tournament.prisma': [
        'tournaments', 'tournament_participants', 'tournament_brackets', 'tournament_matches',
        'match_findings', 'match_participants', 'match_results'
    ],
    'venue.prisma': [
        'venues', 'organizations', 'courts', 'court_images', 'court_maintenance',
        'venue_images', 'venue_operating_hours', 'venue_revenue_snapshots',
        'venue_schedule_exceptions', 'venue_services', 'venue_staff', 'venue_verifications',
        'venue_blacklist', 'venue_memberships', 'staff_shifts', 'time_slots'
    ]
};

// Also define enum groupings if possible, or just append enums to where they are used.
// Or we can dump all enums to a specific file? Usually enums are better placed with their valid usage.
// Strategy for enums: Check which model uses it. If used by multiple, put in base or the most relevant one.
// Simplification: We will assign enums to file based on prefix matching or manual map.
const enumMappings = {
    'activity_logs_activity_type_enum': 'base.prisma',
    'files_category_enum': 'base.prisma',
    'users_kyc_status_enum': 'auth.prisma',
    'users_gender_enum': 'auth.prisma',
    // AI enums
    'ai_assistance_type_enum': 'ai.prisma',
    'ai_conversations_sentiment_enum': 'ai.prisma',
    'ai_conversations_status_enum': 'ai.prisma',
    'ai_fraud_detections_action_taken_enum': 'ai.prisma',
    'ai_fraud_detections_risk_level_enum': 'ai.prisma',
    'ai_image_analysis_human_decision_enum': 'ai.prisma',
    'ai_image_analysis_moderation_status_enum': 'ai.prisma',
    'ai_interactions_status_enum': 'ai.prisma',
    'ai_interactions_type_enum': 'ai.prisma',
    'ai_messages_sender_type_enum': 'ai.prisma',
    'ai_models_provider_enum': 'ai.prisma',
    'ai_models_status_enum': 'ai.prisma',
    'ai_models_type_enum': 'ai.prisma',
    'ai_quotas_period_enum': 'ai.prisma',
    'ai_recommendations_algorithm_enum': 'ai.prisma',
    'ai_recommendations_recommendation_type_enum': 'ai.prisma',
    'ai_review_analysis_sentiment_enum': 'ai.prisma',
    'ai_smart_notifications_trigger_type_enum': 'ai.prisma',
    // ... others map by prefix ...
};

// Helper to determine file for a model
function getFileForModel(modelName) {
    for (const [file, models] of Object.entries(groupings)) {
        if (models.includes(modelName)) return file;
    }
    return null;
}

// Helper to determine file for an enum
function getFileForEnum(enumName) {
    if (enumMappings[enumName]) return enumMappings[enumName];

    // Try prefix matching
    if (enumName.startsWith('ai_')) return 'ai.prisma';
    if (enumName.startsWith('booking')) return 'booking.prisma';
    if (enumName.startsWith('chat_')) return 'social.prisma';
    if (enumName.startsWith('team_')) return 'social.prisma';
    if (enumName.startsWith('tournament_')) return 'tournament.prisma';
    if (enumName.startsWith('venue_')) return 'venue.prisma';
    if (enumName.startsWith('user_behaviors')) return 'analytics.prisma';
    if (enumName.startsWith('contents_')) return 'cms.prisma';
    if (enumName.startsWith('payments_')) return 'payment.prisma';
    if (enumName.startsWith('invoices_')) return 'payment.prisma';
    if (enumName.startsWith('notifications_')) return 'cms.prisma';
    if (enumName.startsWith('reports_')) return 'cms.prisma';
    if (enumName.startsWith('support_tickets_')) return 'cms.prisma';
    if (enumName.startsWith('match_')) return 'tournament.prisma'; // match_findings_*
    if (enumName.startsWith('user_profiles_')) return 'auth.prisma'; // Assuming user profile related
    if (enumName.startsWith('user_subscriptions_')) return 'payment.prisma';

    // Default fallback
    return 'base.prisma';
}

function parseSchema(content) {
    const blocks = [];
    const blockRegex = /(model|enum)\s+(\w+)\s+\{([\s\S]*?)\}/g;
    let match;
    while ((match = blockRegex.exec(content)) !== null) {
        // We capture the full block including comments above it if any?
        // Actually regex mostly captures the block. We need to preserve comments like ///
        // A better way is to split by `model` or `enum` keywords but that's fragile.
        // Let's rely on the regex match index to find comments above.

        const type = match[1];
        const name = match[2];
        const body = match[3];
        const fullMatch = match[0];
        const index = match.index;

        // Look backwards for comments (///)
        let comments = '';
        const before = content.substring(0, index).trimEnd();
        const lines = before.split('\n');
        // Collect consecutive lines ending with `/// ...` right before the block
        // This is getting complicated.
        // Simplified approach: Regex for `///.*\nmodel ...`

        blocks.push({ type, name, body: fullMatch });
    }

    // Better parsing with comments preservation
    // We can just iterate the file line by line?
    // Or just use the regex and don't worry too much about doc comments unless necessary.
    // The previous validation script showed doc comments were inside the generator output.
    // Prisma `get-dmmf` removes comments, but raw file reading preserves them.
    // Let's grab the `///` comments if they exist immediately before the match.

    return blocks;
}

// Improved parsing to capture doc comments
function splitSchema() {
    console.log('Reading schema.prisma...');
    let content;
    try {
        content = fs.readFileSync(prismaSchemaPath, 'utf8');
        console.log(`Read ${content.length} bytes from schema.prisma`);
    } catch (e) {
        console.error('Error reading file:', e);
        return;
    }

    // Helper to extract blocks with comments
    const blocks = [];
    const lines = content.split('\n');
    let currentBlock = [];
    let inBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('model ') || line.trim().startsWith('enum ')) {
            inBlock = true;
            // Check for previous comments
            let j = i - 1;
            const comments = [];
            while (j >= 0 && lines[j].trim().startsWith('///')) {
                comments.unshift(lines[j]);
                j--;
            }
            if (currentBlock.length > 0) {
                // Should not happen if well formatted
            }
            currentBlock = [...comments, line];
        } else if (inBlock) {
            currentBlock.push(line);
            if (line.trim() === '}') {
                inBlock = false;
                const blockStr = currentBlock.join('\n');
                // Extract name
                const match = blockStr.match(/(model|enum)\s+(\w+)\s+/);
                if (match) {
                    blocks.push({
                        type: match[1],
                        name: match[2],
                        content: blockStr
                    });
                }
                currentBlock = [];
            }
        }
    }

    const fileContents = {};
    // Initialize empty strings for known files
    Object.keys(groupings).forEach(f => fileContents[f] = "");

    blocks.forEach(block => {
        let fileName;
        if (block.type === 'model') {
            fileName = getFileForModel(block.name);
        } else if (block.type === 'enum') {
            fileName = getFileForEnum(block.name);
        }

        if (!fileName) {
            console.log(`Warning: Unmapped ${block.type} ${block.name}, putting in base.prisma`);
            fileName = 'base.prisma';
        }

        if (!fileContents[fileName]) fileContents[fileName] = "";
        fileContents[fileName] += block.content + "\n\n";
    });

    // Write files
    console.log('Writing split files...');
    for (const [fileName, content] of Object.entries(fileContents)) {
        if (!content.trim()) continue;

        const filePath = path.join(schemaDir, fileName);
        if (fileName === 'base.prisma') {
            // Add generator/datasource to ONLY base.prisma usually, or leave it if using schema folder?
            // With `prismaSchemaFolder`, we don't need to duplicate generator/datasource.
            // But we should verify. Since user is using `prismaSchemaFolder`,
            // we should have generator/datasource in ONE file, typically `schema.prisma` or `base.prisma`.
            // We'll put it in `base.prisma`.
            const header = `generator client {
  provider = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;
            fs.writeFileSync(filePath, header + content);
        } else {
            fs.writeFileSync(filePath, content);
        }
        console.log(`Updated ${fileName}`);
    }
}

splitSchema();
