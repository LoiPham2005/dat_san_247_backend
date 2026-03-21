export interface IApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
    path?: string;
    meta?: any; // Dùng cho phân trang hoặc metadata thêm
}

export type ApiResponse<T> = IApiResponse<T>;

export interface ApiErrorResponse {
    success: boolean;
    statusCode: number;
    message: string;
    error: string;
    errors?: ValidationError[];
    timestamp: string;
    path?: string;
    stack?: string;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface ResponseMeta {
    total: number;
    page: number;
    // lastPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    [key: string]: any;
}

/**
 * Kiểu phản hồi cho danh sách có phân trang
 * Data sẽ là mảng các record, và meta chứa thông tin phân trang
 */
export type PaginatedResponse<T> = IApiResponse<T[]>;
