"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var GameHoodleConfig_1 = __importDefault(require("./GameHoodleConfig"));
//商城配置
var StoreConfig = /** @class */ (function () {
    function StoreConfig() {
        this._store_list_config = [];
        //弹珠等级: 价格
        this._store_price_config = [
            0, 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120,
            10240, 20480, 40960, 81920, 163840, 327680,
        ];
        this.cal_store_config();
    }
    StoreConfig.getInstance = function () {
        return StoreConfig.Instance;
    };
    StoreConfig.prototype.cal_store_config = function () {
        for (var index = 1; index < this._store_price_config.length; index++) {
            var configObj = {
                propsvrindex: 10000 + index,
                propid: GameHoodleConfig_1["default"].KW_PROP_ID_BALL,
                propcount: 1,
                propprice: this._store_price_config[index],
                propinfo: JSON.stringify({ level: index })
            };
            this._store_list_config.push(configObj);
        }
    };
    StoreConfig.prototype.get_store_config = function () {
        return this._store_list_config;
    };
    StoreConfig.Instance = new StoreConfig();
    return StoreConfig;
}());
exports["default"] = StoreConfig;
//# sourceMappingURL=StoreConfig.js.map