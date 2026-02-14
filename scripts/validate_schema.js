const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schemaDir = path.join(__dirname, '../prisma/schema');

function parseSchema(content, sourceName) {
    const models = {}; // ModelName -> { fields: { FieldName: FieldDef }, source: sourceName }
    const enums = {};

    // Simple regex to extract blocks
    const blockRegex = /(model|enum)\s+(\w+)\s+\{([\s\S]*?)\}/g;
    let match;

    while ((match = blockRegex.exec(content)) !== null) {
        const type = match[1];
        const name = match[2];
        const body = match[3];

        if (type === 'model') {
            const fields = {};
            const lines = body.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                // Skip comments, empty lines, and block attributes (@@)
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) return;

                // Parse field: name type modifiers attributes
                // This is tricky with regex, simpler split by space
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2) {
                    const fieldName = parts[0];
                    const fieldType = parts[1];
                    // Reconstruct the rest as attributes/modifiers, normalizing spaces
                    const rest = parts.slice(2).join(' ');
                    fields[fieldName] = {
                        type: fieldType,
                        attributes: rest
                    };
                }
            });
            models[name] = { fields, source: sourceName };
        } else if (type === 'enum') {
            const values = [];
            const lines = body.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) return;
                values.push(trimmed);
            });
            enums[name] = { values, source: sourceName };
        }
    }
    return { models, enums };
}

function compareSchemas() {
    console.log('Reading main schema...');
    let mainSchemaContent = '';
    try {
        mainSchemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    } catch (e) {
        console.error('Error reading prisma/schema.prisma:', e.message);
        return;
    }

    const mainParsed = parseSchema(mainSchemaContent, 'schema.prisma');

    console.log('Reading split schemas...');
    const splitParsed = { models: {}, enums: {} };

    try {
        const files = fs.readdirSync(schemaDir);
        files.forEach(file => {
            if (!file.endsWith('.prisma')) return;
            const content = fs.readFileSync(path.join(schemaDir, file), 'utf8');
            const parsed = parseSchema(content, file);

            // Merge into splitParsed
            Object.assign(splitParsed.models, parsed.models);
            Object.assign(splitParsed.enums, parsed.enums);
        });
    } catch (e) {
        console.error('Error reading schema directory:', e.message);
        return;
    }

    // Compare Models
    console.log('\n--- Model Comparison ---');
    const mainModels = Object.keys(mainParsed.models);
    const splitModels = Object.keys(splitParsed.models);

    const missingInSplit = mainModels.filter(m => !splitModels.includes(m));
    if (missingInSplit.length > 0) {
        console.log('Missing models in split schema:', missingInSplit);
    } else {
        console.log('All models from main schema found in split schema.');
    }

    const extraInSplit = splitModels.filter(m => !mainModels.includes(m));
    if (extraInSplit.length > 0) {
        console.log('Extra models in split schema (not in main):', extraInSplit);
    }

    // Compare Fields within existing models
    console.log('\n--- Field Comparison ---');
    mainModels.forEach(modelName => {
        if (!splitParsed.models[modelName]) return;

        const mainFields = mainParsed.models[modelName].fields;
        const splitFields = splitParsed.models[modelName].fields;

        const mainFieldNames = Object.keys(mainFields);
        const splitFieldNames = Object.keys(splitFields);

        const missingFields = mainFieldNames.filter(f => !splitFieldNames.includes(f));
        if (missingFields.length > 0) {
            console.log(`Model ${modelName}: Missing fields in split schema:`, missingFields);
        }

        // Compare field definitions (basic)
        mainFieldNames.forEach(fieldName => {
            if (!splitFields[fieldName]) return;

            const mainF = mainFields[fieldName];
            const splitF = splitFields[fieldName];

            if (mainF.type !== splitF.type) {
                console.log(`Model ${modelName}, Field ${fieldName}: Type mismatch. Main: ${mainF.type}, Split: ${splitF.type}`);
            }

            // Normalize attributes for comparison (remove spaces, maybe sort?)
            // This is a rough check.
            const normMain = mainF.attributes.replace(/\s+/g, '');
            const normSplit = splitF.attributes.replace(/\s+/g, '');

            if (normMain !== normSplit) {
                // Ignore specific innocuous differences if needed, or just report
                // Map names to ignore: PK_, UQ_, FK_ constraints often have random IDs generated by Prisma if not explicitly set?
                // Wait, re-generation of IDs happens.
                // Check if map names differ.
                // If schema.prisma has @map("PK_...") and split has different ID, it might be an issue if we want EXACT match.
                // But usually we just care about logic.
                // I will report it.
                if (!fieldName.includes('relation') && !fieldName.includes('[]')) {
                    // reduce noise for relations which can precise details
                    console.log(`Model ${modelName}, Field ${fieldName}: Attribute mismatch.\n  Main : ${mainF.attributes}\n  Split: ${splitF.attributes}`);
                }
            }
        });
    });

}

compareSchemas();
