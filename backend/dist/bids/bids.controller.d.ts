import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
export declare class BidsController {
    private readonly bidsService;
    constructor(bidsService: BidsService);
    create(createBidDto: CreateBidDto, req: any): Promise<import("./entities/bid.entity").Bid>;
    findAllByListing(listingId: string): Promise<import("./entities/bid.entity").Bid[]>;
}
