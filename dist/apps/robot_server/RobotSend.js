"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var Stype_1 = require("../protocol/Stype");
var ProtoTools_1 = __importDefault(require("../../netbus/ProtoTools"));
var NetClient_1 = __importDefault(require("../../netbus/NetClient"));
var RobotSend = /** @class */ (function () {
    function RobotSend() {
    }
    //发给游戏服务,这个服务，是需要自己先连接上的，当前属于客户端
    // public static send_game( ctype: number, utag: number, body?: any) {
    //     let game_server_session = NetBus.get_server_session(Stype.GameHoodle);
    //     if (game_server_session){
    //         NetBus.send_cmd(game_server_session, Stype.GameHoodle, ctype, utag, ProtoTools.ProtoType.PROTO_BUF, body);
    //     }
    // }
    //发给游戏服务,这个服务，是需要自己先连接上的，当前属于客户端
    RobotSend.send_game = function (ctype, utag, body) {
        var game_server_session = NetClient_1["default"].get_server_session();
        if (game_server_session) {
            NetClient_1["default"].send_cmd(game_server_session, Stype_1.Stype.GameHoodle, ctype, utag, ProtoTools_1["default"].ProtoType.PROTO_BUF, body);
        }
    };
    return RobotSend;
}());
exports["default"] = RobotSend;
//# sourceMappingURL=RobotSend.js.map