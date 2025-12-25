import { Repository, DataSource } from 'typeorm';
import { Listing } from './entities/listing.entity';
export declare class AuctionSchedulerService {
    private listingsRepository;
    private dataSource;
    private readonly logger;
    constructor(listingsRepository: Repository<Listing>, dataSource: DataSource);
    handleCron(): Promise<void>;
    private closeAuction;
}
