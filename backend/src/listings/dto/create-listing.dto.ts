import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType, MarketType } from '../entities/listing.entity';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(ListingType)
  listing_type: ListingType;

  @IsEnum(MarketType)
  market_type: MarketType;

  @IsOptional()
  expires_at?: Date;

  @IsOptional()
  @IsString()
  image_url?: string;
}
