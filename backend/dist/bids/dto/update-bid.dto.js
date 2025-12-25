"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBidDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bid_dto_1 = require("./create-bid.dto");
class UpdateBidDto extends (0, mapped_types_1.PartialType)(create_bid_dto_1.CreateBidDto) {
}
exports.UpdateBidDto = UpdateBidDto;
//# sourceMappingURL=update-bid.dto.js.map