import { Venue } from 'src/modules/venues/entities/venue.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

export enum CategoryStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Entity('sport_categories')
export class SportCategory {
    @PrimaryGeneratedColumn({ name: 'category_id' })
    categoryId: number;

    @Column({ name: 'category_name', length: 100 })
    categoryName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'icon_url', length: 500, nullable: true })
    iconUrl: string;

    @Column({ type: 'enum', enum: CategoryStatus, default: CategoryStatus.ACTIVE })
    status: CategoryStatus;

    @Column({ name: 'display_order', type: 'int', default: 0 })
    displayOrder: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => Venue, (venue) => venue.category)
    venues: Venue[];

}
