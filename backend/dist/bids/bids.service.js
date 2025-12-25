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
exports.BidsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bid_entity_1 = require("./entities/bid.entity");
const listing_entity_1 = require("../listings/entities/listing.entity");
let BidsService = class BidsService {
    bidsRepository;
    dataSource;
    constructor(bidsRepository, dataSource) {
        this.bidsRepository = bidsRepository;
        this.dataSource = dataSource;
    }
    async create(createBidDto, bidderId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const listing = await queryRunner.manager.findOne(listing_entity_1.Listing, {
                where: { id: createBidDto.listing_id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!listing) {
                throw new common_1.NotFoundException('Listing not found');
            }
            if (listing.listing_type !== listing_entity_1.ListingType.AUCTION) {
                throw new common_1.BadRequestException('Cannot bid on fixed-price listings');
            }
            if (listing.seller_id === bidderId) {
                throw new common_1.BadRequestException('Seller cannot bid on their own listing');
            }
            if (listing.is_sold || (listing.expires_at && new Date() > listing.expires_at)) {
                throw new common_1.BadRequestException('Auction has ended');
            }
            const highestBid = await queryRunner.manager.findOne(bid_entity_1.Bid, {
                where: { listing_id: listing.id },
                order: { amount: 'DESC' },
            });
            const currentPrice = highestBid ? Number(highestBid.amount) : Number(listing.price);
            if (createBidDto.amount <= currentPrice) {
                throw new common_1.BadRequestException(`Bid must be higher than current price: ${currentPrice}`);
            }
            const bid = queryRunner.manager.create(bid_entity_1.Bid, {
                listing_id: listing.id,
                bidder_id: bidderId,
                amount: createBidDto.amount,
            });
            await queryRunner.manager.save(bid);
            await queryRunner.commitTransaction();
            return bid;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    findAllByListing(listingId) {
        return this.bidsRepository.find({
            where: { listing_id: listingId },
            order: { amount: 'DESC' },
            relations: ['bidder'],
        });
    }
};
exports.BidsService = BidsService;
exports.BidsService = BidsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bid_entity_1.Bid)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], BidsService);
//# sourceMappingURL=bids.service.js.map