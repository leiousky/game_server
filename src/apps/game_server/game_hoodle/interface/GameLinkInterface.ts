//登录，断线协议处理
import Player from '../cell/Player';
import { Cmd } from "../../../protocol/protofile/GameHoodleProto";
import Log from '../../../../utils/Log';
import Response from '../../../protocol/Response';
import PlayerManager from '../manager/PlayerManager';
import RoomManager from '../manager/RoomManager';
import GameFunction from './GameFunction';
import MatchManager from '../manager/MatchManager';
import GameSendMsg from '../GameSendMsg';
import { GameState } from '../config/State';
import ProtoManager from '../../../../netbus/ProtoManager';
import RobotManager from '../manager/RobotManager';
import * as util from 'util';

let playerMgr: PlayerManager    = PlayerManager.getInstance();
let roomMgr: RoomManager        = RoomManager.getInstance();
let matchMgr: MatchManager      = MatchManager.getInstance();

class GameLinkInterface {

    private static _player_lost_connect(player:Player){
        if(util.isNullOrUndefined(player)){
            return;
        }
        //设置房间内玩家掉线
        let room = roomMgr.get_room_by_uid(player.get_uid());
        if (room) {
            player.set_offline(true)
            room.broadcast_in_room(Cmd.eUserOfflineRes, { seatid: player.get_seat_id() }, player);
            GameFunction.broadcast_player_info_in_rooom(room, player);
        }

        //删掉玩家对象，但是如果在房间里面，玩家引用还会在房间里面，方便下次重连
        let uname = player.get_unick();
        let numid = player.get_numberid();
        let issuccess = playerMgr.delete_player(player.get_uid());
        if (issuccess) {
            Log.warn(uname + " ,numid:" + numid + " is lostconnect,totalPlyaerCount: " + playerMgr.get_player_count());
        }

        //如果在匹配，就从匹配列表中删除
        let ret = matchMgr.stop_player_match(player.get_uid());
        if (ret) {
            Log.info(uname, "delete from match")
        }

        //如果在匹配房间内游戏还没开始，达到条件房间就解散(在线玩家为0)
        if (room && room.get_is_match_room()) {
            if (room.get_game_state() != GameState.InView) { //游戏已经开始，不能直接解散
                return;
            }
            //游戏还没开始，而且没有在线玩家，房间解散
            let playerCount = room.get_player_count();
            let onlinePlayerCount = room.get_online_player_count();
            Log.info("hcc>>do_player_lost_connect: playerCouont: ", playerCount, " ,onlinePlayerCount: ", onlinePlayerCount);
            if (playerCount == 0 || onlinePlayerCount == 0) {
                room.kick_all_player();
                let roomID = room.get_room_id();
                let ret = roomMgr.delete_room(roomID);
                Log.info("hcc>>do_player_lost_connect>>delete room :", ret, " ,roomid: ", roomID);
            }
        }
    }

    //玩家断线
    static do_player_lost_connect(utag:number, proto_type:number, raw_cmd:Buffer){
        let body = ProtoManager.decode_cmd(proto_type, raw_cmd);
        if(body && body.is_robot == true){//机器人服务掉线，删掉所有机器人
            let robot_player_set = RobotManager.getInstance().get_robot_player_set();
            for(let key in robot_player_set){
                GameLinkInterface._player_lost_connect(robot_player_set[key]);
            }
            return;
        }

        let player: Player = playerMgr.get_player(utag);
        if (player){
            GameLinkInterface._player_lost_connect(player);
        }
    }

    //玩家登录逻辑服务
    static async do_player_login_logic_server(session: any, utag: number, proto_type: number, raw_cmd:any){
        let player: Player = playerMgr.get_player(utag)
        if (player) {
            Log.info("player is exist, uid: ", utag , "is rotot: " , player.is_robot());
            let issuccess:any =  await player.init_session(session, utag, proto_type);
            if (issuccess){
                let room = roomMgr.get_room_by_uid(utag);
                if (room) {
                    let oldPlayer: Player = room.get_player(utag);
                    if (oldPlayer) {
                        player.set_player_info(oldPlayer.get_player_info());
                        room.add_player(player, true);
                    }
                }
                player.send_cmd(Cmd.eLoginLogicRes, { status: Response.OK })
            }else{
                player.send_cmd(Cmd.eLoginLogicRes, { status: Response.SYSTEM_ERR })
            }
        }else{
            let body = ProtoManager.decode_cmd(proto_type, raw_cmd);
            let newPlayer = null;
            if (body && body.isrobot == true) {
                newPlayer = await RobotManager.getInstance().alloc_robot_player(session, utag, proto_type);
            } else {
                newPlayer = await playerMgr.alloc_player(session, utag, proto_type);
            }
            Log.info("hcc>> new player success!!! , isrobot: ", newPlayer.is_robot(), " ,uid:", newPlayer.get_uid());
            if (newPlayer){
                let room = roomMgr.get_room_by_uid(utag);
                if (room) {
                    let oldPlayer: Player = room.get_player(utag);
                    if (oldPlayer) {
                        newPlayer.set_player_info(oldPlayer.get_player_info());
                        room.add_player(newPlayer,true);
                    }
                }
                newPlayer.send_cmd(Cmd.eLoginLogicRes, { status: Response.OK })
            }else{
                GameSendMsg.send(session, Cmd.eLoginLogicRes, utag, proto_type, { status: Response.SYSTEM_ERR })
            }
        }
    }
}

export default GameLinkInterface;
