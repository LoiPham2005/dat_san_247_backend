import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse as SwaggerApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Swagger decorator cho success response
 */
export const ApiSuccessResponse = <TModel extends Type<any>>(
    model?: TModel,
    isArray: boolean = false,
) => {
    let schema: SchemaObject;

    if (model) {
        if (isArray) {
            schema = {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Operation successful' },
                    data: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                    },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            };
        } else {
            schema = {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Operation successful' },
                    data: { $ref: getSchemaPath(model) },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            };
        }
    } else {
        schema = {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Operation successful' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                path: { type: 'string', example: '/api/v1/resource' },
            },
        };
    }

    return applyDecorators(
        ...(model ? [ApiExtraModels(model)] : []),
        SwaggerApiResponse({
            status: 200,
            description: 'Success',
            schema,
        }),
    );
};

/**
 * Swagger decorator cho paginated response
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(model),
        SwaggerApiResponse({
            status: 200,
            description: 'Success with pagination',
            schema: {
                type: 'object',
                properties: {
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
                            },
                        },
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
                    },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            },
        }),
    );
};

/**
 * Swagger decorator cho error response
 */
export const ApiErrorResponses = () => {
    return applyDecorators(
        SwaggerApiResponse({
            status: 400,
            description: 'Bad Request',
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'number', example: 400 },
                    message: { type: 'string', example: 'Validation failed' },
                    error: { type: 'string', example: 'BadRequestException' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'email' },
                                message: { type: 'string', example: 'email must be an email' },
                                value: { type: 'any', example: 'invalid-email' },
                            },
                        },
                    },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            },
        }),
        SwaggerApiResponse({
            status: 401,
            description: 'Unauthorized',
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'number', example: 401 },
                    message: { type: 'string', example: 'Unauthorized' },
                    error: { type: 'string', example: 'UnauthorizedException' },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            },
        }),
        SwaggerApiResponse({
            status: 403,
            description: 'Forbidden',
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'number', example: 403 },
                    message: { type: 'string', example: 'Forbidden resource' },
                    error: { type: 'string', example: 'ForbiddenException' },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            },
        }),
        SwaggerApiResponse({
            status: 404,
            description: 'Not Found',
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'number', example: 404 },
                    message: { type: 'string', example: 'Resource not found' },
                    error: { type: 'string', example: 'NotFoundException' },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            },
        }),
        SwaggerApiResponse({
            status: 500,
            description: 'Internal Server Error',
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'number', example: 500 },
                    message: { type: 'string', example: 'Internal server error' },
                    error: { type: 'string', example: 'InternalServerErrorException' },
                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    path: { type: 'string', example: '/api/v1/resource' },
                },
            },
        }),
    );
};
