import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { ListingsService } from '../listings/listings.service';
export declare class CartService {
    private cartRepository;
    private listingsService;
    constructor(cartRepository: Repository<CartItem>, listingsService: ListingsService);
    addToCart(userId: string, listingId: string): Promise<CartItem>;
    getCart(userId: string): Promise<CartItem[]>;
    removeFromCart(userId: string, id: string): Promise<import("typeorm").DeleteResult>;
}
