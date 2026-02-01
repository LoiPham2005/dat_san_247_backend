import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { VenueService } from '../../venues/entities/venue-service.entity';

@Entity('booking_addons')
export class BookingAddon extends BaseEntity {
    @Column({ name: 'booking_id', type: 'uuid' })
    @Index()
    bookingId: string;

    @Column({ name: 'service_id', type: 'uuid' })
    @Index()
    serviceId: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, comment: 'Price at the time of booking' })
    pricePerUnit: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    totalPrice: number;

    @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => VenueService, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'service_id' })
    service: VenueService;
}
