import axios from "axios";
import fs, { createWriteStream} from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

class mediaControler {
  constructor() {}
  async save(url, userId) {
    try {
      const dir = resolve(__dirname, `../media/${userId}/`)
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
      }
      const filename = url.split("/").pop();
      const mediaPath = resolve(__dirname, dir, `${filename}`);
      const writer = createWriteStream(mediaPath);
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        response.data.pipe(writer);

        let error = null;
        writer.on("error", (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on("close", () => {
          if (!error) {
            resolve(mediaPath);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export const media = new mediaControler();
