import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing } from './entities/listing.entity';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  create(createListingDto: CreateListingDto, sellerId: string) {
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
    const listing = await this.listingsRepository.findOne({ where: { id }, relations: ['seller'] });
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      await this.listingsRepository.save(listing);
    }
    return listing;
  }

  update(id: string, updateListingDto: UpdateListingDto) {
    return this.listingsRepository.update(id, updateListingDto);
  }

  remove(id: string) {
    return this.listingsRepository.delete(id);
  }
}
