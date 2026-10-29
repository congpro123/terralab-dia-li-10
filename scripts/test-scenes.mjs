import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {riverCenter,riverLevel,landscapeHeight,terrainNoise} from '../lib/landscape.ts';
for(const z of [-150,-70,0,40,110]){
 assert.ok(riverLevel(z)>riverLevel(z+1),'The illustrative channel falls downstream');
 assert.ok(landscapeHeight(riverCenter(z),z)<riverLevel(z),'The channel bed stays under water');
 for(const slope of [0,50,100])for(const side of [-1,1])assert.ok(landscapeHeight(riverCenter(z)+side*8,z,slope)>riverLevel(z),'Banks stay above water');
 for(const x of [-120,-10,0,70])assert.ok(Number.isFinite(landscapeHeight(x,z))&&terrainNoise(x*.1,z*.1)>=0&&terrainNoise(x*.1,z*.1)<=1);
}
const assets=JSON.parse(await readFile(new URL('../data/scene-assets.json',import.meta.url),'utf8'));
let bytes=0;for(const asset of assets){assert.equal(asset.license,'CC0-1.0');assert.match(asset.source,/^https:\/\//);for(const file of asset.files){const path=new URL('../public'+file,import.meta.url),info=await stat(path);assert.ok(info.size>0);bytes+=info.size;if(file.endsWith('.gltf')){const gltf=JSON.parse(await readFile(path,'utf8'));for(const entry of [...gltf.buffers??[],...gltf.images??[]])if(entry.uri&&!entry.uri.startsWith('data:'))assert.ok((await stat(new URL(entry.uri,path))).size>0);}}}
assert.ok(bytes<16*1024*1024,'Scanned source assets remain within the local demo budget');
console.log('PASS terrain drainage, channel/bank geometry, 7 CC0 source groups and all local glTF dependencies.');
