import { Repository } from 'typeorm';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Listing } from './entities/listing.entity';
export declare class ListingsService {
    private listingsRepository;
    constructor(listingsRepository: Repository<Listing>);
    create(createListingDto: CreateListingDto, sellerId: string): Promise<Listing>;
    findAll(query: any): Promise<Listing[]>;
    findOne(id: string): Promise<Listing | null>;
    update(id: string, updateListingDto: UpdateListingDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
