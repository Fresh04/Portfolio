(function(){
const apply = (mode)=>{
const root = document.documentElement;
if(mode==='auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
const lbl = document.querySelector('#themeLabel');
if(lbl) lbl.textContent = mode.charAt(0).toUpperCase()+mode.slice(1);
};
const nextOf = (m)=>({auto:'dark', dark:'light', light:'auto'})[m||'auto'];
const saved = localStorage.getItem('theme')||'auto';
apply(saved);
document.addEventListener('click', (e)=>{
const btn = e.target.closest('#themeToggle');
if(!btn) return;
const next = nextOf(localStorage.getItem('theme'));
localStorage.setItem('theme', next); apply(next);
});
document.addEventListener('DOMContentLoaded', ()=>{
const y = document.getElementById('y');
if(y) y.textContent = new Date().getFullYear();
});
})();