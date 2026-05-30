-- Sync drink base prices to match `lib/menu-catalog.ts` / gallery (regular = base row).
-- Large sizes: separate rows named exactly `"Drink Name (Large)"` with large price, or rely on app math when syncing.
-- Run against Postgres (Supabase or POS DB). Adjust category strings if your schema differs.
-- Add-ons (sizes, milks, syrups) are unchanged — update those in your POS separately.

BEGIN;

UPDATE menu_items SET price = 8.5 WHERE name = 'Earl Grey Matcha';
UPDATE menu_items SET price = 7.5 WHERE name IN ('Matcha Latte', 'Classic Matcha');
UPDATE menu_items SET price = 10.5 WHERE name = 'Strawberry Matcha';
UPDATE menu_items SET price = 12.0 WHERE name = 'Strawberry Cloud Matcha';
UPDATE menu_items SET price = 8.5 WHERE name = 'Ube Cream Matcha';
UPDATE menu_items SET price = 10.0 WHERE name = 'Mango Matcha';
UPDATE menu_items SET price = 10.5 WHERE name = 'Mango Sea Salt Matcha';

UPDATE menu_items SET price = 8.5 WHERE name IN (
  'Earl Grey Hojicha',
  'OG Hojicha Latte',
  'Hojicha Latte',
  'Strawberry Hojicha',
  'Strawberry Hojicha Latte',
  'Strawberry Cloud Hojicha',
  'Ube Cream Hojicha',
  'Mango Hojicha',
  'Mango Sea Salt Hojicha'
);

UPDATE menu_items SET price = 8.5 WHERE name IN ('Cold Brew', 'OG Cold Brew');
UPDATE menu_items SET price = 8.5 WHERE name IN ('Ube Cream Cold Brew', 'Ube Cream Coldbrew Latte');
UPDATE menu_items SET price = 8.5 WHERE name = 'Brown Sugar Cold Brew';
UPDATE menu_items SET price = 8.5 WHERE name IN ('Black Pearl Cold Brew', 'Black Pearl Cold Brew Latte');
UPDATE menu_items SET price = 8.5 WHERE name = 'Spanish Latte Cold Brew';

UPDATE menu_items SET price = 6.0 WHERE name IN ('Flat White', 'Iced Latte', 'Americano', 'Long Black', 'Caramel Latte', 'Mocha', 'White Mocha', 'Black Pearl Latte');
UPDATE menu_items SET price = 8.5 WHERE name = 'Biscoff Latte';
UPDATE menu_items SET price = 8.5 WHERE name IN ('Ube Spanish Latte', 'Spanish Latte', 'Batirol Latte');

UPDATE menu_items SET price = 8.5 WHERE name IN ('Twilight Cream', 'Strawberry Cream', 'Batirol Cream');
UPDATE menu_items SET price = 9.5 WHERE name = 'Ube Cream Batirol';

UPDATE menu_items SET price = 9.0 WHERE name IN ('Clover Coconut Cloud', 'Clover Cloud');
UPDATE menu_items SET price = 8.5 WHERE name IN (
  'Black Pearl Coconut Cloud',
  'Black Pearl Cloud',
  'Twilight Coconut Cloud',
  'Twilight Cloud',
  'Batirol Cloud'
);

-- Large rows (insert if missing)
INSERT INTO menu_items (name, price, category, is_hidden, is_sold_out)
SELECT v.name, v.price, v.category, FALSE, FALSE
FROM (VALUES
  ('Earl Grey Matcha (Large)', 10.5, 'Matcha Series'),
  ('OG Matcha Latte (Large)', 11.0, 'Matcha Series'),
  ('Matcha Latte (Large)', 11.0, 'Matcha Series'),
  ('Classic Matcha (Large)', 11.0, 'Matcha Series'),
  ('Strawberry Matcha (Large)', 12.5, 'Matcha Series'),
  ('Strawberry Cloud Matcha (Large)', 14.0, 'Matcha Series'),
  ('Ube Cream Matcha (Large)', 10.5, 'Matcha Series'),
  ('Mango Matcha (Large)', 12.0, 'Matcha Series'),
  ('Mango Sea Salt Matcha (Large)', 12.5, 'Matcha Series'),
  ('Earl Grey Hojicha (Large)', 10.5, 'Hojicha Series'),
  ('OG Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('Strawberry Hojicha (Large)', 10.5, 'Hojicha Series'),
  ('Strawberry Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('Strawberry Cloud Hojicha (Large)', 10.5, 'Hojicha Series'),
  ('Ube Cream Hojicha (Large)', 10.5, 'Hojicha Series'),
  ('Mango Hojicha (Large)', 10.5, 'Hojicha Series'),
  ('Mango Sea Salt Hojicha (Large)', 10.5, 'Hojicha Series'),
  ('OG Cold Brew (Large)', 10.5, 'Cold Brew Series'),
  ('Cold Brew (Large)', 10.5, 'Cold Brew Series'),
  ('Ube Cream Coldbrew Latte (Large)', 10.5, 'Cold Brew Series'),
  ('Ube Cream Cold Brew (Large)', 10.5, 'Cold Brew Series'),
  ('Brown Sugar Cold Brew (Large)', 10.5, 'Cold Brew Series'),
  ('Black Pearl Cold Brew Latte (Large)', 10.5, 'Cold Brew Series'),
  ('Black Pearl Cold Brew (Large)', 10.5, 'Cold Brew Series'),
  ('Spanish Latte Cold Brew (Large)', 10.5, 'Cold Brew Series'),
  ('Flat White (Large)', 7.0, 'Coffee Series'),
  ('Iced Latte (Large)', 7.0, 'Coffee Series'),
  ('Americano (Large)', 7.0, 'Coffee Series'),
  ('Long Black (Large)', 7.0, 'Coffee Series'),
  ('Caramel Latte (Large)', 7.0, 'Coffee Series'),
  ('Mocha (Large)', 7.0, 'Coffee Series'),
  ('Ube Spanish Latte (Large)', 10.5, 'Coffee Series'),
  ('Spanish Latte (Large)', 10.5, 'Coffee Series'),
  ('Biscoff Latte (Large)', 9.5, 'Coffee Series'),
  ('White Mocha (Large)', 7.0, 'Coffee Series'),
  ('Batirol Latte (Large)', 10.5, 'Coffee Series'),
  ('Black Pearl Latte (Large)', 7.0, 'Coffee Series'),
  ('Twilight Cream (Large)', 10.5, 'Non-Coffee Series'),
  ('Strawberry Cream (Large)', 10.5, 'Non-Coffee Series'),
  ('Batirol Cream (Large)', 10.5, 'Non-Coffee Series'),
  ('Ube Cream Batirol (Large)', 11.5, 'Non-Coffee Series'),
  ('Black Pearl Coconut Cloud (Large)', 10.5, 'Cloud Series'),
  ('Clover Coconut Cloud (Large)', 11.0, 'Cloud Series'),
  ('Twilight Coconut Cloud (Large)', 10.5, 'Cloud Series'),
  ('Batirol Cloud (Large)', 10.5, 'Cloud Series')
) AS v(name, price, category)
WHERE NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = v.name);

-- Optional: upsert base rows missing from an older seed (safe insert)
INSERT INTO menu_items (name, price, category, is_hidden, is_sold_out)
SELECT v.name, v.price, v.category, FALSE, FALSE
FROM (VALUES
  ('Flat White', 6.0, 'Coffee Series'),
  ('Iced Latte', 6.0, 'Coffee Series'),
  ('Americano', 6.0, 'Coffee Series'),
  ('Long Black', 6.0, 'Coffee Series'),
  ('Caramel Latte', 6.0, 'Coffee Series'),
  ('Mocha', 6.0, 'Coffee Series'),
  ('Batirol Latte', 8.5, 'Coffee Series'),
  ('Black Pearl Latte', 6.0, 'Coffee Series'),
  ('OG Cold Brew', 8.5, 'Cold Brew Series'),
  ('Strawberry Cloud Matcha', 12.0, 'Matcha Series'),
  ('Mango Matcha', 10.0, 'Matcha Series'),
  ('Mango Sea Salt Matcha', 10.5, 'Matcha Series'),
  ('Earl Grey Hojicha', 8.5, 'Hojicha Series'),
  ('OG Hojicha Latte', 8.5, 'Hojicha Series'),
  ('Hojicha Latte', 8.5, 'Hojicha Series'),
  ('Strawberry Hojicha', 8.5, 'Hojicha Series'),
  ('Strawberry Hojicha Latte', 8.5, 'Hojicha Series'),
  ('Strawberry Cloud Hojicha', 8.5, 'Hojicha Series'),
  ('Ube Cream Hojicha', 8.5, 'Hojicha Series'),
  ('Mango Hojicha', 8.5, 'Hojicha Series'),
  ('Mango Sea Salt Hojicha', 8.5, 'Hojicha Series'),
  ('Twilight Cream', 8.5, 'Non-Coffee Series'),
  ('Strawberry Cream', 8.5, 'Non-Coffee Series'),
  ('Batirol Cream', 8.5, 'Non-Coffee Series'),
  ('Ube Cream Batirol', 9.5, 'Non-Coffee Series'),
  ('Black Pearl Coconut Cloud', 8.5, 'Cloud Series'),
  ('Clover Coconut Cloud', 9.0, 'Cloud Series'),
  ('Twilight Coconut Cloud', 8.5, 'Cloud Series'),
  ('Batirol Cloud', 8.5, 'Cloud Series')
) AS v(name, price, category)
WHERE NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = v.name);

COMMIT;
