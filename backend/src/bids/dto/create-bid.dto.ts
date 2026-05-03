import { IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBidDto {
  @IsString()
  @IsUUID()
  listing_id: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;
}
