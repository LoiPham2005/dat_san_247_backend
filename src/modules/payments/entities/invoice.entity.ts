import { Entity, Column, ManyToOne, JoinColumn, Index, OneToOne, Relation, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Transaction } from './transaction.entity';
import { User } from '../../users/entities/user.entity';
import { InvoiceStatus } from '../../../common/constants/payment-status.constant';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
    @Column({ name: 'invoice_number', unique: true })
    @Index()
    invoiceNumber: string;

    @Column({ name: 'booking_id', type: 'uuid', nullable: true })
    @Index()
    bookingId: string;

    @Column({ name: 'transaction_id', type: 'uuid' })
    @Index()
    transactionId: string;

    @Column({ name: 'customer_id', type: 'uuid' })
    @Index()
    customerId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    taxAmount: number;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.ISSUED
    })
    @Index()
    status: InvoiceStatus;

    @Column({ name: 'issued_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    issuedAt: Date;

    @Column({ name: 'pdf_url', type: 'text', nullable: true })
    pdfUrl: string;

    @OneToMany(() => InvoiceItem, (item) => item.invoice)
    items: Relation<InvoiceItem>[];

    @OneToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Relation<Booking>;

    @OneToOne(() => Transaction)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Relation<Transaction>;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customer_id' })
    customer: Relation<User>;
}
