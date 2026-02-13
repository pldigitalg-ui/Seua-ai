// js/data.js
window.CATALOG = {
  home_acai: [
    {
      id:"acai-300",
      name:"Açaí 300ml",
      desc:"Clássico e rápido. Ideal pra matar a vontade com um preço leve.",
      price: 14.90,
      img:"img/home-acai-1.jpg",
      badge:"Mais pedido"
    },
    {
      id:"acai-500",
      name:"Açaí 500ml",
      desc:"Mais energia e mais sabor. Ótimo para o dia a dia.",
      price: 18.90,
      img:"img/home-acai-2.jpg",
      badge:"Popular"
    },
    {
      id:"acai-700",
      name:"Açaí 700ml",
      desc:"Bem servido, perfeito pra quem quer caprichar nos complementos.",
      price: 22.90,
      img:"img/home-acai-3.jpg"
    },
    {
      id:"acai-1l",
      name:"Açaí 1 Litro",
      desc:"Família/casal. Melhor custo-benefício para dividir.",
      price: 29.90,
      img:"img/home-acai-4.jpg",
      badge:"Top"
    },
    {
      id:"monte-acai",
      name:"Monte seu Açaí",
      desc:"Escolha tamanho + complementos e some tudo automaticamente.",
      price: null,
      img:"img/home-acai-5.jpg",
      link:"acai.html",
      badge:"Personalizado"
    }
  ],

  // ✅ categorias (as páginas existem no seu repo)
  categories: [
    {
      id:"bebidas",
      name:"Bebidas",
      page:"bebidas.html",
      items:[
        { id:"coca-350", name:"Coca-Cola Lata", desc:"350ml", price:6.00, img:"img/bebidas-coca.jpg", badge:"Gelada" },
        { id:"guarana-350", name:"Guaraná Lata", desc:"350ml", price:6.00, img:"img/bebidas-guarana.jpg" },
        { id:"agua-500", name:"Água", desc:"500ml", price:3.00, img:"img/bebidas-agua.jpg" },
        { id:"suco", name:"Suco Natural", desc:"Copo", price:7.00, img:"img/bebidas-suco.jpg" }
      ]
    },
    {
      id:"combos",
      name:"Combos",
      page:"combos.html",
      items:[
        { id:"combo-1", name:"Combo Açaí + Bebida", desc:"Açaí 500ml + bebida lata", price:24.90, img:"img/combos-1.jpg", badge:"Economia" },
        { id:"combo-2", name:"Combo Casal 1L", desc:"1 Litro + 2 complementos", price:34.90, img:"img/combos-2.jpg" }
      ]
    },
    {
      id:"sorvetes",
      name:"Sorvetes",
      page:"sorvetes.html",
      items:[
        { id:"sorv-choc", name:"Sorvete Chocolate", desc:"Pote", price:12.90, img:"img/sorvetes-choc.jpg" },
        { id:"sorv-mor", name:"Sorvete Morango", desc:"Pote", price:12.90, img:"img/sorvetes-mor.jpg", badge:"Novo" }
      ]
    }
  ]
};
