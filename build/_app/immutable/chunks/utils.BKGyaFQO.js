const Hn=!1;var jn=Array.isArray,Bn=Array.from,Un=Object.defineProperty,ht=Object.getOwnPropertyDescriptor,tn=Object.getOwnPropertyDescriptors,Vn=Object.prototype,Gn=Array.prototype,nn=Object.getPrototypeOf;function Kn(t){return typeof t=="function"}const rn=()=>{};function $n(t){return typeof(t==null?void 0:t.then)=="function"}function Zn(t){return t()}function mt(t){for(var n=0;n<t.length;n++)t[n]()}const y=2,Tt=4,B=8,ot=16,g=32,U=64,rt=128,O=256,$=512,h=1024,S=2048,P=4096,q=8192,F=16384,en=32768,gt=65536,Wn=1<<17,sn=1<<19,At=1<<20,dt=Symbol("$state"),Xn=Symbol("legacy props"),zn=Symbol("");function xt(t){return t===this.v}function an(t,n){return t!=t?n==n:t!==n||t!==null&&typeof t=="object"||typeof t=="function"}function Jn(t,n){return t!==n}function St(t){return!an(t,this.v)}function ln(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function un(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function on(t){throw new Error("https://svelte.dev/e/effect_orphan")}function fn(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Qn(){throw new Error("https://svelte.dev/e/hydration_failed")}function tr(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function nr(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function rr(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function _n(){throw new Error("https://svelte.dev/e/state_unsafe_local_read")}function cn(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let J=!1;function er(){J=!0}const sr=1,ar=2,lr=4,ur=8,or=16,ir=1,fr=2,_r=4,cr=8,vr=16,pr=4,hr=1,dr=2,vn="[",pn="[!",hn="]",kt={},Er=Symbol(),yr="http://www.w3.org/2000/svg";function it(t,n){var r={f:0,v:t,reactions:null,equals:xt,version:0};return r}function wr(t){return It(it(t))}function dn(t,n=!1){var e;const r=it(t);return n||(r.equals=St),J&&o!==null&&o.l!==null&&((e=o.l).s??(e.s=[])).push(r),r}function mr(t,n=!1){return It(dn(t,n))}function It(t){return i!==null&&i.f&y&&(T===null?Cn([t]):T.push(t)),t}function En(t,n){return i!==null&&vt()&&i.f&(y|ot)&&(T===null||!T.includes(t))&&cn(),yn(t,n)}function yn(t,n){return t.equals(n)||(t.v=n,t.version=$t(),Rt(t,S),vt()&&u!==null&&u.f&h&&!(u.f&g)&&(v!==null&&v.includes(t)?(m(u,S),tt(u)):x===null?Dn([t]):x.push(t))),n}function Rt(t,n){var r=t.reactions;if(r!==null)for(var e=vt(),s=r.length,a=0;a<s;a++){var l=r[a],f=l.f;f&S||!e&&l===u||(m(l,n),f&(h|O)&&(f&y?Rt(l,P):tt(l)))}}function Ot(t){console.warn("https://svelte.dev/e/hydration_mismatch")}let R=!1;function Tr(t){R=t}let w;function M(t){if(t===null)throw Ot(),kt;return w=t}function gr(){return M(C(w))}function Ar(t){if(R){if(C(w)!==null)throw Ot(),kt;w=t}}function xr(t=1){if(R){for(var n=t,r=w;n--;)r=C(r);w=r}}function Sr(){for(var t=0,n=w;;){if(n.nodeType===8){var r=n.data;if(r===hn){if(t===0)return n;t-=1}else(r===vn||r===pn)&&(t+=1)}var e=C(n);n.remove(),n=e}}var Et,Ct,Dt;function kr(){if(Et===void 0){Et=window;var t=Element.prototype,n=Node.prototype;Ct=ht(n,"firstChild").get,Dt=ht(n,"nextSibling").get,t.__click=void 0,t.__className="",t.__attributes=null,t.__styles=null,t.__e=void 0,Text.prototype.__t=void 0}}function et(t=""){return document.createTextNode(t)}function st(t){return Ct.call(t)}function C(t){return Dt.call(t)}function Ir(t,n){if(!R)return st(t);var r=st(w);if(r===null)r=w.appendChild(et());else if(n&&r.nodeType!==3){var e=et();return r==null||r.before(e),M(e),e}return M(r),r}function Rr(t,n){if(!R){var r=st(t);return r instanceof Comment&&r.data===""?C(r):r}return w}function Or(t,n=1,r=!1){let e=R?w:t;for(var s;n--;)s=e,e=C(e);if(!R)return e;var a=e==null?void 0:e.nodeType;if(r&&a!==3){var l=et();return e===null?s==null||s.after(l):e.before(l),M(l),l}return M(e),e}function Cr(t){t.textContent=""}function wn(t){var n=y|S;u===null?n|=O:u.f|=At;var r=i!==null&&i.f&y?i:null;const e={children:null,ctx:o,deps:null,equals:xt,f:n,fn:t,reactions:null,v:null,version:0,parent:r??u};return r!==null&&(r.children??(r.children=[])).push(e),e}function Dr(t){const n=wn(t);return n.equals=St,n}function bt(t){var n=t.children;if(n!==null){t.children=null;for(var r=0;r<n.length;r+=1){var e=n[r];e.f&y?ft(e):k(e)}}}function mn(t){for(var n=t.parent;n!==null;){if(!(n.f&y))return n;n=n.parent}return null}function Nt(t){var n,r=u;z(mn(t));try{bt(t),n=Zt(t)}finally{z(r)}return n}function qt(t){var n=Nt(t),r=(A||t.f&O)&&t.deps!==null?P:h;m(t,r),t.equals(n)||(t.v=n,t.version=$t())}function ft(t){bt(t),j(t,0),m(t,F),t.v=t.children=t.deps=t.ctx=t.reactions=null}function Pt(t){u===null&&i===null&&on(),i!==null&&i.f&O&&un(),ct&&ln()}function Tn(t,n){var r=n.last;r===null?n.last=n.first=t:(r.next=t,t.prev=r,n.last=t)}function D(t,n,r,e=!0){var s=(t&U)!==0,a=u,l={ctx:o,deps:null,deriveds:null,nodes_start:null,nodes_end:null,f:t|S,first:null,fn:n,last:null,next:null,parent:s?null:a,prev:null,teardown:null,transitions:null,version:0};if(r){var f=b;try{yt(!0),V(l),l.f|=en}catch(_){throw k(l),_}finally{yt(f)}}else n!==null&&tt(l);var p=r&&l.deps===null&&l.first===null&&l.nodes_start===null&&l.teardown===null&&(l.f&At)===0;if(!p&&!s&&e&&(a!==null&&Tn(l,a),i!==null&&i.f&y)){var d=i;(d.children??(d.children=[])).push(l)}return l}function br(){return i===null?!1:!A}function Nr(t){const n=D(B,null,!1);return m(n,h),n.teardown=t,n}function qr(t){Pt();var n=u!==null&&(u.f&g)!==0&&o!==null&&!o.m;if(n){var r=o;(r.e??(r.e=[])).push({fn:t,effect:u,reaction:i})}else{var e=Ft(t);return e}}function Pr(t){return Pt(),_t(t)}function Fr(t){const n=D(U,t,!0);return()=>{k(n)}}function Lr(t){const n=D(U,t,!0);return(r={})=>new Promise(e=>{r.outro?xn(n,()=>{k(n),e(void 0)}):(k(n),e(void 0))})}function Ft(t){return D(Tt,t,!1)}function Mr(t,n){var r=o,e={effect:null,ran:!1};r.l.r1.push(e),e.effect=_t(()=>{t(),!e.ran&&(e.ran=!0,En(r.l.r2,!0),Qt(n))})}function Yr(){var t=o;_t(()=>{if(Ln(t.l.r2)){for(var n of t.l.r1){var r=n.effect;r.f&h&&m(r,P),L(r)&&V(r),n.ran=!1}t.l.r2.v=!1}})}function _t(t){return D(B,t,!0)}function Hr(t){return gn(t)}function gn(t,n=0){return D(B|ot|n,t,!0)}function jr(t,n=!0){return D(B|g,t,!0,n)}function Lt(t){var n=t.teardown;if(n!==null){const r=ct,e=i;wt(!0),X(null);try{n.call(null)}finally{wt(r),X(e)}}}function Mt(t){var n=t.deriveds;if(n!==null){t.deriveds=null;for(var r=0;r<n.length;r+=1)ft(n[r])}}function Yt(t,n=!1){var r=t.first;for(t.first=t.last=null;r!==null;){var e=r.next;k(r,n),r=e}}function An(t){for(var n=t.first;n!==null;){var r=n.next;n.f&g||k(n),n=r}}function k(t,n=!0){var r=!1;if((n||t.f&sn)&&t.nodes_start!==null){for(var e=t.nodes_start,s=t.nodes_end;e!==null;){var a=e===s?null:C(e);e.remove(),e=a}r=!0}Yt(t,n&&!r),Mt(t),j(t,0),m(t,F);var l=t.transitions;if(l!==null)for(const p of l)p.stop();Lt(t);var f=t.parent;f!==null&&f.first!==null&&Ht(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Ht(t){var n=t.parent,r=t.prev,e=t.next;r!==null&&(r.next=e),e!==null&&(e.prev=r),n!==null&&(n.first===t&&(n.first=e),n.last===t&&(n.last=r))}function xn(t,n){var r=[];jt(t,r,!0),Sn(r,()=>{k(t),n&&n()})}function Sn(t,n){var r=t.length;if(r>0){var e=()=>--r||n();for(var s of t)s.out(e)}else n()}function jt(t,n,r){if(!(t.f&q)){if(t.f^=q,t.transitions!==null)for(const l of t.transitions)(l.is_global||r)&&n.push(l);for(var e=t.first;e!==null;){var s=e.next,a=(e.f&gt)!==0||(e.f&g)!==0;jt(e,n,a?r:!1),e=s}}}function Br(t){Bt(t,!0)}function Bt(t,n){if(t.f&q){L(t)&&V(t),t.f^=q;for(var r=t.first;r!==null;){var e=r.next,s=(r.f&gt)!==0||(r.f&g)!==0;Bt(r,s?n:!1),r=e}if(t.transitions!==null)for(const a of t.transitions)(a.is_global||n)&&a.in()}}const kn=typeof requestIdleCallback>"u"?t=>setTimeout(t,1):requestIdleCallback;let Z=!1,W=!1,at=[],lt=[];function Ut(){Z=!1;const t=at.slice();at=[],mt(t)}function Vt(){W=!1;const t=lt.slice();lt=[],mt(t)}function Ur(t){Z||(Z=!0,queueMicrotask(Ut)),at.push(t)}function Vr(t){W||(W=!0,kn(Vt)),lt.push(t)}function In(){Z&&Ut(),W&&Vt()}function Rn(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}const Gt=0,On=1;let G=!1,K=Gt,Y=!1,H=null,b=!1,ct=!1;function yt(t){b=t}function wt(t){ct=t}let I=[],N=0;let i=null;function X(t){i=t}let u=null;function z(t){u=t}let T=null;function Cn(t){T=t}let v=null,E=0,x=null;function Dn(t){x=t}let Kt=1,A=!1,o=null;function Gr(t){o=t}function $t(){return++Kt}function vt(){return!J||o!==null&&o.l===null}function L(t){var l,f;var n=t.f;if(n&S)return!0;if(n&P){var r=t.deps,e=(n&O)!==0;if(r!==null){var s;if(n&$){for(s=0;s<r.length;s++)((l=r[s]).reactions??(l.reactions=[])).push(t);t.f^=$}for(s=0;s<r.length;s++){var a=r[s];if(L(a)&&qt(a),e&&u!==null&&!A&&!((f=a==null?void 0:a.reactions)!=null&&f.includes(t))&&(a.reactions??(a.reactions=[])).push(t),a.version>t.version)return!0}}(!e||u!==null&&!A)&&m(t,h)}return!1}function bn(t,n){for(var r=n;r!==null;){if(r.f&rt)try{r.fn(t);return}catch{r.f^=rt}r=r.parent}throw G=!1,t}function Nn(t){return(t.f&F)===0&&(t.parent===null||(t.parent.f&rt)===0)}function Q(t,n,r,e){if(G){if(r===null&&(G=!1),Nn(n))throw t;return}r!==null&&(G=!0);{bn(t,n);return}}function Zt(t){var pt;var n=v,r=E,e=x,s=i,a=A,l=T,f=o,p=t.f;v=null,E=0,x=null,i=p&(g|U)?null:t,A=!b&&(p&O)!==0,T=null,o=t.ctx;try{var d=(0,t.fn)(),_=t.deps;if(v!==null){var c;if(j(t,E),_!==null&&E>0)for(_.length=E+v.length,c=0;c<v.length;c++)_[E+c]=v[c];else t.deps=_=v;if(!A)for(c=E;c<_.length;c++)((pt=_[c]).reactions??(pt.reactions=[])).push(t)}else _!==null&&E<_.length&&(j(t,E),_.length=E);return d}finally{v=n,E=r,x=e,i=s,A=a,T=l,o=f}}function qn(t,n){let r=n.reactions;if(r!==null){var e=r.indexOf(t);if(e!==-1){var s=r.length-1;s===0?r=n.reactions=null:(r[e]=r[s],r.pop())}}r===null&&n.f&y&&(v===null||!v.includes(n))&&(m(n,P),n.f&(O|$)||(n.f^=$),j(n,0))}function j(t,n){var r=t.deps;if(r!==null)for(var e=n;e<r.length;e++)qn(t,r[e])}function V(t){var n=t.f;if(!(n&F)){m(t,h);var r=u,e=o;u=t;try{n&ot?An(t):Yt(t),Mt(t),Lt(t);var s=Zt(t);t.teardown=typeof s=="function"?s:null,t.version=Kt}catch(a){Q(a,t,r,e||t.ctx)}finally{u=r}}}function Wt(){if(N>1e3){N=0;try{fn()}catch(t){if(H!==null)Q(t,H,null);else throw t}}N++}function Xt(t){var n=t.length;if(n!==0){Wt();var r=b;b=!0;try{for(var e=0;e<n;e++){var s=t[e];s.f&h||(s.f^=h);var a=[];zt(s,a),Pn(a)}}finally{b=r}}}function Pn(t){var n=t.length;if(n!==0)for(var r=0;r<n;r++){var e=t[r];if(!(e.f&(F|q)))try{L(e)&&(V(e),e.deps===null&&e.first===null&&e.nodes_start===null&&(e.teardown===null?Ht(e):e.fn=null))}catch(s){Q(s,e,null,e.ctx)}}}function Fn(){if(Y=!1,N>1001)return;const t=I;I=[],Xt(t),Y||(N=0,H=null)}function tt(t){K===Gt&&(Y||(Y=!0,queueMicrotask(Fn))),H=t;for(var n=t;n.parent!==null;){n=n.parent;var r=n.f;if(r&(U|g)){if(!(r&h))return;n.f^=h}}I.push(n)}function zt(t,n){var r=t.first,e=[];t:for(;r!==null;){var s=r.f,a=(s&g)!==0,l=a&&(s&h)!==0,f=r.next;if(!l&&!(s&q))if(s&B){if(a)r.f^=h;else try{L(r)&&V(r)}catch(c){Q(c,r,null,r.ctx)}var p=r.first;if(p!==null){r=p;continue}}else s&Tt&&e.push(r);if(f===null){let c=r.parent;for(;c!==null;){if(t===c)break t;var d=c.next;if(d!==null){r=d;continue t}c=c.parent}}r=f}for(var _=0;_<e.length;_++)p=e[_],n.push(p),zt(p,n)}function Jt(t){var n=K,r=I;try{Wt();const s=[];K=On,I=s,Y=!1,Xt(r);var e=t==null?void 0:t();return In(),(I.length>0||s.length>0)&&Jt(),N=0,H=null,e}finally{K=n,I=r}}async function Kr(){await Promise.resolve(),Jt()}function Ln(t){var _;var n=t.f,r=(n&y)!==0;if(r&&n&F){var e=Nt(t);return ft(t),e}if(i!==null){T!==null&&T.includes(t)&&_n();var s=i.deps;v===null&&s!==null&&s[E]===t?E++:v===null?v=[t]:v.push(t),x!==null&&u!==null&&u.f&h&&!(u.f&g)&&x.includes(t)&&(m(u,S),tt(u))}else if(r&&t.deps===null)for(var a=t,l=a.parent,f=a;l!==null;)if(l.f&y){var p=l;f=p,l=p.parent}else{var d=l;(_=d.deriveds)!=null&&_.includes(f)||(d.deriveds??(d.deriveds=[])).push(f);break}return r&&(a=t,L(a)&&qt(a)),t.v}function Qt(t){const n=i;try{return i=null,t()}finally{i=n}}const Mn=~(S|P|h);function m(t,n){t.f=t.f&Mn|n}function $r(t){return nt().get(t)}function Zr(t,n){return nt().set(t,n),n}function Wr(t){return nt().has(t)}function Xr(){return nt()}function nt(t){return o===null&&Rn(),o.c??(o.c=new Map(Yn(o)||void 0))}function Yn(t){let n=t.p;for(;n!==null;){const r=n.c;if(r!==null)return r;n=n.p}return null}function zr(t,n=!1,r){o={p:o,c:null,e:null,m:!1,s:t,x:null,l:null},J&&!n&&(o.l={s:null,u:null,r1:[],r2:it(!1)})}function Jr(t){const n=o;if(n!==null){const l=n.e;if(l!==null){var r=u,e=i;n.e=null;try{for(var s=0;s<l.length;s++){var a=l[s];z(a.effect),X(a.reaction),Ft(a.fn)}}finally{z(r),X(e)}}o=n.p,n.m=!0}return{}}function Qr(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(dt in t)ut(t);else if(!Array.isArray(t))for(let n in t){const r=t[n];typeof r=="object"&&r&&dt in r&&ut(r)}}}function ut(t,n=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!n.has(t)){n.add(t),t instanceof Date&&t.getTime();for(let e in t)try{ut(t[e],n)}catch{}const r=nn(t);if(r!==Object.prototype&&r!==Array.prototype&&r!==Map.prototype&&r!==Set.prototype&&r!==Date.prototype){const e=tn(r);for(let s in e){const a=e[s].get;if(a)try{a.call(t)}catch{}}}}}function te(t,n,r){if(t==null)return n(void 0),r&&r(void 0),rn;const e=Qt(()=>t.subscribe(n,r));return e.unsubscribe?()=>e.unsubscribe():e}export{Ot as $,mt as A,an as B,En as C,Hn as D,gt as E,mr as F,Pr as G,Zn as H,Qr as I,er as J,Jt as K,Xn as L,Un as M,dn as N,Kr as O,wr as P,vt as Q,$n as R,yn as S,Ur as T,Er as U,it as V,z as W,X,Gr as Y,Br as Z,C as _,Jr as a,Fr as a$,kt as a0,M as a1,st as a2,k as a3,Mr as a4,Yr as a5,ot as a6,en as a7,Ft as a8,u as a9,ht as aA,rr as aB,vn as aC,sn as aD,hr as aE,dr as aF,kr as aG,Qn as aH,Lr as aI,_t as aJ,Nr as aK,tr as aL,Wn as aM,_r as aN,St as aO,g as aP,U as aQ,ir as aR,fr as aS,cr as aT,vr as aU,Jn as aV,Xr as aW,br as aX,Zr as aY,Wr as aZ,yr as a_,Kn as aa,pr as ab,i as ac,et as ad,Bn as ae,pn as af,Sr as ag,Tr as ah,q as ai,sr as aj,ar as ak,jt as al,Cr as am,Sn as an,lr as ao,hn as ap,ur as aq,or as ar,Vr as as,nn as at,zn as au,tn as av,dt as aw,Vn as ax,Gn as ay,nr as az,xr as b,Ir as c,wn as d,Dr as e,Rr as f,Ln as g,o as h,J as i,jn as j,Qt as k,Rn as l,$r as m,rn as n,gn as o,zr as p,jr as q,Ar as r,Or as s,Hr as t,qr as u,R as v,gr as w,xn as x,w as y,te as z};