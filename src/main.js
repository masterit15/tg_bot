import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(config.get("TELEGRAM_TOKEN"), {polling: true});

import config from 'config'
import { ogg } from './ogg.js'
import { media } from './media.js'
import { openai } from './openai.js'

function hasKey(obj, key){
  return Object.keys(obj).some(x => x == key);
}
bot.on('message', async(msg)=>{
  try {
    const chatId = msg.chat.id;
    const userId = String(msg.from.id)
    let file
    // console.log(msg);
    if(hasKey(msg, 'document')){
      file = msg?.document.file_id
    }else if(hasKey(msg, 'photo')){
      file = msg?.photo[3].file_id
    }else if(hasKey(msg, 'video')){
      file = msg?.video.file_id
    }else if(hasKey(msg, 'voice')){
      try {
        const link = await bot.getFileLink(msg.voice.file_id)
        const oggPath = await ogg.create(link, userId)
        const wavPath = await ogg.toWAV(oggPath, userId) 
        const text = await openai.transcription(wavPath)
        bot.sendMessage(chatId, String(text))
      } catch (error) {
        console.log("Ошибка при обработке голосового сообщения", error.message);
      }
    }
    if(file && !hasKey(msg, 'voice')){
      const link = await bot.getFileLink(file)
      const mediaPath = await media.save(link, userId)
      bot.sendMessage(chatId, String(mediaPath))
    }
  } catch (error) {
    console.log("Ошибка при обработке сообщения", error.message);
  }
})
process.once("SIGINT", ()=> bot.stop("SIGINT"))
process.once("SIGTERM", ()=> bot.stop("SIGTERM"))