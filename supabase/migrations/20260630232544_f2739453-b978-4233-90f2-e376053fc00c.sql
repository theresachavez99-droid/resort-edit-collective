
UPDATE moments SET copy = jsonb_set(COALESCE(copy,'{}'::jsonb), '{narrative}', to_jsonb(v.narrative)) FROM (VALUES
  ('arrival', 'Your first walk through the village, fresh from checking in at the Splendido above the harbor.'),
  ('espresso-morning', 'A slow Italian morning that begins with espresso on the piazzetta.'),
  ('exploring-the-harbor', 'The climb to Castello Brown and the path to the lighthouse, through Portofino''s hidden corners and colorful streets.'),
  ('yacht-day', 'The crossing to San Fruttuoso — the abbey in a cove reachable only by boat or on foot — in effortless style.'),
  ('beach-club', 'A leisurely afternoon at Paraggi, the emerald cove where even Portofino comes to swim.'),
  ('harbor-aperitivo', 'Golden-hour cocktails overlooking the harbor.'),
  ('pool-lounging', 'An elegant afternoon by the Splendido''s pool, above the bay, beneath striped umbrellas.'),
  ('shopping', 'Browsing the boutiques around the piazzetta and along the harbor.'),
  ('long-lunch', 'A long, harborside lunch where time slows down between every course.'),
  ('sunset-views', 'From the hill above the harbor, the coast glows as the sun disappears into the sea.'),
  ('riviera-dinner', 'An unforgettable dinner beneath the harbor lights.'),
  ('nightcap', 'One final cocktail on the piazzetta before the perfect day comes to a close.')
) AS v(slug, narrative)
WHERE moments.destination = 'portofino' AND moments.slug = v.slug;
