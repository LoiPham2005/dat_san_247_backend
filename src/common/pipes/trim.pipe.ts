import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const { type } = metadata;

        // Only trim for body and query
        if (type !== 'body' && type !== 'query') {
            return value;
        }

        if (typeof value === 'object' && value !== null) {
            this.trimObject(value);
        } else if (typeof value === 'string') {
            return value.trim();
        }

        return value;
    }

    private trimObject(obj: any) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.trimObject(obj[key]);
            }
        });
    }
}
