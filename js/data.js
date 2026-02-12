// js/data.js
window.SITE = {
  marca: {
    nome: "Seu Açaí",
    slogan: "Açaí cremoso • Entrega rápida",
    instagram: "https://instagram.com/",
    endereco: "Rua Exemplo, 123 — Centro",
    cidade: "Sua cidade - MG",
    whatsapp: "553198832407" // ✅ seu número
  },

  horario: {
    // 0=Dom ... 6=Sáb | null = fechado
    aberto: {
      0: null,
      1: ["10:00", "22:00"],
      2: ["10:00", "22:00"],
      3: ["10:00", "22:00"],
      4: ["10:00", "22:00"],
      5: ["10:00", "23:00"],
      6: ["10:00", "23:00"]
    }
  },

  pedido: {
    taxaEntrega: 6.00,
    freteGratisAcima: 60.00, // ou null
    chavePix: "SUA_CHAVE_PIX_AQUI",
    permiteRetirada: true
  },

  cupons: {
    ACAI10: 0.10,
    PRIMEIRO5: 0.05
  },

  catalogo: {
    acai: {
      titulo: "Açaí",
      itens: [
        { id:"acai-300", nome:"Açaí Tradicional 300ml", preco: 12.00, desc:"Cremoso e gelado" },
        { id:"acai-500", nome:"Açaí Tradicional 500ml", preco: 18.00, desc:"O mais pedido" },
        { id:"acai-700", nome:"Açaí Tradicional 700ml", preco: 24.00, desc:"Pra dividir ou matar a fome" }
      ],
      adicionais: [
        { id:"ninho", nome:"Leite Ninho", preco: 3.00 },
        { id:"nutella", nome:"Nutella", preco: 5.00 },
        { id:"morango", nome:"Morango", preco: 4.00 },
        { id:"granola", nome:"Granola", preco: 2.00 },
        { id:"pacoca", nome:"Paçoca", preco: 2.00 },
        { id:"banana", nome:"Banana", preco: 2.00 }
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
        { id:"suco", nome:"Suco Natural", preco: 8.00 }
      ]
    },

    combos: {
      titulo: "Combos",
      itens: [
        { id:"combo-1", nome:"Combo 1", preco: 22.00, desc:"Açaí 500ml + bebida" },
        { id:"combo-2", nome:"Combo 2", preco: 29.00, desc:"Açaí 700ml + 2 adicionais" }
      ]
    },

    sorvetes: {
      titulo: "Sorvetes",
      habilitado: true,
      itens: [
        { id:"sorv-2", nome:"Sorvete 2 bolas", preco: 10.00 },
        { id:"picole", nome:"Picolé", preco: 5.00 }
      ]
    }
  }
};

