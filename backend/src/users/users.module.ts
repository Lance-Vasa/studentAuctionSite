import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Bid } from '../bids/entities/bid.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Message } from '../messages/entities/message.entity';
import { ListingView } from '../listings/entities/listing-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, Bid, CartItem, Message, ListingView])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
