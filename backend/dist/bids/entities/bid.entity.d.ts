import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';
export declare class Bid {
    id: string;
    listing_id: string;
    listing: Listing;
    bidder_id: string;
    bidder: User;
    amount: number;
    created_at: Date;
}
