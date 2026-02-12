// js/data.js
window.SITE = {
  marca: {
    nome: "LP Grill Açaí",
    slogan: "Açaí cremoso • Entrega rápida",
    instagram: "https://instagram.com/", // <- coloque o seu @ depois
    endereco: "Rua João Lemos, 87",
    cidade: "MG", // <- se quiser, troco pra sua cidade certinha depois
    whatsapp: "553198832407" // ✅ (31) 98832-2407
  },

  horario: {
    // 0=Dom ... 6=Sáb | null = fechado
    aberto: {
      0: ["12:00", "22:00"],
      1: ["12:00", "22:00"],
      2: ["12:00", "22:00"],
      3: ["12:00", "22:00"],
      4: ["12:00", "22:00"],
      5: ["12:00", "23:00"],
      6: ["12:00", "23:00"]
    }
  },

  pedido: {
    taxaEntrega: 6.00,
    freteGratisAcima: 60.00, // ou null
    chavePix: "COLOQUE_SUA_CHAVE_PIX_AQUI",
    permiteRetirada: true
  },

  cupons: {
    PRIMEIRO5: 0.05,
    ACAI10: 0.10
  },

  catalogo: {
    acai: {
      titulo: "Açaí",
      itens: [
        { id:"acai-300", nome:"Açaí Tradicional 300ml", preco: 12.90, desc:"Cremoso e gelado" },
        { id:"acai-500", nome:"Açaí Tradicional 500ml", preco: 18.90, desc:"O mais pedido" },
        { id:"acai-700", nome:"Açaí Tradicional 700ml", preco: 24.90, desc:"Pra dividir ou matar a fome" }
      ],
      adicionais: [
        { id:"ninho", nome:"Leite Ninho", preco: 3.00 },
        { id:"nutella", nome:"Nutella", preco: 5.00 },
        { id:"morango", nome:"Morango", preco: 4.00 },
        { id:"granola", nome:"Granola", preco: 2.00 },
        { id:"pacoca", nome:"Paçoca", preco: 2.00 },
        { id:"banana", nome:"Banana", preco: 2.00 },
        { id:"confete", nome:"Confete", preco: 2.00 },
        { id:"ovomaltine", nome:"Ovomaltine", preco: 4.00 }
      ],
      caldas: [
        { id:"sem", nome:"Sem calda", preco: 0.00 },
        { id:"choc", nome:"Chocolate", preco: 0.00 },
        { id:"mor", nome:"Morango", preco: 0.00 },
        { id:"car", nome:"Caramelo", preco: 0.00 }
      ]
    },

    bebidas: {
      titulo: "Bebidas",
      itens: [
        { id:"coca-lata", nome:"Coca-Cola Lata", preco: 6.00 },
        { id:"guarana-lata", nome:"Guaraná Lata", preco: 6.00 },
        { id:"agua", nome:"Água", preco: 3.00 },
        { id:"suco", nome:"Suco Natural", preco: 8.90 }
      ]
    },

    combos: {
      titulo: "Combos",
      itens: [
        { id:"combo-1", nome:"Combo 1", preco: 22.90, desc:"Açaí 500ml + bebida" },
        { id:"combo-2", nome:"Combo 2", preco: 29.90, desc:"Açaí 700ml + 2 adicionais" },
        { id:"combo-3", nome:"Combo Família", preco: 49.90, desc:"2x Açaí 500ml + 2 bebidas" }
      ]
    },

    sorvetes: {
      titulo: "Sorvetes",
      habilitado: true,
      itens: [
        { id:"sorv-2", nome:"Sorvete 2 bolas", preco: 10.90 },
        { id:"sorv-3", nome:"Sorvete 3 bolas", preco: 13.90 },
        { id:"picole", nome:"Picolé", preco: 5.00 }
      ]
    },

    hamburguer: {
      titulo: "Hambúrguer",
      itens: [
        { id:"burg-1", nome:"Hambúrguer Clássico", preco: 18.90, desc:"Pão, carne, queijo e molho" },
        { id:"burg-2", nome:"X-Bacon", preco: 22.90, desc:"Bacon crocante + queijo" },
        { id:"burg-3", nome:"X-Tudo", preco: 26.90, desc:"Completo e bem servido" }
      ]
    }
  }
};
