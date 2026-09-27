(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,631171,e=>{"use strict";let t=(0,e.i(475254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["default",0,t])},664659,e=>{"use strict";var t=e.i(631171);e.s(["ChevronDown",()=>t.default])},586557,e=>{"use strict";let t=(0,e.i(475254).default)("panels-top-left",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]);e.s(["Layout",0,t],586557)},841947,e=>{"use strict";let t=(0,e.i(475254).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["default",0,t])},475254,e=>{"use strict";var t=e.i(271645);let r=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,r)=>r?r.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)},s=(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim();var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let a=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:a=2,absoluteStrokeWidth:n,className:l="",children:o,iconNode:c,...d},u)=>(0,t.createElement)("svg",{ref:u,...i,width:r,height:r,stroke:e,strokeWidth:n?24*Number(a)/Number(r):a,className:s("lucide",l),...!o&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(o)?o:[o]]));e.s(["default",0,(e,i)=>{let n=(0,t.forwardRef)(({className:n,...l},o)=>(0,t.createElement)(a,{ref:o,iconNode:i,className:s(`lucide-${r(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,n),...l}));return n.displayName=r(e),n}],475254)},705766,e=>{"use strict";let t,r;var s,i=e.i(271645);let a={data:""},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,o=/\n+/g,c=(e,t)=>{let r="",s="",i="";for(let a in e){let n=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+n+";":s+="f"==a[1]?c(n,a):a+"{"+c(n,"k"==a[1]?"":t)+"}":"object"==typeof n?s+=c(n,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=n&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=c.p?c.p(a,n):a+":"+n+";")}return r+(t&&i?t+"{"+i+"}":i)+s},d={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e};function m(e){let t,r,s,i=this||{},m=e.call?e(i.p):e;return((e,t,r,s,i)=>{var a;let m=u(e),p=d[m]||(d[m]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(m));if(!d[p]){let t=m!==e?e:(e=>{let t,r,s=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?s.shift():t[3]?(r=t[3].replace(o," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(o," ").trim();return s[0]})(e);d[p]=c(i?{["@keyframes "+p]:t}:t,r?"":"."+p)}let x=r&&d.g?d.g:null;return r&&(d.g=d[p]),a=d[p],x?t.data=t.data.replace(x,a):-1===t.data.indexOf(a)&&(t.data=s?a+t.data:t.data+a),p})(m.unshift?m.raw?(t=[].slice.call(arguments,1),r=i.p,m.reduce((e,s,i)=>{let a=t[i];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==a?"":a)},"")):m.reduce((e,t)=>Object.assign(e,t&&t.call?t(i.p):t),{}):m,(s=i.target,"object"==typeof window?((s?s.querySelector("#_goober"):window._goober)||Object.assign((s||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:s||a),i.g,i.o,i.k)}m.bind({g:1});let p,x,h,f=m.bind({k:1});function g(e,t){let r=this||{};return function(){let s=arguments;function i(a,n){let l=Object.assign({},a),o=l.className||i.className;r.p=Object.assign({theme:x&&x()},l),r.o=/ *go\d+/.test(o),l.className=m.apply(r,s)+(o?" "+o:""),t&&(l.ref=n);let c=e;return e[0]&&(c=l.as||e,delete l.as),h&&c[0]&&h(l),p(c,l)}return t?t(i):i}}var b=(e,t)=>"function"==typeof e?e(t):e,w=(t=0,()=>(++t).toString()),y=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},v="default",j=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},k=[],z={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},N={},S=(e,t=v)=>{N[t]=j(N[t]||z,e),k.forEach(([e,r])=>{e===t&&r(N[t])})},C=e=>Object.keys(N).forEach(t=>S(e,t)),E=(e=v)=>t=>{S(t,e)},L={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},O=(e={},t=v)=>{let[r,s]=(0,i.useState)(N[t]||z),a=(0,i.useRef)(N[t]);(0,i.useEffect)(()=>(a.current!==N[t]&&s(N[t]),k.push([t,s]),()=>{let e=k.findIndex(([e])=>e===t);e>-1&&k.splice(e,1)}),[t]);let n=r.toasts.map(t=>{var r,s,i;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(s=e[t.type])?void 0:s.duration)||(null==e?void 0:e.duration)||L[t.type],style:{...e.style,...null==(i=e[t.type])?void 0:i.style,...t.style}}});return{...r,toasts:n}},R=e=>(t,r)=>{let s,i=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||w()}))(t,e,r);return E(i.toasterId||(s=i.id,Object.keys(N).find(e=>N[e].toasts.some(e=>e.id===s))))({type:2,toast:i}),i.id},T=(e,t)=>R("blank")(e,t);T.error=R("error"),T.success=R("success"),T.loading=R("loading"),T.custom=R("custom"),T.dismiss=(e,t)=>{let r={type:3,toastId:e};t?E(t)(r):C(r)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let r={type:4,toastId:e};t?E(t)(r):C(r)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,r)=>{let s=T.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?b(t.success,e):void 0;return i?T.success(i,{id:s,...r,...null==r?void 0:r.success}):T.dismiss(s),e}).catch(e=>{let i=t.error?b(t.error,e):void 0;i?T.error(i,{id:s,...r,...null==r?void 0:r.error}):T.dismiss(s)}),e};var U=1e3,D=(e,t="default")=>{let{toasts:r,pausedAt:s}=O(e,t),a=(0,i.useRef)(new Map).current,n=(0,i.useCallback)((e,t=U)=>{if(a.has(e))return;let r=setTimeout(()=>{a.delete(e),l({type:4,toastId:e})},t);a.set(e,r)},[]);(0,i.useEffect)(()=>{if(s)return;let e=Date.now(),i=r.map(r=>{if(r.duration===1/0)return;let s=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(s<0){r.visible&&T.dismiss(r.id);return}return setTimeout(()=>T.dismiss(r.id,t),s)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[r,s,t]);let l=(0,i.useCallback)(E(t),[t]),o=(0,i.useCallback)(()=>{l({type:5,time:Date.now()})},[l]),c=(0,i.useCallback)((e,t)=>{l({type:1,toast:{id:e,height:t}})},[l]),d=(0,i.useCallback)(()=>{s&&l({type:6,time:Date.now()})},[s,l]),u=(0,i.useCallback)((e,t)=>{let{reverseOrder:s=!1,gutter:i=8,defaultPosition:a}=t||{},n=r.filter(t=>(t.position||a)===(e.position||a)&&t.height),l=n.findIndex(t=>t.id===e.id),o=n.filter((e,t)=>t<l&&e.visible).length;return n.filter(e=>e.visible).slice(...s?[o+1]:[0,o]).reduce((e,t)=>e+(t.height||0)+i,0)},[r]);return(0,i.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)n(e.id,e.removeDelay);else{let t=a.get(e.id);t&&(clearTimeout(t),a.delete(e.id))}})},[r,n]),{toasts:r,handlers:{updateHeight:c,startPause:o,endPause:d,calculateOffset:u}}},I=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,P=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,$=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,A=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${P} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${$} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,M=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,F=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${M} 1s linear infinite;
`,W=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,q=f`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,B=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${W} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${q} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,H=g("div")`
  position: absolute;
`,_=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,G=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${G} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,X=({toast:e})=>{let{icon:t,type:r,iconTheme:s}=e;return void 0!==t?"string"==typeof t?i.createElement(V,null,t):t:"blank"===r?null:i.createElement(_,null,i.createElement(F,{...s}),"loading"!==r&&i.createElement(H,null,"error"===r?i.createElement(A,{...s}):i.createElement(B,{...s})))},K=g("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Z=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Q=i.memo(({toast:e,position:t,style:r,children:s})=>{let a=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[s,i]=y()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${f(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},n=i.createElement(X,{toast:e}),l=i.createElement(Z,{...e.ariaProps},b(e.message,e));return i.createElement(K,{className:e.className,style:{...a,...r,...e.style}},"function"==typeof s?s({icon:n,message:l}):i.createElement(i.Fragment,null,n,l))});s=i.createElement,c.p=void 0,p=s,x=void 0,h=void 0;var J=({id:e,className:t,style:r,onHeightUpdate:s,children:a})=>{let n=i.useCallback(t=>{if(t){let r=()=>{s(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,s]);return i.createElement("div",{ref:n,className:t,style:r},a)},Y=m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;e.s(["CheckmarkIcon",0,B,"ErrorIcon",0,A,"LoaderIcon",0,F,"ToastBar",0,Q,"ToastIcon",0,X,"Toaster",0,({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:s,children:a,toasterId:n,containerStyle:l,containerClassName:o})=>{let{toasts:c,handlers:d}=D(r,n);return i.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...l},className:o,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(r=>{let n,l,o=r.position||t,c=d.calculateOffset(r,{reverseOrder:e,gutter:s,defaultPosition:t}),u=(n=o.includes("top"),l=o.includes("center")?{justifyContent:"center"}:o.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:y()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${c*(n?1:-1)}px)`,...n?{top:0}:{bottom:0},...l});return i.createElement(J,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?Y:"",style:u},"custom"===r.type?b(r.message,r):a?a(r):i.createElement(Q,{toast:r,position:o}))}))},"default",0,T,"resolveValue",0,b,"toast",0,T,"useToaster",0,D,"useToasterStore",0,O],705766)},678745,e=>{"use strict";let t=(0,e.i(475254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["default",0,t])},643531,e=>{"use strict";var t=e.i(678745);e.s(["Check",()=>t.default])},37727,e=>{"use strict";var t=e.i(841947);e.s(["X",()=>t.default])},248256,e=>{"use strict";let t=(0,e.i(475254).default)("globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);e.s(["Globe",0,t],248256)},569074,e=>{"use strict";let t=(0,e.i(475254).default)("upload",[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]]);e.s(["Upload",0,t],569074)},63209,e=>{"use strict";let t=(0,e.i(475254).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],63209)},952571,e=>{"use strict";let t=(0,e.i(475254).default)("info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);e.s(["Info",0,t],952571)},30593,e=>{"use strict";var t=e.i(271645);e.s(["useIsMobile",0,function(){let[e,r]=t.useState(void 0);return t.useEffect(()=>{let e=window.matchMedia("(max-width: 767px)"),t=()=>{r(window.innerWidth<768)};return e.addEventListener("change",t),r(window.innerWidth<768),()=>e.removeEventListener("change",t)},[]),!!e}])},374835,e=>{"use strict";var t=e.i(843476),r=e.i(271645),s=e.i(705766),i=e.i(954616),a=e.i(653145),n=e.i(681307),l=e.i(994814),o=e.i(630374),c=e.i(743687),d=e.i(30593),u=e.i(248256),m=e.i(586557),p=e.i(569074),x=e.i(37727),h=e.i(531278),f=e.i(664659),g=e.i(643531),b=e.i(63209),w=e.i(952571),y=e.i(647163);let v=["Framer","Webflow","Next.js","React","HTML/CSS","Vue","Astro","Svelte","Tailwind","WordPress"],j=n.z.object({url:n.z.string().trim().min(1,"URL is required").url("Enter a valid URL (https://...)"),note:n.z.string().trim().max(500,"Keep it under 500 characters").optional()}),k=n.z.object({name:n.z.string().min(1,"Name is required"),tagline:n.z.string().min(1,"Tagline is required"),tech:n.z.string().min(1,"At least one technology is required"),price:n.z.string().min(1,"Price is required"),link:n.z.string().min(1,"Link is required").url("Enter a valid URL")});e.s(["default",0,function({open:e,onOpenChange:n}){let z=(0,d.useIsMobile)(),[N,S]=(0,r.useState)("website"),[C,E]=(0,r.useState)(!1),[L,O]=(0,r.useState)({logo:null,image:null}),[R,T]=(0,r.useState)({logo:"",image:""}),U=(0,a.useForm)({resolver:(0,l.zodResolver)(j),defaultValues:{url:"",note:""},mode:"onBlur"}),D=(0,a.useForm)({resolver:(0,l.zodResolver)(k),defaultValues:{name:"",tagline:"",tech:"",price:"",link:""},mode:"onBlur"}),I=async(e,t)=>{let r=new FormData;r.append("file",e),r.append("type",t);let s=await fetch("/api/uploads/submission-images",{method:"POST",body:r});if(!s.ok){if(401===s.status)throw Error("LOGIN_REQUIRED");throw Error(`Failed to upload ${t}`)}return(await s.json()).url},P=()=>{U.reset(),D.reset(),Object.values(R).forEach(e=>{e&&URL.revokeObjectURL(e)}),O({logo:null,image:null}),T({logo:"",image:""})},$=(0,i.useMutation)({mutationFn:async e=>{let t=await fetch("/api/submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){let e=await t.json().catch(()=>({}));if(401===t.status||e?.error==="Unauthorized")throw Error("Please log in to submit");throw Error(e?.error||"Failed to submit")}},onSuccess:()=>{s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-emerald-500 text-white shrink-0",children:(0,t.jsx)(g.Check,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Submitted successfully"})]}),{duration:3e3,position:"bottom-center"}),n(!1),P()},onError:e=>{s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-rose-500 text-white shrink-0",children:(0,t.jsx)(b.AlertCircle,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:e?.message||"Submission failed"})]}),{duration:3e3,position:"bottom-center"}),E(!1)}}),A=async e=>{if(!L.logo)return void s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-orange-500 text-white shrink-0",children:(0,t.jsx)(w.Info,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Select a logo"})]}),{duration:2500,position:"bottom-center"});if(!L.image)return void s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-orange-500 text-white shrink-0",children:(0,t.jsx)(w.Info,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Select a preview image (1440×900)"})]}),{duration:2500,position:"bottom-center"});E(!0);try{s.default.custom(()=>(0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white shrink-0",children:(0,t.jsx)(h.Loader2,{className:"h-5 w-5 animate-spin"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Uploading images..."})]}),{id:"upload",position:"bottom-center"});let[r,i]=await Promise.all([I(L.logo,"logo"),I(L.image,"image")]);s.default.dismiss("upload"),$.mutate({type:"template",...e,logo:r,image:i})}catch(e){s.default.dismiss("upload"),e instanceof Error&&"LOGIN_REQUIRED"===e.message?s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-rose-500 text-white shrink-0",children:(0,t.jsx)(b.AlertCircle,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Please log in to submit"})]}),{duration:3e3,position:"bottom-center"}):s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-rose-500 text-white shrink-0",children:(0,t.jsx)(x.X,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Upload failed"})]}),{duration:3e3,position:"bottom-center"}),E(!1)}},M=({label:e,field:r,hint:i})=>{let a=R[r],n=!!L[r];return(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]",children:[e," ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),i&&(0,t.jsx)("p",{className:"text-zinc-500 text-[10px]",children:i}),(0,t.jsx)("div",{className:(0,y.cn)("relative rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-zinc-400 dark:hover:border-zinc-700 group","logo"===r?"h-24":"h-40"),children:n&&a?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("img",{src:a,alt:e,className:"w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"}),(0,t.jsx)("div",{className:"absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",children:(0,t.jsx)("button",{type:"button",onClick:()=>{O(e=>({...e,[r]:null})),T(e=>(e[r]&&URL.revokeObjectURL(e[r]),{...e,[r]:""}))},className:"p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg",children:(0,t.jsx)(x.X,{className:"w-4 h-4"})})})]}):(0,t.jsxs)("label",{className:"cursor-pointer w-full h-full flex flex-col items-center justify-center p-4",children:[(0,t.jsx)("div",{className:"w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center mb-2 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors",children:(0,t.jsx)(p.Upload,{className:"w-4 h-4 text-zinc-500"})}),(0,t.jsx)("span",{className:"text-[10px] text-zinc-600 font-medium",children:"Click to select"}),(0,t.jsx)("input",{type:"file",className:"hidden",accept:"image/*",onChange:e=>((e,r)=>{let i=e.target.files?.[0];if(!i)return;if(!i.type.startsWith("image/"))return void s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-rose-500 text-white shrink-0",children:(0,t.jsx)(x.X,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Invalid image file"})]}),{duration:2500,position:"bottom-center"});if(i.size>5242880)return void s.default.custom((0,t.jsxs)("div",{className:"flex items-center gap-2.5 bg-white text-black rounded-full pl-1.5 pr-4 py-1.5 shadow-xl ring-1 ring-zinc-200",children:[(0,t.jsx)("span",{className:"inline-flex items-center justify-center h-9 w-9 rounded-full bg-rose-500 text-white shrink-0",children:(0,t.jsx)(b.AlertCircle,{className:"h-5 w-5"})}),(0,t.jsx)("span",{className:"font-semibold text-sm text-zinc-900",children:"Image must be < 5MB"})]}),{duration:2500,position:"bottom-center"});O(e=>({...e,[r]:i}));let a=URL.createObjectURL(i);T(e=>(e[r]&&URL.revokeObjectURL(e[r]),{...e,[r]:a}))})(e,r)})]})})]})},F=(0,t.jsxs)("div",{className:"flex flex-col gap-4 mb-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"text-xl font-bold text-zinc-900 dark:text-white",children:"Share your work"}),(0,t.jsx)("p",{className:"text-zinc-600 dark:text-zinc-400 text-sm",children:"Submit a website or a template for review."})]}),(0,t.jsxs)("div",{className:"flex p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800 w-fit",children:[(0,t.jsxs)("button",{type:"button",onClick:()=>{S("website"),D.reset(),Object.values(R).forEach(e=>{e&&URL.revokeObjectURL(e)}),O({logo:null,image:null}),T({logo:"",image:""})},className:(0,y.cn)("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all","website"===N?"bg-zinc-900 dark:bg-zinc-800 text-white shadow-sm":"text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"),children:[(0,t.jsx)(u.Globe,{className:"w-4 h-4"}),"Website"]}),(0,t.jsxs)("button",{type:"button",onClick:()=>{S("template"),U.reset()},className:(0,y.cn)("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all","template"===N?"bg-zinc-900 dark:bg-zinc-800 text-white shadow-sm":"text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"),children:[(0,t.jsx)(m.Layout,{className:"w-4 h-4"}),"Template"]})]})]}),W=(0,t.jsxs)("form",{onSubmit:U.handleSubmit(e=>{$.mutate({type:"website",...e})}),className:"space-y-5",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-600 dark:text-zinc-400 text-sm font-medium",children:["Website URL ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),(0,t.jsx)("input",{...U.register("url"),placeholder:"https://example.com",className:"w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20"}),U.formState.errors.url&&(0,t.jsx)("p",{className:"text-red-400 text-xs",children:U.formState.errors.url.message})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)("label",{className:"text-zinc-600 dark:text-zinc-400 text-sm font-medium",children:"Note (optional)"}),(0,t.jsx)("textarea",{...U.register("note"),placeholder:"Anything we should know?",className:"w-full min-h-[120px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20 resize-none"}),U.formState.errors.note&&(0,t.jsx)("p",{className:"text-red-400 text-xs",children:U.formState.errors.note.message})]}),(0,t.jsxs)("button",{type:"submit",disabled:$.isPending,className:"w-full h-12 mt-4 rounded-xl bg-white text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2",children:[$.isPending&&(0,t.jsx)(h.Loader2,{className:"w-4 h-4 animate-spin"}),$.isPending?"Submitting...":"Submit Website"]})]}),q=(0,t.jsxs)("form",{onSubmit:D.handleSubmit(A),className:"space-y-6 pb-4",children:[(0,t.jsxs)("div",{className:"flex flex-col md:flex-row gap-6 items-start bg-zinc-100/80 dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-300 dark:border-zinc-800/50",children:[(0,t.jsx)("div",{className:"w-full md:w-28 flex-shrink-0",children:(0,t.jsx)(M,{label:"Logo",field:"logo"})}),(0,t.jsxs)("div",{className:"flex-1 grid grid-cols-1 gap-4 w-full",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]",children:["Name ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),(0,t.jsx)("input",{...D.register("name"),placeholder:"e.g. Minimal Portfolio",className:"w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20"}),D.formState.errors.name&&(0,t.jsx)("p",{className:"text-red-400 text-[10px]",children:D.formState.errors.name.message})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]",children:["Tagline ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),(0,t.jsx)("input",{...D.register("tagline"),placeholder:"e.g. Clean & responsive portfolio template",className:"w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20"}),D.formState.errors.tagline&&(0,t.jsx)("p",{className:"text-red-400 text-[10px]",children:D.formState.errors.tagline.message})]})]})]}),(0,t.jsx)(M,{label:"Preview Image (1440 × 900)",field:"image",hint:"Upload a 1440×900 screenshot of your template"}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]",children:["Tech ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),(0,t.jsx)(a.Controller,{name:"tech",control:D.control,render:({field:e})=>{let s=e.value?e.value.split(",").filter(Boolean):[],[i,a]=(0,r.useState)(!1),n=(0,r.useRef)(null);(0,r.useEffect)(()=>{let e=e=>{n.current&&!n.current.contains(e.target)&&a(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]);let l=t=>{let r=s.includes(t)?s.filter(e=>e!==t):[...s,t];e.onChange(r.join(","))};return(0,t.jsxs)("div",{className:"relative",ref:n,children:[(0,t.jsxs)("button",{type:"button",onClick:()=>a(!i),className:"w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20",children:[(0,t.jsx)("span",{className:s.length>0?"text-zinc-900 dark:text-white":"text-zinc-600 dark:text-zinc-500",children:s.length>0?`${s.length} selected`:"Select technologies"}),(0,t.jsx)(f.ChevronDown,{className:(0,y.cn)("w-4 h-4 text-zinc-500 transition-transform",i&&"rotate-180")})]}),s.length>0&&(0,t.jsx)("div",{className:"flex flex-wrap gap-1.5 mt-2",children:s.map(e=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1 px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-md",children:[e,(0,t.jsx)("button",{type:"button",onClick:()=>l(e),className:"hover:text-red-400",children:(0,t.jsx)(x.X,{className:"w-3 h-3"})})]},e))}),i&&(0,t.jsx)("div",{className:"absolute top-14 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden",children:(0,t.jsx)("div",{className:"max-h-48 overflow-y-auto p-2 space-y-1",children:v.map(e=>(0,t.jsxs)("button",{type:"button",onClick:()=>l(e),className:(0,y.cn)("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",s.includes(e)?"bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white":"text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"),children:[(0,t.jsx)("div",{className:(0,y.cn)("w-4 h-4 rounded border flex items-center justify-center",s.includes(e)?"bg-white border-white":"border-zinc-700"),children:s.includes(e)&&(0,t.jsx)(g.Check,{className:"w-3 h-3 text-black"})}),e]},e))})})]})}}),D.formState.errors.tech&&(0,t.jsx)("p",{className:"text-red-400 text-[10px]",children:D.formState.errors.tech.message})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]",children:["Pricing ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),(0,t.jsx)("input",{...D.register("price"),placeholder:"Free or $49",className:"w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20"}),D.formState.errors.price&&(0,t.jsx)("p",{className:"text-red-400 text-[10px]",children:D.formState.errors.price.message})]})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("label",{className:"text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2",children:[(0,t.jsx)(u.Globe,{className:"w-3 h-3 text-zinc-600"})," Template Link ",(0,t.jsx)("span",{className:"text-red-400",children:"*"})]}),(0,t.jsx)("input",{...D.register("link"),placeholder:"https://your-template-link.com",className:"w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-white/20"}),D.formState.errors.link&&(0,t.jsx)("p",{className:"text-red-400 text-[10px]",children:D.formState.errors.link.message})]}),(0,t.jsxs)("button",{type:"submit",disabled:$.isPending||C,className:"w-full h-12 rounded-xl bg-white text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2",children:[($.isPending||C)&&(0,t.jsx)(h.Loader2,{className:"w-4 h-4 animate-spin"}),$.isPending||C?"Submitting...":"Submit Template"]})]}),B=(0,t.jsxs)("div",{className:"flex flex-col h-full max-h-[85vh]",children:[F,(0,t.jsx)("div",{className:"flex-1 overflow-y-auto pr-2 custom-scrollbar",children:"website"===N?W:q})]});return z?(0,t.jsx)(c.Drawer,{open:e,onOpenChange:e=>{n(e),e||P()},children:(0,t.jsxs)(c.DrawerContent,{className:"bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 max-h-[96vh]",children:[(0,t.jsx)(c.DrawerHeader,{className:"hidden",children:(0,t.jsx)(c.DrawerTitle,{children:"Submit"})}),(0,t.jsx)("div",{className:"px-6 pb-8 overflow-y-auto",children:B})]})}):(0,t.jsx)(o.Dialog,{open:e,onOpenChange:e=>{n(e),e||P()},children:(0,t.jsxs)(o.DialogContent,{className:(0,y.cn)("bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-3xl mx-auto shadow-2xl transition-all duration-300 overflow-hidden max-h-[95vh]","website"===N?"max-w-md":"max-w-3xl"),children:[(0,t.jsx)(o.DialogHeader,{className:"hidden",children:(0,t.jsx)(o.DialogTitle,{children:"Submit"})}),(0,t.jsx)("div",{className:"p-2",children:B})]})})}])}]);