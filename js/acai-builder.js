// js/acai-builder.js
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const money = (value) => {
    try {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    } catch {
      return `R$ ${value.toFixed(2)}`.replace(".", ",");
    }
  };

  function createOption(type, groupName, item) {
    const wrap = document.createElement("label");
    wrap.className = "opt";

    const input = document.createElement("input");
    input.type = type;
    input.name = groupName;
    input.value = item.id;
    input.dataset.price = (item.price ?? 0);
    input.dataset.extraPrice = (item.extraPrice ?? 0);

    const title = document.createElement("span");
    title.className = "opt-title";
    title.textContent = item.label;

    const price = document.createElement("span");
    price.className = "opt-price";
    const p = (item.price ?? 0);
    if (type === "radio") {
      price.textContent = money(item.price);
    } else if ((item.price ?? 0) > 0) {
      price.textContent = `+ ${money(item.price)}`;
    } else {
      price.textContent = "";
    }

    wrap.appendChild(input);
    wrap.appendChild(title);
    wrap.appendChild(price);
    return wrap;
  }

  function initAcaiBuilder() {
    const root = $("#acai-builder");
    if (!root || !window.ACAI_DATA || !window.APP_CONFIG) return;

    const sizesBox = $("#acai-sizes", root);
    const fruitsBox = $("#acai-fruits", root);
    const extrasBox = $("#acai-extras", root);

    // Render sizes (radio)
    window.ACAI_DATA.sizes.forEach((s, idx) => {
      const node = createOption("radio", "acai-size", s);
      if (idx === 1) node.querySelector("input").checked = true; // default 500ml
      sizesBox.appendChild(node);
    });

    // Render fruits (checkbox)
    window.ACAI_DATA.fruits.forEach((f) => {
      const node = createOption("checkbox", "acai-fruit", f);
      node.querySelector("input").dataset.kind = "fruit";
      fruitsBox.appendChild(node);
    });

    // Render extras (checkbox)
    window.ACAI_DATA.extras.forEach((e) => {
      const node = createOption("checkbox", "acai-extra", e);
      node.querySelector("input").dataset.kind = "extra";
      extrasBox.appendChild(node);
    });

    const fruitsLimit = window.APP_CONFIG.limits.fruitsFree ?? 3;
    const extrasIncluded = window.APP_CONFIG.limits.extrasIncluded ?? 2;

    const info = $("#acai-info", root);
    const totalEl = $("#acai-total", root);
    const btn = $("#acai-send", root);
    const notes = $("#acai-notes", root);

    function getSelectedSize() {
      const sel = $('input[name="acai-size"]:checked', root);
      if (!sel) return null;
      const id = sel.value;
      const size = window.ACAI_DATA.sizes.find(s => s.id === id);
      return size || null;
    }

    function getChecked(kind) {
      return $$(`input[type="checkbox"][data-kind="${kind}"]:checked`, root);
    }

    function enforceFruitLimit() {
      const checked = getChecked("fruit");
      const over = checked.length - fruitsLimit;
      // Se passou do limite, cobra extra por fruta excedente (não bloqueia, só calcula)
      return Math.max(0, over);
    }

    function enforceExtrasIncluded() {
      const checked = getChecked("extra");
      const over = checked.length - extrasIncluded;
      return Math.max(0, over);
    }

    function computeTotal() {
      const size = getSelectedSize();
      if (!size) return { total: 0, size, fruits: [], extras: [], fruitOver: 0, extraOver: 0 };

      const fruitsChecked = getChecked("fruit");
      const extrasChecked = getChecked("extra");

      const fruitOver = enforceFruitLimit();
      const extraOver = enforceExtrasIncluded();

      // Preço base
      let total = size.price;

      // Frutas: até X grátis, excedente cobra extraPrice por fruta (usa extraPrice do item)
      const fruits = fruitsChecked.map(input => input.value);
      if (fruitOver > 0) {
        // cobra apenas as últimas excedentes (mas na prática é quantidade excedente)
        const perFruit = 2.00;
        total += fruitOver * perFruit;
      }

      // Extras: até Y inclusos, excedente cobra price do item
      const extras = extrasChecked.map(input => input.value);
      if (extraOver > 0) {
        // cobra os mais caros? (melhor: cobra todos e dá "desconto" nos Y primeiros)
        // Aqui: soma todos e "desconta" os Y mais baratos => fica justo pro cliente
        const prices = extrasChecked.map(i => Number(i.dataset.price || 0)).sort((a,b)=>a-b);
        const sumAll = prices.reduce((a,b)=>a+b,0);
        const discount = prices.slice(0, Math.min(extrasIncluded, prices.length)).reduce((a,b)=>a+b,0);
        total += (sumAll - discount);
      } else {
        // Se não passou do incluso, não cobra nada
        total += 0;
      }

      return { total, size, fruits, extras, fruitOver, extraOver };
    }

    function labelFromId(list, id) {
      const it = list.find(x => x.id === id);
      return it ? it.label : id;
    }

    function updateUI() {
      const { total, size, fruits, extras, fruitOver, extraOver } = computeTotal();

      const fruitsText = fruits.length
        ? fruits.map(id => labelFromId(window.ACAI_DATA.fruits, id)).join(", ")
        : "Nenhuma";

      const extrasText = extras.length
        ? extras.map(id => labelFromId(window.ACAI_DATA.extras, id)).join(", ")
        : "Nenhum";

      let warning = `✅ Frutas grátis: até ${fruitsLimit} | ✅ Extras inclusos: até ${extrasIncluded}`;
      if (fruitOver > 0) warning += ` • ⚠️ +${fruitOver} fruta(s) extra (cobrado)`;
      if (extraOver > 0) warning += ` • ⚠️ +${extraOver} extra(s) cobrado(s)`;

      info.textContent = warning;
      totalEl.textContent = money(total);

      btn.disabled = !size;
      btn.dataset.payload = JSON.stringify({ size: size?.label, fruits: fruitsText, extras: extrasText, total });
      btn.dataset.message = [
        `Olá! Quero montar meu açaí no ${window.APP_CONFIG.storeName}:`,
        `Tamanho: ${size?.label || "-"}`,
        `Frutas: ${fruitsText}`,
        `Complementos: ${extrasText}`,
        notes.value?.trim() ? `Observações: ${notes.value.trim()}` : null,
        `Total estimado: ${money(total)}`
      ].filter(Boolean).join("\n");
    }

    root.addEventListener("change", updateUI);
    notes.addEventListener("input", updateUI);

    btn.addEventListener("click", () => {
      const msg = btn.dataset.message || "";
      const wa = window.APP_CONFIG.whatsapp || "";
      const url = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    });

    updateUI();
  }

  document.addEventListener("DOMContentLoaded", initAcaiBuilder);
})();

