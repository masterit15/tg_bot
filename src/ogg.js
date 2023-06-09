import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFiles } from "./utils.js";


const __dirname = dirname(fileURLToPath(import.meta.url));
class OGGConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }
  async toWAV(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.wav`);
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .inputOption("-t 30")
          .audioCodec('pcm_s16le')
		      .format('wav')
          .output(outputPath)
          .on("end", () => {
            resolve(outputPath);
            removeFiles(input);
          })
          .on("error", (err) => reject(err.message))
          .run();
      });
    } catch (error) {
      console.log("Error toWAV", error);
    }
  }
  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, "../voices", `${filename}.ogg`);
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => resolve(oggPath));
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export const ogg = new OGGConverter();
