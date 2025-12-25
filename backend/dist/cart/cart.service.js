"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_item_entity_1 = require("./entities/cart-item.entity");
const listings_service_1 = require("../listings/listings.service");
let CartService = class CartService {
    cartRepository;
    listingsService;
    constructor(cartRepository, listingsService) {
        this.cartRepository = cartRepository;
        this.listingsService = listingsService;
    }
    async addToCart(userId, listingId) {
        const listing = await this.listingsService.findOne(listingId);
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.seller_id === userId) {
            throw new common_1.BadRequestException('You cannot add your own listing to the cart');
        }
        const existing = await this.cartRepository.findOne({
            where: { user_id: userId, listing_id: listingId }
        });
        if (existing)
            return existing;
        const item = this.cartRepository.create({
            user_id: userId,
            listing_id: listingId,
        });
        return this.cartRepository.save(item);
    }
    async getCart(userId) {
        return this.cartRepository.find({
            where: { user_id: userId },
            relations: ['listing'],
        });
    }
    async removeFromCart(userId, id) {
        return this.cartRepository.delete({ id, user_id: userId });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        listings_service_1.ListingsService])
], CartService);
//# sourceMappingURL=cart.service.js.map