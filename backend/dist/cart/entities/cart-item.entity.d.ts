import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';
export declare class CartItem {
    id: string;
    user_id: string;
    user: User;
    listing_id: string;
    listing: Listing;
}
