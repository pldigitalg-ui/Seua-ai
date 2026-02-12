2/ js/data.js
window.SITE = {
  brand: {
    name: "Seu Açaí",
    slogan: "Açaí cremoso • Entrega rápida",
    instagram: "https://instagram.com/",
    address: "Sua rua, 123 — Seu bairro",
    city: "Sua cidade - MG",
    phoneWhatsapp: "553198832407" // ✅ seu número
  },

  hours: {
    // 0=Dom ... 6=Sáb
    timezone: "America/Sao_Paulo",
    open: {
      0: null,                 // domingo fechado (null)
      1: ["10:00", "22:00"],
      2: ["10:00", "22:00"],
      3: ["10:00", "22:00"],
      4: ["10:00", "22:00"],
      5: ["10:00", "23:00"],
      6: ["10:00", "23:00"]
    }
  },

  checkout: {
    deliveryFee: 6.00,
    freeDeliveryOver: 60.00, // frete grátis acima disso (ou null)
    pixKey: "SUA_CHAVE_PIX_AQUI",
    allowPickup: true
  },

  coupons: {
    // CUPOM: percentual (0.10 = 10%)
    ACAI10: 0.10,
    PRIMEIRO5: 0.05
  },

  catalog: {
    acai: {
      title: "Açaí",
      items: [
        { id:"acai-300", name:"Açaí Tradicional 300ml", price: 12.00, desc:"Cremoso e gelado" },
        { id:"acai-500", name:"Açaí Tradicional 500ml", price: 18.00, desc:"O mais pedido" },
        { id:"acai-700", name:"Açaí Tradicional 700ml", price: 24.00, desc:"Pra dividir ou matar a fome" }
      ],
      addons: [
        { id:"ninho", name:"Leite Ninho", price: 3.00 },
        { id:"nutella", name:"Nutella", price: 5.00 },
        { id:"morango", name:"Morango", price: 4.00 },
        { id:"granola", name:"Granola", price: 2.00 },
        { id:"paçoca", name:"Paçoca", price: 2.00 },
        { id:"banana", name:"Banana", price: 2.00 }
      ],
      syrups: [
        { id:"choc", name:"Calda de Chocolate", price: 0.00 },
        { id:"mor", name:"Calda de Morango", price: 0.00 },
        { id:"car", name:"Caramelo", price: 0.00 }
      ]
    },

    bebidas: {
      title: "Bebidas",
      items: [
        { id:"coca-lata", name:"Coca-Cola Lata", price: 6.00 },
        { id:"guarana-lata", name:"Guaraná Lata", price: 6.00 },
        { id:"agua", name:"Água", price: 3.00 },
        { id:"suco", name:"Suco Natural", price: 8.00 }
      ]
    },

    combos: {
      title: "Combos",
      items: [
        { id:"combo-1", name:"Combo 1", price: 22.00, desc:"Açaí 500ml + bebida" },
        { id:"combo-2", name:"Combo 2", price: 29.00, desc:"Açaí 700ml + 2 adicionais" }
      ]
    },

    sorvetes: {
      title: "Sorvetes",
      enabled: true, // se não vender, coloca false
      items: [
        { id:"sorv-2", name:"Sorvete 2 bolas", price: 10.00 },
        { id:"picole", name:"Picolé", price: 5.00 }
      ]
    }
  }
};

