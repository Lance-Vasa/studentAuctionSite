import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    create(createListingDto: CreateListingDto, req: any, file: Express.Multer.File): Promise<import("./entities/listing.entity").Listing>;
    findAll(query: any): Promise<import("./entities/listing.entity").Listing[]>;
    findOne(id: string): Promise<import("./entities/listing.entity").Listing | null>;
    update(id: string, updateListingDto: UpdateListingDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
