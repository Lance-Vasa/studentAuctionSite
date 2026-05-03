import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Listing } from '../listings/entities/listing.entity';
import { Bid } from '../bids/entities/bid.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Message } from '../messages/entities/message.entity';
import { ListingView } from '../listings/entities/listing-view.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(ListingView)
    private listingViewsRepository: Repository<ListingView>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password_hash,
    });
    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getProfile(userId: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [activeListings, soldListings] = await Promise.all([
      this.listingsRepository.count({
        where: {
          seller_id: userId,
          is_sold: false,
        },
      }),
      this.listingsRepository.count({
        where: {
          seller_id: userId,
          is_sold: true,
        },
      }),
    ]);

    return {
      id: user.id,
      email: user.email,
      rating: user.rating,
      created_at: user.created_at,
      activeListings,
      soldListings,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.trim().length < 6) {
      throw new BadRequestException('New password must be at least 6 characters.');
    }

    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt();
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully.' };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect.');
    }

    const sellerListings = await this.listingsRepository.find({
      where: { seller_id: userId },
      select: ['id'],
    });
    const sellerListingIds = sellerListings.map((listing) => listing.id);

    await this.bidsRepository.delete({ bidder_id: userId });
    if (sellerListingIds.length > 0) {
      await this.bidsRepository.delete({ listing_id: In(sellerListingIds) });
      await this.cartItemsRepository.delete({ listing_id: In(sellerListingIds) });
      await this.listingViewsRepository.delete({ listing_id: In(sellerListingIds) });
    }

    await this.listingViewsRepository.delete({ user_id: userId });
    await this.cartItemsRepository.delete({ user_id: userId });
    await this.messagesRepository.delete({ sender_id: userId });
    await this.messagesRepository.delete({ receiver_id: userId });

    if (sellerListingIds.length > 0) {
      await this.listingsRepository.delete({ id: In(sellerListingIds) });
    }

    await this.usersRepository.delete({ id: userId });
    return { message: 'Account deleted successfully.' };
  }
}
