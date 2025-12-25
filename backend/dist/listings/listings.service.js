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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const listing_entity_1 = require("./entities/listing.entity");
let ListingsService = class ListingsService {
    listingsRepository;
    constructor(listingsRepository) {
        this.listingsRepository = listingsRepository;
    }
    create(createListingDto, sellerId) {
        const listing = this.listingsRepository.create({
            ...createListingDto,
            seller_id: sellerId,
        });
        return this.listingsRepository.save(listing);
    }
    findAll(query) {
        const qb = this.listingsRepository.createQueryBuilder('listing');
        if (query.market_type) {
            qb.andWhere('listing.market_type = :market_type', { market_type: query.market_type });
        }
        if (query.listing_type) {
            qb.andWhere('listing.listing_type = :listing_type', { listing_type: query.listing_type });
        }
        if (query.search) {
            qb.andWhere('(listing.title ILIKE :search OR listing.description ILIKE :search)', { search: `%${query.search}%` });
        }
        if (query.seller_id) {
            qb.andWhere('listing.seller_id = :seller_id', { seller_id: query.seller_id });
        }
        if (query.include_sold !== 'true') {
            qb.andWhere('listing.is_sold = :is_sold', { is_sold: false });
        }
        if (query.min_price) {
            qb.andWhere('listing.price >= :min_price', { min_price: query.min_price });
        }
        if (query.max_price) {
            qb.andWhere('listing.price <= :max_price', { max_price: query.max_price });
        }
        if (query.days_ago) {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(query.days_ago));
            qb.andWhere('listing.created_at >= :date', { date });
        }
        if (query.sort_by === 'popular') {
            qb.orderBy('listing.views', 'DESC');
        }
        else {
            qb.orderBy('listing.created_at', 'DESC');
        }
        return qb.getMany();
    }
    async findOne(id) {
        const listing = await this.listingsRepository.findOne({ where: { id }, relations: ['seller'] });
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            await this.listingsRepository.save(listing);
        }
        return listing;
    }
    update(id, updateListingDto) {
        return this.listingsRepository.update(id, updateListingDto);
    }
    remove(id) {
        return this.listingsRepository.delete(id);
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listing_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ListingsService);
//# sourceMappingURL=listings.service.js.map