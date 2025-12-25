import { User } from '../../users/entities/user.entity';
export declare enum ListingType {
    FIXED = "fixed",
    AUCTION = "auction"
}
export declare enum MarketType {
    UNIVERSITY = "university",
    GENERAL = "general"
}
export declare class Listing {
    id: string;
    seller_id: string;
    seller: User;
    title: string;
    description: string;
    price: number;
    listing_type: ListingType;
    market_type: MarketType;
    image_url: string;
    views: number;
    created_at: Date;
    expires_at: Date;
    is_sold: boolean;
}
