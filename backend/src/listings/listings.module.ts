import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing } from './entities/listing.entity';
import { ListingView } from './entities/listing-view.entity';
import { AuctionSchedulerService } from './auction-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, ListingView])],
  controllers: [ListingsController],
  providers: [ListingsService, AuctionSchedulerService],
  exports: [ListingsService],
})
export class ListingsModule {}
