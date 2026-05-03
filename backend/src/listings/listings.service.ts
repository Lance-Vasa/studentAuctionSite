import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing } from './entities/listing.entity';
import { ListingView } from './entities/listing-view.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(ListingView)
    private listingViewsRepository: Repository<ListingView>,
  ) {}

  private validateListingTextLengths(title?: string, description?: string) {
    if (title !== undefined && title.length > 100) {
      throw new BadRequestException('Title must be 100 characters or fewer.');
    }

    if (description !== undefined && description.length > 2000) {
      throw new BadRequestException('Description must be 2000 characters or fewer.');
    }
  }

  private canEditAuctionEndTime(createdAt: Date) {
    const fiveMinutesMs = 5 * 60 * 1000;
    return Date.now() - new Date(createdAt).getTime() <= fiveMinutesMs;
  }

  create(createListingDto: CreateListingDto, sellerId: string) {
    this.validateListingTextLengths(createListingDto.title, createListingDto.description);

    const listing = this.listingsRepository.create({
      ...createListingDto,
      seller_id: sellerId,
    });
    return this.listingsRepository.save(listing);
  }

  findAll(query: any) {
    const qb = this.listingsRepository.createQueryBuilder('listing');

    if (query.market_type) {
      qb.andWhere('listing.market_type = :market_type', { market_type: query.market_type });
    }

    if (query.listing_type) {
      qb.andWhere('listing.listing_type = :listing_type', { listing_type: query.listing_type });
    }

    if (query.search) {
      qb.andWhere('(listing.title ILIKE :search OR listing.description ILIKE :search)', { search: `%${query.search}%` });
    }

    if (query.seller_id) {
      qb.andWhere('listing.seller_id = :seller_id', { seller_id: query.seller_id });
    }

    if (query.include_sold !== 'true') {
      qb.andWhere('listing.is_sold = :is_sold', { is_sold: false });
    }

    if (query.min_price) {
      qb.andWhere('listing.price >= :min_price', { min_price: query.min_price });
    }

    if (query.max_price) {
      qb.andWhere('listing.price <= :max_price', { max_price: query.max_price });
    }

    if (query.days_ago) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(query.days_ago));
      qb.andWhere('listing.created_at >= :date', { date });
    }

    if (query.sort_by === 'popular') {
      qb.orderBy('listing.views', 'DESC');
    } else {
      qb.orderBy('listing.created_at', 'DESC');
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    return this.listingsRepository.findOne({ where: { id }, relations: ['seller'] });
  }

  async trackUniqueView(id: string, userId: string) {
    const listing = await this.listingsRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    const existingView = await this.listingViewsRepository.findOne({
      where: {
        listing_id: id,
        user_id: userId,
      },
    });

    if (existingView) {
      return { counted: false, views: listing.views };
    }

    const view = this.listingViewsRepository.create({
      listing_id: id,
      user_id: userId,
    });
    await this.listingViewsRepository.save(view);

    await this.listingsRepository.increment({ id }, 'views', 1);
    const updated = await this.listingsRepository.findOne({ where: { id } });

    return { counted: true, views: updated?.views ?? listing.views + 1 };
  }

  async update(id: string, updateListingDto: UpdateListingDto, userId: string) {
    this.validateListingTextLengths(updateListingDto.title, updateListingDto.description);

    const existingListing = await this.listingsRepository.findOne({ where: { id } });
    if (!existingListing) {
      throw new NotFoundException('Listing not found.');
    }

    if (existingListing.seller_id !== userId) {
      throw new ForbiddenException('You can only edit your own listings.');
    }

    if (updateListingDto.expires_at !== undefined) {
      if (existingListing.listing_type !== 'auction') {
        throw new BadRequestException('Only auction listings can update auction end time.');
      }

      if (!this.canEditAuctionEndTime(existingListing.created_at)) {
        throw new BadRequestException('Auction time can only be changed within 5 minutes of posting.');
      }
    }

    if (updateListingDto.image_url && existingListing.image_url) {
      try {
        const oldPath = join(process.cwd(), existingListing.image_url.replace(/^\//, ''));
        await unlink(oldPath);
      } catch {
        // Old file may not exist on disk; ignore.
      }
    }

    await this.listingsRepository.update(id, updateListingDto);
    return this.listingsRepository.findOne({ where: { id } });
  }

  async remove(id: string, userId: string) {
    const listing = await this.listingsRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }
    if (listing.seller_id !== userId) {
      throw new ForbiddenException('You can only delete your own listings.');
    }

    if (listing.image_url) {
      try {
        const filePath = join(process.cwd(), listing.image_url.replace(/^\//, ''));
        await unlink(filePath);
      } catch {
        // File may not exist; ignore.
      }
    }

    return this.listingsRepository.delete(id);
  }
}
