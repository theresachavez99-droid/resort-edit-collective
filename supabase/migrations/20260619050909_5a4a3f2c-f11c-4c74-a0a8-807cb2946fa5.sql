
-- 1. Add channel_type to both tables
ALTER TABLE public.founder_reference_products
  ADD COLUMN channel_type text NOT NULL DEFAULT 'brand_direct'
    CHECK (channel_type IN ('brand_direct','affiliate_retailer','affiliate_direct_brand'));

ALTER TABLE public.brand_intelligence
  ADD COLUMN channel_type text NOT NULL DEFAULT 'brand_direct'
    CHECK (channel_type IN ('brand_direct','affiliate_retailer','affiliate_direct_brand'));

-- 2. Backfill founder_reference_products from retailer string
UPDATE public.founder_reference_products
SET channel_type = 'affiliate_retailer'
WHERE lower(retailer) IN (
  'mytheresa.com','net-a-porter.com','saksfifthavenue.com','neimanmarcus.com',
  'bergdorfgoodman.com','shopbop.com','revolve.com','bloomingdales.com',
  'nordstrom.com','luisaviaroma.com','modaoperandi.com','harrods.com',
  'ssense.com','fwrd.com','intermixonline.com','everythingbutwater.com'
);

-- 3. Mark approved direct-brand affiliate partners in brand_intelligence
UPDATE public.brand_intelligence
SET channel_type = 'affiliate_direct_brand'
WHERE brand IN (
  'Cult Gaia','La DoubleJ','Mejuri','Missoma','Aquazzura','Retrofête','Krewe',
  'Posse','Significant Other','Johanna Ortiz','Hemant & Nandita','Alexandra Miro',
  'Loeffler Randall','Jennifer Meyer','Jenny Bird','Castañer','David Yurman',
  'Hereu','Souliers Martinez','Charo Ruiz Ibiza','Zimmermann','Aranaz',
  'Ancient Greek Sandals','SIR.','Brinker & Eliza','Dragon Diffusion',
  'Emme Parsons','Oradina','Heimat Atlantica','Biankina','Juliet Dunn',
  'Kayu','Alighieri','Jennifer Behr'
);

-- 4. Reclassify founder references whose brand is a direct-brand affiliate partner
UPDATE public.founder_reference_products frp
SET channel_type = 'affiliate_direct_brand'
FROM public.brand_intelligence bi
WHERE frp.brand = bi.brand
  AND bi.channel_type = 'affiliate_direct_brand'
  AND frp.channel_type = 'brand_direct';
