/**
 * Cấu trúc response chuẩn cho toàn bộ API
 */
export interface ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: ResponseMeta;
    timestamp: string;
    path?: string; // Optional vì sẽ được set bởi interceptor
}

export interface ResponseMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: ResponseMeta;
}

/**
 * Cấu trúc error response chuẩn
 */
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error: string;
    errors?: ValidationError[];
    timestamp: string;
    path?: string;
    stack?: string; // Only in development
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
    constraints?: string[];
}
