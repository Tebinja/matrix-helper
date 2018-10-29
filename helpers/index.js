import axios from 'axios'
const baseUrl = 'https://192.168.88.80:8448'
const register = async (userName, password) => {
  try {
    let url = baseUrl + '/_matrix/client/r0/register'
    let result = await axios.post(url,
      {
        "username": userName,
        "password": password,
        "auth": { "type": "m.login.dummy" }
      })
    let data = result.data
    console.log(data)
    if (data.access_token) {
      return { success: true, user: data }
    } else if (data.errcode) {
      return { success: false, err: data }
    }
  } catch (e) {
    console.log(e)
    return Error(e)
  }
}

const login = async (userName, password) => {
  try {
    let url = baseUrl + '/_matrix/client/r0/login'
    let result = await axios.post(url,
      {
        "type": "m.login.password",
        "user": userName,
        "password": password,
      })
    let data = result.data
    // console.log(data)
    if (data.access_token) {
      return { success: true, user: data }
    } else if (data.errcode) {
      return { success: false, err: data }
    }
  } catch (e) {
    console.log(e.data)
    return Error(e)
  }
}
const joinRoom = async (room, roomToJoin, accessToken) => {
  try {
    let url = baseUrl + `/_matrix/client/r0/join/${room.roomId}?access_token=${accessToken}`
    let { data } = await axios.post(url,
      {
        room_id: roomToJoin,
      })
    return data
  } catch (error) {
    console.log(error)
  }
}
const sendReadRecipet = async (sentMessage, room_id, accessToken) => {
  try {
    let url = `https://192.168.88.90:8448/_matrix/client/r0/rooms/${room_id}/read_markers?access_token=${accessToken}`
    axios.post(url,
      {
        'm.fully_read': sentMessage.event_id
      })
  } catch (error) {
    console.log(error)
  }
}
startPrivateChat = async (userName) => {
  try {
    let result = await client.createRoom({ preset: "trusted_private_chat", invite: [userName], is_direct: true })
    return result
  } catch (error) {
    return Error(error)
  }
}
const getRoomMessages = async (roomId, nextSyncToken, accessToken) => {
  try {
    let allMessages = baseUrl + `/_matrix/client/r0/rooms/${roomId}/messages?limit=10&from=${nextSyncToken}&access_token=${accessToken}&dir=b`
    let result = await axios.get(allMessages)
    return result.data
  } catch (error) {
    console.log(error)
  }
}
const getOlderMessages = async () => {
  let { messages, room_id, nextSyncToken, accessToken } = this.state
  try {
    if (messages[room_id].length == 8) {
      messages[room_id] = []
    }
    var oldMessages = await getRoomMessages(room_id, nextSyncToken, accessToken)
    if (oldMessages.chunk.length == 0) {
      return
    }
    oldMessages.chunk.forEach(msg => {
      let a = {
        body: msg.content.body,
        msgtype: msg.content.msgtype,
        sender: msg.sender,
      }
      if (msg.content.msgtype == 'm.image') {
        a.url = msg.content.url
        a.mxc = msg.content.mxc
        a.type = 'image'
      }
      messages[room_id].unshift(a)
    })

    return {
      messages: messages,
      nextSyncToken: oldMessages.end
    }
  } catch (error) {
    console.log(error)
  }
}
sendMessage = async (e) => {
  let { client, room_id, accessToken, message } = this.state
  try {

    let content = {
      msgtype: "m.text",
      body: message
    }
    let sentMessage = await client.sendMessage(room_id, content)
    console.log(sentMessage, ' sent message ')
    let url = `https://192.168.88.90:8448/_matrix/client/r0/rooms/${room_id}/read_markers?access_token=${accessToken}`
    axios.post(url,
      {
        'm.fully_read': sentMessage.event_id
      })
    client.sendTyping(room_id, false)
    //NOTE: set message to empty 

  } catch (e) {
    console.log(e)
  }
}
uploadFile = async (event) => {
  let unixtime = Date.now();
  const file = event.target.files[0];
  let { client, room_id } = this.state
  try {
    client.uploadContent(file)
      .then((a, b) => {
        console.log(a, b, 'upload file ')
        let content = {
          body: 'file caption',
          msgtype: 'm.image',
          url: this.getFile(a),
          mxc: a

        }
        client.sendEvent(room_id, 'm.room.message', content, unixtime)
      })
  } catch (e) {
    console.log(e)
  }
}
newMessage = async (data) => {
  let { room_id, messages } = this.state
  let message = data.event.content
  if (!messages[data.event.room_id]) {
    messages[data.event.room_id] = []
  }
  message['sender'] = data.sender.name
  if (message.msgtype == 'm.image') {
    message['type'] = 'image'
    message['url'] = message.url
  }
  messages[data.event.room_id].push(message)

}
getFile = (mediaId) => {
  try {
    mediaId = mediaId.replace('mxc://', '')
    let url = baseUrl + `/_matrix/media/r0/download/${mediaId}`
    console.log(url, 'aaaaaaaaaaaaaaaaaa', mediaId)
    return url
  } catch (e) {
    console.log(e)
  }
}

setTyping = (e) => {
  let { client, room_id } = this.state
  client.sendTyping(room_id, true)

}


export default {
  register, login, joinRoom, sendReadRecipet
}