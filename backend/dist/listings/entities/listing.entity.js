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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = exports.MarketType = exports.ListingType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var ListingType;
(function (ListingType) {
    ListingType["FIXED"] = "fixed";
    ListingType["AUCTION"] = "auction";
})(ListingType || (exports.ListingType = ListingType = {}));
var MarketType;
(function (MarketType) {
    MarketType["UNIVERSITY"] = "university";
    MarketType["GENERAL"] = "general";
})(MarketType || (exports.MarketType = MarketType = {}));
let Listing = class Listing {
    id;
    seller_id;
    seller;
    title;
    description;
    price;
    listing_type;
    market_type;
    image_url;
    views;
    created_at;
    expires_at;
    is_sold;
};
exports.Listing = Listing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Listing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Listing.prototype, "seller_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'seller_id' }),
    __metadata("design:type", user_entity_1.User)
], Listing.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Listing.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Listing.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ListingType,
    }),
    __metadata("design:type", String)
], Listing.prototype, "listing_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MarketType,
    }),
    __metadata("design:type", String)
], Listing.prototype, "market_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Listing.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Listing.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "is_sold", void 0);
exports.Listing = Listing = __decorate([
    (0, typeorm_1.Entity)('listings')
], Listing);
//# sourceMappingURL=listing.entity.js.map