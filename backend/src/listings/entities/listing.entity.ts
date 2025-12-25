import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ListingType {
  FIXED = 'fixed',
  AUCTION = 'auction',
}

export enum MarketType {
  UNIVERSITY = 'university',
  GENERAL = 'general',
}

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seller_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column({
    type: 'enum',
    enum: ListingType,
  })
  listing_type: ListingType;

  @Column({
    type: 'enum',
    enum: MarketType,
  })
  market_type: MarketType;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ default: false })
  is_sold: boolean;
}
