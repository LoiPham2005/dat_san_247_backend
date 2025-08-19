import { User } from 'src/modules/auth/entities/user.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { CourtType } from 'src/modules/common/enums/CourtType.enums';
import { FieldAvailability } from 'src/modules/field-availability/entities/field-availability.entity';
import { FieldImage } from 'src/modules/field-images/entities/field-image.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('sports_fields')
export class SportsField {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => User, user => user.sportsFields, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: CourtType })
    type: CourtType;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    longitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price_per_hour: number;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => FieldImage, image => image.field)
    images: FieldImage[];

    @OneToMany(() => Booking, booking => booking.field)
    bookings: Booking[];

    @OneToMany(() => Review, review => review.field)
    reviews: Review[];

    @OneToMany(() => FieldAvailability, availability => availability.field)
    availabilities: FieldAvailability[];

}
