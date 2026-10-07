(function () {
  "use strict";

  const C = {
    ink: [0.067, 0.075, 0.082], paper: [0.945, 0.953, 0.937], sky: [0.686, 0.796, 0.855],
    sand: [0.608, 0.506, 0.439], magenta: [0.769, 0.078, 0.404], green: [0.247, 0.651, 0.416],
    amber: [0.878, 0.635, 0.18], denim: [0.52, 0.65, 0.72], skin: [0.78, 0.52, 0.40], white: [0.98, 0.98, 0.95], gold: [0.78, 0.60, 0.22]
  };
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };

  function m4Identity() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function m4Multiply(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function m4Translate(x, y, z) { const m = m4Identity(); m[12] = x; m[13] = y; m[14] = z; return m; }
  function m4Scale(x, y, z) { const m = m4Identity(); m[0] = x; m[5] = y; m[10] = z; return m; }
  function m4RotateX(a) { const c=Math.cos(a),s=Math.sin(a),m=m4Identity(); m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m; }
  function m4RotateY(a) { const c=Math.cos(a),s=Math.sin(a),m=m4Identity(); m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m; }
  function m4RotateZ(a) { const c=Math.cos(a),s=Math.sin(a),m=m4Identity(); m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m; }
  function trs(x,y,z,sx,sy,sz,rx=0,ry=0,rz=0) {
    return m4Multiply(m4Translate(x,y,z), m4Multiply(m4RotateZ(rz), m4Multiply(m4RotateY(ry), m4Multiply(m4RotateX(rx), m4Scale(sx,sy,sz)))));
  }
  function perspective(fov, aspect, near, far) {
    const f=1/Math.tan(fov/2), nf=1/(near-far), m=new Float32Array(16);
    m[0]=f/aspect;m[5]=f;m[10]=(far+near)*nf;m[11]=-1;m[14]=2*far*near*nf;return m;
  }
  function lookAt(e, t, up) {
    let zx=e[0]-t[0],zy=e[1]-t[1],zz=e[2]-t[2],l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;
    let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx;l=Math.hypot(xx,xy,xz);xx/=l;xy/=l;xz/=l;
    const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
    return new Float32Array([xx,yx,zx,0, xy,yy,zy,0, xz,yz,zz,0, -(xx*e[0]+xy*e[1]+xz*e[2]),-(yx*e[0]+yy*e[1]+yz*e[2]),-(zx*e[0]+zy*e[1]+zz*e[2]),1]);
  }

  function cubeData() {
    const p=[], n=[], idx=[];
    const faces=[[[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[[1,0,0],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,0,0],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[[0,1,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[0,-1,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]];
    faces.forEach((f,fi)=>{ const base=fi*4; for(let i=1;i<5;i++){p.push(...f[i]);n.push(...f[0]);} idx.push(base,base+1,base+2,base,base+2,base+3); });
    return {p,n,idx};
  }
  function sphereData(lat=8, lon=12) {
    const p=[],n=[],idx=[];
    for(let y=0;y<=lat;y++){const v=y/lat,ph=v*Math.PI;for(let x=0;x<=lon;x++){const u=x/lon,th=u*Math.PI*2,s=Math.sin(ph);const q=[Math.cos(th)*s,Math.cos(ph),Math.sin(th)*s];p.push(...q);n.push(...q);}}
    for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){const a=y*(lon+1)+x,b=a+lon+1;idx.push(a,b,a+1,b,b+1,a+1);}return {p,n,idx};
  }
  function cylinderData(sides=12) {
    const p=[],n=[],idx=[];
    for(let y=0;y<2;y++)for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,x=Math.cos(a),z=Math.sin(a);p.push(x,y*2-1,z);n.push(x,0,z);}
    for(let i=0;i<sides;i++){const a=i,b=i+sides+1;idx.push(a,b,a+1,b,b+1,a+1);}return {p,n,idx};
  }
  function quadData() {
    return {
      p: [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0],
      uv: [0,1, 1,1, 1,0, 0,0],
      idx: [0,1,2, 0,2,3]
    };
  }

  class SignalWorld {
    constructor(canvas, opts={}) {
      this.canvas=canvas; this.reduced=!!opts.reduced; this.mobile=innerWidth<760; this.dprCap=this.mobile?1.25:1.5;
      this.progress=0;this.scene="systems";this.local=0;this.trackProgress=0;this.direction=0;this.lastMotionAt=0;this.quality="high";this.running=false;this.frames=[];this.time=0;this.viewAspect=1;this.raf=0;this.destroyed=false;
      const attrs={alpha:false,antialias:!this.mobile,powerPreference:"high-performance",preserveDrawingBuffer:false};
      this.gl=canvas.getContext("webgl",attrs) || canvas.getContext("experimental-webgl",attrs);
      if(!this.gl) throw new Error("WebGL unavailable");
      this.init(); this.resize();
      this.onContextLost=e=>{e.preventDefault();this.running=false;document.body.classList.add("no-webgl");window.dispatchEvent(new CustomEvent("stella:webgl",{detail:"lost"}));};
      this.onContextRestored=()=>location.reload();
      this.onResize=()=>this.resize();
      canvas.addEventListener("webglcontextlost",this.onContextLost);
      canvas.addEventListener("webglcontextrestored",this.onContextRestored);
      addEventListener("resize",this.onResize,{passive:true});
    }
    compile(type, source){const gl=this.gl,s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
    init(){
      const gl=this.gl;
      const vs=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uViewProj;varying vec3 vNormal;varying vec3 vWorld;void main(){vec4 w=uModel*vec4(aPosition,1.0);vWorld=w.xyz;vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uViewProj*w;}`;
      const fs=`precision mediump float;uniform vec3 uColor;uniform vec3 uLight;uniform vec3 uFog;varying vec3 vNormal;varying vec3 vWorld;void main(){float d=max(dot(normalize(vNormal),normalize(uLight)),0.0);float rim=pow(1.0-max(dot(normalize(vNormal),vec3(0.0,0.0,1.0)),0.0),2.0);vec3 c=uColor*(0.34+0.66*d)+rim*0.08;float fog=smoothstep(10.0,22.0,length(vWorld));gl_FragColor=vec4(mix(c,uFog,fog),1.0);}`;
      this.program=gl.createProgram();gl.attachShader(this.program,this.compile(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,this.compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
      this.loc={pos:gl.getAttribLocation(this.program,"aPosition"),normal:gl.getAttribLocation(this.program,"aNormal"),model:gl.getUniformLocation(this.program,"uModel"),vp:gl.getUniformLocation(this.program,"uViewProj"),color:gl.getUniformLocation(this.program,"uColor"),light:gl.getUniformLocation(this.program,"uLight"),fog:gl.getUniformLocation(this.program,"uFog")};
      this.meshes={cube:this.makeMesh(cubeData()),sphere:this.makeMesh(sphereData(this.mobile?6:9,this.mobile?8:14)),cylinder:this.makeMesh(cylinderData(this.mobile?8:12))};
      const spriteVs=`attribute vec3 aPosition;attribute vec2 aUv;uniform mat4 uModel;uniform mat4 uViewProj;varying vec2 vUv;void main(){vUv=aUv;gl_Position=uViewProj*uModel*vec4(aPosition,1.0);}`;
      const spriteFs=`precision mediump float;uniform sampler2D uTexture;uniform float uAlpha;varying vec2 vUv;void main(){vec4 tex=texture2D(uTexture,vUv);float a=tex.a*uAlpha;if(a<0.015)discard;gl_FragColor=vec4(tex.rgb,a);}`;
      this.spriteProgram=gl.createProgram();gl.attachShader(this.spriteProgram,this.compile(gl.VERTEX_SHADER,spriteVs));gl.attachShader(this.spriteProgram,this.compile(gl.FRAGMENT_SHADER,spriteFs));gl.linkProgram(this.spriteProgram);if(!gl.getProgramParameter(this.spriteProgram,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.spriteProgram));
      this.spriteLoc={pos:gl.getAttribLocation(this.spriteProgram,"aPosition"),uv:gl.getAttribLocation(this.spriteProgram,"aUv"),model:gl.getUniformLocation(this.spriteProgram,"uModel"),vp:gl.getUniformLocation(this.spriteProgram,"uViewProj"),texture:gl.getUniformLocation(this.spriteProgram,"uTexture"),alpha:gl.getUniformLocation(this.spriteProgram,"uAlpha")};
      this.spriteMesh=this.makeSpriteMesh(quadData());
      // A small lazy texture cache keeps the 75-pose high-resolution set bounded.
      this.poseCache=new Map();this.poseSerial=0;this.characterFrame=1;
      this.getPose(1);
      gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    }
    makeMesh(data){const gl=this.gl,m={count:data.idx.length};m.pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.p),gl.STATIC_DRAW);m.nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.n),gl.STATIC_DRAW);m.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(data.idx),gl.STATIC_DRAW);return m;}
    makeSpriteMesh(data){const gl=this.gl,m={count:data.idx.length};m.pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.p),gl.STATIC_DRAW);m.ub=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.ub);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.uv),gl.STATIC_DRAW);m.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(data.idx),gl.STATIC_DRAW);return m;}
    getPose(frame){
      const gl=this.gl;
      if(this.poseCache.has(frame)){const item=this.poseCache.get(frame);item.used=++this.poseSerial;return item;}
      const texture=gl.createTexture(),item={texture,ready:false,used:++this.poseSerial};
      this.poseCache.set(frame,item);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      const image=new Image();image.onload=()=>{
        if(this.poseCache.get(frame)!==item)return;
        gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);item.ready=true;
        // Reduced motion renders on demand, including asynchronous texture arrivals.
        if(this.reduced)this.render(performance.now());
      };
      image.onerror=()=>{
        if(this.poseCache.get(frame)===item){gl.deleteTexture(texture);this.poseCache.delete(frame);}
        window.dispatchEvent(new CustomEvent("stella:avatar-error",{detail:{frame}}));
      };
      image.src=`assets/avatar/frames/frame-${String(frame).padStart(3,"0")}.webp`;
      if(this.poseCache.size>6){
        const oldest=[...this.poseCache.entries()].filter(([key])=>key!==frame).sort((a,b)=>a[1].used-b[1].used)[0];
        gl.deleteTexture(oldest[1].texture);this.poseCache.delete(oldest[0]);
      }
      return item;
    }
    resize(){const dpr=Math.min(devicePixelRatio||1,this.dprCap),w=Math.max(1,Math.floor(innerWidth*dpr)),h=Math.max(1,Math.floor(innerHeight*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.mobile=innerWidth<760;}
    setState(s){const next=s.progress??this.progress,nextTrack=s.characterTrack??next;if(Math.abs(nextTrack-this.trackProgress)>.00001)this.lastMotionAt=performance.now();this.progress=next;this.scene=s.scene;this.local=s.local;this.trackProgress=nextTrack;this.direction=s.direction??0;if(this.reduced)this.render(performance.now());}
    draw(meshName,model,color){const gl=this.gl,m=this.meshes[meshName];gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.vertexAttribPointer(this.loc.pos,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(this.loc.pos);gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.vertexAttribPointer(this.loc.normal,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(this.loc.normal);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.uniformMatrix4fv(this.loc.model,false,model);gl.uniform3fv(this.loc.color,color);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);}
    slat(x,y,z,w=.8,h=.09,d=.18,color=C.ink,rx=0,ry=0,rz=0){this.draw("cube",trs(x,y,z,w,h,d,rx,ry,rz),color);}
    ball(x,y,z,r,color){this.draw("sphere",trs(x,y,z,r,r,r),color);}
    drawSprite(index,x,bottom,z,height,alpha,flip=false){
      if(alpha<=.01)return;
      const gl=this.gl,m=this.spriteMesh,width=height*(3/4)*(flip?-1:1);
      gl.useProgram(this.spriteProgram);gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.vertexAttribPointer(this.spriteLoc.pos,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(this.spriteLoc.pos);gl.bindBuffer(gl.ARRAY_BUFFER,m.ub);gl.vertexAttribPointer(this.spriteLoc.uv,2,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(this.spriteLoc.uv);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.uniformMatrix4fv(this.spriteLoc.model,false,trs(x,bottom+height*.5,z,width*.5,height*.5,1));gl.uniformMatrix4fv(this.spriteLoc.vp,false,this.viewProjection);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.getPose(index).texture);gl.uniform1i(this.spriteLoc.texture,0);gl.uniform1f(this.spriteLoc.alpha,alpha);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);gl.depthMask(true);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);gl.useProgram(this.program);
    }
    poseFrame(now=performance.now()){
      if(this.reduced){const stills={systems:54,scale:44,experiments:68,transfer:61,leadership:61,contact:75};return stills[this.scene]||1;}
      if(this.direction!==0&&now-this.lastMotionAt<150){
        const phase=this.direction>0?Math.floor(this.progress*144)%12:Math.floor((1-this.progress)*144)%12;
        return (this.direction>0?6:18)+phase;
      }
      // Once travel settles, each chapter plays one authored incremental gesture.
      const routes={
        systems:[[0,45],[.42,54],[.70,54],[1,45]],
        scale:[[0,35],[.42,44],[.70,44],[1,35]],
        experiments:[[0,62],[.62,68],[1,68]],
        transfer:[[0,55],[.68,61],[1,61]],
        leadership:[[0,55],[.52,61],[.72,61],[1,55]],
        contact:[[0,69],[.72,75],[1,75]]
      };
      const keys=routes[this.scene]||routes.systems,p=clamp(this.local);
      for(let i=1;i<keys.length;i++)if(p<=keys[i][0]){
        const [a,fa]=keys[i-1],[b,fb]=keys[i];return Math.round(mix(fa,fb,(p-a)/(b-a)));
      }
      return keys[keys.length-1][1];
    }
    avatar(){
      const requested=this.poseFrame(),item=this.getPose(requested);
      // Keep the previous ready pose while the requested frame loads (no blank flashes).
      if(item.ready)this.characterFrame=requested;
      const shown=this.poseCache.get(this.characterFrame);
      if(!shown?.ready)return;
      const edge=this.mobile?Math.max(.92,Math.min(1.48,4.45*this.viewAspect-.58)):Math.max(1.38,Math.min(3.28,3.35*this.viewAspect-.72));
      const height=this.mobile?2.55:3.45,bottom=this.mobile?-1.68:-1.74;
      const x=mix(-edge,edge,clamp(this.trackProgress));
      this.drawSprite(this.characterFrame,x,bottom,.30,height,1,false);
    }
    drawGround(color){for(let i=0;i<13;i++)this.slat((i-6)*1.1,-1.52,-.65+(i%3)*.28,.48,.035,2.3,color,0,.02*(i-6),0);}
    sceneScale(p){
      const t=smooth(.48,.82,p);this.drawGround(C.sand);
      const count=this.quality==="low"?18:32;
      for(let i=0;i<count;i++){const row=i%8,col=Math.floor(i/8),x0=-5+row*1.4,y0=-.9+col*.34,z0=-1.2-col*.45;const x=mix(x0,2.55+(row%2)*.18,t),y=mix(y0,-.35+row*.10,t),z=mix(z0,-.4+col*.12,t);this.slat(x,y,z,mix(.55,.32,t),.055,.35,i%7===0?C.magenta:C.ink,0,0,mix(.02*(i-4),0,t));}
      this.avatar();
      if(p>.62)this.slat(2.9,-.05,-.35,.48,.48,.48,C.magenta,0,p*1.3,0);
    }
    sceneSystems(p){
      const t=smooth(.32,.72,p);this.drawGround(C.paper);
      for(let i=0;i<18;i++){const x=-4.5+i*.53,yA=-.7+Math.sin(i*1.7)*.7,zA=-.9+Math.cos(i)*.45;const xB=-4.5+i*.53,yB=-.7+(i%3)*.32,zB=-.8;this.slat(mix(x,xB,t),mix(yA,yB,t),mix(zA,zB,t),.24,.055,.28,i<12?C.sky:C.green,0,0,mix(Math.sin(i)*.7,0,t));}
      if(p>.70)for(let i=0;i<5;i++)this.slat(-2+i*1.0,.55,-.6,.38,.14,.35,i===3?C.magenta:C.paper);
      this.avatar();
    }
    sceneExperiments(p){
      this.drawGround(C.sand);const stage=Math.min(2,Math.floor(p*3));
      for(let g=0;g<3;g++){const gx=-3.1+g*3.1,unstable=g*.24;this.slat(gx,-.35,-.7,1.05,.05,1.2,g===stage?C.magenta:C.ink,0,.15,0);const count=this.quality==="low"?8:16;for(let i=0;i<count;i++){const a=i*2.4+g,rad=.25+(i%4)*.14+unstable*Math.sin(i*3);this.ball(gx+Math.cos(a)*rad,-.1+(i%5)*.17+unstable*(i%2),-.1+Math.sin(a)*rad,.045,g===2&&i%4===0?C.amber:C.sky);}}
      this.avatar();
    }
    sceneTransfer(p){
      this.drawGround(C.ink);const phase=Math.min(2,Math.floor(p*3));
      if(phase===0){for(let i=0;i<9;i++)this.slat(-3.6+i*.8,-.8+(i%3)*.34,-.7,.32,.22,.03,i%3===0?C.magenta:C.paper,0,.2,0);for(let i=0;i<7;i++)this.ball(-1.5+i*.52,.7+Math.sin(i)*.2,-.5,.06,C.sky);}
      if(phase===1){for(let i=0;i<15;i++){this.slat(-4+i*.56,-.55+(i%4)*.23,-.7,.23,.055,.25,i%5===0?C.green:C.sky,0,0,.06*Math.sin(i));}this.slat(2.8,.25,-.5,.55,.55,.55,C.magenta,0,p*2,0);}
      if(phase===2){for(let i=0;i<12;i++){const col=i%4,row=Math.floor(i/4);const swap=(i===5||i===6)?Math.sin(p*18)*.10:0;this.slat(-2.2+col*1.25+swap,-.7+row*.62,-.55,.48,.12,.4,i===5?C.magenta:C.paper,0,0,(col-row)*.03);}}
      this.avatar();
    }
    sceneLeadership(p){
      this.drawGround(C.sky);
      const count=this.quality==="low"?6:8,points=[];
      // A sequential call-and-response: contributions enter from alternating
      // sides, settle into a rising shared path, then light the next handoff.
      for(let i=0;i<count;i++){
        const enter=smooth(i*.075,i*.075+.20,p),xTarget=-3.15+i*(6.3/(count-1)),yTarget=-.72+i*.18;
        const x=mix(i%2 ? -4.6 : 4.6,xTarget,enter),y=mix(i%2 ? .92 : -1.18,yTarget,enter),z=-.92+(i%3)*.08;
        const color=i===count-1?C.magenta:i%3===0?C.green:i%2?C.paper:C.ink;
        this.slat(x,y,z,.30+i*.018,.09,.22,color,0,0,mix(i%2 ? -.45 : .45,0,enter));
        points.push([xTarget,yTarget,z]);
        if(i>0&&p>i*.075+.18){const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);this.slat((a[0]+b[0])*.5,(a[1]+b[1])*.5,-1.04,len*.5,.018,.025,i===count-1?C.magenta:C.sand,0,0,Math.atan2(dy,dx));}
        const pulse=smooth(i*.075+.12,i*.075+.23,p)-smooth(i*.075+.25,i*.075+.38,p);
        if(pulse>.01)this.ball(xTarget,yTarget+.22,-.82,.055+.07*pulse,i===count-1?C.magenta:C.amber);
      }
      this.avatar();
    }
    sceneContact(p){this.drawGround(C.paper);this.slat(-3.8,-.42,-.5,4.1,.035,.10,C.magenta);this.avatar();}
    render(now){
      const gl=this.gl,start=performance.now();this.time=now*.001;this.resize();
      const bg=this.scene==="systems"||this.scene==="transfer"?C.ink:this.scene==="leadership"?C.sky:C.paper;
      gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
      const aspect=this.canvas.width/this.canvas.height,eye=this.mobile?[0,1.0,12.8]:[0,1.0,10.8],target=this.mobile?[0,.5,0]:[0,.45,0];this.viewAspect=aspect;
      this.viewProjection=m4Multiply(perspective(this.mobile?.70:.62,aspect,.1,40),lookAt(eye,target,[0,1,0]));gl.uniformMatrix4fv(this.loc.vp,false,this.viewProjection);gl.uniform3fv(this.loc.light,new Float32Array([-.45,.85,.65]));gl.uniform3fv(this.loc.fog,bg);
      this.avatar();
      const dt=performance.now()-start;if(!this.reduced){this.frames.push(dt);if(this.frames.length>90)this.frames.shift();if(this.frames.length===90&&this.frames.reduce((a,b)=>a+b,0)/90>22)this.quality="low";}
    }
    start(){if(this.running||this.reduced||this.destroyed)return;this.running=true;const loop=(t)=>{if(!this.running)return;this.render(t);this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);}
    stop(){this.running=false;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;}
    destroy(){
      if(this.destroyed)return;this.destroyed=true;this.stop();
      removeEventListener("resize",this.onResize);
      this.canvas.removeEventListener("webglcontextlost",this.onContextLost);
      this.canvas.removeEventListener("webglcontextrestored",this.onContextRestored);
      const gl=this.gl;
      this.poseCache.forEach(item=>gl.deleteTexture(item.texture));this.poseCache.clear();
      Object.values(this.meshes).forEach(mesh=>{gl.deleteBuffer(mesh.pb);gl.deleteBuffer(mesh.nb);gl.deleteBuffer(mesh.ib);});
      gl.deleteBuffer(this.spriteMesh.pb);gl.deleteBuffer(this.spriteMesh.ub);gl.deleteBuffer(this.spriteMesh.ib);
      gl.deleteProgram(this.program);gl.deleteProgram(this.spriteProgram);
    }
    status(){return {scene:this.scene,local:this.local,quality:this.quality,webgl:"active",character:"75-frame-bottom-stage",characterFrame:this.characterFrame,trackProgress:this.trackProgress,direction:this.direction,textureCount:this.poseCache.size,mobilePerch:this.mobile};}
  }
  window.SignalWorld=SignalWorld;
})();
