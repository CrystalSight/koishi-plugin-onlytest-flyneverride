import { Context, Schema, valueMap} from 'koishi'
import { AdventurePlugin } from './AdventurePlugin';



export const name = 'onlytest-flyneverride'

interface Receiver {  //设定推送列表数组内容
  platform: string
  guildName: string
  defaultServer: string
  guildId: string
}

const Receiver: Schema<Receiver> = Schema.object({  //列表形式数组
  platform: Schema.string().required().description('平台名称'),
  guildName: Schema.string().required().description('组群 名称'),
  defaultServer:Schema.string().required().description('默认区服'),
  guildId: Schema.string().description('群组 ID')
})

export interface Config {  //由于配置文件复杂，暂时不会写Config接口，放弃！开摆！
  // enabled: boolean
  // endpoint: string
  // token: string
  // administratorId:string
  // rules: Receiver[]
} 

export const Config: Schema<Config> = Schema.intersect([  //配置界面
  Schema.object({  
    enabled: Schema.boolean().default(false)
  }).description('监听功能'),
  Schema.union([
    Schema.object({
      enabled: Schema.const(true).required(),
      endpoint: Schema.string().required().description('API地址'),
      token: Schema.string().required().description('鉴权令牌'),
      administratorId: Schema.string().description('管理员ID，将连接状态实时推送至该账号，可自行选择是否启用'),
      functionList: Schema
        .array(Schema.union(['开服监控', '新闻资讯', '游戏更新', '贴吧速报', '关隘预告', '云从预告']))
        .default(['开服监控', '新闻资讯', '游戏更新'])
        .role('checkbox')
        .description('选择需要开启的监听功能'),
      rules: Schema.array(Receiver).role('table').description('推送规则列表。')
    }),
    Schema.object({}),
  ])
])
 

export function apply(ctx: Context, Config) { //主函数
  let guildId = Config.rules.map(rules => {  //新建一个guildId数组，将群号遍历后存入
    return `${rules.guildId}`; 
  });
  let defaultServer = Config.rules.map(rules => {  //新建一个defaultServer数组，将默认区服遍历后存入
    return `${rules.defaultServer}`;   
  });

  let getInfo = {
    'endpoint':Config.endpoint+'/v1/message.create',
    'administratorId':Config.administratorId,
    'token':Config.token,
    'functionList':Config.functionList,
    'guildId':guildId,
    'defaultServer':defaultServer
  }
  console.log(getInfo.functionList);
  defaultServer.forEach(Element => { 
    console.log(Element)
  });


  console.log(Config.enabled);
  if (Config.enabled) {  
    // 如果Config.enabled为true，执行AdventurePlugin  
    AdventurePlugin(ctx, getInfo);  
  } else {  
    // 如果Config.enabled为false，则不执行AdventurePlugin，可以在这里添加日志或其他操作  
    console.log('未开启事件监听功能');  
  }
  // write your plugin here

}


