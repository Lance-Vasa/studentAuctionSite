import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const imageFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed'), false);
  }
  cb(null, true);
};

const imageStorageOptions = {
  storage: diskStorage({
    destination: './uploads/listings',
    filename: (_req: any, file: Express.Multer.File, callback: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
};

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('image', imageStorageOptions))
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
  @Post(':id/view')
  trackView(@Param('id') id: string, @Request() req: any) {
    return this.listingsService.trackUniqueView(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', imageStorageOptions))
  update(
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateListingDto.image_url = `/uploads/listings/${file.filename}`;
    }
    if (updateListingDto.price) {
      updateListingDto.price = parseFloat(updateListingDto.price.toString());
    }
    if (updateListingDto.expires_at) {
      updateListingDto.expires_at = new Date(updateListingDto.expires_at);
    }

    return this.listingsService.update(id, updateListingDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.listingsService.remove(id, req.user.userId);
  }
}
