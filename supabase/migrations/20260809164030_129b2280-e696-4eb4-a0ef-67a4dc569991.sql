REVOKE ALL ON public.look_items FROM anon, authenticated;
REVOKE ALL ON public.look_items_public FROM anon, authenticated;

GRANT SELECT (
  look_key, sort_order, item_name, brand_name, brand_slug,
  price_display, currency, image_url, affiliate_url, retailer_name
) ON public.look_items TO anon, authenticated;

GRANT SELECT ON public.look_items_public TO anon, authenticated;
GRANT ALL ON public.look_items TO service_role;
GRANT SELECT ON public.look_items_public TO service_role;