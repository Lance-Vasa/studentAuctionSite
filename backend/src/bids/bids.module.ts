import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Bid } from './entities/bid.entity';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    ListingsModule,
  ],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
