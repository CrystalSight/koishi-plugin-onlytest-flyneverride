import { Context, Schema, Plugin } from 'koishi'
import WebSocket from 'ws';  
import axios from 'axios';  

const serverStatus: Record<string, number> = {};  //定义数组存放开服维护信息（开服监控API）



export const name = 'onlytest-flyneverride'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.plugin(AdventurePlugin);  
  // write your plugin here
}

export const AdventurePlugin: Plugin = (ctx: Context) => {
  // WebSocket连接配置  
  const wsUrl = 'wss://socket.nicemoe.cn';  
  const ws = new WebSocket(wsUrl);  
 
  
  ws.on('open', () => {  
    console.log('WebSocket connection');
    // 可以在此处发送验证token的请求，如果需要的话 

    // 假设你已经有了需要验证的token  
    //const tokenToVerify = "cdbc9db08e9db0d069";  
    
    // 构建请求体  
    // const requestBody = { 
    //   "token": "cdbc9db08e9db0d069", 
    //   "ticket": "b77d9aa798ca4866bbcd016b6556855d:13645413454:kingsoft::OXVvNnpwOHYxbm01ajE0eQ==" 
    // }
    
    // 发送POST请求验证token  
    // axios.post('https://www.jx3api.com/data/token/wss/token', requestBody)  
    //   .then(response => {  
    //     // 处理返回的数据  
    //     if (response.data.code === 200) {  
    //       console.log('Token验证成功:', response.data);  
    //       // 在此处可以继续你的WebSocket逻辑或进行其他操作  
    //     } else {  
    //       console.error('Token验证失败:', response.data);  
    //       // 处理验证失败的情况  
    //     }  
    //   })  
    //   .catch(error => {  
    //     // 处理网络错误或其他异常情况  
    //     console.error('请求验证token时出错:', error);  
    //   });   
   
  });  
  
  ws.on('message', (data) => {  
    const message = JSON.parse(data.toString());  
    handleAdventureMessage(ctx, message);  
  });  
  
  ws.on('close', () => {  
    console.log('WebSocket connection closed');  
    // 处理重连逻辑，如果需要的话  
  });  
  
  ws.on('error', (error) => {  
    console.error('WebSocket error:', error);  
    // 处理错误逻辑  
  });  
  
  function handleAdventureMessage(ctx: Context, message: any) {  
    if (message.action === 2001) {  //开服监控
      const { server, status } = message.data;  
      serverStatus[server] = status;  
      // 在这里可以根据状态更新做一些操作，比如发送通知等  
      //ctx.sendMessage(`服务器 ${server} 的状态已更新为 ${status ? '开服' : '维护'}`); 
      return(`服务器 ${server} 的状态已更新为 ${status ? '开服' : '维护'}`); 
    }

    if (message.action === 2002) {  //新闻资讯
      const {type, title, url, date}= message.data;  
      // 处理接收到的新闻数据，例如发送到聊天群或者存储起来  
      return(`新闻资讯：${title}\n详情链接：${url}\n发布日期：${date}`);  
    }  

    if (message.action === 2003) {  //游戏更新
      const { old_version, new_version, package_num, package_size } = message.data;  
      // 发送版本更新通知  
      return(`客户端版本已更新！\n旧版本：${old_version}\n新版本：${new_version}\n更新包数量：${package_num}\n更新包大小：${package_size}`);  
    }  

    if (message.action === 2004) {  //八卦速报
      const { subclass, server, name, title, url, date } = message.data;  
      // 发送818速报通知  
      return(`百度贴吧818速报：\n子类：${subclass}\n服务器：${server}\n版块：${name}\n标题：${title}\n链接：${url}\n日期：${date}`);  
    }  
  }  
  
  // 可以在此添加其他Koishi事件处理逻辑  
 
}
