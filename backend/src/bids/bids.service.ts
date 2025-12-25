import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateBidDto } from './dto/create-bid.dto';
import { Bid } from './entities/bid.entity';
import { Listing, ListingType } from '../listings/entities/listing.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    private dataSource: DataSource,
  ) {}

  async create(createBidDto: CreateBidDto, bidderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const listing = await queryRunner.manager.findOne(Listing, {
        where: { id: createBidDto.listing_id },
        lock: { mode: 'pessimistic_write' }, // Lock listing to prevent race conditions
      });

      if (!listing) {
        throw new NotFoundException('Listing not found');
      }

      if (listing.listing_type !== ListingType.AUCTION) {
        throw new BadRequestException('Cannot bid on fixed-price listings');
      }

      if (listing.seller_id === bidderId) {
        throw new BadRequestException('Seller cannot bid on their own listing');
      }

      if (listing.is_sold || (listing.expires_at && new Date() > listing.expires_at)) {
        throw new BadRequestException('Auction has ended');
      }

      // Find current highest bid
      const highestBid = await queryRunner.manager.findOne(Bid, {
        where: { listing_id: listing.id },
        order: { amount: 'DESC' },
      });

      const currentPrice = highestBid ? Number(highestBid.amount) : Number(listing.price);

      if (createBidDto.amount <= currentPrice) {
        throw new BadRequestException(`Bid must be higher than current price: ${currentPrice}`);
      }

      const bid = queryRunner.manager.create(Bid, {
        listing_id: listing.id,
        bidder_id: bidderId,
        amount: createBidDto.amount,
      });

      await queryRunner.manager.save(bid);
      await queryRunner.commitTransaction();

      return bid;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAllByListing(listingId: string) {
    return this.bidsRepository.find({
      where: { listing_id: listingId },
      order: { amount: 'DESC' },
      relations: ['bidder'],
    });
  }
}
