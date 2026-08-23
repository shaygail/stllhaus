-- Sync drink base prices to match Main POS `menu-sync.json` / `lib/menu-catalog.ts` (regular = base row).
-- Large sizes: separate rows named exactly `"Drink Name (Large)"` = regular + $2.
-- Run against Postgres (Supabase or POS DB). Adjust category strings if your schema differs.

BEGIN;

UPDATE menu_items SET price = 9.0 WHERE name = 'Earl Grey Matcha';
UPDATE menu_items SET price = 8.5 WHERE name IN ('Matcha Latte', 'Classic Matcha', 'OG Matcha Latte');
UPDATE menu_items SET price = 11.5 WHERE name = 'Strawberry Matcha';
UPDATE menu_items SET price = 11.0 WHERE name = 'Strawberry Cloud Matcha';
UPDATE menu_items SET price = 10.0 WHERE name = 'Ube Cream Matcha';
UPDATE menu_items SET price = 11.5 WHERE name = 'Mango Matcha';
UPDATE menu_items SET price = 12.0 WHERE name IN ('Mango Sea Salt Matcha', 'Mango Seasalt Matcha');
UPDATE menu_items SET price = 11.0 WHERE name = 'Biscoff Matcha';
UPDATE menu_items SET price = 11.0 WHERE name IN ('Seasalt Cream Matcha', 'Sea Salt Cream Matcha');

UPDATE menu_items SET price = 8.5 WHERE name IN ('Hojicha Latte', 'OG Hojicha Latte');
UPDATE menu_items SET price = 10.0 WHERE name IN (
  'Hojicha Strawberry Latte',
  'Strawberry Hojicha Latte',
  'Strawberry Hojicha'
);

UPDATE menu_items SET price = 8.0 WHERE name IN ('Cold Brew', 'OG Cold Brew', 'Spanish Latte Cold Brew');
UPDATE menu_items SET price = 9.0 WHERE name = 'Brown Sugar Cold Brew';
UPDATE menu_items SET price = 10.0 WHERE name IN (
  'Ube Cream Cold Brew',
  'Ube Cream Coldbrew Latte',
  'Black Pearl Cold Brew',
  'Black Pearl Cold Brew Latte'
);
UPDATE menu_items SET price = 11.0 WHERE name IN ('Sea Salt Cold Brew', 'Seasalt Cold Brew');

UPDATE menu_items SET price = 8.0 WHERE name = 'Mocha';
UPDATE menu_items SET price = 6.5 WHERE name = 'Flat White';
UPDATE menu_items SET price = 8.5 WHERE name IN ('Latte', 'Iced Latte');
UPDATE menu_items SET price = 6.0 WHERE name IN ('Americano', 'Long Black');
UPDATE menu_items SET price = 9.0 WHERE name IN ('Ube Espresso Latte', 'Black Pearl Latte', 'Sea Salt Americano', 'Seasalt Americano');
UPDATE menu_items SET price = 8.5 WHERE name IN ('Ube Spanish Latte', 'Biscoff Latte', 'Jasmine Latte');
UPDATE menu_items SET price = 10.0 WHERE name = 'Spanish Latte';
UPDATE menu_items SET price = 6.5 WHERE name = 'White Mocha';
UPDATE menu_items SET price = 11.0 WHERE name = 'Batirol Latte';

UPDATE menu_items SET price = 8.5 WHERE name IN ('Ube Latte', 'Twilight Cream');
UPDATE menu_items SET price = 11.0 WHERE name IN ('Strawberry Cream', 'Batirol Cream');
UPDATE menu_items SET price = 9.5 WHERE name IN ('Ube Batirol Cream', 'Ube Cream Batirol');

UPDATE menu_items SET price = 9.0 WHERE name IN (
  'Black Pearl Coconut Cloud',
  'Black Pearl Cloud',
  'Clover Coconut Cloud',
  'Clover Cloud',
  'Twilight Coconut Cloud',
  'Twilight Cloud'
);

UPDATE menu_items SET price = 16.5 WHERE name = 'Sip & Bite';
UPDATE menu_items SET price = 9.5 WHERE name IN ('6pc Pork Shrimp Siomai', 'Pork and Shrimp Siomai (6 pcs)', 'Pork Shrimp Siomai (6pcs)');
UPDATE menu_items SET price = 18.0 WHERE name IN ('Pork Shrimp Siomai (12pcs)', 'Pork and Shrimp Siomai (12 pcs)', '12 pcs (1 tub)');
UPDATE menu_items SET price = 8.0 WHERE name = 'Ube Graham';
UPDATE menu_items SET price = 10.0 WHERE name = 'Classic Tiramisu';
UPDATE menu_items SET price = 12.0 WHERE name = 'Biscoff Tiramisu';

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
  ('Mango Matcha (Large)', 13.5, 'Matcha Series'),
  ('Mango Sea Salt Matcha (Large)', 14.0, 'Matcha Series'),
  ('Mango Seasalt Matcha (Large)', 14.0, 'Matcha Series'),
  ('Biscoff Matcha (Large)', 13.0, 'Matcha Series'),
  ('Seasalt Cream Matcha (Large)', 13.0, 'Matcha Series'),
  ('Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('OG Hojicha Latte (Large)', 10.5, 'Hojicha Series'),
  ('Hojicha Strawberry Latte (Large)', 12.0, 'Hojicha Series'),
  ('Strawberry Hojicha Latte (Large)', 12.0, 'Hojicha Series'),
  ('Strawberry Hojicha (Large)', 12.0, 'Hojicha Series'),
  ('OG Cold Brew (Large)', 10.0, 'Cold Brew Series'),
  ('Cold Brew (Large)', 10.0, 'Cold Brew Series'),
  ('Ube Cream Coldbrew Latte (Large)', 12.0, 'Cold Brew Series'),
  ('Ube Cream Cold Brew (Large)', 12.0, 'Cold Brew Series'),
  ('Brown Sugar Cold Brew (Large)', 11.0, 'Cold Brew Series'),
  ('Black Pearl Cold Brew Latte (Large)', 12.0, 'Cold Brew Series'),
  ('Black Pearl Cold Brew (Large)', 12.0, 'Cold Brew Series'),
  ('Sea Salt Cold Brew (Large)', 13.0, 'Cold Brew Series'),
  ('Seasalt Cold Brew (Large)', 13.0, 'Cold Brew Series'),
  ('Spanish Latte Cold Brew (Large)', 10.0, 'Cold Brew Series'),
  ('Mocha (Large)', 10.0, 'Coffee Series'),
  ('Flat White (Large)', 8.5, 'Coffee Series'),
  ('Latte (Large)', 10.5, 'Coffee Series'),
  ('Iced Latte (Large)', 10.5, 'Coffee Series'),
  ('Americano (Large)', 8.0, 'Coffee Series'),
  ('Long Black (Large)', 8.0, 'Coffee Series'),
  ('Ube Espresso Latte (Large)', 11.0, 'Coffee Series'),
  ('Ube Spanish Latte (Large)', 10.5, 'Coffee Series'),
  ('Spanish Latte (Large)', 12.0, 'Coffee Series'),
  ('Biscoff Latte (Large)', 10.5, 'Coffee Series'),
  ('White Mocha (Large)', 8.5, 'Coffee Series'),
  ('Batirol Latte (Large)', 13.0, 'Coffee Series'),
  ('Black Pearl Latte (Large)', 11.0, 'Coffee Series'),
  ('Jasmine Latte (Large)', 10.5, 'Coffee Series'),
  ('Sea Salt Americano (Large)', 11.0, 'Coffee Series'),
  ('Seasalt Americano (Large)', 11.0, 'Coffee Series'),
  ('Twilight Cream (Large)', 10.5, 'Non-Coffee Series'),
  ('Ube Latte (Large)', 10.5, 'Non-Coffee Series'),
  ('Strawberry Cream (Large)', 13.0, 'Non-Coffee Series'),
  ('Batirol Cream (Large)', 13.0, 'Non-Coffee Series'),
  ('Ube Batirol Cream (Large)', 11.5, 'Non-Coffee Series'),
  ('Ube Cream Batirol (Large)', 11.5, 'Non-Coffee Series'),
  ('Black Pearl Coconut Cloud (Large)', 11.0, 'Cloud Series'),
  ('Clover Coconut Cloud (Large)', 11.0, 'Cloud Series'),
  ('Twilight Coconut Cloud (Large)', 11.0, 'Cloud Series')
) AS v(name, price, category)
WHERE NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.name = v.name);

-- Keep existing large rows in sync if they already exist
UPDATE menu_items SET price = 11.0 WHERE name = 'Ube Espresso Latte (Large)';
UPDATE menu_items SET price = 10.5 WHERE name IN ('Ube Spanish Latte (Large)', 'Biscoff Latte (Large)', 'Jasmine Latte (Large)', 'Latte (Large)', 'Iced Latte (Large)');
UPDATE menu_items SET price = 8.5 WHERE name IN ('Flat White (Large)', 'White Mocha (Large)');
UPDATE menu_items SET price = 8.0 WHERE name IN ('Americano (Large)', 'Long Black (Large)');
UPDATE menu_items SET price = 10.0 WHERE name IN ('Mocha (Large)', 'OG Cold Brew (Large)', 'Cold Brew (Large)', 'Spanish Latte Cold Brew (Large)');
UPDATE menu_items SET price = 13.0 WHERE name IN ('Batirol Latte (Large)', 'Strawberry Cream (Large)');
UPDATE menu_items SET price = 11.0 WHERE name IN ('Black Pearl Latte (Large)');
UPDATE menu_items SET price = 11.5 WHERE name IN ('Ube Batirol Cream (Large)', 'Ube Cream Batirol (Large)');
UPDATE menu_items SET price = 13.0 WHERE name IN ('Strawberry Cloud Matcha (Large)', 'Biscoff Matcha (Large)', 'Seasalt Cream Matcha (Large)');
UPDATE menu_items SET price = 13.5 WHERE name IN ('Mango Matcha (Large)');
UPDATE menu_items SET price = 14.0 WHERE name IN ('Mango Sea Salt Matcha (Large)', 'Mango Seasalt Matcha (Large)');
UPDATE menu_items SET price = 13.0 WHERE name IN ('Sea Salt Cold Brew (Large)', 'Seasalt Cold Brew (Large)');

COMMIT;
