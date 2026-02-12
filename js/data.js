// js/data.js
window.CATALOG = {
  categories: [
    {
      id: "combos",
      label: "Combos",
      items: [
        { id: "combo-acai-500-bebida", name: "Combo 1", desc: "Açaí 500ml + bebida", price: 22.90, badge: "Mais vendido" },
        { id: "combo-acai-700-bebida", name: "Combo 2", desc: "Açaí 700ml + bebida", price: 26.90, badge: "Top" }
      ]
    },
    {
      id: "bebidas",
      label: "Bebidas",
      items: [
        { id: "coca-lata", name: "Coca-Cola Lata", desc: "350ml", price: 6.50 },
        { id: "guarana-lata", name: "Guaraná Lata", desc: "350ml", price: 6.00 },
        { id: "agua", name: "Água", desc: "500ml", price: 3.50 }
      ]
    },
    {
      id: "sorvetes",
      label: "Sorvetes",
      items: [
        { id: "sorvete-copo", name: "Sorvete no Copo", desc: "Sabor do dia", price: 8.90 },
        { id: "milkshake", name: "Milkshake", desc: "Cremoso", price: 14.90 }
      ]
    },
    {
      id: "hamburguer",
      label: "Hambúrguer",
      items: [
        { id: "burg-classico", name: "Hambúrguer Clássico", desc: "Pão, carne, queijo e molho", price: 18.90, badge: "Destaque" },
        { id: "burg-duplo", name: "Hambúrguer Duplo", desc: "2 carnes, queijo, molho", price: 24.90 }
      ]
    }
  ],

  highlights: [
    { id: "hl-acai500", title: "Açaí 500ml", subtitle: "O mais pedido da casa", price: 18.90, link: "acai.html#monte", cta: "Montar agora" },
    { id: "hl-combo1", title: "Combo 1", subtitle: "Açaí 500ml + bebida", price: 22.90, link: "combos.html", cta: "Ver combo" },
    { id: "hl-burg", title: "Hambúrguer Clássico", subtitle: "Carne, queijo e molho", price: 18.90, link: "hamburguer.html", cta: "Ver hambúrguer" }
  ]
};
