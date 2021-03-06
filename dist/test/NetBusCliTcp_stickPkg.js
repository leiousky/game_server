"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var net = require("net");
var AuthProto = __importStar(require("../apps/protocol/protofile/AuthProto"));
var StickPackage = require("stickpackage");
var ProtoManager_1 = __importDefault(require("../netbus/ProtoManager"));
var Platform_1 = __importDefault(require("../utils/Platform"));
var Stype_1 = require("../apps/protocol/Stype");
var Log_1 = __importDefault(require("../utils/Log"));
var recvMsgCenter = new StickPackage.msgCenter({ bigEndian: false });
var local = "127.0.0.1";
var remote = "www.hccfun.com";
var hoststr = Platform_1["default"].isWin32() ? local : remote;
Log_1["default"].info("host:", hoststr);
var proto_type = 2;
var sock = net.connect({
    port: 6080,
    host: local
}, function () {
    console.log('tcp connected to server!');
});
sock.on("connect", function () {
    var msgCenter = new StickPackage.msgCenter({ bigEndian: false });
    console.log("tcp connect success");
    var stype = Stype_1.Stype.Auth;
    var ctype = AuthProto.Cmd.eUnameLoginReq;
    var utag = 0;
    var body = {
        uname: "test1111",
        upwd: "111111"
    };
    var cmd1 = ProtoManager_1["default"].encode_cmd(stype, ctype, utag, proto_type, body);
    //粘包处理工具
    var cmd_buf = msgCenter.publish(cmd1);
    setInterval(function () {
        sock.write(cmd_buf);
    }, 1000);
});
sock.on("error", function (e) {
    Log_1["default"].info("error", e);
});
sock.on("close", function () {
    Log_1["default"].info("close");
});
sock.on("end", function () {
    Log_1["default"].info("end event");
});
sock.on("data", function (data) {
    recvMsgCenter.putData(data);
});
//处理粘包
recvMsgCenter.onMsgRecv(function (cmd_buf) {
    var cmd = ProtoManager_1["default"].decode_cmd_header(cmd_buf);
    var body = ProtoManager_1["default"].decode_cmd(proto_type, cmd_buf);
    Log_1["default"].info("header: ", cmd);
    Log_1["default"].info("body: ", body);
});
//# sourceMappingURL=NetBusCliTcp_stickPkg.js.map