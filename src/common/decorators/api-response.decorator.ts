import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse as SwaggerApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Base response schema properties
 */
const baseResponseProperties = {
    success: { type: 'boolean' },
    statusCode: { type: 'number' },
    message: { type: 'string' },
    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
    path: { type: 'string', example: '/api/v1/resource' },
};

/**
 * Swagger decorator cho success response
 */
export const ApiSuccessResponse = <TModel extends Type<any>>(
    model?: TModel,
    isArray: boolean = false,
    options?: {
        description?: string;
        statusCode?: number;
    },
) => {
    const { description = 'Success', statusCode = 200 } = options || {};

    let schema: SchemaObject;

    if (model) {
        if (isArray) {
            schema = {
                type: 'object',
                properties: {
                    ...baseResponseProperties,
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: statusCode },
                    message: { type: 'string', example: 'Operation successful' },
                    data: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                    },
                },
            };
        } else {
            schema = {
                type: 'object',
                properties: {
                    ...baseResponseProperties,
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: statusCode },
                    message: { type: 'string', example: 'Operation successful' },
                    data: { $ref: getSchemaPath(model) },
                },
            };
        }
    } else {
        schema = {
            type: 'object',
            properties: {
                ...baseResponseProperties,
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: statusCode },
                message: { type: 'string', example: 'Operation successful' },
                data: { type: 'null', nullable: true },
            },
        };
    }

    return applyDecorators(
        ...(model ? [ApiExtraModels(model)] : []),
        SwaggerApiResponse({
            status: statusCode,
            description,
            schema,
        }),
    );
};

/**
 * Swagger decorator cho paginated response
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
    model: TModel,
    options?: {
        description?: string;
    },
) => {
    const { description = 'Success with pagination' } = options || {};

    return applyDecorators(
        ApiExtraModels(model),
        SwaggerApiResponse({
            status: 200,
            description,
            schema: {
                type: 'object',
                properties: {
                    ...baseResponseProperties,
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Data retrieved successfully' },
                    data: {
                        type: 'object',
                        properties: {
                            items: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                            meta: {
                                type: 'object',
                                properties: {
                                    page: { type: 'number', example: 1 },
                                    limit: { type: 'number', example: 10 },
                                    total: { type: 'number', example: 100 },
                                    totalPages: { type: 'number', example: 10 },
                                    hasNextPage: { type: 'boolean', example: true },
                                    hasPreviousPage: { type: 'boolean', example: false },
                                },
                                required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
                            },
                        },
                        required: ['items', 'meta'],
                    },
                },
            },
        }),
    );
};

/**
 * Error response schema helper
 */
const createErrorSchema = (statusCode: number, message: string, error: string) => ({
    type: 'object',
    properties: {
        ...baseResponseProperties,
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: statusCode },
        message: { type: 'string', example: message },
        error: { type: 'string', example: error },
        errors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'email must be an email' },
                    value: { type: 'any', example: 'invalid-email' },
                    constraints: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['isEmail'],
                    },
                },
            },
        },
    },
});

/**
 * Swagger decorator cho error responses
 */
export const ApiErrorResponses = () => {
    return applyDecorators(
        SwaggerApiResponse({
            status: 400,
            description: 'Bad Request',
            schema: createErrorSchema(400, 'Bad request', 'Bad Request'),
        }),
        SwaggerApiResponse({
            status: 401,
            description: 'Unauthorized',
            schema: createErrorSchema(401, 'Unauthorized', 'Unauthorized'),
        }),
        SwaggerApiResponse({
            status: 403,
            description: 'Forbidden',
            schema: createErrorSchema(403, 'Forbidden resource', 'Forbidden'),
        }),
        SwaggerApiResponse({
            status: 404,
            description: 'Not Found',
            schema: createErrorSchema(404, 'Resource not found', 'Not Found'),
        }),
        SwaggerApiResponse({
            status: 409,
            description: 'Conflict',
            schema: createErrorSchema(409, 'Resource already exists', 'Conflict'),
        }),
        SwaggerApiResponse({
            status: 422,
            description: 'Validation Error',
            schema: createErrorSchema(422, 'Validation failed', 'Validation Error'),
        }),
        SwaggerApiResponse({
            status: 500,
            description: 'Internal Server Error',
            schema: createErrorSchema(500, 'Internal server error', 'Internal Server Error'),
        }),
    );
};

/**
 * Decorator cho specific error response
 */
export const ApiErrorResponse = (statusCode: number, description: string) => {
    const errorMessages = {
        400: { message: 'Bad request', error: 'Bad Request' },
        401: { message: 'Unauthorized', error: 'Unauthorized' },
        403: { message: 'Forbidden resource', error: 'Forbidden' },
        404: { message: 'Resource not found', error: 'Not Found' },
        409: { message: 'Resource already exists', error: 'Conflict' },
        422: { message: 'Validation failed', error: 'Validation Error' },
        500: { message: 'Internal server error', error: 'Internal Server Error' },
    };

    const { message, error } = errorMessages[statusCode] || errorMessages[500];

    return SwaggerApiResponse({
        status: statusCode,
        description,
        schema: createErrorSchema(statusCode, message, error),
    });
};
