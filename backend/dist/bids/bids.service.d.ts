import { Repository, DataSource } from 'typeorm';
import { CreateBidDto } from './dto/create-bid.dto';
import { Bid } from './entities/bid.entity';
export declare class BidsService {
    private bidsRepository;
    private dataSource;
    constructor(bidsRepository: Repository<Bid>, dataSource: DataSource);
    create(createBidDto: CreateBidDto, bidderId: string): Promise<Bid>;
    findAllByListing(listingId: string): Promise<Bid[]>;
}
