import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private listingsService: ListingsService,
  ) {}

  async addToCart(userId: string, listingId: string) {
    const listing = await this.listingsService.findOne(listingId);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.seller_id === userId) {
      throw new BadRequestException('You cannot add your own listing to the cart');
    }

    const existing = await this.cartRepository.findOne({
      where: { user_id: userId, listing_id: listingId }
    });
    if (existing) return existing;

    const item = this.cartRepository.create({
      user_id: userId,
      listing_id: listingId,
    });
    return this.cartRepository.save(item);
  }

  async getCart(userId: string) {
    return this.cartRepository.find({
      where: { user_id: userId },
      relations: ['listing'],
    });
  }

  async removeFromCart(userId: string, id: string) {
    return this.cartRepository.delete({ id, user_id: userId });
  }
}
