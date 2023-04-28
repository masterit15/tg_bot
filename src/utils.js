import {unlink} from 'fs/promises'
export async function removeFiles(path){
try {
  await unlink(path)
} catch (error) {
  console.log('Error removing ogg file', error.message);
}
}