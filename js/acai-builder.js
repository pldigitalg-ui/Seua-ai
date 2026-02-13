// js/acai-builder.js
(function () {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const cfg = () => window.APP_CONFIG || { brand:"LP Grill", whatsapp:"" };

  function money(v){
    try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch { return `R$ ${Number(v||0).toFixed(2)}`.replace(".",","); }
  }

  function init(){
    const root = $("#acai-builder");
    if (!root || !window.ACAI_MENU?.sizes?.length) return;

    const sizeBox = $("#acai-sizes", root);
    const fruitBox = $("#acai-fruits", root);
    const addBox = $("#acai-addons", root);
    const totalEl = $("#acai-total", root);
    const infoEl  = $("#acai-info", root);
    const warnEl  = $("#acai-warning", root);
    const btnAdd  = $("#acai-add-cart", root);
    const btnWhats= $("#acai-whats", root);
    const notes   = $("#acai-notes", root);

    const sizes = window.ACAI_MENU.sizes.map(norm);
    const fruits = (window.ACAI_MENU.fruits||[]).map(norm);
    const addOns = (window.ACAI_MENU.addOns||[]).map(norm);

    function norm(x){
      return { id:String(x.id), label:String(x.label||x.id), price:Number(x.price||0), default:!!x.default };
    }

    // render sizes
    sizeBox.innerHTML = "";
    sizes.forEach(s => {
      const el = document.createElement("label");
      el.className = "pick";
      el.innerHTML = `
        <input type="radio" name="acai-size" value="${s.id}" ${s.default ? "checked" : ""}>
        <span class="pick__body">
          <span class="pick__title">${s.label}</span>
          <span class="pick__price">${money(s.price)}</span>
        </span>
      `;
      sizeBox.appendChild(el);
    });

    function renderTile(list, box){
      box.innerHTML = "";
      list.forEach(it => {
        const el = document.createElement("label");
        el.className = "tile";
        el.innerHTML = `
          <input type="checkbox" data-kind="extra" value="${it.id}">
          <span class="tile__body">
            <span class="tile__title">${it.label}</span>
            <span class="pick__price">${money(it.price)}</span>
          </span>
        `;
        box.appendChild(el);
      });
    }
    renderTile(fruits, fruitBox);
    renderTile(addOns, addBox);

    function getSize(){
      const sel = $('input[name="acai-size"]:checked', root);
      const id = sel ? sel.value : sizes[0].id;
      return sizes.find(x => x.id === id) || sizes[0];
    }

    function getExtras(){
      const ids = $$('input[type="checkbox"][data-kind="extra"]:checked', root).map(i => i.value);
      const all = [...fruits, ...addOns];
      return ids.map(id => all.find(x => x.id === id)).filter(Boolean);
    }

    // ✅ soma total: tamanho + todos extras
    function compute(){
      const size = getSize();
      const extras = getExtras();
      const base = Number(size.price||0);
      const extrasTotal = extras.reduce((a,b)=>a + Number(b.price||0), 0);
      const total = Number((base + extrasTotal).toFixed(2));
      return { size, extras, base, extrasTotal, total };
    }

    function update(){
      const { size, extras, base, extrasTotal, total } = compute();
      warnEl.textContent = "";
      infoEl.textContent = `Tamanho: ${size.label} (${money(base)}) • Complementos: ${extras.length} (${money(extrasTotal)})`;
      totalEl.textContent = money(total);
      btnAdd.disabled = false;
      btnWhats.disabled = !cfg().whatsapp;
    }

    function addToCart(){
      const { size, extras, total } = compute();
      const extrasDesc = extras.length ? extras.map(x => `${x.label} (${money(x.price)})`).join(", ") : "Nenhum";
      const obs = (notes.value||"").trim();

      const id = `acai-${size.id}-${extras.map(x=>x.id).sort().join("-") || "sem"}`;
      const item = {
        id,
        name: `Açaí ${size.label}`,
        desc: `Complementos: ${extrasDesc}${obs ? ` • Obs: ${obs}` : ""}`,
        price: total
      };

      const LS_KEY = "lpgrill_cart_v2";
      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { cart = []; }

      const found = cart.find(x => x.id === item.id);
      if (found) found.qty += 1; else cart.push({ ...item, qty: 1 });

      localStorage.setItem(LS_KEY, JSON.stringify(cart));

      const badge = document.querySelector("#cart-badge");
      if (badge) badge.textContent = String(cart.reduce((a,b)=>a+(b.qty||0),0));

      let t = document.querySelector("#toast");
      if (!t){
        t = document.createElement("div");
        t.id = "toast";
        t.className = "toast hidden";
        document.body.appendChild(t);
      }
      t.textContent = "Adicionado ao carrinho ✅";
      t.classList.remove("hidden");
      setTimeout(()=>t.classList.add("hidden"), 1400);
    }
/* =========================
   ✅ IMPRESSÃO (CUPOM)
   ========================= */
function printOrder(){
  const cart = getCartFromStorage();
  const total = cartTotal(cart);

  let html = `
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Pedido — LP Grill Açaí</title>
    <style>
      body{ font-family: Arial; padding: 16px; }
      h1{ font-size: 18px; margin:0 0 8px; }
      .line{ border-top:1px dashed #999; margin:10px 0; }
      .it{ display:flex; justify-content:space-between; margin:6px 0; font-size:14px; }
      .t{ font-weight:700; font-size:16px; display:flex; justify-content:space-between; }
      small{ color:#555; }
    </style>
  </head>
  <body>
    <h1>LP Grill Açaí — Pedido</h1>
    <small>${new Date().toLocaleString()}</small>
    <div class="line"></div>
  `;

  cart.forEach(it=>{
    const q = Number(it.qty||1);
    const p = Number(it.price||0);
    const sub = (q*p).toFixed(2).replace(".", ",");
    html += `<div class="it"><span>${q}x ${it.name}</span><span>R$ ${sub}</span></div>`;
  });

  html += `
    <div class="line"></div>
    <div class="t"><span>Total</span><span>R$ ${total.toFixed(2).replace(".", ",")}</span></div>
    <script>window.onload=()=>{window.print();}</script>
  </body>
  </html>`;

  const w = window.open("", "_blank", "width=420,height=600");
  w.document.open();
  w.document.write(html);
  w.document.close();
}

    function sendWhats(){
      const { size, extras, base, extrasTotal, total } = compute();
      const lines = [];
      lines.push(`🧾 *AÇAÍ - ${cfg().brand}*`);
      lines.push(`• Tamanho: ${size.label} — ${money(base)}`);
      if (extras.length){
        lines.push(`• Complementos:`);
        extras.forEach(x => lines.push(`   - ${x.label} — ${money(x.price)}`));
        lines.push(`• Total complementos: ${money(extrasTotal)}`);
      } else {
        lines.push(`• Complementos: Nenhum`);
      }
      const obs = (notes.value||"").trim();
      if (obs) lines.push(`• Obs: ${obs}`);
      lines.push(`\n💳 Total: *${money(total)}*`);

      window.open(`https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
    }

    root.addEventListener("change", update);
    notes.addEventListener("input", update);
    btnAdd.addEventListener("click", addToCart);
    btnWhats.addEventListener("click", sendWhats);

    update();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
