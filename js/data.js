// js/data.js
window.CATALOG = {
  // HOME: grade de AÇAÍ (7 opções prontas + 1 Monte seu Açaí)
  home_acai: [
    { id:"acai-300", name:"Açaí 300ml", desc:"Clássico e rápido", price:14.90, img:"img/acai-300.jpg", badge:"Popular" },
    { id:"acai-500", name:"Açaí 500ml", desc:"Mais vendido", price:18.90, img:"img/acai-500.jpg", badge:"Mais pedido" },
    { id:"acai-700", name:"Açaí 700ml", desc:"Bem servido", price:22.90, img:"img/acai-700.jpg" },
    { id:"acai-1l",  name:"Açaí 1 Litro", desc:"Família / casal", price:29.90, img:"img/acai-1l.jpg", badge:"Top" },

    { id:"acai-nutella", name:"Açaí com Nutella", desc:"Cremoso + avelã", price:27.90, img:"img/acai-nutella.jpg" },
    { id:"acai-ovomaltine", name:"Açaí com Ovomaltine", desc:"Crocante e doce", price:26.90, img:"img/acai-ovomaltine.jpg" },
    { id:"acai-misto", name:"Açaí Morango + Banana", desc:"Combinação perfeita", price:25.90, img:"img/acai-morango.jpg" },

    // card especial: vai para página do builder
    { id:"go-monte", name:"Monte seu Açaí", desc:"Escolha tamanho e adicionais", price:null, img:"img/monte-acai.jpg", badge:"Personalizado", link:"acai.html#monte" }
  ],

  categories: [
    {
      id: "bebidas",
      label: "Bebidas",
      items: [
        { id:"coca-lata", name:"Coca-Cola Lata", desc:"350ml", price:6.50, img:"img/bebida-coca.jpg" },
        { id:"guarana-lata", name:"Guaraná Lata", desc:"350ml", price:6.00, img:"img/bebida-guarana.jpg" },
        { id:"agua", name:"Água", desc:"500ml", price:3.50, img:"img/bebida-agua.jpg" },
        { id:"suco", name:"Suco Natural", desc:"Copo 300ml", price:7.90, img:"img/bebida-suco.jpg" }
      ]
    },
    {
      id: "combos",
      label: "Combos",
      items: [
        { id:"combo-1", name:"Combo 1", desc:"Açaí 500ml + bebida", price:22.90, img:"img/combo-1.jpg", badge:"Mais vendido" },
        { id:"combo-2", name:"Combo 2", desc:"Açaí 700ml + bebida", price:26.90, img:"img/combo-2.jpg" }
      ]
    },
    {
      id: "sorvetes",
      label: "Sorvetes",
      items: [
        { id:"sorv-1", name:"Sorvete 1", desc:"Sabor do dia", price:8.90, img:"img/sorvete-1.jpg" },
        { id:"sorv-2", name:"Sorvete 2", desc:"Cremoso", price:9.90, img:"img/sorvete-2.jpg" },
        { id:"sorv-3", name:"Sorvete 3", desc:"Premium", price:12.90, img:"img/sorvete-3.jpg" },
        { id:"sorv-4", name:"Sorvete 4", desc:"Chocolate", price:10.90, img:"img/sorvete-4.jpg" },
        { id:"sorv-5", name:"Sorvete 5", desc:"Morango", price:10.90, img:"img/sorvete-5.jpg" }
      ]
    },
    {
      id: "hamburguer",
      label: "Hambúrguer",
      items: [
        { id:"burg-1", name:"Hambúrguer Clássico", desc:"Pão, carne, queijo, molho", price:18.90, img:"img/burg-1.jpg", badge:"Destaque" },
        { id:"burg-2", name:"Hambúrguer Duplo", desc:"2 carnes, queijo, molho", price:24.90, img:"img/burg-2.jpg" }
      ]
    }
  ]
};
