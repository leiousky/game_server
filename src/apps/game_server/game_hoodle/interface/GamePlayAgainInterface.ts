//玩家使用表情
import Player from '../cell/Player';
import { Cmd } from "../../../protocol/protofile/GameHoodleProto";
import Log from '../../../../utils/Log';
import Response from '../../../protocol/Response';
import PlayerManager from '../manager/PlayerManager';
import ProtoManager from '../../../../netbus/ProtoManager';
import RoomManager from '../manager/RoomManager';
import ArrayUtil from '../../../../utils/ArrayUtil';
import Room from '../cell/Room';
import GameHoodleConfig from '../config/GameHoodleConfig';
import { UserState } from '../config/State';

let playerMgr: PlayerManager = PlayerManager.getInstance();
let roomMgr: RoomManager = RoomManager.getInstance();

class GamePlayAgainInterface {

    //玩家请求再次对局
    static do_player_play_again_req(utag: number, proto_type: number, raw_cmd: any) {
        let player: Player = playerMgr.get_player(utag);
        let body = ProtoManager.decode_cmd(proto_type, raw_cmd);
        if (body && body.otheruids){
            let otheruids: Array<number> = body.otheruids;
            let configObj = {
                requserunick: player.get_unick(),
                requseruid: player.get_uid(),
            }
            let resBody = {
                status: Response.OK,
                ansconfig: JSON.stringify(configObj),
            }
            otheruids.forEach((uid)=>{
                let invitePlayer:Player = playerMgr.get_player(uid); //被邀请人
                if (invitePlayer){
                    let uroom = roomMgr.get_room_by_uid(invitePlayer.get_uid());
                    if(invitePlayer.get_user_state() == UserState.InView && uroom == null){ //空闲状态,没有在其他房间,才能发邀请给他
                        invitePlayer.send_cmd(Cmd.eUserPlayAgainAnswerRes, resBody);
                        player.send_cmd(Cmd.eUserPlayAgainRes, { status: Response.OK });
                    }else{
                        player.send_cmd(Cmd.eUserPlayAgainRes, { status: Response.INVALIDI_OPT });
                    }
                }else{
                    player.send_cmd(Cmd.eUserPlayAgainRes, { status: Response.INVALIDI_OPT });
                }
            })
        }
    }

    //玩家回应邀请
    static do_player_play_again_answer(utag: number, proto_type: number, raw_cmd: any) {//回应玩家utag
        let player: Player = playerMgr.get_player(utag); //被邀请的玩家
        if (player.get_user_state() != UserState.InView) {//非空闲状态
            player.send_cmd(Cmd.eUserPlayAgainAnswerRes, { status: Response.INVALIDI_OPT });
            // Log.warn("hcc>>do_player_play_again_answer error111");
            return;
        }

        let uroom = roomMgr.get_room_by_uid(player.get_uid()); //自己已经在另外一个房间内了
        if(uroom != null){
            player.send_cmd(Cmd.eUserPlayAgainAnswerRes, { status: Response.INVALIDI_OPT });
            // Log.warn("hcc>>do_player_play_again_answer error222");
            return;
        }

        let body = ProtoManager.decode_cmd(proto_type, raw_cmd);
        if (body){
            let requseruid = body.requseruid;
            let responsecode = body.responsecode;
            let resBody = {
                status:Response.OK,
                responsecode: responsecode,
            }
            let invitePlayer: Player = playerMgr.get_player(requseruid); //邀请的玩家
            if (invitePlayer.get_user_state() != UserState.InView){ //非空闲状态
                // Log.warn("hcc>>do_player_play_again_answer error333");
                invitePlayer.send_cmd(Cmd.eUserPlayAgainAnswerRes, { status: Response.INVALIDI_OPT});
                return;
            }

            if (roomMgr.get_room_by_uid(invitePlayer.get_uid()) != null){ //已经在房间内了
                // Log.warn("hcc>>do_player_play_again_answer error444");
                invitePlayer.send_cmd(Cmd.eUserPlayAgainAnswerRes, { status: Response.INVALIDI_OPT});
                return;
            }

            let player_list = [];
            player_list.push(player);
            player_list.push(invitePlayer);
            if (invitePlayer) {
                invitePlayer.send_cmd(Cmd.eUserPlayAgainRes, resBody);
                //玩家同意再次游戏
                if(responsecode == Response.OK){
                    GamePlayAgainInterface.player_play_again(player_list);
                }
            }
        }
    }

    private static player_play_again(player_list:any) {
        if (!player_list || ArrayUtil.GetArrayLen(player_list) <= 1){
            return;
        }
        let room: Room = RoomManager.getInstance().alloc_room();
        room.set_game_rule(JSON.stringify(GameHoodleConfig.MATCH_GAME_RULE));
        room.set_is_match_room(true);
        for (let key in player_list) {
            let player = player_list[key];
            player.set_offline(false);
            if (!room.add_player(player)) {
                Log.warn("player_play_again enter room error")
                RoomManager.getInstance().delete_room(room.get_room_id())
                return;
            }
        }
        GamePlayAgainInterface.set_room_host(room);
        room.broadcast_in_room(Cmd.eUserPlayAgainStartRes,{status:Response.OK}); //通知玩家，开始游戏
    }

    //设置房主:room房间
    private static set_room_host(room: Room) {
        let player_list = room.get_all_player();
        if (ArrayUtil.GetArrayLen(player_list) <= 0) {
            return;
        }
        let index = 0;
        for (let key in player_list) {
            index++;
            if (index == 1) {
                let player: Player = player_list[key];
                if (player) {
                    player.set_ishost(true);
                    room.set_room_host_uid(player.get_uid())
                }
                break;
            }
        }
    }
}

export default GamePlayAgainInterface;