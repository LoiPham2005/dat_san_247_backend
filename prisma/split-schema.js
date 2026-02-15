const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
const outputDir = path.join(__dirname, 'schema');

// Read the original schema
const content = fs.readFileSync(schemaPath, 'utf-8');
const lines = content.split(/\r?\n/);

// Parse all blocks (models and enums) with their exact content
const blocks = [];
let i = 0;
while (i < lines.length) {
    const line = lines[i];

    // Check for model or enum
    const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
    const enumMatch = line.match(/^enum\s+(\w+)\s*\{/);

    if (modelMatch || enumMatch) {
        const type = modelMatch ? 'model' : 'enum';
        const name = modelMatch ? modelMatch[1] : enumMatch[1];

        // Collect preceding comments (lines starting with ///)
        let blockLines = [];
        let j = i - 1;
        while (j >= 0 && lines[j].trim().startsWith('///')) {
            blockLines.unshift(lines[j]);
            j--;
        }

        // Find closing brace
        let braceCount = 0;
        let startI = i;
        while (i < lines.length) {
            blockLines.push(lines[i]);
            if (lines[i].includes('{')) braceCount++;
            if (lines[i].includes('}')) braceCount--;
            if (braceCount === 0) break;
            i++;
        }

        blocks.push({ type, name, content: blockLines.join('\n') });
    }
    i++;
}

// Domain assignment rules
function getDomain(type, name) {
    // AI models
    if (name.startsWith('ai_') || name === 'user_preferences_ai') return 'ai';

    // Booking models
    if (['bookings', 'booking_addons', 'booking_status_history', 'booking_waitlist', 'recurring_bookings'].includes(name) ||
        name.startsWith('bookings_') || name.startsWith('booking_') || name.startsWith('recurring_bookings_')) return 'booking';

    // Chat models
    if (name.startsWith('chat_')) return 'chat';

    // Content models
    if (['contents', 'banners', 'blog_posts', 'email_templates', 'faqs', 'policies', 'promotion_contents'].includes(name) ||
        name.startsWith('contents_') || name.startsWith('blog_posts_') || name.startsWith('email_templates_') ||
        name.startsWith('faqs_') || name.startsWith('policies_')) return 'content';

    // Court models
    if (['courts', 'court_images', 'court_maintenance', 'pricing_rules', 'time_slots'].includes(name) ||
        name.startsWith('courts_') || name.startsWith('pricing_rules_') || name.startsWith('time_slots_')) return 'court';

    // Payment models (core)
    if (['payments', 'payout_requests', 'transactions', 'transaction_disputes', 'wallets', 'invoices', 'invoice_items'].includes(name) ||
        name.startsWith('payments_') || name.startsWith('payout_requests_') || name.startsWith('transactions_') ||
        name.startsWith('transaction_disputes_') || name.startsWith('invoices_') || name.startsWith('invoice_items_') ||
        name.startsWith('wallets_')) return 'payment';

    // Promotion models
    if (['promotions', 'promotion_courts', 'promotion_usage', 'promotion_venues', 'point_transactions',
        'user_vouchers', 'subscription_plans', 'user_subscriptions'].includes(name) ||
        name.startsWith('promotions_') || name.startsWith('point_transactions_') || name.startsWith('user_vouchers_') ||
        name.startsWith('user_subscriptions_')) return 'promotion';

    // Social models
    if (['posts', 'post_comments', 'social_likes', 'social_media', 'friendships', 'user_followers', 'user_blocks',
        'teams', 'team_members', 'team_invitations', 'team_join_requests',
        'match_findings', 'match_participants', 'match_results',
        'tournaments', 'tournament_brackets', 'tournament_matches', 'tournament_participants'].includes(name) ||
        name.startsWith('posts_') || name.startsWith('social_likes_') || name.startsWith('friendships_') ||
        name.startsWith('team_members_') || name.startsWith('teams_') || name.startsWith('match_findings_') ||
        name.startsWith('match_participants_') || name.startsWith('tournament') || name.startsWith('tournaments_')) return 'social';

    // Venue models
    if (['venues', 'venue_blacklist', 'venue_images', 'venue_memberships', 'venue_operating_hours',
        'venue_revenue_snapshots', 'venue_schedule_exceptions', 'venue_services', 'venue_staff',
        'venue_verifications', 'staff_shifts', 'favorite_venues', 'reviews', 'review_images',
        'organizations', 'refund_policies', 'refund_rules'].includes(name) ||
        name.startsWith('venues_') || name.startsWith('venue_') || name.startsWith('staff_shifts_')) return 'venue';

    // User models
    if (['users', 'user_profiles', 'user_achievements', 'user_behaviors', 'user_devices', 'user_points',
        'membership_tiers', 'refresh_tokens', 'notification_settings', 'notifications',
        'activity_logs', 'audit_logs', 'files', 'roles', 'permissions', 'role_permissions'].includes(name) ||
        name.startsWith('users_') || name.startsWith('user_behaviors_') || name.startsWith('files_') ||
        name.startsWith('notifications_') || name.startsWith('activity_logs_')) return 'user';

    // System models
    if (['settings', 'support_tickets', 'reports', 'system_announcements', 'system_announcement_reads'].includes(name) ||
        name.startsWith('settings_') || name.startsWith('support_tickets_') || name.startsWith('reports_')) return 'system';

    return 'unknown';
}

// Group blocks by domain
const domains = {};
const unknowns = [];

for (const block of blocks) {
    const domain = getDomain(block.type, block.name);
    if (domain === 'unknown') {
        unknowns.push(block.name);
    }
    if (!domains[domain]) domains[domain] = { models: [], enums: [] };
    if (block.type === 'model') {
        domains[domain].models.push(block);
    } else {
        domains[domain].enums.push(block);
    }
}

// Report unknowns
if (unknowns.length > 0) {
    console.log('WARNING: Unknown domain for:', unknowns.join(', '));
}

// Create _base.prisma
const baseContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, '_base.prisma'), baseContent);
console.log('Created _base.prisma');

// Write each domain file
for (const [domain, data] of Object.entries(domains)) {
    if (domain === 'unknown') continue;

    const parts = [];
    parts.push(`// ============================================================`);
    parts.push(`// ${domain.charAt(0).toUpperCase() + domain.slice(1)} Module`);
    parts.push(`// ============================================================`);
    parts.push('');

    // Models first
    for (const model of data.models) {
        parts.push(model.content);
        parts.push('');
    }

    // Then enums
    if (data.enums.length > 0) {
        parts.push(`// ============================================================`);
        parts.push(`// ${domain.charAt(0).toUpperCase() + domain.slice(1)} Enums`);
        parts.push(`// ============================================================`);
        parts.push('');
        for (const en of data.enums) {
            parts.push(en.content);
            parts.push('');
        }
    }

    const filePath = path.join(outputDir, `${domain}.prisma`);
    fs.writeFileSync(filePath, parts.join('\n'));
    console.log(`Created ${domain}.prisma (${data.models.length} models, ${data.enums.length} enums)`);
}

// Summary
console.log('\n--- Summary ---');
let totalModels = 0;
let totalEnums = 0;
for (const [domain, data] of Object.entries(domains)) {
    console.log(`${domain}: ${data.models.length} models, ${data.enums.length} enums`);
    totalModels += data.models.length;
    totalEnums += data.enums.length;
}
console.log(`Total: ${totalModels} models, ${totalEnums} enums`);
console.log(`Original blocks parsed: ${blocks.length}`);
