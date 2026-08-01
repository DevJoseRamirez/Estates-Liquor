/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

// UNUSED EXPORTS: ProductCrossSell

;// ./node_modules/@lit/reactive-element/css-tag.js
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const css_tag_t=window,e=css_tag_t.ShadowRoot&&(void 0===css_tag_t.ShadyCSS||css_tag_t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;class o{constructor(t,e,n){if(this._$cssResult$=!0,n!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n.set(s,t))}return t}toString(){return this.cssText}}const r=t=>new o("string"==typeof t?t:t+"",void 0,s),i=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o(n,t,s)},S=(s,n)=>{e?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=css_tag_t.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n)}))},c=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r(e)})(t):t;
//# sourceMappingURL=css-tag.js.map

;// ./node_modules/@lit/reactive-element/reactive-element.js

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var reactive_element_s;const reactive_element_e=window,reactive_element_r=reactive_element_e.trustedTypes,h=reactive_element_r?reactive_element_r.emptyScript:"",reactive_element_o=reactive_element_e.reactiveElementPolyfillSupport,reactive_element_n={toAttribute(t,i){switch(i){case Boolean:t=t?h:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},a=(t,i)=>i!==t&&(i==i||t==t),l={attribute:!0,type:String,converter:reactive_element_n,reflect:!1,hasChanged:a},d="finalized";class u extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e))})),t}static createProperty(t,i=l){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e)}}static getPropertyDescriptor(t,i,s){return{get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l}static finalize(){if(this.hasOwnProperty(d))return!1;this[d]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c(i))}else void 0!==i&&s.push(c(i));return s}static _$Ep(t,i){const s=i.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t))}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i])}))}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}))}attributeChangedCallback(t,i,s){this._$AK(t,s)}_$EO(t,i,s=l){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:reactive_element_n).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:reactive_element_n;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek()}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s)}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}u[d]=!0,u.elementProperties=new Map,u.elementStyles=[],u.shadowRootOptions={mode:"open"},null==reactive_element_o||reactive_element_o({ReactiveElement:u}),(null!==(reactive_element_s=reactive_element_e.reactiveElementVersions)&&void 0!==reactive_element_s?reactive_element_s:reactive_element_e.reactiveElementVersions=[]).push("1.6.3");
//# sourceMappingURL=reactive-element.js.map

;// ./node_modules/lit-html/lit-html.js
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var lit_html_t;const lit_html_i=window,lit_html_s=lit_html_i.trustedTypes,lit_html_e=lit_html_s?lit_html_s.createPolicy("lit-html",{createHTML:t=>t}):void 0,lit_html_o="$lit$",lit_html_n=`lit$${(Math.random()+"").slice(9)}$`,lit_html_l="?"+lit_html_n,lit_html_h=`<${lit_html_l}>`,lit_html_r=document,lit_html_u=()=>lit_html_r.createComment(""),lit_html_d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,lit_html_c=Array.isArray,v=t=>lit_html_c(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),lit_html_a="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${lit_html_a}(?:([^\\s"'>=/]+)(${lit_html_a}*=${lit_html_a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,w=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=w(1),b=w(2),T=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),E=new WeakMap,C=lit_html_r.createTreeWalker(lit_html_r,129,null,!1);function P(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==lit_html_e?lit_html_e.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f?"!--"===c[1]?u=_:void 0!==c[1]?u=m:void 0!==c[2]?(y.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p):void 0!==c[3]&&(u=p):u===p?">"===c[0]?(u=null!=l?l:f,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p:'"'===c[3]?$:g):u===$||u===g?u=p:u===_||u===m?u=f:(u=p,l=void 0);const w=u===p&&t[i+1].startsWith("/>")?" ":"";r+=u===f?s+lit_html_h:v>=0?(e.push(d),s.slice(0,v)+lit_html_o+s.slice(v)+lit_html_n+w):s+lit_html_n+(-2===v?(e.push(void 0),i):w)}return[P(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V(t,i);if(this.el=N.createElement(a,e),C.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(h=C.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(lit_html_o)||i.startsWith(lit_html_n)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+lit_html_o).split(lit_html_n),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L:"@"===i[1]?z:k})}else v.push({type:6,index:r})}for(const i of t)h.removeAttribute(i)}if(y.test(h.tagName)){const t=h.textContent.split(lit_html_n),i=t.length-1;if(i>0){h.textContent=lit_html_s?lit_html_s.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],lit_html_u()),C.nextNode(),v.push({type:2,index:++r});h.append(t[i],lit_html_u())}}}else if(8===h.nodeType)if(h.data===lit_html_l)v.push({type:2,index:r});else{let t=-1;for(;-1!==(t=h.data.indexOf(lit_html_n,t+1));)v.push({type:7,index:r}),t+=lit_html_n.length-1}r++}}static createElement(t,i){const s=lit_html_r.createElement("template");return s.innerHTML=t,s}}function lit_html_S(t,i,s=t,e){var o,n,l,h;if(i===T)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=lit_html_d(i)?void 0:i._$litDirective$;return(null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=lit_html_S(t,r._$AS(t,i.values),r,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:lit_html_r).importNode(s,!0);C.currentNode=o;let n=C.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new R(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h]}l!==(null==u?void 0:u.index)&&(n=C.nextNode(),l++)}return C.currentNode=lit_html_r,o}v(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++}}class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=lit_html_S(this,t,i),lit_html_d(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==A&&lit_html_d(this._$AH)?this._$AA.nextSibling.data=t:this.$(lit_html_r.createTextNode(t)),this._$AH=t}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N.createElement(P(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else{const t=new M(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t}}_$AC(t){let i=E.get(t.strings);return void 0===i&&E.set(t.strings,i=new N(t)),i}T(t){lit_html_c(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(lit_html_u()),this.k(lit_html_u()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e)}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t))}}class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=lit_html_S(this,t,i,0),n=!lit_html_d(t)||t!==this._$AH&&t!==T,n&&(this._$AH=t);else{const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=lit_html_S(this,e[s+l],i,l),h===T&&(h=this._$AH[l]),n||(n=!lit_html_d(h)||h!==this._$AH[l]),h===A?t=A:t!==A&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h}n&&!e&&this.j(t)}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class H extends k{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===A?void 0:t}}const I=lit_html_s?lit_html_s.emptyScript:"";class L extends k{constructor(){super(...arguments),this.type=4}j(t){t&&t!==A?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name)}}class z extends k{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5}_$AI(t,i=this){var s;if((t=null!==(s=lit_html_S(this,t,i,0))&&void 0!==s?s:A)===T)return;const e=this._$AH,o=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t)}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){lit_html_S(this,t)}}const j={O:lit_html_o,P:lit_html_n,A:lit_html_l,C:1,M:V,L:M,R:v,D:lit_html_S,I:R,V:k,H:L,N:z,U:H,F:Z},B=lit_html_i.litHtmlPolyfillSupport;null==B||B(N,R),(null!==(lit_html_t=lit_html_i.litHtmlVersions)&&void 0!==lit_html_t?lit_html_t:lit_html_i.litHtmlVersions=[]).push("2.8.0");const D=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new R(i.insertBefore(lit_html_u(),t),t,void 0,null!=s?s:{})}return l._$AI(t),l};
//# sourceMappingURL=lit-html.js.map

;// ./node_modules/lit-element/lit-element.js

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var lit_element_l,lit_element_o;const lit_element_r=(/* unused pure expression or super */ null && (t));class lit_element_s extends u{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(i,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return T}}lit_element_s.finalized=!0,lit_element_s._$litElement$=!0,null===(lit_element_l=globalThis.litElementHydrateSupport)||void 0===lit_element_l||lit_element_l.call(globalThis,{LitElement:lit_element_s});const lit_element_n=globalThis.litElementPolyfillSupport;null==lit_element_n||lit_element_n({LitElement:lit_element_s});const lit_element_h={_$AK:(t,e,i)=>{t._$AK(e,i)},_$AL:t=>t._$AL};(null!==(lit_element_o=globalThis.litElementVersions)&&void 0!==lit_element_o?lit_element_o:globalThis.litElementVersions=[]).push("3.3.3");
//# sourceMappingURL=lit-element.js.map

;// ./node_modules/lit/index.js

//# sourceMappingURL=index.js.map

;// ./node_modules/lit-html/directive.js
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const directive_t={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},directive_e=t=>(...e)=>({_$litDirective$:t,values:e});class directive_i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
//# sourceMappingURL=directive.js.map

;// ./node_modules/lit-html/directives/unsafe-html.js

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class unsafe_html_e extends directive_i{constructor(i){if(super(i),this.et=A,i.type!==directive_t.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===A||null==r)return this.ft=void 0,this.et=r;if(r===T)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.et)return this.ft;this.et=r;const s=[r];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}}unsafe_html_e.directiveName="unsafeHTML",unsafe_html_e.resultType=1;const unsafe_html_o=directive_e(unsafe_html_e);
//# sourceMappingURL=unsafe-html.js.map

;// ./node_modules/lit-html/directives/unsafe-svg.js

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class unsafe_svg_t extends unsafe_html_e{}unsafe_svg_t.directiveName="unsafeSVG",unsafe_svg_t.resultType=2;const unsafe_svg_o=directive_e(unsafe_svg_t);
//# sourceMappingURL=unsafe-svg.js.map

;// ./node_modules/lit/directives/unsafe-svg.js

//# sourceMappingURL=unsafe-svg.js.map

;// ./node_modules/lit-html/directives/class-map.js

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const class_map_o=directive_e(class extends directive_i{constructor(t){var i;if(super(t),t.type!==directive_t.ATTRIBUTE||"class"!==t.name||(null===(i=t.strings)||void 0===i?void 0:i.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter((i=>t[i])).join(" ")+" "}update(i,[s]){var r,o;if(void 0===this.it){this.it=new Set,void 0!==i.strings&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in s)s[t]&&!(null===(r=this.nt)||void 0===r?void 0:r.has(t))&&this.it.add(t);return this.render(s)}const e=i.element.classList;this.it.forEach((t=>{t in s||(e.remove(t),this.it.delete(t))}));for(const t in s){const i=!!s[t];i===this.it.has(t)||(null===(o=this.nt)||void 0===o?void 0:o.has(t))||(i?(e.add(t),this.it.add(t)):(e.remove(t),this.it.delete(t)))}return T}});
//# sourceMappingURL=class-map.js.map

;// ./src/javascripts/utils.js
/**
 * Throttle execution of function
 *
 * @param {Function} callback function to be throttled
 * @param {number} interval milliseconds
 * @returns {Function}
 */
function throttle(callback, interval) {
  let enableCall = true;
  let calledWhenDisabled = false;


  return (...args) =>{
    const onTimeout = () => {
      if (calledWhenDisabled) {
        callback.apply(this, args);
        setTimeout(onTimeout, interval);
      } else {
        enableCall = true;
      }
      calledWhenDisabled = false;
    }

    if (!enableCall) {
      calledWhenDisabled = true;
      return;
    }

    enableCall = false;
    callback.apply(this, args);
    setTimeout(onTimeout, interval);
  }
}

/**
 * Take monetary value and format it as money
 *
 * @param {number | string} cents - Price in cents (hundreds of base unit)
 * @param {string} [format] - Format for money; store format will be used if undefined
 * @return {string} - HTML string with the formatted money value
 */
function formatMoney(cents, format) {
  var moneyFormat = format || '${{amount}}';
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = moneyFormat;

  function formatWithDelimiters(number, precision, thousands, decimal) {
    if (precision === null || precision === undefined) {
      precision = 2;
    }
    thousands = thousands || ',';
    decimal = decimal || '.';

    if (isNaN(number) || number == null) {
      return '0';
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.');
    var dollarsAmount = parts[0].replace(
      /(\d)(?=(\d{3})+(?!\d))/g,
      '$1' + thousands
    );
    var centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  var match = formatString.match(placeholderRegex);

  if (!match) {
    throw new Error(
      `Invalid format string: '${formatString}'. Expected '{{amount}}' or similar placeholders.`
    );
  }

  switch (match[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_with_space_separator':
      value = formatWithDelimiters(cents, 2, ' ', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ');
      break;
    default:
      throw new Error(`Unknown format type: ${match[1]}`);
  }

  return formatString.replace(placeholderRegex, value);
}

// FocusTrap class for managing focus within a container
class FocusTrap {
  /**
   * @param {HTMLElement} container - The container within which to trap focus.
   * @param {HTMLElement} [initialElement=null] - The element to focus initially. If not provided, the first focusable element is focused.
   * @param {Function} [onEscape=null] - Optional callback to execute when the Escape key is pressed.
   */
  constructor(container, initialElement = null, onEscape = null) {
    this.container = container;
    this.initialElement = initialElement;
    this.onEscape = onEscape;
    this.focusableElements = [];
    this.firstElement = null;
    this.lastElement = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updateFocusableElements = this.updateFocusableElements.bind(this);
    this.observer = new MutationObserver(this.updateFocusableElements);
    this.init();
  }

  /**
   * Initializes the focus trap by removing the 'inert' attribute,
   * updating focusable elements, setting initial focus, and attaching necessary event listeners.
   */
  init() {
    if (!this.container) return;

    // Remove the 'inert' attribute from the container
    this.container.removeAttribute('inert');

    this.updateFocusableElements();

    if (this.initialElement && this.isFocusable(this.initialElement)) {
      this.initialElement.focus();
    } else if (this.firstElement) {
      this.firstElement.focus();
    }

    this.container.addEventListener('keydown', this.handleKeyDown);
    this.observer.observe(this.container, { childList: true, subtree: true, attributes: true });
  }

  /**
   * Determines if an element is focusable.
   * @param {HTMLElement} el - The element to check.
   * @returns {boolean} - True if the element is focusable, else false.
   */
  isFocusable(el) {
    if (!el) return false;
    return (
      el.offsetParent !== null &&
      el.getAttribute('tabindex') !== '-1' &&
      !this.isInsideClosedDetails(el)
    );
  }

  /**
   * Determines if an element is inside a closed <details> element.
   * Allows <summary> elements to remain focusable even if their parent <details> is closed.
   * @param {HTMLElement} el - The element to check.
   * @returns {boolean} - True if inside a closed <details> and not a <summary>, else false.
   */
  isInsideClosedDetails(el) {
    let parent = el.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === 'details') {
        if (!parent.hasAttribute('open')) {
          // Allow the <summary> element itself to be focusable
          if (el.tagName.toLowerCase() === 'summary' && parent.querySelector('summary') === el) {
            return false;
          }
          return true;
        }
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Updates the list of focusable elements, excluding those inside closed <details> (except <summary>).
   */
  updateFocusableElements() {
    this.focusableElements = Array.from(this.container.querySelectorAll(
      'a[href], area[href], input:not([type=hidden]), select, textarea, button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], summary'
    )).filter(el => this.isFocusable(el));

    if (this.focusableElements.length > 0) {
      this.firstElement = this.focusableElements[0];
      this.lastElement = this.focusableElements[this.focusableElements.length - 1];
    } else {
      this.firstElement = null;
      this.lastElement = null;
      console.warn('No focusable elements found within the container.');
    }
  }

  /**
   * Handles the keydown event to trap focus within the container.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleKeyDown(e) {
    if (e.key === 'Tab') {
      if (this.focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === this.firstElement) {
          e.preventDefault();
          this.lastElement.focus();
        }
      } else { // Tab
        if (document.activeElement === this.lastElement) {
          e.preventDefault();
          this.firstElement.focus();
        }
      }
    } else if (e.key === 'Escape') {
      if (this.onEscape) {
        this.onEscape();
      }
    }
  }

  /**
   * Destroys the focus trap by removing event listeners and disconnecting observers.
   */
  destroy() {
    this.container.setAttribute('inert', '');
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.observer.disconnect();
  }
}

/**
 * CartManager - Centralized cart management utility for adding products to cart
 * Handles both single and multiple product additions with proper loading states,
 * cart drawer updates, and success messaging
 */
class CartManager {
  constructor() {
    this.cartType = document.getElementById('PageContainer')?.dataset.cartType;
    this.cartAction = document.getElementById('PageContainer')?.dataset.cartAction;
    this.languageUrl = document.getElementById('PageContainer')?.dataset.languageUrl;
    this.cartCountIndicator = document.querySelector('[data-cart-count-indicator]');
    
    // Get translations object
    this.wethemeGlobal = document.querySelector('script#wetheme-global');
    this.translations = this.wethemeGlobal ? JSON.parse(this.wethemeGlobal.textContent).translations : {};
  }

  /**
   * Add a single product to cart (equivalent to QuickAdd functionality)
   * @param {HTMLFormElement|FormData|Object} formOrData - Form element, FormData, or object with variant data
   * @param {HTMLElement} button - Button element for loading states
   * @param {Object} options - Additional options
   * @returns {Promise<Response>}
   */
  async addSingleProduct(formOrData, button, options = {}) {
    let variantId, quantity = 1;
    
    // Extract variant data based on input type
    if (formOrData instanceof HTMLFormElement) {
      const formData = new FormData(formOrData);
      variantId = formData.get('id');
      quantity = parseInt(formData.get('quantity') || '1', 10);
    } else if (formOrData instanceof FormData) {
      variantId = formOrData.get('id');
      quantity = parseInt(formOrData.get('quantity') || '1', 10);
    } else if (typeof formOrData === 'object') {
      variantId = formOrData.id || formOrData.variantId;
      quantity = formOrData.quantity || 1;
    }

    if (!variantId) {
      throw new Error('No variant ID provided');
    }

    const items = [{
      id: parseInt(variantId, 10),
      quantity
    }];

    return this.addItemsToCart(items, button, options);
  }

  /**
   * Add multiple products to cart
   * @param {Array} items - Array of {id, quantity} objects
   * @param {HTMLElement} button - Button element for loading states
   * @param {Object} options - Additional options
   * @returns {Promise<Response>}
   */
  async addMultipleProducts(items, button, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No items provided or invalid items array');
    }

    return this.addItemsToCart(items, button, options);
  }

  /**
   * Core method to add items to cart with fallback to individual additions
   * @param {Array} items - Array of {id, quantity} objects
   * @param {HTMLElement} button - Button element for loading states
   * @param {Object} options - Additional options
   * @returns {Promise<Response>}
   */
  async addItemsToCart(items, button, options = {}) {
    if (button) {
      this.showLoadingState(button);
    }

    try {
      // Try bulk add first
      const response = await this.performBulkAdd(items);
      
      if (response.ok) {
        await this.handleSuccess(button, response, options);
        return response;
      } else if (response.status === 422) {
        // Inventory error - try individual adds
        console.warn('Bulk add failed due to inventory constraints, trying individual adds...');
        const individualResponse = await this.addItemsIndividually(items);
        await this.handleSuccess(button, individualResponse, options);
        return individualResponse;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to add items to cart');
      }
    } catch (error) {
      // If bulk add fails, try individual adds
      console.warn('Bulk add failed, trying individual adds...', error);
      try {
        const individualResponse = await this.addItemsIndividually(items);
        await this.handleSuccess(button, individualResponse, options);
        return individualResponse;
      } catch (individualError) {
        if (button) {
          this.hideLoadingState(button);
        }
        throw individualError;
      }
    }
  }

  /**
   * Perform bulk cart addition
   * @param {Array} items - Array of {id, quantity} objects
   * @returns {Promise<Response>}
   */
  async performBulkAdd(items) {
    const payload = { items };
    
    // Add sections parameter for cart drawer
    if (this.cartType === 'drawer') {
      payload.sections = 'cart-drawer';
    }
    
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    };
    
    return fetch(window.routes.cart_add_url, config);
  }

  /**
   * Add items individually with error handling
   * @param {Array} items - Array of {id, quantity} objects
   * @returns {Promise<Response>}
   */
  async addItemsIndividually(items) {
    let lastSuccessfulResponse = null;
    let successfullyAdded = 0;
    let skippedItems = 0;

    for (const item of items) {
      try {
        const payload = { items: [item] };
        
        if (this.cartType === 'drawer') {
          payload.sections = 'cart-drawer';
        }
        
        const config = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        };
        
        const response = await fetch(window.routes.cart_add_url, config);
        
        if (response.ok) {
          successfullyAdded++;
          lastSuccessfulResponse = response;
        } else if (response.status === 422) {
          skippedItems++;
          console.warn(`Skipping item ${item.id} due to inventory constraints`);
        } else {
          const errorData = await response.json();
          console.error(`Failed to add item ${item.id}:`, errorData.description || 'Unknown error');
          skippedItems++;
        }
      } catch (error) {
        console.error(`Error adding item ${item.id}:`, error);
        skippedItems++;
      }
    }

    if (successfullyAdded === 0) {
      throw new Error('No items could be added to cart');
    }

    if (skippedItems > 0) {
      console.info(`Successfully added ${successfullyAdded} items, skipped ${skippedItems} items due to inventory or other issues`);
    }

    return lastSuccessfulResponse || { ok: true, status: 200 };
  }

  /**
   * Handle successful cart addition
   * @param {HTMLElement} button - Button element
   * @param {Response} response - Fetch response
   * @param {Object} options - Additional options
   */
  async handleSuccess(button, response, options = {}) {
    if (button) {
      this.hideLoadingState(button);
    }

    // Update cart drawer if needed
    if (this.cartType === 'drawer' && response && response.ok) {
      try {
        const responseJson = await response.clone().json();
        this.updateCartDrawer(responseJson);
      } catch (error) {
        // Response might already be consumed, continue without drawer update
        console.warn('Could not parse response for cart drawer update:', error);
      }
    }

    // Emit cart added event
    if (window.eventBus && options.sectionId) {
      window.eventBus.emit('cart:added', { sectionId: options.sectionId });
    }

    // Handle cart action and update count
    if (button) {
      this.handleCartAction(button);
    } else {
      this.updateCartCountIndicator();
    }
  }

  /**
   * Update cart drawer
   * @param {Object} responseJson - Cart response data
   */
  updateCartDrawer(responseJson) {
    if (window.eventBus) {
      window.eventBus.emit('update:cart:drawer', responseJson);
    }
  }

  /**
   * Handle cart action based on settings
   * @param {HTMLElement} button - Button element
   */
  handleCartAction(button) {
    if (this.cartType === 'drawer') {
      if (this.cartAction === 'show_added_message') {
        this.showAddedMessage(button);
        this.updateCartCountIndicator();
      } else if (this.cartAction === 'go_to_or_open_cart') {
        if (window.eventBus) {
          window.eventBus.emit('open:cart:drawer', { scrollToTop: true });
        }
        this.updateCartCountIndicator();
      }
    } else {
      if (this.cartAction === 'show_added_message') {
        this.showAddedMessage(button);
        this.updateCartCountIndicator();
      } else {
        window.location = window.routes.cart_url;
      }
    }
  }

  /**
   * Show "Added" message on button
   * @param {HTMLElement} button - Button element
   */
  showAddedMessage(button) {
    const addedTranslation = this.translations.added;
    
    // Check if this button uses the dynamic-section-button structure
    const buttonText = button.querySelector('[data-button-text]');
    const addedText = button.querySelector('[data-cart-added-text]');
    
    if (buttonText && addedText) {
      // Dynamic section button with added text support
      buttonText.style.visibility = 'hidden';
      addedText.style.display = 'block';
      
      setTimeout(() => {
        addedText.style.display = 'none';
        buttonText.style.visibility = '';
        button.disabled = false;
      }, 2000);
    } else if (buttonText) {
      // Dynamic section button without added text - create temporary overlay
      buttonText.style.visibility = 'hidden';
      
      const tempAddedText = document.createElement('span');
      tempAddedText.textContent = addedTranslation;
      tempAddedText.style.gridColumn = '1';
      tempAddedText.style.gridRow = '1';
      tempAddedText.classList.add('temp-added-text');
      button.appendChild(tempAddedText);
      
      setTimeout(() => {
        buttonText.style.visibility = '';
        tempAddedText.remove();
        button.disabled = false;
      }, 2000);
    } else {
      // Regular button - hide original content and overlay "Added" text
      const originalHTML = button.dataset.originalText || button.innerHTML;
      
      const originalContent = button.innerHTML;
      button.innerHTML = '';
      
      const hiddenContent = document.createElement('span');
      hiddenContent.innerHTML = originalContent;
      hiddenContent.style.visibility = 'hidden';
      hiddenContent.style.gridColumn = '1';
      hiddenContent.style.gridRow = '1';
      
      const addedContent = document.createElement('span');
      addedContent.textContent = addedTranslation;
      addedContent.style.gridColumn = '1';
      addedContent.style.gridRow = '1';
      addedContent.classList.add('temp-added-text');
      
      button.appendChild(hiddenContent);
      button.appendChild(addedContent);
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 2000);
    }
  }

  /**
   * Update cart count indicator
   */
  async updateCartCountIndicator() {
    if (!this.cartCountIndicator) return;
    
    try {
      const languageParam = !this.languageUrl || this.languageUrl === '/' ? '' : this.languageUrl;
      const response = await fetch(`${languageParam}/cart?view=compare`);
      const cart = await response.json();
      if (window.wetheme?.updateCartCount) {
        window.wetheme.updateCartCount(cart);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  /**
   * Show loading state on button
   * @param {HTMLElement} button - Button element
   */
  showLoadingState(button) {
    button.disabled = true;
    button.classList.add('loading');
    
    const buttonText = button.querySelector('[data-button-text]');
    const loadingIcon = button.querySelector('[data-loading-icon]');
    
    if (buttonText && loadingIcon) {
      // Dynamic section button with loading icon structure
      buttonText.style.visibility = 'hidden';
      loadingIcon.classList.remove('hidden');
    } else {
      // Regular button - store original text and show loading icon
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.innerHTML = `<svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" class="spin flex-full"><g clip-path="url(#clip0_3605_47041)"><path d="M12.5 23C6.42487 23 1.5 18.0751 1.5 12C1.5 5.92487 6.42487 1 12.5 1C18.5751 1 23.5 5.92487 23.5 12C23.5 15.1767 22.1534 18.0388 20 20.0468" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></g><defs><clipPath id="clip0_3605_47041"><rect width="24" height="24" fill="none" transform="translate(0.5)"/></clipPath></defs></svg>`;
    }
  }

  /**
   * Hide loading state on button
   * @param {HTMLElement} button - Button element
   */
  hideLoadingState(button) {
    button.disabled = false;
    button.classList.remove('loading');
    
    const buttonText = button.querySelector('[data-button-text]');
    const loadingIcon = button.querySelector('[data-loading-icon]');
    
    if (buttonText && loadingIcon) {
      // Dynamic section button with loading icon structure
      buttonText.style.visibility = '';
      loadingIcon.classList.add('hidden');
    } else {
      // Regular button - restore original text
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  }
}

;// ./src/javascripts/webcomponents/product-cross-sell.js
/* eslint-disable indent */





class ProductCrossSell extends lit_element_s {
  static get styles() {
    return i`
      :host {
        display: block;
        display: flex;
        flex-direction: columns;
        width: 100%;
      }

      .grid__image div.aspect-ratio--natural {
        display: flex;
      }

      .featured-image {
        width: 100%;
        height: auto;
      }

      svg.icon.icon--placeholder {
        background: #969696;  /* in line with img placeholder color */
        fill: #5D5D5D;        /* in line with img placeholder color */
        border: 1px solid #858585;    /* in line with img placeholder color */
      }

      .info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
        row-gap: 15px;
      }

      .info.vertical {
        flex-direction: column;
      }

      .product-info {
        width: 100%;
      }

      .title {
        display: inline;
        padding: 0 0 5px 0;
        font-size: var(--base-font-size);
        line-height: 1.6;
        color: var(--text-color);
        font-family: var(--body-font-stack);
        font-weight: var(--body-font-weight);
        font-style: var(--body-font-style);
      }

      .title a {
        color: var(--text-color);
        text-decoration: none;
        word-wrap: break-word;
        word-break: break-word;
      }

      .price {
        font-family: var(--header-font-stack);
        font-weight: var(--header-font-weight);
        font-style: var(--header-font-style);
        text-transform: var(--heading-font-case);
      }

      .price a {
        text-decoration: none;
        color: var(--text-color);
      }

      .price a .icon {
        display: inline-block;
        margin-right: 5px;
      }

      .price .price-line-through {
        text-decoration: line-through;
      }

      .price .money.sale-price {
        color: var(--text-color);
        opacity: .4;
        padding-right: 5px;
      }

      .price .money:not(.sale-price):not(.price-line-through) {
        color: var(--text-color);
      }

      .money.sale-price+.money:not(.sale-price):not(.price-line-through) {
        color: var(--on-sale-color);
      }

      .buttons {
        flex-shrink: 0;
        padding-left: 15px;
        display: flex;
        align-items: flex-end;
        padding-bottom: 1px;
      }

      .product-image {
        width: 90px;
        padding-right: 15px;
      }

      .product-image .grid__image {
        display: block;
        margin: 0 auto;
        clip-path: inset(0 round var(--thumbnail-border-radius));
      }

      .aspect-ratio:not(.aspect-ratio--natural) {
        position: relative;
        margin-left: auto;
        margin-right: auto;
      }

      .aspect-ratio.aspect-ratio--square {
        padding-bottom: 100%;
      }

      .aspect-ratio.aspect-ratio--tall {
        padding-bottom: 150%;
      }

      .aspect-ratio.aspect-ratio--wide {
        padding-bottom: 75%;
      }

      .aspect-ratio:not(.aspect-ratio--natural) img,
      .aspect-ratio:not(.aspect-ratio--natural) svg {
        width: 100%;
        height: 100%;
        -o-object-fit: cover;
        object-fit: cover;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
      }

      @media only screen and (max-width: 989px) {
        .info .product-info {
          width: 100%;
          padding-right: 0;
        }

        .buttons {
          padding-left: 0;
        }

        .buttons button.text-link-animated,
        .buttons a.text-link-animated {
          margin-left: 0;
        }
      }

      button.disabled {
        pointer-events: none;
      }

      button.unavailable {
        opacity: .50;
        pointer-events: none;
      }

      .lds-dual-ring {
        display: inline-block;
        width: 15px;
        height: 15px;
      }

      .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 3px solid #000;
        border-color: var(--text-color) transparent var(--text-color) transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }

      @keyframes lds-dual-ring {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      button.text-link-animated .cross-sells__button-label,
      a.text-link-animated .cross-sells__button-label {
        display: inline-flex;
        text-decoration: none;
        padding-bottom: 2px;
        position: relative;
        background: linear-gradient(to top, var(--text-color-transparent5) 0, var(--text-color-transparent5) 0), linear-gradient(to top, currentColor 0, currentColor 0);
        background-size: 100% 0.1em, 0 0.1em;
        background-position: 100% 100%, 0 100%;
        background-repeat: no-repeat;
        transition-property: background-size;
        transition-timing-function: ease;
        transition-duration: .25s;
        text-transform: var(--button-text-case);

        &:hover,
        &:focus {
          background-size: 0 0.1em, 100% 0.1em;
        }

        .cross-sells__button-label--content {
          display: inline-flex;
          gap: 10px;

          svg {
            display: block;
          }
        }
      }

      a.text-link-animated .cross-sells__button-label .text {
        line-height: normal;
      }

      .cross-sells__button-label--content .icon {
        display: flex;
        align-items: center;
        color: currentColor;
      }

      .cross-sells__button-label--content .icon svg {
        min-width: 16px;
        min-height: 16px;
        max-width: 16px;
        max-height: 16px;
        width: 16px;
        height: 16px;
        display: inline-block;
        margin: 0;
      }

      button.text-link-animated,
      a.text-link-animated {
        display: block;
        cursor: pointer;
        margin-left: auto;
        letter-spacing: var(--button-text-spacing-px);
        font-size: var(--button-font-size-px);
        text-transform: var(--button-text-case);
        height: 18px;
        color: var(--text-color);
        border: none;
        background: 0 0;
        font-family: var(--body-font-stack);
        font-weight: var(--body-font-weight);
        font-style: var(--body-font-style);
        padding: 0;
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      select {
        appearance: none;
        background-color: transparent;
        border: none;
        padding: 6px 1em 6px 6px;
        margin: 0;
        width: 100%;
        font-family: inherit;
        font-size: 0.85rem;
        cursor: inherit;
        line-height: inherit;
        outline: none;
        border: 1px solid var(--border-color);
      }

      .not-available {
        font-weight: bold;
        text-align: center;
        padding: 2px 6px;
        margin-bottom: 8px;
        opacity: 0.6;
        border: 1px solid var(--border-color);
        width: 100%;
      }

      .select-wrapper {
        position: relative;
        margin-top: 8px;
      }

      .select-wrapper button {
        text-align: left;
        border: 1px solid var(--border-color);
        border-radius: var(--input-border-radius);
        padding: 8px 36px 8px 10px;
        position: relative;
        background: none;
        min-width: 100%;
        z-index: 1;
        font-size: var(--base-font-size);
        font-family: var(--body-font-stack);
        font-weight: var(--body-font-weight);
        font-style: var(--body-font-style);
        display: grid;
        cursor: pointer;
        line-height: 1.6;
      }

      .select-wrapper--borders-round button {
        padding-left: 15px;
      }

      .select-wrapper button span {
        overflow: hidden;
        width: 100%;
        color: var(--text-color);
      }

      .select-wrapper button .icon {
        position: absolute;
        width: auto;
        display: flex;
        height: 100%;
        right: 0;
        align-items: center;
        color: currentColor;
      }

      .select-wrapper button .chevron {
        min-width: 16px;
        min-height: 16px;
        max-width: 16px;
        max-height: 16px;
        width: 16px;
        height: 16px;
        display: inline-block;
        margin-right: 10px;
        margin-left: 10px;
      }

      .select-wrapper button.open .chevron {
        transform: rotate(180deg);
      }

      ul {
        display: none;
        flex-direction: column;
        text-align: left;
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% - 1px);
        bottom: auto;
        list-style: none;
        margin: 0;
        padding: 0;
        color: var(--text-color);
        background-color: var(--body-color);
        border: 1px solid var(--border-color);
        border-radius: var(--input-border-radius);
        clip-path: inset(0 round var(--input-border-radius));
        max-height: 40vh;
        overflow: auto;
        max-height: calc( (var(--base-font-size) * 3) + 69px );
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        z-index: 0;
        pointer-events: none;
      }

      .select-wrapper--borders-round ul,
      .select-wrapper--borders-curved ul,
      .select-wrapper--borders-subtle ul {
        top: calc(100% + 2px);
      }

      ul::-webkit-scrollbar {
        width: 3px;
      }
      
      /* Track */
      ul::-webkit-scrollbar-track {
        background: var(--text-color-transparent30);
      }
      
      /* Handle */
      ul::-webkit-scrollbar-thumb {
        background: var(--text-color-transparent5);
      }

      @supports (-webkit-touch-callout: none) {
        ul {
          top: top: calc(100% - 2px);
          width: 100%;
        }
      }

      ul.open {
        display: flex;
        opacity: 1;
        z-index: 3;
        pointer-events: all;
      }

      ul li {
        font-size: var(--base-font-size);
        padding: 8px 10px;
        margin: 0;
        font-family: inherit;
        font-weight: inherit;
        font-weight: inherit;
        line-height: 1.6;
        cursor: pointer;
        word-wrap: break-word;
        word-break: break-word;
      }

      ul li:hover,
      ul li.selected {
        background-color: var(--filter-bg-color);
      }

      .select-wrapper--borders-round ul li {
        padding: 8px 15px;
      }

      .spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        
        to {
          transform: rotate(360deg);
        }
      }
    `;
  }

  static properties = {
    button: { type: String },
    variant: { type: String },
    optionSelects: { type: Array },
    productSelects: { type: Array },
    selectButtonLabels: { type: Array },
    currentVariant: { type: Array },
    featuredImage: { type: String },
    allOptionsChosen: { type: Boolean },
    focusedIndex: { type: Array },
    productUrl: { type: String }
  };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();    // called so the standard Lit functionality is maintained

    this.addToCart = this.dataset.addToCart;
    this.shoppingBagIcon = this.dataset.shoppingBagIcon;
    this.dropdownChevron = this.dataset.dropdownChevron;
    this.loginToOrderIcon = this.dataset.loginToOrderIcon;
    this.soldOut = this.dataset.soldOut;
    this.chooseOption = this.dataset.chooseOption;
    this.from = this.dataset.from;
    this.notAvailable = this.dataset.notAvailable;
    this.added = this.dataset.added;
    this.loading = this.dataset.loading;
    this.productRegularPrice = this.dataset.productsRegularPrice;
    this.productPriceDisplay = this.dataset.productPriceDisplay;
    this.showMaxPrice = this.dataset.showMaxPrice;
    this.loginToOrder = this.dataset.loginToOrder === 'true';
    this.loginToOrderLabel = this.dataset.loginToOrderLabel;
    this.loginToOrderHref = this.dataset.loginToOrderHref;
    this.productData = JSON.parse(this.getAttribute('product'));
    this.moneyFormat = this.getAttribute('money-format');
    this.currentVariant = this._firstAvailableVariant();
    this.productImagePlaceholder = this.getAttribute('product-image-placeholder');
    this.imageAspectRatio = this.getAttribute('image-aspect-ratio');
    this.imageSrcSet = this.getAttribute('image-srcset');
    this.borderRadius = this.getAttribute('border-radius');
    this.defaultImage = this.productData.featured_image;
    this.featuredImage = this.defaultImage;
    this.optionSelects = [];
    this.productSelects = [];
    this.button = this._getButton();
    this.focusedIndex = this.productData.options.map(() => -1);
    this.selectButtonLabels = [...this.productData.options];
    this.allOptionsChosen = !this.productData.options.some((r) =>
      this.selectButtonLabels.includes(r)
    );
    this.cartAction = document.getElementById('PageContainer').dataset.cartAction;
    this.cartType = document.getElementById('PageContainer').dataset.cartType;
    this.showCurrencyCode = document.getElementById('PageContainer').dataset.showCurrencyCode;
    this.currencyCode = document.getElementById('PageContainer').dataset.currencyCode;
    this.productUrl = this.dataset.productUrl;

    // Auto-select single option if there's only one dropdown with one option
    if (this._productHasVariants()) {
      // Auto-select single option if there's only one dropdown with one option
      if (this._productHasVariants() && this.productData.options.length === 1) {
        this._checkOptions();
        if (this.productSelects.length === 1 && this.productSelects[0].options.length === 1) {
          this._getOptions();
          this.selectButtonLabels[0] = this.optionSelects[0].options[0];
          this.allOptionsChosen = true;
          this.focusedIndex[0] = 0;
          const title = this.selectButtonLabels[0];
          const variant = this.productData.variants.find((obj) => obj.title === title);
          if (variant) {
            this.currentVariant = variant;
            if (this.currentVariant.featured_image) {
              this.featuredImage = this.currentVariant.featured_image.src;
            }
          }
          this.button = this._getButton(true);
        }
      }
    }

    this.addEventListener('animationend', () => {
      this.removeAttribute('data-animate-nested');
      this.removeAttribute('data-animate');
    });
  }

  // Check options without setting up UI
  _checkOptions() {
    let optionsDeDupe = [];

    for (const [optionIndex, option] of Object.entries(this.productData.options)) {
      optionsDeDupe[optionIndex] = {
        label: '',
        options: []
      };

      let theseOptions = [];
      for (const variant of this.productData.variants) {
        theseOptions.push(variant[`option${parseInt(optionIndex) + 1}`]);
      }

      let uniqueOptions = [...new Set(theseOptions)];
      optionsDeDupe[optionIndex].label = option;
      optionsDeDupe[optionIndex].options = uniqueOptions;
    }

    this.productSelects = optionsDeDupe;
  }

  _firstAvailableVariant() {
    const available = this.productData.variants.find((variant) => {
      return variant.available;
    });

    if(available) {
      return available;
    }

    // Return the first variant if none are available.
    return this.productData.variants[0];
  }

  // Return an image URL with size parameter.
  _imageAtSize(url, size) {
    if(!url) return;

    let fullFileName = url;
    fullFileName = fullFileName.replace(/_([0-9]+x+)/, '')
    let separatorIndex = fullFileName.lastIndexOf('.');
    let fileName = fullFileName.substr(0, separatorIndex);
    let extension = fullFileName.substr(separatorIndex);
    let updatedURL = `${fileName}_${size}${extension}`;

    return updatedURL;
  }

  _renderStringWithIcon(string, icon) {
    return x`
      <span class="cross-sells__button-label--content"><span class="icon">${unsafe_svg_o(icon)}</span><span class="text">${string}</span></span>
    `;
  }

  _productHasVariants() {
    return this.productData.variants[0].public_title !== null;
  }

  // Disable atc button and display loading animation.
  _disableButton() {
    this.button = x`
      <button
        type="button"
        class="disabled text-link-animated"
        disabled
        aria-label="${this.loading}"
      >
        <svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" class="spin"><g clip-path="url(#clip0_3605_47041)"><path d="M12.5 23C6.42487 23 1.5 18.0751 1.5 12C1.5 5.92487 6.42487 1 12.5 1C18.5751 1 23.5 5.92487 23.5 12C23.5 15.1767 22.1534 18.0388 20 20.0468" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></g><defs><clipPath id="clip0_3605_47041"><rect width="24" height="24" fill="none" transform="translate(0.5)"/></clipPath></defs></svg>
        <span class="sr-only">${this.loading}</span>
      </button>
    `;
  }

  _enableButton() {
    this.button = this._getButton(true);
  }

  _addedButton() {
    this.button = x`
      <button
        type="button"
        class="disabled text-link-animated"
        disabled
        aria-label="${this.added}"
      >
      <span class="cross-sells__button-label">${this.added}</span>
      </button>
    `;
  }

  // Return the appropriate button.
  _getButton(showAdd = false) {
    // if login to order applies, show the login to order button
    if (this.loginToOrder) {
      return x`
        <a
          href="${this.loginToOrderHref}"
          class="text-link-animated"
          aria-label="${this.loginToOrderLabel}"
        >
          <span class="cross-sells__button-label">${this._renderStringWithIcon(this.loginToOrderLabel, this.loginToOrderIcon)}</span>
        </a>
      `;
    }

    // Options are shown but current variant is sold out.
    if (!this.currentVariant.available && this.optionSelects.length > 0) {
      return x`
        <button
          type="button"
          @click=${() => this._handleButtonClick()}
          class="unavailable text-link-animated"
          aria-label="${this.soldOut}"
        >
        <span class="cross-sells__button-label">${this.soldOut}</span>
        </button>
      `;
    }

    // If there is a variant, allow a selection.
    if (
      (this._productHasVariants() && !showAdd && !this.allOptionsChosen) ||
      !this.currentVariant.available
    ) {

      return x`
        <button
          type="button"
          @click=${() => this._handleButtonClick()}
          class="text-link-animated"
          aria-label="${this.chooseOption}"
        >
          <span class="cross-sells__button-label">${this._renderStringWithIcon(this.chooseOption, this.shoppingBagIcon)}</span>
        </button>
      `;
    }

    // If we have a variant selected, show 'Add to cart'.
    return x`
      <button
        type="button"
        @click=${() => this._handleButtonClick()}
        class="action-add text-link-animated"
        aria-label="${this.addToCart}"
      >
        <span class="cross-sells__button-label">${this._renderStringWithIcon(this.addToCart, this.shoppingBagIcon)}</span>
      </button>
    `;
  }

  // Build out a set of options for the <select>s.
  _getOptions() {
    let optionsDeDupe = [];

    // Create array of objects for options.
    for (const [optionIndex, option] of Object.entries(
      this.productData.options
    )) {
      optionsDeDupe[optionIndex] = {
        label: '',
        options: []
      };

      // Deduplicate variant labels for this option.
      let theseOptions = [];
      for (const [variantIndex, variant] of Object.entries(
        this.productData.variants
      )) {
        theseOptions.push(variant[`option${parseInt(optionIndex) + 1}`]);
      }

      let uniqueOptions = [...new Set(theseOptions)];
      optionsDeDupe[optionIndex].label = option;
      optionsDeDupe[optionIndex].options = uniqueOptions;
    }

    this.optionSelects = optionsDeDupe;
  }

  // Add 1 of current variant to cart.
  async _addToCart() {
    let formData = {
      items: [
        {
          id: this.currentVariant.id,
          quantity: 1
        }
      ]
    };

    if(this.cartType == 'drawer') {
      formData['sections'] = 'cart-drawer';
    }

    try {
      const fetchResult = await window.fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseJson = await fetchResult.json();

      if (!fetchResult.ok) {
        console.error('Unable to add to cart: ', responseJson);
      } else {
        this._updateCart(responseJson);
        return responseJson;
      }
    } catch (e) {
      console.error('Unable to add to cart: ', e);
    }
  }

  async _updateCart(responseJson) {
    if(this.cartType == 'drawer') {
      window.eventBus.emit('update:cart:drawer', responseJson);
    }

    const cart = await (await fetch('/cart.js')).json();

    if(this.cartType == 'drawer' && this.cartAction == 'go_to_or_open_cart') {
      window.eventBus.emit('open:cart:drawer', { scrollToTop: true });
    }

    window.wetheme.updateCartCount(cart);
  }

  async _handleButtonClick() {
    if (!this._productHasVariants() || this.allOptionsChosen) {
      // Loading animation & disable button.
      this._disableButton();

      let json = await this._addToCart();

      this._addedButton();
      setTimeout(() => this._enableButton(), 3000);
    } else {
      const selectButtons = this.renderRoot.querySelectorAll('.select-button');
      if (selectButtons.length === 0) {
        this._getOptions();
        
        // Check if all options have only one value
        const allSingleValue = this.optionSelects.every(select => select.options.length === 1);
        
        if (allSingleValue) {
          // Handle like a single option with one value
          const variantOptions = this.optionSelects.map(select => select.options[0]);
          const title = variantOptions.join(' / ');
          this.optionSelects.forEach((select, index) => {
            this.selectButtonLabels[index] = select.options[0];
            this.focusedIndex[index] = 0;
          });
          this.allOptionsChosen = true;
          const variant = this.productData.variants.find((obj) => obj.title === title);
          if (variant) {
            this.currentVariant = variant;
            if (this.currentVariant.featured_image) {
              this.featuredImage = this.currentVariant.featured_image.src;
            }
          }
          this.button = this._getButton(true);
          return;
        }
        
        // Otherwise, just pre-select any single-value options
        this.optionSelects.forEach((select, index) => {
          if (select.options.length === 1) {
            this.selectButtonLabels[index] = select.options[0];
            this.focusedIndex[index] = 0;
          }
        });
        return;
      }
      const firstNotSelectedOption = Array.from(selectButtons).find(input => input.value === input.getAttribute('aria-label'));
      firstNotSelectedOption.focus();
    }
  }

  _toggleDropdown(index) {
    const thisBtn = this.renderRoot.querySelector(`#option-${index}`);
    thisBtn.classList.toggle('open');
    const thisUl = this.renderRoot.querySelector(`#ul-${index}`);
    thisUl.classList.toggle('open');
  }

  _closeDropdown(index) {
    const thisBtn = this.renderRoot.querySelector(`#option-${index}`);
    thisBtn.classList.remove('open');
    const thisUl = this.renderRoot.querySelector(`#ul-${index}`);
    thisUl.classList.remove('open');
  }

  _openDropdown(index) {
    const thisBtn = this.renderRoot.querySelector(`#option-${index}`);
    thisBtn.classList.remove('open');
    const thisUl = this.renderRoot.querySelector(`#ul-${index}`);
    thisUl.classList.remove('open');
    return;
  }

  _findVariantIndex(option, optionIndex) {
    var index;
    this.optionSelects[optionIndex].options.forEach(function (o, i) {
      if (o === option) {
        index = i;
      }
    });
    return index;
  }

  _updateSelectedIndex(updatedOptionIndex, selectIndex) {
    const ul = this.renderRoot.querySelector(`#ul-${selectIndex}`);
    const lis = ul.querySelectorAll('li');
    lis[this.focusedIndex[selectIndex]]?.classList.remove('selected');
    if (updatedOptionIndex >= 0 && updatedOptionIndex < lis.length) {
      this.focusedIndex[selectIndex] = updatedOptionIndex;
      lis[this.focusedIndex[selectIndex]].classList.add('selected');
    } else {
      this.focusedIndex[selectIndex] = -1;
    }
  }

  async _handleOptionClick(value, index) {
    // Replace text & value of button.
    this.selectButtonLabels[index] = value;

    this._updateSelectedIndex(this._findVariantIndex(value, index), index);

    // Reactive properties in render() don't trigger an update if
    // they're nested in a .map.
    await this.update();

    const selects = this.renderRoot.querySelectorAll('.select-button');
    const unorderedList = this.renderRoot.querySelector(`#ul-${index}`);
    const lis = unorderedList.querySelectorAll(`#ul-${index} li`);
    lis.forEach(li => li.getAttribute('aria-label') === value ? li.classList.add('selected') : li.classList.remove('selected'));

    // Only select a new variant if ALL options have been chosen.
    this.allOptionsChosen = !this.productData.options.some((r) =>
      this.selectButtonLabels.includes(r)
    );

    if (!this.allOptionsChosen) {
      if(unorderedList.classList.contains('open')) Array.from(selects).find((select) => select.value === select.getAttribute('aria-label')).focus();
      return;
    }

    // Find product variable based on current option choices.
    let vals = [];

    for (const [index, selectButton] of Object.entries(selects)) {
      vals.push(selectButton.value);
    }

    const title = vals.join(' / ');
    const variant = this.productData.variants.find((obj) => obj.title == title);

    if (variant) {
      this.currentVariant = variant;

      if (this.currentVariant.featured_image) {
        this.featuredImage = this.currentVariant.featured_image.src;
      }
    } else {
      // No matching variant found in the product JSON.
      // Fake the unavailable status to trigger disabling atc button.
      this.currentVariant = {
        available: false
      };

      this.featuredImage = this.defaultImage;
    }

    this.button = this._getButton(this.currentVariant.available);
  }

  async _moveFocusedIndex(e) {
    let focusedIndex = this.focusedIndex[e.target.dataset.index];
    const ul = this.renderRoot.querySelector(`#ul-${e.target.dataset.index}`);
    const lis = ul.querySelectorAll('li');
    let newFocusedIndex;
    let focusedOption;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newFocusedIndex = focusedIndex + 1;
        if (newFocusedIndex >= 0 && newFocusedIndex < lis.length) {

          if(ul.classList.contains('open') === false) {
            focusedOption = this.optionSelects[e.target.dataset.index].options[newFocusedIndex];
            this._handleOptionClick(focusedOption, e.target.dataset.index);  
          } else {
            this._updateSelectedIndex(newFocusedIndex, e.target.dataset.index);
          }
        }

        break;
      case 'ArrowUp':
        e.preventDefault();
        newFocusedIndex = focusedIndex - 1;
        if (newFocusedIndex >= 0 && newFocusedIndex < lis.length) {

          if(ul.classList.contains('open') === false) {
            focusedOption = this.optionSelects[e.target.dataset.index].options[newFocusedIndex];
            this._handleOptionClick(focusedOption, e.target.dataset.index);  
          } else {
            this._updateSelectedIndex(newFocusedIndex, e.target.dataset.index);
          }
        }

        break;
      case 'Enter':
        if(ul.classList.contains('open') === false) {
          this._openDropdown(e.target.dataset.index);
        } else {
          // Select this option.
          focusedOption = this.optionSelects[e.target.dataset.index].options[
            this.focusedIndex[e.target.dataset.index]
          ];
          if(focusedOption) this._handleOptionClick(focusedOption, e.target.dataset.index);
        }
        break;
      case ' ':
        // Spacebar key
        if(ul.classList.contains('open') === false) {
          this._openDropdown(e.target.dataset.index);
        } else {
          // Select this option.
          focusedOption = this.optionSelects[e.target.dataset.index].options[
            this.focusedIndex[e.target.dataset.index]
          ];
          if(focusedOption) this._handleOptionClick(focusedOption, e.target.dataset.index);
        }
        break;
      case 'Escape':
        // Close the dropdown
        this._closeDropdown(e.target.dataset.index);
        break;
      default:
        break;
    }
  }

  render() {
    if (this.productData.available === false) {
      if (window.Shopify.designMode) {
        return x`
          <div class="not-available">
            ${this.productData.title} ${this.notAvailable}.
          </div>
        `;
      }

      return;
    }

    const optionsList = (option, index) => {
      const sanitizedId = encodeURIComponent(option.replace(' ', '')).toLowerCase();

      return x`
        <li
          id="${sanitizedId}"
          @mousedown=${() => this._handleOptionClick(option, index)}
          key="${sanitizedId}"
          aria-label="${option}"
        >
          ${option}
        </li>
      `;
    };

    return x`
      <div class="product-image">
        <a href="${this.productUrl}" class="grid__image" target="_blank" rel="noopener" title="Opens ${this.productData.title} in a new tab">
          <div class="aspect-ratio aspect-ratio--${this.imageAspectRatio}">
            ${this.defaultImage != null ? x`
              <img
                class="featured-image"
                loading="lazy"
                srcset="
                  ${this.imageSrcSet}
                "
                sizes="(min-width: 1200px) 300px, (min-width: 750px) 200px, 100px"
                src="${this.featuredImage}"
                alt="${this.currentVariant.title}"
                width="90px"
              />
            `: x`${unsafe_svg_o(this.productImagePlaceholder)}`}
          </div>
        </a>
      </div>
      <div class="${class_map_o({info: true, vertical: this.optionSelects.length > 0})}">
        <div class="product-info">
          <div class="title">
            <a
              href="${this.productUrl}"
              target="_blank"
              rel="noopener"
              title="Opens ${this.productData.title} in a new tab"
              >${this.productData.title}</a
            >
          </div>
          ${!this.loginToOrder ? x`
            <div class="price">
              ${this.currentVariant.available
                ? x`
                  <a href="${this.productUrl}" target="_blank" title="Opens ${this.productData.title} in a new tab">
                    ${this.productData.price_varies && this._productHasVariants() && this.showMaxPrice == 'false' && !this.allOptionsChosen ? this.from : ''}
                    ${this.showMaxPrice == 'false' && !this.allOptionsChosen && this.productData.compare_at_price_min > this.productData.price_min ? x`
                      <span class="money price-line-through sale-price">
                      <span class="sr-only">${this.productRegularPrice}</span>
                        ${formatMoney(this.productData.compare_at_price_min, this.moneyFormat)}
                        ${this.showCurrencyCode == 'true' ? x`<span class="currency-code">${this.currencyCode}</span>` : ''}
                      </span>`
                    : this.showMaxPrice == 'true' && !this.allOptionsChosen && this.productData.compare_at_price_max > this.productData.price_max ? x `
                      <span class="money price-line-through sale-price">
                      <span class="sr-only">${this.productRegularPrice}</span>
                        ${formatMoney(this.productData.compare_at_price_max, this.moneyFormat)}
                        ${this.showCurrencyCode == 'true' ? x`<span class="currency-code">${this.currencyCode}</span>` : ''}
                      </span>`
                    :this.currentVariant.compare_at_price > this.currentVariant.price ? x`
                      <span class="money price-line-through sale-price">
                      <span class="sr-only">${this.productRegularPrice}</span>
                        ${formatMoney(this.currentVariant.compare_at_price, this.moneyFormat)}
                        ${this.showCurrencyCode == 'true' ? x`<span class="currency-code">${this.currencyCode}</span>` : ''}
                      </span>
                      ` : ''
                    }

                    ${this.showMaxPrice == 'false' && !this.allOptionsChosen ? x`
                      <span class="money">
                        ${formatMoney(this.productData.price_min, this.moneyFormat)}
                        ${this.showCurrencyCode == 'true' ? x`<span class="currency-code">${this.currencyCode}</span>` : ''}
                      </span>
                    ` 
                    : this.showMaxPrice == 'true' && !this.allOptionsChosen ? x`
                      <span class="money">
                        ${formatMoney(this.productData.price_max, this.moneyFormat)}
                        ${this.showCurrencyCode == 'true' ? x`<span class="currency-code">${this.currencyCode}</span>` : ''}
                      </span>
                    ` 
                    : x`
                      <span class="money">
                        ${formatMoney(this.currentVariant.price, this.moneyFormat)}
                        ${this.showCurrencyCode == 'true' ? x`<span class="currency-code">${this.currencyCode}</span>` : ''}
                      </span>
                    `}
                  </a>
                `
                : x`<span>Sold out</span>`
              }
            </div>
          ` : ''}
          ${this.optionSelects.length > 0 ? x`
            <div class="options">
              ${this.optionSelects.map((item, index) => {

                return x`
                  <div class="select-wrapper select-wrapper--borders-${this.borderRadius}">
                    <button
                      class="alt-focus select-button"
                      id="option-${index}"
                      value="${this.selectButtonLabels[index]}"
                      type="button"
                      readonly="true"
                      tabindex="0"
                      aria-haspopup="listbox"
                      aria-label="${item.label}"
                      aria-controls="ul-${index}"
                      data-index="${index}"
                      @click=${() => this._toggleDropdown(index)}
                      @blur=${() => this._closeDropdown(index)}
                      @keydown="${this._moveFocusedIndex}"
                    >
                      <span>
                        ${item.options.length === 1 ? item.options[0] : this.selectButtonLabels[index]}
                      </span>
                      <span class="icon inline-icon--wrapper dropdown-icon">
                        ${unsafe_svg_o(this.dropdownChevron)}
                      </span>
                    </button>
                    <ul
                      role="listbox"
                      tabindex="0"
                      id="ul-${index}"
                    >
                      ${item.options.map((option) => optionsList(option, index))}
                    </ul>
                  </div>
                `;
              })}
            </div>
          ` : ''}
        </div>
        <div class="buttons">
          ${this.button}
        </div>
      </div>
    `;
  }
}

// Only define the custom element if it doesn't already exist
if (!customElements.get('product-cross-sell')) customElements.define('product-cross-sell', ProductCrossSell);

/******/ })()
;