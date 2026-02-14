import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Invoice } from './invoice.entity';

export enum InvoiceItemType {
    BOOKING = 'BOOKING',
    PRODUCT = 'PRODUCT',
    SERVICE = 'SERVICE',
    ADDON = 'ADDON',
    MEMBERSHIP = 'MEMBERSHIP',
    VOUCHER = 'VOUCHER',
    OTHER = 'OTHER',
}

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
    @Column({ name: 'invoice_id', type: 'uuid' })
    @Index()
    invoiceId: string;

    @Column({
        name: 'item_type',
        type: 'enum',
        enum: InvoiceItemType,
    })
    itemType: InvoiceItemType;

    @Column({ name: 'reference_id', type: 'uuid' })
    @Index()
    referenceId: string;

    @Column()
    name: string;

    @Column({ default: 1 })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    subtotal: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
    totalAmount: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoice_id' })
    invoice: Relation<Invoice>;
}
