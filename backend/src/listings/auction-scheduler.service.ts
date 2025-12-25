import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { Listing, ListingType } from './entities/listing.entity';
import { Bid } from '../bids/entities/bid.entity';

@Injectable()
export class AuctionSchedulerService {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    private dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Checking for expired auctions...');

    const expiredListings = await this.listingsRepository.find({
      where: {
        listing_type: ListingType.AUCTION,
        is_sold: false,
        expires_at: LessThan(new Date()),
      },
    });

    for (const listing of expiredListings) {
      await this.closeAuction(listing);
    }
  }

  private async closeAuction(listing: Listing) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock listing
      const lockedListing = await queryRunner.manager.findOne(Listing, {
        where: { id: listing.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedListing || lockedListing.is_sold) {
        await queryRunner.commitTransaction();
        return;
      }

      // Find winning bid
      const winningBid = await queryRunner.manager.findOne(Bid, {
        where: { listing_id: listing.id },
        order: { amount: 'DESC' },
        relations: ['bidder'],
      });

      lockedListing.is_sold = true;
      await queryRunner.manager.save(lockedListing);

      if (winningBid) {
        this.logger.log(`Auction ${listing.id} closed. Winner: ${winningBid.bidder.email} with bid ${winningBid.amount}`);
        // TODO: Send email notification
      } else {
        this.logger.log(`Auction ${listing.id} closed with no bids.`);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(`Failed to close auction ${listing.id}`, err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
