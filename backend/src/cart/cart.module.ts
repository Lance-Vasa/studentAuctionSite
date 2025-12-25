import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from './entities/cart-item.entity';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    ListingsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
