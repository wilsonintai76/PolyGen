import { Vibrant } from 'node-vibrant/node';

async function run() {
  const v = new Vibrant('logo.png');
  const palette = await v.getPalette();
  console.log('Vibrant:', palette.Vibrant?.hex);
  console.log('Muted:', palette.Muted?.hex);
  console.log('DarkVibrant:', palette.DarkVibrant?.hex);
  console.log('DarkMuted:', palette.DarkMuted?.hex);
  console.log('LightVibrant:', palette.LightVibrant?.hex);
  console.log('LightMuted:', palette.LightMuted?.hex);
}
run();
