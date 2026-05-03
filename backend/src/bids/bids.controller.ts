import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createBidDto: CreateBidDto, @Request() req: any) {
    return this.bidsService.create(createBidDto, req.user.userId);
  }

  @Get('listing/:listingId')
  findAllByListing(@Param('listingId') listingId: string) {
    return this.bidsService.findAllByListing(listingId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-bids')
  findMyBids(@Request() req: any) {
    return this.bidsService.findByUser(req.user.userId);
  }
}
