import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Request() req: any, @Body('listingId') listingId: string) {
    return this.cartService.addToCart(req.user.userId, listingId);
  }

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Delete(':id')
  removeFromCart(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.userId, id);
  }
}
