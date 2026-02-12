// js/app.js
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  const KEY = "lp_acai_cart_v1";

  const state = {
    carrinho: loadCart()
  };

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch(e){ return []; }
  }
  function saveCart(){
    localStorage.setItem(KEY, JSON.stringify(state.carrinho));
    updateBadge();
    renderCart();
  }

  function money(v){
    return v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  }

  function getPageId(){
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if(file === "index.html" || file === "") return "index";
    return file.replace(".html","");
  }

  function produtosDaPagina(pageId){
    const cat = ["acai","bebidas","combos","sorvetes","hamburguer"].includes(pageId) ? pageId : null;
    if(!cat) return [];
    return (window.SITE?.produtos || []).filter(p => p.cat === cat);
  }

  function renderGrid(){
    const pageId = getPageId();
    const grid = $("[data-grid]");
    if(!grid) return;

    let lista = [];
    if(pageId === "index"){
      const ids = window.SITE?.destaques || [];
      const map = new Map((window.SITE?.produtos || []).map(p => [p.id, p]));
      lista = ids.map(id => map.get(id)).filter(Boolean);
    } else {
      lista = produtosDaPagina(pageId);
    }

    grid.innerHTML = lista.map(p => `
      <article class="card">
        <div class="product__top">
          <div>
            <div class="product__title">${escapeHtml(p.nome)}</div>
            <div class="product__desc">${escapeHtml(p.desc || "")}</div>
          </div>
          <div class="price">${money(p.preco)}</div>
        </div>
        <button class="btn btn--ok" data-add="${p.id}">Adicionar</button>
      </article>
    `).join("");

    grid.addEventListener("click", (e)=>{
      const b = e.target.closest("[data-add]");
      if(!b) return;
      addToCart(b.getAttribute("data-add"));
    }, { once:false });
  }

  function addToCart(id){
    const p = (window.SITE?.produtos || []).find(x => x.id === id);
    if(!p) return;
    const item = state.carrinho.find(i => i.id === id);
    if(item) item.qtd += 1;
    else state.carrinho.push({ id, qtd: 1 });
    saveCart();
    openCart();
  }

  function removeFromCart(id){
    state.carrinho = state.carrinho.filter(i => i.id !== id);
    saveCart();
  }
  function decCart(id){
    const item = state.carrinho.find(i=>i.id===id);
    if(!item) return;
    item.qtd -= 1;
    if(item.qtd <= 0) removeFromCart(id);
    else saveCart();
  }
  function incCart(id){
    const item = state.carrinho.find(i=>i.id===id);
    if(!item) return;
    item.qtd += 1;
    saveCart();
  }

  function totals(){
    const map = new Map((window.SITE?.produtos || []).map(p => [p.id,p]));
    let subtotal = 0;
    for(const i of state.carrinho){
      const p = map.get(i.id);
      if(p) subtotal += p.preco * i.qtd;
    }
    const taxa = window.SITE?.pedido?.taxaEntrega ?? 0;
    const freteGratis = window.SITE?.pedido?.freteGratisAcima ?? null;
    let entrega = taxa;
    if(freteGratis != null && subtotal >= freteGratis) entrega = 0;
    return { subtotal, entrega, total: subtotal + entrega };
  }

  function renderCart(){
    const drawer = $("[data-drawer]");
    if(!drawer) return;

    const listaEl = $("[data-carrinho-lista]", drawer);
    const resumoEl = $("[data-carrinho-resumo]", drawer);

    const map = new Map((window.SITE?.produtos || []).map(p => [p.id,p]));
    if(!state.carrinho.length){
      if(listaEl) listaEl.innerHTML = `<div class="muted">Seu carrinho está vazio.</div>`;
      if(resumoEl) resumoEl.innerHTML = "";
      return;
    }

    if(listaEl){
      listaEl.innerHTML = state.carrinho.map(i=>{
        const p = map.get(i.id);
        if(!p) return "";
        return `
          <div class="cartrow">
            <div class="cartrow__main">
              <div class="cartrow__title">${escapeHtml(p.nome)}</div>
              <div class="cartrow__muted">${money(p.preco)} • ${i.qtd}x</div>
            </div>
            <div class="cartrow__actions">
              <button class="iconbtn" data-dec="${i.id}">−</button>
              <button class="iconbtn" data-inc="${i.id}">+</button>
              <button class="iconbtn" data-del="${i.id}">✕</button>
            </div>
          </div>
        `;
      }).join("");
    }

    const t = totals();
    if(resumoEl){
      resumoEl.innerHTML = `
        <div class="carttot">
          <div><span class="muted">Subtotal</span><b>${money(t.subtotal)}</b></div>
          <div><span class="muted">Entrega</span><b>${money(t.entrega)}</b></div>
          <div class="carttot__line"></div>
          <div><span>Total</span><b>${money(t.total)}</b></div>
        </div>
      `;
    }

    drawer.addEventListener("click", (e)=>{
      const d = e.target.closest("[data-del]");
      const inc = e.target.closest("[data-inc]");
      const dec = e.target.closest("[data-dec]");
      if(d) return removeFromCart(d.getAttribute("data-del"));
      if(inc) return incCart(inc.getAttribute("data-inc"));
      if(dec) return decCart(dec.getAttribute("data-dec"));
    }, { once:false });
  }

  function updateBadge(){
    const badge = $("[data-carrinho-badge]");
    const qtd = state.carrinho.reduce((a,i)=>a+i.qtd,0);
    if(badge) badge.textContent = String(qtd);
  }

  function openCart(){
    const drawer = $("[data-drawer]");
    if(!drawer) return;
    drawer.classList.add("is-open");
  }
  function closeCart(){
    const drawer = $("[data-drawer]");
    if(!drawer) return;
    drawer.classList.remove("is-open");
  }

  function bindUI(){
    $("[data-open-carrinho]")?.addEventListener("click", openCart);
    $("[data-close-carrinho]")?.addEventListener("click", closeCart);

    // WhatsApp FAB
    const fab = $("[data-whats-fab]");
    if(fab){
      const numero = window.SITE?.marca?.whatsapp || "553198832407";
      const nomeLoja = window.SITE?.marca?.nome || "LP Grill Açaí";
      const msg = `Olá! Vim pelo site da *${nomeLoja}* e quero fazer um pedido.`;
      fab.href = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
      fab.target = "_blank";
      fab.rel = "noopener";
    }

    // Finalizar (enviar carrinho)
    const btnFinal = $("[data-finalizar]");
    if(btnFinal){
      btnFinal.addEventListener("click", ()=>{
        if(!state.carrinho.length){ alert("Seu carrinho está vazio."); return; }

        const numero = window.SITE?.marca?.whatsapp || "553198832407";
        const nomeLoja = window.SITE?.marca?.nome || "LP Grill Açaí";
        const map = new Map((window.SITE?.produtos || []).map(p => [p.id,p]));
        const t = totals();

        const linhas = [];
        linhas.push(`*Pedido — ${nomeLoja}*`);
        linhas.push(``);
        for(const i of state.carrinho){
          const p = map.get(i.id);
          if(!p) continue;
          linhas.push(`• ${i.qtd}x ${p.nome} — ${money(p.preco * i.qtd)}`);
        }
        linhas.push(``);
        linhas.push(`Subtotal: ${money(t.subtotal)}`);
        linhas.push(`Entrega: ${money(t.entrega)}`);
        linhas.push(`*Total: ${money(t.total)}*`);

        const url = `https://wa.me/${numero}?text=${encodeURIComponent(linhas.join("\n"))}`;
        window.open(url, "_blank", "noopener");
      });
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    updateBadge();
    renderGrid();
    renderCart();
    bindUI();

    // preencher dados marca se existirem
    const nome = window.SITE?.marca?.nome || "";
    const end = window.SITE?.marca?.endereco || "";
    $("[data-marca-nome]") && ($("[data-marca-nome]").textContent = nome);
    $("[data-marca-endereco]") && ($("[data-marca-endereco]").textContent = end);
  });
})();
