(function () {
  const products = [
    {
      id: "firvt-vintage-washed-shirt",
      name: "FIRVT Vintage Washed Shirt",
      category: "Shirts",
      price: 100,
      oldPrice: 200,
      short: "Vintage washed finish with a smooth, structured drape.",
      description: "A clean vintage-washed shirt with a smooth hand-feel and a structured fall for everyday styling.",
      specs: ["Washed finish look", "Comfort fit", "Easy care"],
      featured: true,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F2A2BFC9-EC43-4271-85C4-5DE47D9FC8A0.jpg?v=1773643291",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F2A2BFC9-EC43-4271-85C4-5DE47D9FC8A0.jpg?v=1773643291",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/60C7F189-1839-4194-B480-06AE2041211C.jpg?v=1773643291",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/260B010E-B40E-4527-86DE-AF2A8983E248.jpg?v=1773643291",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/B71F768F-70F8-4058-B339-A549D3B469BB.jpg?v=1773643291"
      ]
    },
    {
      id: "raglan-waffle-lavender-t-shirt",
      name: "Raglan Waffle Lavender T-Shirt",
      category: "T-Shirts",
      price: 200,
      oldPrice: 250,
      short: "Waffle-knit texture with breathable, all-day comfort.",
      description: "A premium waffle-knit tee in lavender, made for a structured fall and comfortable everyday wear.",
      specs: ["Waffle-knit texture", "Breathable feel", "Everyday comfort"],
      featured: true,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/FC1806DA-B230-41C7-85CB-F39676D1E08C.jpg?v=1773139920",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/FC1806DA-B230-41C7-85CB-F39676D1E08C.jpg?v=1773139920",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/29ACE02A-FC54-4193-A4BF-FD114CA01614.jpg?v=1773146457",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/0DDDE981-4B07-4B41-9E87-5B806EF72753.jpg?v=1773146457",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/ADB3954D-2117-46B7-8023-2A8110A83AAD.jpg?v=1773146457"
      ]
    },
    {
      id: "raglan-waffle-gray-t-shirt",
      name: "Raglan Waffle Gray T-Shirt",
      category: "T-Shirts",
      price: 250,
      oldPrice: 300,
      short: "Textured waffle-knit tee with a clean, structured look.",
      description: "A premium waffle-knit tee in gray with a structured fall and breathable comfort for daily wear.",
      specs: ["Waffle-knit texture", "Structured fall", "Soft on skin"],
      featured: true,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/6A225D8F-1435-45A7-AEAA-B4134746AF6B.jpg?v=1773140061",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/6A225D8F-1435-45A7-AEAA-B4134746AF6B.jpg?v=1773140061",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/2C83E7DC-C93E-46FE-B9A9-A1A7457E40A3.jpg?v=1773146467",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F48A2467-CB38-4156-9F71-AEE8C073A485.jpg?v=1773146467",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/8382E49A-9ADA-4A95-AB2D-18DC2AF53640.jpg?v=1773146467"
      ]
    },
    {
      id: "firvt-charcoal-washed-polo",
      name: "FIRVT Charcoal Washed Polo",
      category: "Polos",
      price: 300,
      oldPrice: 350,
      short: "Charcoal washed polo with a naturally faded depth.",
      description: "A washed charcoal polo with a lived-in look and premium feel, styled for clean everyday fits.",
      specs: ["Washed finish look", "Polo collar", "Daily wear comfort"],
      featured: true,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F29EF603-C5B0-497F-9330-5A5D6AD09EFA.jpg?v=1772274873",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F29EF603-C5B0-497F-9330-5A5D6AD09EFA.jpg?v=1772274873",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/79932DDD-744A-4EAF-B618-96933C8F985E.jpg?v=1772274873",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/EBF004D5-4DFA-4E4A-99AD-D406B2C028E7.jpg?v=1772274875",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/DEB0D440-90F5-4CE6-84B9-780ADD4533A2.jpg?v=1772274873"
      ]
    },
    {
      id: "signature-rib-polo-black",
      name: "Signature Rib Polo Black",
      category: "Polos",
      price: 350,
      oldPrice: 400,
      short: "Rib polo built for comfort with a clean, premium look.",
      description: "A black rib polo with a comfortable feel and a sharp, minimal profile for daily outfits.",
      specs: ["Rib texture feel", "Comfort stretch", "Clean minimal look"],
      featured: false,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/9A8686DE-29BF-426D-8A6A-0A1185E871CF.jpg?v=1770807348",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/9A8686DE-29BF-426D-8A6A-0A1185E871CF.jpg?v=1770807348",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/3D64A247-2768-403B-B329-F1909EEE4009.jpg?v=1770807348",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/FE894A84-2967-4042-96CD-2CBB653DC571.jpg?v=1770807348",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/0C510347-0BB7-4EEB-877C-FA1BE8B94A51.jpg?v=1770807348"
      ]
    },
    {
      id: "cream-waffle-t-shirt",
      name: "Cream Waffle T-Shirt",
      category: "T-Shirts",
      price: 400,
      oldPrice: 400,
      short: "Cream waffle-knit essential with a clean structure.",
      description: "A cream waffle-knit tee that feels breathable and looks structured for everyday outfits.",
      specs: ["Waffle-knit texture", "Clean cream tone", "Everyday comfort"],
      featured: false,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/DFA600CA-81E7-4117-ACB6-7E60C5870949.jpg?v=1770107953",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/DFA600CA-81E7-4117-ACB6-7E60C5870949.jpg?v=1770107953",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F59D7768-B723-47ED-A123-BE00E9C452B0.jpg?v=1770107953",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/D7A8128F-A6BC-49DA-8933-F18BE1EE4945.jpg?v=1770107953",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F19CF423-BED6-4172-BD29-8A17C878A70E.jpg?v=1770107953"
      ]
    },
    {
      id: "washed-grey-sword-waffle-t-shirt",
      name: "Washed Grey Sword Waffle T-Shirt",
      category: "T-Shirts",
      price: 100,
      oldPrice: 200,
      short: "Washed grey waffle-knit tee with a bold, textured look.",
      description: "A washed grey waffle-knit tee that balances structure, comfort, and standout texture.",
      specs: ["Waffle-knit texture", "Washed grey look", "Comfort fit"],
      featured: false,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/E2624817-E86A-4A45-9E6A-192FD324569D.jpg?v=1770107907",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/E2624817-E86A-4A45-9E6A-192FD324569D.jpg?v=1770107907",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/FC29A93C-7522-4556-913A-D8B6F463F305.jpg?v=1770107907",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/40007F5A-8ABC-4DD5-8D84-8C07F813FD60.jpg?v=1770107907",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/2BD46DE5-3C82-48D5-843F-F484EFC4D005.jpg?v=1770107907"
      ]
    },
    {
      id: "almighty-tiger-orange-t-shirt",
      name: "Almighty Tiger Orange T-Shirt",
      category: "Graphics",
      price: 200,
      oldPrice: 250,
      short: "Bold orange tee with a fierce tiger graphic.",
      description: "A graphic tee designed for a bold look, with a standout tiger print and comfy everyday feel.",
      specs: ["Graphic print", "Comfort fit", "Statement color"],
      featured: false,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/1C8077D4-5C67-4F03-8AFB-6D570DE342ED.jpg?v=1746871680",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/1C8077D4-5C67-4F03-8AFB-6D570DE342ED.jpg?v=1746871680",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/67F6DDBB-A2C2-4E23-B36E-70AF245AB6CE.jpg?v=1746871680",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/E41FB4C9-E8E3-445E-95C4-A32A387244CB.jpg?v=1746871680",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/A38D691E-0587-4EDB-A7A8-87BE0D742C62.jpg?v=1746871680"
      ]
    },
    {
      id: "blue-striped-bowling-shirt",
      name: "Blue Striped Bowling Shirt",
      category: "Shirts",
      price: 250,
      oldPrice: 300,
      short: "Oversized bowling shirt with classic blue stripes.",
      description: "A striped bowling shirt with an oversized vibe, built for clean layering and easy styling.",
      specs: ["Oversized look", "Classic stripes", "Comfort wear"],
      featured: false,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F0542A0A-46B3-4BC5-9189-8F8E1EAC2E0F.jpg?v=1720330712",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/F0542A0A-46B3-4BC5-9189-8F8E1EAC2E0F.jpg?v=1720330712",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/A7FC293D-C30F-4DED-8ADF-8E389B0A3715.jpg?v=1720330712",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/6B9818AB-B601-488C-BD68-D8CC4C9E565D.jpg?v=1720330712",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/BBA8DED8-855E-4CCF-B7FE-F15E45E7A3AA.jpg?v=1720330712"
      ]
    },
    {
      id: "cozy-hoodie-grey",
      name: "Cozy Hoodie Grey",
      category: "Hoodies",
      price: 300,
      oldPrice: 350,
      short: "Heavy comfort hoodie in grey for everyday warmth.",
      description: "A cozy grey hoodie built for comfort with a soft feel and a relaxed everyday fit.",
      specs: ["Soft feel", "Warm layer", "Relaxed fit"],
      featured: false,
      image: "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/7100F302-C5EA-476D-A115-A7205B75E315.jpg?v=1703838955",
      images: [
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/7100F302-C5EA-476D-A115-A7205B75E315.jpg?v=1703838955",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/1CC48AE7-FAF3-4558-983F-B8C4FD039150.jpg?v=1703839018",
        "https://cdn.shopify.com/s/files/1/0622/7643/6192/files/A9F08616-A73B-4A8F-84DE-AFB2F845B58A.jpg?v=1703839007"
      ]
    },
    {
      id: "amzn-b06wgzp21b",
      name: "Maybelline New York Kajal (Matte Black)",
      category: "Cosmetics",
      price: 350,
      oldPrice: 400,
      short: "Matte black kajal for quick, bold everyday eyes.",
      description: "A popular matte-finish kajal for simple, clean definition. Great for everyday use and quick touchups.",
      specs: ["Matte black finish", "Smooth glide application", "Everyday eye makeup"],
      featured: true,
      image: "https://m.media-amazon.com/images/I/61b2tDBxhlL._SL1500_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/61b2tDBxhlL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/619wihOaeLL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71s2yFM92eL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/71vnmZ7K8AL._SL1500_.jpg"
      ]
    },
    {
      id: "amzn-b0828vx6nq",
      name: "Lakme Forever Matte Liquid Lipstick (Nude Dream)",
      category: "Cosmetics",
      price: 400,
      oldPrice: 400,
      short: "Lightweight matte liquid lipstick with a nude tone.",
      description: "A long-wear matte liquid lipstick in a flattering nude shade for daily looks and special occasions.",
      specs: ["Matte finish look", "Transfer-resistant wear", "Comfortable lightweight feel"],
      featured: false,
      image: "https://m.media-amazon.com/images/I/41atIsFBMlL._SL1000_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/41atIsFBMlL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/41YVzerCAgL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/61-dRd0VPZL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/51PSLxEAuWL._SL1000_.jpg"
      ]
    },
    {
      id: "amzn-b07s141t2r",
      name: "Maybelline Colossal Bold Liner (Black)",
      category: "Cosmetics",
      price: 100,
      oldPrice: 200,
      short: "Bold black eyeliner for sharp, clean lines.",
      description: "A daily-use eyeliner designed for bold definition. Use it for winged looks or simple line work.",
      specs: ["Bold black look", "Precise tip control", "Everyday wear"],
      featured: false,
      image: "https://m.media-amazon.com/images/I/413yzxupVTL._SL1001_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/413yzxupVTL._SL1001_.jpg",
        "https://m.media-amazon.com/images/I/61wypCxM32L._SL1001_.jpg",
        "https://m.media-amazon.com/images/I/61sDNbRO4uL._SL1001_.jpg",
        "https://m.media-amazon.com/images/I/71ZwwgVzqxL._SL1001_.jpg"
      ]
    },
    {
      id: "amzn-b079nhby1y",
      name: "Lakme Sun Expert Ultra Matte SPF 40 Compact",
      category: "Cosmetics",
      price: 200,
      oldPrice: 250,
      short: "Matte compact for a fresh look and even tone.",
      description: "A compact powder that helps set makeup and reduce shine for a clean, matte finish throughout the day.",
      specs: ["Ultra matte look", "Helps reduce shine", "Easy to carry"],
      featured: false,
      image: "https://m.media-amazon.com/images/I/518iGIk-rAL._SL1000_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/518iGIk-rAL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/61RZCqezHmL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/51jOgatN+cL._SL1000_.jpg",
        "https://m.media-amazon.com/images/I/61mxyTvydeL._SL1000_.jpg"
      ]
    },
    {
      id: "amzn-b00d2xgt8y",
      name: "Maybelline Colossal Mascara (Waterproof Black)",
      category: "Cosmetics",
      price: 250,
      oldPrice: 300,
      short: "Volumizing and lengthening mascara for bold lashes.",
      description: "A classic waterproof mascara for fuller-looking lashes with a bold black finish.",
      specs: ["Volumizing look", "Lengthening effect", "Waterproof wear"],
      featured: false,
      image: "https://m.media-amazon.com/images/I/51PQhsaEcLL._SL1001_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/51PQhsaEcLL._SL1001_.jpg",
        "https://m.media-amazon.com/images/I/61HEOy4HrIL._SL1001_.jpg",
        "https://m.media-amazon.com/images/I/617NaFysFmL._SL1001_.jpg",
        "https://m.media-amazon.com/images/I/61U-9c0eqPL._SL1001_.jpg"
      ]
    },
    {
      id: "amzn-b0746kyg4m",
      name: "INSIGHT 3-in-1 Primer (Matte Finish)",
      category: "Cosmetics",
      price: 300,
      oldPrice: 350,
      short: "Primer for a smoother base with a matte finish.",
      description: "A 3-in-1 primer that helps prep skin for makeup and create a smoother-looking base.",
      specs: ["Matte finish base", "Smoother-looking skin", "Makeup prep primer"],
      featured: false,
      image: "https://m.media-amazon.com/images/I/51uPwFljZwL._SL1200_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/51uPwFljZwL._SL1200_.jpg",
        "https://m.media-amazon.com/images/I/614hvHLNt-L._SL1200_.jpg",
        "https://m.media-amazon.com/images/I/81B6-EtMaHL._SL1500_.jpg",
        "https://m.media-amazon.com/images/I/61cp+aJwYqL._SL1200_.jpg"
      ]
    },
    {
      id: "mens-ns-lycra-track-pants-combo",
      name: "Men's NS Lycra Track Pants Combo (Pack of 2)",
      category: "Track Pants",
      price: 1099,
      oldPrice: 2260,
      short: "Stretchable slim fit Lycra track pants – perfect for gym, running & casual wear.",
      description: "Upgrade your daily wear with this premium combo of men's Lycra track pants. Designed for comfort, flexibility, and modern style — perfect for gym, running, or casual outings. Pack of 2, premium Lycra fabric, slim fit design with zipper pockets.",
      specs: ["Pack of 2", "Premium Lycra Fabric – Stretchable & Durable", "Slim Fit Design", "Zipper Pockets", "Breathable & Lightweight"],
      featured: true,
      image: "https://cdn.shopify.com/s/files/1/0698/0711/2362/files/6565851992.jpg?v=1774277018",
      images: [
        "https://cdn.shopify.com/s/files/1/0698/0711/2362/files/6565851992.jpg?v=1774277018",
        "https://cdn.shopify.com/s/files/1/0698/0711/2362/files/6615778367.jpg?v=1774277018",
        "https://cdn.shopify.com/s/files/1/0698/0711/2362/files/4477194280.jpg?v=1774277018"
      ]
    }
  ];

  function formatInr(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  window.PRODUCTS = products;
  window.getProductById = function (id) {
    return products.find(function (item) {
      return item.id === id;
    });
  };
  window.formatInr = formatInr;
})();
