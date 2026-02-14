window.DB = {
  categorias: [
    { id: "acai", nome: "Açaí" },
    { id: "lanches", nome: "Lanches" },
    { id: "bebidas", nome: "Bebidas" },
    { id: "porcoes", nome: "Porções" },
  ],

  produtos: [
    // AÇAÍ PRONTO
    { id: "a1", cat: "acai", nome: "Açaí 300ml", desc: "Açaí tradicional", preco: 12.90 },
    { id: "a2", cat: "acai", nome: "Açaí 500ml", desc: "Açaí tradicional", preco: 16.90 },
    { id: "a3", cat: "acai", nome: "Açaí 700ml", desc: "Açaí tradicional", preco: 21.90 },

    // LANCHES
    { id: "l1", cat: "lanches", nome: "X-Burger", desc: "Carne, queijo e molho", preco: 14.90 },
    { id: "l2", cat: "lanches", nome: "X-Salada", desc: "Carne, queijo e salada", preco: 16.90 },
    { id: "l3", cat: "lanches", nome: "X-Bacon", desc: "Carne, queijo e bacon", preco: 19.90 },

    // BEBIDAS
    { id: "b1", cat: "bebidas", nome: "Coca-Cola Lata", desc: "350ml", preco: 6.00 },
    { id: "b2", cat: "bebidas", nome: "Guaraná Lata", desc: "350ml", preco: 5.50 },
    { id: "b3", cat: "bebidas", nome: "Água", desc: "500ml", preco: 3.00 },

    // PORÇÕES
    { id: "p1", cat: "porcoes", nome: "Batata Frita", desc: "Porção média", preco: 18.90 },
    { id: "p2", cat: "porcoes", nome: "Frango a Passarinho", desc: "Porção média", preco: 29.90 },
  ],

  // BUILDER DO AÇAÍ (Monte o seu)
  acaiBuilder: {
    base: [
      { id: "300", nome: "Copo 300ml", preco: 12.90 },
      { id: "500", nome: "Copo 500ml", preco: 16.90 },
      { id: "700", nome: "Copo 700ml", preco: 21.90 },
    ],
    cremes: [
      { id: "c1", nome: "Creme de Ninho", preco: 3.00 },
      { id: "c2", nome: "Creme de Paçoca", preco: 3.00 },
      { id: "c3", nome: "Creme de Morango", preco: 3.00 },
    ],
    adicionais: [
      { id: "ad1", nome: "Leite em pó", preco: 2.50 },
      { id: "ad2", nome: "Granola", preco: 2.00 },
      { id: "ad3", nome: "Confete", preco: 2.00 },
      { id: "ad4", nome: "Ovomaltine", preco: 3.50 },
      { id: "ad5", nome: "Banana", preco: 2.00 },
      { id: "ad6", nome: "Morango", preco: 3.00 },
    ],
  }
};
