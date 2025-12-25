import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/listings',
      filename: (req: any, file: any, callback: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  create(@Body() createListingDto: CreateListingDto, @Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      createListingDto.image_url = `/uploads/listings/${file.filename}`;
    }
    // Convert price to number since FormData sends it as string
    if (createListingDto.price) {
      createListingDto.price = parseFloat(createListingDto.price.toString());
    }
    if (createListingDto.expires_at) {
      createListingDto.expires_at = new Date(createListingDto.expires_at);
    }
    return this.listingsService.create(createListingDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.listingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListingDto: UpdateListingDto) {
    return this.listingsService.update(id, updateListingDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }
}
