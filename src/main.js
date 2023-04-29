import {Telegraf} from 'telegraf'
import {message} from 'telegraf/filters'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"))

bot.on(message('voice'), async (ctx)=>{
  try {
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const oggPath = await ogg.create(link.href, userId)
    const wovPath = await ogg.toMP3(oggPath, userId) 
    const text = await openai.transcription(wovPath)
    // const response = await openai.chat(text)
    console.log(text);
    await ctx.reply(String(text))
  } catch (error) {
    console.log("Ошибка в сообщении", error.message);
  }
})

bot.command("start", async (ctx)=>{
  await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()

process.once("SIGINT", ()=> bot.stop("SIGINT"))
process.once("SIGTERM", ()=> bot.stop("SIGTERM"))