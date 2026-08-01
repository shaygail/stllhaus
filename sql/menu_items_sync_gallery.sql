-- Sync drink base prices to match `lib/menu-catalog.ts` / POS `menu-sync.json` (regular = base row).
-- Large sizes: separate rows named exactly `"Drink Name (Large)"` with large price, or rely on app math when syncing.
-- Run against Postgres (Supabase or POS DB). Adjust category strings if your schema differs.
-- Add-ons (sizes, milks, syrups) are unchanged — update those in your POS separately.

BEGIN;

UPDATE menu_items SET price = 9.0 WHERE name = 'Earl Grey Matcha';
UPDATE menu_items SET price = 8.5 WHERE name IN ('Matcha Latte', 'Classic Matcha', 'OG Matcha Latte');
UPDATE menu_items SET price = 11.5 WHERE name = 'Strawberry Matcha';
UPDATE menu_items SET price = 11.0 WHERE name = 'Strawberry Cloud Matcha';
UPDATE menu_items SET price = 10.0 WHERE name IN ('Ube Cream Matcha', 'Mango Matcha');
UPDATE menu_items SET price = 11.5 WHERE name IN ('Mango Sea Salt Matcha', 'Mango Seasalt Matcha');

UPDATE menu_items SET price = 8.5 WHERE name IN ('Hojicha Latte', 'OG Hojicha Latte');
UPDATE menu_items SET price = 10.0 WHERE name IN (
  'Hojicha Strawberry Latte',
  'Strawberry Hojicha Latte',
  'Strawberry Hojicha'
);

UPDATE menu_items SET price = 9.0 WHERE name IN ('Cold Brew', 'OG Cold Brew', 'Brown Sugar Cold Brew', 'Spanish Latte Cold Brew');
UPDATE menu_items SET price = 10.0 WHERE name IN (
  'Ube Cream Cold Brew',
  'Ube Cream Coldbrew Latte',
  'Black Pearl Cold Brew',
  'Black Pearl Cold Brew Latte',
  'Sea Salt Cold Brew',
  'Seasalt Cold Brew'
);

UPDATE menu_items SET price = 6.5 WHERE name = 'Flat White';
UPDATE menu_items SET price = 7.5 WHERE name = 'Iced Latte';
UPDATE menu_items SET price = 6.0 WHERE name IN ('Americano', 'Long Black', 'Caramel Latte', 'Mocha', 'White Mocha');
UPDATE menu_items SET price = 9.5 WHERE name IN (
  'Biscoff Latte',
  'Ube Espresso Latte',
  'Ube Spanish Latte',
  'Black Pearl Latte'
);
UPDATE menu_items SET price = 10.0 WHERE name = 'Spanish Latte';
UPDATE menu_items SET price = 9.5 WHERE name = 'Batirol Latte';

UPDATE menu_items SET price = 8.5 WHERE name IN ('Ube Latte', 'Twilight Cream');
UPDATE menu_items SET price = 10.0 WHERE name = 'Strawberry Cream';
UPDATE menu_items SET price = 11.0 WHERE name IN ('Batirol Cream', 'Ube Cream Batirol');

UPDATE menu_items SET price = 9.0 WHERE name IN (
  'Black Pearl Coconut Cloud',
  'Black Pearl Cloud',
  'Clover Coconut Cloud',
  'Clover Cloud',
  'Twilight Coconut Cloud',
  'Twilight Cloud',
  'Batirol Cloud'
);

UPDATE menu_items SET price = 16.5 WHERE name = 'Sip & Bite';
UPDATE menu_items SET price = 9.5 WHERE name IN ('6pc Pork Shrimp Siomai', 'Pork and Shrimp Siomai (6 pcs)');
UPDATE menu_items SET price = 18.0 WHERE name IN ('Pork Shrimp Siomai (12pcs)', 'Pork and Shrimp Siomai (12 pcs)', '12 pcs (1 tub)');

-- Large rows (insert if missing)
INSERT INTO menu_items (name, price, category, is_hidden, is_sold_out)
SELECT v.name, v.price, v.category, FALSE, FALSE
FROM (VALUES
  ('Earl Grey Matcha (Large)', 11.0, 'Matcha Series'),
  ('OG Matcha Latte (Large)', 10.5, 'Matcha Series'),
  ('Matcha Latte (Large)', 10.5, 'Matcha Series'),
  ('Classic Matcha (Large)', 10.5, 'Matcha Series'),
  ('Strawberry Matcha (Large)', 13.5, 'Matcha Series'),
  ('Strawberry Cloud Matcha (Large)', 13.0, 'Matcha Series'),
  ('Ube Cream Matcha (Large)', 12.0, 'Matcha Series'),
  ('Mango Matcha (Large)', 12.0, 'Matcha Series'),
  ('Mango Sea Salt Matcha (Large)', 13.5, 'Matcha Series'),
  ('Mango Seasalt Matcha (Large)', 13.5, 'Matcha Series'),
  ('Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('OG Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('Hojicha Strawberry Latte (Large)', 12.0, 'Hojicha Series'),
  ('Strawberry Hojicha Latte (Large)', 12.0, 'Hojicha Series'),
  ('Strawberry Hojicha (Large)', 12.0, 'Hojicha Series'),
  ('OG Cold Brew (Large)', 11.0, 'Cold Brew Series'),
  ('Cold Brew (Large)', 11.0, 'Cold Brew Series'),
  ('Ube Cream Coldbrew Latte (Large)', 12.0, 'Cold Brew Series'),
  ('Ube Cream Cold Brew (Large)', 12.0, 'Cold Brew Series'),
  ('Brown Sugar Cold Brew (Large)', 11.0, 'Cold Brew Series'),
  ('Black Pearl Cold Brew Latte (Large)', 12.0, 'Cold Brew Series'),
  ('Black Pearl Cold Brew (Large)', 12.0, 'Cold Brew Series'),
  ('Sea Salt Cold Brew (Large)', 12.0, 'Cold Brew Series'),
  ('Seasalt Cold Brew (Large)', 12.0, 'Cold Brew Series'),
  ('Spanish Latte Cold Brew (Large)', 11.0, 'Cold Brew Series'),
  ('Flat White (Large)', 7.5, 'Coffee Series'),
  ('Iced Latte (Large)', 8.5, 'Coffee Series'),
  ('Americano (Large)', 7.0, 'Coffee Series'),
  ('Long Black (Large)', 7.0, 'Coffee Series'),
  ('Caramel Latte (Large)', 7.0, 'Coffee Series'),
  ('Mocha (Large)', 7.0, 'Coffee Series'),
  ('Ube Espresso Latte (Large)', 11.5, 'Coffee Series'),
  ('Ube Spanish Latte (Large)', 11.5, 'Coffee Series'),
  ('Spanish Latte (Large)', 12.0, 'Coffee Series'),
  ('Biscoff Latte (Large)', 10.5, 'Coffee Series'),
  ('White Mocha (Large)', 7.0, 'Coffee Series'),
  ('Batirol Latte (Large)', 11.5, 'Coffee Series'),
  ('Black Pearl Latte (Large)', 10.5, 'Coffee Series'),
  ('Twilight Cream (Large)', 10.5, 'Non-Coffee Series'),
  ('Ube Latte (Large)', 10.5, 'Non-Coffee Series'),
  ('Strawberry Cream (Large)', 12.0, 'Non-Coffee Series'),
  ('Batirol Cream (Large)', 13.0, 'Non-Coffee Series'),
  ('Ube Cream Batirol (Large)', 13.0, 'Non-Coffee Series'),
  ('Black Pearl Coconut Cloud (Large)', 11.0, 'Cloud Series'),
  ('Clover Coconut Cloud (Large)', 11.0, 'Cloud Series'),
  ('Twilight Coconut Cloud (Large)', 11.0, 'Cloud Series'),
  ('Batirol Cloud (Large)', 11.0, 'Cloud Series')
) AS v(name, price, category)
WHERE NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = v.name);

COMMIT;
