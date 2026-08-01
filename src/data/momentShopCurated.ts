import type { OverrideItem } from "@/data/lookOverrides";


/**
 * Moment-level curated Complete Edit. When present for a moment slug, this
 * replaces the founder / fallback shop entries with an editor-approved,
 * ordered list of pieces (Corset → Pant → Shoe → Bag → Earrings → Necklace →
 * Bracelet → Ring for eveningwear moments). Every entry must resolve to a
 * usable http(s) retailer URL — `isUsableShopUrl` still gates rendering.
 */
export const MOMENT_SHOP_CURATED: Record<string, OverrideItem[]> = {
  "beach-club": [
    {
      slotLabel: "The Look",
      category: "Dress",
      brand: "Poupette St Barth",
      title: "Estelle Printed Satin Minidress",
      url: "https://www.mytheresa.com/us/en/women/poupette-st-barth-estelle-printed-satin-minidress-multicoloured-p01042379",
      image: "",
    },
  ],
  "long-lunch": [
    {
      slotLabel: "The Look",
      category: "Dress",
      brand: "L'AGENCE",
      title: "Rima Belted Front Zip Midi Dress",
      price: "$525",
      url: "https://www.nordstrom.com/s/lagence-rima-belted-front-zip-midi-dress/8005286",
      image: "",
    },
    {
      slotLabel: "Shoes",
      category: "Shoe",
      brand: "Aquazzura",
      title: "So Nude 50 Leather Sandals — Tan",
      url: "https://www.net-a-porter.com/en-us/shop/product/aquazzura/shoes/mid-heel/so-nude-50-leather-sandals/1647597331686929",
      image: "",
    },
    {
      slotLabel: "Bag",
      category: "Bag",
      brand: "Dragon Diffusion",
      title: "Santa Croce Woven Leather Tote — Tan",
      url: "https://www.dragondiffusion.com/collections/all/products/santa-croce-tan",
      image: "",
    },
    {
      slotLabel: "Sunglasses",
      category: "Sunglasses",
      brand: "CELINE",
      title: "Triomphe Cat-Eye Sunglasses — Champagne Crystal",
      url: "https://www.neimanmarcus.com/p/celine-triomphe-cat-eye-sunglasses-prod284390071",
      image: "",
    },
    {
      slotLabel: "Earrings",
      category: "Earrings",
      brand: "Persée",
      title: "18-karat Gold Diamond Hoop Earrings",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/hoop-earrings/18-karat-gold-diamond-hoop-earrings/46376663163019982",
      image: "",
    },
    {
      slotLabel: "Bracelet",
      category: "Bracelet",
      brand: "Persée",
      title: "Floating 18-karat Gold Diamond Bracelet",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/fine-bracelets/floating-18-karat-gold-diamond-bracelet/46376663163019984",
      image: "",
    },
    {
      slotLabel: "Ring",
      category: "Ring",
      brand: "Persée",
      title: "Floating 18-karat Gold Diamond Ring",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/stone-rings/floating-18-karat-gold-diamond-ring/46376663163019978",
      image: "",
    },
  ],
  "riviera-dinner": [
    {
      slotLabel: "Hero Piece",
      category: "Dress",
      brand: "Zimmermann",
      title: "Roselight Floral Linen Midi Dress — Beige",
      url: "https://www.mytheresa.com/us/en/women/zimmermann-roselight-floral-linen-midi-dress-beige-p01188192",
      image: "",
    },
    {
      slotLabel: "Shoes",
      category: "Shoe",
      brand: "Aquazzura",
      title: "Talk To Me Sandals — Soft Gold",
      url: "https://www.nordstrom.com/s/talk-to-me-sandal-women/8603427",
      image: "",
    },
    {
      slotLabel: "Bag",
      category: "Bag",
      brand: "Jimmy Choo",
      title: "Emmie Clutch — Champagne Gold Metallic",
      url: "https://www.jimmychoo.com/en-us/women/bags/clutch-bags/emmie",
      image: "",
    },
    {
      slotLabel: "Earrings",
      category: "Earrings",
      brand: "Persée",
      title: "18-karat Gold Diamond Hoop Earrings",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/hoop-earrings/18-karat-gold-diamond-hoop-earrings/46376663163019982",
      image: "",
    },
    {
      slotLabel: "Necklace",
      category: "Necklace",
      brand: "Persée",
      title: "Danaé 18-karat Gold Diamond Necklace",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/pendant-necklaces/danae-18-karat-gold-diamond-necklace/1647597333351101",
      image: "",
    },
    {
      slotLabel: "Bracelet",
      category: "Bracelet",
      brand: "Persée",
      title: "Floating 18-karat Gold Diamond Bracelet",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/fine-bracelets/floating-18-karat-gold-diamond-bracelet/46376663163019984",
      image: "",
    },
    {
      slotLabel: "Ring",
      category: "Ring",
      brand: "Persée",
      title: "Floating 18-karat Gold Diamond Ring",
      url: "https://www.net-a-porter.com/en-us/shop/product/persee/jewelry-and-watches/stone-rings/floating-18-karat-gold-diamond-ring/46376663163019978",
      image: "",
    },
  ],
  "pool-lounging": [
    {
      slotLabel: "The Look",
      category: "Skirt",
      brand: "Alexandra Miro",
      title: "Jaimeee Skirt — Red Capri",
      url: "https://alexandramiro.com/collections/ready-to-wear/products/jaimee-skirt-red-capri",
      image: "",
    },
    {
      slotLabel: "The Look",
      category: "Swim",
      brand: "Alexandra Miro",
      title: "Zella Bikini Top — Red Capri",
      url: "https://www.mytheresa.com/us/en/women/alexandra-miro-zella-floral-bikini-top-red-p01203896",
      image: "",
    },
    {
      slotLabel: "The Look",
      category: "Swim",
      brand: "Alexandra Miro",
      title: "Elise Frill Bikini Bottom — Red Capri",
      url: "https://www.mytheresa.com/us/en/women/alexandra-miro-zella-floral-bikini-bottoms-red-p01203898",
      image: "",
    },
    {
      slotLabel: "Shoes",
      category: "Shoe",
      brand: "Gianvito Rossi",
      title: "Luana 85 metallic leather sandals in gold",
      url: "https://www.mytheresa.com/us/en/women/gianvito-rossi-luana-85-metallic-leather-sandals-gold-p01106014",
      image: "",
    },
    {
      slotLabel: "Bag",
      category: "Bag",
      brand: "Saint Laurent",
      title: "Cassandre Large Raffia Pouch",
      url: "https://www.mytheresa.com/us/en/women/saint-laurent-cassandre-large-raffia-pouch-beige-p00918232",
      image: "",
    },
    {
      slotLabel: "Sunglasses",
      category: "Sunglasses",
      brand: "CELINE",
      title: "Triomphe Havana Sunglasses",
      url: "https://www.neimanmarcus.com/p/celine-triomphe-cat-eye-sunglasses-prod284390071",
      image: "",
    },
    {
      slotLabel: "Necklace",
      category: "Necklace",
      brand: "EF Collection",
      title: "14K Yellow Gold Diamond Mini Disc Pendant Necklace (16-18in)",
      url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-diamond-mini-disc-pendant-necklace-16-18?ID=4992549",
      image: "",
    },
    {
      slotLabel: "Earrings",
      category: "Earrings",
      brand: "Moon Meadow",
      title: "14K Yellow Gold Diamond Circle Stud Earrings",
      url: "https://www.bloomingdales.com/shop/product/moon-meadow-14k-yellow-gold-diamond-circle-stud-earrings-exclusive?ID=3822029&tdp=cm_app~zBCOM-NAVAPP~xcm_zone~zPDP_ZONE_I~xcm_choiceId~zcidB9CSHX-6f4df622-5823-4ce8-9fbf-c1aa7c7f52a0@HG1@SIMILAR%2BSTYLES$3376$3822111~xcm_pos~zPos4~xcm_srcCatID~z3376",
      image: "",
    },
    {
      slotLabel: "Bracelet",
      category: "Bracelet",
      brand: "EF Collection",
      title: "14K Yellow Gold Lola Open Mini Chain Link Bracelet",
      url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-lola-open-mini-chain-link-bracelet?ID=4992610",
      image: "",
    },
    {
      slotLabel: "Ring",
      category: "Ring",
      brand: "EF Collection",
      title: "14K Yellow Gold Diamond Bezel Stack Ring",
      url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-diamond-bezel-stack-ring?ID=4992556",
      image: "",
    },
  ],
  nightcap: [
    {
      slotLabel: "The Look",
      category: "Corset",
      brand: "Citizens of Humanity",
      title: "Darya Corset Top",
      price: "$228",
      url: "https://www.citizensofhumanity.com/products/darya-corset-top-in-black",
      image: "",
    },
    {
      category: "Pant",
      slotLabel: "Pant",
      brand: "Enza Costa",
      title: "Satin Wide Leg Pant",
      price: "$225",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
    },
    {
      category: "Shoe",
      slotLabel: "Shoe",
      brand: "Aquazzura",
      title: "Minimalist Gold Sandal",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
    },
    {
      category: "Bag",
      slotLabel: "Bag",
      brand: "Cult Gaia",
      title: "Sculptural Metallic Gold Clutch",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
    },
    {
      category: "Earrings",
      slotLabel: "Earrings",
      brand: "Jennifer Behr",
      title: "Sculptural Gold Drop Earrings",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
      isOptional: true,
    },
    {
      category: "Necklace",
      slotLabel: "Necklace",
      brand: "Jennifer Meyer",
      title: "Delicate Gold Pendant Necklace",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
      isOptional: true,
    },
    {
      category: "Bracelet",
      slotLabel: "Bracelet",
      brand: "Jennifer Meyer",
      title: "Slim Polished Gold Bracelet",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
      isOptional: true,
    },
    {
      category: "Ring",
      slotLabel: "Ring",
      brand: "Sophie Buhai",
      title: "Sculptural Gold Ring",
      // Non-PDP link removed (was a retailer search/category page).
      // Slot is intentionally left unsourced until an exact product URL exists.
      url: "",
      unsourced: true,
      image: "",
      isOptional: true,
    },
  ],
};
