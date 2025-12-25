import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    addToCart(req: any, listingId: string): Promise<import("./entities/cart-item.entity").CartItem>;
    getCart(req: any): Promise<import("./entities/cart-item.entity").CartItem[]>;
    removeFromCart(req: any, id: string): Promise<import("typeorm").DeleteResult>;
}
