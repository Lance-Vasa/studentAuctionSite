import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  listing_id: string;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column()
  bidder_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bidder_id' })
  bidder: User;

  @Column('decimal')
  amount: number;

  @CreateDateColumn()
  created_at: Date;
}
