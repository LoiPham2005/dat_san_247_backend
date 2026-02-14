const fs = require('fs');
const path = require('path');

const SCHEMA_FILE = path.join(__dirname, '../prisma/schema.prisma');
const OUTPUT_DIR = path.join(__dirname, '../prisma/schema');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const content = fs.readFileSync(SCHEMA_FILE, 'utf8');

const blocks = [];
// Match models, enums, generator, datasource
const blockRegex = /(?:^\/\/\/.*(?:\r?\n))?(?:model|enum|generator|datasource)\s+\w+\s+\{[^{}]*\}/gm;

let match;
const foundBlocks = [];
const regex = /(?:^(?:\/\/.*|(?:\/\*\*[\s\S]*?\*\/))\r?\n)*(?:model|enum|generator|datasource)\s+(\w+)\s+\{[^}]*\}/gm;

// Better block extractor that handles comments above blocks
function getBlocks(text) {
    const results = [];
    const blockStartRegex = /(?:^|\n)((?:\/\/.*\n|\/\*\*[\s\S]*?\*\/|\s)*)(model|enum|generator|datasource)\s+(\w+)\s+\{/g;

    let match;
    while ((match = blockStartRegex.exec(text)) !== null) {
        const startIdx = match.index + match[0].length - 1;
        let braceCount = 1;
        let endIdx = startIdx + 1;

        while (braceCount > 0 && endIdx < text.length) {
            if (text[endIdx] === '{') braceCount++;
            else if (text[endIdx] === '}') braceCount--;
            endIdx++;
        }

        const fullBlock = text.slice(match.index, endIdx).trim();
        results.push({
            type: match[2],
            name: match[3],
            content: fullBlock
        });
    }
    return results;
}

const allBlocks = getBlocks(content);
console.log(`Found ${allBlocks.length} blocks total.`);

const groupings = {
    'ai.prisma': [
        'ai_assistance', 'ai_cache', 'ai_conversations', 'ai_messages', 'ai_feedback',
        'ai_fraud_detections', 'ai_image_analysis', 'ai_interactions', 'ai_models',
        'ai_quotas', 'ai_recommendations', 'ai_review_analysis', 'ai_search_rankings',
        'ai_search_queries', 'ai_smart_notifications', 'user_preferences_ai'
    ],
    'auth.prisma': [
        'users', 'roles', 'permissions', 'role_permissions', 'refresh_tokens',
        'user_profiles', 'user_devices', 'user_points', 'user_achievements',
        'membership_tiers', 'user_subscriptions', 'subscription_plans',
        'users_gender_enum', 'users_kyc_status_enum', 'user_subscriptions_status_enum'
    ],
    'booking.prisma': [
        'bookings', 'booking_addons', 'booking_status_history', 'booking_waitlist',
        'recurring_bookings', 'refund_policies', 'refund_rules',
        'bookings_status_enum', 'booking_status_history_status_enum',
        'booking_waitlist_status_enum', 'recurring_bookings_repeattype_enum'
    ],
    'cms.prisma': [
        'contents', 'banners', 'blog_posts', 'faqs', 'policies', 'email_templates',
        'promotion_contents', 'system_announcements', 'system_announcement_reads',
        'contents_status_enum', 'contents_target_audience_enum',
        'blog_posts_category_enum', 'faqs_category_enum', 'policies_policytype_enum',
        'email_templates_templatetype_enum'
    ],
    'payment.prisma': [
        'payments', 'invoices', 'invoice_items', 'transactions', 'wallets',
        'payout_requests', 'transaction_disputes', 'point_transactions',
        'user_vouchers', 'promotions', 'promotion_usage', 'promotion_courts',
        'promotion_venues',
        'payments_payment_method_enum', 'payments_status_enum', 'invoices_status_enum',
        'invoice_items_type_enum', 'transactions_status_enum', 'transactions_type_enum',
        'wallets_owner_type_enum', 'payout_requests_status_enum',
        'transaction_disputes_status_enum', 'point_transactions_type_enum',
        'user_vouchers_status_enum', 'promotions_discount_type_enum', 'promotions_status_enum'
    ],
    'social.prisma': [
        'posts', 'post_comments', 'social_likes', 'social_media', 'friendships',
        'user_followers', 'user_blocks', 'teams', 'team_members', 'team_invitations',
        'team_join_requests', 'chat_conversations', 'chat_members', 'chat_messages',
        'chat_message_reactions', 'chat_message_receipts', 'chat_settings',
        'chat_templates', 'notifications', 'notification_settings', 'reviews',
        'review_images', 'reports', 'support_tickets',
        'posts_type_enum', 'posts_privacy_enum', 'social_likes_target_type_enum',
        'friendships_status_enum', 'teams_privacy_enum', 'team_members_role_enum',
        'team_members_status_enum', 'chat_conversations_type_enum', 'chat_members_role_enum',
        'chat_messages_type_enum', 'chat_message_receipts_status_enum',
        'chat_templates_category_enum', 'notifications_type_enum',
        'notifications_channel_enum', 'reports_target_type_enum',
        'reports_reason_enum', 'reports_status_enum', 'support_tickets_category_enum',
        'support_tickets_priority_enum', 'support_tickets_status_enum'
    ],
    'venue.prisma': [
        'venues', 'organizations', 'courts', 'court_images', 'court_maintenance',
        'venue_images', 'venue_operating_hours', 'venue_schedule_exceptions',
        'venue_services', 'venue_staff', 'staff_shifts', 'venue_verifications',
        'venue_blacklist', 'venue_memberships', 'venue_revenue_snapshots',
        'pricing_rules', 'time_slots', 'favorite_venues',
        'venues_status_enum', 'venue_staff_role_enum',
        'venue_operating_hours_dayofweek_enum', 'venue_verifications_status_enum',
        'time_slots_status_enum', 'venue_services_type_enum', 'pricing_rules_dayofweek_enum'
    ],
    'tournament.prisma': [
        'tournaments', 'tournament_participants', 'tournament_brackets', 'tournament_matches',
        'tournaments_status_enum', 'tournaments_type_enum',
        'tournament_participants_status_enum', 'tournament_matches_status_enum'
    ],
    'analytics.prisma': [
        'user_behaviors', 'activity_logs', 'audit_logs', 'user_behaviors_action_type_enum'
    ],
    'base.prisma': [
        'client', 'db', 'files', 'files_storage_type_enum'
    ]
};

// Also catch-all for enums and models not in groupings
const processed = new Set();
const filesContent = {};

// Initialize filesContent
Object.keys(groupings).forEach(file => {
    filesContent[file] = [];
});

// Distribute blocks
allBlocks.forEach(block => {
    let found = false;
    for (const [file, names] of Object.entries(groupings)) {
        if (names.includes(block.name)) {
            filesContent[file].push(block.content);
            processed.add(block.name);
            found = true;
            break;
        }
    }

    if (!found) {
        // Fallback for AI enums or other related enums
        if (block.name.startsWith('ai_')) {
            filesContent['ai.prisma'].push(block.content);
        } else if (block.name.startsWith('chat_')) {
            filesContent['social.prisma'].push(block.content);
        } else if (block.name.startsWith('venue_')) {
            filesContent['venue.prisma'].push(block.content);
        } else {
            // Default to base or create a generic catch if many
            filesContent['base.prisma'].push(block.content);
        }
        processed.add(block.name);
    }
});

// Write files
for (const [file, contents] of Object.entries(filesContent)) {
    const filePath = path.join(OUTPUT_DIR, file);
    if (contents.length > 0) {
        fs.writeFileSync(filePath, contents.join('\n\n') + '\n');
        console.log(`Wrote ${contents.length} blocks to ${file}`);
    } else {
        if (fs.existsSync(filePath)) {
            // If it exists but we have no content from master, we don't necessarily delete it 
            // but for this reconciliation we should probably clear it if we want it to match master.
            // Actually, let's keep it as is or write empty if it's supposed to be managed.
        }
    }
}

console.log('Reconciliation complete.');
