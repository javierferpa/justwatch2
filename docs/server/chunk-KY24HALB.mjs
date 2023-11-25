import './polyfills.server.mjs';
import{B as k,C as j,D,E as d,F,G as S,H as z,I as Y,L as H,P as N,S as X,a as M,b as s,c as x,d as O,e as m,f,g as v,h as l,i as r,j as c,k as y,l as P,m as b,n as h,o as w,p,q as _,r as A,s as E,z as I}from"./chunk-6GBKHVKO.mjs";import{h as C}from"./chunk-KRLCULJA.mjs";function J(t,n){if(t&1&&c(0,"img",8),t&2){let g=P().$implicit;f("src","https://image.tmdb.org/t/p/original"+g.poster_path,O)}}function Z(t,n){t&1&&c(0,"img",9)}function L(t,n){if(t&1&&(l(0,"div",3)(1,"div",4)(2,"p",5),h(3),_(4,"number"),r()(),v(5,J,1,1,"img",6)(6,Z,1,0,"ng-template",null,7,E),r()),t&2){let g=n.$implicit,a=b(7);m(3),w(A(4,3,g.vote_average,"1.0-2")),m(2),f("ngIf",g==null?null:g.poster_path)("ngIfElse",a)}}function K(t,n){t&1&&(l(0,"div",10)(1,"div",11),c(2,"div")(3,"div")(4,"div")(5,"div"),r()())}var T=(()=>{let n=class n{constructor(){this.httpClient=M(F),this.data=[],this.contador=1,this.isLoadingData=!1}ngOnInit(){this.fetchData()}fetchData(){return C(this,null,function*(){if(this.isLoadingData)return;this.isLoadingData=!0;let a={method:"GET",headers:{accept:"application/json",Authorization:"Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MDYzNjY5ZWRhMTNiOWQ4ODA2ZDlkMGIxYTI1NWVlNyIsInN1YiI6IjY1NjEzOTI0MzY3OWExMDk3N2UwMzQxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gpPYfhFoIc9PBlcw9nP_AE6_9iv4sx27vyB_r27J07M"}},e="https://api.themoviedb.org/3/trending/all/day?language=en-US&page="+this.contador;try{let o=yield fetch(e,a).then(i=>{if(!i.ok)throw new Error(`La solicitud fall\xF3 con el c\xF3digo ${i.status}`);return i.json()}).then(i=>{this.data=this.data.concat(i.results),console.log(i.results),console.log(this.data),this.contador+=1}).catch(i=>{console.error("Error en la solicitud:",i)})}catch(o){console.error(o)}finally{this.isLoadingData=!1}})}onScroll(a){let e="innerHeight"in window?window.innerHeight:document.documentElement.offsetHeight,o=document.body,i=document.documentElement,u=Math.max(o.scrollHeight,o.offsetHeight,i.clientHeight,i.scrollHeight,i.offsetHeight);e+window.scrollY>=u-50&&this.fetchData()}};n.\u0275fac=function(e){return new(e||n)},n.\u0275cmp=s({type:n,selectors:[["app-card-display"]],hostBindings:function(e,o){e&1&&y("scroll",function(u){return o.onScroll(u)},!1,x)},standalone:!0,features:[p],decls:3,vars:2,consts:[[1,"card-container"],["class","card",4,"ngFor","ngForOf"],["class","loading-spinner",4,"ngIf"],[1,"card"],[1,"circle"],[1,"score"],["width","80%","height","60%","sizes","(max-width: 768px) 100vw, 50vw ","alt","Descripci\xF3n de la imagen",3,"src",4,"ngIf","ngIfElse"],["defaultImage",""],["width","80%","height","60%","sizes","(max-width: 768px) 100vw, 50vw ","alt","Descripci\xF3n de la imagen",3,"src"],["src","data:image/png;base64,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","width","80%","height","60%","sizes","(max-width: 768px) 100vw, 50vw"],[1,"loading-spinner"],[1,"lds-ellipsis"]],template:function(e,o){e&1&&(l(0,"div",0),v(1,L,8,6,"div",1),r(),v(2,K,6,0,"div",2)),e&2&&(m(1),f("ngForOf",o.data),m(1),f("ngIf",o.isLoadingData))},dependencies:[d,k,j,D,S],styles:[".card-container[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;justify-content:space-around;width:94%;margin:4% auto}.card[_ngcontent-%COMP%]{position:relative;margin:1%;width:15%;box-sizing:border-box}.circle[_ngcontent-%COMP%]{position:absolute;top:5%;left:5%;width:20%;height:13.5135%;background-color:#084a64;border-radius:50%;display:flex;justify-content:center;align-items:center}.score[_ngcontent-%COMP%]{color:#fff;font-size:1em;font-weight:700}.card[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:100%;height:auto;border-radius:8px}.loading-spinner[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;padding:10px;margin-top:20px}.lds-ellipsis[_ngcontent-%COMP%]{display:inline-block;position:relative;width:80px;height:80px}.lds-ellipsis[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{position:absolute;top:33px;width:13px;height:13px;border-radius:50%;background:#020101;animation-timing-function:cubic-bezier(0,1,1,0)}.lds-ellipsis[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:nth-child(1){left:8px;animation:_ngcontent-%COMP%_lds-ellipsis1 .6s infinite}.lds-ellipsis[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:nth-child(2){left:8px;animation:_ngcontent-%COMP%_lds-ellipsis2 .6s infinite}.lds-ellipsis[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:nth-child(3){left:32px;animation:_ngcontent-%COMP%_lds-ellipsis2 .6s infinite}.lds-ellipsis[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:nth-child(4){left:56px;animation:_ngcontent-%COMP%_lds-ellipsis3 .6s infinite}@keyframes _ngcontent-%COMP%_lds-ellipsis1{0%{transform:scale(0)}to{transform:scale(1)}}@keyframes _ngcontent-%COMP%_lds-ellipsis3{0%{transform:scale(1)}to{transform:scale(0)}}@keyframes _ngcontent-%COMP%_lds-ellipsis2{0%{transform:translate(0)}to{transform:translate(24px)}}@media screen and (max-width: 1000px){.card[_ngcontent-%COMP%]{width:calc(33.33% - 20px)}}@media screen and (max-width: 768px){.card[_ngcontent-%COMP%]{width:calc(50% - 20px)}.card-container[_ngcontent-%COMP%]{margin-top:20%}}@media screen and (max-width: 480px){.card[_ngcontent-%COMP%]{width:calc(100% - 20px);margin-top:5%}.card-container[_ngcontent-%COMP%]{margin-top:20%}}"]});let t=n;return t})();var B=(()=>{let n=class n{};n.\u0275fac=function(e){return new(e||n)},n.\u0275cmp=s({type:n,selectors:[["app-navbar"]],standalone:!0,features:[p],decls:8,vars:0,consts:[[1,"navbar"],[1,"navbar-brand"],["src","assets/logo.png","alt","Logo",1,"logo"],[1,"navbar-links"],["routerLink","/tv","routerLinkActive","active",1,"nav-link"],["routerLink","/movies","routerLinkActive","active",1,"nav-link"]],template:function(e,o){e&1&&(l(0,"nav",0)(1,"div",1),c(2,"img",2),r(),l(3,"div",3)(4,"a",4),h(5,"TV"),r(),l(6,"a",5),h(7,"Movies"),r()()())},dependencies:[d],styles:[".navbar[_ngcontent-%COMP%]{position:fixed;top:0;left:0;width:100%;display:flex;justify-content:space-between;align-items:center;padding:10px;background-color:#333;color:#fff;z-index:1000}.navbar-brand[_ngcontent-%COMP%]{display:flex;align-items:center}.logo[_ngcontent-%COMP%]{width:50px;height:auto;margin-right:10px}.navbar-links[_ngcontent-%COMP%]{display:flex;gap:20px;margin-right:10%}.nav-link[_ngcontent-%COMP%]{text-decoration:none;color:#fff;font-weight:700;margin-right:5%}.nav-link[_ngcontent-%COMP%]:hover{text-decoration:underline}"]});let t=n;return t})();var Q=(()=>{let n=class n{constructor(){this.title="justwatch2"}};n.\u0275fac=function(e){return new(e||n)},n.\u0275cmp=s({type:n,selectors:[["app-root"]],standalone:!0,features:[p],decls:6,vars:0,consts:[[1,"main"],[1,"header"],[1,"content"]],template:function(e,o){e&1&&(l(0,"main",0)(1,"div",1),c(2,"app-navbar"),r(),l(3,"div",2),c(4,"app-card-display"),r()(),c(5,"router-outlet"))},dependencies:[d,N,T,B],styles:[`[_nghost-%COMP%] {
    --bright-blue: oklch(51.01% 0.274 263.83);
    --electric-violet: oklch(53.18% 0.28 296.97);
    --french-violet: oklch(47.66% 0.246 305.88);
    --vivid-pink: oklch(69.02% 0.277 332.77);
    --hot-red: oklch(61.42% 0.238 15.34);
    --orange-red: oklch(63.32% 0.24 31.68);

    --gray-900: oklch(19.37% 0.006 300.98);
    --gray-700: oklch(36.98% 0.014 302.71);
    --gray-400: oklch(70.9% 0.015 304.04);

    --red-to-pink-to-purple-vertical-gradient: linear-gradient(
      180deg,
      var(--orange-red) 0%,
      var(--vivid-pink) 50%,
      var(--electric-violet) 100%
    );

    --red-to-pink-to-purple-horizontal-gradient: linear-gradient(
      90deg,
      var(--orange-red) 0%,
      var(--vivid-pink) 50%,
      var(--electric-violet) 100%
    );

    --pill-accent: var(--bright-blue);

    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1[_ngcontent-%COMP%] {
    font-size: 3.125rem;
    color: var(--gray-900);
    font-weight: 500;
    line-height: 100%;
    letter-spacing: -0.125rem;
    margin: 0;
    font-family: "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
  }

  p[_ngcontent-%COMP%] {
    margin: 0;
    color: var(--gray-700);
  }

  main[_ngcontent-%COMP%] {
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    box-sizing: inherit;
    position: relative;
  }

  .angular-logo[_ngcontent-%COMP%] {
    max-width: 9.2rem;
  }

  .content[_ngcontent-%COMP%] {
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 3rem;
  }

  .content[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {
    margin-top: 1.75rem;
  }

  .content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {
    margin-top: 1.5rem;
  }

  .divider[_ngcontent-%COMP%] {
    width: 1px;
    background: var(--red-to-pink-to-purple-vertical-gradient);
    margin-inline: 0.5rem;
  }

  .pill-group[_ngcontent-%COMP%] {
    display: flex;
    flex-direction: column;
    align-items: start;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .pill[_ngcontent-%COMP%] {
    display: flex;
    align-items: center;
    --pill-accent: var(--bright-blue);
    background: color-mix(in srgb, var(--pill-accent) 5%, transparent);
    color: var(--pill-accent);
    padding-inline: 0.75rem;
    padding-block: 0.375rem;
    border-radius: 2.75rem;
    border: 0;
    transition: background 0.3s ease;
    font-family: var(--inter-font);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.4rem;
    letter-spacing: -0.00875rem;
    text-decoration: none;
  }

  .pill[_ngcontent-%COMP%]:hover {
    background: color-mix(in srgb, var(--pill-accent) 15%, transparent);
  }

  .pill-group[_ngcontent-%COMP%]   .pill[_ngcontent-%COMP%]:nth-child(6n + 1) {
    --pill-accent: var(--bright-blue);
  }
  .pill-group[_ngcontent-%COMP%]   .pill[_ngcontent-%COMP%]:nth-child(6n + 2) {
    --pill-accent: var(--french-violet);
  }
  .pill-group[_ngcontent-%COMP%]   .pill[_ngcontent-%COMP%]:nth-child(6n + 3), .pill-group[_ngcontent-%COMP%]   .pill[_ngcontent-%COMP%]:nth-child(6n + 4), .pill-group[_ngcontent-%COMP%]   .pill[_ngcontent-%COMP%]:nth-child(6n + 5) {
    --pill-accent: var(--hot-red);
  }

  .pill-group[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {
    margin-inline-start: 0.25rem;
  }

  .social-links[_ngcontent-%COMP%] {
    display: flex;
    align-items: center;
    gap: 0.73rem;
    margin-top: 1.5rem;
  }

  .social-links[_ngcontent-%COMP%]   path[_ngcontent-%COMP%] {
    transition: fill 0.3s ease;
    fill: var(--gray-400);
  }

  .social-links[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover   svg[_ngcontent-%COMP%]   path[_ngcontent-%COMP%] {
    fill: var(--gray-900);
  }

  @media screen and (max-width: 650px) {
    .content[_ngcontent-%COMP%] {
      flex-direction: column;
      width: max-content;
    }

    .divider[_ngcontent-%COMP%] {
      height: 1px;
      width: 100%;
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      margin-block: 1.5rem;
    }
  }`]});let t=n;return t})();var G=[];var W={providers:[X(G),Y()]};var q={providers:[H()]},U=I(W,q);var V=()=>z(Q,U),In=V;export{In as a};
