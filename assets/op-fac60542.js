const s=r=>{let t="";const n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",c=n.length;for(let e=0;e<r;e++)t+=n.charAt(Math.floor(Math.random()*c));return t};var o=(r=>(r.Increment="increment",r.Decrement="decrement",r.Set="set",r.KV="kv",r))(o||{});const l={equals(r,t){return r===t||r[0]===t[0]&&r[1]===t[1]},compare(r,t){return r===t||r!==null&&t!==null&&r[0]===t[0]&&r[1]===t[1]},hash(r){return`${r[0]}:${r[1]}`}},u={in(r,t){if(r===null)return!0;const n=t[r[0]];return n!=null&&n>=r[1]}};export{l as I,o as O,u as V,s as r};
