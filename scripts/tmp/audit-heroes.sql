select look_key, slot, is_primary, brand, product_name, (url is not null) as has_url, status
from shop_slot_products order by look_key, slot;
