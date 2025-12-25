import { ListingType, MarketType } from '../entities/listing.entity';

export class CreateListingDto {
  title: string;
  description: string;
  price: number;
  listing_type: ListingType;
  market_type: MarketType;
  expires_at?: Date;
  image_url?: string;
}
