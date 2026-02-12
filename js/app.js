// js/app.js
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];
  const money = (v) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  const KEY = "acai_carrinho_v2";
  const estado = {
    carrinho: carregar(),
    cupom: null,
    modo: "entrega" // entrega | retirada
  };

  function carregar(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch{ return []; }
  }
  function salvar(){ localStorage.setItem(KEY, JSON.stringify(estado.carrinho)); }

  function agoraAberto(){
    const cfg = window.SITE?.horario?.aberto;
    if(!cfg) return true;
    const now = new Date();
    const d = now.getDay();
    const range = cfg[d];
    if(!range) return false;
    const [ini, fim] = range;
    const toMin = (hhmm)=>{ const [h,m]=hhmm.split(":").map(Number); return h*60+m; };
    const cur = now.getHours()*60 + now.getMinutes();
    return cur >= toMin(ini) && cur <= toMin(fim);
  }

  function uid(){ return Math.random().toString(16).slice(2)+Date.now().toString(16); }
  function esc(s=""){ return String(s).replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

  function totalLinha(l){
    const a = (l.adicionais||[]).reduce((s,x)=>s+(x.preco||0),0);
    const c = (l.caldas||[]).reduce((s,x)=>s+(x.preco||0),0);
    return (l.precoBase + a + c) * l.qtd;
  }
  function subtotal(){ return estado.carrinho.reduce((s,l)=>s+totalLinha(l),0); }

  function taxaEntrega(sub){
    const p = window.SITE?.pedido;
    if(estado.modo==="retirada") return 0;
    if(!p) return 0;
    if(p.freteGratisAcima!=null && sub>=p.freteGratisAcima) return 0;
    return p.taxaEntrega || 0;
  }

  function desconto(sub){
    if(!estado.cupom) return 0;
    const pct = window.SITE?.cupons?.[estado.cupom];
    if(!pct) return 0;
    return sub * pct;
  }

  function totais(){
    const sub = subtotal();
    const taxa = taxaEntrega(sub);
    const desc = desconto(sub);
    const tot = Math.max(0, sub + taxa - desc);
    return { sub, taxa, desc, tot };
  }

  function toast(msg){
    const t = $("[data-toast]");
    if(!t) return alert(msg);
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(()=>t.classList.remove("show"), 2200);
  }

  function renderTopo(){
    const m = window.SITE?.marca;
    if(!m) return;

    const n = $("[data-marca-nome]");
    const s = $("[data-marca-slogan]");
    const e = $("[data-marca-endereco]");
    const ig = $("[data-marca-instagram]");

    if(n) n.textContent = m.nome;
    if(s) s.textContent = m.slogan;
    if(e) e.textContent = `${m.endereco} • ${m.cidade}`;
    if(ig) ig.href = m.instagram || "#";

    const b = $("[data-badge-aberto]");
    if(b){
      const ok = agoraAberto();
      b.textContent = ok ? "ABERTO AGORA" : "FECHADO";
      b.classList.toggle("ok", ok);
      b.classList.toggle("warn", !ok);
    }
  }

  function addItem(item, extra={}){
    estado.carrinho.push({
      id: uid(),
      itemId: item.id,
      nome: item.nome,
      precoBase: item.preco,
      qtd: 1,
      adicionais: extra.adicionais || [],
      caldas: extra.caldas || [],
      obs: extra.obs || ""
    });
    salvar();
    renderCarrinho();
    toast("Adicionado ao carrinho ✅");
  }

  function remover(id){
    estado.carrinho = estado.carrinho.filter(x=>x.id!==id);
    salvar(); renderCarrinho();
  }
  function qtd(id, delta){
    const it = estado.carrinho.find(x=>x.id===id);
    if(!it) return;
    it.qtd = Math.max(1, it.qtd + delta);
    salvar(); renderCarrinho();
  }

  function renderProdutos(chave){
    const grid = $("[data-grid]");
    const cat = window.SITE?.catalogo?.[chave];
    if(!grid || !cat) return;

    grid.innerHTML = "";

    (cat.itens||[]).forEach(prod=>{
      const card = document.createElement("div");
      card.className = "card";

      const isAcai = chave==="acai";
      const adicionais = isAcai ? (cat.adicionais||[]) : [];
      const caldas = isAcai ? (cat.caldas||[]) : [];

      card.innerHTML = `
        <div class="product__top">
          <div>
            <h3 class="product__title">${esc(prod.nome)}</h3>
            ${prod.desc ? `<p class="muted">${esc(prod.desc)}</p>` : ``}
          </div>
          <div class="price">${money(prod.preco)}</div>
        </div>

        ${isAcai ? `
          <div class="divider"></div>

          <div class="small muted" style="margin-bottom:8px">Adicionais</div>
          <div class="chips">
            ${adicionais.map(a=>`
              <label class="chip">
                <input type="checkbox" data-add value="${esc(a.id)}" data-nome="${esc(a.nome)}" data-preco="${a.preco}">
                <span>${esc(a.nome)} ${a.preco ? `<b>+${money(a.preco)}</b>`:""}</span>
              </label>
            `).join("")}
          </div>

          <div class="divider"></div>

          <div class="small muted" style="margin-bottom:8px">Calda</div>
          <div class="chips">
            ${caldas.map((c,i)=>`
              <label class="chip">
                <input type="radio" name="calda-${prod.id}" ${i===0?"checked":""}
                  data-calda value="${esc(c.id)}" data-nome="${esc(c.nome)}" data-preco="${c.preco}">
                <span>${esc(c.nome)}</span>
              </label>
            `).join("")}
          </div>

          <div class="divider"></div>
          <textarea class="input" data-obs placeholder="Observações (opcional)"></textarea>
        ` : ``}

        <div class="divider"></div>
        <button class="btn" data-add-btn>Adicionar</button>
      `;

      $("[data-add-btn]", card).addEventListener("click", ()=>{
        if(!isAcai) return addItem(prod);

        const adds = $$('input[type="checkbox"][data-add]:checked', card).map(i=>({
          id:i.value, nome:i.dataset.nome, preco:Number(i.dataset.preco||0)
        }));
        const calda = $$('input[type="radio"][data-calda]:checked', card).map(i=>({
          id:i.value, nome:i.dataset.nome, preco:Number(i.dataset.preco||0)
        }));
        const obs = ($("[data-obs]", card)?.value || "").trim();

        addItem(prod, { adicionais:adds, caldas:calda, obs });
      });

      grid.appendChild(card);
    });
  }

  function renderCarrinho(){
    const badge = $("[data-carrinho-badge]");
    if(badge) badge.textContent = String(estado.carrinho.reduce((s,l)=>s+l.qtd,0));

    const list = $("[data-carrinho-lista]");
    const sum = $("[data-carrinho-resumo]");
    if(!list || !sum) return;

    if(estado.carrinho.length===0){
      list.innerHTML = `<div class="empty">Seu carrinho está vazio.</div>`;
      sum.innerHTML = "";
      return;
    }

    list.innerHTML = estado.carrinho.map(l=>{
      const adds = (l.adicionais||[]).map(a=>a.nome).join(", ");
      const cal = (l.caldas||[]).map(c=>c.nome).join(", ");
      const extra = [
        adds ? `+ ${esc(adds)}` : "",
        cal ? `Calda: ${esc(cal)}` : "",
        l.obs ? `Obs: ${esc(l.obs)}` : ""
      ].filter(Boolean).join("<br>");

      return `
        <div class="cartline">
          <div>
            <div class="cartline__title">${esc(l.nome)}</div>
            ${extra ? `<div class="muted small" style="margin-top:6px">${extra}</div>`:""}
          </div>
          <div class="cartline__price">
            ${money(totalLinha(l))}
            <div class="qty">
              <button class="iconbtn" data-m>-</button>
              <span>${l.qtd}</span>
              <button class="iconbtn" data-p>+</button>
              <button class="iconbtn danger" data-r title="Remover">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // bind
    $$("[data-m]", list).forEach((b,i)=>b.addEventListener("click",()=>qtd(estado.carrinho[i].id,-1)));
    $$("[data-p]", list).forEach((b,i)=>b.addEventListener("click",()=>qtd(estado.carrinho[i].id,+1)));
    $$("[data-r]", list).forEach((b,i)=>b.addEventListener("click",()=>remover(estado.carrinho[i].id)));

    const t = totais();
    sum.innerHTML = `
      <div class="sumrow"><span>Subtotal</span><b>${money(t.sub)}</b></div>
      <div class="sumrow"><span>Taxa/Entrega</span><b>${money(t.taxa)}</b></div>
      ${t.desc ? `<div class="sumrow"><span>Desconto (${estado.cupom})</span><b>− ${money(t.desc)}</b></div>`:""}
      <div class="sumrow total"><span>Total</span><b>${money(t.tot)}</b></div>
    `;
  }

  function abrirCarrinho(){
    const d = $("[data-drawer]");
    if(d) d.classList.add("open");
  }
  function fecharCarrinho(){
    const d = $("[data-drawer]");
    if(d) d.classList.remove("open");
  }

  function aplicarCupom(){
    const inp = $("[data-cupom]");
    const val = (inp?.value || "").trim().toUpperCase();
    if(!val){
      estado.cupom = null;
      toast("Cupom removido.");
      renderCarrinho();
      return;
    }
    if(!window.SITE?.cupons?.[val]){
      toast("Cupom inválido.");
      return;
    }
    estado.cupom = val;
    toast(`Cupom aplicado: ${val} ✅`);
    renderCarrinho();
  }

  function modoPedido(novo){
    estado.modo = novo;
    $$("[data-modo]").forEach(x=>x.classList.toggle("active", x.dataset.modo===novo));
    renderCarrinho();
  }

  function finalizarWhats(){
    if(estado.carrinho.length===0) return toast("Carrinho vazio.");

    const nome = ($("[data-nome]")?.value || "").trim();
    const tel = ($("[data-telefone]")?.value || "").trim();
    const end = ($("[data-endereco]")?.value || "").trim();
    const pag = ($("[data-pagamento]")?.value || "Pix").trim();
    const obsGeral = ($("[data-obs-geral]")?.value || "").trim();

    if(!nome) return toast("Informe seu nome.");
    if(estado.modo==="entrega" && !end) return toast("Informe o endereço para entrega.");

    const m = window.SITE?.marca;
    const t = totais();
    const aberto = agoraAberto();

    const linhas = estado.carrinho.map((l,i)=>{
      const adds = (l.adicionais||[]).map(a=>a.nome).join(", ");
      const cal = (l.caldas||[]).map(c=>c.nome).join(", ");
      const extra = [adds?`Adicionais: ${adds}`:"", cal?`Calda: ${cal}`:"", l.obs?`Obs: ${l.obs}`:""].filter(Boolean).join(" | ");
      return `${i+1}. ${l.qtd}x ${l.nome} — ${money(totalLinha(l))}${extra?`\n   (${extra})`:""}`;
    }).join("\n");

    const pix = window.SITE?.pedido?.chavePix ? `\n🔑 Pix: ${window.SITE.pedido.chavePix}` : "";

    const msg =
`🍧 *NOVO PEDIDO — ${m?.nome || "Loja"}*
${aberto ? "🟢 *ABERTO AGORA*" : "🟠 *FORA DO HORÁRIO* (vai para fila)"}

👤 *Nome:* ${nome}
📞 *Telefone:* ${tel || "-"}
🚚 *Modo:* ${estado.modo === "entrega" ? "Entrega" : "Retirada"}
📍 *Endereço:* ${estado.modo === "entrega" ? end : "Retirar na loja"}
💳 *Pagamento:* ${pag}
${estado.cupom ? `🏷️ *Cupom:* ${estado.cupom}` : ""}

🧾 *Itens:*
${linhas}

────────────
Subtotal: ${money(t.sub)}
Taxa: ${money(t.taxa)}
${t.desc ? `Desconto: − ${money(t.desc)}` : ""}
✅ *TOTAL: ${money(t.tot)}*
────────────
📝 Observações: ${obsGeral || "-"}${pix}`.trim();

    window.open(`https://wa.me/${m.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function bindUI(){
    // carrinho
    const openBtns = $$("[data-open-carrinho]");
    openBtns.forEach(b=>b.addEventListener("click", abrirCarrinho));
    $("[data-close-carrinho]")?.addEventListener("click", fecharCarrinho);

    // cupom
    $("[data-aplicar-cupom]")?.addEventListener("click", aplicarCupom);

    // modo
    $$("[data-modo]").forEach(b=>b.addEventListener("click", ()=>modoPedido(b.dataset.modo)));

    // finalizar
    $$("[data-finalizar]").forEach(b=>b.addEventListener("click", finalizarWhats));
  }

  // API pública
  window.ACAI = {
    iniciar(pagina){
      renderTopo();
      bindUI();
      renderCarrinho();
      if(pagina) renderProdutos(pagina);
    }
  };
/* ===========================
   FIX: WhatsApp flutuante em todas as páginas
   =========================== */
(function(){
  function bindWhatsFab(){
    const a = document.querySelector("[data-whats-fab]");
    if(!a) return;

    const numero = window.SITE?.marca?.whatsapp || "553198832407";
    const nomeLoja = window.SITE?.marca?.nome || "LP Grill Açaí";

    // Mensagem simples: se tiver carrinho, o botão finalizar já envia completo.
    // Aqui é só "cair no WhatsApp" rápido.
    const msg = `Olá! Vim pelo site da *${nomeLoja}* e quero fazer um pedido.`;
    a.href = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    a.target = "_blank";
    a.rel = "noopener";
  }

  // Tenta sempre, mesmo se a página não for catálogo
  document.addEventListener("DOMContentLoaded", bindWhatsFab);
})();
