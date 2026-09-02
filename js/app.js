const services=[
 {id:"netflix",name:"Netflix",category:"streaming",description:"Entertainment",price:65,initial:"N"},
 {id:"prime",name:"Prime Video",category:"streaming",description:"Entertainment",price:80,initial:"P"},
 {id:"spotify",name:"Spotify",category:"music",description:"Music",price:65,initial:"S"},
 {id:"showmax",name:"Showmax",category:"streaming",description:"Entertainment",price:75,initial:"S"}
];

const selected=new Set();
let category="all";
const cards=document.getElementById("cards");
const count=document.getElementById("count");
const cartbar=document.getElementById("cartbar");
const cartItems=document.getElementById("cartItems");
const cartNames=document.getElementById("cartNames");
const total=document.getElementById("total");
const continueBtn=document.getElementById("continue");

const money=n=>"K"+n.toLocaleString();

function render(){
 const list=category==="all"?services:services.filter(x=>x.category===category);
 cards.innerHTML="";
 list.forEach(s=>{
  const on=selected.has(s.id);
  const el=document.createElement("article");
  el.className="card"+(on?" selected":"");
  el.setAttribute("role","checkbox");el.setAttribute("aria-checked",on);el.tabIndex=0;
  el.innerHTML=`<span class="check">${on?"✓":""}</span><div class="card-icon">${s.initial}</div><h3>${s.name}</h3><p>${s.description}</p><div class="price">${money(s.price)} <small>/ month</small></div>`;
  const toggle=()=>{selected.has(s.id)?selected.delete(s.id):selected.add(s.id);render();update()};
  el.onclick=toggle;
  el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}};
  cards.appendChild(el);
 });
}
function update(){
 const chosen=services.filter(s=>selected.has(s.id));
 const sum=chosen.reduce((a,s)=>a+s.price,0),n=chosen.length;
 count.textContent=n+" selected";
 cartItems.textContent=n+" service"+(n===1?"":"s")+" selected";
 cartNames.textContent=n?chosen.map(s=>s.name).join(" • "):"Choose a service to begin";
 total.textContent=money(sum);
 continueBtn.disabled=!n;
 cartbar.classList.toggle("show",n>0);
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");category=b.dataset.cat;render();
});
continueBtn.onclick=()=>alert("Design prototype only. Signup and payment will be connected in the next phase.");

const menu=document.getElementById("menu"),nav=document.getElementById("nav");
menu.onclick=()=>nav.classList.toggle("open");
nav.querySelectorAll("a").forEach(a=>a.onclick=()=>nav.classList.remove("open"));
render();update();
