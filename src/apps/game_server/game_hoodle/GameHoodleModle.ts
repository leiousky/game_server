import ProtoManager from '../../../netbus/ProtoManager';
import { Cmd } from '../../protocol/GameHoodleProto';
import GameSendMsg from './GameSendMsg';
import CommonProto from '../../protocol/CommonProto';
import Response from '../../protocol/Response';
import Log from '../../../utils/Log';
import GameInfoInterface from './interface/GameInfoInterface';
import GameLinkInterface from './interface/GameLinkInterface';
import GameRoomInterface from './interface/GameRoomInterface';
import GameMatchInterface from './interface/GameMatchInterface';
import GameProcessInterface from './interface/GameProcessInterface';
import GameLogicInterface from './interface/GameLogicInterface';
import GameCheck from './interface/GameCheck';

class GameHoodleModle {
    private static readonly Instance: GameHoodleModle = new GameHoodleModle();

    private constructor(){
    }

    public static getInstance(){
        return GameHoodleModle.Instance;
    }
    
    private decode_cmd(proto_type:number,raw_cmd:any){
        return ProtoManager.decode_cmd(proto_type,raw_cmd);
    }

    public recv_cmd_msg(session:any, stype:number, ctype:number, utag:number, proto_type:number, raw_cmd:Buffer){
        Log.info("recv_cmd_msg: ",stype, ctype, utag, proto_type, this.decode_cmd(proto_type,raw_cmd))
        switch(ctype){
            case CommonProto.eUserLostConnectRes:
                this.on_player_lost_connect(session,utag,proto_type,raw_cmd) //link
            break;
            case Cmd.eLoginLogicReq:
                this.on_player_login_logic_server(session,utag,proto_type,raw_cmd)//link
            break;
            case Cmd.eCreateRoomReq:
                this.on_player_create_room(session,utag,proto_type,raw_cmd)//room
            break;
            case Cmd.eJoinRoomReq:
                this.on_player_join_room(session,utag,proto_type,raw_cmd)//room
            break;
            case Cmd.eExitRoomReq:
                this.on_pleyr_exit_room(session,utag,proto_type,raw_cmd)//room
            break;
            case Cmd.eDessolveReq:
                this.on_player_dessolve_room(session,utag,proto_type,raw_cmd)//room
            break;
            case Cmd.eGetRoomStatusReq:
                this.on_player_get_room_status(session,utag,proto_type,raw_cmd)//room
            break;
            case Cmd.eBackRoomReq:
                this.on_player_back_room(session,utag,proto_type,raw_cmd)//room
            break;
            case Cmd.eCheckLinkGameReq:
                this.on_check_link_game(session,utag,proto_type,raw_cmd)//process
            break;
            case Cmd.eUserReadyReq:
                this.on_player_ready(session, utag, proto_type, raw_cmd)//process
            break;
            case Cmd.ePlayerShootReq:
                this.on_player_shoot(session,utag,proto_type,raw_cmd);//game
            break;
            case Cmd.ePlayerBallPosReq:
                this.on_player_ball_pos(session,utag,proto_type,raw_cmd);//game
            break;
            case Cmd.ePlayerIsShootedReq:
                this.on_player_is_shooted(session,utag,proto_type,raw_cmd);//game
            break;
            case Cmd.eUserMatchReq:
                this.on_player_match(session,utag,proto_type,raw_cmd);//match
            break;
            case Cmd.eUserStopMatchReq:
                this.on_player_stop_match(session,utag,proto_type,raw_cmd);//match
            break;
            case Cmd.eUserGameInfoReq:
                this.on_player_get_ugame_info(session,utag,proto_type,raw_cmd);//gameinfo
            break;
            case Cmd.eUserBallInfoReq:
                this.on_player_get_ball_info(session, utag, proto_type, raw_cmd);//gameinfo
            break;
            case Cmd.eUpdateUserBallReq:
                this.on_player_update_ball_info(session, utag, proto_type, raw_cmd);//gameinfo
            break;
            case Cmd.eStoreListReq:
                this.on_player_store_list(session, utag, proto_type, raw_cmd);//gameinfo
            break;
            case Cmd.eBuyThingsReq:
                this.on_player_buy_things(session, utag, proto_type, raw_cmd);//gameinfo
            break;
            default:
            break;
        }
    }

    //玩家离开逻辑服务
    on_player_lost_connect(session:any, utag:number, proto_type:number, raw_cmd:any){
        if(!GameCheck.check_player(utag)){
            return;
        }
        GameLinkInterface.do_player_lost_connect(utag);
    }
    //登录逻辑服务
    private on_player_login_logic_server(session:any, utag:number, proto_type:number, raw_cmd:any){
        GameLinkInterface.do_player_login_logic_server(session, utag, proto_type);
    }

    //创建房间
    private on_player_create_room(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("create_room player is not exist!")
            GameSendMsg.send(session, Cmd.eCreateRoomRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameRoomInterface.do_player_create_room(utag, proto_type, raw_cmd);
    }
    //加入房间
    private on_player_join_room(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("join_room error, player is not exist!")
            GameSendMsg.send(session, Cmd.eJoinRoomRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameRoomInterface.do_player_join_room(utag, proto_type, raw_cmd);
    }
    //离开房间
    private on_pleyr_exit_room(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("exit_room player is not exist!")
            GameSendMsg.send(session, Cmd.eExitRoomRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameRoomInterface.do_pleyr_exit_room(utag);
    }
    //解散房间
    private on_player_dessolve_room(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("dessolve_room error, player is not exist!")
            GameSendMsg.send(session, Cmd.eDessolveRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameRoomInterface.do_player_dessolve_room(utag);
    }
    //获取是否创建过房间
    private on_player_get_room_status(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("get_room_status player is not exist!")
            GameSendMsg.send(session, Cmd.eGetRoomStatusRes, utag, proto_type, {status: Response.SYSTEM_ERR})
            return;
        }
       GameRoomInterface.do_player_get_room_status(utag);
    }

    //返回房间
    private on_player_back_room(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("back_room player is not exist!")
            GameSendMsg.send(session, Cmd.eBackRoomRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameRoomInterface.do_player_back_room(utag);
    }

    //进游戏房间后，服务推送房间内信息
    on_check_link_game(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("check_link_game player is not exist!")
            GameSendMsg.send(session, Cmd.eCheckLinkGameRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameProcessInterface.do_check_link_game(utag);
    }

    //玩家准备
    on_player_ready(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("on_user_ready player is not exist!")
            GameSendMsg.send(session, Cmd.eUserReadyRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            return;
        }
        GameProcessInterface.do_player_ready(utag);
    }
    
    //玩家射击
    on_player_shoot(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("on_player_shoot player is not exist!")
            return;
        }
        GameLogicInterface.do_player_shoot(utag, proto_type, raw_cmd);
    }

    //玩家位置信息
    on_player_ball_pos(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("on_player_ball_pos player is not exist!")
            return;
        }
        GameLogicInterface.do_player_ball_pos(utag, proto_type, raw_cmd);
    }

    //玩家被射中
    on_player_is_shooted(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            Log.warn("on_player_is_shooted player is not exist!")
            return;
        }
        GameLogicInterface.do_player_is_shooted(utag, proto_type, raw_cmd);
    }

    on_player_match(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            GameSendMsg.send(session, Cmd.eUserMatchRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            Log.warn("on_player_match player is not exist!")
            return;
        }
        GameMatchInterface.do_player_match(utag);
    }

    on_player_stop_match(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            GameSendMsg.send(session, Cmd.eUserStopMatchRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            Log.warn("on_player_stop_match error player is not exist!")
            return;
        }
        GameMatchInterface.do_player_stop_match(utag);
    }

    //游戏服信息,没有去创建，有就返回原来数据
    on_player_get_ugame_info(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            GameSendMsg.send(session, Cmd.eUserGameInfoRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            Log.warn("on_user_match player is not exist!")
            return;
        }
        GameInfoInterface.do_player_get_ugame_info(utag);
    }

    //获取小球信息
    on_player_get_ball_info(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            GameSendMsg.send(session, Cmd.eUserBallInfoRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            Log.warn("on_player_get_ball_info error player is not exist!")
            return;
        }
        GameInfoInterface.do_player_get_ball_info(utag);
    }

    //更新小球信息,合成，卖掉，赠送等
    on_player_update_ball_info(session:any, utag:number, proto_type:number, raw_cmd:any){
        if (!GameCheck.check_player(utag)){
            GameSendMsg.send(session, Cmd.eUpdateUserBallRes, utag, proto_type, {status: Response.INVALIDI_OPT})
            Log.warn("on_player_update_ball_info error player is not exist!")
            return;
        }
        GameInfoInterface.do_player_update_ball_info(utag, proto_type, raw_cmd);
    }
    
    //请求商城列表
    on_player_store_list(session: any, utag: number, proto_type: number, raw_cmd: any) {
        if (!GameCheck.check_player(utag)) {
            GameSendMsg.send(session, Cmd.eStoreListRes, utag, proto_type, { status: Response.INVALIDI_OPT })
            Log.warn("on_player_store_list error player is not exist!")
            return;
        }
        GameInfoInterface.do_player_store_list(utag);
    }
    
    on_player_buy_things(session: any, utag: number, proto_type: number, raw_cmd: any) {
        if (!GameCheck.check_player(utag)) {
            GameSendMsg.send(session, Cmd.eUpdateUserBallRes, utag, proto_type, { status: Response.INVALIDI_OPT })
            Log.warn("on_player_buy_things error player is not exist!")
            return;
        }
        GameInfoInterface.do_player_buy_things(utag, proto_type, raw_cmd);
    }

}

export default GameHoodleModle;