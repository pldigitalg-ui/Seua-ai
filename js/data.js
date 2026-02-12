// js/data.js
window.SITE = {
  marca: {
    nome: "LP Grill Açaí",
    slogan: "Açaí cremoso • Entrega rápida",
    endereco: "Rua João Lemos, 87",
    cidade: "MG",
    whatsapp: "553198832407", // wa.me precisa do DDI+DDD+numero, sem + e sem espaços
    instagram: "https://instagram.com/"
  },

  pedido: {
    taxaEntrega: 6.0,
    freteGratisAcima: 60.0, // null para desativar
    aceitaRetirada: true
  },

  categorias: [
    { id: "acai", nome: "Açaí" },
    { id: "bebidas", nome: "Bebidas" },
    { id: "combos", nome: "Combos" },
    { id: "sorvetes", nome: "Sorvetes" },
    { id: "hamburguer", nome: "Hambúrguer" }
  ],

  produtos: [
    // AÇAÍ
    { id:"ac500", cat:"acai", nome:"Açaí 500ml", desc:"Cremosíssimo + 2 adicionais", preco: 18.90 },
    { id:"ac700", cat:"acai", nome:"Açaí 700ml", desc:"Perfeito pra matar a fome", preco: 24.90 },
    { id:"ac1l",  cat:"acai", nome:"Açaí 1L",   desc:"Família / compartilhar", preco: 34.90 },

    // BEBIDAS
    { id:"ref",   cat:"bebidas", nome:"Refrigerante lata", desc:"350ml", preco: 6.00 },
    { id:"agua",  cat:"bebidas", nome:"Água", desc:"500ml", preco: 3.50 },
    { id:"suco",  cat:"bebidas", nome:"Suco", desc:"Copo 300ml", preco: 7.00 },

    // COMBOS
    { id:"c1", cat:"combos", nome:"Combo 1", desc:"Açaí 500ml + bebida", preco: 22.90 },
    { id:"c2", cat:"combos", nome:"Combo 2", desc:"Açaí 700ml + 2 adicionais", preco: 29.90 },
    { id:"c3", cat:"combos", nome:"Combo 3", desc:"Açaí 500ml + sorvete", preco: 26.90 },

    // SORVETES
    { id:"sorv1", cat:"sorvetes", nome:"Sorvete 2 bolas", desc:"Escolha sabores no WhatsApp", preco: 12.00 },
    { id:"sorv2", cat:"sorvetes", nome:"Sorvete 3 bolas", desc:"Mais cremosidade", preco: 15.00 },

    // HAMBÚRGUER
    { id:"hb1", cat:"hamburguer", nome:"Hambúrguer Clássico", desc:"Carne + queijo + molho", preco: 18.90 },
    { id:"hb2", cat:"hamburguer", nome:"Hambúrguer Duplo", desc:"2 carnes + queijo", preco: 26.90 }
  ],

  destaques: ["ac500", "c1", "hb1"]
};
