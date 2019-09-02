!function(t){var i={};function e(h){if(i[h])return i[h].exports;var s=i[h]={i:h,l:!1,exports:{}};return t[h].call(s.exports,s,s.exports,e),s.l=!0,s.exports}e.m=t,e.c=i,e.d=function(t,i,h){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:h})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var h=Object.create(null);if(e.r(h),Object.defineProperty(h,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var s in t)e.d(h,s,function(i){return t[i]}.bind(null,s));return h},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=0)}([function(t,i,e){"use strict";e.r(i);let h,s,n={};function r(t,...i){n[t]&&n[t].map(t=>t(...i))}function o(){return h}function a(){return s}function c(t){if(!(h=document.getElementById(t)||t||document.querySelector("canvas")))throw Error("You must provide a canvas element for the game");return(s=h.getContext("2d")).imageSmoothingEnabled=!1,r("init"),{canvas:h,context:s}}class l{constructor({spriteSheet:t,frames:i,frameRate:e,loop:h=!0}={}){this.spriteSheet=t,this.frames=i,this.frameRate=e,this.loop=h;let{width:s,height:n,margin:r=0}=t.frame;this.width=s,this.height=n,this.margin=r,this._f=0,this._a=0}clone(){return d(this)}reset(){this._f=0,this._a=0}update(t=1/60){if(this.loop||this._f!=this.frames.length-1)for(this._a+=t;this._a*this.frameRate>=1;)this._f=++this._f%this.frames.length,this._a-=1/this.frameRate}render({x:t,y:i,width:e=this.width,height:h=this.height,context:s=a()}={}){let n=this.frames[this._f]/this.spriteSheet._f|0,r=this.frames[this._f]%this.spriteSheet._f|0;s.drawImage(this.spriteSheet.image,r*this.width+(2*r+1)*this.margin,n*this.height+(2*n+1)*this.margin,this.width,this.height,t,i,e,h)}}function d(t){return new l(t)}d.prototype=l.prototype,d.class=l;new WeakMap;const u=()=>{};function f(){let t=o();a().clearRect(0,0,t.width,t.height)}function p({fps:t=60,clearCanvas:i=!0,update:e,render:h}={}){if(!e||!h)throw Error("You must provide update() and render() functions");let s,n,o,a,c,l=0,d=1e3/t,p=1/t,g=i?f:u;function y(){if(n=requestAnimationFrame(y),o=performance.now(),a=o-s,s=o,!(a>1e3)){for(r("tick"),l+=a;l>=d;)c.update(p),l-=d;g(),c.render()}}return c={update:e,render:h,isStopped:!0,start(){s=performance.now(),this.isStopped=!1,requestAnimationFrame(y)},stop(){this.isStopped=!0,cancelAnimationFrame(n)},_frame:y,set _last(t){s=t}}}let g={},y={},x={13:"enter",27:"esc",32:"space",37:"left",38:"up",39:"right",40:"down"};function m(t){let i=x[t.which];y[i]=!0,g[i]&&g[i](t)}function _(t){y[x[t.which]]=!1}function w(){y={}}function b(){let t;for(t=0;t<26;t++)x[65+t]=(10+t).toString(36);for(t=0;t<10;t++)x[48+t]=""+t;window.addEventListener("keydown",m),window.addEventListener("keyup",_),window.addEventListener("blur",w)}function v(t){return!!y[t]}class A{constructor({create:t,maxSize:i=1024}={}){let e;if(!t||!(e=t())||!(e.update&&e.init&&e.isAlive))throw Error("Must provide create() function which returns an object with init(), update(), and isAlive() functions");this._c=t,this._i=0,this.objects=[t()],this.size=1,this.maxSize=i}get(t={}){if(this.objects.length==this._i){if(this.size===this.maxSize)return;for(let t=0;t<this.size&&this.objects.length<this.maxSize;t++)this.objects.unshift(this._c());this.size=this.objects.length}let i=this.objects.shift();return i.init(t),this.objects.push(i),this._i++,i}getAliveObjects(){return this.objects.slice(this.objects.length-this._i)}clear(){this._i=this.objects.length=0,this.size=1,this.objects.push(this._c())}update(t){let i,e=this.size-1,h=Math.max(this.objects.length-this._i,0);for(;e>=h;)(i=this.objects[e]).update(t),i.isAlive()?e--:(this.objects=this.objects.splice(e,1).concat(this.objects),this._i--,h++)}render(){let t=Math.max(this.objects.length-this._i,0);for(let i=this.size-1;i>=t;i--)this.objects[i].render()}}function j(t){return new A(t)}function S(t,i){let e=[],h=i.x+i.width/2,s=i.y+i.height/2,n=t.y<s&&t.y+t.height>=i.y,r=t.y+t.height>=s&&t.y<i.y+i.height;return t.x<h&&t.x+t.width>=i.x&&(n&&e.push(0),r&&e.push(2)),t.x+t.width>=h&&t.x<i.x+i.width&&(n&&e.push(1),r&&e.push(3)),e}j.prototype=A.prototype,j.class=A;class E{constructor({maxDepth:t=3,maxObjects:i=25,bounds:e}={}){this.maxDepth=t,this.maxObjects=i;let h=o();this.bounds=e||{x:0,y:0,width:h.width,height:h.height},this._b=!1,this._d=0,this._o=[],this._s=[],this._p=null}clear(){this._s.map(function(t){t.clear()}),this._b=!1,this._o.length=0}get(t){let i,e,h=new Set;for(;this._s.length&&this._b;){for(i=S(t,this.bounds),e=0;e<i.length;e++)this._s[i[e]].get(t).forEach(t=>h.add(t));return Array.from(h)}return this._o.filter(i=>i!==t)}add(){let t,i,e,h;for(i=0;i<arguments.length;i++)if(e=arguments[i],Array.isArray(e))this.add.apply(this,e);else if(this._b)this._a(e);else if(this._o.push(e),this._o.length>this.maxObjects&&this._d<this.maxDepth){for(this._sp(),t=0;h=this._o[t];t++)this._a(h);this._o.length=0}}_a(t,i,e){for(i=S(t,this.bounds),e=0;e<i.length;e++)this._s[i[e]].add(t)}_sp(t,i,e){if(this._b=!0,!this._s.length)for(t=this.bounds.width/2|0,i=this.bounds.height/2|0,e=0;e<4;e++)this._s[e]=M({bounds:{x:this.bounds.x+(e%2==1?t:0),y:this.bounds.y+(e>=2?i:0),width:t,height:i},maxDepth:this.maxDepth,maxObjects:this.maxObjects}),this._s[e]._d=this._d+1,this._s[e]._p=this}}function M(t){return new E(t)}M.prototype=E.prototype,M.class=E;class O{constructor(t=0,i=0){this._x=t,this._y=i}add(t,i=1){return C(this.x+(t.x||0)*i,this.y+(t.y||0)*i,this)}clamp(t,i,e,h){this._c=!0,this._a=t,this._b=i,this._d=e,this._e=h}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?Math.min(Math.max(this._a,t),this._d):t}set y(t){this._y=this._c?Math.min(Math.max(this._b,t),this._e):t}}function C(t,i,e={}){let h=new O(t,i);return e._c&&(h.clamp(e._a,e._b,e._d,e._e),h.x=t,h.y=i),h}C.prototype=O.prototype,C.class=O;class P{constructor(t){this.init(t)}init(t={}){let{x:i,y:e,dx:h,dy:s,ddx:n,ddy:r,width:o,height:c,image:l}=t;this.position=C(i,e),this.velocity=C(h,s),this.acceleration=C(n,r),this.width=this.height=this.rotation=0,this.ttl=1/0,this.anchor={x:0,y:0},this.context=a();for(let i in t)this[i]=t[i];l&&(this.width=void 0!==o?o:l.width,this.height=void 0!==c?c:l.height),this.sx=0,this.sy=0}get x(){return this.position.x}get y(){return this.position.y}get dx(){return this.velocity.x}get dy(){return this.velocity.y}get ddx(){return this.acceleration.x}get ddy(){return this.acceleration.y}get animations(){return this._a}get viewX(){return this.x-this.sx}get viewY(){return this.y-this.sy}set x(t){this.position.x=t}set y(t){this.position.y=t}set dx(t){this.velocity.x=t}set dy(t){this.velocity.y=t}set ddx(t){this.acceleration.x=t}set ddy(t){this.acceleration.y=t}set animations(t){let i,e;for(i in this._a={},t)this._a[i]=t[i].clone(),e=e||this._a[i];this.currentAnimation=e,this.width=this.width||e.width,this.height=this.height||e.height}set viewX(t){}set viewY(t){}isAlive(){return this.ttl>0}collidesWith(t){if(this.rotation||t.rotation)return null;let i=this.x-this.width*this.anchor.x,e=this.y-this.height*this.anchor.y,h=t.x,s=t.y;return t.anchor&&(h-=t.width*t.anchor.x,s-=t.height*t.anchor.y),i<h+t.width&&i+this.width>h&&e<s+t.height&&e+this.height>s}update(t){this.advance(t)}render(){this.draw()}playAnimation(t){this.currentAnimation=this.animations[t],this.currentAnimation.loop||this.currentAnimation.reset()}advance(t){this.velocity=this.velocity.add(this.acceleration,t),this.position=this.position.add(this.velocity,t),this.ttl--,this.currentAnimation&&this.currentAnimation.update(t)}draw(){let t=-this.width*this.anchor.x,i=-this.height*this.anchor.y;this.context.save(),this.context.translate(this.viewX,this.viewY),this.width<0&&this.context.scale(-1,1),this.rotation&&this.context.rotate(this.rotation),this.image?this.context.drawImage(this.image,0,0,this.image.width,this.image.height,t,i,this.width,this.height):this.currentAnimation?this.currentAnimation.render({x:t,y:i,width:this.width,height:this.height,context:this.context}):(this.context.fillStyle=this.color,this.context.fillRect(t,i,this.width,this.height)),this.context.restore()}}function $(t){return new P(t)}function W(t){if(+t===t)return t;let i=[],e=t.split(".."),h=+e[0],s=+e[1],n=h;if(h<s)for(;n<=s;n++)i.push(n);else for(;n>=s;n--)i.push(n);return i}$.prototype=P.prototype,$.class=P;class z{constructor({image:t,frameWidth:i,frameHeight:e,frameMargin:h,animations:s}={}){if(!t)throw Error("You must provide an Image for the SpriteSheet");this.animations={},this.image=t,this.frame={width:i,height:e,margin:h},this._f=t.width/i|0,this.createAnimations(s)}createAnimations(t){let i,e;for(e in t){let{frames:h,frameRate:s,loop:n}=t[e];if(i=[],void 0===h)throw Error("Animation "+e+" must provide a frames property");[].concat(h).map(t=>{i=i.concat(W(t))}),this.animations[e]=d({spriteSheet:this,frames:i,frameRate:s,loop:n})}}}function I(t){return new z(t)}I.prototype=z.prototype,I.class=z;const R=document.getElementById("game");R.width=R.parentElement.clientWidth,R.height=R.parentElement.clientHeight,c("game"),b();const k=60,H=R.width,L=.8*R.height,Y=H/16,X=2*Y,D=H/100,F=H/64,T=F,q="rgba(255, 255, 255, 1)",B=H/4,G=.5,N=H/4,K=.2,J=H/32,Q=J/2,U="rgba(255, 255, 255, 1)",V=H/3,Z=.3,tt=.75*Y,it=.75*X,et="rgba(230, 230, 230, 1)",ht=H/200,st=H/40;let nt=!1,rt=0,ot=0,at=0,ct=0,lt=110,dt=200;const ut=$({anchor:{x:.5,y:1},x:H/4*3,y:L,dy:-1,width:Y,height:X,color:"rgba(PLAYER_HP, PLAYER_HP, PLAYER_HP, 1)",collidesWith:At,hp:255}),ft=j({create:$});let pt=3,gt=.1,yt=2;const xt=j({create:$});let mt=1,_t=5;const wt=j({create:$}),bt=j({create:$}),vt={grenadeCount:null,mineCount:null,killCount:null};function At(t){return Math.abs(this.x-t.x)<=(this.width+t.width)/2}function jt(t,i){const e="g"===t?N:V,h="g"===t?K*k:Z*k;bt.get({anchor:{x:.5,y:1},width:e,height:L,x:i,y:L,color:q,ttl:h,dx:-D,collidesWith:At,type:t})}vt.grenadeCount=$({x:.05*H,y:L+2*st,color:"rgba(255, 255, 255, 1)",render:function(){const t=this.context;t.fillStyle=this.color,t.font=`${st}px Helvetica,Arial`,t.fillText(`FLASH BANGS [G]: ${pt}`,this.x,this.y)}}),vt.mineCount=$({x:.05*H,y:L+4*st,color:"rgba(255, 255, 255, 1)",render:function(){const t=this.context;t.fillStyle=this.color,t.font=`${st}px Helvetica,Arial`,t.fillText(`FLASH MINES [SPACE]: ${mt}`,this.x,this.y)}}),vt.killCount=$({x:.05*H,y:2*st,color:"rgba(255, 255, 255, 1)",render:function(){const t=this.context;t.fillStyle=this.color,t.font=`${st}px Helvetica,Arial`,t.fillText(`KILLS: ${rt}`,this.x,this.y)}}),setInterval(()=>{!function(t){for(let i=0;i<t;i++){const t=(dt-lt)*Math.random()+lt,i=`rgba(${255-t}, ${255-t}, ${255-t}, 1)`;ft.get({anchor:{x:.5,y:1},x:-Math.random()*tt*8,y:L-20*Math.random(),width:tt,height:it,color:i,collidesWith:At,vx:ht,vy:-1.5,itsColor:i,hp:t})}}(8)},3e3),p({update:function(t){if(!nt)if(function(t,i){if(t.hp<=0)return t.rotation=Math.PI/2,void(nt=!0);t.rotation=Math.PI/12,t.y+=t.dy,(t.y<L-20||t.y>L)&&(t.dy=-t.dy);t.color=`rgba(${t.hp}, ${t.hp}, ${t.hp}, 1)`}(ut),ft.getAliveObjects().forEach(t=>{t.rotation=Math.PI/10;let i=255-t.hp;ot<at?t.color=et:(t.itsColor=`rgba(${i}, ${i}, ${i}, 1)`,t.color=t.itsColor),t.y+=t.vy,(t.y<L-20||t.y>L)&&(t.vy=-t.vy),t.collidesWith(ut)||(t.x+=t.vx)}),ft.update(),function(t){xt.getAliveObjects().forEach(i=>{i.deltaX>=B?(i.ttl=0,at+=K,jt("g",i.x)):(i.x-=i.vx*t,i.y+=i.vy*t,i.deltaX+=i.vx*t)}),xt.update()}(t),wt.update(),bt.update(),vt.grenadeCount.update(),vt.mineCount.update(),vt.killCount.update(),ot>=at?ot=at=0:ot+=t,R.style.background=ot<at?"rgba(180, 180, 180, 1)":"rgba(0, 0, 0, 1)",pt<3&&(yt<2?yt+=t:(pt+=1,yt=0)),gt+=t,v("g")&&gt>=.1&&(!function(){if(pt<=1)return;xt.get({anchor:{x:.5,y:1},width:F,height:T,color:q,x:ut.x,y:ut.y-X,deltaX:0,vx:B/G,vy:X/G}),pt-=1}(),gt=0),mt<1&&(_t<5?_t+=t:(mt+=1,_t=0)),v("space")&&function(){if(mt<1)return;wt.get({anchor:{x:.5,y:1},width:J,height:Q,color:U,x:ut.x,y:L,dx:-D,collidesWith:At}),mt-=1}(),bt.getAliveObjects().forEach(t=>{ft.getAliveObjects().forEach(i=>{if(t.collidesWith(i)){let e="g"===t.type?100:200;i.hp-=e,i.hp<=0&&(i.ttl=0,rt++)}})}),wt.getAliveObjects().forEach(t=>{let i=!1;for(let e of ft.getAliveObjects())if(t.collidesWith(e)){i=!0;break}i&&(t.ttl=0,at+=Z,jt("m",t.x))}),0===ct){let t=!1;ft.getAliveObjects().forEach(i=>{i.collidesWith(ut)&&(t=!0)}),t&&(ut.hp-=15,ct+=.01)}else ct>=.5?ct=0:ct+=t},render:function(){ut.render(),ft.render(),xt.render(),wt.render(),bt.render(),vt.grenadeCount.render(),vt.mineCount.render(),vt.killCount.render()}}).start()}]);