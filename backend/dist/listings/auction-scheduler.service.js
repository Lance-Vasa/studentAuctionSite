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
var AuctionSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const listing_entity_1 = require("./entities/listing.entity");
const bid_entity_1 = require("../bids/entities/bid.entity");
let AuctionSchedulerService = AuctionSchedulerService_1 = class AuctionSchedulerService {
    listingsRepository;
    dataSource;
    logger = new common_1.Logger(AuctionSchedulerService_1.name);
    constructor(listingsRepository, dataSource) {
        this.listingsRepository = listingsRepository;
        this.dataSource = dataSource;
    }
    async handleCron() {
        this.logger.debug('Checking for expired auctions...');
        const expiredListings = await this.listingsRepository.find({
            where: {
                listing_type: listing_entity_1.ListingType.AUCTION,
                is_sold: false,
                expires_at: (0, typeorm_2.LessThan)(new Date()),
            },
        });
        for (const listing of expiredListings) {
            await this.closeAuction(listing);
        }
    }
    async closeAuction(listing) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const lockedListing = await queryRunner.manager.findOne(listing_entity_1.Listing, {
                where: { id: listing.id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!lockedListing || lockedListing.is_sold) {
                await queryRunner.commitTransaction();
                return;
            }
            const winningBid = await queryRunner.manager.findOne(bid_entity_1.Bid, {
                where: { listing_id: listing.id },
                order: { amount: 'DESC' },
                relations: ['bidder'],
            });
            lockedListing.is_sold = true;
            await queryRunner.manager.save(lockedListing);
            if (winningBid) {
                this.logger.log(`Auction ${listing.id} closed. Winner: ${winningBid.bidder.email} with bid ${winningBid.amount}`);
            }
            else {
                this.logger.log(`Auction ${listing.id} closed with no bids.`);
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            this.logger.error(`Failed to close auction ${listing.id}`, err);
            await queryRunner.rollbackTransaction();
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.AuctionSchedulerService = AuctionSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSchedulerService.prototype, "handleCron", null);
exports.AuctionSchedulerService = AuctionSchedulerService = AuctionSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listing_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], AuctionSchedulerService);
//# sourceMappingURL=auction-scheduler.service.js.map