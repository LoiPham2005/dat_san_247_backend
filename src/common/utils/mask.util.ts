
/**
 * Recursively checks and masks sensitive keys in an object.
 * Useful for logging.
 */
export function maskSensitiveData(data: any, keysToMask: string[] = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'otp']): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => maskSensitiveData(item, keysToMask));
    }

    const maskedData = { ...data }; // Shallow copy

    for (const key of Object.keys(maskedData)) {
        if (keysToMask.some(mask => key.toLowerCase().includes(mask.toLowerCase()))) {
            maskedData[key] = '***';
        } else if (typeof maskedData[key] === 'object') {
            maskedData[key] = maskSensitiveData(maskedData[key], keysToMask);
        }
    }

    return maskedData;
}
