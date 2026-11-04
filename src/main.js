import * as THREE from 'three';
import { gsap } from 'gsap';
import { chapters } from './story.js';
import './style.css';

const canvas = document.querySelector('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x21152f, 0.026);
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.2, 12);

scene.add(new THREE.HemisphereLight(0xffe8f2, 0x302040, 2.1));
const keyLight = new THREE.DirectionalLight(0xffe1d2, 3.1);
keyLight.position.set(-4, 8, 6); keyLight.castShadow = true; scene.add(keyLight);
const pinkLight = new THREE.PointLight(0xff70ad, 38, 22); pinkLight.position.set(3, 3, 2); scene.add(pinkLight);
const blueLight = new THREE.PointLight(0x8d8dff, 28, 20); blueLight.position.set(-5, 2, -3); scene.add(blueLight);

const world = new THREE.Group(); scene.add(world);
const ambientGroup = new THREE.Group(); scene.add(ambientGroup);
const mat = (color, roughness=0.72, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const mats = {
  skin: mat(0xf0bd9f), skin2: mat(0xd99d83), hair: mat(0x30212a), hair2: mat(0x211a27),
  blush: new THREE.MeshStandardMaterial({color:0xe88c91, roughness:1}),
  jacket: mat(0x8d789f), dress: mat(0xf0d4e4), shirt: mat(0xf6e8dc),
  dark: mat(0x34283e), gold: new THREE.MeshStandardMaterial({color:0xe9bd75, metalness:.72, roughness:.24}),
  petal: new THREE.MeshStandardMaterial({color:0xffb7d0, roughness:.6}),
  leaf: mat(0x71917b), ground: mat(0x65506e), cream: mat(0xf7e6dc)
};

function mesh(geometry, material, parent=world, pos=[0,0,0]) {
  const m = new THREE.Mesh(geometry, material); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function sphere(parent, pos, scale, material) {
  const m=mesh(new THREE.SphereGeometry(1,24,18),material,parent,pos); m.scale.set(...scale); return m;
}
function cylinder(parent, a, b, radius, material, pos) {
  const m=mesh(new THREE.CylinderGeometry(radius,radius,b,16),material,parent,pos); return m;
}
function heartShape() {
  const s=new THREE.Shape(); s.moveTo(0,0.25); s.bezierCurveTo(-.6,.8,-1.15,.18,0,-.75); s.bezierCurveTo(1.15,.18,.6,.8,0,.25); return s;
}
function makeHeart(parent, position, size, color=0xff80b4) {
  const geo=new THREE.ExtrudeGeometry(heartShape(),{depth:.16,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.08,bevelThickness:.07,curveSegments:18});
  const h=mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.28,metalness:.08}),parent,position);
  h.scale.setScalar(size); h.rotation.z=Math.PI; return h;
}
function makeFlower(parent, x,y,z,scale=1) {
  const g=new THREE.Group(); g.position.set(x,y,z); g.scale.setScalar(scale); parent.add(g);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5; const p=sphere(g,[Math.cos(a)*.18,.12+Math.sin(a)*.18,0],[.15,.22,.08],mats.petal); p.rotation.z=-a;}
  sphere(g,[0,.12,.07],[.09,.09,.08],mats.gold);
  return g;
}
function makePerson(parent, x, y, z, female=false) {
  const rig=new THREE.Group(); rig.position.set(x,y,z); parent.add(rig);
  const skin=female?mats.skin:mats.skin2, hair=female?mats.hair:mats.hair2;
  const body=sphere(rig,[0,1.05,0],female?[.43,.62,.28]:[.42,.6,.28],female?mats.dress:mats.jacket);
  const neck=cylinder(rig,.22,.28,.13,skin,[0,1.62,0]);
  const head=sphere(rig,[0,1.98,0],[.38,.46,.34],skin);
  // hair cap and back volume
  sphere(rig,[0,2.2,-.04],[.4,.32,.36],hair);
  if(female){
    sphere(rig,[0,1.96,-.22],[.4,.52,.2],hair);
    for(let i=-1;i<=1;i++) sphere(rig,[i*.25,1.78,-.2],[.12,.42,.13],hair);
  } else {
    sphere(rig,[0,2.28,.08],[.37,.16,.3],hair);
    sphere(rig,[-.22,2.2,.22],[.2,.13,.2],hair);
  }
  // face details face camera (+z)
  for(const ex of [-.14,.14]) sphere(rig,[ex,2.02,.315],[.035,.045,.025],mats.dark);
  sphere(rig,[0,1.88,.33],[.045,.018,.018],mats.skin2);
  for(const sx of [-1,1]){
    const arm=sphere(rig,[sx*.48,1.15,0],[.14,.46,.15],female?mats.dress:mats.jacket); arm.rotation.z=sx*.22;
    const hand=sphere(rig,[sx*.52,.72,.04],[.13,.14,.13],skin);
    const leg=sphere(rig,[sx*.18,.35,0],[.16,.42,.18],mats.dark);
    const shoe=sphere(rig,[sx*.18,.08,.1],[.2,.1,.28],mats.cream);
  }
  return {rig,head,body};
}
function addSchool(parent) {
  const building=mesh(new THREE.BoxGeometry(3.4,2.1,.8),mats.cream,parent,[-3.4,1.0,-2.8]);
  const roof=mesh(new THREE.ConeGeometry(2.35,.9,4),mats.jacket,parent,[-3.4,2.5,-2.8]); roof.rotation.y=Math.PI/4;
  for(let i=0;i<3;i++){
    const w=mesh(new THREE.BoxGeometry(.42,.58,.08),new THREE.MeshStandardMaterial({color:0x7b9bb0,emissive:0x253d55}),parent,[-4.4+i,1.25,-2.36]);
  }
  const door=mesh(new THREE.BoxGeometry(.5,1.1,.12),mats.dark,parent,[-3.4,.55,-2.34]);
}
function addHouse(parent) {
  mesh(new THREE.BoxGeometry(2.5,1.8,1.8),mats.cream,parent,[-3.3,.9,-2.5]);
  const roof=mesh(new THREE.ConeGeometry(2.05,1.25,4),mats.petal,parent,[-3.3,2.35,-2.5]); roof.rotation.y=Math.PI/4;
  mesh(new THREE.BoxGeometry(.48,.85,.08),mats.jacket,parent,[-3.3,.45,-1.56]);
  for(const x of [-4,-2.6]) mesh(new THREE.BoxGeometry(.42,.48,.08),mats.gold,parent,[x,1.1,-1.55]);
}
function addArch(parent) {
  const tor=mesh(new THREE.TorusGeometry(1.55,.11,14,64,Math.PI),mats.gold,parent,[0,2.4,-2.2]); tor.rotation.z=Math.PI;
  for(let i=0;i<9;i++) makeFlower(parent,-1.55+i*.39,2.4+Math.sin(i/8*Math.PI)*1.55,-2.15,.5);
}
function addGround(parent, color=0x564361) {
  const ground=mesh(new THREE.CircleGeometry(6.5,64),mat(color),parent,[0,-.06,-1.5]); ground.rotation.x=-Math.PI/2;
  const platform=mesh(new THREE.CylinderGeometry(4.6,5.0,.35,64),mat(0x6f5879),parent,[0,-.28,-1.5]);
  return {ground,platform};
}
function clearWorld() {
  while(world.children.length){const o=world.children.pop(); if(o.geometry)o.geometry.dispose();}
}
let people=[], floating=[], stars=null, chapterIndex=0;
const palettes=[
  [0xf6c8d8,0x8b779f,0xffd9a8],[0xf4aeca,0x68527f,0xffd9e5],[0x9d81c2,0x34284f,0xff8db8],
  [0xc2a0c6,0x594d73,0xe9d4b8],[0x8d9fc8,0x394566,0xf5d6a6],[0xf5c4d5,0x755d8c,0xffe6c3],
  [0xffc5d6,0x7e536f,0xffe4a8],[0xb6c9bd,0x526d69,0xf7d9b8],[0x7c78a9,0x28243f,0xffd5e7]
];
function makeStars(count=420) {
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*32;positions[i*3+1]=Math.random()*16-1;positions[i*3+2]=-10-Math.random()*18;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffe8f3,size:.055,transparent:true,opacity:.8}));
  ambientGroup.add(points);return points;
}
stars=makeStars();
function buildChapter(index) {
  clearWorld(); people=[]; floating=[];
  const [sky,groundColor,accent]=palettes[index];
  scene.background=new THREE.Color(sky).multiplyScalar(.16);
  scene.fog.color.set(sky).multiplyScalar(.28);
  addGround(world,groundColor);
  // distant glowing moon/sun
  const sun=sphere(world,[4.4,4.1,-7],[1.3,1.3,1.3],new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.42}));
  sun.material.toneMapped=false;
  // layered cloud-like floating forms
  for(let i=0;i<7;i++){
    const cloud=sphere(world,[(i-3)*2.0,3.8+(i%3)*.55,-5-(i%2)*2],[1.1,.28,.55],new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.14,roughness:1}));
    floating.push(cloud);
  }
  if(index===0){ addSchool(world); }
  if(index===1){ for(let i=0;i<8;i++) makeHeart(world,[(i-3.5)*.85,1.2+Math.sin(i)*.6,-2.5],.26,0xff80b4); }
  if(index===2){ makeHeart(world,[0,2.5,-2],1.05,0xff659d); }
  if(index===3){ for(let i=0;i<8;i++){const f=makeFlower(world,-3.4+i*.95,.35,-2.2,.8); floating.push(f);} }
  if(index===4){ addHouse(world); for(let i=0;i<6;i++) makeFlower(world,2.2+(i%3)*.65,.2+Math.floor(i/3)*.4,-2.5,.7); }
  if(index===5){ addArch(world); makeHeart(world,[0,3.0,-1.5],.52,0xffd2a0); }
  if(index===6){ addArch(world); for(let i=0;i<12;i++) makeFlower(world,Math.cos(i/12*Math.PI*2)*3.3,.3,Math.sin(i/12*Math.PI*2)*2-2,.85); }
  if(index===7){ addHouse(world); mesh(new THREE.BoxGeometry(1.8,.08,1.1),mats.gold,world,[-.2,.05,-.2]); }
  if(index===8){ makeHeart(world,[0,2.8,-2],1.25,0xff8fbc); for(let i=0;i<3;i++){const ring=mesh(new THREE.TorusGeometry(1.4+i*.55,.025,8,80),mats.gold,world,[0,2.4,-2]);ring.rotation.x=Math.PI/2.8;floating.push(ring);} }
  const p1=makePerson(world,-.75,0,1.1,false);
  const p2=makePerson(world,.75,0,1.1,true);
  people=[p1,p2];
  // chapter-specific props, little glowing memories
  for(let i=0;i<18;i++){
    const h=makeHeart(world,[(Math.random()-.5)*9,Math.random()*4+.2,-1-Math.random()*5],.055+Math.random()*.09, i%3===0?0xffd5a8:0xff8fb9);
    h.material.transparent=true; h.material.opacity=.72; floating.push(h);
  }
  // Decorative lantern-like orbs
  for(let i=0;i<9;i++){
    const orb=sphere(world,[(Math.random()-.5)*11,Math.random()*5+.3,-3-Math.random()*4],[.035,.035,.035],new THREE.MeshBasicMaterial({color:accent}));
    floating.push(orb);
  }
  // Entrance staging
  world.scale.setScalar(.88);
  gsap.to(world.scale,{x:1,y:1,z:1,duration:1.25,ease:'power3.out'});
  people.forEach((p,i)=>{p.rig.position.y=-.25;gsap.to(p.rig.position,{y:0,duration:1.1,delay:.2+i*.12,ease:'back.out(1.5)'});});
  gsap.to(camera.position,{x:index===0?-.4:0,y:3.05,z:11.6,duration:1.3,ease:'power2.inOut'});
  gsap.to(camera.rotation,{x:-.055,y:index===8?0.04:0,z:0,duration:1.3,ease:'power2.inOut'});
  gsap.to(pinkLight.position,{x:index%2? -3:3,y:3+index*.05,duration:1.8,ease:'sine.inOut'});
}
function render() {
  requestAnimationFrame(render);
  const t=performance.now()*.001;
  people.forEach((p,i)=>{if(p){p.rig.position.y+=Math.sin(t*1.4+i)*.0009;p.rig.rotation.y=Math.sin(t*.6+i)*.035;}});
  floating.forEach((o,i)=>{if(o){o.position.y+=Math.sin(t*1.1+i*.7)*.0012;o.rotation.y+=.0015;}});
  if(stars) stars.rotation.y=Math.sin(t*.05)*.025;
  renderer.render(scene,camera);
}
render();

const els={
  count:document.querySelector('#chapter-count'), number:document.querySelector('#chapter-number'),
  title:document.querySelector('#chapter-title'), kicker:document.querySelector('#chapter-kicker'),
  copy:document.querySelector('#story-copy'), side:document.querySelector('#side-note'),
  footer:document.querySelector('#footer-chapter'), progress:document.querySelector('#progress-fill'),
  progressLabel:document.querySelector('#progress-label'), previous:document.querySelector('#previous'),
  next:document.querySelector('#next'), dots:document.querySelector('#chapter-dots'),
  wash:document.querySelector('#transition-wash'), finale:document.querySelector('#finale')
};
function renderDots(){
  els.dots.innerHTML='';
  chapters.forEach((c,i)=>{
    const b=document.createElement('button');b.className='chapter-dot'+(i===chapterIndex?' active':'');
    b.setAttribute('aria-label',`Go to chapter ${i+1}: ${c.title}`);b.title=`${i+1}. ${c.title}`;
    b.addEventListener('click',()=>goTo(i));els.dots.appendChild(b);
  });
}
function renderChapter(){
  const c=chapters[chapterIndex], n=chapterIndex+1;
  els.count.textContent=`${String(n).padStart(2,'0')} / 09`;
  els.number.textContent=`CHAPTER ${String(n).padStart(2,'0')}`;
  els.title.innerHTML=`${c.title} <span>${c.emoji}</span>`;
  els.kicker.textContent=c.kicker;els.side.textContent=c.side;els.footer.textContent=c.footer;
  els.progress.style.width=`${n/9*100}%`;els.progressLabel.textContent=`${String(n).padStart(2,'0')} — 09`;
  els.previous.disabled=n===1;els.next.innerHTML=n===9?'<span>Read the ending</span> <span>♡</span>':'<span>Next chapter</span> <span>→</span>';
  els.copy.innerHTML='';
  c.paragraphs.forEach((p,i)=>{
    const el=document.createElement('p');el.textContent=p;
    if(p.includes('I LOVE YOU')||p.includes('YES. A thousand')||p.includes('In every lifetime')||p.includes('Our Little Forever'))el.classList.add('highlight-line');
    els.copy.appendChild(el);
  });
  renderDots();
}
let transitioning=false;
function goTo(next){
  if(transitioning||next<0||next>8||next===chapterIndex)return;
  transitioning=true;
  const old=chapterIndex;
  gsap.timeline({onComplete:()=>{transitioning=false;}})
    .to(els.copy,{opacity:0,y:12,duration:.22})
    .to(els.wash,{opacity:1,duration:.3},'<')
    .add(()=>{chapterIndex=next;buildChapter(next);renderChapter();els.copy.scrollTop=0;})
    .to(els.wash,{opacity:0,duration:.7,ease:'power2.out'})
    .fromTo('.story-panel > *',{y:12,opacity:0},{y:0,opacity:1,duration:.55,stagger:.045,ease:'power2.out'},'<.05');
  if(next===8){setTimeout(()=>{els.finale.classList.add('visible');els.finale.setAttribute('aria-hidden','false');},1400);}
  else {els.finale.classList.remove('visible');els.finale.setAttribute('aria-hidden','true');}
}
document.querySelector('#previous').addEventListener('click',()=>goTo(chapterIndex-1));
document.querySelector('#next').addEventListener('click',()=>{if(chapterIndex===8){els.finale.classList.add('visible');}else goTo(chapterIndex+1);});
document.querySelector('#replay').addEventListener('click',()=>{els.finale.classList.remove('visible');goTo(0);});
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')goTo(Math.min(8,chapterIndex+1));if(e.key==='ArrowLeft')goTo(Math.max(0,chapterIndex-1));if(e.key==='Escape')els.finale.classList.remove('visible');});

let audioCtx=null, oscillator=null, gain=null, soundOn=false;
const soundButton=document.querySelector('#sound-toggle');
soundButton.addEventListener('click',()=>{
  soundOn=!soundOn;
  if(soundOn){
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
    oscillator=audioCtx.createOscillator();gain=audioCtx.createGain();
    oscillator.type='sine';oscillator.frequency.value=174.61;gain.gain.value=.018;
    oscillator.connect(gain);gain.connect(audioCtx.destination);oscillator.start();
    soundButton.innerHTML='♫ <span>Sound on</span>';soundButton.classList.add('playing');
  }else{
    if(gain)gain.gain.setTargetAtTime(0,audioCtx.currentTime,.08);
    if(oscillator){oscillator.stop(audioCtx.currentTime+.35);oscillator=null;}
    soundButton.innerHTML='♫ <span>Sound off</span>';soundButton.classList.remove('playing');
  }
});
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
});
buildChapter(0);renderChapter();
