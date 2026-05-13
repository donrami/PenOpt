(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerpolicy&&(r.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?r.credentials="include":s.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const fn=Math.PI/180,qc=[{id:0,name:"Quality",wMtl:.5,wEnergy:.2,wHdn:.2,wTuy:.1,wBh:0},{id:1,name:"Balanced",wMtl:.3,wEnergy:.3,wHdn:.2,wTuy:.2,wBh:0},{id:2,name:"Energy",wMtl:.2,wEnergy:.5,wHdn:.2,wTuy:.1,wBh:0}],C=i=>document.getElementById(i),Nt=(i,e)=>[...(e||document).querySelectorAll(i)],y={meshLoaded:!1,meshInfo:null,scene:null,camera:null,renderer:null,controls:null,meshObject:null,meshClone:null,beamGroup:null,labelsGroup:null,animFrame:null,materialID:"al",filterID:"none",energy:76,tPct:.1,searching:!1,searchCancel:!1,mats:[],filters:[],presets:[],viewMode:"3d",labelsVisible:!1,beamVisible:!1,compareMode:!1,result:null,resultsStale:!1,weightPreset:0,method:"minimax",resultsCollapsed:!1,facePenetrations:null,facePenMin:0,facePenMax:0,rayGridXY:0,searchRange:45};function hn(i){var e=C("error-banner"),t=C("error-text");t.textContent=i,e.classList.remove("hidden"),window.__prevFocusOnError=document.activeElement,e.setAttribute("tabindex","-1"),e.focus()}function pn(i){C("status-text").textContent=i}function Yc(i){return new Promise(function(e){var t=C("confirm-overlay"),n=C("confirm-text"),s=C("confirm-cancel"),r=C("confirm-ok");n.textContent=i;function a(){t.classList.add("modal-closing"),t.addEventListener("animationend",function h(){t.removeEventListener("animationend",h),t.classList.add("hidden"),t.classList.remove("modal-closing")})}function o(h){a(),s.removeEventListener("click",l),r.removeEventListener("click",c),document.removeEventListener("keydown",u),t.removeEventListener("click",p),e(h)}function l(){o(!1)}function c(){o(!0)}function u(h){if(h.key==="Escape"){h.preventDefault(),o(!1);return}h.key==="Tab"&&(h.shiftKey&&document.activeElement===s?(h.preventDefault(),r.focus()):!h.shiftKey&&document.activeElement===r&&(h.preventDefault(),s.focus()))}function p(h){h.target===t&&o(!1)}s.addEventListener("click",l),r.addEventListener("click",c),document.addEventListener("keydown",u),t.addEventListener("click",p),t.classList.remove("modal-closing","hidden"),s.focus()})}function Kt(){if(!y.result)return;y.resultsStale=!0;const i=C("os-dot");i&&(i.className="os-dot os-dot--stale");const e=C("os-text");e&&(e.textContent="Results outdated \u2014 rerun to update"),pn("Results outdated \u2014 click Optimize to rerun");const t=C("results-content");if(t){let a=document.getElementById("stale-banner");a?a.classList.remove("hidden"):(a=document.createElement("div"),a.id="stale-banner",a.className="stale-banner",a.innerHTML='<span class="stale-icon">\u26A0</span> <span>Parameters changed \u2014 <strong>results are outdated</strong>. Click <strong>Optimize</strong> to rerun with current settings.</span>',t.insertBefore(a,t.firstChild))}const n=C("results-panel");n&&n.classList.add("results-stale");const s=C("btn-optimize"),r=C("btn-optimize-sidebar");s&&!s.disabled&&(s.classList.add("btn-stale"),s.innerHTML="\u25B6 Re-optimize"),r&&!r.disabled&&(r.classList.add("btn-stale"),r.innerHTML="\u25B6 Re-optimize")}function Kr(){y.resultsStale=!1;const i=document.getElementById("stale-banner");i&&i.classList.add("hidden");const e=C("results-panel");e&&e.classList.remove("results-stale");const t=C("btn-optimize"),n=C("btn-optimize-sidebar");t&&(t.classList.remove("btn-stale"),t.innerHTML="\u25B6 <span>Optimize</span>"),n&&(n.classList.remove("btn-stale"),n.innerHTML="\u25B6 <span>Optimize</span>")}function qa(i){const e=C("btn-optimize"),t=C("btn-optimize-sidebar");i.enabled!==void 0&&(e&&(e.disabled=!i.enabled),t&&(t.disabled=!i.enabled)),i.html!==void 0&&(e&&(e.innerHTML=i.html),t&&(t.innerHTML=i.html))}/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ya="184",En={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Hn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},jc=0,Co=1,Kc=2,Hs=1,Zc=2,Ji=3,Wn=0,Ot=1,Qt=2,Tn=0,Pi=1,Po=2,Lo=3,Do=4,$c=5,Qn=100,Jc=101,Qc=102,eh=103,th=104,nh=200,ih=201,sh=202,rh=203,Zr=204,$r=205,ah=206,oh=207,lh=208,ch=209,hh=210,uh=211,dh=212,fh=213,ph=214,Jr=0,Qr=1,ea=2,Ui=3,ta=4,na=5,ia=6,sa=7,zl=0,mh=1,gh=2,un=0,Gl=1,ja=2,Hl=3,kl=4,Vl=5,Wl=6,Xl=7,ql=300,si=301,Ni=302,ur=303,dr=304,rr=306,ra=1e3,bn=1001,aa=1002,wt=1003,_h=1004,cs=1005,Rt=1006,fr=1007,ti=1008,Vt=1009,Yl=1010,jl=1011,ts=1012,Ka=1013,mn=1014,ln=1015,Rn=1016,Za=1017,$a=1018,ns=1020,Kl=35902,Zl=35899,$l=1021,Jl=1022,tn=1023,Cn=1026,ni=1027,Ql=1028,Ja=1029,ri=1030,Qa=1031,eo=1033,ks=33776,Vs=33777,Ws=33778,Xs=33779,oa=35840,la=35841,ca=35842,ha=35843,ua=36196,da=37492,fa=37496,pa=37488,ma=37489,js=37490,ga=37491,_a=37808,xa=37809,va=37810,Ma=37811,Sa=37812,ya=37813,ba=37814,Ea=37815,Ta=37816,Aa=37817,wa=37818,Ra=37819,Ca=37820,Pa=37821,La=36492,Da=36494,Ia=36495,Ua=36283,Na=36284,Ks=36285,Fa=36286,xh=3200,Oa=0,vh=1,Gn="",Yt="srgb",Zs="srgb-linear",$s="linear",Qe="srgb",ci=7680,Io=519,Mh=512,Sh=513,yh=514,to=515,bh=516,Eh=517,no=518,Th=519,Ba=35044,Uo="300 es",cn=2e3,is=2001;function Ah(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Js(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function wh(){const i=Js("canvas");return i.style.display="block",i}const No={};function Qs(...i){const e="THREE."+i.shift();console.log(e,...i)}function ec(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Le(...i){i=ec(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ye(...i){i=ec(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function za(...i){const e=i.join(" ");e in No||(No[e]=!0,Le(...i))}function Rh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Ch={[Jr]:Qr,[ea]:ia,[ta]:sa,[Ui]:na,[Qr]:Jr,[ia]:ea,[sa]:ta,[na]:Ui};class Yn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Pt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Fo=1234567;const Li=Math.PI/180,ss=180/Math.PI;function An(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Pt[i&255]+Pt[i>>8&255]+Pt[i>>16&255]+Pt[i>>24&255]+"-"+Pt[e&255]+Pt[e>>8&255]+"-"+Pt[e>>16&15|64]+Pt[e>>24&255]+"-"+Pt[t&63|128]+Pt[t>>8&255]+"-"+Pt[t>>16&255]+Pt[t>>24&255]+Pt[n&255]+Pt[n>>8&255]+Pt[n>>16&255]+Pt[n>>24&255]).toLowerCase()}function We(i,e,t){return Math.max(e,Math.min(t,i))}function io(i,e){return(i%e+e)%e}function Ph(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Lh(i,e,t){return i!==e?(t-i)/(e-i):0}function es(i,e,t){return(1-t)*i+t*e}function Dh(i,e,t,n){return es(i,e,1-Math.exp(-t*n))}function Ih(i,e=1){return e-Math.abs(io(i,e*2)-e)}function Uh(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Nh(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Fh(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Oh(i,e){return i+Math.random()*(e-i)}function Bh(i){return i*(.5-Math.random())}function zh(i){i!==void 0&&(Fo=i);let e=Fo+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Gh(i){return i*Li}function Hh(i){return i*ss}function kh(i){return(i&i-1)===0&&i!==0}function Vh(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Wh(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Xh(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),p=r((e-n)/2),h=a((e-n)/2),m=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*p,l*h,o*c);break;case"YZY":i.set(l*h,o*u,l*p,o*c);break;case"ZXZ":i.set(l*p,l*h,o*u,o*c);break;case"XZX":i.set(o*u,l*g,l*m,o*c);break;case"YXY":i.set(l*m,o*u,l*g,o*c);break;case"ZYZ":i.set(l*g,l*m,o*u,o*c);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function en(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function et(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const qh={DEG2RAD:Li,RAD2DEG:ss,generateUUID:An,clamp:We,euclideanModulo:io,mapLinear:Ph,inverseLerp:Lh,lerp:es,damp:Dh,pingpong:Ih,smoothstep:Uh,smootherstep:Nh,randInt:Fh,randFloat:Oh,randFloatSpread:Bh,seededRandom:zh,degToRad:Gh,radToDeg:Hh,isPowerOfTwo:kh,ceilPowerOfTwo:Vh,floorPowerOfTwo:Wh,setQuaternionFromProperEuler:Xh,normalize:et,denormalize:en},go=class{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};let Ce=go;(()=>{go.prototype.isVector2=!0})();class Xn{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],p=n[s+3],h=r[a+0],m=r[a+1],g=r[a+2],v=r[a+3];if(p!==v||l!==h||c!==m||u!==g){let f=l*h+c*m+u*g+p*v;f<0&&(h=-h,m=-m,g=-g,v=-v,f=-f);let d=1-o;if(f<.9995){const M=Math.acos(f),E=Math.sin(M);d=Math.sin(d*M)/E,o=Math.sin(o*M)/E,l=l*d+h*o,c=c*d+m*o,u=u*d+g*o,p=p*d+v*o}else{l=l*d+h*o,c=c*d+m*o,u=u*d+g*o,p=p*d+v*o;const M=1/Math.sqrt(l*l+c*c+u*u+p*p);l*=M,c*=M,u*=M,p*=M}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],p=r[a],h=r[a+1],m=r[a+2],g=r[a+3];return e[t]=o*g+u*p+l*m-c*h,e[t+1]=l*g+u*h+c*p-o*m,e[t+2]=c*g+u*m+o*h-l*p,e[t+3]=u*g-o*p-l*h-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),p=o(r/2),h=l(n/2),m=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=h*u*p+c*m*g,this._y=c*m*p-h*u*g,this._z=c*u*g+h*m*p,this._w=c*u*p-h*m*g;break;case"YXZ":this._x=h*u*p+c*m*g,this._y=c*m*p-h*u*g,this._z=c*u*g-h*m*p,this._w=c*u*p+h*m*g;break;case"ZXY":this._x=h*u*p-c*m*g,this._y=c*m*p+h*u*g,this._z=c*u*g+h*m*p,this._w=c*u*p-h*m*g;break;case"ZYX":this._x=h*u*p-c*m*g,this._y=c*m*p+h*u*g,this._z=c*u*g-h*m*p,this._w=c*u*p+h*m*g;break;case"YZX":this._x=h*u*p+c*m*g,this._y=c*m*p+h*u*g,this._z=c*u*g-h*m*p,this._w=c*u*p-h*m*g;break;case"XZY":this._x=h*u*p-c*m*g,this._y=c*m*p-h*u*g,this._z=c*u*g+h*m*p,this._w=c*u*p+h*m*g;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],p=t[10],h=n+o+p;if(h>0){const m=.5/Math.sqrt(h+1);this._w=.25/m,this._x=(u-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(n>o&&n>p){const m=2*Math.sqrt(1+n-o-p);this._w=(u-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>p){const m=2*Math.sqrt(1+o-n-p);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+u)/m}else{const m=2*Math.sqrt(1+p-n-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const _o=class{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Oo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Oo.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),p=2*(r*n-a*t);return this.x=t+l*c+a*p-o*u,this.y=n+l*u+o*c-r*p,this.z=s+l*p+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return pr.copy(this).projectOnVector(e),this.sub(pr)}reflect(e){return this.sub(pr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};let I=_o;(()=>{_o.prototype.isVector3=!0})();const pr=new I,Oo=new Xn,xo=class{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],p=n[7],h=n[2],m=n[5],g=n[8],v=s[0],f=s[3],d=s[6],M=s[1],E=s[4],T=s[7],L=s[2],A=s[5],P=s[8];return r[0]=a*v+o*M+l*L,r[3]=a*f+o*E+l*A,r[6]=a*d+o*T+l*P,r[1]=c*v+u*M+p*L,r[4]=c*f+u*E+p*A,r[7]=c*d+u*T+p*P,r[2]=h*v+m*M+g*L,r[5]=h*f+m*E+g*A,r[8]=h*d+m*T+g*P,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=u*a-o*c,h=o*l-u*r,m=c*r-a*l,g=t*p+n*h+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=p*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=m*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(mr.makeScale(e,t)),this}rotate(e){return this.premultiply(mr.makeRotation(-e)),this}translate(e,t){return this.premultiply(mr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};let Ne=xo;(()=>{xo.prototype.isMatrix3=!0})();const mr=new Ne,Bo=new Ne().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zo=new Ne().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Yh(){const i={enabled:!0,workingColorSpace:Zs,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Qe&&(s.r=wn(s.r),s.g=wn(s.g),s.b=wn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Qe&&(s.r=Di(s.r),s.g=Di(s.g),s.b=Di(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Gn?$s:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return za("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return za("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Zs]:{primaries:e,whitePoint:n,transfer:$s,toXYZ:Bo,fromXYZ:zo,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Yt},outputColorSpaceConfig:{drawingBufferColorSpace:Yt}},[Yt]:{primaries:e,whitePoint:n,transfer:Qe,toXYZ:Bo,fromXYZ:zo,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Yt}}}),i}const qe=Yh();function wn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Di(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let hi;class jh{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{hi===void 0&&(hi=Js("canvas")),hi.width=e.width,hi.height=e.height;const s=hi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=hi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Js("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=wn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(wn(t[n]/255)*255):t[n]=wn(t[n]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Kh=0;class so{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Kh++}),this.uuid=An(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(gr(s[a].image)):r.push(gr(s[a]))}else r=gr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function gr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?jh.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}let Zh=0;const _r=new I;class Dt extends Yn{constructor(e=Dt.DEFAULT_IMAGE,t=Dt.DEFAULT_MAPPING,n=bn,s=bn,r=Rt,a=ti,o=tn,l=Vt,c=Dt.DEFAULT_ANISOTROPY,u=Gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zh++}),this.uuid=An(),this.name="",this.source=new so(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ce(0,0),this.repeat=new Ce(1,1),this.center=new Ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ne,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(_r).x}get height(){return this.source.getSize(_r).y}get depth(){return this.source.getSize(_r).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ql)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ra:e.x=e.x-Math.floor(e.x);break;case bn:e.x=e.x<0?0:1;break;case aa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ra:e.y=e.y-Math.floor(e.y);break;case bn:e.y=e.y<0?0:1;break;case aa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Dt.DEFAULT_IMAGE=null;Dt.DEFAULT_MAPPING=ql;Dt.DEFAULT_ANISOTROPY=1;const vo=class{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],p=l[8],h=l[1],m=l[5],g=l[9],v=l[2],f=l[6],d=l[10];if(Math.abs(u-h)<.01&&Math.abs(p-v)<.01&&Math.abs(g-f)<.01){if(Math.abs(u+h)<.1&&Math.abs(p+v)<.1&&Math.abs(g+f)<.1&&Math.abs(c+m+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,T=(m+1)/2,L=(d+1)/2,A=(u+h)/4,P=(p+v)/4,x=(g+f)/4;return E>T&&E>L?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=A/n,r=P/n):T>L?T<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(T),n=A/s,r=x/s):L<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),n=P/r,s=x/r),this.set(n,s,r,t),this}let M=Math.sqrt((f-g)*(f-g)+(p-v)*(p-v)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(f-g)/M,this.y=(p-v)/M,this.z=(h-u)/M,this.w=Math.acos((c+m+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};let mt=vo;(()=>{vo.prototype.isVector4=!0})();class $h extends Yn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Rt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new Dt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Rt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new so(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this}dispose(){this.dispatchEvent({type:"dispose"})}}class dn extends $h{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class tc extends Dt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Jh extends Dt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const sr=class{constructor(e,t,n,s,r,a,o,l,c,u,p,h,m,g,v,f){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,p,h,m,g,v,f)}set(e,t,n,s,r,a,o,l,c,u,p,h,m,g,v,f){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=p,d[14]=h,d[3]=m,d[7]=g,d[11]=v,d[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new sr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,n=e.elements,s=1/ui.setFromMatrixColumn(e,0).length(),r=1/ui.setFromMatrixColumn(e,1).length(),a=1/ui.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),p=Math.sin(r);if(e.order==="XYZ"){const h=a*u,m=a*p,g=o*u,v=o*p;t[0]=l*u,t[4]=-l*p,t[8]=c,t[1]=m+g*c,t[5]=h-v*c,t[9]=-o*l,t[2]=v-h*c,t[6]=g+m*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*u,m=l*p,g=c*u,v=c*p;t[0]=h+v*o,t[4]=g*o-m,t[8]=a*c,t[1]=a*p,t[5]=a*u,t[9]=-o,t[2]=m*o-g,t[6]=v+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*u,m=l*p,g=c*u,v=c*p;t[0]=h-v*o,t[4]=-a*p,t[8]=g+m*o,t[1]=m+g*o,t[5]=a*u,t[9]=v-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*u,m=a*p,g=o*u,v=o*p;t[0]=l*u,t[4]=g*c-m,t[8]=h*c+v,t[1]=l*p,t[5]=v*c+h,t[9]=m*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,m=a*c,g=o*l,v=o*c;t[0]=l*u,t[4]=v-h*p,t[8]=g*p+m,t[1]=p,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=m*p+g,t[10]=h-v*p}else if(e.order==="XZY"){const h=a*l,m=a*c,g=o*l,v=o*c;t[0]=l*u,t[4]=-p,t[8]=c*u,t[1]=h*p+v,t[5]=a*u,t[9]=m*p-g,t[2]=g*p-m,t[6]=o*u,t[10]=v*p+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Qh,e,eu)}lookAt(e,t,n){const s=this.elements;return Ht.subVectors(e,t),Ht.lengthSq()===0&&(Ht.z=1),Ht.normalize(),In.crossVectors(n,Ht),In.lengthSq()===0&&(Math.abs(n.z)===1?Ht.x+=1e-4:Ht.z+=1e-4,Ht.normalize(),In.crossVectors(n,Ht)),In.normalize(),hs.crossVectors(Ht,In),s[0]=In.x,s[4]=hs.x,s[8]=Ht.x,s[1]=In.y,s[5]=hs.y,s[9]=Ht.y,s[2]=In.z,s[6]=hs.z,s[10]=Ht.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],p=n[5],h=n[9],m=n[13],g=n[2],v=n[6],f=n[10],d=n[14],M=n[3],E=n[7],T=n[11],L=n[15],A=s[0],P=s[4],x=s[8],w=s[12],F=s[1],R=s[5],N=s[9],H=s[13],q=s[2],U=s[6],k=s[10],G=s[14],ee=s[3],te=s[7],de=s[11],Y=s[15];return r[0]=a*A+o*F+l*q+c*ee,r[4]=a*P+o*R+l*U+c*te,r[8]=a*x+o*N+l*k+c*de,r[12]=a*w+o*H+l*G+c*Y,r[1]=u*A+p*F+h*q+m*ee,r[5]=u*P+p*R+h*U+m*te,r[9]=u*x+p*N+h*k+m*de,r[13]=u*w+p*H+h*G+m*Y,r[2]=g*A+v*F+f*q+d*ee,r[6]=g*P+v*R+f*U+d*te,r[10]=g*x+v*N+f*k+d*de,r[14]=g*w+v*H+f*G+d*Y,r[3]=M*A+E*F+T*q+L*ee,r[7]=M*P+E*R+T*U+L*te,r[11]=M*x+E*N+T*k+L*de,r[15]=M*w+E*H+T*G+L*Y,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],p=e[6],h=e[10],m=e[14],g=e[3],v=e[7],f=e[11],d=e[15],M=l*m-c*h,E=o*m-c*p,T=o*h-l*p,L=a*m-c*u,A=a*h-l*u,P=a*p-o*u;return t*(v*M-f*E+d*T)-n*(g*M-f*L+d*A)+s*(g*E-v*L+d*P)-r*(g*T-v*A+f*P)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=e[9],h=e[10],m=e[11],g=e[12],v=e[13],f=e[14],d=e[15],M=t*o-n*a,E=t*l-s*a,T=t*c-r*a,L=n*l-s*o,A=n*c-r*o,P=s*c-r*l,x=u*v-p*g,w=u*f-h*g,F=u*d-m*g,R=p*f-h*v,N=p*d-m*v,H=h*d-m*f,q=M*H-E*N+T*R+L*F-A*w+P*x;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const U=1/q;return e[0]=(o*H-l*N+c*R)*U,e[1]=(s*N-n*H-r*R)*U,e[2]=(v*P-f*A+d*L)*U,e[3]=(h*A-p*P-m*L)*U,e[4]=(l*F-a*H-c*w)*U,e[5]=(t*H-s*F+r*w)*U,e[6]=(f*T-g*P-d*E)*U,e[7]=(u*P-h*T+m*E)*U,e[8]=(a*N-o*F+c*x)*U,e[9]=(n*F-t*N-r*x)*U,e[10]=(g*A-v*T+d*M)*U,e[11]=(p*T-u*A-m*M)*U,e[12]=(o*w-a*R-l*x)*U,e[13]=(t*R-n*w+s*x)*U,e[14]=(v*E-g*L-f*M)*U,e[15]=(u*L-p*E+h*M)*U,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,p=o+o,h=r*c,m=r*u,g=r*p,v=a*u,f=a*p,d=o*p,M=l*c,E=l*u,T=l*p,L=n.x,A=n.y,P=n.z;return s[0]=(1-(v+d))*L,s[1]=(m+T)*L,s[2]=(g-E)*L,s[3]=0,s[4]=(m-T)*A,s[5]=(1-(h+d))*A,s[6]=(f+M)*A,s[7]=0,s[8]=(g+E)*P,s[9]=(f-M)*P,s[10]=(1-(h+v))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinant();if(r===0)return n.set(1,1,1),t.identity(),this;let a=ui.set(s[0],s[1],s[2]).length();const o=ui.set(s[4],s[5],s[6]).length(),l=ui.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Zt.copy(this);const c=1/a,u=1/o,p=1/l;return Zt.elements[0]*=c,Zt.elements[1]*=c,Zt.elements[2]*=c,Zt.elements[4]*=u,Zt.elements[5]*=u,Zt.elements[6]*=u,Zt.elements[8]*=p,Zt.elements[9]*=p,Zt.elements[10]*=p,t.setFromRotationMatrix(Zt),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=cn,l=!1){const c=this.elements,u=2*r/(t-e),p=2*r/(n-s),h=(t+e)/(t-e),m=(n+s)/(n-s);let g,v;if(l)g=r/(a-r),v=a*r/(a-r);else if(o===cn)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===is)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=p,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=cn,l=!1){const c=this.elements,u=2/(t-e),p=2/(n-s),h=-(t+e)/(t-e),m=-(n+s)/(n-s);let g,v;if(l)g=1/(a-r),v=a/(a-r);else if(o===cn)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===is)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=p,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};let dt=sr;(()=>{sr.prototype.isMatrix4=!0})();const ui=new I,Zt=new dt,Qh=new I(0,0,0),eu=new I(1,1,1),In=new I,hs=new I,Ht=new I,Go=new dt,Ho=new Xn;class qn{constructor(e=0,t=0,n=0,s=qn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],p=s[2],h=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-We(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,r),this._z=0);break;case"ZXY":this._x=Math.asin(We(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-p,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-We(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(h,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(We(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-p,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Go.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Go,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ho.setFromEuler(this),this.setFromQuaternion(Ho,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}qn.DEFAULT_ORDER="XYZ";class nc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let tu=0;const ko=new I,di=new Xn,xn=new dt,us=new I,ki=new I,nu=new I,iu=new Xn,Vo=new I(1,0,0),Wo=new I(0,1,0),Xo=new I(0,0,1),qo={type:"added"},su={type:"removed"},fi={type:"childadded",child:null},xr={type:"childremoved",child:null};class bt extends Yn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:tu++}),this.uuid=An(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bt.DEFAULT_UP.clone();const e=new I,t=new qn,n=new Xn,s=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new dt},normalMatrix:{value:new Ne}}),this.matrix=new dt,this.matrixWorld=new dt,this.matrixAutoUpdate=bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new nc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return di.setFromAxisAngle(e,t),this.quaternion.multiply(di),this}rotateOnWorldAxis(e,t){return di.setFromAxisAngle(e,t),this.quaternion.premultiply(di),this}rotateX(e){return this.rotateOnAxis(Vo,e)}rotateY(e){return this.rotateOnAxis(Wo,e)}rotateZ(e){return this.rotateOnAxis(Xo,e)}translateOnAxis(e,t){return ko.copy(e).applyQuaternion(this.quaternion),this.position.add(ko.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Vo,e)}translateY(e){return this.translateOnAxis(Wo,e)}translateZ(e){return this.translateOnAxis(Xo,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?us.copy(e):us.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),ki.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xn.lookAt(ki,us,this.up):xn.lookAt(us,ki,this.up),this.quaternion.setFromRotationMatrix(xn),s&&(xn.extractRotation(s.matrixWorld),di.setFromRotationMatrix(xn),this.quaternion.premultiply(di.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ye("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(qo),fi.child=e,this.dispatchEvent(fi),fi.child=null):Ye("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(su),xr.child=e,this.dispatchEvent(xr),xr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xn.multiply(e.parent.matrixWorld)),e.applyMatrix4(xn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(qo),fi.child=e,this.dispatchEvent(fi),fi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ki,e,nu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ki,iu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const p=l[c];r(e.shapes,p)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),p=a(e.shapes),h=a(e.skeletons),m=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),p.length>0&&(n.shapes=p),h.length>0&&(n.skeletons=h),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}bt.DEFAULT_UP=new I(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ci extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const ru={type:"move"};class vr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ci,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ci,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ci,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const f=t.getJointPose(v,n),d=this._getHandJoint(c,v);f!==null&&(d.matrix.fromArray(f.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=f.radius),d.visible=f!==null}const u=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],h=u.position.distanceTo(p.position),m=.02,g=.005;c.inputState.pinching&&h>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ru)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ci;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const ic={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Un={h:0,s:0,l:0},ds={h:0,s:0,l:0};function Mr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class He{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,qe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=qe.workingColorSpace){if(e=io(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Mr(a,r,e+1/3),this.g=Mr(a,r,e),this.b=Mr(a,r,e-1/3)}return qe.colorSpaceToWorking(this,s),this}setStyle(e,t=Yt){function n(r){r!==void 0&&parseFloat(r)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Yt){const n=ic[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=wn(e.r),this.g=wn(e.g),this.b=wn(e.b),this}copyLinearToSRGB(e){return this.r=Di(e.r),this.g=Di(e.g),this.b=Di(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Yt){return qe.workingToColorSpace(Lt.copy(this),e),Math.round(We(Lt.r*255,0,255))*65536+Math.round(We(Lt.g*255,0,255))*256+Math.round(We(Lt.b*255,0,255))}getHexString(e=Yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.workingToColorSpace(Lt.copy(this),t);const n=Lt.r,s=Lt.g,r=Lt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const p=a-o;switch(c=u<=.5?p/(a+o):p/(2-a-o),a){case n:l=(s-r)/p+(s<r?6:0);break;case s:l=(r-n)/p+2;break;case r:l=(n-s)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=qe.workingColorSpace){return qe.workingToColorSpace(Lt.copy(this),t),e.r=Lt.r,e.g=Lt.g,e.b=Lt.b,e}getStyle(e=Yt){qe.workingToColorSpace(Lt.copy(this),e);const t=Lt.r,n=Lt.g,s=Lt.b;return e!==Yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Un),this.setHSL(Un.h+e,Un.s+t,Un.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Un),e.getHSL(ds);const n=es(Un.h,ds.h,t),s=es(Un.s,ds.s,t),r=es(Un.l,ds.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Lt=new He;He.NAMES=ic;class au extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new qn,this.environmentIntensity=1,this.environmentRotation=new qn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const $t=new I,vn=new I,Sr=new I,Mn=new I,pi=new I,mi=new I,Yo=new I,yr=new I,br=new I,Er=new I,Tr=new mt,Ar=new mt,wr=new mt;class Wt{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),$t.subVectors(e,t),s.cross($t);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){$t.subVectors(s,t),vn.subVectors(n,t),Sr.subVectors(e,t);const a=$t.dot($t),o=$t.dot(vn),l=$t.dot(Sr),c=vn.dot(vn),u=vn.dot(Sr),p=a*c-o*o;if(p===0)return r.set(0,0,0),null;const h=1/p,m=(c*l-o*u)*h,g=(a*u-o*l)*h;return r.set(1-m-g,g,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Mn)===null?!1:Mn.x>=0&&Mn.y>=0&&Mn.x+Mn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Mn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Mn.x),l.addScaledVector(a,Mn.y),l.addScaledVector(o,Mn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Tr.setScalar(0),Ar.setScalar(0),wr.setScalar(0),Tr.fromBufferAttribute(e,t),Ar.fromBufferAttribute(e,n),wr.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Tr,r.x),a.addScaledVector(Ar,r.y),a.addScaledVector(wr,r.z),a}static isFrontFacing(e,t,n,s){return $t.subVectors(n,t),vn.subVectors(e,t),$t.cross(vn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return $t.subVectors(this.c,this.b),vn.subVectors(this.a,this.b),$t.cross(vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Wt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Wt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Wt.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Wt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Wt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;pi.subVectors(s,n),mi.subVectors(r,n),yr.subVectors(e,n);const l=pi.dot(yr),c=mi.dot(yr);if(l<=0&&c<=0)return t.copy(n);br.subVectors(e,s);const u=pi.dot(br),p=mi.dot(br);if(u>=0&&p<=u)return t.copy(s);const h=l*p-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(pi,a);Er.subVectors(e,r);const m=pi.dot(Er),g=mi.dot(Er);if(g>=0&&m<=g)return t.copy(r);const v=m*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(mi,o);const f=u*g-m*p;if(f<=0&&p-u>=0&&m-g>=0)return Yo.subVectors(r,s),o=(p-u)/(p-u+(m-g)),t.copy(s).addScaledVector(Yo,o);const d=1/(f+v+h);return a=v*d,o=h*d,t.copy(n).addScaledVector(pi,a).addScaledVector(mi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Gi{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Jt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Jt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Jt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Jt):Jt.fromBufferAttribute(r,a),Jt.applyMatrix4(e.matrixWorld),this.expandByPoint(Jt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),fs.copy(n.boundingBox)),fs.applyMatrix4(e.matrixWorld),this.union(fs)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Jt),Jt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vi),ps.subVectors(this.max,Vi),gi.subVectors(e.a,Vi),_i.subVectors(e.b,Vi),xi.subVectors(e.c,Vi),Nn.subVectors(_i,gi),Fn.subVectors(xi,_i),Kn.subVectors(gi,xi);let t=[0,-Nn.z,Nn.y,0,-Fn.z,Fn.y,0,-Kn.z,Kn.y,Nn.z,0,-Nn.x,Fn.z,0,-Fn.x,Kn.z,0,-Kn.x,-Nn.y,Nn.x,0,-Fn.y,Fn.x,0,-Kn.y,Kn.x,0];return!Rr(t,gi,_i,xi,ps)||(t=[1,0,0,0,1,0,0,0,1],!Rr(t,gi,_i,xi,ps))?!1:(ms.crossVectors(Nn,Fn),t=[ms.x,ms.y,ms.z],Rr(t,gi,_i,xi,ps))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Jt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Jt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Sn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Sn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Sn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Sn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Sn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Sn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Sn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Sn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Sn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Sn=[new I,new I,new I,new I,new I,new I,new I,new I],Jt=new I,fs=new Gi,gi=new I,_i=new I,xi=new I,Nn=new I,Fn=new I,Kn=new I,Vi=new I,ps=new I,ms=new I,Zn=new I;function Rr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Zn.fromArray(i,r);const o=s.x*Math.abs(Zn.x)+s.y*Math.abs(Zn.y)+s.z*Math.abs(Zn.z),l=e.dot(Zn),c=t.dot(Zn),u=n.dot(Zn);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const vt=new I,gs=new Ce;let ou=0;class Bt extends Yn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ou++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ba,this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)gs.fromBufferAttribute(this,t),gs.applyMatrix3(e),this.setXY(t,gs.x,gs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=en(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=et(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=en(t,this.array)),t}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=en(t,this.array)),t}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=en(t,this.array)),t}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=en(t,this.array)),t}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),n=et(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),n=et(n,this.array),s=et(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),n=et(n,this.array),s=et(s,this.array),r=et(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ba&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class sc extends Bt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class rc extends Bt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ct extends Bt{constructor(e,t,n){super(new Float32Array(e),t,n)}}const lu=new Gi,Wi=new I,Cr=new I;class ar{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):lu.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Wi.subVectors(e,this.center);const t=Wi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Wi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Cr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Wi.copy(e.center).add(Cr)),this.expandByPoint(Wi.copy(e.center).sub(Cr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let cu=0;const qt=new dt,Pr=new bt,vi=new I,kt=new Gi,Xi=new Gi,At=new I;class Mt extends Yn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:cu++}),this.uuid=An(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ah(e)?rc:sc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ne().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return qt.makeRotationFromQuaternion(e),this.applyMatrix4(qt),this}rotateX(e){return qt.makeRotationX(e),this.applyMatrix4(qt),this}rotateY(e){return qt.makeRotationY(e),this.applyMatrix4(qt),this}rotateZ(e){return qt.makeRotationZ(e),this.applyMatrix4(qt),this}translate(e,t,n){return qt.makeTranslation(e,t,n),this.applyMatrix4(qt),this}scale(e,t,n){return qt.makeScale(e,t,n),this.applyMatrix4(qt),this}lookAt(e){return Pr.lookAt(e),Pr.updateMatrix(),this.applyMatrix4(Pr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vi).negate(),this.translate(vi.x,vi.y,vi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ct(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Gi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ye("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];kt.setFromBufferAttribute(r),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,kt.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,kt.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(kt.min),this.boundingBox.expandByPoint(kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ye('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ar);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ye("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(kt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Xi.setFromBufferAttribute(o),this.morphTargetsRelative?(At.addVectors(kt.min,Xi.min),kt.expandByPoint(At),At.addVectors(kt.max,Xi.max),kt.expandByPoint(At)):(kt.expandByPoint(Xi.min),kt.expandByPoint(Xi.max))}kt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)At.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(At));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)At.fromBufferAttribute(o,c),l&&(vi.fromBufferAttribute(e,c),At.add(vi)),s=Math.max(s,n.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ye('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ye("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Bt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new I,l[x]=new I;const c=new I,u=new I,p=new I,h=new Ce,m=new Ce,g=new Ce,v=new I,f=new I;function d(x,w,F){c.fromBufferAttribute(n,x),u.fromBufferAttribute(n,w),p.fromBufferAttribute(n,F),h.fromBufferAttribute(r,x),m.fromBufferAttribute(r,w),g.fromBufferAttribute(r,F),u.sub(c),p.sub(c),m.sub(h),g.sub(h);const R=1/(m.x*g.y-g.x*m.y);!isFinite(R)||(v.copy(u).multiplyScalar(g.y).addScaledVector(p,-m.y).multiplyScalar(R),f.copy(p).multiplyScalar(m.x).addScaledVector(u,-g.x).multiplyScalar(R),o[x].add(v),o[w].add(v),o[F].add(v),l[x].add(f),l[w].add(f),l[F].add(f))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let x=0,w=M.length;x<w;++x){const F=M[x],R=F.start,N=F.count;for(let H=R,q=R+N;H<q;H+=3)d(e.getX(H+0),e.getX(H+1),e.getX(H+2))}const E=new I,T=new I,L=new I,A=new I;function P(x){L.fromBufferAttribute(s,x),A.copy(L);const w=o[x];E.copy(w),E.sub(L.multiplyScalar(L.dot(w))).normalize(),T.crossVectors(A,w);const R=T.dot(l[x])<0?-1:1;a.setXYZW(x,E.x,E.y,E.z,R)}for(let x=0,w=M.length;x<w;++x){const F=M[x],R=F.start,N=F.count;for(let H=R,q=R+N;H<q;H+=3)P(e.getX(H+0)),P(e.getX(H+1)),P(e.getX(H+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Bt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,m=n.count;h<m;h++)n.setXYZ(h,0,0,0);const s=new I,r=new I,a=new I,o=new I,l=new I,c=new I,u=new I,p=new I;if(e)for(let h=0,m=e.count;h<m;h+=3){const g=e.getX(h+0),v=e.getX(h+1),f=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,f),u.subVectors(a,r),p.subVectors(s,r),u.cross(p),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,f),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(f,c.x,c.y,c.z)}else for(let h=0,m=t.count;h<m;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),p.subVectors(s,r),u.cross(p),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,p=o.normalized,h=new c.constructor(l.length*u);let m=0,g=0;for(let v=0,f=l.length;v<f;v++){o.isInterleavedBufferAttribute?m=l[v]*o.data.stride+o.offset:m=l[v]*u;for(let d=0;d<u;d++)h[g++]=c[m++]}return new Bt(h,u,p)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Mt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,p=c.length;u<p;u++){const h=c[u],m=e(h,n);l.push(m)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let p=0,h=c.length;p<h;p++){const m=c[p];u.push(m.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],p=r[c];for(let h=0,m=p.length;h<m;h++)u.push(p[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const p=a[c];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}class hu{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ba,this.updateRanges=[],this.version=0,this.uuid=An()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=An()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=An()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const It=new I;class er{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=en(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=et(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=en(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=en(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=en(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=en(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),n=et(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),n=et(n,this.array),s=et(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),n=et(n,this.array),s=et(s,this.array),r=et(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Qs("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Bt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new er(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Qs("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let uu=0;class ai extends Yn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:uu++}),this.uuid=An(),this.name="",this.type="Material",this.blending=Pi,this.side=Wn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zr,this.blendDst=$r,this.blendEquation=Qn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new He(0,0,0),this.blendAlpha=0,this.depthFunc=Ui,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Io,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ci,this.stencilZFail=ci,this.stencilZPass=ci,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Pi&&(n.blending=this.blending),this.side!==Wn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Zr&&(n.blendSrc=this.blendSrc),this.blendDst!==$r&&(n.blendDst=this.blendDst),this.blendEquation!==Qn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ui&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Io&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ci&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ci&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ci&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ac extends ai{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new He(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Mi;const qi=new I,Si=new I,yi=new I,bi=new Ce,Yi=new Ce,oc=new dt,_s=new I,ji=new I,xs=new I,jo=new Ce,Lr=new Ce,Ko=new Ce;class du extends bt{constructor(e=new ac){if(super(),this.isSprite=!0,this.type="Sprite",Mi===void 0){Mi=new Mt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new hu(t,5);Mi.setIndex([0,1,2,0,2,3]),Mi.setAttribute("position",new er(n,3,0,!1)),Mi.setAttribute("uv",new er(n,2,3,!1))}this.geometry=Mi,this.material=e,this.center=new Ce(.5,.5),this.count=1}raycast(e,t){e.camera===null&&Ye('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Si.setFromMatrixScale(this.matrixWorld),oc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),yi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Si.multiplyScalar(-yi.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;vs(_s.set(-.5,-.5,0),yi,a,Si,s,r),vs(ji.set(.5,-.5,0),yi,a,Si,s,r),vs(xs.set(.5,.5,0),yi,a,Si,s,r),jo.set(0,0),Lr.set(1,0),Ko.set(1,1);let o=e.ray.intersectTriangle(_s,ji,xs,!1,qi);if(o===null&&(vs(ji.set(-.5,.5,0),yi,a,Si,s,r),Lr.set(0,1),o=e.ray.intersectTriangle(_s,xs,ji,!1,qi),o===null))return;const l=e.ray.origin.distanceTo(qi);l<e.near||l>e.far||t.push({distance:l,point:qi.clone(),uv:Wt.getInterpolation(qi,_s,ji,xs,jo,Lr,Ko,new Ce),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function vs(i,e,t,n,s,r){bi.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Yi.x=r*bi.x-s*bi.y,Yi.y=s*bi.x+r*bi.y):Yi.copy(bi),i.copy(e),i.x+=Yi.x,i.y+=Yi.y,i.applyMatrix4(oc)}const yn=new I,Dr=new I,Ms=new I,On=new I,Ir=new I,Ss=new I,Ur=new I;class ro{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=yn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yn.copy(this.origin).addScaledVector(this.direction,t),yn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Dr.copy(e).add(t).multiplyScalar(.5),Ms.copy(t).sub(e).normalize(),On.copy(this.origin).sub(Dr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ms),o=On.dot(this.direction),l=-On.dot(Ms),c=On.lengthSq(),u=Math.abs(1-a*a);let p,h,m,g;if(u>0)if(p=a*l-o,h=a*o-l,g=r*u,p>=0)if(h>=-g)if(h<=g){const v=1/u;p*=v,h*=v,m=p*(p+a*h+2*o)+h*(a*p+h+2*l)+c}else h=r,p=Math.max(0,-(a*h+o)),m=-p*p+h*(h+2*l)+c;else h=-r,p=Math.max(0,-(a*h+o)),m=-p*p+h*(h+2*l)+c;else h<=-g?(p=Math.max(0,-(-a*r+o)),h=p>0?-r:Math.min(Math.max(-r,-l),r),m=-p*p+h*(h+2*l)+c):h<=g?(p=0,h=Math.min(Math.max(-r,-l),r),m=h*(h+2*l)+c):(p=Math.max(0,-(a*r+o)),h=p>0?r:Math.min(Math.max(-r,-l),r),m=-p*p+h*(h+2*l)+c);else h=a>0?-r:r,p=Math.max(0,-(a*h+o)),m=-p*p+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Dr).addScaledVector(Ms,h),m}intersectSphere(e,t){yn.subVectors(e.center,this.origin);const n=yn.dot(this.direction),s=yn.dot(yn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,p=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),p>=0?(o=(e.min.z-h.z)*p,l=(e.max.z-h.z)*p):(o=(e.max.z-h.z)*p,l=(e.min.z-h.z)*p),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,yn)!==null}intersectTriangle(e,t,n,s,r){Ir.subVectors(t,e),Ss.subVectors(n,e),Ur.crossVectors(Ir,Ss);let a=this.direction.dot(Ur),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;On.subVectors(this.origin,e);const l=o*this.direction.dot(Ss.crossVectors(On,Ss));if(l<0)return null;const c=o*this.direction.dot(Ir.cross(On));if(c<0||l+c>a)return null;const u=-o*On.dot(Ur);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rs extends ai{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.combine=zl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Zo=new dt,$n=new ro,ys=new ar,$o=new I,bs=new I,Es=new I,Ts=new I,Nr=new I,As=new I,Jo=new I,ws=new I;class ut extends bt{constructor(e=new Mt,t=new rs){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){As.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],p=r[l];u!==0&&(Nr.fromBufferAttribute(p,e),a?As.addScaledVector(Nr,u):As.addScaledVector(Nr.sub(t),u))}t.add(As)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ys.copy(n.boundingSphere),ys.applyMatrix4(r),$n.copy(e.ray).recast(e.near),!(ys.containsPoint($n.origin)===!1&&($n.intersectSphere(ys,$o)===null||$n.origin.distanceToSquared($o)>(e.far-e.near)**2))&&(Zo.copy(r).invert(),$n.copy(e.ray).applyMatrix4(Zo),!(n.boundingBox!==null&&$n.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,$n)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,p=r.attributes.normal,h=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=h.length;g<v;g++){const f=h[g],d=a[f.materialIndex],M=Math.max(f.start,m.start),E=Math.min(o.count,Math.min(f.start+f.count,m.start+m.count));for(let T=M,L=E;T<L;T+=3){const A=o.getX(T),P=o.getX(T+1),x=o.getX(T+2);s=Rs(this,d,e,n,c,u,p,A,P,x),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(o.count,m.start+m.count);for(let f=g,d=v;f<d;f+=3){const M=o.getX(f),E=o.getX(f+1),T=o.getX(f+2);s=Rs(this,a,e,n,c,u,p,M,E,T),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=h.length;g<v;g++){const f=h[g],d=a[f.materialIndex],M=Math.max(f.start,m.start),E=Math.min(l.count,Math.min(f.start+f.count,m.start+m.count));for(let T=M,L=E;T<L;T+=3){const A=T,P=T+1,x=T+2;s=Rs(this,d,e,n,c,u,p,A,P,x),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(l.count,m.start+m.count);for(let f=g,d=v;f<d;f+=3){const M=f,E=f+1,T=f+2;s=Rs(this,a,e,n,c,u,p,M,E,T),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}}}function fu(i,e,t,n,s,r,a,o){let l;if(e.side===Ot?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Wn,o),l===null)return null;ws.copy(o),ws.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(ws);return c<t.near||c>t.far?null:{distance:c,point:ws.clone(),object:i}}function Rs(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,bs),i.getVertexPosition(l,Es),i.getVertexPosition(c,Ts);const u=fu(i,e,t,n,bs,Es,Ts,Jo);if(u){const p=new I;Wt.getBarycoord(Jo,bs,Es,Ts,p),s&&(u.uv=Wt.getInterpolatedAttribute(s,o,l,c,p,new Ce)),r&&(u.uv1=Wt.getInterpolatedAttribute(r,o,l,c,p,new Ce)),a&&(u.normal=Wt.getInterpolatedAttribute(a,o,l,c,p,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new I,materialIndex:0};Wt.getNormal(bs,Es,Ts,h.normal),u.face=h,u.barycoord=p}return u}class pu extends Dt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=wt,u=wt,p,h){super(null,a,o,l,c,u,s,r,p,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Fr=new I,mu=new I,gu=new Ne;class zn{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Fr.subVectors(n,t).cross(mu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Fr),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||gu.getNormalMatrix(e),s=this.coplanarPoint(Fr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Jn=new ar,_u=new Ce(.5,.5),Cs=new I;class ao{constructor(e=new zn,t=new zn,n=new zn,s=new zn,r=new zn,a=new zn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=cn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],p=r[5],h=r[6],m=r[7],g=r[8],v=r[9],f=r[10],d=r[11],M=r[12],E=r[13],T=r[14],L=r[15];if(s[0].setComponents(c-a,m-u,d-g,L-M).normalize(),s[1].setComponents(c+a,m+u,d+g,L+M).normalize(),s[2].setComponents(c+o,m+p,d+v,L+E).normalize(),s[3].setComponents(c-o,m-p,d-v,L-E).normalize(),n)s[4].setComponents(l,h,f,T).normalize(),s[5].setComponents(c-l,m-h,d-f,L-T).normalize();else if(s[4].setComponents(c-l,m-h,d-f,L-T).normalize(),t===cn)s[5].setComponents(c+l,m+h,d+f,L+T).normalize();else if(t===is)s[5].setComponents(l,h,f,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Jn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Jn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Jn)}intersectsSprite(e){Jn.center.set(0,0,0);const t=_u.distanceTo(e.center);return Jn.radius=.7071067811865476+t,Jn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Jn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Cs.x=s.normal.x>0?e.max.x:e.min.x,Cs.y=s.normal.y>0?e.max.y:e.min.y,Cs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Cs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Fi extends ai{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new He(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const tr=new I,nr=new I,Qo=new dt,Ki=new ro,Ps=new ar,Or=new I,el=new I;class Ga extends bt{constructor(e=new Mt,t=new Fi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)tr.fromBufferAttribute(t,s-1),nr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=tr.distanceTo(nr);e.setAttribute("lineDistance",new ct(n,1))}else Le("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ps.copy(n.boundingSphere),Ps.applyMatrix4(s),Ps.radius+=r,e.ray.intersectsSphere(Ps)===!1)return;Qo.copy(s).invert(),Ki.copy(e.ray).applyMatrix4(Qo);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const m=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let v=m,f=g-1;v<f;v+=c){const d=u.getX(v),M=u.getX(v+1),E=Ls(this,e,Ki,l,d,M,v);E&&t.push(E)}if(this.isLineLoop){const v=u.getX(g-1),f=u.getX(m),d=Ls(this,e,Ki,l,v,f,g-1);d&&t.push(d)}}else{const m=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=m,f=g-1;v<f;v+=c){const d=Ls(this,e,Ki,l,v,v+1,v);d&&t.push(d)}if(this.isLineLoop){const v=Ls(this,e,Ki,l,g-1,m,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Ls(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(tr.fromBufferAttribute(o,s),nr.fromBufferAttribute(o,r),t.distanceSqToSegment(tr,nr,Or,el)>n)return;Or.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Or);if(!(c<e.near||c>e.far))return{distance:c,point:el.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const tl=new I,nl=new I;class oo extends Ga{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)tl.fromBufferAttribute(t,s),nl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+tl.distanceTo(nl);e.setAttribute("lineDistance",new ct(n,1))}else Le("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class lc extends Dt{constructor(e=[],t=si,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class cc extends Dt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Oi extends Dt{constructor(e,t,n=mn,s,r,a,o=wt,l=wt,c,u=Cn,p=1){if(u!==Cn&&u!==ni)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:p};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new so(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class xu extends Oi{constructor(e,t=mn,n=si,s,r,a=wt,o=wt,l,c=Cn){const u={width:e,height:e,depth:1},p=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class hc extends Dt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Vn extends Mt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],p=[];let h=0,m=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ct(c,3)),this.setAttribute("normal",new ct(u,3)),this.setAttribute("uv",new ct(p,2));function g(v,f,d,M,E,T,L,A,P,x,w){const F=T/P,R=L/x,N=T/2,H=L/2,q=A/2,U=P+1,k=x+1;let G=0,ee=0;const te=new I;for(let de=0;de<k;de++){const Y=de*R-H;for(let Q=0;Q<U;Q++){const ye=Q*F-N;te[v]=ye*M,te[f]=Y*E,te[d]=q,c.push(te.x,te.y,te.z),te[v]=0,te[f]=0,te[d]=A>0?1:-1,u.push(te.x,te.y,te.z),p.push(Q/P),p.push(1-de/x),G+=1}}for(let de=0;de<x;de++)for(let Y=0;Y<P;Y++){const Q=h+Y+U*de,ye=h+Y+U*(de+1),ke=h+(Y+1)+U*(de+1),Ee=h+(Y+1)+U*de;l.push(Q,ye,Ee),l.push(ye,ke,Ee),ee+=6}o.addGroup(m,ee,w),m+=ee,h+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Vn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Ii extends Mt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],p=[],h=[],m=[];let g=0;const v=[],f=n/2;let d=0;M(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new ct(p,3)),this.setAttribute("normal",new ct(h,3)),this.setAttribute("uv",new ct(m,2));function M(){const T=new I,L=new I;let A=0;const P=(t-e)/n;for(let x=0;x<=r;x++){const w=[],F=x/r,R=F*(t-e)+e;for(let N=0;N<=s;N++){const H=N/s,q=H*l+o,U=Math.sin(q),k=Math.cos(q);L.x=R*U,L.y=-F*n+f,L.z=R*k,p.push(L.x,L.y,L.z),T.set(U,P,k).normalize(),h.push(T.x,T.y,T.z),m.push(H,1-F),w.push(g++)}v.push(w)}for(let x=0;x<s;x++)for(let w=0;w<r;w++){const F=v[w][x],R=v[w+1][x],N=v[w+1][x+1],H=v[w][x+1];(e>0||w!==0)&&(u.push(F,R,H),A+=3),(t>0||w!==r-1)&&(u.push(R,N,H),A+=3)}c.addGroup(d,A,0),d+=A}function E(T){const L=g,A=new Ce,P=new I;let x=0;const w=T===!0?e:t,F=T===!0?1:-1;for(let N=1;N<=s;N++)p.push(0,f*F,0),h.push(0,F,0),m.push(.5,.5),g++;const R=g;for(let N=0;N<=s;N++){const q=N/s*l+o,U=Math.cos(q),k=Math.sin(q);P.x=w*k,P.y=f*F,P.z=w*U,p.push(P.x,P.y,P.z),h.push(0,F,0),A.x=U*.5+.5,A.y=k*.5*F+.5,m.push(A.x,A.y),g++}for(let N=0;N<s;N++){const H=L+N,q=R+N;T===!0?u.push(q,q+1,H):u.push(q+1,q,H),x+=3}c.addGroup(d,x,T===!0?1:2),d+=x}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ii(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class lo extends Ii{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new lo(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}const Ds=new I,Is=new I,Br=new I,Us=new Wt;class vu extends Mt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(Li*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],u=["a","b","c"],p=new Array(3),h={},m=[];for(let g=0;g<l;g+=3){a?(c[0]=a.getX(g),c[1]=a.getX(g+1),c[2]=a.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:v,b:f,c:d}=Us;if(v.fromBufferAttribute(o,c[0]),f.fromBufferAttribute(o,c[1]),d.fromBufferAttribute(o,c[2]),Us.getNormal(Br),p[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,p[1]=`${Math.round(f.x*s)},${Math.round(f.y*s)},${Math.round(f.z*s)}`,p[2]=`${Math.round(d.x*s)},${Math.round(d.y*s)},${Math.round(d.z*s)}`,!(p[0]===p[1]||p[1]===p[2]||p[2]===p[0]))for(let M=0;M<3;M++){const E=(M+1)%3,T=p[M],L=p[E],A=Us[u[M]],P=Us[u[E]],x=`${T}_${L}`,w=`${L}_${T}`;w in h&&h[w]?(Br.dot(h[w].normal)<=r&&(m.push(A.x,A.y,A.z),m.push(P.x,P.y,P.z)),h[w]=null):x in h||(h[x]={index0:c[M],index1:c[E],normal:Br.clone()})}}for(const g in h)if(h[g]){const{index0:v,index1:f}=h[g];Ds.fromBufferAttribute(o,v),Is.fromBufferAttribute(o,f),m.push(Ds.x,Ds.y,Ds.z),m.push(Is.x,Is.y,Is.z)}this.setAttribute("position",new ct(m,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Bi extends Mt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,p=e/o,h=t/l,m=[],g=[],v=[],f=[];for(let d=0;d<u;d++){const M=d*h-a;for(let E=0;E<c;E++){const T=E*p-r;g.push(T,-M,0),v.push(0,0,1),f.push(E/o),f.push(1-d/l)}}for(let d=0;d<l;d++)for(let M=0;M<o;M++){const E=M+c*d,T=M+c*(d+1),L=M+1+c*(d+1),A=M+1+c*d;m.push(E,T,A),m.push(T,L,A)}this.setIndex(m),this.setAttribute("position",new ct(g,3)),this.setAttribute("normal",new ct(v,3)),this.setAttribute("uv",new ct(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bi(e.width,e.height,e.widthSegments,e.heightSegments)}}class co extends Mt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],l=[],c=[],u=[];let p=e;const h=(t-e)/s,m=new I,g=new Ce;for(let v=0;v<=s;v++){for(let f=0;f<=n;f++){const d=r+f/n*a;m.x=p*Math.cos(d),m.y=p*Math.sin(d),l.push(m.x,m.y,m.z),c.push(0,0,1),g.x=(m.x/t+1)/2,g.y=(m.y/t+1)/2,u.push(g.x,g.y)}p+=h}for(let v=0;v<s;v++){const f=v*(n+1);for(let d=0;d<n;d++){const M=d+f,E=M,T=M+n+1,L=M+n+2,A=M+1;o.push(E,T,A),o.push(T,L,A)}}this.setIndex(o),this.setAttribute("position",new ct(l,3)),this.setAttribute("normal",new ct(c,3)),this.setAttribute("uv",new ct(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new co(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class as extends Mt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],p=new I,h=new I,m=[],g=[],v=[],f=[];for(let d=0;d<=n;d++){const M=[],E=d/n;let T=0;d===0&&a===0?T=.5/t:d===n&&l===Math.PI&&(T=-.5/t);for(let L=0;L<=t;L++){const A=L/t;p.x=-e*Math.cos(s+A*r)*Math.sin(a+E*o),p.y=e*Math.cos(a+E*o),p.z=e*Math.sin(s+A*r)*Math.sin(a+E*o),g.push(p.x,p.y,p.z),h.copy(p).normalize(),v.push(h.x,h.y,h.z),f.push(A+T,1-E),M.push(c++)}u.push(M)}for(let d=0;d<n;d++)for(let M=0;M<t;M++){const E=u[d][M+1],T=u[d][M],L=u[d+1][M],A=u[d+1][M+1];(d!==0||a>0)&&m.push(E,T,A),(d!==n-1||l<Math.PI)&&m.push(T,L,A)}this.setIndex(m),this.setAttribute("position",new ct(g,3)),this.setAttribute("normal",new ct(v,3)),this.setAttribute("uv",new ct(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new as(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function zi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(il(s))s.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(il(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ut(i){const e={};for(let t=0;t<i.length;t++){const n=zi(i[t]);for(const s in n)e[s]=n[s]}return e}function il(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Mu(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function uc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}const Su={clone:zi,merge:Ut};var yu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class gn extends ai{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yu,this.fragmentShader=bu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=zi(e.uniforms),this.uniformsGroups=Mu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Eu extends gn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class dc extends ai{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new He(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Oa,this.normalScale=new Ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Tu extends dc{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return We(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new He(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new He(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new He(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Au extends ai{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=xh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class wu extends ai{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Ru extends Fi{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}}class ho extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new He(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Cu extends ho{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new He(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const zr=new dt,sl=new I,rl=new I;class Pu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ce(512,512),this.mapType=Vt,this.map=null,this.mapPass=null,this.matrix=new dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ao,this._frameExtents=new Ce(1,1),this._viewportCount=1,this._viewports=[new mt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;sl.setFromMatrixPosition(e.matrixWorld),t.position.copy(sl),rl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rl),t.updateMatrixWorld(),zr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zr,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===is||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(zr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ns=new I,Fs=new Xn,rn=new I;class fc extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new dt,this.projectionMatrix=new dt,this.projectionMatrixInverse=new dt,this.coordinateSystem=cn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ns,Fs,rn),rn.x===1&&rn.y===1&&rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ns,Fs,rn.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(Ns,Fs,rn),rn.x===1&&rn.y===1&&rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ns,Fs,rn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Bn=new I,al=new Ce,ol=new Ce;class jt extends fc{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ss*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Li*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ss*2*Math.atan(Math.tan(Li*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Bn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Bn.x,Bn.y).multiplyScalar(-e/Bn.z),Bn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bn.x,Bn.y).multiplyScalar(-e/Bn.z)}getViewSize(e,t){return this.getViewBounds(e,al,ol),t.subVectors(ol,al)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Li*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class uo extends fc{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Lu extends Pu{constructor(){super(new uo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ll extends ho{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new Lu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class Du extends ho{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}const Ei=-90,Ti=1;class Iu extends bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new jt(Ei,Ti,e,t);s.layers=this.layers,this.add(s);const r=new jt(Ei,Ti,e,t);r.layers=this.layers,this.add(r);const a=new jt(Ei,Ti,e,t);a.layers=this.layers,this.add(a);const o=new jt(Ei,Ti,e,t);o.layers=this.layers,this.add(o);const l=new jt(Ei,Ti,e,t);l.layers=this.layers,this.add(l);const c=new jt(Ei,Ti,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===cn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===is)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,p=e.getRenderTarget(),h=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let f=!1;e.isWebGLRenderer===!0?f=e.state.buffers.depth.getReversed():f=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(p,h,m),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Uu extends jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class cl{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=We(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(We(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Mo=class{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};let hl=Mo;(()=>{Mo.prototype.isMatrix2=!0})();class Nu extends oo{constructor(e=10,t=10,n=4473924,s=8947848){n=new He(n),s=new He(s);const r=t/2,a=e/t,o=e/2,l=[],c=[];for(let h=0,m=0,g=-o;h<=t;h++,g+=a){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);const v=h===r?n:s;v.toArray(c,m),m+=3,v.toArray(c,m),m+=3,v.toArray(c,m),m+=3,v.toArray(c,m),m+=3}const u=new Mt;u.setAttribute("position",new ct(l,3)),u.setAttribute("color",new ct(c,3));const p=new Fi({vertexColors:!0,toneMapped:!1});super(u,p),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Fu extends oo{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new Mt;s.setAttribute("position",new ct(t,3)),s.setAttribute("color",new ct(n,3));const r=new Fi({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new He,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Ou extends Yn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Le("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function ul(i,e,t,n){const s=Bu(n);switch(t){case $l:return i*e;case Ql:return i*e/s.components*s.byteLength;case Ja:return i*e/s.components*s.byteLength;case ri:return i*e*2/s.components*s.byteLength;case Qa:return i*e*2/s.components*s.byteLength;case Jl:return i*e*3/s.components*s.byteLength;case tn:return i*e*4/s.components*s.byteLength;case eo:return i*e*4/s.components*s.byteLength;case ks:case Vs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ws:case Xs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case la:case ha:return Math.max(i,16)*Math.max(e,8)/4;case oa:case ca:return Math.max(i,8)*Math.max(e,8)/2;case ua:case da:case pa:case ma:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case fa:case js:case ga:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case _a:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case xa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case va:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ma:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ya:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ba:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Aa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case wa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ca:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Pa:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case La:case Da:case Ia:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ua:case Na:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Ks:case Fa:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Bu(i){switch(i){case Vt:case Yl:return{byteLength:1,components:1};case ts:case jl:case Rn:return{byteLength:2,components:1};case Za:case $a:return{byteLength:2,components:4};case mn:case Ka:case ln:return{byteLength:4,components:1};case Kl:case Zl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ya}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ya);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function pc(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function zu(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,p=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,l,c){const u=l.array,p=l.updateRanges;if(i.bindBuffer(c,o),p.length===0)i.bufferSubData(c,0,u);else{p.sort((m,g)=>m.start-g.start);let h=0;for(let m=1;m<p.length;m++){const g=p[h],v=p[m];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++h,p[h]=v)}p.length=h+1;for(let m=0,g=p.length;m<g;m++){const v=p[m];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Gu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hu=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ku=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Vu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Xu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,qu=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Yu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ju=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Ku=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Zu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$u=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ju=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Qu=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ed=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,td=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,nd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,id=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,sd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,rd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ad=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,od=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ld=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,cd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,hd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ud=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,dd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,fd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,pd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,md=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,gd="gl_FragColor = linearToOutputTexel( gl_FragColor );",_d=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,xd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,vd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Md=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Sd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,yd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,bd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ed=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Td=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ad=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Rd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Cd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Pd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ld=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Dd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Id=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ud=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Nd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Fd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Od=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Bd=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,zd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Gd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Hd=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,kd=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Vd=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wd=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xd=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qd=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Yd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,jd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Kd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Zd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$d=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Qd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ef=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,tf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,sf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,af=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,of=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,hf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,uf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,df=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ff=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,pf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,mf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,_f=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,xf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Ef=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Tf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Af=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,wf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Rf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Cf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Pf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Lf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Df=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,If=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Uf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Nf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ff=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Of=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,zf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Gf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Hf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,kf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Wf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,jf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Kf=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Zf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,$f=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Jf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ep=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,tp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,np=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ip=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,ap=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,op=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,lp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,cp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,up=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,dp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,gp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_p=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:Gu,alphahash_pars_fragment:Hu,alphamap_fragment:ku,alphamap_pars_fragment:Vu,alphatest_fragment:Wu,alphatest_pars_fragment:Xu,aomap_fragment:qu,aomap_pars_fragment:Yu,batching_pars_vertex:ju,batching_vertex:Ku,begin_vertex:Zu,beginnormal_vertex:$u,bsdfs:Ju,iridescence_fragment:Qu,bumpmap_pars_fragment:ed,clipping_planes_fragment:td,clipping_planes_pars_fragment:nd,clipping_planes_pars_vertex:id,clipping_planes_vertex:sd,color_fragment:rd,color_pars_fragment:ad,color_pars_vertex:od,color_vertex:ld,common:cd,cube_uv_reflection_fragment:hd,defaultnormal_vertex:ud,displacementmap_pars_vertex:dd,displacementmap_vertex:fd,emissivemap_fragment:pd,emissivemap_pars_fragment:md,colorspace_fragment:gd,colorspace_pars_fragment:_d,envmap_fragment:xd,envmap_common_pars_fragment:vd,envmap_pars_fragment:Md,envmap_pars_vertex:Sd,envmap_physical_pars_fragment:Dd,envmap_vertex:yd,fog_vertex:bd,fog_pars_vertex:Ed,fog_fragment:Td,fog_pars_fragment:Ad,gradientmap_pars_fragment:wd,lightmap_pars_fragment:Rd,lights_lambert_fragment:Cd,lights_lambert_pars_fragment:Pd,lights_pars_begin:Ld,lights_toon_fragment:Id,lights_toon_pars_fragment:Ud,lights_phong_fragment:Nd,lights_phong_pars_fragment:Fd,lights_physical_fragment:Od,lights_physical_pars_fragment:Bd,lights_fragment_begin:zd,lights_fragment_maps:Gd,lights_fragment_end:Hd,lightprobes_pars_fragment:kd,logdepthbuf_fragment:Vd,logdepthbuf_pars_fragment:Wd,logdepthbuf_pars_vertex:Xd,logdepthbuf_vertex:qd,map_fragment:Yd,map_pars_fragment:jd,map_particle_fragment:Kd,map_particle_pars_fragment:Zd,metalnessmap_fragment:$d,metalnessmap_pars_fragment:Jd,morphinstance_vertex:Qd,morphcolor_vertex:ef,morphnormal_vertex:tf,morphtarget_pars_vertex:nf,morphtarget_vertex:sf,normal_fragment_begin:rf,normal_fragment_maps:af,normal_pars_fragment:of,normal_pars_vertex:lf,normal_vertex:cf,normalmap_pars_fragment:hf,clearcoat_normal_fragment_begin:uf,clearcoat_normal_fragment_maps:df,clearcoat_pars_fragment:ff,iridescence_pars_fragment:pf,opaque_fragment:mf,packing:gf,premultiplied_alpha_fragment:_f,project_vertex:xf,dithering_fragment:vf,dithering_pars_fragment:Mf,roughnessmap_fragment:Sf,roughnessmap_pars_fragment:yf,shadowmap_pars_fragment:bf,shadowmap_pars_vertex:Ef,shadowmap_vertex:Tf,shadowmask_pars_fragment:Af,skinbase_vertex:wf,skinning_pars_vertex:Rf,skinning_vertex:Cf,skinnormal_vertex:Pf,specularmap_fragment:Lf,specularmap_pars_fragment:Df,tonemapping_fragment:If,tonemapping_pars_fragment:Uf,transmission_fragment:Nf,transmission_pars_fragment:Ff,uv_pars_fragment:Of,uv_pars_vertex:Bf,uv_vertex:zf,worldpos_vertex:Gf,background_vert:Hf,background_frag:kf,backgroundCube_vert:Vf,backgroundCube_frag:Wf,cube_vert:Xf,cube_frag:qf,depth_vert:Yf,depth_frag:jf,distance_vert:Kf,distance_frag:Zf,equirect_vert:$f,equirect_frag:Jf,linedashed_vert:Qf,linedashed_frag:ep,meshbasic_vert:tp,meshbasic_frag:np,meshlambert_vert:ip,meshlambert_frag:sp,meshmatcap_vert:rp,meshmatcap_frag:ap,meshnormal_vert:op,meshnormal_frag:lp,meshphong_vert:cp,meshphong_frag:hp,meshphysical_vert:up,meshphysical_frag:dp,meshtoon_vert:fp,meshtoon_frag:pp,points_vert:mp,points_frag:gp,shadow_vert:_p,shadow_frag:xp,sprite_vert:vp,sprite_frag:Mp},pe={common:{diffuse:{value:new He(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ne}},envmap:{envMap:{value:null},envMapRotation:{value:new Ne},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ne},normalScale:{value:new Ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new He(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new He(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0},uvTransform:{value:new Ne}},sprite:{diffuse:{value:new He(16777215)},opacity:{value:1},center:{value:new Ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}}},on={basic:{uniforms:Ut([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Ut([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new He(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Ut([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new He(0)},specular:{value:new He(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Ut([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new He(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Ut([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new He(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Ut([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Ut([pe.points,pe.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Ut([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Ut([pe.common,pe.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Ut([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Ut([pe.sprite,pe.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new Ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ne}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Ut([pe.common,pe.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Ut([pe.lights,pe.fog,{color:{value:new He(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};on.physical={uniforms:Ut([on.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ne},clearcoatNormalScale:{value:new Ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ne},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ne},sheen:{value:0},sheenColor:{value:new He(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ne},transmissionSamplerSize:{value:new Ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ne},attenuationDistance:{value:0},attenuationColor:{value:new He(0)},specularColor:{value:new He(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ne},anisotropyVector:{value:new Ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ne}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const Os={r:0,b:0,g:0},Sp=new dt,mc=new Ne;mc.set(-1,0,0,0,1,0,0,0,1);function yp(i,e,t,n,s,r){const a=new He(0);let o=s===!0?0:1,l,c,u=null,p=0,h=null;function m(M){let E=M.isScene===!0?M.background:null;if(E&&E.isTexture){const T=M.backgroundBlurriness>0;E=e.get(E,T)}return E}function g(M){let E=!1;const T=m(M);T===null?f(a,o):T&&T.isColor&&(f(T,1),E=!0);const L=i.xr.getEnvironmentBlendMode();L==="additive"?t.buffers.color.setClear(0,0,0,1,r):L==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(M,E){const T=m(E);T&&(T.isCubeTexture||T.mapping===rr)?(c===void 0&&(c=new ut(new Vn(1,1,1),new gn({name:"BackgroundCubeMaterial",uniforms:zi(on.backgroundCube.uniforms),vertexShader:on.backgroundCube.vertexShader,fragmentShader:on.backgroundCube.fragmentShader,side:Ot,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(L,A,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=T,c.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Sp.makeRotationFromEuler(E.backgroundRotation)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(mc),c.material.toneMapped=qe.getTransfer(T.colorSpace)!==Qe,(u!==T||p!==T.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=T,p=T.version,h=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):T&&T.isTexture&&(l===void 0&&(l=new ut(new Bi(2,2),new gn({name:"BackgroundMaterial",uniforms:zi(on.background.uniforms),vertexShader:on.background.vertexShader,fragmentShader:on.background.fragmentShader,side:Wn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=T,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=qe.getTransfer(T.colorSpace)!==Qe,T.matrixAutoUpdate===!0&&T.updateMatrix(),l.material.uniforms.uvTransform.value.copy(T.matrix),(u!==T||p!==T.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=T,p=T.version,h=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function f(M,E){M.getRGB(Os,uc(i)),t.buffers.color.setClear(Os.r,Os.g,Os.b,E,r)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,E=1){a.set(M),o=E,f(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,f(a,o)},render:g,addToRenderList:v,dispose:d}}function bp(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null);let r=s,a=!1;function o(R,N,H,q,U){let k=!1;const G=p(R,q,H,N);r!==G&&(r=G,c(r.object)),k=m(R,q,H,U),k&&g(R,q,H,U),U!==null&&e.update(U,i.ELEMENT_ARRAY_BUFFER),(k||a)&&(a=!1,T(R,N,H,q),U!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function l(){return i.createVertexArray()}function c(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function p(R,N,H,q){const U=q.wireframe===!0;let k=n[N.id];k===void 0&&(k={},n[N.id]=k);const G=R.isInstancedMesh===!0?R.id:0;let ee=k[G];ee===void 0&&(ee={},k[G]=ee);let te=ee[H.id];te===void 0&&(te={},ee[H.id]=te);let de=te[U];return de===void 0&&(de=h(l()),te[U]=de),de}function h(R){const N=[],H=[],q=[];for(let U=0;U<t;U++)N[U]=0,H[U]=0,q[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:H,attributeDivisors:q,object:R,attributes:{},index:null}}function m(R,N,H,q){const U=r.attributes,k=N.attributes;let G=0;const ee=H.getAttributes();for(const te in ee)if(ee[te].location>=0){const Y=U[te];let Q=k[te];if(Q===void 0&&(te==="instanceMatrix"&&R.instanceMatrix&&(Q=R.instanceMatrix),te==="instanceColor"&&R.instanceColor&&(Q=R.instanceColor)),Y===void 0||Y.attribute!==Q||Q&&Y.data!==Q.data)return!0;G++}return r.attributesNum!==G||r.index!==q}function g(R,N,H,q){const U={},k=N.attributes;let G=0;const ee=H.getAttributes();for(const te in ee)if(ee[te].location>=0){let Y=k[te];Y===void 0&&(te==="instanceMatrix"&&R.instanceMatrix&&(Y=R.instanceMatrix),te==="instanceColor"&&R.instanceColor&&(Y=R.instanceColor));const Q={};Q.attribute=Y,Y&&Y.data&&(Q.data=Y.data),U[te]=Q,G++}r.attributes=U,r.attributesNum=G,r.index=q}function v(){const R=r.newAttributes;for(let N=0,H=R.length;N<H;N++)R[N]=0}function f(R){d(R,0)}function d(R,N){const H=r.newAttributes,q=r.enabledAttributes,U=r.attributeDivisors;H[R]=1,q[R]===0&&(i.enableVertexAttribArray(R),q[R]=1),U[R]!==N&&(i.vertexAttribDivisor(R,N),U[R]=N)}function M(){const R=r.newAttributes,N=r.enabledAttributes;for(let H=0,q=N.length;H<q;H++)N[H]!==R[H]&&(i.disableVertexAttribArray(H),N[H]=0)}function E(R,N,H,q,U,k,G){G===!0?i.vertexAttribIPointer(R,N,H,U,k):i.vertexAttribPointer(R,N,H,q,U,k)}function T(R,N,H,q){v();const U=q.attributes,k=H.getAttributes(),G=N.defaultAttributeValues;for(const ee in k){const te=k[ee];if(te.location>=0){let de=U[ee];if(de===void 0&&(ee==="instanceMatrix"&&R.instanceMatrix&&(de=R.instanceMatrix),ee==="instanceColor"&&R.instanceColor&&(de=R.instanceColor)),de!==void 0){const Y=de.normalized,Q=de.itemSize,ye=e.get(de);if(ye===void 0)continue;const ke=ye.buffer,Ee=ye.type,Z=ye.bytesPerElement,he=Ee===i.INT||Ee===i.UNSIGNED_INT||de.gpuType===Ka;if(de.isInterleavedBufferAttribute){const se=de.data,Ae=se.stride,De=de.offset;if(se.isInstancedInterleavedBuffer){for(let Pe=0;Pe<te.locationSize;Pe++)d(te.location+Pe,se.meshPerAttribute);R.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let Pe=0;Pe<te.locationSize;Pe++)f(te.location+Pe);i.bindBuffer(i.ARRAY_BUFFER,ke);for(let Pe=0;Pe<te.locationSize;Pe++)E(te.location+Pe,Q/te.locationSize,Ee,Y,Ae*Z,(De+Q/te.locationSize*Pe)*Z,he)}else{if(de.isInstancedBufferAttribute){for(let se=0;se<te.locationSize;se++)d(te.location+se,de.meshPerAttribute);R.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let se=0;se<te.locationSize;se++)f(te.location+se);i.bindBuffer(i.ARRAY_BUFFER,ke);for(let se=0;se<te.locationSize;se++)E(te.location+se,Q/te.locationSize,Ee,Y,Q*Z,Q/te.locationSize*se*Z,he)}}else if(G!==void 0){const Y=G[ee];if(Y!==void 0)switch(Y.length){case 2:i.vertexAttrib2fv(te.location,Y);break;case 3:i.vertexAttrib3fv(te.location,Y);break;case 4:i.vertexAttrib4fv(te.location,Y);break;default:i.vertexAttrib1fv(te.location,Y)}}}}M()}function L(){w();for(const R in n){const N=n[R];for(const H in N){const q=N[H];for(const U in q){const k=q[U];for(const G in k)u(k[G].object),delete k[G];delete q[U]}}delete n[R]}}function A(R){if(n[R.id]===void 0)return;const N=n[R.id];for(const H in N){const q=N[H];for(const U in q){const k=q[U];for(const G in k)u(k[G].object),delete k[G];delete q[U]}}delete n[R.id]}function P(R){for(const N in n){const H=n[N];for(const q in H){const U=H[q];if(U[R.id]===void 0)continue;const k=U[R.id];for(const G in k)u(k[G].object),delete k[G];delete U[R.id]}}}function x(R){for(const N in n){const H=n[N],q=R.isInstancedMesh===!0?R.id:0,U=H[q];if(U!==void 0){for(const k in U){const G=U[k];for(const ee in G)u(G[ee].object),delete G[ee];delete U[k]}delete H[q],Object.keys(H).length===0&&delete n[N]}}}function w(){F(),a=!0,r!==s&&(r=s,c(r.object))}function F(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:w,resetDefaultState:F,dispose:L,releaseStatesOfGeometry:A,releaseStatesOfObject:x,releaseStatesOfProgram:P,initAttributes:v,enableAttribute:f,disableUnusedAttributes:M}}function Ep(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let m=0;m<u;m++)h+=c[m];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Tp(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const P=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==tn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){const x=P===Rn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==Vt&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==ln&&!x)}function l(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Le("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const p=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),f=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),L=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:h,maxTextures:m,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:f,maxAttributes:d,maxVertexUniforms:M,maxVaryings:E,maxFragmentUniforms:T,maxSamples:L,samples:A}}function Ap(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new zn,o=new Ne,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,h){const m=p.length!==0||h||n!==0||s;return s=h,n=p.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(p,h){t=u(p,h,0)},this.setState=function(p,h,m){const g=p.clippingPlanes,v=p.clipIntersection,f=p.clipShadows,d=i.get(p);if(!s||g===null||g.length===0||r&&!f)r?u(null):c();else{const M=r?0:n,E=M*4;let T=d.clippingState||null;l.value=T,T=u(g,h,E,m);for(let L=0;L!==E;++L)T[L]=t[L];d.clippingState=T,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(p,h,m,g){const v=p!==null?p.length:0;let f=null;if(v!==0){if(f=l.value,g!==!0||f===null){const d=m+v*4,M=h.matrixWorldInverse;o.getNormalMatrix(M),(f===null||f.length<d)&&(f=new Float32Array(d));for(let E=0,T=m;E!==v;++E,T+=4)a.copy(p[E]).applyMatrix4(M,o),a.normal.toArray(f,T),f[T+3]=a.constant}l.value=f,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,f}}const kn=4,dl=[.125,.215,.35,.446,.526,.582],ei=20,wp=256,Zi=new uo,fl=new He;let Gr=null,Hr=0,kr=0,Vr=!1;const Rp=new I;class pl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=Rp}=r;Gr=this._renderer.getRenderTarget(),Hr=this._renderer.getActiveCubeFace(),kr=this._renderer.getActiveMipmapLevel(),Vr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_l(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Gr,Hr,kr),this._renderer.xr.enabled=Vr,e.scissorTest=!1,Ai(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===si||e.mapping===Ni?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Gr=this._renderer.getRenderTarget(),Hr=this._renderer.getActiveCubeFace(),kr=this._renderer.getActiveMipmapLevel(),Vr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Rt,minFilter:Rt,generateMipmaps:!1,type:Rn,format:tn,colorSpace:Zs,depthBuffer:!1},s=ml(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ml(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Cp(r)),this._blurMaterial=Lp(r,e,t),this._ggxMaterial=Pp(r,e,t)}return s}_compileMaterial(e){const t=new ut(new Mt,e);this._renderer.compile(t,Zi)}_sceneToCubeUV(e,t,n,s,r){const l=new jt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],p=this._renderer,h=p.autoClear,m=p.toneMapping;p.getClearColor(fl),p.toneMapping=un,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ut(new Vn,new rs({name:"PMREM.Background",side:Ot,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,f=v.material;let d=!1;const M=e.background;M?M.isColor&&(f.color.copy(M),e.background=null,d=!0):(f.color.copy(fl),d=!0);for(let E=0;E<6;E++){const T=E%3;T===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[E],r.y,r.z)):T===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[E]));const L=this._cubeSize;Ai(s,T*L,E>2?L:0,L,L),p.setRenderTarget(s),d&&p.render(v,l),p.render(e,l)}p.toneMapping=m,p.autoClear=h,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===si||e.mapping===Ni;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=_l()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gl());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Ai(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Zi)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),p=Math.sqrt(c*c-u*u),h=0+c*1.25,m=p*h,{_lodMax:g}=this,v=this._sizeLods[n],f=3*v*(n>g-kn?n-g+kn:0),d=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=m,l.mipInt.value=g-t,Ai(r,f,d,3*v,2*v),s.setRenderTarget(r),s.render(o,Zi),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Ai(e,f,d,3*v,2*v),s.setRenderTarget(e),s.render(o,Zi)}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Ye("blur direction must be either latitudinal or longitudinal!");const u=3,p=this._lodMeshes[s];p.material=c;const h=c.uniforms,m=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*ei-1),v=r/g,f=isFinite(r)?1+Math.floor(u*v):ei;f>ei&&Le(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${ei}`);const d=[];let M=0;for(let P=0;P<ei;++P){const x=P/v,w=Math.exp(-x*x/2);d.push(w),P===0?M+=w:P<f&&(M+=2*w)}for(let P=0;P<d.length;P++)d[P]=d[P]/M;h.envMap.value=e.texture,h.samples.value=f,h.weights.value=d,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:E}=this;h.dTheta.value=g,h.mipInt.value=E-n;const T=this._sizeLods[s],L=3*T*(s>E-kn?s-E+kn:0),A=4*(this._cubeSize-T);Ai(t,L,A,3*T,2*T),l.setRenderTarget(t),l.render(p,Zi)}}function Cp(i){const e=[],t=[],n=[];let s=i;const r=i-kn+1+dl.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-kn?l=dl[a-i+kn-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),u=-c,p=1+c,h=[u,u,p,u,p,p,u,u,p,p,u,p],m=6,g=6,v=3,f=2,d=1,M=new Float32Array(v*g*m),E=new Float32Array(f*g*m),T=new Float32Array(d*g*m);for(let A=0;A<m;A++){const P=A%3*2/3-1,x=A>2?0:-1,w=[P,x,0,P+2/3,x,0,P+2/3,x+1,0,P,x,0,P+2/3,x+1,0,P,x+1,0];M.set(w,v*g*A),E.set(h,f*g*A);const F=[A,A,A,A,A,A];T.set(F,d*g*A)}const L=new Mt;L.setAttribute("position",new Bt(M,v)),L.setAttribute("uv",new Bt(E,f)),L.setAttribute("faceIndex",new Bt(T,d)),n.push(new ut(L,null)),s>kn&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function ml(i,e,t){const n=new dn(i,e,t);return n.texture.mapping=rr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ai(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Pp(i,e,t){return new gn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:wp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:or(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Tn,depthTest:!1,depthWrite:!1})}function Lp(i,e,t){const n=new Float32Array(ei),s=new I(0,1,0);return new gn({name:"SphericalGaussianBlur",defines:{n:ei,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:or(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Tn,depthTest:!1,depthWrite:!1})}function gl(){return new gn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:or(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Tn,depthTest:!1,depthWrite:!1})}function _l(){return new gn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:or(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Tn,depthTest:!1,depthWrite:!1})}function or(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class gc extends dn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new lc(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Vn(5,5,5),r=new gn({name:"CubemapFromEquirect",uniforms:zi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ot,blending:Tn});r.uniforms.tEquirect.value=t;const a=new ut(s,r),o=t.minFilter;return t.minFilter===ti&&(t.minFilter=Rt),new Iu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}function Dp(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,m=!1){return h==null?null:m?a(h):r(h)}function r(h){if(h&&h.isTexture){const m=h.mapping;if(m===ur||m===dr)if(e.has(h)){const g=e.get(h).texture;return o(g,h.mapping)}else{const g=h.image;if(g&&g.height>0){const v=new gc(g.height);return v.fromEquirectangularTexture(i,h),e.set(h,v),h.addEventListener("dispose",c),o(v.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){const m=h.mapping,g=m===ur||m===dr,v=m===si||m===Ni;if(g||v){let f=t.get(h);const d=f!==void 0?f.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return n===null&&(n=new pl(i)),f=g?n.fromEquirectangular(h,f):n.fromCubemap(h,f),f.texture.pmremVersion=h.pmremVersion,t.set(h,f),f.texture;if(f!==void 0)return f.texture;{const M=h.image;return g&&M&&M.height>0||v&&M&&l(M)?(n===null&&(n=new pl(i)),f=g?n.fromEquirectangular(h):n.fromCubemap(h),f.texture.pmremVersion=h.pmremVersion,t.set(h,f),h.addEventListener("dispose",u),f.texture):null}}}return h}function o(h,m){return m===ur?h.mapping=si:m===dr&&(h.mapping=Ni),h}function l(h){let m=0;const g=6;for(let v=0;v<g;v++)h[v]!==void 0&&m++;return m===g}function c(h){const m=h.target;m.removeEventListener("dispose",c);const g=e.get(m);g!==void 0&&(e.delete(m),g.dispose())}function u(h){const m=h.target;m.removeEventListener("dispose",u);const g=t.get(m);g!==void 0&&(t.delete(m),g.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:p}}function Ip(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&za("WebGLRenderer: "+n+" extension not supported."),s}}}function Up(i,e,t,n){const s={},r=new WeakMap;function a(p){const h=p.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",a),delete s[h.id];const m=r.get(h);m&&(e.remove(m),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(p,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(p){const h=p.attributes;for(const m in h)e.update(h[m],i.ARRAY_BUFFER)}function c(p){const h=[],m=p.index,g=p.attributes.position;let v=0;if(g===void 0)return;if(m!==null){const M=m.array;v=m.version;for(let E=0,T=M.length;E<T;E+=3){const L=M[E+0],A=M[E+1],P=M[E+2];h.push(L,A,A,P,P,L)}}else{const M=g.array;v=g.version;for(let E=0,T=M.length/3-1;E<T;E+=3){const L=E+0,A=E+1,P=E+2;h.push(L,A,A,P,P,L)}}const f=new(g.count>=65535?rc:sc)(h,1);f.version=v;const d=r.get(p);d&&e.remove(d),r.set(p,f)}function u(p){const h=r.get(p);if(h){const m=p.index;m!==null&&h.version<m.version&&c(p)}else c(p);return r.get(p)}return{get:o,update:l,getWireframeAttribute:u}}function Np(i,e,t){let n;function s(p){n=p}let r,a;function o(p){r=p.type,a=p.bytesPerElement}function l(p,h){i.drawElements(n,h,r,p*a),t.update(h,n,1)}function c(p,h,m){m!==0&&(i.drawElementsInstanced(n,h,r,p*a,m),t.update(h,n,m))}function u(p,h,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,p,0,m);let v=0;for(let f=0;f<m;f++)v+=h[f];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Fp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Ye("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Op(i,e,t){const n=new WeakMap,s=new mt;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=u!==void 0?u.length:0;let h=n.get(o);if(h===void 0||h.count!==p){let F=function(){x.dispose(),n.delete(o),o.removeEventListener("dispose",F)};var m=F;h!==void 0&&h.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,f=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let T=0;g===!0&&(T=1),v===!0&&(T=2),f===!0&&(T=3);let L=o.attributes.position.count*T,A=1;L>e.maxTextureSize&&(A=Math.ceil(L/e.maxTextureSize),L=e.maxTextureSize);const P=new Float32Array(L*A*4*p),x=new tc(P,L,A,p);x.type=ln,x.needsUpdate=!0;const w=T*4;for(let R=0;R<p;R++){const N=d[R],H=M[R],q=E[R],U=L*A*4*R;for(let k=0;k<N.count;k++){const G=k*w;g===!0&&(s.fromBufferAttribute(N,k),P[U+G+0]=s.x,P[U+G+1]=s.y,P[U+G+2]=s.z,P[U+G+3]=0),v===!0&&(s.fromBufferAttribute(H,k),P[U+G+4]=s.x,P[U+G+5]=s.y,P[U+G+6]=s.z,P[U+G+7]=0),f===!0&&(s.fromBufferAttribute(q,k),P[U+G+8]=s.x,P[U+G+9]=s.y,P[U+G+10]=s.z,P[U+G+11]=q.itemSize===4?s.w:1)}}h={count:p,texture:x,size:new Ce(L,A)},n.set(o,h),o.addEventListener("dispose",F)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let f=0;f<c.length;f++)g+=c[f];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Bp(i,e,t,n,s){let r=new WeakMap;function a(c){const u=s.render.frame,p=c.geometry,h=e.get(c,p);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const m=c.skeleton;r.get(m)!==u&&(m.update(),r.set(m,u))}return h}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const zp={[Gl]:"LINEAR_TONE_MAPPING",[ja]:"REINHARD_TONE_MAPPING",[Hl]:"CINEON_TONE_MAPPING",[kl]:"ACES_FILMIC_TONE_MAPPING",[Wl]:"AGX_TONE_MAPPING",[Xl]:"NEUTRAL_TONE_MAPPING",[Vl]:"CUSTOM_TONE_MAPPING"};function Gp(i,e,t,n,s){const r=new dn(e,t,{type:i,depthBuffer:n,stencilBuffer:s,depthTexture:n?new Oi(e,t):void 0}),a=new dn(e,t,{type:Rn,depthBuffer:!1,stencilBuffer:!1}),o=new Mt;o.setAttribute("position",new ct([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new ct([0,2,0,0,2,0],2));const l=new Eu({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new ut(o,l),u=new uo(-1,1,1,-1,0,1);let p=null,h=null,m=!1,g,v=null,f=[],d=!1;this.setSize=function(M,E){r.setSize(M,E),a.setSize(M,E);for(let T=0;T<f.length;T++){const L=f[T];L.setSize&&L.setSize(M,E)}},this.setEffects=function(M){f=M,d=f.length>0&&f[0].isRenderPass===!0;const E=r.width,T=r.height;for(let L=0;L<f.length;L++){const A=f[L];A.setSize&&A.setSize(E,T)}},this.begin=function(M,E){if(m||M.toneMapping===un&&f.length===0)return!1;if(v=E,E!==null){const T=E.width,L=E.height;(r.width!==T||r.height!==L)&&this.setSize(T,L)}return d===!1&&M.setRenderTarget(r),g=M.toneMapping,M.toneMapping=un,!0},this.hasRenderPass=function(){return d},this.end=function(M,E){M.toneMapping=g,m=!0;let T=r,L=a;for(let A=0;A<f.length;A++){const P=f[A];if(P.enabled!==!1&&(P.render(M,L,T,E),P.needsSwap!==!1)){const x=T;T=L,L=x}}if(p!==M.outputColorSpace||h!==M.toneMapping){p=M.outputColorSpace,h=M.toneMapping,l.defines={},qe.getTransfer(p)===Qe&&(l.defines.SRGB_TRANSFER="");const A=zp[h];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,M.setRenderTarget(v),M.render(c,u),v=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.depthTexture&&r.depthTexture.dispose(),r.dispose(),a.dispose(),o.dispose(),l.dispose()}}const _c=new Dt,Ha=new Oi(1,1),xc=new tc,vc=new Jh,Mc=new lc,xl=[],vl=[],Ml=new Float32Array(16),Sl=new Float32Array(9),yl=new Float32Array(4);function Hi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=xl[s];if(r===void 0&&(r=new Float32Array(s),xl[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Et(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Tt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function lr(i,e){let t=vl[e];t===void 0&&(t=new Int32Array(e),vl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Hp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function kp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2fv(this.addr,e),Tt(t,e)}}function Vp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;i.uniform3fv(this.addr,e),Tt(t,e)}}function Wp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4fv(this.addr,e),Tt(t,e)}}function Xp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Tt(t,e)}else{if(Et(t,n))return;yl.set(n),i.uniformMatrix2fv(this.addr,!1,yl),Tt(t,n)}}function qp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Tt(t,e)}else{if(Et(t,n))return;Sl.set(n),i.uniformMatrix3fv(this.addr,!1,Sl),Tt(t,n)}}function Yp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Tt(t,e)}else{if(Et(t,n))return;Ml.set(n),i.uniformMatrix4fv(this.addr,!1,Ml),Tt(t,n)}}function jp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Kp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2iv(this.addr,e),Tt(t,e)}}function Zp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3iv(this.addr,e),Tt(t,e)}}function $p(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4iv(this.addr,e),Tt(t,e)}}function Jp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Qp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2uiv(this.addr,e),Tt(t,e)}}function em(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3uiv(this.addr,e),Tt(t,e)}}function tm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4uiv(this.addr,e),Tt(t,e)}}function nm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ha.compareFunction=t.isReversedDepthBuffer()?no:to,r=Ha):r=_c,t.setTexture2D(e||r,s)}function im(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||vc,s)}function sm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Mc,s)}function rm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||xc,s)}function am(i){switch(i){case 5126:return Hp;case 35664:return kp;case 35665:return Vp;case 35666:return Wp;case 35674:return Xp;case 35675:return qp;case 35676:return Yp;case 5124:case 35670:return jp;case 35667:case 35671:return Kp;case 35668:case 35672:return Zp;case 35669:case 35673:return $p;case 5125:return Jp;case 36294:return Qp;case 36295:return em;case 36296:return tm;case 35678:case 36198:case 36298:case 36306:case 35682:return nm;case 35679:case 36299:case 36307:return im;case 35680:case 36300:case 36308:case 36293:return sm;case 36289:case 36303:case 36311:case 36292:return rm}}function om(i,e){i.uniform1fv(this.addr,e)}function lm(i,e){const t=Hi(e,this.size,2);i.uniform2fv(this.addr,t)}function cm(i,e){const t=Hi(e,this.size,3);i.uniform3fv(this.addr,t)}function hm(i,e){const t=Hi(e,this.size,4);i.uniform4fv(this.addr,t)}function um(i,e){const t=Hi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function dm(i,e){const t=Hi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function fm(i,e){const t=Hi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function pm(i,e){i.uniform1iv(this.addr,e)}function mm(i,e){i.uniform2iv(this.addr,e)}function gm(i,e){i.uniform3iv(this.addr,e)}function _m(i,e){i.uniform4iv(this.addr,e)}function xm(i,e){i.uniform1uiv(this.addr,e)}function vm(i,e){i.uniform2uiv(this.addr,e)}function Mm(i,e){i.uniform3uiv(this.addr,e)}function Sm(i,e){i.uniform4uiv(this.addr,e)}function ym(i,e,t){const n=this.cache,s=e.length,r=lr(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Tt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Ha:a=_c;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function bm(i,e,t){const n=this.cache,s=e.length,r=lr(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Tt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||vc,r[a])}function Em(i,e,t){const n=this.cache,s=e.length,r=lr(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Tt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Mc,r[a])}function Tm(i,e,t){const n=this.cache,s=e.length,r=lr(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),Tt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||xc,r[a])}function Am(i){switch(i){case 5126:return om;case 35664:return lm;case 35665:return cm;case 35666:return hm;case 35674:return um;case 35675:return dm;case 35676:return fm;case 5124:case 35670:return pm;case 35667:case 35671:return mm;case 35668:case 35672:return gm;case 35669:case 35673:return _m;case 5125:return xm;case 36294:return vm;case 36295:return Mm;case 36296:return Sm;case 35678:case 36198:case 36298:case 36306:case 35682:return ym;case 35679:case 36299:case 36307:return bm;case 35680:case 36300:case 36308:case 36293:return Em;case 36289:case 36303:case 36311:case 36292:return Tm}}class wm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=am(t.type)}}class Rm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Am(t.type)}}class Cm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const Wr=/(\w+)(\])?(\[|\.)?/g;function bl(i,e){i.seq.push(e),i.map[e.id]=e}function Pm(i,e,t){const n=i.name,s=n.length;for(Wr.lastIndex=0;;){const r=Wr.exec(n),a=Wr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){bl(t,c===void 0?new wm(o,i,e):new Rm(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new Cm(o),bl(t,p)),t=p}}}class qs{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Pm(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function El(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Lm=37297;let Dm=0;function Im(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Tl=new Ne;function Um(i){qe._getMatrix(Tl,qe.workingColorSpace,i);const e=`mat3( ${Tl.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(i)){case $s:return[e,"LinearTransferOETF"];case Qe:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Al(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Im(i.getShaderSource(e),o)}else return r}function Nm(i,e){const t=Um(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Fm={[Gl]:"Linear",[ja]:"Reinhard",[Hl]:"Cineon",[kl]:"ACESFilmic",[Wl]:"AgX",[Xl]:"Neutral",[Vl]:"Custom"};function Om(i,e){const t=Fm[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Bs=new I;function Bm(){qe.getLuminanceCoefficients(Bs);const i=Bs.x.toFixed(4),e=Bs.y.toFixed(4),t=Bs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function zm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qi).join(`
`)}function Gm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Hm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Qi(i){return i!==""}function wl(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Rl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const km=/^[ \t]*#include +<([\w\d./]+)>/gm;function ka(i){return i.replace(km,Wm)}const Vm=new Map;function Wm(i,e){let t=Ge[e];if(t===void 0){const n=Vm.get(e);if(n!==void 0)t=Ge[n],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return ka(t)}const Xm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Cl(i){return i.replace(Xm,qm)}function qm(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Pl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Ym={[Hs]:"SHADOWMAP_TYPE_PCF",[Ji]:"SHADOWMAP_TYPE_VSM"};function jm(i){return Ym[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Km={[si]:"ENVMAP_TYPE_CUBE",[Ni]:"ENVMAP_TYPE_CUBE",[rr]:"ENVMAP_TYPE_CUBE_UV"};function Zm(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Km[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const $m={[Ni]:"ENVMAP_MODE_REFRACTION"};function Jm(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":$m[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Qm={[zl]:"ENVMAP_BLENDING_MULTIPLY",[mh]:"ENVMAP_BLENDING_MIX",[gh]:"ENVMAP_BLENDING_ADD"};function eg(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Qm[i.combine]||"ENVMAP_BLENDING_NONE"}function tg(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function ng(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=jm(t),c=Zm(t),u=Jm(t),p=eg(t),h=tg(t),m=zm(t),g=Gm(r),v=s.createProgram();let f,d,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Qi).join(`
`),f.length>0&&(f+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Qi).join(`
`),d.length>0&&(d+=`
`)):(f=[Pl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qi).join(`
`),d=[Pl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+p:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==un?"#define TONE_MAPPING":"",t.toneMapping!==un?Ge.tonemapping_pars_fragment:"",t.toneMapping!==un?Om("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,Nm("linearToOutputTexel",t.outputColorSpace),Bm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qi).join(`
`)),a=ka(a),a=wl(a,t),a=Rl(a,t),o=ka(o),o=wl(o,t),o=Rl(o,t),a=Cl(a),o=Cl(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,f=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,d=["#define varying in",t.glslVersion===Uo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Uo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const E=M+f+a,T=M+d+o,L=El(s,s.VERTEX_SHADER,E),A=El(s,s.FRAGMENT_SHADER,T);s.attachShader(v,L),s.attachShader(v,A),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function P(R){if(i.debug.checkShaderErrors){const N=s.getProgramInfoLog(v)||"",H=s.getShaderInfoLog(L)||"",q=s.getShaderInfoLog(A)||"",U=N.trim(),k=H.trim(),G=q.trim();let ee=!0,te=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(ee=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,L,A);else{const de=Al(s,L,"vertex"),Y=Al(s,A,"fragment");Ye("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+U+`
`+de+`
`+Y)}else U!==""?Le("WebGLProgram: Program Info Log:",U):(k===""||G==="")&&(te=!1);te&&(R.diagnostics={runnable:ee,programLog:U,vertexShader:{log:k,prefix:f},fragmentShader:{log:G,prefix:d}})}s.deleteShader(L),s.deleteShader(A),x=new qs(s,v),w=Hm(s,v)}let x;this.getUniforms=function(){return x===void 0&&P(this),x};let w;this.getAttributes=function(){return w===void 0&&P(this),w};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=s.getProgramParameter(v,Lm)),F},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Dm++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=L,this.fragmentShader=A,this}let ig=0;class sg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new rg(e),t.set(e,n)),n}}class rg{constructor(e){this.id=ig++,this.code=e,this.usedTimes=0}}function ag(i){return i===ri||i===js||i===Ks}function og(i,e,t,n,s,r){const a=new nc,o=new sg,l=new Set,c=[],u=new Map,p=n.logarithmicDepthBuffer;let h=n.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,w,F,R,N,H){const q=R.fog,U=N.geometry,k=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,G=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,ee=e.get(x.envMap||k,G),te=!!ee&&ee.mapping===rr?ee.image.height:null,de=m[x.type];x.precision!==null&&(h=n.getMaxPrecision(x.precision),h!==x.precision&&Le("WebGLProgram.getParameters:",x.precision,"not supported, using",h,"instead."));const Y=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Q=Y!==void 0?Y.length:0;let ye=0;U.morphAttributes.position!==void 0&&(ye=1),U.morphAttributes.normal!==void 0&&(ye=2),U.morphAttributes.color!==void 0&&(ye=3);let ke,Ee,Z,he;if(de){const Fe=on[de];ke=Fe.vertexShader,Ee=Fe.fragmentShader}else ke=x.vertexShader,Ee=x.fragmentShader,o.update(x),Z=o.getVertexShaderID(x),he=o.getFragmentShaderID(x);const se=i.getRenderTarget(),Ae=i.state.buffers.depth.getReversed(),De=N.isInstancedMesh===!0,Pe=N.isBatchedMesh===!0,st=!!x.map,ze=!!x.matcap,Ze=!!ee,je=!!x.aoMap,Ue=!!x.lightMap,Je=!!x.bumpMap,ht=!!x.normalMap,zt=!!x.displacementMap,O=!!x.emissiveMap,St=!!x.metalnessMap,Xe=!!x.roughnessMap,ot=x.anisotropy>0,fe=x.clearcoat>0,ft=x.dispersion>0,b=x.iridescence>0,_=x.sheen>0,z=x.transmission>0,$=ot&&!!x.anisotropyMap,ie=fe&&!!x.clearcoatMap,re=fe&&!!x.clearcoatNormalMap,ue=fe&&!!x.clearcoatRoughnessMap,j=b&&!!x.iridescenceMap,J=b&&!!x.iridescenceThicknessMap,_e=_&&!!x.sheenColorMap,Me=_&&!!x.sheenRoughnessMap,le=!!x.specularMap,ae=!!x.specularColorMap,Ie=!!x.specularIntensityMap,Be=z&&!!x.transmissionMap,$e=z&&!!x.thicknessMap,D=!!x.gradientMap,oe=!!x.alphaMap,K=x.alphaTest>0,xe=!!x.alphaHash,ce=!!x.extensions;let ne=un;x.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(ne=i.toneMapping);const Te={shaderID:de,shaderType:x.type,shaderName:x.name,vertexShader:ke,fragmentShader:Ee,defines:x.defines,customVertexShaderID:Z,customFragmentShaderID:he,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:h,batching:Pe,batchingColor:Pe&&N._colorsTexture!==null,instancing:De,instancingColor:De&&N.instanceColor!==null,instancingMorph:De&&N.morphTexture!==null,outputColorSpace:se===null?i.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:qe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:st,matcap:ze,envMap:Ze,envMapMode:Ze&&ee.mapping,envMapCubeUVHeight:te,aoMap:je,lightMap:Ue,bumpMap:Je,normalMap:ht,displacementMap:zt,emissiveMap:O,normalMapObjectSpace:ht&&x.normalMapType===vh,normalMapTangentSpace:ht&&x.normalMapType===Oa,packedNormalMap:ht&&x.normalMapType===Oa&&ag(x.normalMap.format),metalnessMap:St,roughnessMap:Xe,anisotropy:ot,anisotropyMap:$,clearcoat:fe,clearcoatMap:ie,clearcoatNormalMap:re,clearcoatRoughnessMap:ue,dispersion:ft,iridescence:b,iridescenceMap:j,iridescenceThicknessMap:J,sheen:_,sheenColorMap:_e,sheenRoughnessMap:Me,specularMap:le,specularColorMap:ae,specularIntensityMap:Ie,transmission:z,transmissionMap:Be,thicknessMap:$e,gradientMap:D,opaque:x.transparent===!1&&x.blending===Pi&&x.alphaToCoverage===!1,alphaMap:oe,alphaTest:K,alphaHash:xe,combine:x.combine,mapUv:st&&g(x.map.channel),aoMapUv:je&&g(x.aoMap.channel),lightMapUv:Ue&&g(x.lightMap.channel),bumpMapUv:Je&&g(x.bumpMap.channel),normalMapUv:ht&&g(x.normalMap.channel),displacementMapUv:zt&&g(x.displacementMap.channel),emissiveMapUv:O&&g(x.emissiveMap.channel),metalnessMapUv:St&&g(x.metalnessMap.channel),roughnessMapUv:Xe&&g(x.roughnessMap.channel),anisotropyMapUv:$&&g(x.anisotropyMap.channel),clearcoatMapUv:ie&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:re&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ue&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:J&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:Me&&g(x.sheenRoughnessMap.channel),specularMapUv:le&&g(x.specularMap.channel),specularColorMapUv:ae&&g(x.specularColorMap.channel),specularIntensityMapUv:Ie&&g(x.specularIntensityMap.channel),transmissionMapUv:Be&&g(x.transmissionMap.channel),thicknessMapUv:$e&&g(x.thicknessMap.channel),alphaMapUv:oe&&g(x.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(ht||ot),vertexNormals:!!U.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!U.attributes.uv&&(st||oe),fog:!!q,useFog:x.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||U.attributes.normal===void 0&&ht===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:Ae,skinning:N.isSkinnedMesh===!0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:ye,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:ne,decodeVideoTexture:st&&x.map.isVideoTexture===!0&&qe.getTransfer(x.map.colorSpace)===Qe,decodeVideoTextureEmissive:O&&x.emissiveMap.isVideoTexture===!0&&qe.getTransfer(x.emissiveMap.colorSpace)===Qe,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Qt,flipSided:x.side===Ot,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ce&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ce&&x.extensions.multiDraw===!0||Pe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Te.vertexUv1s=l.has(1),Te.vertexUv2s=l.has(2),Te.vertexUv3s=l.has(3),l.clear(),Te}function f(x){const w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(const F in x.defines)w.push(F),w.push(x.defines[F]);return x.isRawShaderMaterial===!1&&(d(w,x),M(w,x),w.push(i.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function d(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapCubeUVHeight),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.morphAttributeCount),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function M(x,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),x.push(a.mask)}function E(x){const w=m[x.type];let F;if(w){const R=on[w];F=Su.clone(R.uniforms)}else F=x.uniforms;return F}function T(x,w){let F=u.get(w);return F!==void 0?++F.usedTimes:(F=new ng(i,w,x,s),c.push(F),u.set(w,F)),F}function L(x){if(--x.usedTimes===0){const w=c.indexOf(x);c[w]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function A(x){o.remove(x)}function P(){o.dispose()}return{getParameters:v,getProgramCacheKey:f,getUniforms:E,acquireProgram:T,releaseProgram:L,releaseShaderCache:A,programs:c,dispose:P}}function lg(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function cg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Ll(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Dl(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let m=0;return h.isInstancedMesh&&(m+=2),h.isSkinnedMesh&&(m+=1),m}function o(h,m,g,v,f,d){let M=i[e];return M===void 0?(M={id:h.id,object:h,geometry:m,material:g,materialVariant:a(h),groupOrder:v,renderOrder:h.renderOrder,z:f,group:d},i[e]=M):(M.id=h.id,M.object=h,M.geometry=m,M.material=g,M.materialVariant=a(h),M.groupOrder=v,M.renderOrder=h.renderOrder,M.z=f,M.group=d),e++,M}function l(h,m,g,v,f,d){const M=o(h,m,g,v,f,d);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):t.push(M)}function c(h,m,g,v,f,d){const M=o(h,m,g,v,f,d);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):t.unshift(M)}function u(h,m){t.length>1&&t.sort(h||cg),n.length>1&&n.sort(m||Ll),s.length>1&&s.sort(m||Ll)}function p(){for(let h=e,m=i.length;h<m;h++){const g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:p,sort:u}}function hg(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Dl,i.set(n,[a])):s>=r.length?(a=new Dl,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function ug(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new He};break;case"SpotLight":t={position:new I,direction:new I,color:new He,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new He,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new He,groundColor:new He};break;case"RectAreaLight":t={color:new He,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function dg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ce};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ce};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let fg=0;function pg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function mg(i){const e=new ug,t=dg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const s=new I,r=new dt,a=new dt;function o(c){let u=0,p=0,h=0;for(let w=0;w<9;w++)n.probe[w].set(0,0,0);let m=0,g=0,v=0,f=0,d=0,M=0,E=0,T=0,L=0,A=0,P=0;c.sort(pg);for(let w=0,F=c.length;w<F;w++){const R=c[w],N=R.color,H=R.intensity,q=R.distance;let U=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===ri?U=R.shadow.map.texture:U=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)u+=N.r*H,p+=N.g*H,h+=N.b*H;else if(R.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(R.sh.coefficients[k],H);P++}else if(R.isDirectionalLight){const k=e.get(R);if(k.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const G=R.shadow,ee=t.get(R);ee.shadowIntensity=G.intensity,ee.shadowBias=G.bias,ee.shadowNormalBias=G.normalBias,ee.shadowRadius=G.radius,ee.shadowMapSize=G.mapSize,n.directionalShadow[m]=ee,n.directionalShadowMap[m]=U,n.directionalShadowMatrix[m]=R.shadow.matrix,M++}n.directional[m]=k,m++}else if(R.isSpotLight){const k=e.get(R);k.position.setFromMatrixPosition(R.matrixWorld),k.color.copy(N).multiplyScalar(H),k.distance=q,k.coneCos=Math.cos(R.angle),k.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),k.decay=R.decay,n.spot[v]=k;const G=R.shadow;if(R.map&&(n.spotLightMap[L]=R.map,L++,G.updateMatrices(R),R.castShadow&&A++),n.spotLightMatrix[v]=G.matrix,R.castShadow){const ee=t.get(R);ee.shadowIntensity=G.intensity,ee.shadowBias=G.bias,ee.shadowNormalBias=G.normalBias,ee.shadowRadius=G.radius,ee.shadowMapSize=G.mapSize,n.spotShadow[v]=ee,n.spotShadowMap[v]=U,T++}v++}else if(R.isRectAreaLight){const k=e.get(R);k.color.copy(N).multiplyScalar(H),k.halfWidth.set(R.width*.5,0,0),k.halfHeight.set(0,R.height*.5,0),n.rectArea[f]=k,f++}else if(R.isPointLight){const k=e.get(R);if(k.color.copy(R.color).multiplyScalar(R.intensity),k.distance=R.distance,k.decay=R.decay,R.castShadow){const G=R.shadow,ee=t.get(R);ee.shadowIntensity=G.intensity,ee.shadowBias=G.bias,ee.shadowNormalBias=G.normalBias,ee.shadowRadius=G.radius,ee.shadowMapSize=G.mapSize,ee.shadowCameraNear=G.camera.near,ee.shadowCameraFar=G.camera.far,n.pointShadow[g]=ee,n.pointShadowMap[g]=U,n.pointShadowMatrix[g]=R.shadow.matrix,E++}n.point[g]=k,g++}else if(R.isHemisphereLight){const k=e.get(R);k.skyColor.copy(R.color).multiplyScalar(H),k.groundColor.copy(R.groundColor).multiplyScalar(H),n.hemi[d]=k,d++}}f>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pe.LTC_FLOAT_1,n.rectAreaLTC2=pe.LTC_FLOAT_2):(n.rectAreaLTC1=pe.LTC_HALF_1,n.rectAreaLTC2=pe.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=p,n.ambient[2]=h;const x=n.hash;(x.directionalLength!==m||x.pointLength!==g||x.spotLength!==v||x.rectAreaLength!==f||x.hemiLength!==d||x.numDirectionalShadows!==M||x.numPointShadows!==E||x.numSpotShadows!==T||x.numSpotMaps!==L||x.numLightProbes!==P)&&(n.directional.length=m,n.spot.length=v,n.rectArea.length=f,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=T,n.spotShadowMap.length=T,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=T+L-A,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=P,x.directionalLength=m,x.pointLength=g,x.spotLength=v,x.rectAreaLength=f,x.hemiLength=d,x.numDirectionalShadows=M,x.numPointShadows=E,x.numSpotShadows=T,x.numSpotMaps=L,x.numLightProbes=P,n.version=fg++)}function l(c,u){let p=0,h=0,m=0,g=0,v=0;const f=u.matrixWorldInverse;for(let d=0,M=c.length;d<M;d++){const E=c[d];if(E.isDirectionalLight){const T=n.directional[p];T.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(f),p++}else if(E.isSpotLight){const T=n.spot[m];T.position.setFromMatrixPosition(E.matrixWorld),T.position.applyMatrix4(f),T.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(f),m++}else if(E.isRectAreaLight){const T=n.rectArea[g];T.position.setFromMatrixPosition(E.matrixWorld),T.position.applyMatrix4(f),a.identity(),r.copy(E.matrixWorld),r.premultiply(f),a.extractRotation(r),T.halfWidth.set(E.width*.5,0,0),T.halfHeight.set(0,E.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),g++}else if(E.isPointLight){const T=n.point[h];T.position.setFromMatrixPosition(E.matrixWorld),T.position.applyMatrix4(f),h++}else if(E.isHemisphereLight){const T=n.hemi[v];T.direction.setFromMatrixPosition(E.matrixWorld),T.direction.transformDirection(f),v++}}}return{setup:o,setupView:l,state:n}}function Il(i){const e=new mg(i),t=[],n=[],s=[];function r(h){p.camera=h,t.length=0,n.length=0,s.length=0}function a(h){t.push(h)}function o(h){n.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}const p={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:p,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function gg(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Il(i),e.set(s,[o])):r>=a.length?(o=new Il(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const _g=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,vg=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],Mg=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Ul=new dt,$i=new I,Xr=new I;function Sg(i,e,t){let n=new ao;const s=new Ce,r=new Ce,a=new mt,o=new Au,l=new wu,c={},u=t.maxTextureSize,p={[Wn]:Ot,[Ot]:Wn,[Qt]:Qt},h=new gn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ce},radius:{value:4}},vertexShader:_g,fragmentShader:xg}),m=h.clone();m.defines.HORIZONTAL_PASS=1;const g=new Mt;g.setAttribute("position",new Bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new ut(g,h),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Hs;let d=this.type;this.render=function(A,P,x){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||A.length===0)return;this.type===Zc&&(Le("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Hs);const w=i.getRenderTarget(),F=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Tn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const H=d!==this.type;H&&P.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(U=>U.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,U=A.length;q<U;q++){const k=A[q],G=k.shadow;if(G===void 0){Le("WebGLShadowMap:",k,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const ee=G.getFrameExtents();s.multiply(ee),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ee.x),s.x=r.x*ee.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ee.y),s.y=r.y*ee.y,G.mapSize.y=r.y));const te=i.state.buffers.depth.getReversed();if(G.camera._reversedDepth=te,G.map===null||H===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Ji){if(k.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new dn(s.x,s.y,{format:ri,type:Rn,minFilter:Rt,magFilter:Rt,generateMipmaps:!1}),G.map.texture.name=k.name+".shadowMap",G.map.depthTexture=new Oi(s.x,s.y,ln),G.map.depthTexture.name=k.name+".shadowMapDepth",G.map.depthTexture.format=Cn,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=wt,G.map.depthTexture.magFilter=wt}else k.isPointLight?(G.map=new gc(s.x),G.map.depthTexture=new xu(s.x,mn)):(G.map=new dn(s.x,s.y),G.map.depthTexture=new Oi(s.x,s.y,mn)),G.map.depthTexture.name=k.name+".shadowMap",G.map.depthTexture.format=Cn,this.type===Hs?(G.map.depthTexture.compareFunction=te?no:to,G.map.depthTexture.minFilter=Rt,G.map.depthTexture.magFilter=Rt):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=wt,G.map.depthTexture.magFilter=wt);G.camera.updateProjectionMatrix()}const de=G.map.isWebGLCubeRenderTarget?6:1;for(let Y=0;Y<de;Y++){if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,Y),i.clear();else{Y===0&&(i.setRenderTarget(G.map),i.clear());const Q=G.getViewport(Y);a.set(r.x*Q.x,r.y*Q.y,r.x*Q.z,r.y*Q.w),N.viewport(a)}if(k.isPointLight){const Q=G.camera,ye=G.matrix,ke=k.distance||Q.far;ke!==Q.far&&(Q.far=ke,Q.updateProjectionMatrix()),$i.setFromMatrixPosition(k.matrixWorld),Q.position.copy($i),Xr.copy(Q.position),Xr.add(vg[Y]),Q.up.copy(Mg[Y]),Q.lookAt(Xr),Q.updateMatrixWorld(),ye.makeTranslation(-$i.x,-$i.y,-$i.z),Ul.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Ul,Q.coordinateSystem,Q.reversedDepth)}else G.updateMatrices(k);n=G.getFrustum(),T(P,x,G.camera,k,this.type)}G.isPointLightShadow!==!0&&this.type===Ji&&M(G,x),G.needsUpdate=!1}d=this.type,f.needsUpdate=!1,i.setRenderTarget(w,F,R)};function M(A,P){const x=e.update(v);h.defines.VSM_SAMPLES!==A.blurSamples&&(h.defines.VSM_SAMPLES=A.blurSamples,m.defines.VSM_SAMPLES=A.blurSamples,h.needsUpdate=!0,m.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new dn(s.x,s.y,{format:ri,type:Rn})),h.uniforms.shadow_pass.value=A.map.depthTexture,h.uniforms.resolution.value=A.mapSize,h.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(P,null,x,h,v,null),m.uniforms.shadow_pass.value=A.mapPass.texture,m.uniforms.resolution.value=A.mapSize,m.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(P,null,x,m,v,null)}function E(A,P,x,w){let F=null;const R=x.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(R!==void 0)F=R;else if(F=x.isPointLight===!0?l:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){const N=F.uuid,H=P.uuid;let q=c[N];q===void 0&&(q={},c[N]=q);let U=q[H];U===void 0&&(U=F.clone(),q[H]=U,P.addEventListener("dispose",L)),F=U}if(F.visible=P.visible,F.wireframe=P.wireframe,w===Ji?F.side=P.shadowSide!==null?P.shadowSide:P.side:F.side=P.shadowSide!==null?P.shadowSide:p[P.side],F.alphaMap=P.alphaMap,F.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,F.map=P.map,F.clipShadows=P.clipShadows,F.clippingPlanes=P.clippingPlanes,F.clipIntersection=P.clipIntersection,F.displacementMap=P.displacementMap,F.displacementScale=P.displacementScale,F.displacementBias=P.displacementBias,F.wireframeLinewidth=P.wireframeLinewidth,F.linewidth=P.linewidth,x.isPointLight===!0&&F.isMeshDistanceMaterial===!0){const N=i.properties.get(F);N.light=x}return F}function T(A,P,x,w,F){if(A.visible===!1)return;if(A.layers.test(P.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&F===Ji)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,A.matrixWorld);const H=e.update(A),q=A.material;if(Array.isArray(q)){const U=H.groups;for(let k=0,G=U.length;k<G;k++){const ee=U[k],te=q[ee.materialIndex];if(te&&te.visible){const de=E(A,te,w,F);A.onBeforeShadow(i,A,P,x,H,de,ee),i.renderBufferDirect(x,null,H,de,A,ee),A.onAfterShadow(i,A,P,x,H,de,ee)}}}else if(q.visible){const U=E(A,q,w,F);A.onBeforeShadow(i,A,P,x,H,U,null),i.renderBufferDirect(x,null,H,U,A,null),A.onAfterShadow(i,A,P,x,H,U,null)}}const N=A.children;for(let H=0,q=N.length;H<q;H++)T(N[H],P,x,w,F)}function L(A){A.target.removeEventListener("dispose",L);for(const x in c){const w=c[x],F=A.target.uuid;F in w&&(w[F].dispose(),delete w[F])}}}function yg(i,e){function t(){let D=!1;const oe=new mt;let K=null;const xe=new mt(0,0,0,0);return{setMask:function(ce){K!==ce&&!D&&(i.colorMask(ce,ce,ce,ce),K=ce)},setLocked:function(ce){D=ce},setClear:function(ce,ne,Te,Fe,gt){gt===!0&&(ce*=Fe,ne*=Fe,Te*=Fe),oe.set(ce,ne,Te,Fe),xe.equals(oe)===!1&&(i.clearColor(ce,ne,Te,Fe),xe.copy(oe))},reset:function(){D=!1,K=null,xe.set(-1,0,0,0)}}}function n(){let D=!1,oe=!1,K=null,xe=null,ce=null;return{setReversed:function(ne){if(oe!==ne){const Te=e.get("EXT_clip_control");ne?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),oe=ne;const Fe=ce;ce=null,this.setClear(Fe)}},getReversed:function(){return oe},setTest:function(ne){ne?se(i.DEPTH_TEST):Ae(i.DEPTH_TEST)},setMask:function(ne){K!==ne&&!D&&(i.depthMask(ne),K=ne)},setFunc:function(ne){if(oe&&(ne=Ch[ne]),xe!==ne){switch(ne){case Jr:i.depthFunc(i.NEVER);break;case Qr:i.depthFunc(i.ALWAYS);break;case ea:i.depthFunc(i.LESS);break;case Ui:i.depthFunc(i.LEQUAL);break;case ta:i.depthFunc(i.EQUAL);break;case na:i.depthFunc(i.GEQUAL);break;case ia:i.depthFunc(i.GREATER);break;case sa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}xe=ne}},setLocked:function(ne){D=ne},setClear:function(ne){ce!==ne&&(ce=ne,oe&&(ne=1-ne),i.clearDepth(ne))},reset:function(){D=!1,K=null,xe=null,ce=null,oe=!1}}}function s(){let D=!1,oe=null,K=null,xe=null,ce=null,ne=null,Te=null,Fe=null,gt=null;return{setTest:function(tt){D||(tt?se(i.STENCIL_TEST):Ae(i.STENCIL_TEST))},setMask:function(tt){oe!==tt&&!D&&(i.stencilMask(tt),oe=tt)},setFunc:function(tt,_n,nn){(K!==tt||xe!==_n||ce!==nn)&&(i.stencilFunc(tt,_n,nn),K=tt,xe=_n,ce=nn)},setOp:function(tt,_n,nn){(ne!==tt||Te!==_n||Fe!==nn)&&(i.stencilOp(tt,_n,nn),ne=tt,Te=_n,Fe=nn)},setLocked:function(tt){D=tt},setClear:function(tt){gt!==tt&&(i.clearStencil(tt),gt=tt)},reset:function(){D=!1,oe=null,K=null,xe=null,ce=null,ne=null,Te=null,Fe=null,gt=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let u={},p={},h={},m=new WeakMap,g=[],v=null,f=!1,d=null,M=null,E=null,T=null,L=null,A=null,P=null,x=new He(0,0,0),w=0,F=!1,R=null,N=null,H=null,q=null,U=null;const k=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,ee=0;const te=i.getParameter(i.VERSION);te.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(te)[1]),G=ee>=1):te.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),G=ee>=2);let de=null,Y={};const Q=i.getParameter(i.SCISSOR_BOX),ye=i.getParameter(i.VIEWPORT),ke=new mt().fromArray(Q),Ee=new mt().fromArray(ye);function Z(D,oe,K,xe){const ce=new Uint8Array(4),ne=i.createTexture();i.bindTexture(D,ne),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Te=0;Te<K;Te++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(oe,0,i.RGBA,1,1,xe,0,i.RGBA,i.UNSIGNED_BYTE,ce):i.texImage2D(oe+Te,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ce);return ne}const he={};he[i.TEXTURE_2D]=Z(i.TEXTURE_2D,i.TEXTURE_2D,1),he[i.TEXTURE_CUBE_MAP]=Z(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),he[i.TEXTURE_2D_ARRAY]=Z(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),he[i.TEXTURE_3D]=Z(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(i.DEPTH_TEST),a.setFunc(Ui),Je(!1),ht(Co),se(i.CULL_FACE),je(Tn);function se(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function Ae(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function De(D,oe){return h[D]!==oe?(i.bindFramebuffer(D,oe),h[D]=oe,D===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=oe),D===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=oe),!0):!1}function Pe(D,oe){let K=g,xe=!1;if(D){K=m.get(oe),K===void 0&&(K=[],m.set(oe,K));const ce=D.textures;if(K.length!==ce.length||K[0]!==i.COLOR_ATTACHMENT0){for(let ne=0,Te=ce.length;ne<Te;ne++)K[ne]=i.COLOR_ATTACHMENT0+ne;K.length=ce.length,xe=!0}}else K[0]!==i.BACK&&(K[0]=i.BACK,xe=!0);xe&&i.drawBuffers(K)}function st(D){return v!==D?(i.useProgram(D),v=D,!0):!1}const ze={[Qn]:i.FUNC_ADD,[Jc]:i.FUNC_SUBTRACT,[Qc]:i.FUNC_REVERSE_SUBTRACT};ze[eh]=i.MIN,ze[th]=i.MAX;const Ze={[nh]:i.ZERO,[ih]:i.ONE,[sh]:i.SRC_COLOR,[Zr]:i.SRC_ALPHA,[hh]:i.SRC_ALPHA_SATURATE,[lh]:i.DST_COLOR,[ah]:i.DST_ALPHA,[rh]:i.ONE_MINUS_SRC_COLOR,[$r]:i.ONE_MINUS_SRC_ALPHA,[ch]:i.ONE_MINUS_DST_COLOR,[oh]:i.ONE_MINUS_DST_ALPHA,[uh]:i.CONSTANT_COLOR,[dh]:i.ONE_MINUS_CONSTANT_COLOR,[fh]:i.CONSTANT_ALPHA,[ph]:i.ONE_MINUS_CONSTANT_ALPHA};function je(D,oe,K,xe,ce,ne,Te,Fe,gt,tt){if(D===Tn){f===!0&&(Ae(i.BLEND),f=!1);return}if(f===!1&&(se(i.BLEND),f=!0),D!==$c){if(D!==d||tt!==F){if((M!==Qn||L!==Qn)&&(i.blendEquation(i.FUNC_ADD),M=Qn,L=Qn),tt)switch(D){case Pi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Po:i.blendFunc(i.ONE,i.ONE);break;case Lo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Do:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ye("WebGLState: Invalid blending: ",D);break}else switch(D){case Pi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Po:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Lo:Ye("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Do:Ye("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ye("WebGLState: Invalid blending: ",D);break}E=null,T=null,A=null,P=null,x.set(0,0,0),w=0,d=D,F=tt}return}ce=ce||oe,ne=ne||K,Te=Te||xe,(oe!==M||ce!==L)&&(i.blendEquationSeparate(ze[oe],ze[ce]),M=oe,L=ce),(K!==E||xe!==T||ne!==A||Te!==P)&&(i.blendFuncSeparate(Ze[K],Ze[xe],Ze[ne],Ze[Te]),E=K,T=xe,A=ne,P=Te),(Fe.equals(x)===!1||gt!==w)&&(i.blendColor(Fe.r,Fe.g,Fe.b,gt),x.copy(Fe),w=gt),d=D,F=!1}function Ue(D,oe){D.side===Qt?Ae(i.CULL_FACE):se(i.CULL_FACE);let K=D.side===Ot;oe&&(K=!K),Je(K),D.blending===Pi&&D.transparent===!1?je(Tn):je(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const xe=D.stencilWrite;o.setTest(xe),xe&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),O(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?se(i.SAMPLE_ALPHA_TO_COVERAGE):Ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function Je(D){R!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),R=D)}function ht(D){D!==jc?(se(i.CULL_FACE),D!==N&&(D===Co?i.cullFace(i.BACK):D===Kc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ae(i.CULL_FACE),N=D}function zt(D){D!==H&&(G&&i.lineWidth(D),H=D)}function O(D,oe,K){D?(se(i.POLYGON_OFFSET_FILL),(q!==oe||U!==K)&&(q=oe,U=K,a.getReversed()&&(oe=-oe),i.polygonOffset(oe,K))):Ae(i.POLYGON_OFFSET_FILL)}function St(D){D?se(i.SCISSOR_TEST):Ae(i.SCISSOR_TEST)}function Xe(D){D===void 0&&(D=i.TEXTURE0+k-1),de!==D&&(i.activeTexture(D),de=D)}function ot(D,oe,K){K===void 0&&(de===null?K=i.TEXTURE0+k-1:K=de);let xe=Y[K];xe===void 0&&(xe={type:void 0,texture:void 0},Y[K]=xe),(xe.type!==D||xe.texture!==oe)&&(de!==K&&(i.activeTexture(K),de=K),i.bindTexture(D,oe||he[D]),xe.type=D,xe.texture=oe)}function fe(){const D=Y[de];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function ft(){try{i.compressedTexImage2D(...arguments)}catch(D){Ye("WebGLState:",D)}}function b(){try{i.compressedTexImage3D(...arguments)}catch(D){Ye("WebGLState:",D)}}function _(){try{i.texSubImage2D(...arguments)}catch(D){Ye("WebGLState:",D)}}function z(){try{i.texSubImage3D(...arguments)}catch(D){Ye("WebGLState:",D)}}function $(){try{i.compressedTexSubImage2D(...arguments)}catch(D){Ye("WebGLState:",D)}}function ie(){try{i.compressedTexSubImage3D(...arguments)}catch(D){Ye("WebGLState:",D)}}function re(){try{i.texStorage2D(...arguments)}catch(D){Ye("WebGLState:",D)}}function ue(){try{i.texStorage3D(...arguments)}catch(D){Ye("WebGLState:",D)}}function j(){try{i.texImage2D(...arguments)}catch(D){Ye("WebGLState:",D)}}function J(){try{i.texImage3D(...arguments)}catch(D){Ye("WebGLState:",D)}}function _e(D){return p[D]!==void 0?p[D]:i.getParameter(D)}function Me(D,oe){p[D]!==oe&&(i.pixelStorei(D,oe),p[D]=oe)}function le(D){ke.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),ke.copy(D))}function ae(D){Ee.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Ee.copy(D))}function Ie(D,oe){let K=c.get(oe);K===void 0&&(K=new WeakMap,c.set(oe,K));let xe=K.get(D);xe===void 0&&(xe=i.getUniformBlockIndex(oe,D.name),K.set(D,xe))}function Be(D,oe){const xe=c.get(oe).get(D);l.get(oe)!==xe&&(i.uniformBlockBinding(oe,xe,D.__bindingPointIndex),l.set(oe,xe))}function $e(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},p={},de=null,Y={},h={},m=new WeakMap,g=[],v=null,f=!1,d=null,M=null,E=null,T=null,L=null,A=null,P=null,x=new He(0,0,0),w=0,F=!1,R=null,N=null,H=null,q=null,U=null,ke.set(0,0,i.canvas.width,i.canvas.height),Ee.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:se,disable:Ae,bindFramebuffer:De,drawBuffers:Pe,useProgram:st,setBlending:je,setMaterial:Ue,setFlipSided:Je,setCullFace:ht,setLineWidth:zt,setPolygonOffset:O,setScissorTest:St,activeTexture:Xe,bindTexture:ot,unbindTexture:fe,compressedTexImage2D:ft,compressedTexImage3D:b,texImage2D:j,texImage3D:J,pixelStorei:Me,getParameter:_e,updateUBOMapping:Ie,uniformBlockBinding:Be,texStorage2D:re,texStorage3D:ue,texSubImage2D:_,texSubImage3D:z,compressedTexSubImage2D:$,compressedTexSubImage3D:ie,scissor:le,viewport:ae,reset:$e}}function bg(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ce,u=new WeakMap,p=new Set;let h;const m=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(b,_){return g?new OffscreenCanvas(b,_):Js("canvas")}function f(b,_,z){let $=1;const ie=ft(b);if((ie.width>z||ie.height>z)&&($=z/Math.max(ie.width,ie.height)),$<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const re=Math.floor($*ie.width),ue=Math.floor($*ie.height);h===void 0&&(h=v(re,ue));const j=_?v(re,ue):h;return j.width=re,j.height=ue,j.getContext("2d").drawImage(b,0,0,re,ue),Le("WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+re+"x"+ue+")."),j}else return"data"in b&&Le("WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),b;return b}function d(b){return b.generateMipmaps}function M(b){i.generateMipmap(b)}function E(b){return b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:b.isWebGL3DRenderTarget?i.TEXTURE_3D:b.isWebGLArrayRenderTarget||b.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(b,_,z,$,ie,re=!1){if(b!==null){if(i[b]!==void 0)return i[b];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let ue;$&&(ue=e.get("EXT_texture_norm16"),ue||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=_;if(_===i.RED&&(z===i.FLOAT&&(j=i.R32F),z===i.HALF_FLOAT&&(j=i.R16F),z===i.UNSIGNED_BYTE&&(j=i.R8),z===i.UNSIGNED_SHORT&&ue&&(j=ue.R16_EXT),z===i.SHORT&&ue&&(j=ue.R16_SNORM_EXT)),_===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.R8UI),z===i.UNSIGNED_SHORT&&(j=i.R16UI),z===i.UNSIGNED_INT&&(j=i.R32UI),z===i.BYTE&&(j=i.R8I),z===i.SHORT&&(j=i.R16I),z===i.INT&&(j=i.R32I)),_===i.RG&&(z===i.FLOAT&&(j=i.RG32F),z===i.HALF_FLOAT&&(j=i.RG16F),z===i.UNSIGNED_BYTE&&(j=i.RG8),z===i.UNSIGNED_SHORT&&ue&&(j=ue.RG16_EXT),z===i.SHORT&&ue&&(j=ue.RG16_SNORM_EXT)),_===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RG8UI),z===i.UNSIGNED_SHORT&&(j=i.RG16UI),z===i.UNSIGNED_INT&&(j=i.RG32UI),z===i.BYTE&&(j=i.RG8I),z===i.SHORT&&(j=i.RG16I),z===i.INT&&(j=i.RG32I)),_===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RGB8UI),z===i.UNSIGNED_SHORT&&(j=i.RGB16UI),z===i.UNSIGNED_INT&&(j=i.RGB32UI),z===i.BYTE&&(j=i.RGB8I),z===i.SHORT&&(j=i.RGB16I),z===i.INT&&(j=i.RGB32I)),_===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),z===i.UNSIGNED_INT&&(j=i.RGBA32UI),z===i.BYTE&&(j=i.RGBA8I),z===i.SHORT&&(j=i.RGBA16I),z===i.INT&&(j=i.RGBA32I)),_===i.RGB&&(z===i.UNSIGNED_SHORT&&ue&&(j=ue.RGB16_EXT),z===i.SHORT&&ue&&(j=ue.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(j=i.R11F_G11F_B10F)),_===i.RGBA){const J=re?$s:qe.getTransfer(ie);z===i.FLOAT&&(j=i.RGBA32F),z===i.HALF_FLOAT&&(j=i.RGBA16F),z===i.UNSIGNED_BYTE&&(j=J===Qe?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&ue&&(j=ue.RGBA16_EXT),z===i.SHORT&&ue&&(j=ue.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function L(b,_){let z;return b?_===null||_===mn||_===ns?z=i.DEPTH24_STENCIL8:_===ln?z=i.DEPTH32F_STENCIL8:_===ts&&(z=i.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===mn||_===ns?z=i.DEPTH_COMPONENT24:_===ln?z=i.DEPTH_COMPONENT32F:_===ts&&(z=i.DEPTH_COMPONENT16),z}function A(b,_){return d(b)===!0||b.isFramebufferTexture&&b.minFilter!==wt&&b.minFilter!==Rt?Math.log2(Math.max(_.width,_.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?_.mipmaps.length:1}function P(b){const _=b.target;_.removeEventListener("dispose",P),w(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&p.delete(_)}function x(b){const _=b.target;_.removeEventListener("dispose",x),R(_)}function w(b){const _=n.get(b);if(_.__webglInit===void 0)return;const z=b.source,$=m.get(z);if($){const ie=$[_.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&F(b),Object.keys($).length===0&&m.delete(z)}n.remove(b)}function F(b){const _=n.get(b);i.deleteTexture(_.__webglTexture);const z=b.source,$=m.get(z);delete $[_.__cacheKey],a.memory.textures--}function R(b){const _=n.get(b);if(b.depthTexture&&(b.depthTexture.dispose(),n.remove(b.depthTexture)),b.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(_.__webglFramebuffer[$]))for(let ie=0;ie<_.__webglFramebuffer[$].length;ie++)i.deleteFramebuffer(_.__webglFramebuffer[$][ie]);else i.deleteFramebuffer(_.__webglFramebuffer[$]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[$])}else{if(Array.isArray(_.__webglFramebuffer))for(let $=0;$<_.__webglFramebuffer.length;$++)i.deleteFramebuffer(_.__webglFramebuffer[$]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let $=0;$<_.__webglColorRenderbuffer.length;$++)_.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[$]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const z=b.textures;for(let $=0,ie=z.length;$<ie;$++){const re=n.get(z[$]);re.__webglTexture&&(i.deleteTexture(re.__webglTexture),a.memory.textures--),n.remove(z[$])}n.remove(b)}let N=0;function H(){N=0}function q(){return N}function U(b){N=b}function k(){const b=N;return b>=s.maxTextures&&Le("WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),N+=1,b}function G(b){const _=[];return _.push(b.wrapS),_.push(b.wrapT),_.push(b.wrapR||0),_.push(b.magFilter),_.push(b.minFilter),_.push(b.anisotropy),_.push(b.internalFormat),_.push(b.format),_.push(b.type),_.push(b.generateMipmaps),_.push(b.premultiplyAlpha),_.push(b.flipY),_.push(b.unpackAlignment),_.push(b.colorSpace),_.join()}function ee(b,_){const z=n.get(b);if(b.isVideoTexture&&ot(b),b.isRenderTargetTexture===!1&&b.isExternalTexture!==!0&&b.version>0&&z.__version!==b.version){const $=b.image;if($===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{Ae(z,b,_);return}}else b.isExternalTexture&&(z.__webglTexture=b.sourceTexture?b.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+_)}function te(b,_){const z=n.get(b);if(b.isRenderTargetTexture===!1&&b.version>0&&z.__version!==b.version){Ae(z,b,_);return}else b.isExternalTexture&&(z.__webglTexture=b.sourceTexture?b.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+_)}function de(b,_){const z=n.get(b);if(b.isRenderTargetTexture===!1&&b.version>0&&z.__version!==b.version){Ae(z,b,_);return}t.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+_)}function Y(b,_){const z=n.get(b);if(b.isCubeDepthTexture!==!0&&b.version>0&&z.__version!==b.version){De(z,b,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+_)}const Q={[ra]:i.REPEAT,[bn]:i.CLAMP_TO_EDGE,[aa]:i.MIRRORED_REPEAT},ye={[wt]:i.NEAREST,[_h]:i.NEAREST_MIPMAP_NEAREST,[cs]:i.NEAREST_MIPMAP_LINEAR,[Rt]:i.LINEAR,[fr]:i.LINEAR_MIPMAP_NEAREST,[ti]:i.LINEAR_MIPMAP_LINEAR},ke={[Mh]:i.NEVER,[Th]:i.ALWAYS,[Sh]:i.LESS,[to]:i.LEQUAL,[yh]:i.EQUAL,[no]:i.GEQUAL,[bh]:i.GREATER,[Eh]:i.NOTEQUAL};function Ee(b,_){if(_.type===ln&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Rt||_.magFilter===fr||_.magFilter===cs||_.magFilter===ti||_.minFilter===Rt||_.minFilter===fr||_.minFilter===cs||_.minFilter===ti)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(b,i.TEXTURE_WRAP_S,Q[_.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,Q[_.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,Q[_.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,ye[_.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,ye[_.minFilter]),_.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,ke[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===wt||_.minFilter!==cs&&_.minFilter!==ti||_.type===ln&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(b,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Z(b,_){let z=!1;b.__webglInit===void 0&&(b.__webglInit=!0,_.addEventListener("dispose",P));const $=_.source;let ie=m.get($);ie===void 0&&(ie={},m.set($,ie));const re=G(_);if(re!==b.__cacheKey){ie[re]===void 0&&(ie[re]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,z=!0),ie[re].usedTimes++;const ue=ie[b.__cacheKey];ue!==void 0&&(ie[b.__cacheKey].usedTimes--,ue.usedTimes===0&&F(_)),b.__cacheKey=re,b.__webglTexture=ie[re].texture}return z}function he(b,_,z){return Math.floor(Math.floor(b/z)/_)}function se(b,_,z,$){const re=b.updateRanges;if(re.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,z,$,_.data);else{re.sort((Me,le)=>Me.start-le.start);let ue=0;for(let Me=1;Me<re.length;Me++){const le=re[ue],ae=re[Me],Ie=le.start+le.count,Be=he(ae.start,_.width,4),$e=he(le.start,_.width,4);ae.start<=Ie+1&&Be===$e&&he(ae.start+ae.count-1,_.width,4)===Be?le.count=Math.max(le.count,ae.start+ae.count-le.start):(++ue,re[ue]=ae)}re.length=ue+1;const j=t.getParameter(i.UNPACK_ROW_LENGTH),J=t.getParameter(i.UNPACK_SKIP_PIXELS),_e=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let Me=0,le=re.length;Me<le;Me++){const ae=re[Me],Ie=Math.floor(ae.start/4),Be=Math.ceil(ae.count/4),$e=Ie%_.width,D=Math.floor(Ie/_.width),oe=Be,K=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,$e),t.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,$e,D,oe,K,z,$,_.data)}b.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,j),t.pixelStorei(i.UNPACK_SKIP_PIXELS,J),t.pixelStorei(i.UNPACK_SKIP_ROWS,_e)}}function Ae(b,_,z){let $=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&($=i.TEXTURE_3D);const ie=Z(b,_),re=_.source;t.bindTexture($,b.__webglTexture,i.TEXTURE0+z);const ue=n.get(re);if(re.version!==ue.__version||ie===!0){if(t.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){const K=qe.getPrimaries(qe.workingColorSpace),xe=_.colorSpace===Gn?null:qe.getPrimaries(_.colorSpace),ce=_.colorSpace===Gn||K===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce)}t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment);let J=f(_.image,!1,s.maxTextureSize);J=fe(_,J);const _e=r.convert(_.format,_.colorSpace),Me=r.convert(_.type);let le=T(_.internalFormat,_e,Me,_.normalized,_.colorSpace,_.isVideoTexture);Ee($,_);let ae;const Ie=_.mipmaps,Be=_.isVideoTexture!==!0,$e=ue.__version===void 0||ie===!0,D=re.dataReady,oe=A(_,J);if(_.isDepthTexture)le=L(_.format===ni,_.type),$e&&(Be?t.texStorage2D(i.TEXTURE_2D,1,le,J.width,J.height):t.texImage2D(i.TEXTURE_2D,0,le,J.width,J.height,0,_e,Me,null));else if(_.isDataTexture)if(Ie.length>0){Be&&$e&&t.texStorage2D(i.TEXTURE_2D,oe,le,Ie[0].width,Ie[0].height);for(let K=0,xe=Ie.length;K<xe;K++)ae=Ie[K],Be?D&&t.texSubImage2D(i.TEXTURE_2D,K,0,0,ae.width,ae.height,_e,Me,ae.data):t.texImage2D(i.TEXTURE_2D,K,le,ae.width,ae.height,0,_e,Me,ae.data);_.generateMipmaps=!1}else Be?($e&&t.texStorage2D(i.TEXTURE_2D,oe,le,J.width,J.height),D&&se(_,J,_e,Me)):t.texImage2D(i.TEXTURE_2D,0,le,J.width,J.height,0,_e,Me,J.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Be&&$e&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,le,Ie[0].width,Ie[0].height,J.depth);for(let K=0,xe=Ie.length;K<xe;K++)if(ae=Ie[K],_.format!==tn)if(_e!==null)if(Be){if(D)if(_.layerUpdates.size>0){const ce=ul(ae.width,ae.height,_.format,_.type);for(const ne of _.layerUpdates){const Te=ae.data.subarray(ne*ce/ae.data.BYTES_PER_ELEMENT,(ne+1)*ce/ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,ne,ae.width,ae.height,1,_e,Te)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,0,ae.width,ae.height,J.depth,_e,ae.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,K,le,ae.width,ae.height,J.depth,0,ae.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Be?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,0,ae.width,ae.height,J.depth,_e,Me,ae.data):t.texImage3D(i.TEXTURE_2D_ARRAY,K,le,ae.width,ae.height,J.depth,0,_e,Me,ae.data)}else{Be&&$e&&t.texStorage2D(i.TEXTURE_2D,oe,le,Ie[0].width,Ie[0].height);for(let K=0,xe=Ie.length;K<xe;K++)ae=Ie[K],_.format!==tn?_e!==null?Be?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,K,0,0,ae.width,ae.height,_e,ae.data):t.compressedTexImage2D(i.TEXTURE_2D,K,le,ae.width,ae.height,0,ae.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Be?D&&t.texSubImage2D(i.TEXTURE_2D,K,0,0,ae.width,ae.height,_e,Me,ae.data):t.texImage2D(i.TEXTURE_2D,K,le,ae.width,ae.height,0,_e,Me,ae.data)}else if(_.isDataArrayTexture)if(Be){if($e&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,le,J.width,J.height,J.depth),D)if(_.layerUpdates.size>0){const K=ul(J.width,J.height,_.format,_.type);for(const xe of _.layerUpdates){const ce=J.data.subarray(xe*K/J.data.BYTES_PER_ELEMENT,(xe+1)*K/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,xe,J.width,J.height,1,_e,Me,ce)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,_e,Me,J.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,le,J.width,J.height,J.depth,0,_e,Me,J.data);else if(_.isData3DTexture)Be?($e&&t.texStorage3D(i.TEXTURE_3D,oe,le,J.width,J.height,J.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,_e,Me,J.data)):t.texImage3D(i.TEXTURE_3D,0,le,J.width,J.height,J.depth,0,_e,Me,J.data);else if(_.isFramebufferTexture){if($e)if(Be)t.texStorage2D(i.TEXTURE_2D,oe,le,J.width,J.height);else{let K=J.width,xe=J.height;for(let ce=0;ce<oe;ce++)t.texImage2D(i.TEXTURE_2D,ce,le,K,xe,0,_e,Me,null),K>>=1,xe>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in i){const K=i.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),J.parentNode!==K){K.appendChild(J),p.add(_),K.onpaint=Fe=>{const gt=Fe.changedElements;for(const tt of p)gt.includes(tt.image)&&(tt.needsUpdate=!0)},K.requestPaint();return}const xe=0,ce=i.RGBA,ne=i.RGBA,Te=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,xe,ce,ne,Te,J),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ie.length>0){if(Be&&$e){const K=ft(Ie[0]);t.texStorage2D(i.TEXTURE_2D,oe,le,K.width,K.height)}for(let K=0,xe=Ie.length;K<xe;K++)ae=Ie[K],Be?D&&t.texSubImage2D(i.TEXTURE_2D,K,0,0,_e,Me,ae):t.texImage2D(i.TEXTURE_2D,K,le,_e,Me,ae);_.generateMipmaps=!1}else if(Be){if($e){const K=ft(J);t.texStorage2D(i.TEXTURE_2D,oe,le,K.width,K.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,_e,Me,J)}else t.texImage2D(i.TEXTURE_2D,0,le,_e,Me,J);d(_)&&M($),ue.__version=re.version,_.onUpdate&&_.onUpdate(_)}b.__version=_.version}function De(b,_,z){if(_.image.length!==6)return;const $=Z(b,_),ie=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+z);const re=n.get(ie);if(ie.version!==re.__version||$===!0){t.activeTexture(i.TEXTURE0+z);const ue=qe.getPrimaries(qe.workingColorSpace),j=_.colorSpace===Gn?null:qe.getPrimaries(_.colorSpace),J=_.colorSpace===Gn||ue===j?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);const _e=_.isCompressedTexture||_.image[0].isCompressedTexture,Me=_.image[0]&&_.image[0].isDataTexture,le=[];for(let ne=0;ne<6;ne++)!_e&&!Me?le[ne]=f(_.image[ne],!0,s.maxCubemapSize):le[ne]=Me?_.image[ne].image:_.image[ne],le[ne]=fe(_,le[ne]);const ae=le[0],Ie=r.convert(_.format,_.colorSpace),Be=r.convert(_.type),$e=T(_.internalFormat,Ie,Be,_.normalized,_.colorSpace),D=_.isVideoTexture!==!0,oe=re.__version===void 0||$===!0,K=ie.dataReady;let xe=A(_,ae);Ee(i.TEXTURE_CUBE_MAP,_);let ce;if(_e){D&&oe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,$e,ae.width,ae.height);for(let ne=0;ne<6;ne++){ce=le[ne].mipmaps;for(let Te=0;Te<ce.length;Te++){const Fe=ce[Te];_.format!==tn?Ie!==null?D?K&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,0,0,Fe.width,Fe.height,Ie,Fe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,$e,Fe.width,Fe.height,0,Fe.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?K&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,0,0,Fe.width,Fe.height,Ie,Be,Fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,$e,Fe.width,Fe.height,0,Ie,Be,Fe.data)}}}else{if(ce=_.mipmaps,D&&oe){ce.length>0&&xe++;const ne=ft(le[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,$e,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(Me){D?K&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,le[ne].width,le[ne].height,Ie,Be,le[ne].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,$e,le[ne].width,le[ne].height,0,Ie,Be,le[ne].data);for(let Te=0;Te<ce.length;Te++){const gt=ce[Te].image[ne].image;D?K&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,0,0,gt.width,gt.height,Ie,Be,gt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,$e,gt.width,gt.height,0,Ie,Be,gt.data)}}else{D?K&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Ie,Be,le[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,$e,Ie,Be,le[ne]);for(let Te=0;Te<ce.length;Te++){const Fe=ce[Te];D?K&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,0,0,Ie,Be,Fe.image[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,$e,Ie,Be,Fe.image[ne])}}}d(_)&&M(i.TEXTURE_CUBE_MAP),re.__version=ie.version,_.onUpdate&&_.onUpdate(_)}b.__version=_.version}function Pe(b,_,z,$,ie,re){const ue=r.convert(z.format,z.colorSpace),j=r.convert(z.type),J=T(z.internalFormat,ue,j,z.normalized,z.colorSpace),_e=n.get(_),Me=n.get(z);if(Me.__renderTarget=_,!_e.__hasExternalTextures){const le=Math.max(1,_.width>>re),ae=Math.max(1,_.height>>re);ie===i.TEXTURE_3D||ie===i.TEXTURE_2D_ARRAY?t.texImage3D(ie,re,J,le,ae,_.depth,0,ue,j,null):t.texImage2D(ie,re,J,le,ae,0,ue,j,null)}t.bindFramebuffer(i.FRAMEBUFFER,b),Xe(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,ie,Me.__webglTexture,0,St(_)):(ie===i.TEXTURE_2D||ie>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,ie,Me.__webglTexture,re),t.bindFramebuffer(i.FRAMEBUFFER,null)}function st(b,_,z){if(i.bindRenderbuffer(i.RENDERBUFFER,b),_.depthBuffer){const $=_.depthTexture,ie=$&&$.isDepthTexture?$.type:null,re=L(_.stencilBuffer,ie),ue=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Xe(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,St(_),re,_.width,_.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,St(_),re,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,re,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,b)}else{const $=_.textures;for(let ie=0;ie<$.length;ie++){const re=$[ie],ue=r.convert(re.format,re.colorSpace),j=r.convert(re.type),J=T(re.internalFormat,ue,j,re.normalized,re.colorSpace);Xe(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,St(_),J,_.width,_.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,St(_),J,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,J,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ze(b,_,z){const $=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,b),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ie=n.get(_.depthTexture);if(ie.__renderTarget=_,(!ie.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),$){if(ie.__webglInit===void 0&&(ie.__webglInit=!0,_.depthTexture.addEventListener("dispose",P)),ie.__webglTexture===void 0){ie.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,ie.__webglTexture),Ee(i.TEXTURE_CUBE_MAP,_.depthTexture);const _e=r.convert(_.depthTexture.format),Me=r.convert(_.depthTexture.type);let le;_.depthTexture.format===Cn?le=i.DEPTH_COMPONENT24:_.depthTexture.format===ni&&(le=i.DEPTH24_STENCIL8);for(let ae=0;ae<6;ae++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,le,_.width,_.height,0,_e,Me,null)}}else ee(_.depthTexture,0);const re=ie.__webglTexture,ue=St(_),j=$?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,J=_.depthTexture.format===ni?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===Cn)Xe(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,j,re,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,J,j,re,0);else if(_.depthTexture.format===ni)Xe(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,j,re,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,J,j,re,0);else throw new Error("Unknown depthTexture format")}function Ze(b){const _=n.get(b),z=b.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==b.depthTexture){const $=b.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),$){const ie=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,$.removeEventListener("dispose",ie)};$.addEventListener("dispose",ie),_.__depthDisposeCallback=ie}_.__boundDepthTexture=$}if(b.depthTexture&&!_.__autoAllocateDepthBuffer)if(z)for(let $=0;$<6;$++)ze(_.__webglFramebuffer[$],b,$);else{const $=b.texture.mipmaps;$&&$.length>0?ze(_.__webglFramebuffer[0],b,0):ze(_.__webglFramebuffer,b,0)}else if(z){_.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[$]),_.__webglDepthbuffer[$]===void 0)_.__webglDepthbuffer[$]=i.createRenderbuffer(),st(_.__webglDepthbuffer[$],b,!1);else{const ie=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=_.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,re),i.framebufferRenderbuffer(i.FRAMEBUFFER,ie,i.RENDERBUFFER,re)}}else{const $=b.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),st(_.__webglDepthbuffer,b,!1);else{const ie=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,re),i.framebufferRenderbuffer(i.FRAMEBUFFER,ie,i.RENDERBUFFER,re)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function je(b,_,z){const $=n.get(b);_!==void 0&&Pe($.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&Ze(b)}function Ue(b){const _=b.texture,z=n.get(b),$=n.get(_);b.addEventListener("dispose",x);const ie=b.textures,re=b.isWebGLCubeRenderTarget===!0,ue=ie.length>1;if(ue||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=_.version,a.memory.textures++),re){z.__webglFramebuffer=[];for(let j=0;j<6;j++)if(_.mipmaps&&_.mipmaps.length>0){z.__webglFramebuffer[j]=[];for(let J=0;J<_.mipmaps.length;J++)z.__webglFramebuffer[j][J]=i.createFramebuffer()}else z.__webglFramebuffer[j]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){z.__webglFramebuffer=[];for(let j=0;j<_.mipmaps.length;j++)z.__webglFramebuffer[j]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(ue)for(let j=0,J=ie.length;j<J;j++){const _e=n.get(ie[j]);_e.__webglTexture===void 0&&(_e.__webglTexture=i.createTexture(),a.memory.textures++)}if(b.samples>0&&Xe(b)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let j=0;j<ie.length;j++){const J=ie[j];z.__webglColorRenderbuffer[j]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[j]);const _e=r.convert(J.format,J.colorSpace),Me=r.convert(J.type),le=T(J.internalFormat,_e,Me,J.normalized,J.colorSpace,b.isXRRenderTarget===!0),ae=St(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,le,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+j,i.RENDERBUFFER,z.__webglColorRenderbuffer[j])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),st(z.__webglDepthRenderbuffer,b,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(re){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),Ee(i.TEXTURE_CUBE_MAP,_);for(let j=0;j<6;j++)if(_.mipmaps&&_.mipmaps.length>0)for(let J=0;J<_.mipmaps.length;J++)Pe(z.__webglFramebuffer[j][J],b,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+j,J);else Pe(z.__webglFramebuffer[j],b,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);d(_)&&M(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ue){for(let j=0,J=ie.length;j<J;j++){const _e=ie[j],Me=n.get(_e);let le=i.TEXTURE_2D;(b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(le=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(le,Me.__webglTexture),Ee(le,_e),Pe(z.__webglFramebuffer,b,_e,i.COLOR_ATTACHMENT0+j,le,0),d(_e)&&M(le)}t.unbindTexture()}else{let j=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(j=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,$.__webglTexture),Ee(j,_),_.mipmaps&&_.mipmaps.length>0)for(let J=0;J<_.mipmaps.length;J++)Pe(z.__webglFramebuffer[J],b,_,i.COLOR_ATTACHMENT0,j,J);else Pe(z.__webglFramebuffer,b,_,i.COLOR_ATTACHMENT0,j,0);d(_)&&M(j),t.unbindTexture()}b.depthBuffer&&Ze(b)}function Je(b){const _=b.textures;for(let z=0,$=_.length;z<$;z++){const ie=_[z];if(d(ie)){const re=E(b),ue=n.get(ie).__webglTexture;t.bindTexture(re,ue),M(re),t.unbindTexture()}}}const ht=[],zt=[];function O(b){if(b.samples>0){if(Xe(b)===!1){const _=b.textures,z=b.width,$=b.height;let ie=i.COLOR_BUFFER_BIT;const re=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=n.get(b),j=_.length>1;if(j)for(let _e=0;_e<_.length;_e++)t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+_e,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+_e,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ue.__webglMultisampledFramebuffer);const J=b.texture.mipmaps;J&&J.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer);for(let _e=0;_e<_.length;_e++){if(b.resolveDepthBuffer&&(b.depthBuffer&&(ie|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&(ie|=i.STENCIL_BUFFER_BIT)),j){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ue.__webglColorRenderbuffer[_e]);const Me=n.get(_[_e]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Me,0)}i.blitFramebuffer(0,0,z,$,0,0,z,$,ie,i.NEAREST),l===!0&&(ht.length=0,zt.length=0,ht.push(i.COLOR_ATTACHMENT0+_e),b.depthBuffer&&b.resolveDepthBuffer===!1&&(ht.push(re),zt.push(re),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,zt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ht))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),j)for(let _e=0;_e<_.length;_e++){t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+_e,i.RENDERBUFFER,ue.__webglColorRenderbuffer[_e]);const Me=n.get(_[_e]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+_e,i.TEXTURE_2D,Me,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&l){const _=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function St(b){return Math.min(s.maxSamples,b.samples)}function Xe(b){const _=n.get(b);return b.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function ot(b){const _=a.render.frame;u.get(b)!==_&&(u.set(b,_),b.update())}function fe(b,_){const z=b.colorSpace,$=b.format,ie=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||z!==Zs&&z!==Gn&&(qe.getTransfer(z)===Qe?($!==tn||ie!==Vt)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ye("WebGLTextures: Unsupported texture color space:",z)),_}function ft(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(c.width=b.naturalWidth||b.width,c.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(c.width=b.displayWidth,c.height=b.displayHeight):(c.width=b.width,c.height=b.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=H,this.getTextureUnits=q,this.setTextureUnits=U,this.setTexture2D=ee,this.setTexture2DArray=te,this.setTexture3D=de,this.setTextureCube=Y,this.rebindTextures=je,this.setupRenderTarget=Ue,this.updateRenderTargetMipmap=Je,this.updateMultisampleRenderTarget=O,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=Pe,this.useMultisampledRTT=Xe,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Eg(i,e){function t(n,s=Gn){let r;const a=qe.getTransfer(s);if(n===Vt)return i.UNSIGNED_BYTE;if(n===Za)return i.UNSIGNED_SHORT_4_4_4_4;if(n===$a)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Kl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Zl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Yl)return i.BYTE;if(n===jl)return i.SHORT;if(n===ts)return i.UNSIGNED_SHORT;if(n===Ka)return i.INT;if(n===mn)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===Rn)return i.HALF_FLOAT;if(n===$l)return i.ALPHA;if(n===Jl)return i.RGB;if(n===tn)return i.RGBA;if(n===Cn)return i.DEPTH_COMPONENT;if(n===ni)return i.DEPTH_STENCIL;if(n===Ql)return i.RED;if(n===Ja)return i.RED_INTEGER;if(n===ri)return i.RG;if(n===Qa)return i.RG_INTEGER;if(n===eo)return i.RGBA_INTEGER;if(n===ks||n===Vs||n===Ws||n===Xs)if(a===Qe)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ks)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Vs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ws)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Xs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ks)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Vs)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ws)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Xs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===oa||n===la||n===ca||n===ha)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===oa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===la)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ca)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ha)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ua||n===da||n===fa||n===pa||n===ma||n===js||n===ga)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ua||n===da)return a===Qe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===fa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===pa)return r.COMPRESSED_R11_EAC;if(n===ma)return r.COMPRESSED_SIGNED_R11_EAC;if(n===js)return r.COMPRESSED_RG11_EAC;if(n===ga)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===_a||n===xa||n===va||n===Ma||n===Sa||n===ya||n===ba||n===Ea||n===Ta||n===Aa||n===wa||n===Ra||n===Ca||n===Pa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===_a)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===xa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===va)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ma)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Sa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ya)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ba)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ea)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ta)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Aa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===wa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ra)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ca)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Pa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===La||n===Da||n===Ia)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===La)return a===Qe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ia)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ua||n===Na||n===Ks||n===Fa)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ua)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Na)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ks)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Fa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ns?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const Tg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ag=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class wg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new hc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new gn({vertexShader:Tg,fragmentShader:Ag,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new Bi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Rg extends Yn{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,p=null,h=null,m=null,g=null;const v=typeof XRWebGLBinding<"u",f=new wg,d={},M=t.getContextAttributes();let E=null,T=null;const L=[],A=[],P=new Ce;let x=null;const w=new jt;w.viewport=new mt;const F=new jt;F.viewport=new mt;const R=[w,F],N=new Uu;let H=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let he=L[Z];return he===void 0&&(he=new vr,L[Z]=he),he.getTargetRaySpace()},this.getControllerGrip=function(Z){let he=L[Z];return he===void 0&&(he=new vr,L[Z]=he),he.getGripSpace()},this.getHand=function(Z){let he=L[Z];return he===void 0&&(he=new vr,L[Z]=he),he.getHandSpace()};function U(Z){const he=A.indexOf(Z.inputSource);if(he===-1)return;const se=L[he];se!==void 0&&(se.update(Z.inputSource,Z.frame,c||a),se.dispatchEvent({type:Z.type,data:Z.inputSource}))}function k(){s.removeEventListener("select",U),s.removeEventListener("selectstart",U),s.removeEventListener("selectend",U),s.removeEventListener("squeeze",U),s.removeEventListener("squeezestart",U),s.removeEventListener("squeezeend",U),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",G);for(let Z=0;Z<L.length;Z++){const he=A[Z];he!==null&&(A[Z]=null,L[Z].disconnect(he))}H=null,q=null,f.reset();for(const Z in d)delete d[Z];e.setRenderTarget(E),m=null,h=null,p=null,s=null,T=null,Ee.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:m},this.getBinding=function(){return p===null&&v&&(p=new XRWebGLBinding(s,t)),p},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",U),s.addEventListener("selectstart",U),s.addEventListener("selectend",U),s.addEventListener("squeeze",U),s.addEventListener("squeezestart",U),s.addEventListener("squeezeend",U),s.addEventListener("end",k),s.addEventListener("inputsourceschange",G),M.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(P),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let se=null,Ae=null,De=null;M.depth&&(De=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=M.stencil?ni:Cn,Ae=M.stencil?ns:mn);const Pe={colorFormat:t.RGBA8,depthFormat:De,scaleFactor:r};p=this.getBinding(),h=p.createProjectionLayer(Pe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),T=new dn(h.textureWidth,h.textureHeight,{format:tn,type:Vt,depthTexture:new Oi(h.textureWidth,h.textureHeight,Ae,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const se={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,se),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),T=new dn(m.framebufferWidth,m.framebufferHeight,{format:tn,type:Vt,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Ee.setContext(s),Ee.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function G(Z){for(let he=0;he<Z.removed.length;he++){const se=Z.removed[he],Ae=A.indexOf(se);Ae>=0&&(A[Ae]=null,L[Ae].disconnect(se))}for(let he=0;he<Z.added.length;he++){const se=Z.added[he];let Ae=A.indexOf(se);if(Ae===-1){for(let Pe=0;Pe<L.length;Pe++)if(Pe>=A.length){A.push(se),Ae=Pe;break}else if(A[Pe]===null){A[Pe]=se,Ae=Pe;break}if(Ae===-1)break}const De=L[Ae];De&&De.connect(se)}}const ee=new I,te=new I;function de(Z,he,se){ee.setFromMatrixPosition(he.matrixWorld),te.setFromMatrixPosition(se.matrixWorld);const Ae=ee.distanceTo(te),De=he.projectionMatrix.elements,Pe=se.projectionMatrix.elements,st=De[14]/(De[10]-1),ze=De[14]/(De[10]+1),Ze=(De[9]+1)/De[5],je=(De[9]-1)/De[5],Ue=(De[8]-1)/De[0],Je=(Pe[8]+1)/Pe[0],ht=st*Ue,zt=st*Je,O=Ae/(-Ue+Je),St=O*-Ue;if(he.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(St),Z.translateZ(O),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),De[10]===-1)Z.projectionMatrix.copy(he.projectionMatrix),Z.projectionMatrixInverse.copy(he.projectionMatrixInverse);else{const Xe=st+O,ot=ze+O,fe=ht-St,ft=zt+(Ae-St),b=Ze*ze/ot*Xe,_=je*ze/ot*Xe;Z.projectionMatrix.makePerspective(fe,ft,b,_,Xe,ot),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function Y(Z,he){he===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(he.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let he=Z.near,se=Z.far;f.texture!==null&&(f.depthNear>0&&(he=f.depthNear),f.depthFar>0&&(se=f.depthFar)),N.near=F.near=w.near=he,N.far=F.far=w.far=se,(H!==N.near||q!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),H=N.near,q=N.far),N.layers.mask=Z.layers.mask|6,w.layers.mask=N.layers.mask&-5,F.layers.mask=N.layers.mask&-3;const Ae=Z.parent,De=N.cameras;Y(N,Ae);for(let Pe=0;Pe<De.length;Pe++)Y(De[Pe],Ae);De.length===2?de(N,w,F):N.projectionMatrix.copy(w.projectionMatrix),Q(Z,N,Ae)};function Q(Z,he,se){se===null?Z.matrix.copy(he.matrixWorld):(Z.matrix.copy(se.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(he.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(he.projectionMatrix),Z.projectionMatrixInverse.copy(he.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=ss*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(h===null&&m===null))return l},this.setFoveation=function(Z){l=Z,h!==null&&(h.fixedFoveation=Z),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=Z)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(N)},this.getCameraTexture=function(Z){return d[Z]};let ye=null;function ke(Z,he){if(u=he.getViewerPose(c||a),g=he,u!==null){const se=u.views;m!==null&&(e.setRenderTargetFramebuffer(T,m.framebuffer),e.setRenderTarget(T));let Ae=!1;se.length!==N.cameras.length&&(N.cameras.length=0,Ae=!0);for(let ze=0;ze<se.length;ze++){const Ze=se[ze];let je=null;if(m!==null)je=m.getViewport(Ze);else{const Je=p.getViewSubImage(h,Ze);je=Je.viewport,ze===0&&(e.setRenderTargetTextures(T,Je.colorTexture,Je.depthStencilTexture),e.setRenderTarget(T))}let Ue=R[ze];Ue===void 0&&(Ue=new jt,Ue.layers.enable(ze),Ue.viewport=new mt,R[ze]=Ue),Ue.matrix.fromArray(Ze.transform.matrix),Ue.matrix.decompose(Ue.position,Ue.quaternion,Ue.scale),Ue.projectionMatrix.fromArray(Ze.projectionMatrix),Ue.projectionMatrixInverse.copy(Ue.projectionMatrix).invert(),Ue.viewport.set(je.x,je.y,je.width,je.height),ze===0&&(N.matrix.copy(Ue.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Ae===!0&&N.cameras.push(Ue)}const De=s.enabledFeatures;if(De&&De.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){p=n.getBinding();const ze=p.getDepthInformation(se[0]);ze&&ze.isValid&&ze.texture&&f.init(ze,s.renderState)}if(De&&De.includes("camera-access")&&v){e.state.unbindTexture(),p=n.getBinding();for(let ze=0;ze<se.length;ze++){const Ze=se[ze].camera;if(Ze){let je=d[Ze];je||(je=new hc,d[Ze]=je);const Ue=p.getCameraImage(Ze);je.sourceTexture=Ue}}}}for(let se=0;se<L.length;se++){const Ae=A[se],De=L[se];Ae!==null&&De!==void 0&&De.update(Ae,he,c||a)}ye&&ye(Z,he),he.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:he}),g=null}const Ee=new pc;Ee.setAnimationLoop(ke),this.setAnimationLoop=function(Z){ye=Z},this.dispose=function(){}}}const Cg=new dt,Sc=new Ne;Sc.set(-1,0,0,0,1,0,0,0,1);function Pg(i,e){function t(f,d){f.matrixAutoUpdate===!0&&f.updateMatrix(),d.value.copy(f.matrix)}function n(f,d){d.color.getRGB(f.fogColor.value,uc(i)),d.isFog?(f.fogNear.value=d.near,f.fogFar.value=d.far):d.isFogExp2&&(f.fogDensity.value=d.density)}function s(f,d,M,E,T){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(f,d):d.isMeshLambertMaterial?(r(f,d),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(f,d),p(f,d)):d.isMeshPhongMaterial?(r(f,d),u(f,d),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(f,d),h(f,d),d.isMeshPhysicalMaterial&&m(f,d,T)):d.isMeshMatcapMaterial?(r(f,d),g(f,d)):d.isMeshDepthMaterial?r(f,d):d.isMeshDistanceMaterial?(r(f,d),v(f,d)):d.isMeshNormalMaterial?r(f,d):d.isLineBasicMaterial?(a(f,d),d.isLineDashedMaterial&&o(f,d)):d.isPointsMaterial?l(f,d,M,E):d.isSpriteMaterial?c(f,d):d.isShadowMaterial?(f.color.value.copy(d.color),f.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(f,d){f.opacity.value=d.opacity,d.color&&f.diffuse.value.copy(d.color),d.emissive&&f.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.bumpMap&&(f.bumpMap.value=d.bumpMap,t(d.bumpMap,f.bumpMapTransform),f.bumpScale.value=d.bumpScale,d.side===Ot&&(f.bumpScale.value*=-1)),d.normalMap&&(f.normalMap.value=d.normalMap,t(d.normalMap,f.normalMapTransform),f.normalScale.value.copy(d.normalScale),d.side===Ot&&f.normalScale.value.negate()),d.displacementMap&&(f.displacementMap.value=d.displacementMap,t(d.displacementMap,f.displacementMapTransform),f.displacementScale.value=d.displacementScale,f.displacementBias.value=d.displacementBias),d.emissiveMap&&(f.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,f.emissiveMapTransform)),d.specularMap&&(f.specularMap.value=d.specularMap,t(d.specularMap,f.specularMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest);const M=e.get(d),E=M.envMap,T=M.envMapRotation;E&&(f.envMap.value=E,f.envMapRotation.value.setFromMatrix4(Cg.makeRotationFromEuler(T)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&f.envMapRotation.value.premultiply(Sc),f.reflectivity.value=d.reflectivity,f.ior.value=d.ior,f.refractionRatio.value=d.refractionRatio),d.lightMap&&(f.lightMap.value=d.lightMap,f.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,f.lightMapTransform)),d.aoMap&&(f.aoMap.value=d.aoMap,f.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,f.aoMapTransform))}function a(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform))}function o(f,d){f.dashSize.value=d.dashSize,f.totalSize.value=d.dashSize+d.gapSize,f.scale.value=d.scale}function l(f,d,M,E){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.size.value=d.size*M,f.scale.value=E*.5,d.map&&(f.map.value=d.map,t(d.map,f.uvTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function c(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.rotation.value=d.rotation,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function u(f,d){f.specular.value.copy(d.specular),f.shininess.value=Math.max(d.shininess,1e-4)}function p(f,d){d.gradientMap&&(f.gradientMap.value=d.gradientMap)}function h(f,d){f.metalness.value=d.metalness,d.metalnessMap&&(f.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,f.metalnessMapTransform)),f.roughness.value=d.roughness,d.roughnessMap&&(f.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,f.roughnessMapTransform)),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)}function m(f,d,M){f.ior.value=d.ior,d.sheen>0&&(f.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),f.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(f.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,f.sheenColorMapTransform)),d.sheenRoughnessMap&&(f.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,f.sheenRoughnessMapTransform))),d.clearcoat>0&&(f.clearcoat.value=d.clearcoat,f.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(f.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,f.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(f.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Ot&&f.clearcoatNormalScale.value.negate())),d.dispersion>0&&(f.dispersion.value=d.dispersion),d.iridescence>0&&(f.iridescence.value=d.iridescence,f.iridescenceIOR.value=d.iridescenceIOR,f.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(f.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,f.iridescenceMapTransform)),d.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),d.transmission>0&&(f.transmission.value=d.transmission,f.transmissionSamplerMap.value=M.texture,f.transmissionSamplerSize.value.set(M.width,M.height),d.transmissionMap&&(f.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,f.transmissionMapTransform)),f.thickness.value=d.thickness,d.thicknessMap&&(f.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=d.attenuationDistance,f.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(f.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(f.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=d.specularIntensity,f.specularColor.value.copy(d.specularColor),d.specularColorMap&&(f.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,f.specularColorMapTransform)),d.specularIntensityMap&&(f.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,d){d.matcap&&(f.matcap.value=d.matcap)}function v(f,d){const M=e.get(d).light;f.referencePosition.value.setFromMatrixPosition(M.matrixWorld),f.nearDistance.value=M.shadow.camera.near,f.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Lg(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,E){const T=E.program;n.uniformBlockBinding(M,T)}function c(M,E){let T=s[M.id];T===void 0&&(g(M),T=u(M),s[M.id]=T,M.addEventListener("dispose",f));const L=E.program;n.updateUBOMapping(M,L);const A=e.render.frame;r[M.id]!==A&&(h(M),r[M.id]=A)}function u(M){const E=p();M.__bindingPointIndex=E;const T=i.createBuffer(),L=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,L,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,T),T}function p(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return Ye("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(M){const E=s[M.id],T=M.uniforms,L=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let A=0,P=T.length;A<P;A++){const x=Array.isArray(T[A])?T[A]:[T[A]];for(let w=0,F=x.length;w<F;w++){const R=x[w];if(m(R,A,w,L)===!0){const N=R.__offset,H=Array.isArray(R.value)?R.value:[R.value];let q=0;for(let U=0;U<H.length;U++){const k=H[U],G=v(k);typeof k=="number"||typeof k=="boolean"?(R.__data[0]=k,i.bufferSubData(i.UNIFORM_BUFFER,N+q,R.__data)):k.isMatrix3?(R.__data[0]=k.elements[0],R.__data[1]=k.elements[1],R.__data[2]=k.elements[2],R.__data[3]=0,R.__data[4]=k.elements[3],R.__data[5]=k.elements[4],R.__data[6]=k.elements[5],R.__data[7]=0,R.__data[8]=k.elements[6],R.__data[9]=k.elements[7],R.__data[10]=k.elements[8],R.__data[11]=0):ArrayBuffer.isView(k)?R.__data.set(new k.constructor(k.buffer,k.byteOffset,R.__data.length)):(k.toArray(R.__data,q),q+=G.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,R.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(M,E,T,L){const A=M.value,P=E+"_"+T;if(L[P]===void 0)return typeof A=="number"||typeof A=="boolean"?L[P]=A:ArrayBuffer.isView(A)?L[P]=A.slice():L[P]=A.clone(),!0;{const x=L[P];if(typeof A=="number"||typeof A=="boolean"){if(x!==A)return L[P]=A,!0}else{if(ArrayBuffer.isView(A))return!0;if(x.equals(A)===!1)return x.copy(A),!0}}return!1}function g(M){const E=M.uniforms;let T=0;const L=16;for(let P=0,x=E.length;P<x;P++){const w=Array.isArray(E[P])?E[P]:[E[P]];for(let F=0,R=w.length;F<R;F++){const N=w[F],H=Array.isArray(N.value)?N.value:[N.value];for(let q=0,U=H.length;q<U;q++){const k=H[q],G=v(k),ee=T%L,te=ee%G.boundary,de=ee+te;T+=te,de!==0&&L-de<G.storage&&(T+=L-de),N.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=T,T+=G.storage}}}const A=T%L;return A>0&&(T+=L-A),M.__size=T,M.__cache={},this}function v(M){const E={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(E.boundary=4,E.storage=4):M.isVector2?(E.boundary=8,E.storage=8):M.isVector3||M.isColor?(E.boundary=16,E.storage=12):M.isVector4?(E.boundary=16,E.storage=16):M.isMatrix3?(E.boundary=48,E.storage=48):M.isMatrix4?(E.boundary=64,E.storage=64):M.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(E.boundary=16,E.storage=M.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",M),E}function f(M){const E=M.target;E.removeEventListener("dispose",f);const T=a.indexOf(E.__bindingPointIndex);a.splice(T,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function d(){for(const M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:d}}const Dg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let an=null;function Ig(){return an===null&&(an=new pu(Dg,16,16,ri,Rn),an.name="DFG_LUT",an.minFilter=Rt,an.magFilter=Rt,an.wrapS=bn,an.wrapT=bn,an.generateMipmaps=!1,an.needsUpdate=!0),an}class Ug{constructor(e={}){const{canvas:t=wh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:m=Vt}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;const v=m,f=new Set([eo,Qa,Ja]),d=new Set([Vt,mn,ts,ns,Za,$a]),M=new Uint32Array(4),E=new Int32Array(4),T=new I;let L=null,A=null;const P=[],x=[];let w=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=un,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const F=this;let R=!1,N=null;this._outputColorSpace=Yt;let H=0,q=0,U=null,k=-1,G=null;const ee=new mt,te=new mt;let de=null;const Y=new He(0);let Q=0,ye=t.width,ke=t.height,Ee=1,Z=null,he=null;const se=new mt(0,0,ye,ke),Ae=new mt(0,0,ye,ke);let De=!1;const Pe=new ao;let st=!1,ze=!1;const Ze=new dt,je=new I,Ue=new mt,Je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ht=!1;function zt(){return U===null?Ee:1}let O=n;function St(S,B){return t.getContext(S,B)}try{const S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ya}`),t.addEventListener("webglcontextlost",ne,!1),t.addEventListener("webglcontextrestored",Te,!1),t.addEventListener("webglcontextcreationerror",Fe,!1),O===null){const B="webgl2";if(O=St(B,S),O===null)throw St(B)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw Ye("WebGLRenderer: "+S.message),S}let Xe,ot,fe,ft,b,_,z,$,ie,re,ue,j,J,_e,Me,le,ae,Ie,Be,$e,D,oe,K;function xe(){Xe=new Ip(O),Xe.init(),D=new Eg(O,Xe),ot=new Tp(O,Xe,e,D),fe=new yg(O,Xe),ot.reversedDepthBuffer&&h&&fe.buffers.depth.setReversed(!0),ft=new Fp(O),b=new lg,_=new bg(O,Xe,fe,b,ot,D,ft),z=new Dp(F),$=new zu(O),oe=new bp(O,$),ie=new Up(O,$,ft,oe),re=new Bp(O,ie,$,oe,ft),Ie=new Op(O,ot,_),Me=new Ap(b),ue=new og(F,z,Xe,ot,oe,Me),j=new Pg(F,b),J=new hg,_e=new gg(Xe),ae=new yp(F,z,fe,re,g,l),le=new Sg(F,re,ot),K=new Lg(O,ft,ot,fe),Be=new Ep(O,Xe,ft),$e=new Np(O,Xe,ft),ft.programs=ue.programs,F.capabilities=ot,F.extensions=Xe,F.properties=b,F.renderLists=J,F.shadowMap=le,F.state=fe,F.info=ft}xe(),v!==Vt&&(w=new Gp(v,t.width,t.height,s,r));const ce=new Rg(F,O);this.xr=ce,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const S=Xe.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Xe.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Ee},this.setPixelRatio=function(S){S!==void 0&&(Ee=S,this.setSize(ye,ke,!1))},this.getSize=function(S){return S.set(ye,ke)},this.setSize=function(S,B,X=!0){if(ce.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}ye=S,ke=B,t.width=Math.floor(S*Ee),t.height=Math.floor(B*Ee),X===!0&&(t.style.width=S+"px",t.style.height=B+"px"),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,S,B)},this.getDrawingBufferSize=function(S){return S.set(ye*Ee,ke*Ee).floor()},this.setDrawingBufferSize=function(S,B,X){ye=S,ke=B,Ee=X,t.width=Math.floor(S*X),t.height=Math.floor(B*X),this.setViewport(0,0,S,B)},this.setEffects=function(S){if(v===Vt){Ye("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let B=0;B<S.length;B++)if(S[B].isOutputPass===!0){Le("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(ee)},this.getViewport=function(S){return S.copy(se)},this.setViewport=function(S,B,X,V){S.isVector4?se.set(S.x,S.y,S.z,S.w):se.set(S,B,X,V),fe.viewport(ee.copy(se).multiplyScalar(Ee).round())},this.getScissor=function(S){return S.copy(Ae)},this.setScissor=function(S,B,X,V){S.isVector4?Ae.set(S.x,S.y,S.z,S.w):Ae.set(S,B,X,V),fe.scissor(te.copy(Ae).multiplyScalar(Ee).round())},this.getScissorTest=function(){return De},this.setScissorTest=function(S){fe.setScissorTest(De=S)},this.setOpaqueSort=function(S){Z=S},this.setTransparentSort=function(S){he=S},this.getClearColor=function(S){return S.copy(ae.getClearColor())},this.setClearColor=function(){ae.setClearColor(...arguments)},this.getClearAlpha=function(){return ae.getClearAlpha()},this.setClearAlpha=function(){ae.setClearAlpha(...arguments)},this.clear=function(S=!0,B=!0,X=!0){let V=0;if(S){let W=!1;if(U!==null){const ge=U.texture.format;W=f.has(ge)}if(W){const ge=U.texture.type,Se=d.has(ge),me=ae.getClearColor(),be=ae.getClearAlpha(),we=me.r,Oe=me.g,Ve=me.b;Se?(M[0]=we,M[1]=Oe,M[2]=Ve,M[3]=be,O.clearBufferuiv(O.COLOR,0,M)):(E[0]=we,E[1]=Oe,E[2]=Ve,E[3]=be,O.clearBufferiv(O.COLOR,0,E))}else V|=O.COLOR_BUFFER_BIT}B&&(V|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(V|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&O.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),N=S},this.dispose=function(){t.removeEventListener("webglcontextlost",ne,!1),t.removeEventListener("webglcontextrestored",Te,!1),t.removeEventListener("webglcontextcreationerror",Fe,!1),ae.dispose(),J.dispose(),_e.dispose(),b.dispose(),z.dispose(),re.dispose(),oe.dispose(),K.dispose(),ue.dispose(),ce.dispose(),ce.removeEventListener("sessionstart",So),ce.removeEventListener("sessionend",yo),jn.stop()};function ne(S){S.preventDefault(),Qs("WebGLRenderer: Context Lost."),R=!0}function Te(){Qs("WebGLRenderer: Context Restored."),R=!1;const S=ft.autoReset,B=le.enabled,X=le.autoUpdate,V=le.needsUpdate,W=le.type;xe(),ft.autoReset=S,le.enabled=B,le.autoUpdate=X,le.needsUpdate=V,le.type=W}function Fe(S){Ye("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function gt(S){const B=S.target;B.removeEventListener("dispose",gt),tt(B)}function tt(S){_n(S),b.remove(S)}function _n(S){const B=b.get(S).programs;B!==void 0&&(B.forEach(function(X){ue.releaseProgram(X)}),S.isShaderMaterial&&ue.releaseShaderCache(S))}this.renderBufferDirect=function(S,B,X,V,W,ge){B===null&&(B=Je);const Se=W.isMesh&&W.matrixWorld.determinant()<0,me=Gc(S,B,X,V,W);fe.setMaterial(V,Se);let be=X.index,we=1;if(V.wireframe===!0){if(be=ie.getWireframeAttribute(X),be===void 0)return;we=2}const Oe=X.drawRange,Ve=X.attributes.position;let Re=Oe.start*we,nt=(Oe.start+Oe.count)*we;ge!==null&&(Re=Math.max(Re,ge.start*we),nt=Math.min(nt,(ge.start+ge.count)*we)),be!==null?(Re=Math.max(Re,0),nt=Math.min(nt,be.count)):Ve!=null&&(Re=Math.max(Re,0),nt=Math.min(nt,Ve.count));const _t=nt-Re;if(_t<0||_t===1/0)return;oe.setup(W,V,me,X,be);let pt,rt=Be;if(be!==null&&(pt=$.get(be),rt=$e,rt.setIndex(pt)),W.isMesh)V.wireframe===!0?(fe.setLineWidth(V.wireframeLinewidth*zt()),rt.setMode(O.LINES)):rt.setMode(O.TRIANGLES);else if(W.isLine){let Ct=V.linewidth;Ct===void 0&&(Ct=1),fe.setLineWidth(Ct*zt()),W.isLineSegments?rt.setMode(O.LINES):W.isLineLoop?rt.setMode(O.LINE_LOOP):rt.setMode(O.LINE_STRIP)}else W.isPoints?rt.setMode(O.POINTS):W.isSprite&&rt.setMode(O.TRIANGLES);if(W.isBatchedMesh)if(Xe.get("WEBGL_multi_draw"))rt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Ct=W._multiDrawStarts,ve=W._multiDrawCounts,Gt=W._multiDrawCount,Ke=be?$.get(be).bytesPerElement:1,Xt=b.get(V).currentProgram.getUniforms();for(let sn=0;sn<Gt;sn++)Xt.setValue(O,"_gl_DrawID",sn),rt.render(Ct[sn]/Ke,ve[sn])}else if(W.isInstancedMesh)rt.renderInstances(Re,_t,W.count);else if(X.isInstancedBufferGeometry){const Ct=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,ve=Math.min(X.instanceCount,Ct);rt.renderInstances(Re,_t,ve)}else rt.render(Re,_t)};function nn(S,B,X){S.transparent===!0&&S.side===Qt&&S.forceSinglePass===!1?(S.side=Ot,S.needsUpdate=!0,ls(S,B,X),S.side=Wn,S.needsUpdate=!0,ls(S,B,X),S.side=Qt):ls(S,B,X)}this.compile=function(S,B,X=null){X===null&&(X=S),A=_e.get(X),A.init(B),x.push(A),X.traverseVisible(function(W){W.isLight&&W.layers.test(B.layers)&&(A.pushLight(W),W.castShadow&&A.pushShadow(W))}),S!==X&&S.traverseVisible(function(W){W.isLight&&W.layers.test(B.layers)&&(A.pushLight(W),W.castShadow&&A.pushShadow(W))}),A.setupLights();const V=new Set;return S.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const ge=W.material;if(ge)if(Array.isArray(ge))for(let Se=0;Se<ge.length;Se++){const me=ge[Se];nn(me,X,W),V.add(me)}else nn(ge,X,W),V.add(ge)}),A=x.pop(),V},this.compileAsync=function(S,B,X=null){const V=this.compile(S,B,X);return new Promise(W=>{function ge(){if(V.forEach(function(Se){b.get(Se).currentProgram.isReady()&&V.delete(Se)}),V.size===0){W(S);return}setTimeout(ge,10)}Xe.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let cr=null;function Bc(S){cr&&cr(S)}function So(){jn.stop()}function yo(){jn.start()}const jn=new pc;jn.setAnimationLoop(Bc),typeof self<"u"&&jn.setContext(self),this.setAnimationLoop=function(S){cr=S,ce.setAnimationLoop(S),S===null?jn.stop():jn.start()},ce.addEventListener("sessionstart",So),ce.addEventListener("sessionend",yo),this.render=function(S,B){if(B!==void 0&&B.isCamera!==!0){Ye("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;N!==null&&N.renderStart(S,B);const X=ce.enabled===!0&&ce.isPresenting===!0,V=w!==null&&(U===null||X)&&w.begin(F,U);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),ce.enabled===!0&&ce.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(ce.cameraAutoUpdate===!0&&ce.updateCamera(B),B=ce.getCamera()),S.isScene===!0&&S.onBeforeRender(F,S,B,U),A=_e.get(S,x.length),A.init(B),A.state.textureUnits=_.getTextureUnits(),x.push(A),Ze.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),Pe.setFromProjectionMatrix(Ze,cn,B.reversedDepth),ze=this.localClippingEnabled,st=Me.init(this.clippingPlanes,ze),L=J.get(S,P.length),L.init(),P.push(L),ce.enabled===!0&&ce.isPresenting===!0){const Se=F.xr.getDepthSensingMesh();Se!==null&&hr(Se,B,-1/0,F.sortObjects)}hr(S,B,0,F.sortObjects),L.finish(),F.sortObjects===!0&&L.sort(Z,he),ht=ce.enabled===!1||ce.isPresenting===!1||ce.hasDepthSensing()===!1,ht&&ae.addToRenderList(L,S),this.info.render.frame++,st===!0&&Me.beginShadows();const W=A.state.shadowsArray;if(le.render(W,S,B),st===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset(),(V&&w.hasRenderPass())===!1){const Se=L.opaque,me=L.transmissive;if(A.setupLights(),B.isArrayCamera){const be=B.cameras;if(me.length>0)for(let we=0,Oe=be.length;we<Oe;we++){const Ve=be[we];Eo(Se,me,S,Ve)}ht&&ae.render(S);for(let we=0,Oe=be.length;we<Oe;we++){const Ve=be[we];bo(L,S,Ve,Ve.viewport)}}else me.length>0&&Eo(Se,me,S,B),ht&&ae.render(S),bo(L,S,B)}U!==null&&q===0&&(_.updateMultisampleRenderTarget(U),_.updateRenderTargetMipmap(U)),V&&w.end(F),S.isScene===!0&&S.onAfterRender(F,S,B),oe.resetDefaultState(),k=-1,G=null,x.pop(),x.length>0?(A=x[x.length-1],_.setTextureUnits(A.state.textureUnits),st===!0&&Me.setGlobalState(F.clippingPlanes,A.state.camera)):A=null,P.pop(),P.length>0?L=P[P.length-1]:L=null,N!==null&&N.renderEnd()};function hr(S,B,X,V){if(S.visible===!1)return;if(S.layers.test(B.layers)){if(S.isGroup)X=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(B);else if(S.isLightProbeGrid)A.pushLightProbeGrid(S);else if(S.isLight)A.pushLight(S),S.castShadow&&A.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Pe.intersectsSprite(S)){V&&Ue.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Ze);const Se=re.update(S),me=S.material;me.visible&&L.push(S,Se,me,X,Ue.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Pe.intersectsObject(S))){const Se=re.update(S),me=S.material;if(V&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Ue.copy(S.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),Ue.copy(Se.boundingSphere.center)),Ue.applyMatrix4(S.matrixWorld).applyMatrix4(Ze)),Array.isArray(me)){const be=Se.groups;for(let we=0,Oe=be.length;we<Oe;we++){const Ve=be[we],Re=me[Ve.materialIndex];Re&&Re.visible&&L.push(S,Se,Re,X,Ue.z,Ve)}}else me.visible&&L.push(S,Se,me,X,Ue.z,null)}}const ge=S.children;for(let Se=0,me=ge.length;Se<me;Se++)hr(ge[Se],B,X,V)}function bo(S,B,X,V){const{opaque:W,transmissive:ge,transparent:Se}=S;A.setupLightsView(X),st===!0&&Me.setGlobalState(F.clippingPlanes,X),V&&fe.viewport(ee.copy(V)),W.length>0&&os(W,B,X),ge.length>0&&os(ge,B,X),Se.length>0&&os(Se,B,X),fe.buffers.depth.setTest(!0),fe.buffers.depth.setMask(!0),fe.buffers.color.setMask(!0),fe.setPolygonOffset(!1)}function Eo(S,B,X,V){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[V.id]===void 0){const Re=Xe.has("EXT_color_buffer_half_float")||Xe.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[V.id]=new dn(1,1,{generateMipmaps:!0,type:Re?Rn:Vt,minFilter:ti,samples:Math.max(4,ot.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qe.workingColorSpace})}const ge=A.state.transmissionRenderTarget[V.id],Se=V.viewport||ee;ge.setSize(Se.z*F.transmissionResolutionScale,Se.w*F.transmissionResolutionScale);const me=F.getRenderTarget(),be=F.getActiveCubeFace(),we=F.getActiveMipmapLevel();F.setRenderTarget(ge),F.getClearColor(Y),Q=F.getClearAlpha(),Q<1&&F.setClearColor(16777215,.5),F.clear(),ht&&ae.render(X);const Oe=F.toneMapping;F.toneMapping=un;const Ve=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),A.setupLightsView(V),st===!0&&Me.setGlobalState(F.clippingPlanes,V),os(S,X,V),_.updateMultisampleRenderTarget(ge),_.updateRenderTargetMipmap(ge),Xe.has("WEBGL_multisampled_render_to_texture")===!1){let Re=!1;for(let nt=0,_t=B.length;nt<_t;nt++){const pt=B[nt],{object:rt,geometry:Ct,material:ve,group:Gt}=pt;if(ve.side===Qt&&rt.layers.test(V.layers)){const Ke=ve.side;ve.side=Ot,ve.needsUpdate=!0,To(rt,X,V,Ct,ve,Gt),ve.side=Ke,ve.needsUpdate=!0,Re=!0}}Re===!0&&(_.updateMultisampleRenderTarget(ge),_.updateRenderTargetMipmap(ge))}F.setRenderTarget(me,be,we),F.setClearColor(Y,Q),Ve!==void 0&&(V.viewport=Ve),F.toneMapping=Oe}function os(S,B,X){const V=B.isScene===!0?B.overrideMaterial:null;for(let W=0,ge=S.length;W<ge;W++){const Se=S[W],{object:me,geometry:be,group:we}=Se;let Oe=Se.material;Oe.allowOverride===!0&&V!==null&&(Oe=V),me.layers.test(X.layers)&&To(me,B,X,be,Oe,we)}}function To(S,B,X,V,W,ge){S.onBeforeRender(F,B,X,V,W,ge),S.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),W.onBeforeRender(F,B,X,V,S,ge),W.transparent===!0&&W.side===Qt&&W.forceSinglePass===!1?(W.side=Ot,W.needsUpdate=!0,F.renderBufferDirect(X,B,V,W,S,ge),W.side=Wn,W.needsUpdate=!0,F.renderBufferDirect(X,B,V,W,S,ge),W.side=Qt):F.renderBufferDirect(X,B,V,W,S,ge),S.onAfterRender(F,B,X,V,W,ge)}function ls(S,B,X){B.isScene!==!0&&(B=Je);const V=b.get(S),W=A.state.lights,ge=A.state.shadowsArray,Se=W.state.version,me=ue.getParameters(S,W.state,ge,B,X,A.state.lightProbeGridArray),be=ue.getProgramCacheKey(me);let we=V.programs;V.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?B.environment:null,V.fog=B.fog;const Oe=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;V.envMap=z.get(S.envMap||V.environment,Oe),V.envMapRotation=V.environment!==null&&S.envMap===null?B.environmentRotation:S.envMapRotation,we===void 0&&(S.addEventListener("dispose",gt),we=new Map,V.programs=we);let Ve=we.get(be);if(Ve!==void 0){if(V.currentProgram===Ve&&V.lightsStateVersion===Se)return wo(S,me),Ve}else me.uniforms=ue.getUniforms(S),N!==null&&S.isNodeMaterial&&N.build(S,X,me),S.onBeforeCompile(me,F),Ve=ue.acquireProgram(me,be),we.set(be,Ve),V.uniforms=me.uniforms;const Re=V.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Re.clippingPlanes=Me.uniform),wo(S,me),V.needsLights=kc(S),V.lightsStateVersion=Se,V.needsLights&&(Re.ambientLightColor.value=W.state.ambient,Re.lightProbe.value=W.state.probe,Re.directionalLights.value=W.state.directional,Re.directionalLightShadows.value=W.state.directionalShadow,Re.spotLights.value=W.state.spot,Re.spotLightShadows.value=W.state.spotShadow,Re.rectAreaLights.value=W.state.rectArea,Re.ltc_1.value=W.state.rectAreaLTC1,Re.ltc_2.value=W.state.rectAreaLTC2,Re.pointLights.value=W.state.point,Re.pointLightShadows.value=W.state.pointShadow,Re.hemisphereLights.value=W.state.hemi,Re.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Re.spotLightMatrix.value=W.state.spotLightMatrix,Re.spotLightMap.value=W.state.spotLightMap,Re.pointShadowMatrix.value=W.state.pointShadowMatrix),V.lightProbeGrid=A.state.lightProbeGridArray.length>0,V.currentProgram=Ve,V.uniformsList=null,Ve}function Ao(S){if(S.uniformsList===null){const B=S.currentProgram.getUniforms();S.uniformsList=qs.seqWithValue(B.seq,S.uniforms)}return S.uniformsList}function wo(S,B){const X=b.get(S);X.outputColorSpace=B.outputColorSpace,X.batching=B.batching,X.batchingColor=B.batchingColor,X.instancing=B.instancing,X.instancingColor=B.instancingColor,X.instancingMorph=B.instancingMorph,X.skinning=B.skinning,X.morphTargets=B.morphTargets,X.morphNormals=B.morphNormals,X.morphColors=B.morphColors,X.morphTargetsCount=B.morphTargetsCount,X.numClippingPlanes=B.numClippingPlanes,X.numIntersection=B.numClipIntersection,X.vertexAlphas=B.vertexAlphas,X.vertexTangents=B.vertexTangents,X.toneMapping=B.toneMapping}function zc(S,B){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;T.setFromMatrixPosition(B.matrixWorld);for(let X=0,V=S.length;X<V;X++){const W=S[X];if(W.texture!==null&&W.boundingBox.containsPoint(T))return W}return null}function Gc(S,B,X,V,W){B.isScene!==!0&&(B=Je),_.resetTextureUnits();const ge=B.fog,Se=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?B.environment:null,me=U===null?F.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:qe.workingColorSpace,be=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,we=z.get(V.envMap||Se,be),Oe=V.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Ve=!!X.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Re=!!X.morphAttributes.position,nt=!!X.morphAttributes.normal,_t=!!X.morphAttributes.color;let pt=un;V.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(pt=F.toneMapping);const rt=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Ct=rt!==void 0?rt.length:0,ve=b.get(V),Gt=A.state.lights;if(st===!0&&(ze===!0||S!==G)){const lt=S===G&&V.id===k;Me.setState(V,S,lt)}let Ke=!1;V.version===ve.__version?(ve.needsLights&&ve.lightsStateVersion!==Gt.state.version||ve.outputColorSpace!==me||W.isBatchedMesh&&ve.batching===!1||!W.isBatchedMesh&&ve.batching===!0||W.isBatchedMesh&&ve.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&ve.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&ve.instancing===!1||!W.isInstancedMesh&&ve.instancing===!0||W.isSkinnedMesh&&ve.skinning===!1||!W.isSkinnedMesh&&ve.skinning===!0||W.isInstancedMesh&&ve.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&ve.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&ve.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&ve.instancingMorph===!1&&W.morphTexture!==null||ve.envMap!==we||V.fog===!0&&ve.fog!==ge||ve.numClippingPlanes!==void 0&&(ve.numClippingPlanes!==Me.numPlanes||ve.numIntersection!==Me.numIntersection)||ve.vertexAlphas!==Oe||ve.vertexTangents!==Ve||ve.morphTargets!==Re||ve.morphNormals!==nt||ve.morphColors!==_t||ve.toneMapping!==pt||ve.morphTargetsCount!==Ct||!!ve.lightProbeGrid!=A.state.lightProbeGridArray.length>0)&&(Ke=!0):(Ke=!0,ve.__version=V.version);let Xt=ve.currentProgram;Ke===!0&&(Xt=ls(V,B,W),N&&V.isNodeMaterial&&N.onUpdateProgram(V,Xt,ve));let sn=!1,Pn=!1,oi=!1;const at=Xt.getUniforms(),xt=ve.uniforms;if(fe.useProgram(Xt.program)&&(sn=!0,Pn=!0,oi=!0),V.id!==k&&(k=V.id,Pn=!0),ve.needsLights){const lt=zc(A.state.lightProbeGridArray,W);ve.lightProbeGrid!==lt&&(ve.lightProbeGrid=lt,Pn=!0)}if(sn||G!==S){fe.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),at.setValue(O,"projectionMatrix",S.projectionMatrix),at.setValue(O,"viewMatrix",S.matrixWorldInverse);const Dn=at.map.cameraPosition;Dn!==void 0&&Dn.setValue(O,je.setFromMatrixPosition(S.matrixWorld)),ot.logarithmicDepthBuffer&&at.setValue(O,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&at.setValue(O,"isOrthographic",S.isOrthographicCamera===!0),G!==S&&(G=S,Pn=!0,oi=!0)}if(ve.needsLights&&(Gt.state.directionalShadowMap.length>0&&at.setValue(O,"directionalShadowMap",Gt.state.directionalShadowMap,_),Gt.state.spotShadowMap.length>0&&at.setValue(O,"spotShadowMap",Gt.state.spotShadowMap,_),Gt.state.pointShadowMap.length>0&&at.setValue(O,"pointShadowMap",Gt.state.pointShadowMap,_)),W.isSkinnedMesh){at.setOptional(O,W,"bindMatrix"),at.setOptional(O,W,"bindMatrixInverse");const lt=W.skeleton;lt&&(lt.boneTexture===null&&lt.computeBoneTexture(),at.setValue(O,"boneTexture",lt.boneTexture,_))}W.isBatchedMesh&&(at.setOptional(O,W,"batchingTexture"),at.setValue(O,"batchingTexture",W._matricesTexture,_),at.setOptional(O,W,"batchingIdTexture"),at.setValue(O,"batchingIdTexture",W._indirectTexture,_),at.setOptional(O,W,"batchingColorTexture"),W._colorsTexture!==null&&at.setValue(O,"batchingColorTexture",W._colorsTexture,_));const Ln=X.morphAttributes;if((Ln.position!==void 0||Ln.normal!==void 0||Ln.color!==void 0)&&Ie.update(W,X,Xt),(Pn||ve.receiveShadow!==W.receiveShadow)&&(ve.receiveShadow=W.receiveShadow,at.setValue(O,"receiveShadow",W.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&B.environment!==null&&(xt.envMapIntensity.value=B.environmentIntensity),xt.dfgLUT!==void 0&&(xt.dfgLUT.value=Ig()),Pn){if(at.setValue(O,"toneMappingExposure",F.toneMappingExposure),ve.needsLights&&Hc(xt,oi),ge&&V.fog===!0&&j.refreshFogUniforms(xt,ge),j.refreshMaterialUniforms(xt,V,Ee,ke,A.state.transmissionRenderTarget[S.id]),ve.needsLights&&ve.lightProbeGrid){const lt=ve.lightProbeGrid;xt.probesSH.value=lt.texture,xt.probesMin.value.copy(lt.boundingBox.min),xt.probesMax.value.copy(lt.boundingBox.max),xt.probesResolution.value.copy(lt.resolution)}qs.upload(O,Ao(ve),xt,_)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(qs.upload(O,Ao(ve),xt,_),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&at.setValue(O,"center",W.center),at.setValue(O,"modelViewMatrix",W.modelViewMatrix),at.setValue(O,"normalMatrix",W.normalMatrix),at.setValue(O,"modelMatrix",W.matrixWorld),V.uniformsGroups!==void 0){const lt=V.uniformsGroups;for(let Dn=0,li=lt.length;Dn<li;Dn++){const Ro=lt[Dn];K.update(Ro,Xt),K.bind(Ro,Xt)}}return Xt}function Hc(S,B){S.ambientLightColor.needsUpdate=B,S.lightProbe.needsUpdate=B,S.directionalLights.needsUpdate=B,S.directionalLightShadows.needsUpdate=B,S.pointLights.needsUpdate=B,S.pointLightShadows.needsUpdate=B,S.spotLights.needsUpdate=B,S.spotLightShadows.needsUpdate=B,S.rectAreaLights.needsUpdate=B,S.hemisphereLights.needsUpdate=B}function kc(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(S,B,X){const V=b.get(S);V.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),b.get(S.texture).__webglTexture=B,b.get(S.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:X,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,B){const X=b.get(S);X.__webglFramebuffer=B,X.__useDefaultFramebuffer=B===void 0};const Vc=O.createFramebuffer();this.setRenderTarget=function(S,B=0,X=0){U=S,H=B,q=X;let V=null,W=!1,ge=!1;if(S){const me=b.get(S);if(me.__useDefaultFramebuffer!==void 0){fe.bindFramebuffer(O.FRAMEBUFFER,me.__webglFramebuffer),ee.copy(S.viewport),te.copy(S.scissor),de=S.scissorTest,fe.viewport(ee),fe.scissor(te),fe.setScissorTest(de),k=-1;return}else if(me.__webglFramebuffer===void 0)_.setupRenderTarget(S);else if(me.__hasExternalTextures)_.rebindTextures(S,b.get(S.texture).__webglTexture,b.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Oe=S.depthTexture;if(me.__boundDepthTexture!==Oe){if(Oe!==null&&b.has(Oe)&&(S.width!==Oe.image.width||S.height!==Oe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");_.setupDepthRenderbuffer(S)}}const be=S.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(ge=!0);const we=b.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(we[B])?V=we[B][X]:V=we[B],W=!0):S.samples>0&&_.useMultisampledRTT(S)===!1?V=b.get(S).__webglMultisampledFramebuffer:Array.isArray(we)?V=we[X]:V=we,ee.copy(S.viewport),te.copy(S.scissor),de=S.scissorTest}else ee.copy(se).multiplyScalar(Ee).floor(),te.copy(Ae).multiplyScalar(Ee).floor(),de=De;if(X!==0&&(V=Vc),fe.bindFramebuffer(O.FRAMEBUFFER,V)&&fe.drawBuffers(S,V),fe.viewport(ee),fe.scissor(te),fe.setScissorTest(de),W){const me=b.get(S.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+B,me.__webglTexture,X)}else if(ge){const me=B;for(let be=0;be<S.textures.length;be++){const we=b.get(S.textures[be]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+be,we.__webglTexture,X,me)}}else if(S!==null&&X!==0){const me=b.get(S.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,me.__webglTexture,X)}k=-1},this.readRenderTargetPixels=function(S,B,X,V,W,ge,Se,me=0){if(!(S&&S.isWebGLRenderTarget)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=b.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Se!==void 0&&(be=be[Se]),be){fe.bindFramebuffer(O.FRAMEBUFFER,be);try{const we=S.textures[me],Oe=we.format,Ve=we.type;if(S.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+me),!ot.textureFormatReadable(Oe)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ot.textureTypeReadable(Ve)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=S.width-V&&X>=0&&X<=S.height-W&&O.readPixels(B,X,V,W,D.convert(Oe),D.convert(Ve),ge)}finally{const we=U!==null?b.get(U).__webglFramebuffer:null;fe.bindFramebuffer(O.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(S,B,X,V,W,ge,Se,me=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=b.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Se!==void 0&&(be=be[Se]),be)if(B>=0&&B<=S.width-V&&X>=0&&X<=S.height-W){fe.bindFramebuffer(O.FRAMEBUFFER,be);const we=S.textures[me],Oe=we.format,Ve=we.type;if(S.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+me),!ot.textureFormatReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ot.textureTypeReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Re=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,Re),O.bufferData(O.PIXEL_PACK_BUFFER,ge.byteLength,O.STREAM_READ),O.readPixels(B,X,V,W,D.convert(Oe),D.convert(Ve),0);const nt=U!==null?b.get(U).__webglFramebuffer:null;fe.bindFramebuffer(O.FRAMEBUFFER,nt);const _t=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await Rh(O,_t,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,Re),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,ge),O.deleteBuffer(Re),O.deleteSync(_t),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,B=null,X=0){const V=Math.pow(2,-X),W=Math.floor(S.image.width*V),ge=Math.floor(S.image.height*V),Se=B!==null?B.x:0,me=B!==null?B.y:0;_.setTexture2D(S,0),O.copyTexSubImage2D(O.TEXTURE_2D,X,0,0,Se,me,W,ge),fe.unbindTexture()};const Wc=O.createFramebuffer(),Xc=O.createFramebuffer();this.copyTextureToTexture=function(S,B,X=null,V=null,W=0,ge=0){let Se,me,be,we,Oe,Ve,Re,nt,_t;const pt=S.isCompressedTexture?S.mipmaps[ge]:S.image;if(X!==null)Se=X.max.x-X.min.x,me=X.max.y-X.min.y,be=X.isBox3?X.max.z-X.min.z:1,we=X.min.x,Oe=X.min.y,Ve=X.isBox3?X.min.z:0;else{const xt=Math.pow(2,-W);Se=Math.floor(pt.width*xt),me=Math.floor(pt.height*xt),S.isDataArrayTexture?be=pt.depth:S.isData3DTexture?be=Math.floor(pt.depth*xt):be=1,we=0,Oe=0,Ve=0}V!==null?(Re=V.x,nt=V.y,_t=V.z):(Re=0,nt=0,_t=0);const rt=D.convert(B.format),Ct=D.convert(B.type);let ve;B.isData3DTexture?(_.setTexture3D(B,0),ve=O.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(_.setTexture2DArray(B,0),ve=O.TEXTURE_2D_ARRAY):(_.setTexture2D(B,0),ve=O.TEXTURE_2D),fe.activeTexture(O.TEXTURE0),fe.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,B.flipY),fe.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),fe.pixelStorei(O.UNPACK_ALIGNMENT,B.unpackAlignment);const Gt=fe.getParameter(O.UNPACK_ROW_LENGTH),Ke=fe.getParameter(O.UNPACK_IMAGE_HEIGHT),Xt=fe.getParameter(O.UNPACK_SKIP_PIXELS),sn=fe.getParameter(O.UNPACK_SKIP_ROWS),Pn=fe.getParameter(O.UNPACK_SKIP_IMAGES);fe.pixelStorei(O.UNPACK_ROW_LENGTH,pt.width),fe.pixelStorei(O.UNPACK_IMAGE_HEIGHT,pt.height),fe.pixelStorei(O.UNPACK_SKIP_PIXELS,we),fe.pixelStorei(O.UNPACK_SKIP_ROWS,Oe),fe.pixelStorei(O.UNPACK_SKIP_IMAGES,Ve);const oi=S.isDataArrayTexture||S.isData3DTexture,at=B.isDataArrayTexture||B.isData3DTexture;if(S.isDepthTexture){const xt=b.get(S),Ln=b.get(B),lt=b.get(xt.__renderTarget),Dn=b.get(Ln.__renderTarget);fe.bindFramebuffer(O.READ_FRAMEBUFFER,lt.__webglFramebuffer),fe.bindFramebuffer(O.DRAW_FRAMEBUFFER,Dn.__webglFramebuffer);for(let li=0;li<be;li++)oi&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,b.get(S).__webglTexture,W,Ve+li),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,b.get(B).__webglTexture,ge,_t+li)),O.blitFramebuffer(we,Oe,Se,me,Re,nt,Se,me,O.DEPTH_BUFFER_BIT,O.NEAREST);fe.bindFramebuffer(O.READ_FRAMEBUFFER,null),fe.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(W!==0||S.isRenderTargetTexture||b.has(S)){const xt=b.get(S),Ln=b.get(B);fe.bindFramebuffer(O.READ_FRAMEBUFFER,Wc),fe.bindFramebuffer(O.DRAW_FRAMEBUFFER,Xc);for(let lt=0;lt<be;lt++)oi?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,xt.__webglTexture,W,Ve+lt):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,xt.__webglTexture,W),at?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ln.__webglTexture,ge,_t+lt):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ln.__webglTexture,ge),W!==0?O.blitFramebuffer(we,Oe,Se,me,Re,nt,Se,me,O.COLOR_BUFFER_BIT,O.NEAREST):at?O.copyTexSubImage3D(ve,ge,Re,nt,_t+lt,we,Oe,Se,me):O.copyTexSubImage2D(ve,ge,Re,nt,we,Oe,Se,me);fe.bindFramebuffer(O.READ_FRAMEBUFFER,null),fe.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else at?S.isDataTexture||S.isData3DTexture?O.texSubImage3D(ve,ge,Re,nt,_t,Se,me,be,rt,Ct,pt.data):B.isCompressedArrayTexture?O.compressedTexSubImage3D(ve,ge,Re,nt,_t,Se,me,be,rt,pt.data):O.texSubImage3D(ve,ge,Re,nt,_t,Se,me,be,rt,Ct,pt):S.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,ge,Re,nt,Se,me,rt,Ct,pt.data):S.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,ge,Re,nt,pt.width,pt.height,rt,pt.data):O.texSubImage2D(O.TEXTURE_2D,ge,Re,nt,Se,me,rt,Ct,pt);fe.pixelStorei(O.UNPACK_ROW_LENGTH,Gt),fe.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Ke),fe.pixelStorei(O.UNPACK_SKIP_PIXELS,Xt),fe.pixelStorei(O.UNPACK_SKIP_ROWS,sn),fe.pixelStorei(O.UNPACK_SKIP_IMAGES,Pn),ge===0&&B.generateMipmaps&&O.generateMipmap(ve),fe.unbindTexture()},this.initRenderTarget=function(S){b.get(S).__webglFramebuffer===void 0&&_.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?_.setTextureCube(S,0):S.isData3DTexture?_.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?_.setTexture2DArray(S,0):_.setTexture2D(S,0),fe.unbindTexture()},this.resetState=function(){H=0,q=0,U=null,fe.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}}const Nl={type:"change"},fo={type:"start"},yc={type:"end"},zs=new ro,Fl=new zn,Ng=Math.cos(70*qh.DEG2RAD),yt=new I,Ft=2*Math.PI,it={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},qr=1e-6;class Fg extends Ou{constructor(e,t=null){super(e,t),this.state=it.NONE,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:En.ROTATE,MIDDLE:En.DOLLY,RIGHT:En.PAN},this.touches={ONE:Hn.ROTATE,TWO:Hn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new Xn,this._lastTargetPosition=new I,this._quat=new Xn().setFromUnitVectors(e.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new cl,this._sphericalDelta=new cl,this._scale=1,this._panOffset=new I,this._rotateStart=new Ce,this._rotateEnd=new Ce,this._rotateDelta=new Ce,this._panStart=new Ce,this._panEnd=new Ce,this._panDelta=new Ce,this._dollyStart=new Ce,this._dollyEnd=new Ce,this._dollyDelta=new Ce,this._dollyDirection=new I,this._mouse=new Ce,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Bg.bind(this),this._onPointerDown=Og.bind(this),this._onPointerUp=zg.bind(this),this._onContextMenu=qg.bind(this),this._onMouseWheel=kg.bind(this),this._onKeyDown=Vg.bind(this),this._onTouchStart=Wg.bind(this),this._onTouchMove=Xg.bind(this),this._onMouseDown=Gg.bind(this),this._onMouseMove=Hg.bind(this),this._interceptControlDown=Yg.bind(this),this._interceptControlUp=jg.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Nl),this.update(),this.state=it.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;yt.copy(t).sub(this.target),yt.applyQuaternion(this._quat),this._spherical.setFromVector3(yt),this.autoRotate&&this.state===it.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=Ft:n>Math.PI&&(n-=Ft),s<-Math.PI?s+=Ft:s>Math.PI&&(s-=Ft),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(yt.setFromSpherical(this._spherical),yt.applyQuaternion(this._quatInverse),t.copy(this.target).add(yt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=yt.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new I(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new I(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=yt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(zs.origin.copy(this.object.position),zs.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(zs.direction))<Ng?this.object.lookAt(this.target):(Fl.setFromNormalAndCoplanarPoint(this.object.up,this.target),zs.intersectPlane(Fl,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>qr||8*(1-this._lastQuaternion.dot(this.object.quaternion))>qr||this._lastTargetPosition.distanceToSquared(this.target)>qr?(this.dispatchEvent(Nl),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Ft/60*this.autoRotateSpeed*e:Ft/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){yt.setFromMatrixColumn(t,0),yt.multiplyScalar(-e),this._panOffset.add(yt)}_panUp(e,t){this.screenSpacePanning===!0?yt.setFromMatrixColumn(t,1):(yt.setFromMatrixColumn(t,0),yt.crossVectors(this.object.up,yt)),yt.multiplyScalar(e),this._panOffset.add(yt)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;yt.copy(s).sub(this.target);let r=yt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Ft*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ft*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Ft*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Ft*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Ft*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Ft*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Ft*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ft*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ce,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Og(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Bg(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function zg(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(yc),this.state=it.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Gg(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case En.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=it.DOLLY;break;case En.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=it.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=it.ROTATE}break;case En.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=it.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=it.PAN}break;default:this.state=it.NONE}this.state!==it.NONE&&this.dispatchEvent(fo)}function Hg(i){switch(this.state){case it.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case it.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case it.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function kg(i){this.enabled===!1||this.enableZoom===!1||this.state!==it.NONE||(i.preventDefault(),this.dispatchEvent(fo),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(yc))}function Vg(i){this.enabled!==!1&&this._handleKeyDown(i)}function Wg(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Hn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=it.TOUCH_ROTATE;break;case Hn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=it.TOUCH_PAN;break;default:this.state=it.NONE}break;case 2:switch(this.touches.TWO){case Hn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=it.TOUCH_DOLLY_PAN;break;case Hn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=it.TOUCH_DOLLY_ROTATE;break;default:this.state=it.NONE}break;default:this.state=it.NONE}this.state!==it.NONE&&this.dispatchEvent(fo)}function Xg(i){switch(this._trackPointer(i),this.state){case it.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case it.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case it.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case it.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=it.NONE}}function qg(i){this.enabled!==!1&&i.preventDefault()}function Yg(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function jg(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Kg(){const i=C("viewport"),e=i.clientWidth,t=i.clientHeight,n=new au,s=document.createElement("canvas");s.width=2,s.height=256;const r=s.getContext("2d"),a=r.createLinearGradient(0,0,0,256);a.addColorStop(0,"#0a0c12"),a.addColorStop(.5,"#0c0e14"),a.addColorStop(1,"#11131c"),r.fillStyle=a,r.fillRect(0,0,2,256);const o=new cc(s);o.magFilter=Rt,n.background=o;const l=new jt(45,e/t,1,1e4);l.position.set(300,200,400);const c=new Ug({antialias:!0});c.setSize(e,t),c.setPixelRatio(Math.min(devicePixelRatio,2)),c.toneMapping=ja,c.toneMappingExposure=1.2,i.appendChild(c.domElement);const u=new Fg(l,c.domElement);u.enableDamping=!0,u.dampingFactor=.08,u.target.set(0,0,0),u.mouseButtons={LEFT:En.ROTATE,MIDDLE:En.DOLLY,RIGHT:En.PAN},u.touches={ONE:Hn.ROTATE_PAN,TWO:Hn.DOLLY_PAN},n.add(new Du(8947916,1.2)),n.add(new Cu(8956637,5588070,.6));const p=new ll(16777215,.9);p.position.set(200,300,400),n.add(p);const h=new ll(6719692,.35);h.position.set(-200,-100,-300),n.add(h);const m=new Nu(800,20,2764094,1974576);m.material.transparent=!0,m.material.opacity=.6,n.add(m),n.add(new Fu(150)),y.scene=n,y.camera=l,y.renderer=c,y.controls=u,Cc(),y.labelsGroup&&(y.labelsGroup.visible=!1);let g=!1;y.renderScene=function(){g||(g=!0,requestAnimationFrame(function(){g=!1,y.renderer&&y.renderer.render(y.scene,y.camera)}))},u.addEventListener("change",y.renderScene),y.renderScene();let v=!1;const f=new ResizeObserver(function(){v||(v=!0,requestAnimationFrame(function(){v=!1,bc()}))});f.observe(i),y._resizeObserver=f}function bc(){var n;if(!y.renderer)return;const i=C("viewport"),e=i.clientWidth,t=i.clientHeight;e===0||t===0||(y.camera.aspect=e/t,y.camera.updateProjectionMatrix(),y.renderer.setSize(e,t),(n=y.renderScene)==null||n.call(y))}function Ec(){var i;!y.camera||(y.camera.position.set(300,200,400),y.controls.target.set(0,0,0),y.controls.update(),(i=y.renderScene)==null||i.call(y))}let wi=null;function po(i,e,t,n=400){if(!i)return;wi&&(cancelAnimationFrame(wi),wi=null);const s=i.rotation.x,r=i.rotation.y,a=e-s;let o=t-r;o>Math.PI?o-=Math.PI*2:o<-Math.PI&&(o+=Math.PI*2);const l=performance.now();function c(u){var g;const p=u-l,h=Math.min(p/n,1),m=1-Math.pow(1-h,3);i.rotation.x=s+a*m,i.rotation.y=r+o*m,(g=y.renderScene)==null||g.call(y),h<1?wi=requestAnimationFrame(c):(i.rotation.x=e,i.rotation.y=t,wi=null)}wi=requestAnimationFrame(c)}function Tc(i){var p;if(y.meshObject&&(y.scene.remove(y.meshObject),y.meshObject.geometry.dispose(),y.meshObject.material.dispose(),y.meshObject=null),!(i!=null&&i.length))return;const e=new Float32Array(i),t=new Mt;t.setAttribute("position",new Bt(e,3));const n=e.length/9,s=new Uint32Array(n*3);for(let h=0;h<n;h++)s[h*3]=h*3,s[h*3+1]=h*3+1,s[h*3+2]=h*3+2;t.setIndex(new Bt(s,1)),t.computeVertexNormals(),t.computeBoundingBox();const r=new I;t.boundingBox.getCenter(r),t.translate(-r.x,-r.y,-r.z);const a=new Tu({color:3900150,metalness:.35,roughness:.55,clearcoat:.15,clearcoatRoughness:.4,envMapIntensity:.6,side:Qt}),o=new ut(t,a);y.scene.add(o),y.meshObject=o;const c=new Gi().setFromObject(o).getSize(new I),u=Math.max(c.x,c.y,c.z)*1.8;y.camera.position.set(u*.6,u*.4,u*.8),y.controls.target.set(0,0,0),y.controls.update(),(p=y.renderScene)==null||p.call(y)}function Ac(){var t;if(!y.meshObject||!y.meshObject.geometry)return;const i=y.meshObject.geometry;if(y.facePenetrations){if(!i.attributes.color){let g=function(v){if(v<=.25){const f=v/.25;return[20+f*60,60+f*140,140+f*40]}else if(v<=.5){const f=(v-.25)/.25;return[80+f*140,200-f*30,180-f*120]}else if(v<=.75){const f=(v-.5)/.25;return[220-f*20,170-f*60,60+f*40]}else{const f=(v-.75)/.25;return[200+f*55,110-f*80,100-f*70]}};var e=g;const a=i.attributes.position,o=i.index,l=o?o.count/3:a.count/3,c=a.count,u=new Float32Array(c*3),p=y.facePenMax-y.facePenMin||1,h=new Float32Array(c),m=new Uint16Array(c);for(let v=0;v<l&&v<y.facePenetrations.length;v++){const f=y.facePenetrations[v]||0,d=v*3,M=o?o.getX(d):d,E=o?o.getX(d+1):d+1,T=o?o.getX(d+2):d+2;h[M]+=f,m[M]++,h[E]+=f,m[E]++,h[T]+=f,m[T]++}for(let v=0;v<c;v++){const d=((m[v]>0?h[v]/m[v]:0)-y.facePenMin)/p,[M,E,T]=g(Math.max(0,Math.min(1,d)));u[v*3]=M/255,u[v*3+1]=E/255,u[v*3+2]=T/255}i.setAttribute("color",new Bt(u,3))}Array.isArray(y.meshObject.material)?y.meshObject.material.forEach(a=>{a.vertexColors=!0,a.needsUpdate=!0}):(y.meshObject.material.vertexColors=!0,y.meshObject.material.needsUpdate=!0),C("legend-min").textContent=(y.facePenMin||0).toFixed(0)+" mm",C("legend-mid").textContent=((y.facePenMin+y.facePenMax)/2||0).toFixed(0)+" mm",C("legend-max").textContent=(y.facePenMax||0).toFixed(0)+" mm";const n=document.createElement("canvas");n.width=80,n.height=8;const s=n.getContext("2d"),r=s.createLinearGradient(0,0,80,0);r.addColorStop(0,"#1448b0"),r.addColorStop(.33,"#14c8c8"),r.addColorStop(.66,"#f5a830"),r.addColorStop(1,"#e82020"),s.fillStyle=r,s.fillRect(0,0,80,8),C("legend-gradient").style.background=`url(${n.toDataURL()})`,C("heatmap-legend").classList.remove("hidden"),y.result&&po(y.meshObject,y.result.bestOrientation.theta*fn,y.result.bestOrientation.phi*fn,300)}else Array.isArray(y.meshObject.material)?y.meshObject.material.forEach(n=>{n.color.setHex(3900150),n.vertexColors=!1,n.needsUpdate=!0}):(y.meshObject.material.color.setHex(3900150),y.meshObject.material.vertexColors=!1,y.meshObject.material.needsUpdate=!0);(t=y.renderScene)==null||t.call(y)}function Zg(){var t;if(!(y.compareMode||!y.meshObject||!y.result)){mo();var i=y.result.bestOrientation;y.meshObject.rotation.x=i.theta*fn,y.meshObject.rotation.y=i.phi*fn,y.meshObject.material.transparent=!1,y.meshObject.material.opacity=1,y.meshObject.material.depthWrite=!0,y.meshObject.material.vertexColors||y.meshObject.material.color.setHex(3900150),y.meshObject.material.needsUpdate=!0;var e=y.meshObject.material.clone();e.color.setHex(16739125),e.vertexColors=!1,e.transparent=!0,e.opacity=.35,e.depthWrite=!1,y.meshClone=new ut(y.meshObject.geometry,e),y.meshClone.position.copy(y.meshObject.position),y.meshClone.rotation.set(0,0,0),y.scene.add(y.meshClone),y.compareMode=!0,C("compare-info").classList.remove("hidden"),(t=y.renderScene)==null||t.call(y)}}function mo(){var e;if(!!y.compareMode){if(y.compareMode=!1,y.meshClone&&(y.scene.remove(y.meshClone),y.meshClone.material.dispose(),y.meshClone=null),C("compare-info").classList.add("hidden"),y.meshObject&&y.result){var i=y.result.bestOrientation;y.meshObject.rotation.x=i.theta*fn,y.meshObject.rotation.y=i.phi*fn,y.meshObject.material.transparent=!1,y.meshObject.material.opacity=1,y.meshObject.material.depthWrite=!0,y.meshObject.material.needsUpdate=!0}(e=y.renderScene)==null||e.call(y)}}function Ys(i){y.viewMode=i,Nt(".vp-mode-btn").forEach(function(e){e.classList.toggle("active",e.dataset.mode===i)}),C("heatmap-legend").classList.add("hidden"),mo(),i==="3d"&&y.meshObject&&(Array.isArray(y.meshObject.material)?y.meshObject.material.forEach(function(e){e.color.setHex(3900150),e.vertexColors=!1,e.needsUpdate=!0}):(y.meshObject.material.color.setHex(3900150),y.meshObject.material.vertexColors=!1,y.meshObject.material.needsUpdate=!0),y.result&&po(y.meshObject,y.result.bestOrientation.theta*fn,y.result.bestOrientation.phi*fn,300)),i==="heatmap"&&Ac(),i==="compare"&&Zg()}function wc(){var U;Rc(),y.beamGroup=new Ci;var i=parseFloat(C("cfg-sod").value)||700,e=parseFloat(C("cfg-sdd").value)||1e3,t=parseFloat(C("cfg-detw").value)||400,n=parseFloat(C("cfg-deth").value)||400,s=e-i,r=-100;y.meshObject&&y.meshObject.geometry.boundingBox&&(r=y.meshObject.geometry.boundingBox.min.y);var a=new I(-i,0,0),o=new I(s,0,0);function l(k,G,ee,te){return new dc({color:k,roughness:te||.7,metalness:ee||.3,transparent:!0,opacity:G||.5,depthWrite:!1})}function c(k,G){return new rs({color:k,transparent:!0,opacity:G||1,depthWrite:!1})}var u=r-120,p=new ut(new Vn(1200,6,700),c(1580584,.1));p.position.y=u,y.beamGroup.add(p);var h=100,m=300,g=-i-60,v=new ut(new Ii(h,h,m,20),l(2766149,.4,.3,.7));v.rotation.z=Math.PI/2,v.position.set((-i+g)/2,0,0),y.beamGroup.add(v);var f=new ut(new as(h,16,16,0,Math.PI*2,0,Math.PI/2),l(2766149,.45,.3,.7));f.position.set(-i,0,0),f.rotation.z=-Math.PI/2,y.beamGroup.add(f);var d=new ut(new co(6,14,16),c(14708800,.55));d.position.set(-i+2,0,0),d.rotation.y=Math.PI/2,y.beamGroup.add(d);var M=[new I(s,-n/2,-t/2),new I(s,-n/2,t/2),new I(s,n/2,-t/2),new I(s,n/2,t/2)],E=new Fi({color:14708800,transparent:!0,opacity:.2});M.forEach(function(k){var G=new Mt().setFromPoints([a.clone(),k]);y.beamGroup.add(new Ga(G,E))});var T=[a.clone(),new I(0,0,0),o.clone()],L=new Ga(new Mt().setFromPoints(T),new Ru({color:15228976,transparent:!0,opacity:.35,dashSize:4,gapSize:3}));L.computeLineDistances(),y.beamGroup.add(L);var A=new ut(new lo(4,10,8),c(15228976,.35));A.position.set(-i*.3,0,0),A.quaternion.setFromUnitVectors(new I(0,1,0),new I(1,0,0)),y.beamGroup.add(A);var P=new ut(new as(8,16,16),c(15228976,.7));P.position.copy(a),y.beamGroup.add(P);var x=new ut(new Ii(78,80,14,32),l(3820122,.5,.4,.6));x.position.set(0,r-8,0),y.beamGroup.add(x);var w=new ut(new Ii(24,30,12,16),l(3820122,.5,.4,.6));w.position.set(0,r-15,0),y.beamGroup.add(w);var F=new ut(new Vn(80,n+80,t+80),l(1582133,.4,.1,.7));F.position.copy(o),y.beamGroup.add(F);var R=new ut(new Bi(t,n),new rs({color:3502288,transparent:!0,opacity:.3,side:Qt,depthWrite:!1}));R.position.set(s-39,0,0),R.quaternion.setFromUnitVectors(new I(0,0,1),new I(-1,0,0)),y.beamGroup.add(R);var N=new oo(new vu(new Bi(t,n)),new Fi({color:4227296,transparent:!0,opacity:.6}));N.position.copy(R.position),N.quaternion.copy(R.quaternion),y.beamGroup.add(N);var H=o.y-u;if(H>0){var q=new ut(new Vn(10,H,10),l(1976376,.2,.2,.7));q.position.set(s,u+H/2,0),y.beamGroup.add(q)}y.scene.add(y.beamGroup),y.beamGroup.visible=y.beamVisible,(U=y.renderScene)==null||U.call(y)}function Rc(){var i;!y.beamGroup||(y.scene.remove(y.beamGroup),y.beamGroup.traverse(function(e){(e.isMesh||e.isLine||e.isLineSegments)&&(e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(function(t){t.dispose()}):e.material.dispose()))}),y.beamGroup=null,(i=y.renderScene)==null||i.call(y))}function Yr(i,e){var t=document.createElement("canvas");t.width=64,t.height=64;var n=t.getContext("2d");n.font="Bold 36px Inter, sans-serif",n.textAlign="center",n.textBaseline="middle",n.shadowColor="rgba(0,0,0,0.6)",n.shadowBlur=6,n.fillStyle=e,n.fillText(i,32,32);var s=new cc(t);s.needsUpdate=!0;var r=new ac({map:s,transparent:!0,depthWrite:!1,sizeAttenuation:!0}),a=new du(r);return a.scale.set(30,30,1),a}function Cc(){var l;Pc(),y.labelsGroup=new Ci;var i=150,e=24,t=Yr("X","#e86060");t.position.set(i+e,0,0),y.labelsGroup.add(t);var n=Yr("Y","#60d060");n.position.set(0,i+e,0),y.labelsGroup.add(n);var s=Yr("Z","#6080e0");s.position.set(0,0,i+e),y.labelsGroup.add(s);var r=new as(3,8,8),a=new rs({color:8949920,transparent:!0,opacity:.5}),o=new ut(r,a);y.labelsGroup.add(o),y.scene.add(y.labelsGroup),y.labelsGroup.visible=y.labelsVisible,(l=y.renderScene)==null||l.call(y)}function Pc(){var i;!y.labelsGroup||(y.scene.remove(y.labelsGroup),y.labelsGroup.traverse(function(e){(e.isSprite||e.isMesh)&&(e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(function(t){t.dispose()}):e.material.dispose()))}),y.labelsGroup=null,(i=y.renderScene)==null||i.call(y))}function Ol(i,e){var t=null;return function(){var n=arguments,s=this;t&&clearTimeout(t),t=setTimeout(function(){t=null,i.apply(s,n)},e)}}function $g(i,e,t,n){return window.go.main.App.CalcBeamParams(i,e,t,n)}function Jg(i,e,t,n){return window.go.main.App.CalcEnergyRecommendation(i,e,t,n)}function Qg(i,e){return window.go.main.App.ComputeFaceHeatmap(i,e)}function e_(){return window.go.main.App.GetFilters()}function t_(){return window.go.main.App.GetMaterials()}function n_(){return window.go.main.App.GetScannerPresets()}function Lc(){return window.go.main.App.GetVertexBuffer()}function i_(i,e){return window.go.main.App.LoadMeshFromBytes(i,e)}function Dc(){return window.go.main.App.PickAndLoadMesh()}function s_(i){return window.go.main.App.RunOptimization(i)}let Va="all";function Wa(){const i=C("mat-grid");i.innerHTML="";const e=y.mats.filter(t=>!(Va!=="all"&&t.cat!==Va));for(const t of e){const n=document.createElement("button");n.type="button",n.className="mat-item",n.dataset.id=t.id,y.materialID===t.id&&n.classList.add("active"),n.innerHTML=`<span class="mat-swatch" style="background:${t.color}"></span><span class="mat-name">${t.name}</span>`,n.addEventListener("click",()=>Ic(t.id)),i.appendChild(n)}}function Ic(i){y.materialID=i,Nt(".mat-item").forEach(n=>n.classList.toggle("active",n.dataset.id===i));const e=document.getElementById("mat-subtitle"),t=y.mats.find(n=>n.id===i);e&&t&&(e.textContent="\u2014 "+t.name),ii(),Kt()}function r_(i){Va=i,Wa()}function ii(){$g(y.energy,y.tPct,y.filterID,y.materialID).then(i=>{const e=JSON.parse(i);e.error||(C("disp-energy").textContent=y.energy,C("disp-tmin").textContent=y.tPct.toFixed(2),C("pill-kev").textContent=y.energy+" keV",C("pill-tmin").textContent=y.tPct.toFixed(2)+"% Tmin",C("pill-eeff").textContent=e.eEff.toFixed(0)+" Eeff",C("acc-beam-val").textContent=e.eEff.toFixed(0)+" keV",e.filter?(C("filter-stats").hidden=!1,C("fs-eeff").textContent=e.filter.eEff.toFixed(1),C("fs-shift").textContent="+"+e.filter.eShift.toFixed(1),C("fs-flux").textContent=(e.filter.fluxRatio*100).toFixed(1)+"%",C("fs-hvl").textContent=e.filter.hvlCu.toFixed(2)+" mm"):C("filter-stats").hidden=!0)}).catch(()=>{})}function a_(){const i=C("filter-grid");i.innerHTML="";for(const e of y.filters){const t=document.createElement("button");t.type="button",t.className="filter-btn"+(y.filterID===e.id?" active":""),t.innerHTML=`<span class="fb-icon">${e.icon}</span><span class="fb-name">${e.name}</span>`,t.addEventListener("click",()=>o_(e.id)),i.appendChild(t)}}function o_(i){y.filterID=i,Nt(".filter-btn").forEach(t=>t.classList.toggle("active",t.textContent.includes(i)));const e=y.filters.find(t=>t.id===i);C("acc-filter-val").textContent=e?e.name:"None",ii(),Kt()}function l_(){const i=C("sl-energy");var e=Ol(function(){ii(),Kt()},80);i.addEventListener("input",()=>{y.energy=parseFloat(i.value),e()}),[30,50,76,100,150,200,300].forEach(o=>{const l=document.createElement("button");l.textContent=o,l.addEventListener("click",()=>{i.value=o,y.energy=o,ii()}),C("presets-energy").appendChild(l)});const t=C("sl-tmin");var n=Ol(function(){ii(),Kt()},80);t.addEventListener("input",()=>{y.tPct=parseFloat(t.value),n()}),[.01,.05,.1,.2,.5,1,2].forEach(o=>{const l=document.createElement("button");l.textContent=o.toFixed(2),l.addEventListener("click",()=>{t.value=o,y.tPct=o,ii()}),C("presets-tmin").appendChild(l)});const s=C("sl-raygrid");function r(o){const l=o===0?8:o,c=Math.min(l*2,32),u=o<=8?"~10s-1m":o<=16?"~20s-2m":"~1-5m";C("grid-info").textContent=l+"\xD7"+l+" coarse / "+c+"\xD7"+c+" fine \xB7 "+u,C("grid-info").classList.remove("hidden")}s&&s.addEventListener("input",()=>{const o=parseInt(s.value);if(y.rayGridXY=o,o===0)C("disp-raygrid").textContent="default",C("disp-raygrid-hint").textContent="8\xD78 coarse / 16\xD716 fine (default)";else{C("disp-raygrid").textContent=o+"\xD7"+o;const l=Math.min(o*2,32);C("disp-raygrid-hint").textContent=o+"\xD7"+o+" coarse / "+l+"\xD7"+l+" fine"}r(o),Kt()});const a=C("cfg-searchrange");a&&(a.addEventListener("input",()=>{const o=parseInt(a.value,10)||45;y.searchRange=o,C("disp-searchrange").textContent=o+"\xB0";try{localStorage.setItem("penopt-search-range",String(o))}catch{}Kt()}),C("disp-searchrange").textContent=y.searchRange+"\xB0",a.value=y.searchRange)}function c_(){["cfg-sdd","cfg-sod","cfg-detw","cfg-deth","cfg-px","cfg-py"].forEach(function(i){var e=C(i);!e||e.addEventListener("change",Kt)})}function h_(){const i=C("scanner-preset");for(const e of y.presets){const t=document.createElement("option");t.value=e.id,t.textContent=e.name,i.appendChild(t)}i.addEventListener("change",()=>{const e=y.presets.find(n=>n.id===i.value);if(!e)return;C("cfg-sdd").value=e.sdd,C("cfg-sod").value=e.sod,C("cfg-detw").value=e.detWidth,C("cfg-deth").value=e.detHeight,C("cfg-px").value=e.pixelsX,C("cfg-py").value=e.pixelsY;const t=C("acc-scanner-val");t&&(e.id!=="custom"?t.textContent=e.name:t.textContent=e.sdd+"/"+e.sod),Kt()}),c_()}function u_(){const i=C("drop-zone");i.addEventListener("click",async()=>{try{const e=await Dc();e&&Uc(e)}catch(e){hn("File picker error: "+e)}}),C("file-input").addEventListener("change",()=>{C("file-input").files[0]&&jr(C("file-input").files[0])}),i.addEventListener("dragover",e=>{e.preventDefault(),i.classList.add("dragover")}),i.addEventListener("dragleave",()=>i.classList.remove("dragover")),i.addEventListener("drop",e=>{e.preventDefault(),i.classList.remove("dragover"),e.dataTransfer.files[0]&&jr(e.dataTransfer.files[0])}),C("viewport").addEventListener("dragover",e=>e.preventDefault()),C("viewport").addEventListener("drop",e=>{e.preventDefault(),e.dataTransfer.files[0]&&jr(e.dataTransfer.files[0])}),C("btn-remove").addEventListener("click",d_)}async function jr(i){var s,r;C("vp-loading").classList.remove("hidden"),C("idle-prompt").style.display="none",pn("Reading file...");const e=i.name.slice(i.name.lastIndexOf(".")).toLowerCase();if(e!==".stl"&&e!==".obj"){hn("Unsupported format"),C("vp-loading").classList.add("hidden");return}try{const a=await i.arrayBuffer(),o=await i_(i.name,Array.from(new Uint8Array(a)));if(!o){hn("Failed to parse mesh"),C("vp-loading").classList.add("hidden");return}y.meshInfo=o,y.meshLoaded=!0;const l=await Lc();Tc(l),wc(),y.beamGroup&&(y.beamGroup.visible=!1),C("fm-name").textContent=i.name,C("fm-tris").textContent=o.numTriangles.toLocaleString()+" triangles",C("fm-bbox").textContent=`${o.boundsMinX.toFixed(0)}..${o.boundsMaxX.toFixed(0)}`,C("file-meta").classList.remove("hidden"),C("drop-zone").classList.add("hidden"),C("grid-info").classList.remove("hidden");const c=C("fm-dot"),u=C("fm-wt"),p=C("wt-banner");o.isWatertight?(c.className="dot dot--green",u.textContent="watertight",p.classList.add("hidden")):(c.className="dot dot--amber",u.textContent=`${o.boundaryEdges} boundary edges \u2014 non-watertight`,p.innerHTML='<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="flex-shrink:0"><path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 3v3m0 1.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Mesh has open edges \u2014 penetration values may be underestimated',p.classList.remove("hidden")),C("os-text").textContent="Ready",C("os-dot").className="os-dot os-dot--ready",qa({enabled:!0}),pn(`Loaded ${o.numTriangles.toLocaleString()} tris`),C("status-mesh").textContent=o.numTriangles.toLocaleString()+" tris",C("card-tradeoff").classList.add("tradeoff-disabled");const h=C("card-material"),m=C("card-optimize");if(h){var t=h.querySelector(".card-body");t&&(t.classList.add("no-animate"),t.style.maxHeight=""),h.classList.add("open"),(s=h.querySelector(".chevron"))==null||s.classList.add("open"),t&&requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.remove("no-animate")})})}if(m){var n=m.querySelector(".card-body");n&&(n.classList.add("no-animate"),n.style.maxHeight=""),m.classList.add("open"),(r=m.querySelector(".chevron"))==null||r.classList.add("open"),n&&requestAnimationFrame(function(){requestAnimationFrame(function(){n.classList.remove("no-animate")})})}C("vp-loading").classList.add("hidden"),Kt();try{localStorage.setItem("penopt-last-mesh",i.name)}catch{}}catch(a){hn("Load error: "+a.message),C("vp-loading").classList.add("hidden")}}async function Uc(i){var n,s;C("vp-loading").classList.remove("hidden"),C("idle-prompt").style.display="none",pn("Loading mesh..."),y.meshInfo=i,y.meshLoaded=!0;try{const r=await Lc();Tc(r),wc(),y.beamGroup&&(y.beamGroup.visible=!1),C("fm-name").textContent=i.name,C("fm-tris").textContent=i.numTriangles.toLocaleString()+" triangles",C("fm-bbox").textContent=`${i.extentX.toFixed(0)} \xD7 ${i.extentY.toFixed(0)} \xD7 ${i.extentZ.toFixed(0)} mm`,C("file-meta").classList.remove("hidden"),C("drop-zone").classList.add("hidden"),C("grid-info").classList.remove("hidden");const a=C("fm-dot"),o=C("fm-wt"),l=C("wt-banner");i.isWatertight?(a.className="dot dot--green",o.textContent="watertight",l.classList.add("hidden")):(a.className="dot dot--amber",o.textContent=i.boundaryEdges+" boundary edges \u2014 non-watertight",l.innerHTML='<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="flex-shrink:0"><path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 3v3m0 1.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Mesh has open edges \u2014 penetration values may be underestimated',l.classList.remove("hidden")),C("os-text").textContent="Ready",C("os-dot").className="os-dot os-dot--ready",qa({enabled:!0}),pn("Loaded "+i.numTriangles.toLocaleString()+" tris"),C("status-mesh").textContent=i.numTriangles.toLocaleString()+" tris",C("card-tradeoff").classList.add("tradeoff-disabled");const c=C("card-material"),u=C("card-optimize");if(c){var e=c.querySelector(".card-body");e&&(e.classList.add("no-animate"),e.style.maxHeight=""),c.classList.add("open"),(n=c.querySelector(".chevron"))==null||n.classList.add("open"),e&&requestAnimationFrame(function(){requestAnimationFrame(function(){e.classList.remove("no-animate")})})}if(u){var t=u.querySelector(".card-body");t&&(t.classList.add("no-animate"),t.style.maxHeight=""),u.classList.add("open"),(s=u.querySelector(".chevron"))==null||s.classList.add("open"),t&&requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.remove("no-animate")})})}try{localStorage.setItem("penopt-last-mesh",i.name)}catch{}}catch(r){hn("Render error: "+r.message)}C("vp-loading").classList.add("hidden"),Kt()}async function d_(){var e;!await Yc("Remove mesh and clear all results?")||(y.meshObject&&(y.scene.remove(y.meshObject),y.meshObject.geometry.dispose(),y.meshObject.material.dispose(),y.meshObject=null),Rc(),Pc(),mo(),(e=y.renderScene)==null||e.call(y),y.meshLoaded=!1,y.meshInfo=null,y.result=null,y.facePenetrations=null,C("file-meta").classList.add("hidden"),C("drop-zone").classList.remove("hidden"),C("grid-info").classList.add("hidden"),C("results-panel").classList.add("hidden"),C("wt-banner").classList.add("hidden"),C("card-tradeoff").style.display="none",C("heatmap-legend").classList.add("hidden"),[].slice.call(document.querySelectorAll(".result-warning")).forEach(t=>t.remove()),C("os-dot").className="os-dot os-dot--idle",C("os-text").textContent="Upload a mesh and select a material",qa({enabled:!1,html:"\u25B6 <span>Optimize</span>"}),pn("Ready"),C("status-mesh").textContent="",C("idle-prompt").style.display="",Kr(),["card-material","card-optimize"].forEach(function(t){var r;const n=C(t);if(!!n){var s=n.querySelector(".card-body");s&&(s.classList.add("no-animate"),s.style.maxHeight=""),n.classList.remove("open"),(r=n.querySelector(".chevron"))==null||r.classList.remove("open"),s&&requestAnimationFrame(function(){requestAnimationFrame(function(){s.classList.remove("no-animate")})})}}))}function Nc(i,e,t,n){const s=n||document.getElementById(i);if(!s)return{cv:null,ctx:null,w:0,h:0};const r=window.devicePixelRatio||1,a=s.parentElement,o=a.getBoundingClientRect(),l=Math.max(o.width-4,Math.min(e,200)),c=Math.max(t,100);s.width=l*r,s.height=c*r,s.style.width=l+"px",s.style.height=c+"px";const u=s.getContext("2d");return u.scale(r,r),{cv:s,ctx:u,w:l,h:c,parent:a}}const Bl=Math.PI/180;function f_(i,e,t,n,s,r){const{ctx:a,w:o,h:l}=Nc("canvas-contour",236,176,s);if(!a)return;const c="#131519";a.fillStyle=c,a.fillRect(0,0,o,l);const u={l:32,r:24,t:10,b:22},p=o-u.l-u.r,h=l-u.t-u.b,m=[...new Set(i.map(Y=>Y.theta))].sort((Y,Q)=>Y-Q),g=[...new Set(i.map(Y=>Y.phi))].sort((Y,Q)=>Y-Q);if(m.length<2||g.length<2){a.fillStyle="#6b7280",a.font="bold 11px sans-serif",a.textAlign="center",a.fillText("Not enough data",o/2,l/2);return}const v=new Map;for(const Y of i)v.set(Y.theta+","+Y.phi,Y.score);const f=[...new Set(i.map(Y=>Y.theta))].sort((Y,Q)=>Y-Q),d=[...new Set(i.map(Y=>Y.phi))].sort((Y,Q)=>Y-Q);if(f.length<2||d.length<2){a.fillStyle="#6b7280",a.font="bold 11px sans-serif",a.textAlign="center",a.fillText("Not enough evaluated angles",o/2,l/2);return}let M=1/0,E=-1/0;for(const Y of i)Y.score<M&&(M=Y.score),Y.score>E&&(E=Y.score);const T=E-M||1;function L(Y){let Q,ye,ke;if(Y<=.5){const Ee=Y/.5;Q=Math.round(20+Ee*200),ye=Math.round(80+Ee*140),ke=Math.round(200-Ee*40)}else{const Ee=(Y-.5)/.5;Q=Math.round(220+Ee*35),ye=Math.round(220-Ee*200),ke=Math.round(160-Ee*140)}return"#"+[Q,ye,ke].map(Ee=>Math.max(0,Math.min(255,Ee)).toString(16).padStart(2,"0")).join("")}const A=Math.min(...m),P=Math.max(...m),x=Math.min(...g),w=Math.max(...g),F=P-A||1,R=w-x||1;function N(Y,Q){const ye=Math.min(P,Math.max(A,Y)),ke=Math.min(w,Math.max(x,Q));let Ee=0;for(let Je=0;Je<f.length-1;Je++)if(ye>=f[Je]&&ye<=f[Je+1]){Ee=Je;break}let Z=0;for(let Je=0;Je<d.length-1;Je++)if(ke>=d[Je]&&ke<=d[Je+1]){Z=Je;break}const he=f[Ee],se=f[Ee+1],Ae=d[Z],De=d[Z+1],Pe=v.get(he+","+Ae)||M,st=v.get(se+","+Ae)||M,ze=v.get(he+","+De)||M,Ze=v.get(se+","+De)||M,je=(ye-he)/(se-he||1),Ue=(ke-Ae)/(De-Ae||1);return(Pe*(1-je)+st*je)*(1-Ue)+(ze*(1-je)+Ze*je)*Ue}const H=4;for(let Y=0;Y<f.length-1;Y++)for(let Q=0;Q<d.length-1;Q++){const ye=f[Y],ke=f[Y+1],Ee=d[Q],Z=d[Q+1];for(let he=0;he<H;he++)for(let se=0;se<H;se++){const Ae=ye+(ke-ye)*(he+.5)/H,De=Ee+(Z-Ee)*(se+.5)/H,st=(N(Ae,De)-M)/T,ze=u.l+(Ae-A)/F*p,Ze=u.t+(1-(De-x)/R)*h,je=(ke-ye)/F*p/H+.5,Ue=(Z-Ee)/R*h/H+.5;a.fillStyle=L(st),a.fillRect(ze-je/2,Ze-Ue/2,je,Ue)}}const q=o-18,U=8,k=h;for(let Y=0;Y<k;Y++){const Q=1-Y/k;a.fillStyle=L(Q),a.fillRect(q,u.t+Y,U,1)}if(a.strokeStyle="#383d49",a.lineWidth=.5,a.strokeRect(q,u.t,U,k),a.fillStyle="#c8ccd4",a.font="10px sans-serif",a.textAlign="left",a.textBaseline="middle",a.fillText(M.toFixed(3),q+U+3,u.t),a.fillText(((M+E)/2).toFixed(3),q+U+3,u.t+k/2),a.fillText(E.toFixed(3),q+U+3,u.t+k),e){const Y=u.l+(e.theta-A)/F*p,Q=u.t+(1-(e.phi-x)/R)*h;a.strokeStyle="#ffffff",a.lineWidth=2,a.beginPath(),a.arc(Y,Q,6,0,Math.PI*2),a.stroke(),a.fillStyle="#ffffff",a.font="bold 10px sans-serif",a.textAlign="left",a.textBaseline="bottom",a.fillText(e.score.toFixed(3),Y+9,Q-2),a.fillStyle="#9ca3af",a.font="10px sans-serif",a.fillText("best",Y+9,Q+10)}if(t&&t!==e){const Y=u.l+(t.theta-A)/F*p,Q=u.t+(1-(t.phi-x)/R)*h;a.strokeStyle="rgba(255,255,255,0.8)",a.lineWidth=1.5;const ye=5;a.beginPath(),a.moveTo(Y-ye,Q-ye),a.lineTo(Y+ye,Q+ye),a.moveTo(Y+ye,Q-ye),a.lineTo(Y-ye,Q+ye),a.stroke(),a.fillStyle="rgba(255,255,255,0.7)",a.font="10px sans-serif",a.textAlign="left",a.textBaseline="top",a.fillText("worst",Y+7,Q-3)}a.fillStyle="#9ca3af",a.font="10px sans-serif",a.textAlign="center",a.textBaseline="top";const G=f.filter((Y,Q,ye)=>Q===0||Q===ye.length-1||Math.abs(Y-ye[Q-1])>8);for(const Y of G){const Q=u.l+(Y-A)/F*p;a.fillText(Y+"\xB0",Q,l-20)}a.textAlign="right",a.textBaseline="middle";const ee=d.filter((Y,Q,ye)=>Q===0||Q===ye.length-1||Math.abs(Y-ye[Q-1])>8);for(const Y of ee){const Q=u.t+(1-(Y-x)/R)*h;a.fillText(Y+"\xB0",u.l-5,Q)}a.fillStyle="#6b7280",a.font="10px sans-serif",a.textAlign="center",a.textBaseline="bottom",a.fillText("\u03B8 (tilt)",o/2-u.r/2,l-3),a.save(),a.translate(7,u.t+h/2),a.rotate(-Math.PI/2),a.textAlign="center",a.textBaseline="bottom",a.fillText("\u03C6 (rotation)",0,0),a.restore();const te=r&&r.searchRange>0?r.searchRange:45,de=r&&r.constrainedOptimum;if(a.save(),a.strokeStyle=de?"rgba(245,158,11,0.7)":"rgba(255,255,255,0.12)",a.lineWidth=de?1.5:.8,a.setLineDash(de?[4,4]:[3,5]),A<=te&&P>=-te){const Y=u.l+(-te-A)/F*p,Q=u.l+(te-A)/F*p;Y>u.l&&(a.beginPath(),a.moveTo(Y,u.t),a.lineTo(Y,u.t+h),a.stroke()),Q<u.l+p&&(a.beginPath(),a.moveTo(Q,u.t),a.lineTo(Q,u.t+h),a.stroke())}if(x<=te&&w>=-te){const Y=u.t+(1-(-te-x)/R)*h,Q=u.t+(1-(te-x)/R)*h;Y>u.t&&(a.beginPath(),a.moveTo(u.l,Y),a.lineTo(u.l+p,Y),a.stroke()),Q<u.t+h&&(a.beginPath(),a.moveTo(u.l,Q),a.lineTo(u.l+p,Q),a.stroke())}a.setLineDash([]),a.restore(),n&&(a.fillStyle="#e8a838",a.font="bold 10px sans-serif",a.textAlign="center",a.textBaseline="top",a.fillText("\u26A0 Partial results",o/2,1))}function Fc(i,e,t,n,s){const{ctx:r,w:a,h:o}=Nc("canvas-rose",236,176,n);if(!r)return;r.fillStyle="#131519",r.fillRect(0,0,a,o);const l=a/2,c=o/2,u=Math.min(l,c)-24,p=u+10;if(!i||i.length<2){r.fillStyle="#6b7280",r.font="bold 11px sans-serif",r.textAlign="center",r.fillText("No penetration data",l,c),r.font="10px sans-serif",r.fillStyle="#4b5563",r.fillText("Run optimization to generate",l,c+16);return}let h=0;for(const M of i)M>h&&(h=M);if(e)for(const M of e)M>h&&(h=M);h===0&&(h=1),r.strokeStyle="#272b35",r.lineWidth=.5,r.fillStyle="#6b7280",r.font="10px sans-serif",r.textAlign="left",r.textBaseline="middle";for(let M=.25;M<=1;M+=.25){const E=u*M;r.beginPath(),r.arc(l,c,E,0,Math.PI*2),r.stroke(),r.fillText((h*M).toFixed(0)+" mm",l+E+4,c)}for(let M=0;M<360;M+=45){const E=M*Bl-Math.PI/2;r.strokeStyle="#272b35",r.lineWidth=.5,r.beginPath(),r.moveTo(l,c),r.lineTo(l+Math.cos(E)*u,c+Math.sin(E)*u),r.stroke();const T=l+Math.cos(E)*p,L=c+Math.sin(E)*p;r.fillStyle="#6b7280",r.font="10px sans-serif",r.textAlign="center",r.textBaseline="middle";const P={0:{x:0,y:-2},45:{x:2,y:-2},90:{x:4,y:0},135:{x:2,y:2},180:{x:0,y:4},225:{x:-2,y:2},270:{x:-4,y:0},315:{x:-2,y:-2}}[M]||{x:0,y:0};r.fillText(M+"\xB0",T+P.x,L+P.y)}if(s&&s.length>0){r.strokeStyle="rgba(251,191,36,0.8)",r.lineWidth=1.5;for(const M of s){const E=M*Bl-Math.PI/2,T=u*.92,L=u*1.04;r.beginPath(),r.moveTo(l+Math.cos(E)*T,c+Math.sin(E)*T),r.lineTo(l+Math.cos(E)*L,c+Math.sin(E)*L),r.stroke()}}function m(M,E,T,L,A){if(!(!M||M.length<2)){r.beginPath();for(let P=0;P<M.length;P++){const x=P/M.length*Math.PI*2-Math.PI/2,w=M[P]/h*u,F=l+Math.cos(x)*w,R=c+Math.sin(x)*w;P===0?r.moveTo(F,R):r.lineTo(F,R)}r.closePath(),E&&(r.fillStyle=E,r.fill()),T&&(r.strokeStyle=T,r.lineWidth=L||1.5,r.setLineDash(A||[]),r.stroke(),r.setLineDash([]))}}e&&e!==i&&m(e,"rgba(239,68,68,0.06)","rgba(239,68,68,0.4)",1.2,[3,3]),m(i,"rgba(59,130,246,0.12)","#3b82f6",1.8,null);const g=i?i.length:0,v=e?e.length:0;g!==v&&g>0&&v>0&&(r.fillStyle="#e8a838",r.font="bold 10px sans-serif",r.textAlign="center",r.textBaseline="bottom",r.fillText("\u26A0 "+g+" vs "+v+" projections",l,o-48));const f=o-14;r.textAlign="left",r.textBaseline="middle";let d=10;r.fillStyle="#3b82f6",r.fillRect(d,f-3,12,2),r.fillStyle="#c8ccd4",r.font="10px sans-serif",r.fillText("Optimal ("+g+" proj)",d+16,f),d+=75,e&&e!==i&&(r.strokeStyle="rgba(239,68,68,0.5)",r.lineWidth=1.2,r.beginPath(),r.setLineDash([3,3]),r.moveTo(d,f),r.lineTo(d+12,f),r.stroke(),r.setLineDash([]),r.fillStyle="#c8ccd4",r.font="10px sans-serif",r.fillText("Worst ("+v+" proj)",d+16,f),d+=75),s&&s.length>0&&(r.strokeStyle="rgba(251,191,36,0.8)",r.lineWidth=1.5,r.beginPath(),r.moveTo(d,f),r.lineTo(d+12,f),r.stroke(),r.fillStyle="#c8ccd4",r.font="10px sans-serif",r.fillText("IntelliScan ("+s.length+")",d+16,f)),t&&(r.fillStyle="#e8a838",r.font="bold 10px sans-serif",r.textAlign="center",r.textBaseline="middle",r.fillText("\u26A0 Partial result",l,12))}function p_(i,e){e&&(e.textContent="\u2713 Saved!");const t=JSON.stringify({bestOrientation:i.bestOrientation,worstOrientation:i.worstOrientation,allScores:i.allScores,numEvaluations:i.allScores.length,isPartial:i.isPartial||!1,constrainedOptimum:i.constrainedOptimum||!1,boundaryWarning:i.boundaryWarning||null,coarseFineMismatch:i.coarseFineMismatch||!1,mismatchNote:i.mismatchNote||null,referenceOrientation:i.referenceOrientation||null,intelliScan:i.intelliScan||null,timestamp:new Date().toISOString()},null,2),n=new Blob([t],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download="orientation-results.json",document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(s),1e3),e&&setTimeout(function(){e.textContent="\u2913 JSON"},1500)}function m_(i,e,t,n){var p;if(!i)return;n&&(n.textContent="\u2713 Saved!");const s=i.domElement,r=s.width,a=s.height,o=document.createElement("canvas");o.width=r,o.height=a+120;const l=o.getContext("2d");l.drawImage(s,0,0);const c=a;l.fillStyle="#111419",l.fillRect(0,c,r,120),l.fillStyle="#cdd5e0",l.font="14px system-ui, sans-serif",l.textAlign="left",l.textBaseline="top",l.fillText("PenOpt \u2014 CT Scan Orientation Optimizer",14,c+14);const u=e==null?void 0:e.bestOrientation;u&&(l.fillStyle="#3b82f6",l.font="bold 20px monospace",l.fillText(`\u03B8 = ${u.theta}\xB0   \u03C6 = ${u.phi}\xB0`,14,c+40),l.fillStyle="#cdd5e0",l.font="13px system-ui, sans-serif",l.fillText(`Score: ${u.score.toFixed(3)}  |  Energy: ${t||"--"}${e!=null&&e.constrainedOptimum?"  |  \u26A0 constrained optimum":""}`,14,c+68),l.fillStyle="#8b95a8",l.font="11px monospace",l.fillText(new Date().toLocaleString()+"  |  "+(((p=e==null?void 0:e.allScores)==null?void 0:p.length)||0)+" orientations evaluated",14,c+92)),o.toBlob(h=>{if(!h)return;const m=URL.createObjectURL(h),g=document.createElement("a");g.href=m,g.download="orientation-results.png",document.body.appendChild(g),g.click(),document.body.removeChild(g),setTimeout(()=>URL.revokeObjectURL(m),1e3)},"image/png"),n&&setTimeout(function(){n.textContent="\u2913 PNG"},1500)}const Ri=window.runtime;function ir(){if(!y.meshLoaded||y.searching)return;y.searching=!0,y.searchCancel=!1,Kr(),C("btn-optimize").disabled=!0,C("btn-optimize").innerHTML="\u25B6 Searching...",C("vp-progress").classList.remove("hidden"),C("results-panel").classList.remove("hidden"),C("vp-search-overlay").classList.remove("hidden"),__(),C("os-dot").className="os-dot os-dot--searching",C("os-text").textContent="Searching...",C("progress-fill").style.width="0%",pn("Grid search in progress...");const i=qc[y.weightPreset];y._progressTickPending=!1,Ri.EventsOn("search:progress",function(e){y.searchCancel||(y._lastProgressData=e,y._progressTickPending||(y._progressTickPending=!0,requestAnimationFrame(function(){var r,a;y._progressTickPending=!1;var t=y._lastProgressData;if(!!t){C("progress-fill").style.width=t.pct+"%",C("progress-label").textContent=Math.round(t.pct)+"%";var n=(r=t.label)==null?void 0:r.match(/θ=([\d.]+)/),s=(a=t.label)==null?void 0:a.match(/φ=([\d.]+)/);n&&s&&(C("hud-rot").innerHTML="\u03B8: "+n[1]+"\xB0 \u03C6: "+s[1]+"\xB0")}})))}),Ri.EventsOn("search:done",function(e){if(Ri.EventsOff("search:progress"),Ri.EventsOff("search:done"),y.searchCancel){Gs();return}if(e.error){hn("Optimization error: "+e.error),Gs();return}try{const s=JSON.parse(e.result);y.result=s,Kr(),x_(s),v_(s);var t=s.bestOrientation&&s.bestOrientation.maxPerProjection,n=s.worstOrientation&&s.worstOrientation.maxPerProjection;t&&t.length>=2&&s.intelliScan&&Fc(t,n,s.isPartial,null,s.intelliScan.angles),M_(s)}catch(s){hn("Result parse error: "+s.message)}Gs()}),s_({weights:[i.wMtl,i.wEnergy,i.wHdn,i.wTuy,i.wBh],method:y.method}).catch(function(e){y.searchCancel||hn("Failed to start search: "+e),Ri.EventsOff("search:progress"),Ri.EventsOff("search:done"),Gs()})}function Gs(){y.searching=!1,C("btn-optimize").disabled=!1,C("btn-optimize").innerHTML="\u25B6 <span>Optimize</span>",C("vp-progress").classList.add("hidden"),C("hud-rot").classList.add("hidden"),C("vp-search-overlay").classList.add("hidden"),C("os-dot").className="os-dot os-dot--ready",C("os-text").textContent=y.searchCancel?"Cancelled":"Complete",pn(y.searchCancel?"Search cancelled":"Optimization complete");var i=C("btn-update-search");i&&(i.textContent="Update Search",i.style.opacity="")}function g_(){y.searchCancel=!0,pn("Cancelling...")}function __(){var i=C("rs-angle");i&&(i.textContent="--");var e=C("rs-energy");e&&(e.textContent="--");var t=C("rs-fmtl");t&&(t.textContent="--",t.style.color="");var n=C("rs-fenergy");n&&(n.textContent="--",n.style.color="");var s=C("rs-tuy");s&&(s.textContent="--",s.style.color="");var r=C("rs-evals");r&&(r.textContent="");var a=C("opt-angles");a&&(a.textContent="--");var o=C("opt-table-body");o&&(o.innerHTML="");var l=C("rs-score-gap");l&&l.remove();var c=C("tuy-warning");c&&c.remove();var u=C("energy-val");u&&(u.textContent="--");var p=C("energy-qual");p&&(p.innerHTML="");var h=C("energy-savings");h&&(h.textContent="");var m=C("energy-caveat");m&&(m.textContent="");var g=C("card-intelliscan");g&&(g.style.display="none");var v=C("card-tradeoff");if(v){v.classList.add("tradeoff-disabled");var f=C("tradeoff-status");f&&(f.style.display="block");var d=v.querySelectorAll(".tradeoff-stop");d.forEach(function(L,A){L.classList.toggle("active",A===0)})}var M=C("canvas-contour");if(M){var E=M.getContext("2d");E&&E.clearRect(0,0,M.width,M.height)}var T=C("canvas-rose");if(T){var E=T.getContext("2d");E&&E.clearRect(0,0,T.width,T.height)}}function x_(i){const e=i.bestOrientation,t=i.worstOrientation,n=(N,H)=>Math.abs(N.theta-H.theta)<.001&&Math.abs(N.phi-H.phi)<.001,s=i.allScores.find(N=>n(N,e)),r=i.allScores.find(N=>n(N,t));if(!s||!r)return;C("rs-angle").textContent=`\u03B8=${e.theta}\xB0 \u03C6=${e.phi}\xB0`;function a(N,H){return!H||Math.abs(H)<1e-12?null:(N-H)/H*100}const o=a(s.fMtl,r.fMtl),l=a(s.fEnergy,r.fEnergy);C("rs-fmtl").textContent=o!==null?(o<0?"\u2193 ":"\u2191 ")+Math.abs(o).toFixed(1)+"%":"--",C("rs-fmtl").style.color=o!==null&&o<0?"var(--green-500)":"var(--text)",C("rs-fenergy").textContent=l!==null?(l<0?"\u2193 ":"\u2191 ")+Math.abs(l).toFixed(1)+"%":"--",C("rs-fenergy").style.color=l!==null&&l<0?"var(--green-500)":"var(--text)";var c=i.allScores.length,u=i.numCoarseEval||0,p=i.numFineEval||0,h=i.searchTimeMs.toFixed(0)+"ms";i.coarseTimeMs&&(h=i.coarseTimeMs.toFixed(0)+"+"+i.fineTimeMs.toFixed(0)+"ms");var m=C("rs-tuy");if(m){var g=s.fTuy!==void 0?s.fTuy*100:null;g!==null&&(m.textContent=g.toFixed(0)+"%",m.style.color=g>90?"var(--green-500)":g>=70?"var(--amber-300)":"var(--red-500)")}if(C("rs-evals").textContent=c+" orientations ("+h+")",C("rs-evals").parentElement.title=u+" coarse + "+p+" fine | "+i.searchTimeMs.toFixed(0)+"ms total",i.scoreGap!==void 0){var v=C("rs-score-gap");v||(v=document.createElement("div"),v.id="rs-score-gap",C("rs-evals").parentElement.appendChild(v));var f=(i.scoreGap*100).toFixed(1),d=i.scoreGap<.01||(i.top3Spread||0)>10;v.style.cssText="margin-top:4px;font-size:9px;color:"+(d?"var(--amber-500)":"var(--text-dim)");var M="Score gap vs runner-up: "+f+"%";i.convergenceNote?M+=" \u2014 "+i.convergenceNote:d&&(M+=" \u2014 Multiple orientations score similarly. The selected angle may not be uniquely optimal."),v.textContent=M}C("opt-angles").textContent=`\u03B8 = ${e.theta}\xB0  \u03C6 = ${e.phi}\xB0`;const E=(N,H)=>{if(!H)return"--";const q=(N-H)/H*100;return(q>=0?"+":"")+q.toFixed(1)+"%"},T=N=>N<0?'style="color:var(--green-500)"':"";var L=s.fTuy!==void 0?(s.fTuy*100).toFixed(1)+"%":"--",A=r.fTuy!==void 0?(r.fTuy*100).toFixed(1)+"%":"--",P=s.fTuy!==void 0&&r.fTuy!==void 0?((s.fTuy-r.fTuy)*100/(r.fTuy||1)).toFixed(1)+"%":"--";const x=[["Mean Pen.",r.fMtl.toFixed(3),s.fMtl.toFixed(3),E(s.fMtl,r.fMtl),s.fMtl-r.fMtl],["Peak Path",r.fEnergy.toFixed(1)+" mm",s.fEnergy.toFixed(1)+" mm",E(s.fEnergy,r.fEnergy),s.fEnergy-r.fEnergy],["Range",r.fHdn.toFixed(3),s.fHdn.toFixed(3),E(s.fHdn,r.fHdn),s.fHdn-r.fHdn],["Completeness",A,L,P,s.fTuy-r.fTuy]];C("opt-table-body").innerHTML=x.map(N=>`<tr><td>${N[0]}</td><td>${N[1]}</td><td>${N[2]}</td><td ${T(N[4])}>${N[3]}</td></tr>`).join("");var w=C("tuy-warning");if(s.fTuy!==void 0&&s.fTuy<.9){var g=(s.fTuy*100).toFixed(0);w||(w=document.createElement("div"),w.id="tuy-warning",w.style.cssText="margin-top:8px;padding:6px 8px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:4px;font-size:11px;color:var(--amber-500);display:flex;align-items:center;gap:6px",C("opt-angles").parentElement.appendChild(w)),w.innerHTML="\u26A0 Only "+g+"% of faces satisfy Tuy-Smith condition \u2014 cone-beam artifacts may occur",w.style.display=""}else w&&(w.style.display="none");Jg(y.materialID,s.fEnergy,y.tPct).then(N=>{const H=JSON.parse(N);if(H.error)return;C("energy-val").textContent=H.kv+" kV",C("rs-energy").textContent=H.kv+" kV";let q,U;H.kv<100?(q="\u25B2 Higher kV recommended",U="var(--amber-500)"):H.kv<=200?(q="Medium kV suitable",U="var(--text)"):(q="\u25BC Lower kV sufficient",U="var(--green-500)"),C("energy-qual").innerHTML=`<span style="color:${U}">${q}</span>`;var k="--";r.fEnergy&&Math.abs(r.fEnergy)>1e-12&&(k=((1-s.fEnergy/r.fEnergy)*100).toFixed(0)),C("energy-savings").textContent="~"+k+"% less energy than worst orientation",C("energy-caveat").textContent="Qualitative estimate based on simplified spectrum model. Actual kV requirement depends on scanner hardware and tube spectrum characteristics."}).catch(()=>{}),y.meshObject&&po(y.meshObject,e.theta*fn,e.phi*fn),f_(i.allScores,e,t,i.isPartial);var F=s&&s.maxPerProjection,R=r&&r.maxPerProjection;Fc(F,R,i.isPartial,null,null),C("card-tradeoff").style.display="",C("card-tradeoff").classList.remove("tradeoff-disabled"),y.facePenetrations=null,C("results-panel").classList.remove("hidden")}function v_(i){var e=C("card-intelliscan"),t=C("intelliscan-body");if(!(!e||!t)){if(!i.intelliScan||!i.intelliScan.angles||i.intelliScan.angles.length===0){e.style.display="none";return}e.style.display="";var n=i.intelliScan,s=((1-n.count/360)*100).toFixed(0),r="";r+='<div class="is-summary">',r+='<div class="is-row"><span>Recommended projections:</span><strong>'+n.count+"</strong></div>",r+='<div class="is-row"><span>vs conventional 360\xB0:</span><strong>\u2212'+s+"% scan time</strong></div>",r+='<div class="is-row"><span>Computation:</span><span>'+n.elapsedMs.toFixed(0)+"ms on "+n.totalFaces.toLocaleString()+" faces</span></div>",r+="</div>",r+='<div class="is-table-wrap"><table class="is-table"><thead><tr><th>#</th><th>Angle \u03B1</th></tr></thead><tbody>',n.angles.forEach(function(u,p){r+="<tr><td>"+(p+1)+"</td><td>"+u.toFixed(1)+"\xB0</td></tr>"}),r+="</tbody></table></div>",r+='<div class="is-actions"><button class="is-btn" id="is-copy-btn">Copy angles</button><button class="is-btn" id="is-export-btn">Export JSON</button></div>',n.warning&&(r+='<div class="is-warning">\u2139 '+n.warning+"</div>"),r+='<div class="is-ref">Based on Butzhammer 2026 tangent-ray selection.</div>';var a=n.geometryMode||"parallel",o="Tangent angles computed for "+a+"-beam geometry.";a==="cone-beam"&&(o+=" For wide-angle cone-beam systems, consider verifying critical angles manually."),r+='<div class="is-info" style="margin-top:6px;padding:4px 6px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:4px;font-size:9px;color:var(--text-dim);line-height:1.4">'+o+"</div>",t.innerHTML=r;var l=document.getElementById("is-copy-btn");l&&(l.onclick=function(){var u=n.angles.map(function(p){return p.toFixed(1)}).join(", ");navigator.clipboard.writeText(u).then(function(){l.textContent="Copied!",setTimeout(function(){l.textContent="Copy angles"},1500)})});var c=document.getElementById("is-export-btn");c&&(c.onclick=function(){var u=JSON.stringify({intelliScanAngles:n.angles,count:n.count},null,2),p=new Blob([u],{type:"application/json"}),h=URL.createObjectURL(p),m=document.createElement("a");m.href=h,m.download="intelliscan-angles.json",document.body.appendChild(m),m.click(),document.body.removeChild(m),setTimeout(function(){URL.revokeObjectURL(h)},1e3)})}}async function M_(i){if(!y.meshInfo||!y.meshInfo.isWatertight)return;const e=i.bestOrientation;try{const t=await Qg(e.theta,e.phi),n=JSON.parse(t);if(n.error)return;y.facePenetrations=n;let s=1/0,r=-1/0;for(const a of n)a<s&&(s=a),a>r&&(r=a);y.facePenMin=s,y.facePenMax=r,y.viewMode==="heatmap"&&Ac()}catch(t){console.warn("Heatmap error:",t)}}function S_(){Nt(".card.accordion").forEach(i=>{const e=i.querySelector(".card-head"),t=i.querySelector(".card-body");!e||!t||(t.addEventListener("transitionend",function(s){s.propertyName==="max-height"&&i.classList.contains("open")&&(t.style.maxHeight="")}),e.addEventListener("click",()=>{const n=i.classList.contains("open");i.classList.toggle("open"),e.setAttribute("aria-expanded",n?"false":"true");const s=e.querySelector(".chevron");if(s&&s.classList.toggle("open"),n){t.style.maxHeight="";var r=t.scrollHeight;t.style.maxHeight=r+"px",requestAnimationFrame(function(){requestAnimationFrame(function(){t.style.maxHeight="0px"})})}else{t.style.maxHeight="";var a=t.scrollHeight;t.style.maxHeight="0px",requestAnimationFrame(function(){requestAnimationFrame(function(){t.style.maxHeight=a+"px"})})}}))})}function y_(){Nt(".acc-head").forEach(e=>{e.addEventListener("click",()=>{e.parentElement.classList.toggle("open"),e.setAttribute("aria-expanded",e.parentElement.classList.contains("open")?"true":"false")})});const i=document.querySelector(".acc");if(i){i.classList.add("open");const e=i.querySelector(".acc-head");e&&e.setAttribute("aria-expanded","true")}}function b_(){if(Nt(".tradeoff-stop").forEach(t=>{t.addEventListener("click",()=>{Nt(".tradeoff-stop").forEach(n=>n.classList.remove("active")),t.classList.add("active"),y.weightPreset=parseInt(t.dataset.w),Kt()})}),Nt(".method-btn").forEach(t=>{t.addEventListener("click",()=>{Nt(".method-btn").forEach(n=>n.classList.remove("active")),t.classList.add("active"),y.method=t.dataset.method,Kt()})}),!document.getElementById("bh-placeholder-note")){var i=document.createElement("div");i.id="bh-placeholder-note",i.style.cssText="margin-top:4px;font-size:9px;color:var(--text-dim);line-height:1.3",i.textContent="Note: Beam-hardening optimization (fBh) coming in a future release. Weight redistributed to Tuy-Smith completeness.";var e=document.querySelector(".tradeoff-options");e&&e.after(i)}C("btn-update-search").addEventListener("click",()=>{const t=C("btn-update-search");t.textContent="Updating...",t.style.opacity="0.7",ir();var n=setInterval(function(){y.searching||(t.textContent="Update Search",t.style.opacity="",clearInterval(n))},500)})}function E_(){C("btn-export").addEventListener("click",()=>{y.result&&p_(y.result,C("btn-export"))}),C("btn-export-png").addEventListener("click",()=>{var i;y.result&&m_(y.renderer,y.result,((i=C("energy-val"))==null?void 0:i.textContent)||"--",C("btn-export-png"))})}function T_(){Nt(".plot-tab").forEach(i=>{i.addEventListener("click",()=>{Nt(".plot-tab").forEach(e=>e.classList.remove("active")),Nt(".plot-content").forEach(e=>e.classList.remove("active")),i.classList.add("active"),C(`plot-${i.dataset.plot}`).classList.add("active")})})}(function(){var e=!1;function t(){var r=document.querySelectorAll("html, body, #sidebar, #results-content, #mat-grid, .is-table-wrap, .help-body, .acc-body");r.forEach(function(o){o.style.setProperty("scrollbar-width","thin","important"),o.style.setProperty("scrollbar-color",getComputedStyle(document.documentElement).getPropertyValue("--border-light").trim()||"#353850 "+(getComputedStyle(document.documentElement).getPropertyValue("--bg2").trim()||"#13151e"),"important")});var a=["html","body","#sidebar","#results-content","#mat-grid",".is-table-wrap",".help-body",".acc-body"];a.forEach(function(o){var l=document.querySelector(o);if(!!l){var c=l.style;c.setProperty("--sb-w","6px"),c.setProperty("--sb-h","6px")}})}function n(){document.body?(t(),e=!0):e||requestAnimationFrame(n)}if(document.addEventListener("DOMContentLoaded",n),document.readyState!=="loading"&&n(),typeof MutationObserver<"u"){var s=new MutationObserver(function(){!e&&document.body&&(t(),e=!0,s.disconnect())});s.observe(document.documentElement,{childList:!0,subtree:!0})}})();function A_(i){i.classList.remove("modal-closing","hidden"),i.offsetWidth}function Xa(i){i.classList.contains("hidden")||(i.classList.add("modal-closing"),i.addEventListener("animationend",function e(){i.removeEventListener("animationend",e),i.classList.add("hidden"),i.classList.remove("modal-closing")}))}function w_(){document.addEventListener("keydown",i=>{var e,t,n,s;if(!(i.target.tagName==="INPUT"||i.target.tagName==="TEXTAREA"))switch(i.key){case"Escape":C("error-banner").classList.add("hidden"),window.__prevFocusOnError&&window.__prevFocusOnError!==document.body&&document.body.contains(window.__prevFocusOnError)&&window.__prevFocusOnError.focus(),window.__prevFocusOnError=null,Xa(C("help-overlay"));break;case"o":i.ctrlKey&&(i.preventDefault(),Dc().then(r=>{r&&Uc(r)}).catch(r=>hn("File picker error: "+r)));break;case"Enter":i.ctrlKey&&(i.preventDefault(),!((t=(e=C("btn-optimize"))==null?void 0:e.disabled)==null||t)&&!((s=(n=C("btn-optimize-sidebar"))==null?void 0:n.disabled)==null||s)&&ir());break;case"f":case"F":Oc();break;case"r":case"R":Ec();break;case"1":Ys("3d");break;case"2":Ys("heatmap");break;case"3":Ys("compare");break}})}function Oc(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}function R_(){C("btn-help").addEventListener("click",()=>{A_(C("help-overlay")),requestAnimationFrame(()=>{var i;return(i=C("btn-help-close"))==null?void 0:i.focus()})}),C("btn-help-close").addEventListener("click",()=>Xa(C("help-overlay"))),C("help-overlay").addEventListener("click",i=>{i.target===C("help-overlay")&&Xa(C("help-overlay"))}),C("help-overlay").addEventListener("keydown",function(i){if(i.key!=="Tab")return;const e=Array.from(C("help-card").querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')).filter(s=>s.offsetParent!==null);if(!e.length)return;const t=e[0],n=e[e.length-1];i.shiftKey?document.activeElement===t&&(i.preventDefault(),n.focus()):document.activeElement===n&&(i.preventDefault(),t.focus())})}function C_(){const i=C("cfg-sdd"),e=C("cfg-sod");if(!i||!e)return;let t=null;function n(){const s=parseFloat(i.value)||0;(parseFloat(e.value)||0)>=s?(t||(t=document.createElement("div"),t.style.cssText="grid-column:1/-1;font-size:11px;color:var(--red-500);margin-top:var(--sp-1)",t.setAttribute("role","alert"),e.closest(".scanner-grid").appendChild(t)),t.textContent="SOD must be less than SDD",i.style.borderColor="var(--red-500)",e.style.borderColor="var(--red-500)"):(t&&(t.remove(),t=null),i.style.borderColor="",e.style.borderColor="")}i.addEventListener("input",n),e.addEventListener("input",n)}C("btn-error-dismiss").addEventListener("click",function(){var i=C("error-banner");i.classList.add("hidden"),window.__prevFocusOnError&&window.__prevFocusOnError!==document.body&&document.body.contains(window.__prevFocusOnError)&&window.__prevFocusOnError.focus(),window.__prevFocusOnError=null});function P_(){document.body.classList.add("js-tooltip-active");var i=null,e=null,t=document.createElement("div");t.style.cssText="position:fixed;top:-9999px;left:-9999px;visibility:hidden;padding:4px 8px;font-size:10px;font-weight:500;font-family:var(--font,Inter,sans-serif);line-height:1.4;max-width:300px;white-space:nowrap",document.body.appendChild(t);function n(l){t.textContent=l;var c=t.getBoundingClientRect();return{width:c.width,height:c.height}}function s(l){var c=document.createElement("div");return c.className="js-tooltip",c.textContent=l,c.style.cssText="position:fixed;top:-9999px;left:-9999px;padding:4px 8px;background:var(--surface,#1e2130);color:var(--text,#dde0ed);border:1px solid var(--border-light,#353850);border-radius:4px;font-size:10px;font-weight:500;font-family:var(--font,Inter,sans-serif);white-space:nowrap;pointer-events:none;z-index:9999;box-shadow:0 10px 20px rgba(0,0,0,0.45),0 4px 8px rgba(0,0,0,0.3);line-height:1.4;opacity:0;max-width:300px;overflow:hidden;text-overflow:ellipsis",document.body.appendChild(c),c}function r(l,c,u){var p=n(u),h=p.width,m=p.height,g=c.getBoundingClientRect(),v=6,f=window.innerWidth,d=window.innerHeight,M=g.top-v,E=d-g.bottom-v,T;M>=m?T=g.top-m-v:E>=m?T=g.bottom+v:T=M>=E?g.top-m-v:g.bottom+v;var L=g.left+g.width/2-h/2,A=Math.max(4,Math.min(L,f-h-4));A===4&&L<4?A=Math.max(4,g.left+4):A===f-h-4&&L>f-h-4&&(A=Math.min(f-h-4,g.right-h-4)),l.style.left=A+"px",l.style.top=T+"px",l.style.opacity="1";var P=T<g.top?"bottom":"top",x=4,w=g.left+g.width/2-A,F=l.querySelector(".js-tip-arrow"),R=F||document.createElement("div");R.className="js-tip-arrow",R.style.cssText="position:absolute;pointer-events:none;z-index:1;"+(P==="bottom"?"bottom:-"+x*2+"px;left:"+w+"px;border:"+x+"px solid transparent;border-top-color:var(--border-light,#353850)":"top:-"+x*2+"px;left:"+w+"px;border:"+x+"px solid transparent;border-bottom-color:var(--border-light,#353850)"),F||l.appendChild(R)}document.addEventListener("mouseenter",function(l){var c=l.target.closest("[data-tip]");if(!!c){var u=c.getAttribute("data-tip");!u||(i&&(i.remove(),i=null),i=s(u),e=c,r(i,c,u))}},!0),document.addEventListener("mouseleave",function(l){var c=l.target.closest("[data-tip]");!c||(i&&(i.remove(),i=null),e=null)},!0);var a=!1;function o(){a||(a=!0,requestAnimationFrame(function(){a=!1,i&&e&&document.body.contains(e)&&r(i,e,i.textContent)}))}window.addEventListener("scroll",o,{capture:!0,passive:!0}),window.addEventListener("resize",o,{passive:!0})}async function L_(){Kg(),bc();try{const[l,c,u]=await Promise.all([t_(),e_(),n_()]);y.mats=JSON.parse(l),y.filters=JSON.parse(c),y.presets=JSON.parse(u),Wa(),a_()}catch(l){hn("Failed to load database: "+l.message)}P_(),u_(),l_(),y_(),S_(),R_(),w_(),h_(),b_(),E_(),T_(),C_(),Nt(".mat-tab").forEach(l=>{l.addEventListener("click",()=>{Nt(".mat-tab").forEach(c=>c.classList.remove("active")),l.classList.add("active"),r_(l.dataset.cat)})}),C("mat-search").addEventListener("input",()=>{Wa()}),C("btn-optimize").addEventListener("click",ir),C("btn-optimize-sidebar").addEventListener("click",ir),C("btn-stop").addEventListener("click",g_),Nt(".vp-mode-btn").forEach(l=>l.addEventListener("click",()=>Ys(l.dataset.mode))),C("btn-reset-cam").addEventListener("click",Ec),C("btn-fullscreen").addEventListener("click",Oc),C("btn-labels").addEventListener("click",function(){var l;y.labelsVisible=!y.labelsVisible,C("btn-labels").classList.toggle("active",y.labelsVisible),C("btn-labels").setAttribute("aria-pressed",y.labelsVisible?"true":"false"),y.labelsGroup?(y.labelsGroup.visible=y.labelsVisible,(l=y.renderScene)==null||l.call(y)):Cc()}),C("btn-beam").addEventListener("click",function(){var l;y.beamVisible=!y.beamVisible,C("btn-beam").classList.toggle("active",y.beamVisible),C("btn-beam").setAttribute("aria-pressed",y.beamVisible?"true":"false"),y.beamGroup&&(y.beamGroup.visible=y.beamVisible,(l=y.renderScene)==null||l.call(y))}),Ic("al"),ii(),C("idle-prompt").style.display="",pn("Ready \u2014 drop a mesh file");const i='<svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>',e='<svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" style="transform:rotate(180deg)" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>',t=C("results-panel"),n=C("results-content"),s=C("results-collapse-btn");if(s&&t){y.resultsCollapsed&&(n.style.display="none",s.innerHTML=e,s.setAttribute("aria-label","Expand results")),s.addEventListener("click",function(){y.resultsCollapsed=n.style.display!=="none",n.style.display=y.resultsCollapsed?"none":"",s.innerHTML=y.resultsCollapsed?e:i,s.setAttribute("aria-label",y.resultsCollapsed?"Expand results":"Collapse results");try{localStorage.setItem("penopt-results-collapsed",y.resultsCollapsed?"1":"")}catch{}});try{localStorage.getItem("penopt-results-collapsed")==="1"&&(y.resultsCollapsed=!0);var r=localStorage.getItem("penopt-search-range");if(r!==null){var a=parseInt(r,10);if(!isNaN(a)&&a>=30&&a<=75){y.searchRange=a;var o=C("cfg-searchrange");o&&(o.value=a)}}}catch{}}}document.addEventListener("DOMContentLoaded",L_);
