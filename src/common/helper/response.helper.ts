export const success = (data?: any, message: string = 'Success') => ({
    success: true,
    message: message,
    data: data ?? null
});

export const fail = (message: string, errorCode?: string) => ({
    success: false,
    message: message,
    errorCode: errorCode ?? null
});
