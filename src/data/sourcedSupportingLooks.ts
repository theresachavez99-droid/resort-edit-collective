/**
 * Verified sourcing output for the missing "More Resort Edit Looks" supporting
 * looks, produced by scripts/source-look-products.mjs on 2026-08-01T11:23:59.325Z.
 *
 * Every entry with `unsourced: false` was confirmed against a live product
 * detail page on an approved affiliate-friendly retailer (Revolve, Shopbop,
 * Saks, Neiman Marcus, Nordstrom, Bloomingdale's) with a slot- and
 * gender-appropriate product title and no sold-out signal. Entries with
 * `unsourced: true` are held as explicit omissions — never published with a
 * placeholder or category link.
 */
export type SourcedSupportingProduct = {
  slot: string;
  name: string | null;
  url: string | null;
  retailer: string | null;
  unsourced: boolean;
};

export type SourcedSupportingLook = {
  moment: string;
  key: string;
  title: string;
  products: SourcedSupportingProduct[];
};

export const SOURCED_SUPPORTING_LOOKS: SourcedSupportingLook[] = [
  {
    "moment": "espresso-morning",
    "key": "lemon-at-first-light",
    "title": "Lemon at First Light",
    "products": [
      {
        "slot": "Dress",
        "name": "Cinq à Sept Marcie Dress",
        "url": "https://www.shopbop.com/marcie-dress-cinq-sept/vp/v=1/1583033624.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Castañer Carina Wedge Espadrilles",
        "url": "https://www.shopbop.com/carina-wedge-espadrilles-castaner/vp/v=1/1579073044.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Cult Gaia Mercier Woven Tote",
        "url": "https://www.shopbop.com/mercier-tote-cult-gaia/vp/v=1/1541407497.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Jennifer Behr Aaryn Earrings",
        "url": "https://www.shopbop.com/aaryn-earrings-jennifer-behr/vp/v=1/1549416702.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Kalan by Suzanne Kalan 14k Gold Diamond Bar Pendant Necklace",
        "url": "https://www.shopbop.com/diamond-bar-pendant-kalan-by/vp/v=1/1523847507.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Sunglasses",
        "name": "Le Specs Impossible Sunglasses",
        "url": "https://www.shopbop.com/impossible-2452375-le-specs/vp/v=1/1545368265.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Hat",
        "name": "Lack Of Color The Cove Straw Hat",
        "url": "https://www.shopbop.com/cove-lack-color/vp/v=1/1541069742.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "espresso-morning",
    "key": "stripes-on-the-steps",
    "title": "Stripes on the Steps",
    "products": [
      {
        "slot": "Set · Top",
        "name": "SIR. Marais Shirt",
        "url": "https://www.shopbop.com/marais-shirt-sir/vp/v=1/1586127434.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Set · Skirt",
        "name": "SIR. Cooper Maxi Skirt",
        "url": "https://www.shopbop.com/cooper-maxi-skirt-sir/vp/v=1/1529407658.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Loeffler Randall Karly Strappy Flat Sandals",
        "url": "https://www.shopbop.com/karly-strappy-flat-sandal-loeffler/vp/v=1/1524326763.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "STAUD Maude Leather Shoulder Bag (Women)",
        "url": "https://www.nordstrom.com/s/staud-maude-leather-shoulder-bag/8234422",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Sunglasses",
        "name": "Oliver Peoples Forman L.A. 51mm Polarized Round Sunglasses (Women)",
        "url": "https://www.nordstrom.com/s/oliver-peoples-forman-l-a-51mm-polarized-round-sunglasses/5292019",
        "retailer": "nordstrom.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "yacht-day",
    "key": "navy-at-anchor",
    "title": "Navy at Anchor",
    "products": [
      {
        "slot": "Set · Shirt",
        "name": "POSSE Lucia Linen Blouse",
        "url": "https://www.shopbop.com/lucia-blouse-posse/vp/v=1/1536208444.htm?colorSin=2038812776&fm=pd_detail_2_btp_bv",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Set · Trousers",
        "name": "Posse Lorenzo Pant in Seagrass Stripe",
        "url": "https://www.revolve.com/posse-lorenzo-pant-in-seagrass-stripe/dp/PSSE-WP2/",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Ancient Greek Sandals Iro Flats",
        "url": "https://www.shopbop.com/iro-flat-ancient-greek-sandals/vp/v=1/1542516509.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "DeMellier The Stockholm Leather Top Handle Bag (Women)",
        "url": "https://www.nordstrom.com/s/demellier-the-stockholm-leather-top-handle-bag/8741956",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "JENNY BIRD Small Staple Hoop Earrings (Women)",
        "url": "https://www.nordstrom.com/s/jenny-bird-small-staple-hoop-earrings/8045528",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Oradina 14K Yellow Gold Icon Pendant Necklace",
        "url": "https://www.saksfifthavenue.com/product/oradina-14k-yellow-gold-icon-pendant-necklace-0400020676312.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "JENNY BIRD Slim Penelope Bracelet (Women)",
        "url": "https://www.nordstrom.com/s/slim-penelope-bracelet/8552859",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Ring",
        "name": "By Pariah 14k Gold Slim Classic Diamond Ring Stack Set",
        "url": "https://www.shopbop.com/slim-classic-ring-stack-by/vp/v=1/1548943874.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Sunglasses",
        "name": "CELINE Bold 3 Dots 52mm Geometric Sunglasses (Women)",
        "url": "https://www.nordstrom.com/s/bold-3-dots-52mm-geometric-sunglasses/8286484",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Hat",
        "name": "Lack Of Color Shoal Bucket Hat",
        "url": "https://www.shopbop.com/shoal-bucket-hat-lack-color/vp/v=1/1584143842.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "yacht-day",
    "key": "white-sail-blue-sea",
    "title": "White Sail, Blue Sea",
    "products": [
      {
        "slot": "Swim",
        "name": "Vix Swimwear Liza Brazilian One Piece Swimsuit in Firenze White",
        "url": "https://www.revolve.com/vix-swimwear-liza-brazilian-one-piece-swimsuit-in-firenze-white/dp/VIXS-WX1351/",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Cover-Up",
        "name": "9seed Tunisia Caftan",
        "url": "https://www.shopbop.com/tunisia-short-sleeve-caftan-9seed/vp/v=1/1553425637.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Polo Ralph Lauren Leather Ring Wrap Flat Sandals in Cuoio",
        "url": "https://www.revolve.com/polo-ralph-lauren-leather-ring-wrap-flat-sandals-in-cuoio/dp/PLOR-WZ11/?currency=GBP&d=F",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Sunglasses",
        "name": "Quay On Brand Sunglasses",
        "url": "https://www.shopbop.com/brand-quay/vp/v=1/1575305018.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "beach-club",
    "key": "terracotta-terrace",
    "title": "Terracotta Terrace",
    "products": [
      {
        "slot": "Kaftan",
        "name": "BAOBAB Blake Maxi Dress",
        "url": "https://www.shopbop.com/blake-maxi-dress-baobab/vp/v=1/1550093142.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Polo Ralph Lauren Leather Ring Wrap Flat Sandals in Cuoio",
        "url": "https://www.revolve.com/polo-ralph-lauren-leather-ring-wrap-flat-sandals-in-cuoio/dp/PLOR-WZ11/?currency=GBP&d=F",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Necklace",
        "name": "Kalan by Suzanne Kalan 14k Gold Diamond Bar Pendant Necklace",
        "url": "https://www.shopbop.com/diamond-bar-pendant-kalan-by/vp/v=1/1523847507.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Sunglasses",
        "name": "Chloé Oversized Metal Sunglasses",
        "url": "https://www.shopbop.com/oversized-metal-sunglasses-chlo/vp/v=1/1592741070.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Hat",
        "name": "Eugenia Kim Jonah Hat",
        "url": "https://www.shopbop.com/jonah-hat-eugenia-kim/vp/v=1/1543922704.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "beach-club",
    "key": "cobalt-at-the-cabana",
    "title": "Cobalt at the Cabana",
    "products": [
      {
        "slot": "Swim",
        "name": "Runaway The Label BIKINI-OBERTEIL MIAMI in Bimini Blue",
        "url": "https://www.revolve.com/runaway-the-label-miami-bikini-top-in-bimini-blue/dp/RUNR-WX12/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Sarong",
        "name": "Palmacea Nori Sarong Pareo",
        "url": "https://www.shopbop.com/sarong-pareo-nori-palmacea/vp/v=1/1546534071.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "TKEES Mariana Sandals",
        "url": "https://www.shopbop.com/mariana-sandals-aninw/vp/v=1/1594426204.htm?colorSin=2008609470&fm=pd_detail_1_v2v_pt2_day0",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Sunglasses",
        "name": "Gucci 57mm Gradient Square Sunglasses (Women)",
        "url": "https://www.nordstrom.com/s/gucci-57mm-gradient-square-sunglasses/4541180",
        "retailer": "nordstrom.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "shopping",
    "key": "rosso-in-the-piazza",
    "title": "Rosso in the Piazza",
    "products": [
      {
        "slot": "Dress",
        "name": "Acler MIDI-KLEID DRESS in Burgundy",
        "url": "https://www.revolve.com/acler-whitnell-midi-dress-in-burgundy/dp/CELR-WD125/",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Alexandre Birman Vicky Knotted Leather Sandals",
        "url": "https://www.saksfifthavenue.com/product/alexandre-birman-vicky-knotted-leather-sandals-0400010980653.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Wandler Hortensia Bag Mini",
        "url": "https://www.shopbop.com/hortensia-bag-mini-wandler/vp/v=1/1533525650.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Sophie Blake Selena Scalloped Hoops",
        "url": "https://www.shopbop.com/selena-scalloped-hoops-sophie-blake/vp/v=1/1519038798.htm?colorSin=2090232764&fm=pd_detail_1_v2v_pt2_day0&sizeCode=314",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Sophie Blake Tyla Necklace",
        "url": "https://www.shopbop.com/tyla-necklace-sophie-blake-designs/vp/v=1/1505644281.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "Sophie Blake Tyla Bracelet",
        "url": "https://www.shopbop.com/tyla-bracelet-sophie-blake-designs/vp/v=1/1508002414.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Ring",
        "name": "Sophie Blake Adriana Ring",
        "url": "https://www.shopbop.com/adriana-ring-sophie-blake-designs/vp/v=1/1557040102.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Sunglasses",
        "name": "Saint Laurent 54mm Cat Eye Sunglasses (Women)",
        "url": "https://www.nordstrom.com/s/54mm-cat-eye-sunglasses/7650942",
        "retailer": "nordstrom.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "shopping",
    "key": "poplin-and-pleats",
    "title": "Poplin and Pleats",
    "products": [
      {
        "slot": "Shirt",
        "name": "Veronica Beard Aderes Shirt",
        "url": "https://www.shopbop.com/aderes-shirt-veronica-beard/vp/v=1/1507786261.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Skirt",
        "name": "Veronica Beard Olenna Skirt in Silver",
        "url": "https://www.revolve.com/veronica-beard-olenna-skirt-in-silver/dp/VBRD-WQ67/?currency=CAD&d=F",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Tory Burch Cap Toe Ballet Flat (Women)",
        "url": "https://www.nordstrom.com/s/tory-burch-cap-toe-ballet-flat-women/7535808",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Earrings",
        "name": "Kendra Scott Boxed Daphne Gold Drop Earrings (Women)",
        "url": "https://www.nordstrom.com/s/boxed-daphne-gold-drop-earrings/8416842",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "David Yurman Classic Cable Bracelet in Sterling Silver",
        "url": "https://www.saksfifthavenue.com/product/david-yurman-classic-cable-bracelet-in-sterling-silver-0400019049420.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Ring",
        "name": "David Yurman Sculpted Cable Ring In 18K Yellow Gold",
        "url": "https://www.saksfifthavenue.com/product/david-yurman-sculpted-cable-ring-in-18k-yellow-gold-0400020365676.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Sunglasses",
        "name": "Chloé Oversized Metal Sunglasses",
        "url": "https://www.shopbop.com/oversized-metal-sunglasses-chlo/vp/v=1/1592741070.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      }
    ]
  },
  {
    "moment": "harbor-aperitivo",
    "key": "spritz-hour-in-coral",
    "title": "Spritz Hour in Coral",
    "products": [
      {
        "slot": "Dress",
        "name": "Zimmermann Wanderlust Corset Midi Dress",
        "url": "https://www.shopbop.com/wanderlust-corset-midi-dress-zimmermann/vp/v=1/1590188052.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Gianvito Rossi Piper 45MM Suede Block Heel Pumps",
        "url": "https://www.saksfifthavenue.com/product/gianvito-rossi-piper-45mm-suede-block-heel-pumps-0400018693690.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Cult Gaia Solene Mini Top Handle Bag",
        "url": "https://www.shopbop.com/solene-mini-top-handle-cult/vp/v=1/1575863892.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Anni Lu Under The Sun Earrings",
        "url": "https://www.shopbop.com/under-sun-earrings-anni-lu/vp/v=1/1537443669.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Anni Lu Oh So Fine Necklace",
        "url": "https://www.shopbop.com/fine-necklace-anni-lu/vp/v=1/1579335756.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "Anni Lu Scarlet Wave Bracelet",
        "url": "https://www.shopbop.com/scarlet-wave-bracelet-anni-lu/vp/v=1/1557674261.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      }
    ]
  },
  {
    "moment": "harbor-aperitivo",
    "key": "black-silk-gold-light",
    "title": "Black Silk, Gold Light",
    "products": [
      {
        "slot": "Top",
        "name": "L'AGENCE TOP AUS SPITZE PRIYA in Black",
        "url": "https://www.revolve.com/lagence-priya-lace-cami-in-black/dp/LAGR-WS406/",
        "retailer": "revolve.com",
        "unsourced": false
      },
      {
        "slot": "Skirt",
        "name": "L'AGENCE Tico Lace Midi Skirt",
        "url": "https://www.shopbop.com/tico-lace-midi-skirt-lagence/vp/v=1/1564925830.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Stuart Weitzman Nudist Block 75 Sandal (Women)",
        "url": "https://www.nordstrom.com/s/stuart-weitzman-nudist-block-75-sandal-women/8031471",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Bottega Veneta Small Parachute Intrecciato Leather Shoulder Bag",
        "url": "https://www.saksfifthavenue.com/product/bottega-veneta-small-parachute-intrecciato-leather-shoulder-bag-0400022118446.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Lele Sadoughi Socialite Statement Earrings",
        "url": "https://www.shopbop.com/socialite-statement-earrings-lele-sadoughi/vp/v=1/1571431244.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Lele Sadoughi Conch Shell Layered Necklace",
        "url": "https://www.shopbop.com/conch-shell-layered-necklace-lele/vp/v=1/1565893685.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "Lele Sadoughi Riviera Five Strand Bracelet",
        "url": "https://www.shopbop.com/riviera-five-strand-bracelet-lele/vp/v=1/1529873676.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      }
    ]
  },
  {
    "moment": "sunset-views",
    "key": "violet-hour",
    "title": "Violet Hour",
    "products": [
      {
        "slot": "Dress",
        "name": "Shoshanna Tucker Dress",
        "url": "https://www.shopbop.com/tucker-dress-shoshanna/vp/v=1/1537774047.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Jimmy Choo Maribou 110MM Metallic Leather Wedge Sandals",
        "url": "https://www.saksfifthavenue.com/product/jimmy-choo-maribou-110mm-metallic-leather-wedge-sandals-0400018502496.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      }
    ]
  },
  {
    "moment": "sunset-views",
    "key": "emerald-at-dusk",
    "title": "Emerald at Dusk",
    "products": [
      {
        "slot": "Dress",
        "name": "Cinq à Sept Marcie Dress",
        "url": "https://www.shopbop.com/marcie-dress-cinq-sept/vp/v=1/1583033624.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Shoes",
        "name": "Manolo Blahnik Ninfemu 50MM Leather Strappy Sandals",
        "url": "https://www.saksfifthavenue.com/product/manolo-blahnik-ninfemu-50mm-leather-strappy-sandals-0400021045165.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Necklace",
        "name": "Kalan by Suzanne Kalan 14k Gold Diamond Bar Pendant Necklace",
        "url": "https://www.shopbop.com/diamond-bar-pendant-kalan-by/vp/v=1/1523847507.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": "Stephanie Gottlieb 14k Gold and Diamond Stripe Ring",
        "url": "https://www.shopbop.com/gold-diamond-stripe-ring-stephanie/vp/v=1/1520628947.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      }
    ]
  },
  {
    "moment": "exploring-the-harbor",
    "key": "sky-blue-linen",
    "title": "Sky Blue Linen",
    "products": [
      {
        "slot": "Set · Top",
        "name": "FAITHFULL Aurora Top",
        "url": "https://www.shopbop.com/aurora-top-faithfull/vp/v=1/1515524555.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Set · Skirt",
        "name": null,
        "url": null,
        "retailer": null,
        "unsourced": true
      },
      {
        "slot": "Shoes",
        "name": "Tory Burch Miller Patent Leather Sandals",
        "url": "https://www.saksfifthavenue.com/product/tory-burch-miller-patent-leather-sandals-0400021803961.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Marc Jacobs The Woven Medium Tote Bag",
        "url": "https://www.saksfifthavenue.com/product/marc-jacobs-the-woven-medium-tote-bag-0400020590502.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Brinker + Eliza Lula Earrings",
        "url": "https://www.shopbop.com/lula-earrings-brinker-eliza/vp/v=1/1552958185.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Brinker + Eliza Pink Mist Necklace",
        "url": "https://www.shopbop.com/pink-mist-necklace-brinker-eliza/vp/v=1/1577295772.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Bracelet",
        "name": "Brinker + Eliza Twist Bracelet",
        "url": "https://www.shopbop.com/twist-bracelet-brinker-eliza/vp/v=1/1575649179.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Sunglasses",
        "name": "Ray-Ban 54mm Polarized Square Sunglasses",
        "url": "https://www.nordstrom.com/s/ray-ban-54mm-polarized-square-sunglasses/6872187",
        "retailer": "nordstrom.com",
        "unsourced": false
      },
      {
        "slot": "Hat",
        "name": "Janessa Leone Valentine Straw Hat",
        "url": "https://www.shopbop.com/valentine-janessa-leone/vp/v=1/1511479477.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "pool-lounging",
    "key": "pink-wave",
    "title": "Pink Wave",
    "products": [
      {
        "slot": "Swim",
        "name": "ViX Paula Hermanny Paula Bikini Top",
        "url": "https://www.shopbop.com/paula-top-vix-hermanny/vp/v=1/1515057867.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Cover-Up",
        "name": "9seed Tunisia Caftan",
        "url": "https://www.shopbop.com/tunisia-short-sleeve-caftan-9seed/vp/v=1/1553425637.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Shoes",
        "name": "Polo Ralph Lauren Leather Ring Wrap Flat Sandals in Cuoio",
        "url": "https://www.revolve.com/polo-ralph-lauren-leather-ring-wrap-flat-sandals-in-cuoio/dp/PLOR-WZ11/?currency=GBP&d=F",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Bag",
        "name": "Clare V. Sandy Tote",
        "url": "https://www.shopbop.com/sandy-tote-clare-v/vp/v=1/1585492034.htm",
        "retailer": "shopbop.com",
        "unsourced": false
      },
      {
        "slot": "Earrings",
        "name": "Zoe Chicco 14k Gold Floating Diamond Drop Earrings",
        "url": "https://www.shopbop.com/14k-gold-floating-diamond-drop/vp/v=1/1507422392.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": null,
        "url": null,
        "retailer": null,
        "unsourced": true
      },
      {
        "slot": "Sunglasses",
        "name": "Miu Miu 61mm Pilot Sunglasses (Women)",
        "url": "https://www.nordstrom.com/s/miu-miu-61mm-pilot-sunglasses/8662723",
        "retailer": "nordstrom.com",
        "unsourced": false
      }
    ]
  },
  {
    "moment": "riviera-dinner",
    "key": "fuchsia-after-eight",
    "title": "Fuchsia After Eight",
    "products": [
      {
        "slot": "Dress",
        "name": "Zimmermann Silk Wrap Midi-Dress",
        "url": "https://www.saksfifthavenue.com/product/zimmermann-silk-wrap-midi-dress-0400016949001.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Shoes",
        "name": "Aquazzura So Nude Satin Slingback Sandals",
        "url": "https://www.saksfifthavenue.com/product/aquazzura-so-nude-satin-slingback-sandals-0400020057035.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Bag",
        "name": "Hat Attack TOTE-BAG LISSA DAY in Natural",
        "url": "https://www.revolve.com/hat-attack-lissa-day-tote-bag-in-natural/dp/HATR-WY70/?d=Womens",
        "retailer": "revolve.com",
        "unsourced": true
      },
      {
        "slot": "Earrings",
        "name": "Ippolita Wonderland Sterling Silver & Brown Shell Doublet Large Teardrop Earrings",
        "url": "https://www.saksfifthavenue.com/product/ippolita-wonderland-sterling-silver--amp--brown-shell-doublet-large-teardrop-earrings-0400013795284.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      },
      {
        "slot": "Necklace",
        "name": "Kalan by Suzanne Kalan 14k Gold Diamond Bar Pendant Necklace",
        "url": "https://www.shopbop.com/diamond-bar-pendant-kalan-by/vp/v=1/1523847507.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Bracelet",
        "name": "SHASHI Ross Cuff Bracelet",
        "url": "https://www.shopbop.com/ross-cuff-bracelet-shashi/vp/v=1/1532399292.htm",
        "retailer": "shopbop.com",
        "unsourced": true
      },
      {
        "slot": "Ring",
        "name": "770 Fine Jewelry Multishape 14K Yellow Gold & 0.48 TCW Diamond Cuff Ring",
        "url": "https://www.saksfifthavenue.com/product/770-fine-jewelry-multishape-14k-yellow-gold--amp--0.48-tcw-diamond-cuff-ring-0400020218725.html",
        "retailer": "saksfifthavenue.com",
        "unsourced": false
      }
    ]
  }
];

export function sourcedLooksForMoment(moment: string): SourcedSupportingLook[] {
  return SOURCED_SUPPORTING_LOOKS.filter((look) => look.moment === moment);
}
