import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('listing_views')
@Unique('UQ_listing_user_view', ['listing_id', 'user_id'])
export class ListingView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  listing_id: string;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;
}
