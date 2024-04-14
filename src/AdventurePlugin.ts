import { Context } from 'koishi'
import WebSocket from 'ws'
import axios from 'axios';


export function pushAdministFunction(axios, getInfo: { endpoint: string; administratorId: any; token: any; guildId: any; }, getmessage){  //管理员推送事件处理函数
  const pushurl = getInfo.endpoint;
  const channel_id = 'private:'+ getInfo.administratorId;
  const token ='Bearer '+ getInfo.token;

  let pushmessage = {
    "channel_id": channel_id,
    "content": getmessage
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token
  };
  axios.post(pushurl,pushmessage,{headers});
}

export function pushFunction(axios, getInfo, getmessage){  //普通推送事件处理函数
  const pushurl = getInfo.endpoint;
  const token ='Bearer '+ getInfo.token;

  getInfo.guildId.forEach((Element: string) => {
    let pushmessage = {  
      "channel_id": Element, 
      "content": getmessage 
    };  
    
    const headers = {  
      'Content-Type': 'application/json',  
      'Authorization': token 
    };  
    
    axios.post(pushurl, pushmessage, { headers })
  });
}


export const AdventurePlugin = (ctx: Context,getInfo: { endpoint: string; administratorId: any; token: any; guildId: any; }) =>{  //监听函数 
    // WebSocket连接配置
  const wsUrl = 'wss://socket.nicemoe.cn';  
  const ws = new WebSocket(wsUrl);
  let nowDate = new Date().toLocaleString("zn-CH", { timeZone: "Asia/Shanghai" }); 

  ws.on('open', () => {  //连接成功
    console.log('WebSocket connection');
    let getmessage = `连接成功 \n当前时间:${nowDate} \n(中国标准时间GMT+0800)`;
    pushAdministFunction(axios,getInfo,getmessage);  //当连接成功时调用（向管理员账户发送信息）
  });  
  
  ws.on('message', (data) => {  
    const message = JSON.parse(data.toString());  
    handleAdventureMessage(ctx, message);  
  });  
  
  ws.on('close', () => {  //断开连接
    console.log('WebSocket connection closed');  
    let getmessage =`连接断开 \n当前时间:${nowDate} \n(中国标准时间GMT+0800)`;
    pushAdministFunction(axios,getInfo,getmessage);  //当断开连接时调用（向管理员账户发送信息）
    setTimeout(pushAdministFunction, 5000);     //处理重连逻辑，如果需要的话 
     
  });  
  
  ws.on('error', (error) => {  //连接错误
    console.error('WebSocket error:', error); 
    let getmessage =`连接错误 \n当前时间:${nowDate} \n(中国标准时间GMT+0800)`;
    pushAdministFunction(axios,getInfo,getmessage);  //当连接错误时调用（向管理员账户发送信息） 
    // 处理错误逻辑  
  });  
  
  function handleAdventureMessage(ctx: Context, message: any) {  //message事件处理函数
    const serverStatus: Record<string, number> = {};  //定义数组存放开服维护信息（开服监控API）
    if (message.action === 2001) {  //开服监控
      const { server, status } = message.data;  
      serverStatus[server] = status; 
      let getmessage = `服务器 ${server} 的状态已更新为 ${status ? '开服' : '维护'}\n当前时间:${nowDate} \n(中国标准时间GMT+0800)`;
      pushFunction(axios,getInfo,getmessage);  //当action2001时，向用户端推送 开服 消息
    }

    if (message.action === 2002) {  //新闻资讯
      const {type, title, url, date}= message.data;  
      let getmessage = `新闻资讯：${title}\n详情链接：${url}\n发布日期：${date}`;
      pushFunction(axios,getInfo,getmessage);  //当action2002时，向用户端推送 新闻资讯 消息 
    }  

    if (message.action === 2003) {  //游戏更新
      const { old_version, new_version, package_num, package_size } = message.data;  
      let getmessage = `客户端版本已更新！\n旧版本：${old_version}\n新版本：${new_version}\n更新包数量：${package_num}\n更新包大小：${package_size}\n当前时间:${nowDate} \n(中国标准时间GMT+0800)`;
      pushFunction(axios,getInfo,getmessage);  //当action2003时，向用户端推送 更新 消息  
    }  

    if (message.action === 2004) {  //八卦速报
      const { subclass, server, name, title, url, date } = message.data;  
      let getmessage = `百度贴吧818速报：\n子类：${subclass}\n服务器：${server}\n版块：${name}\n标题：${title}\n链接：${url}\n日期：${date}`;
      pushFunction(axios,getInfo,getmessage);  //当action2004时，向用户端推送 818 消息  
    }  
  }  
  
  // 可以在此添加其他Koishi事件处理逻辑 

}


