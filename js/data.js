// js/data.js
window.CATALOG = {
  home_acai: [
    { id:"acai-300", name:"Açaí 300ml", desc:"Açaí cremoso e natural, batido na hora. Ideal para matar a vontade rapidamente.", price:14.90, badge:"Popular", img:"img/acai-300.jpg" },
    { id:"acai-500", name:"Açaí 500ml", desc:"Tamanho ideal para quem ama açaí. Textura perfeita e sabor marcante.", price:18.90, badge:"Mais pedido", img:"img/acai-500.jpg" },
    { id:"acai-700", name:"Açaí 700ml", desc:"Bem servido e completo. Ótimo para quem quer mais energia e mais sabor.", price:22.90, badge:"", img:"img/acai-700.jpg" },
    { id:"acai-1l",  name:"Açaí 1 Litro", desc:"Perfeito para dividir em casal ou família. Açaí bem gelado e consistente.", price:29.90, badge:"Top", img:"img/acai-1l.jpg" },
    { id:"acai-nutella", name:"Açaí com Nutella", desc:"Cremoso com cobertura generosa de Nutella. Um clássico que sempre agrada.", price:27.90, badge:"", img:"img/acai-nutella.jpg" },
    { id:"acai-ovo", name:"Açaí com Ovomaltine", desc:"Crocância irresistível com Ovomaltine. Combinação perfeita com açaí.", price:26.90, badge:"", img:"img/acai-ovomaltine.jpg" },
    { id:"acai-mb", name:"Açaí Morango + Banana", desc:"Combinação fresca e natural. Leve, doce e muito saborosa.", price:25.90, badge:"", img:"img/acai-morango.jpg" },

    // card que abre o builder
    { id:"acai-monte", name:"Monte seu Açaí", desc:"Escolha o tamanho e adicione complementos. Total calculado automaticamente.", badge:"Personalizado", img:"img/acai-monte.jpg", link:"acai.html" }
  ],

  categories: [
    {
      id:"bebidas",
      title:"Bebidas",
      items:[
        { id:"beb-agua", name:"Água", desc:"Garrafa 500ml.", price:3.00, img:"img/beb-agua.jpg" },
        { id:"beb-refri", name:"Refrigerante Lata", desc:"Coca/Guaraná/Fanta (350ml).", price:6.00, img:"img/beb-refri.jpg" },
        { id:"beb-suco", name:"Suco Natural", desc:"Copo 300ml (sabores do dia).", price:7.00, img:"img/beb-suco.jpg" }
      ]
    },
    {
      id:"combos",
      title:"Combos",
      items:[
        { id:"combo-1", name:"Combo Açaí 300 + Bebida", desc:"Açaí 300ml + refrigerante lata.", price:19.90, img:"img/combo-1.jpg", badge:"Economia" },
        { id:"combo-2", name:"Combo Açaí 500 + Bebida", desc:"Açaí 500ml + refrigerante lata.", price:24.90, img:"img/combo-2.jpg" }
      ]
    },
    {
      id:"sorvetes",
      title:"Sorvetes",
      items:[
        { id:"sorv-1", name:"Picolé", desc:"Sabores variados.", price:5.00, img:"img/sorv-1.jpg" },
        { id:"sorv-2", name:"Sorvete no copo", desc:"Copo 200ml.", price:8.00, img:"img/sorv-2.jpg" }
      ]
    },
    {
      id:"hamburguer",
      title:"Hambúrguer",
      items:[
        { id:"ham-1", name:"X-Burger", desc:"Pão, hambúrguer, queijo, molho.", price:18.00, img:"img/ham-1.jpg" },
        { id:"ham-2", name:"X-Salada", desc:"Pão, hambúrguer, queijo, alface, tomate.", price:20.00, img:"img/ham-2.jpg" }
      ]
    }
  ]
};
