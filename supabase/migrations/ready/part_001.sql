-- ============================================
-- MAGGAZ BACKUP COMPLETE MIGRATION
-- Generated: 2026-03-08T04:55:46.983571
-- ============================================

BEGIN;

-- Step 1: Categories
-- CATEGORIES MIGRATION
-- Generated: 2026-03-08T04:55:46.827657
-- Records: 13

INSERT INTO categories ("id", "name", "description", "color", "icon", "sort_order", "is_active", "created_at", "updated_at") VALUES
('d4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'Настенные газовые котлы', NULL, '#3B82F6', NULL, 1, TRUE, 'now()', 'now()'),
('e72ed311-51be-5827-9f25-ca31bca97853', 'Напольные газовые котлы', NULL, '#3B82F6', NULL, 2, TRUE, 'now()', 'now()'),
('29a952ee-445d-5680-83e4-a15983d8ab13', 'Электрические котлы', NULL, '#3B82F6', NULL, 3, TRUE, 'now()', 'now()'),
('d807ca68-64ce-5694-91e7-be50e5e2cd37', 'Газовые колонки', NULL, '#3B82F6', NULL, 4, TRUE, 'now()', 'now()'),
('9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'Счетчики', NULL, '#3B82F6', NULL, 5, TRUE, 'now()', 'now()'),
('3439eb51-1ec7-50c7-9b63-1853e96ff667', 'Бойлеры', NULL, '#3B82F6', NULL, 6, TRUE, 'now()', 'now()'),
('576cae10-ca1f-521e-9cc2-94fdc16c2237', 'Электрические водонагреватели', NULL, '#3B82F6', NULL, 7, TRUE, 'now()', 'now()'),
('5fa14fca-7b88-581d-bf42-67221b39a425', 'Радиаторы', NULL, '#3B82F6', NULL, 8, TRUE, 'now()', 'now()'),
('dde8de94-afde-5e5f-b7c2-005966c45494', 'Запасные части', NULL, '#3B82F6', NULL, 9, TRUE, 'now()', 'now()'),
('8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'Комплектующие для монтажа', NULL, '#3B82F6', NULL, 10, TRUE, 'now()', 'now()'),
('b294967a-04ed-5156-838f-6f98a09c7ea7', 'Полипропилен', NULL, '#3B82F6', NULL, 11, TRUE, 'now()', 'now()'),
('25516fc9-0c29-5ded-9946-316cbcf67078', 'Газовые плиты', NULL, '#3B82F6', NULL, 12, TRUE, 'now()', 'now()'),
('e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'Без категории', NULL, '#3B82F6', NULL, 13, TRUE, 'now()', 'now()');

-- Migrated 13 categories

-- Step 2: Suppliers & Manufacturers
-- SUPPLIERS & MANUFACTURERS MIGRATION
-- Generated: 2026-03-08T04:55:46.833795
-- Suppliers: 18, Manufacturers: 64

INSERT INTO suppliers ("id", "name", "type", "contact_name", "email", "phone", "address", "website", "notes", "payment_terms", "lead_time_days", "rating", "is_active", "created_at", "updated_at") VALUES
('c345df8c-ba5f-5144-898f-9adf5c93a034', 'Baxi', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Vaillant', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('8f8838e6-3716-5cd7-b279-a929bd2874eb', 'Buderus', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Ariston', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('3da8b952-4641-5d44-b590-45f7a4f7ebb7', 'Эван', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('97d06411-2b55-50a1-bfe2-773e3ec539db', 'Superflame', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Bosch', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('41147a76-050a-5356-a01a-43cc96f73be6', 'Термекс', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('e4be995f-af97-5a21-951d-a88eff646597', 'SUPERLUX', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('75858c87-51de-502f-8365-9266af57c5c2', 'Protherm', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('39bef209-5c08-5fab-94e0-db2daa732312', 'ELSTER', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('0c20ec29-d01d-5c86-8c5f-908d2488e788', 'Газдевайс', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('3cc13fb0-23dc-5a78-aff3-499cb6ec1c92', 'Гранд', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c4b674d0-3da5-5a7a-acd3-6432a0604535', 'BaltGaz', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('0a894328-b4fd-5117-84c1-9bbba27d1094', 'Бетар', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('47a52980-ff8d-54d3-ac99-56b5df280568', 'Neva Lux', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('2e015884-7b17-5269-a6e1-9b140eab5ffd', 'Теплотех', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('baa3fdfa-92bb-5a99-b619-597aa258d806', 'Siberia', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('b163c8fb-d0b2-56fd-a1d8-a706bffe6b7e', 'Лемакс', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('1759dae5-66fb-5b04-bbac-a87f8f02c339', 'Бастион', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('7a1a12ec-166f-5ded-a168-f6d23f3c6049', 'МЕТЕР', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Очаг', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('8ae2e266-1be3-5a85-b1e2-cb53457aedb6', 'Lammin', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c9ca8adf-2679-5981-a862-d0a0bfd39bce', 'Immergas', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('73764589-799f-56bc-a354-fdee1bb7da64', 'Navien', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c29ed9d1-9b92-5b40-97d7-eb5cd28d69a2', 'ЦИТ', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('e667eed7-e799-5dfb-97b0-cdfed595f0ed', 'Элехант', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('cc2d6f73-1e2f-5004-a263-1b422bbc1387', 'WESTER', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('77bfdcc8-5634-5950-af50-c4eadd67173f', 'Регион СТ', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c9597ca6-34f9-57fd-ba14-7e168cd7f78f', 'Джилекс', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('531222ed-43bd-5d19-b2ad-507aa2946258', 'Electrolux', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('f6acd3ef-593f-502e-b9ef-17dc8deedd0c', 'LENZ', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('a043c07d-4ebf-5040-a727-36568956982c', 'WERT', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('75c0c269-0901-56de-ae47-2a2d8e6c323c', 'ВДГО', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('d960ee73-6b9f-5e13-9d2c-1466805cf2f5', 'WATTSON', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('7355d3c9-4227-5425-ab77-d36ebbeb8eb1', 'Royal Thermo', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('825f25f0-5931-5022-b9a8-a3bc43a2fb71', 'ZANUSSI', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('07b69332-cc18-5617-a77e-50e39b6f298e', 'УТДК', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('4e7c948b-b803-5b26-88f5-ed7b0726ba48', 'RGA', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('bcc9662a-1659-5113-a2be-3886ef31b490', 'Omron', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('bb6a4813-ed3c-5ff2-b3d4-023e294fa151', 'Tourist', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Vilterm', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('7d5f783c-7502-528f-9b74-74a4fed10df1', 'Штиль', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('0e397df7-7426-5cb4-948d-415ae59cf5f0', 'Ballu', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('955f5141-cdf3-5fd9-a6bc-814dd6a403fa', 'IMIT', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('997c9969-bda4-56c7-bbd3-ff4b1936b72a', 'GEFFEN', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('e7ef5c51-329a-557a-9c69-5268ebb881c7', 'Ямполь (ЯПЗ)', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('86c23708-e295-5254-9686-ad46699849c2', 'MIZUDO', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('e4da9236-0c7f-5603-a8d9-daa7a8f72796', 'VARGAZ', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('7c34b5a4-b6ce-5e0c-9de2-eddcbc509ba8', 'ARTU', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c7400613-f8cd-5a07-8634-f0a3a2ed96df', 'Federica Bugatti', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('f09e1628-f87b-5373-a92c-bcf9c0a79be5', 'Fondital', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('762b0028-b4a9-5e3d-941a-eeda2a06759d', 'De Dietrich', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('b5223f7c-1165-52dd-832c-d61fd1bcf337', 'АСТИН', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('db6c3d5b-44a6-5145-84ff-32556b5fff62', 'MVI', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('30359f12-4373-5619-b03d-88f7d3a5e394', 'VALTEC', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c9cd3aa8-cdd3-5c97-911b-bb82c654ef7b', 'WATTS', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('cf6edb2e-6c7b-5bda-9cc9-4938aa97fb6a', 'РОСМА', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('8861e393-68fd-57f3-b5da-7a9269ba7c72', 'WILO', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('0a0b22a7-9bc3-5b1b-be07-cbee5d33782c', 'GRUNDFOS', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('08d332a8-437b-5dd2-876b-ffb3d9b8fd56', 'Ferroli', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('a731561e-5b48-56f6-b326-98ce886a6949', 'Viessmann', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('3e72cd9f-0619-5134-b5f2-2a8b6c746e87', 'Gefest', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Без производителя', 'manufacturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('1bc36796-62f4-506d-a403-286cbd3dde52', 'ООО "ТЗГО"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('aef726cf-b8aa-5002-9844-0e6815c7a4d6', 'ООО "ГАЗ ЛАЙН"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('a3d66076-4863-5419-a936-4e3dc09941fd', 'ООО "СамараГазГрупп"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('6280e304-83b9-5019-8362-7c7258e4b4ab', 'ООО "ОК "ЛАЗУРИТ"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('9440709d-f074-5a9e-a056-f2c4efa010a9', 'Академия Тепла( Марсель )', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('d47dd5a6-9b89-5b56-a926-cbbf0b719e51', 'ООО ГК "СервисГаз" ', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('b8024941-46de-5877-913e-02522791f9ab', 'ООО "ЮГЭНЕРГОПРОМ"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('b59eb2aa-114f-5723-a3de-f47eed439c0c', 'ИП Моисеенкова Елена Александровна ', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('be7b966e-da09-56e0-9491-df97e7722311', 'ИП Наумов Алексей Владимирович', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('ac90ba7a-fc8d-5b87-9d5d-bb8781dbe5b7', 'ООО "ТС ИНЖИНИРИНГ" ', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('3995e7de-7acf-5afe-a080-e4d86de4bef8', 'АО "ЦЕНТРГАЗСЕРВИС"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('5eea2e51-857b-5032-9539-9edebe83897e', 'ООО "РК-РЕГИОН" ', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('47d2f7bd-e0a4-575b-b447-20aacc764764', 'ИП Филиппова Татьяна Александровна', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('91bd88d0-915a-5d00-acf1-f84a9f1f49d0', 'Маркетплейсы', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('2533c2bd-8859-5b02-9b35-665dacaed419', 'ООО "КОМПАНИЯ "БАЛТГАЗСЕРВИС"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('313e4c2f-f008-5090-a17d-33d000ac008d', 'ООО "ВДГО"', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('c9cffa75-fd3f-5ec3-b16f-08774dbc1564', 'Kgpart (Турция)', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()'),
('01b4d391-704f-5a7f-af5f-1ab5e7007254', 'Без поставщика', 'supplier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 'now()', 'now()');

-- Migrated 82 suppliers/manufacturers

-- Step 3: Products
-- PRODUCTS MIGRATION
-- Generated: 2026-03-08T04:55:46.839484
-- Records: 1102

INSERT INTO products ("id", "category_id", "manufacturer_id", "name", "sku", "barcode", "description", "price", "cost_price", "compare_at_price", "min_stock", "stock", "unit", "has_variants", "image_url", "images", "is_active", "is_featured", "seo_title", "seo_description", "slug", "tags", "attributes", "metadata", "created_at", "updated_at", "deleted_at") VALUES
('26dd065f-c94b-58f2-9c3e-1257403bc1b4', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Парапетный котел КСГЗ - 7 Е "Очаг" Compact', '0053', NULL, 'Полная независимость от внешних источников электроэнергии. Благодаря закрытой камере сгорания не сжигается воздух из отапливаемого помещения. Патрубки - Ду 50 мм обеспечивают работу котла без циркуляционного насоса. Предусмотрена защита дымохода от задувания. Дымоход входит в комплект поставки. Не требуется дорогостоящая конструкция дымоходной трубы. Удобство монтажа обеспечивает универсальный подвод газа и теплоносителя с двух сторон. В обслуживании удобен благодаря съёмным турбулизаторам и съёмным элементам облицовки. Высококачественная фольгированная теплоизоляция обеспечивает высокий КПД. Габариты котла позволяют легко и удобно разместить его в интерьере помещения. Комплектация газовыми блоками EUROSIT гарантирует оптимальную теплоотдачу котла.
Срок эксплуатации 15 лет.

Комплект универсальной системы дымоудаления в комплекте.', 30170.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('08b09118-0f22-524f-83c8-de0fb10c44dd', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Парапетный котел КСГЗ - 10 Е "Очаг" Compact', '0054', NULL, 'Полная независимость от внешних источников электроэнергии. Благодаря закрытой камере сгорания не сжигается воздух из отапливаемого помещения. Патрубки - Ду 50 мм обеспечивают работу котла без циркуляционного насоса. Предусмотрена защита дымохода от задувания. Дымоход входит в комплект поставки. Не требуется дорогостоящая конструкция дымоходной трубы. Удобство монтажа обеспечивает универсальный подвод газа и теплоносителя с двух сторон. В обслуживании удобен благодаря съёмным турбулизаторам и съёмным элементам облицовки. Высококачественная фольгированная теплоизоляция обеспечивает высокий КПД. Габариты котла позволяют легко и удобно разместить его в интерьере помещения. Комплектация газовыми блоками EUROSIT гарантирует оптимальную теплоотдачу котла.
Срок эксплуатации 15 лет.

Комплект универсальной системы дымоудаления в комплекте.', 36610.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3733ce66-220b-5e51-a635-48f1f4bdcdef', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый КСГ - 10 Е "Очаг" Стандарт', '0004', NULL, '•    Современный уникальный дизайн.
•    Высокий КПД 92% за счет высокоскоростного компактного стального теплообменника.
•    Комплектация газовыми блоками компаний «Sit».
•    Энергонезависимый. Не требует внешних источников электроэнергии.
•    Возможность работы на сжиженном газе.
•    Устойчивый при работе на пониженном давлении газа.
•    Горелка из жаропрочной нержавеющей стали с экономичным расходом газа.
•    Встроенный стабилизатор давления газа и тяги.
•    Удобный в обслуживании за счет съемных турбулизаторов в газоходных каналах и элементов облицовки котла.
•    Удобный в монтаже с возможностью двухстороннего подключения газа.
•    Дополнительная  защита  элементов  термопары от повреждений в эксплуатации.
•    Специальное крепление дымосборника обеспечивает удобство сервисного  обслуживания газоходной части котла.
•    Патрубки котла 1,5 дюйма в диаметре, что снижает затраты при монтаже системы отопления.
•    Срок эксплуатации 15 лет, заводская гарантия 24 месяца.', 26530.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e2ecfdfb-6161-5a94-874a-44f812468520', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый КСГ - 12,5 Е "Очаг" Стандарт', '0006', NULL, '•    Современный уникальный дизайн.
•    Высокий КПД 92% за счет высокоскоростного компактного стального теплообменника.
•    Комплектация газовыми блоками компаний «Sit».
•    Энергонезависимый. Не требует внешних источников электроэнергии.
•    Возможность работы на сжиженном газе.
•    Устойчивый при работе на пониженном давлении газа.
•    Горелка из жаропрочной нержавеющей стали с экономичным расходом газа.
•    Встроенный стабилизатор давления газа и тяги.
•    Удобный в обслуживании за счет съемных турбулизаторов в газоходных каналах и элементов облицовки котла.
•    Удобный в монтаже с возможностью двухстороннего подключения газа.
•    Дополнительная  защита  элементов  термопары от повреждений в эксплуатации.
•    Специальное крепление дымосборника обеспечивает удобство сервисного  обслуживания газоходной части котла.
•    Патрубки котла 1,5 дюйма в диаметре, что снижает затраты при монтаже системы отопления.
•    Срок эксплуатации 15 лет, заводская гарантия 24 месяца.', 29990.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6038420a-9b09-5957-ba0c-73f794cc3309', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый КСГ - 16 Е "Очаг" Стандарт', '0008', NULL, '•    Современный уникальный дизайн.
•    Высокий КПД 92% за счет высокоскоростного компактного стального теплообменника.
•    Комплектация газовыми блоками компаний «Sit».
•    Энергонезависимый. Не требует внешних источников электроэнергии.
•    Возможность работы на сжиженном газе.
•    Устойчивый при работе на пониженном давлении газа.
•    Горелка из жаропрочной нержавеющей стали с экономичным расходом газа.
•    Встроенный стабилизатор давления газа и тяги.
•    Удобный в обслуживании за счет съемных турбулизаторов в газоходных каналах и элементов облицовки котла.
•    Удобный в монтаже с возможностью двухстороннего подключения газа.
•    Дополнительная  защита  элементов  термопары от повреждений в эксплуатации.
•    Специальное крепление дымосборника обеспечивает удобство сервисного  обслуживания газоходной части котла.
•    Патрубки котла 1,5 дюйма в диаметре, что снижает затраты при монтаже системы отопления.
•    Срок эксплуатации 15 лет, заводская гарантия 24 месяца.', 31160.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9e64d19d-0163-55f5-9d9b-ad1639ec14fb', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый АОГВ - 11,6 ЕN "Очаг" Премиум', '0059', NULL, 'Широкая линейка мощностей позволяет подобрать оптимальную модель котла, соответствующую габаритным размерам помещения.
Котлы серии «Премиум- EN» , оснащенные итальянской автоматикой 820 NOVA SIT, имеют ряд дополнительных преимуществ:
- регулятор температуры вынесен на переднюю панель котла с обозначением температур, что позволяет точно выбрать оптимальный тепловой режим
- подсоединение комнатного термостата, при помощи которого можно регулировать температуру котла относительно температуры внутри помещения
- возможность подключения турбонасадки для принудительного вывода продуктов сгорания
- ступенчатый розжиг котла', 42560.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0740a067-13d1-5800-8621-99f881a043c1', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый АОГВ - 17,4 ЕN "Очаг" Премиум', '0060', NULL, 'Широкая линейка мощностей позволяет подобрать оптимальную модель котла, соответствующую габаритным размерам помещения.
Котлы серии «Премиум- EN» , оснащенные итальянской автоматикой 820 NOVA SIT, имеют ряд дополнительных преимуществ:
- регулятор температуры вынесен на переднюю панель котла с обозначением температур, что позволяет точно выбрать оптимальный тепловой режим
- подсоединение комнатного термостата, при помощи которого можно регулировать температуру котла относительно температуры внутри помещения
- возможность подключения турбонасадки для принудительного вывода продуктов сгорания
- ступенчатый розжиг котла', 47410.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d66a4ed2-156b-5b17-a4f8-def81099d033', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый АОГВ - 29 EM "Очаг" Премиум', '0028', NULL, '•    Современный уникальный дизайн.
•    Высокий КПД 92% за счет высокоскоростного компактного стального теплообменника.
•    Комплектация газовыми блоками компаний «Sit».
•    Энергонезависимый. Не требует внешних источников электроэнергии.
•    Возможность работы на сжиженном газе.
•    Устойчивый при работе на пониженном давлении газа.
•    Горелка из жаропрочной нержавеющей стали с экономичным расходом газа.
•    Встроенный стабилизатор давления газа и тяги.
•    Удобный в обслуживании за счет съемных турбулизаторов в газоходных каналах и элементов облицовки котла.
•    Удобный в монтаже с возможностью двухстороннего подключения газа.
•    Дополнительная  защита  элементов  термопары от повреждений в эксплуатации.
•    Специальное крепление дымосборника обеспечивает удобство сервисного  обслуживания газоходной части котла.
•    Патрубки котла 1,5 дюйма в диаметре, что снижает затраты при монтаже системы отопления.
•    Срок эксплуатации 15 лет, заводская гарантия 24 месяца.', 51470.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a59be945-8005-5856-9082-403e1cc5548c', 'e72ed311-51be-5827-9f25-ca31bca97853', '1bde6b50-c34c-52d4-9362-d6d4e3ac27bc', 'Котел газовый АОГВ - 35 EM "Очаг" Премиум', '0030', NULL, '•    Современный уникальный дизайн.
•    Высокий КПД 92% за счет высокоскоростного компактного стального теплообменника.
•    Комплектация газовыми блоками компаний «Sit».
•    Энергонезависимый. Не требует внешних источников электроэнергии.
•    Возможность работы на сжиженном газе.
•    Устойчивый при работе на пониженном давлении газа.
•    Горелка из жаропрочной нержавеющей стали с экономичным расходом газа.
•    Встроенный стабилизатор давления газа и тяги.
•    Удобный в обслуживании за счет съемных турбулизаторов в газоходных каналах и элементов облицовки котла.
•    Удобный в монтаже с возможностью двухстороннего подключения газа.
•    Дополнительная  защита  элементов  термопары от повреждений в эксплуатации.
•    Специальное крепление дымосборника обеспечивает удобство сервисного  обслуживания газоходной части котла.
•    Патрубки котла 1,5 дюйма в диаметре, что снижает затраты при монтаже системы отопления.
•    Срок эксплуатации 15 лет, заводская гарантия 24 месяца.', 52160.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5e8e7153-2090-5f81-a41b-2b5de2c0b59c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник битермический BAXI с прокладками (616170)', '616170', NULL, 'Теплообменник битермический с кольцевыми прокладками арт.  616170 

Подходит для котлов - MAIN, MAIN DIGIT, MAIN Four 

Оригинал


JJJ000616170', 31400.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dc8ac633-18ed-5832-9a0f-32cb4d5a92a5', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Кран трехходовой Navien (30015423А)', '30015423А', NULL, 'Взаимозаменяем с клапаном 30013844A, NAVC9EX00008, 30004815B, AAVC9EX00008.

Трёхходовой клапан для котлов Navien. Подходит к моделям:
Navien Ace 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Ace Coaxial 10K, 13K, 16K, 20K, 24K, 30K,
Navien Atmo 13A, 16A, 20A, 24A, 28A, 13AN, 16AN, 20AN, 24AN,
Navien Deluxe 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Deluxe Coaxial 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Prime 13K, 16K, 20K, 24K, 30K, 35K,
Navien Smart TOK 13K, 16K, 20K, 24K, 30K, 35K.', 5900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('455c3797-6784-5c17-b176-cdf8d3ed6b08', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Вентилятор BAXI (5682150)', '5682150', NULL, '', 11050.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7d6f47d1-adb9-578f-a5e0-8e4b5d36f6ab', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', '7d5f783c-7502-528f-9b74-74a4fed10df1', 'Стабилизатор напряжения инверторный ИнСтаб 350, 350 ВА 220В ШТИЛЬ "IS350"', '4640026600660', NULL, NULL, 7890.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('df5c235f-5cac-5933-9a5e-f3a636aea934', 'e72ed311-51be-5827-9f25-ca31bca97853', 'b163c8fb-d0b2-56fd-a1d8-a706bffe6b7e', 'Котел газовый парапетный Лемакс Патриот 7,5 (без УСД)', '105847', NULL, 'Котел серии «Патриот» с закрытой камерой сгорания мощностью 7,5 кВт может работать как с системой отопления открытого, так и закрытого типа с рабочим давлением до 1,5 атм.', 33040.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('40a74e54-0a50-5696-9536-c655f79e43da', 'e72ed311-51be-5827-9f25-ca31bca97853', '7c34b5a4-b6ce-5e0c-9de2-eddcbc509ba8', 'Котел газовый АОГВ-11,6 ARTU', 'MG-1324253345', NULL, NULL, 30900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bd3580fc-b8a0-5b90-bcfc-88ee747b6007', 'e72ed311-51be-5827-9f25-ca31bca97853', 'e4da9236-0c7f-5603-a8d9-daa7a8f72796', 'Котел газовый АОГВ - 11,6 VARGAZ', 'MG534268910', NULL, NULL, 23990.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('aa15eef5-d7b4-5245-b6f6-4ccfc394f69d', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Стабилизатор напряжения инверторный BAXI Energy 400', 'MG-253118508', NULL, NULL, 9890.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('aa86939a-aa9d-5c70-866a-c9fb7f471ad4', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', '86c23708-e295-5254-9686-ad46699849c2', 'Газовая колонка Mizudo ВПГ 3-11', 'MG510795181', NULL, NULL, 15800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e92f5e44-fd28-50ab-bcdb-073c0a3c5ee6', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', '86c23708-e295-5254-9686-ad46699849c2', 'Газовая колонка Mizudo ВПГ 3-10', 'MG-1843794498', NULL, 'скида до 12480', 13300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4a2a8551-7db5-5b48-9e2d-4dee981d46ff', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', '86c23708-e295-5254-9686-ad46699849c2', 'Газовая колонка MIZUDO ВПГ 4-14Т ТУРБО', 'MG779007338', NULL, NULL, 25300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9a02bba2-5658-56b7-a1f0-d9bb61f70cde', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Газовая колонка BAXI SIG-2 14 i', '7219086--', NULL, 'старая 27137', 32400.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('374740c8-fdb7-5cd3-9844-e8fabebba7c2', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', '97d06411-2b55-50a1-bfe2-773e3ec539db', 'Газовая колонка Superflame SF0120 подводный мир 10 л/м', 'MG1951935820', NULL, NULL, 10300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bc97e819-a19e-587d-ab9c-27c381988916', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S10 белая', '00-00000351', NULL, NULL, 16190.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3089cc86-5ed3-591d-9916-bb05e5f1d2af', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S11 белая', '00-00000091', NULL, NULL, 16890.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c857c704-50f4-585c-878e-6a204e46e8a6', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S13 белая', '00-00002500', NULL, '16650 за нал', 18890.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('50fb33f4-c68c-57e3-a3da-da4b515c2786', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S10 Glass «Горы»', '00-00002094', NULL, NULL, 13800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('900e439d-8f3c-5655-83e3-25d359143eb7', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S10 сжиженный газ', '00-00000438', NULL, 'старая 13890', 16190.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5d9560a1-8f93-5e1a-a347-32b6817f7bff', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'BAXI, Котел газовый ECO Four 24 F', 'CSE46624354-', NULL, 'по сайту за нал 76990
закуп 23.09.25 - 65150р
закуп 24.10.25 - 67250р', 80900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8d8328a0-890e-529a-a93c-476ac71f6723', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'BAXI, Котел газовый ECO Nova 24F', '100021428', NULL, '50000 наличными

Настенные газовые компактные котлы ECO Nova оснащены двумя теплообменниками и латунной гидрогруппой, что выгодно отличает их от других моделей эконом-класса. Модель поставляется с закрытой камерой сгорания и имеет мощность 24 кВт по отоплению и ГВС. Котлы ECO Nova отличаются легкостью в установке, использовании и обслуживании. Жидкокристаллический дисплей удобен в эксплуатации и отображает текущеее состояние котла и устанавливаемые параметры.', 50900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fd284f4f-1b84-5612-aa9f-ee6e9ab75f79', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', '86c23708-e295-5254-9686-ad46699849c2', 'Настенный котел GB MIZUDO M24Т (24 кВт, 2 Т/O) с шиной OpenTherm', 'MZGB2402OT', NULL, 'Настенные котлы MIZUDO — эффективное и экономичное устройство для обеспечения теплом и горячей водой квартир и коттеджей. Благодаря технологии HotRestart, реализованной в данной серии, при перебое и возобновлении подачи электроэнергии или газа котел MIZUDO автоматически возобновит работу с ранее заданными настройками. Встроенная инновационная система контроля параметров котлов MIZUDO постоянно следит за показателями работы котла, информируя пользователя о возможных перебоях в работе и необходимости проведения своевременного технического обслуживания. Котлы MIZUDO потребители выбирают за элегантный дизайн и функциональные возможности. Сервисные и монтажные организациям отмечают простоту и надежность конструкции, удобство установки и обслуживания. Высочайшее качество и надежность котлов MIZUDO подтверждены заводской гарантией 3 года. Каждый котел проходит стендовые испытания, комплектуется паспортом и гарантийным талоном', 51900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('977ef751-5271-5479-b28a-9b4294fdb7aa', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', '86c23708-e295-5254-9686-ad46699849c2', 'Настенный котел GB MIZUDO M24ТH c Шиной OpenTherm (24 кВт, одноконтурный)', 'MZGB2403THO', NULL, '', 52900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1af7f159-aee2-59dd-b583-5ad3ba2747a8', 'dde8de94-afde-5e5f-b7c2-005966c45494', '8861e393-68fd-57f3-b5da-7a9269ba7c72', 'Двигатель насоса Wilo Intnfsl 12/6 HE-1 82W (для MAIN 5, Biasi, Viessmann) 710820200-2_н/о', '710820200-2_н/о', NULL, 'Эта деталь использует следующие артикулы:
Baxi - 710820200
Baxi - 710648600
Fondital - 6CIRCOLA21
Biasi - BI1472100
Federica Bugatti - BI1562100
Viessmann - 7830453
Sime - 6272309
Ariston - 60000591

Запчасть совместима со следующими котлами:
Baxi Main-5
Baxi Eco compact
Fondital Minorca
Biasi Rinnova
Biasi Innovia
Federica Bugatti Turbo
Federica Bugatti Turbo Plus
Viessmann Vitopend 100 WH1B
Sime Metropolis Dgt', 9900.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('81d67665-6f8b-5cde-961f-0fa03bc2184a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое BAXI 8,9X1,9 (710048800)', '710048800', NULL, NULL, 220.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('128210cd-0e5b-598c-b856-8a108b9f8c21', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Вентилятор BAXI (5655730)', '5655730', NULL, 'ООО005655730', 12090.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('142b3458-b2c6-5b43-a44a-3f4dcee45050', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Клапан предохранительный 3 бар BAXI (710109400)', '710109400', NULL, NULL, 1890.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d683fb4b-57e5-588c-86db-8aa74aa8fa94', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник основной BAXI (5677660)', '5677660', NULL, 'Может быть заменен на 5692530', 28040.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('06c76170-ae3f-5732-ab37-54c6bfb7cc01', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник основной BAXI (620870)', '620870', NULL, 'Может быть заменен на 5680990', 24461.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ce131b7a-5d7d-5ba9-a923-8463f8065837', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник основной BAXI (710592300)', '710592300', NULL, 'старая 24400', 28300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('af34237a-dc50-5160-a66e-35fa94beb36b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник основной BAXI (5700950)', '5700950', NULL, NULL, 25053.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9362d394-5b11-5cdf-bf53-01b8d22c6bb8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник ГВС вторичный на 14 пластин BAXI (5686680)', '5686680', NULL, 'Для котлов с латунной гидрогруппой версии 2014 года и и ранее и для котлов с пластиковой гидрогруппой. Рекомендуется в качестве единой запасной части для всех моделей котлов серий ECO Four, Luna-3, Luna-3 Comfort для всех мощностей (24, 28, 31 кВт). Обращаем внимание на указанных сериях котлов с начала 2014 года (12-14 недели) устанавливаются новые не взаимозаменяемые теплообменники. Данный теплообменник может быть также установлен на котлы серий Fourtech и Eco Compact вне зависимости от даты выпуска.

Коды возможной замены
5653680 5655780 5686660 5686690 5653650 5686670 5653660', 8190.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2bc06842-429f-5858-be6b-e1c7320ea6b8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный BAXI (5698270)', '5698270', NULL, 'Более не поставляется. Заменено на 710872000. Может заменяться на аналогичный 721957300. При возможности заменять насосами пониженных характеристик (напор 5 м) 5698260, 721957500.', 19549.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6e35d9b1-04b2-5ed5-bfb9-dec2c91667c2', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный UP 15.50 BAXI (5655200)', '5655200', NULL, 'Более не поставляется. Заменено на 722175500. Поставлялось вместо 5653570
старая 18200', 21800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('829ad255-94aa-55d1-adf0-54b563eac06f', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный UP 15-50 с коннектором BAXI (5661200)', '5661200', NULL, 'Заменено на 722275900.', 19360.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c357f315-05a2-5471-8ccf-24eaed8753b8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный BAXI (3611300)', '3611300', NULL, 'Заменен на 767738300
старая 18194', 21156.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f377d6df-fd54-5c45-86a3-2f300c850c32', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (5702450)', '5702450', 'JJJ005702450', 'Может заменяться на 7731864

JJJ005702450', 18960.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('18dc0a25-bb8b-5b0d-9372-e8660e0b9923', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (710591300)', '710591300', NULL, NULL, 19600.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('afa8118b-b4ea-5c65-ba48-85c8056c8186', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (766487600)', '766487600', NULL, 'Поставляется вместо 766077600. Вместо данной платы также может устанавливаться плата от котла ECO Life (код 7816168)', 18850.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('868be286-e1e2-539d-a817-c222e1b8ff42', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (5687010)', '5687010', NULL, 'Поставляется вместо 5681050
старая цена 22080', 19600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('257bcc3f-f2d8-594d-a78e-57aeea43849d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (5687020)', '5687020', NULL, 'Поставляется вместо 5681760
17028руб', 20240.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c5711d67-3db3-575f-902a-257b23fe9188', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI SIEMENS (3624110) 7837710 3620550 5657840', '3624110', NULL, 'Может устанавливаться вместо 3620550 и 5657840
28390 руб', 28390.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5ae70954-277e-5ab8-83e0-5b4ed7c5392d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (06053401531P)', '06053401531P', NULL, 'Заменено на 200025364. Полный аналог.
12927', 15990.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('79eac63b-b1f7-55cc-872b-851bcd76e113', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Плата электронная BAXI (06053401581P)', '06053401581P', NULL, 'Заменено на 200025365. Полный аналог.', 21240.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4e604f26-1ad6-50b3-aae1-049dd0d0b787', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'b163c8fb-d0b2-56fd-a1d8-a706bffe6b7e', 'Универсальная система дымоудаления Лемакс Патриот "6-7,5-10-12,5" (УСД)', 'MG1393540651', NULL, NULL, 6660.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('513ede48-94e2-525e-997a-c49537fce918', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', '1759dae5-66fb-5b04-bbac-a87f8f02c339', 'Стабилизатор напряжения Бастион Teplocom ST-555 для настенных котлов', '4612734061385', NULL, 'Стабилизатор напряжения Бастион Teplocom ST-555 - это суперкомпактное устройство, предназначенное для повышения качества энергоснабжения в частных домах, квартирах, офисах, административных и промышленных учреждениях. Данная модель разработана специально для защиты систем отопления настенных и напольных котлов от непредвиденных скачков напряжения, короткого замыкания и перегрузок. Устройство выполнено из пластика белого цвета, неприхотливо в уходе, крепится на стену в любом удобном для монтажа месте. Рассчитано на круглосуточную работу, имеет ненавязчивую подсветку в верхней части корпуса. Стабилизатор полностью автоматический, управляется микропроцессором. Тип стабилизации - релейный. Аппарат прекрасно работает в помещениях с влажностью до 95% (при 25 0С) и температурой окружающей среды от +5 до +400С. Устанавливается только внутри помещений.', 6490.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5e61c0ba-c3e1-5982-9930-4df043c13f55', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Газовая колонка BAXI SIG-2 11 i', '7219087--', NULL, 'старая 24100', 28880.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('836b0229-0196-55d2-a56a-c1197235f974', '25516fc9-0c29-5ded-9946-316cbcf67078', '3e72cd9f-0619-5134-b5f2-2a8b6c746e87', 'Плита Газовая Gefest ПГ 700-02 коричневая (настольная)', '4811260002811', NULL, 'Газовая плитка Gefest 700-02 отличается малым весом (3,7 кг), а также компактными размерами, за счет чего модель удобно использовать на даче, в кухне с небольшой площадью и любой планировки, а также общежитиях. Устройство оснащено 2 мощными конфорками, поэтому вы без труда приготовите полноценный обед или ужин для большой семьи, например, одновременно сварите суп и потушите мясо с гарниром.

На рабочую поверхность установлена прочная чугунная решетка, которая не деформируется при воздействии высоких температур. Благодаря таким характеристикам готовить можно как в легких кастрюлях, так и в тяжелых сковородах. Во время работы происходит равномерное нагревание посуды, поэтому пища обжаривается со всех сторон.

Поворотные ручки регулируются в нескольких положениях: от небольшого до интенсивного пламени. Корпус выполнен из термостойкого металла и не травмирует кожу. Модель покрыта эмалью, устойчивой к окислению, появлению ржавчины, и легко очищается от пятен и липкого налета. Gefest 700-02 может подключаться к баллонам со сжиженным газом.', 3690.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1add9f03-0c81-5a73-b2f5-fb4cdb2dc77e', 'e72ed311-51be-5827-9f25-ca31bca97853', 'b163c8fb-d0b2-56fd-a1d8-a706bffe6b7e', 'Котел газовый парапетный Лемакс Патриот 10 (без УСД)', '105848', NULL, NULL, 34545.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('013e0849-c9c7-5e3d-8c0f-b09e7382855e', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Баллон газовый 50л (вентиль) на гарант', 'MG545958158', NULL, 'Баллон газовый стальной 50л предназначен для транспортировки и хранения сжиженных углеводородных газов (пропанов, бутанов и их смесей). Запорное устройство - вентиль ВБ-2 ГОСТ 21804-94. Стальной воротник вокруг вентиля. Для подключения баллонов с вентилем к бытовым газовым приборам необходимо использовать редуктор газовый РДСГ-1-1,2 "Лягушка".

старая 5390', 5990.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9269945f-bd9b-5088-8eed-1cda04741def', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0c20ec29-d01d-5c86-8c5f-908d2488e788', 'Счетчик газа NPM G-4 Газдевайс (правый) 2023', '4607014', NULL, NULL, 2400.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2f3d8e2d-0369-5c6e-9de1-726af0e4d40c', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0c20ec29-d01d-5c86-8c5f-908d2488e788', 'Счетчик газа NPM G-4 Газдевайс (левый)', '4607014-1', NULL, 'скидка до 3000 за нал.', 3150.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('42c0e92d-8188-545f-b917-a92af7c9adeb', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Система Автономного Контроля Загазованности Бытовая СГК-1-Б-СН4 DN 20 НД', 'MG1329648147', NULL, NULL, 5800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4ea968da-4796-5502-ad3e-78d650e10429', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'c4b674d0-3da5-5a7a-acd3-6432a0604535', 'Комплект запасных частей водогазового узла Neva - 4510М, 4511, 4513М (4211-02.200)', '4211-02.200', '4620054492376', 'Рем. комплект для газовых водонагревателей Neva - 4511, 4513М, 5514 

Артикул: 4211-02.200 (рем. комплект водяного узла)

Рем. комплект водяного узла к ВПГ Baltgaz COMFORT 11, 4510М, 4511, 4513М', 1100.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('86e45d67-25ef-5b84-878c-82a821df1c8d', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'c4b674d0-3da5-5a7a-acd3-6432a0604535', 'Узел водяной латунный универсальный (10-11л). NEVA, BaltGaz, Mizudo, Superflame, Vilterm, (4311-60.000)', '4311-60.000', NULL, NULL, 5540.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a0b2154f-7928-527d-a950-d214207c0a46', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'c4b674d0-3da5-5a7a-acd3-6432a0604535', 'Узел водяной латунный универсальный (13-14л.) NEVA, BaltGaz (4311-60.000-01)', '4311-60.000-01', NULL, '4620054496077', 5540.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('11047e99-e228-5a4e-9a8e-bfa5d1b253f6', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0a894328-b4fd-5117-84c1-9bbba27d1094', 'Счетчик газа СГБМ - 1,6 Бетар г/г', 'MG1943409392', NULL, NULL, 3150.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('85d9cd13-a135-579f-bed5-201f92efc97e', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0a894328-b4fd-5117-84c1-9bbba27d1094', 'Счетчик газа СГБМ - 4 Бетар г/г', 'MG-1494010034', NULL, 'старая 3550', 3850.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e882c3e6-d430-53c9-bc29-1955bcadd23d', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'KIT00A Комплект коаксиальный 60/100 унив. антилед (хомут, стакан 60/50,фланец, 2манжета)', 'MG1535729824', NULL, NULL, 3150.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('27c8428d-0915-5926-9f2d-b80651766fc8', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0a894328-b4fd-5117-84c1-9bbba27d1094', 'Счетчик газа СГБМ - 1,6 Бетар ш/ш', 'MG-1646636288', NULL, NULL, 3150.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('66bc9223-71cb-54fb-b1a0-8f629f6d6ad0', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Двухконтурный настенный газовый котел VilTerm 24T', 'MG-1346954493', NULL, 'Технические характеристики:
Вид газа Природный G20 / Сжиженный G30
Семейство; группа газа (природный / сжиженный) 2-е; Н / 3-е; B/P
Давление газа в магистрали (природный / сжиженный), кПа 1,3 – 2,0/2,9
Возможность работы при давлении природного газа, мбар 6 – 20
Номинальная теплопроизводительность, кВт 24,0
Номинальная тепловая мощность, кВт 26,6
Максимальный расход газа (природный / сжиженный), м3/ч / кг/ч 2,82 / 2,11
Минимальная теплопроизводительность, кВт 8,9
КПД при 100% тепловой мощности, не менее % 89
КПД при 30% тепловой мощности, не менее % 90,7
Контур отопления:
Диапазон регулирования температуры, °С 30 + 85
Минимальное рабочее давление теплоносителя, МПа 0,1
Максимальное рабочее давление теплоносителя, МПа 0,3
Объём встроенного расширительного бака, л 6,0
Давление воздуха в расширительном баке, МПа 0,1
Контур горячего водоснабжения:
Расход воды при нагреве на ΔT=25 °С, л/мин 14,0*
Диапазон регулирования температуры, °С 30 + 60
Минимальное рабочее давление воды, Рмин, МПа 0,015
Максимальное рабочее давление воды, Рмакс (при тепловом расширении воды давление не должно превысить эту величину), МПа 1,0
Минимальный проток воды для включения, л/мин 2,5
Минимальный проток воды для выключения, л/мин 1,5
Удельный расход воды, D (ΔT=30 °C), л/мин 11,6*
Массовый расход продуктов сгорания (прир. / сжиж.), г/с 17,0 / 18,5
Средняя температура продуктов сгорания, °С 160
Тип отвода продуктов сгорания, Принудительный
Требуемое разрежение в дымоходе (тяга), Па –
Теплоноситель, Вода, антифриз
Тип циркуляции теплоносителя, Герметичная принудительная циркуляция
Тип воспламенения, Автоматическое воспламенение электронное зажигание
Поддержание заданной температуры , Автоматическое поддержание с точностью ±1 °С
Индикация температуры, ЖК дисплей
Номинальное напряжение электропитания, В 220
Возможность работы при напряжении, В 180-250
Номинальная частота электрического тока, Гц 50
Максимальное потребление электрической энергии, кВт 0,125
Плавкий предохранитель, А 2
Класс электробезопасности , I
Степень защиты, IP X4D
Габаритные размеры: высота x ширина x глубина, мм 720×410×326
Масса нетто/ Масса брутто, не более, кг 34,0 / 36,5
Присоединительные размеры:
Вход газа, дюйм G3/4
Вход и выход контура отопления, дюйм G3/4
Вход и выход контура горячего водоснабжения, дюйм G1/2
Входное воздушное отверстие/ выходное отверстие продуктов сгорания (для коаксиальных труб), мм Ø 100 / Ø 60
Входное воздушное отверстие/ выходное отверстие продуктов сгорания (для раздельных труб), мм Ø 80 / Ø 80', 37000.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4ce6dea0-6381-5791-96b7-1e508d3c2e44', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', '86c23708-e295-5254-9686-ad46699849c2', 'Настенный котел GB MIZUDO M24 (24 кВт, 2 Т/O) открытая камера', 'MZGB2409', NULL, NULL, 52500.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b7e33e6c-90eb-520e-bc94-776c7189ca3a', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', '86c23708-e295-5254-9686-ad46699849c2', 'Настенный котел GB MIZUDO M32Т (32 кВт, 2 Т/O) с шиной OpenTherm', 'MZGB3202OT', NULL, NULL, 68200.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f3a7c605-c37b-5575-8d17-d66e286f4ab2', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', '86c23708-e295-5254-9686-ad46699849c2', 'Настенный котел GB MIZUDO M32ТH c Шиной OpenTherm (32 кВт, одноконтурный)', 'MZGB3203THO', NULL, NULL, 64200.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d5c852b9-658d-58df-b757-79c2546629d6', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'BAXI, Котел газовый LUNA-3 1.310 Fi (одноконтурный)', 'CSE45531366-', NULL, '', 93900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('04f85eed-4672-5f0b-a578-be54f9fa6670', '3439eb51-1ec7-50c7-9b63-1853e96ff667', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Накопительный газовый водонагреватель Ariston SGA 200 R, белый', '007730', NULL, NULL, 92900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('060d6911-2b99-5eef-9fe0-2ea3a6054b54', '3439eb51-1ec7-50c7-9b63-1853e96ff667', '997c9969-bda4-56c7-bbd3-ff4b1936b72a', 'Бойлер косвенного нагрева GEFFEN GLB 200, эмаль', '05040201', NULL, NULL, 51150.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4e822ff5-fcde-5373-b46f-bdb3299b2c01', 'e72ed311-51be-5827-9f25-ca31bca97853', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Котел газовый КОВ-10 СВПС ЖАР Compact TGV', 'MG1313717608', NULL, NULL, 16520.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b1caebff-8961-5c68-918e-fea3300a53bc', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 2.0 м г/г Tuboflex', 'MG744919568', NULL, NULL, 650.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ef7381c5-c631-5656-ab4e-65e2287a2d9e', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 2.5 м г/ш Tuboflex', 'MG1979087715', NULL, NULL, 600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('131bb22d-fa81-50bb-aa2d-bb883e6b0ef5', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 3.0 м г/г ELKA', 'MG-1094213563', NULL, NULL, 700.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8313907b-9205-56e0-b0e5-21a2c259558e', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 1.5 м г/ш Tuboflex', 'MG-1632852597', NULL, NULL, 480.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d182832a-9926-534d-9f10-24b886042a16', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 1.8 м г/ш Tuboflex', 'MG-867507601', NULL, NULL, 564.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0c64372c-bfd1-5d84-8856-a42b29f30b95', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 0.5 м г/ш Tuboflex', 'MG383907123', NULL, NULL, 350.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5509991e-4203-5a34-b355-ab196095a1ba', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 3.0 м г/ш ELKA', 'MG170025450', NULL, NULL, 730.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4c4693d2-0278-515a-91bc-c9087c87ee1d', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 1.8 м г/ш ELKA', 'MG1019391075', NULL, NULL, 675.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e9b3dca4-e4fb-5e89-869a-bf74446e8b6f', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 1.5 м г/ш ELKA', 'MG2019973002', NULL, NULL, 530.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('035e47d1-5d0c-51e1-ad20-5143bafef9dc', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 2.0 м г/ш ELKA', 'MG-965125322', NULL, NULL, 690.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8313e6d6-3279-5025-8e66-598a1adb23ae', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 2.0 м г/ш Tuboflex', 'MG1772664833', NULL, NULL, 490.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b5a4e177-c75d-561c-a8af-934a7b2276ea', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 0.6 м г/ш СПГ', 'MG-1788199813', NULL, NULL, 250.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('722cb3a1-dcfb-538a-ad37-333917ec49d7', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 2.5 м г/г Tuboflex', 'MG-1319150674', NULL, NULL, 815.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dc6068d9-4292-587e-96c2-81922b603be4', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 0.6 м г/г ELKA', 'MG-1162724105', NULL, NULL, 250.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b5bcf777-dd16-552d-9b30-1f9bbb5e0f8d', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 0.4 м г/г AQUALINK', 'MG2095689705', NULL, NULL, 160.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9d83ed8d-7356-5c94-a44a-6bb5e795d418', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 0.3 м г/г AQUALINK', 'MG-1967632980', NULL, NULL, 160.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ed972d6c-2701-58d5-8352-ecccf706a4db', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 1.2 м г/г A-Plus', 'MG1402342282', NULL, NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b60372db-04db-501a-ba54-aaf7d293bc8f', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 1.8 м г/г A-Plus', 'MG1780533229', NULL, NULL, 550.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3eaa6977-7f88-5929-b1d7-a62ee6731a46', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 0.8 м г/г A-Plus', 'MG1656467569', NULL, NULL, 390.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('35a961c4-b909-5db2-b4bb-cb9e69792447', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 3.0 м г/г A-Plus', 'MG2078383342', NULL, NULL, 870.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6f8de4d2-c289-5f5d-b77c-ee7e59daa4c7', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 4.0 м г/г A-Plus', 'MG1916606214', NULL, NULL, 960.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d3319641-9dd3-55b7-acf9-a81ba838a3d0', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 4.0 м г/ш A-Plus', 'MG-604472405', NULL, NULL, 995.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3968ab0a-b9cd-542c-9dbb-e2115441e1bc', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 5.0 м г/г A-Plus', 'MG-576192762', NULL, NULL, 1400.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8d7427f7-135d-5deb-9ee1-99644e5b2a69', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 1.5 м г/г A-Plus', 'MG-853695368', NULL, NULL, 620.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3ecb051b-f262-53be-a1a3-77bf3bc4be08', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 0.8 м г/г A-Plus', 'MG-1059143774', NULL, NULL, 495.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9d68b6cb-0f15-5a60-b943-a6aba32c594f', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 3/4" 1.0 м г/г A-Plus', 'MG-1029427278', NULL, NULL, 600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8a2d20b3-d91c-5400-b439-8b61582b8153', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 2.0 м г/г A-Plus', 'MG-983532770', NULL, NULL, 630.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('72d518cc-3c88-544a-b572-a5f48a584447', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 2.5 м г/г A-Plus', 'MG-940687819', NULL, NULL, 730.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('03d9e409-5290-5609-9991-1905611ad8bb', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка для газа ПВХ 1/2" 1.5 м г/г A-Plus', 'MG-642768050', NULL, NULL, 490.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f20058df-b1b3-5b5c-a799-30fe6dab3c22', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Расширительный бак CIMM 6 литров для BAXI Main-5 (710471200)', '710471200', NULL, NULL, 7592.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c4723f23-235f-51e2-8b97-9437f3793abb', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Вентилятор BAXI (63111300821P)', '63111300821P', NULL, '63111300821P', 7870.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bc2d9395-d40d-5172-ae9a-cb569c29e085', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Передняя термоизоляционная панель BAXI (5410730)', '5410730', NULL, NULL, 3152.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2a441736-9dcf-5bba-94f9-2076018bc58a', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Ремкомплект 3-х ходового клапана в сборе для котлов Protherm Ягуар, Lynx, Гепард RU (0020118196.UF)', '0020118196.UF', NULL, NULL, 1920.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('36c65646-0828-5751-93c0-311cae87e33d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Блок управления Deluxe 13-24K, Coaxial 13-24K, Atmo 13-24A, Ace13-35K, Coaxial 13-35K (30013766F)', '30013766F', NULL, NULL, 10400.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('45b10e58-b9ca-5255-8213-9e4671a78a55', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Воздухоотводчик насоса Navien Deluxe13-40K,Ace 13-40K,Coaxial 13-30K, Atmo13-24A(N) (30014451A)', '30014451A', NULL, NULL, 1610.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d814bdc6-0398-5316-9c49-e24ac72629b4', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Комплект ремонтный для настенных котлов (кольца уплотнительные) Navien (30007978A)', '30007978A', NULL, '', 1350.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f08ab749-f41a-58e8-9282-89574135df77', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Циркуляционный насос Deluxe,Deluxe Coaxial, Ace, Ace Coaxial, Atmo (30000469B)', '30000469B', NULL, '28755797788900583', 14868.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('68664270-dc7e-5ec6-a31f-1c618cd67480', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Счетчик газа СГМБ-4-20Ф (Орел) (ПОД ЗАМЕНУ РОТОРНОГО СЧЁТЧИКА РЛ-ОМЕГА)', 'MG-81447593', NULL, NULL, 3700.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bc97c352-1330-5591-ac82-81cc5e077d41', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'e667eed7-e799-5dfb-97b0-cdfed595f0ed', 'Счетчик газовый Элехант СГБ-4 г/ш', 'MG-81816181', NULL, NULL, 3450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('746fcfd3-cf0a-58c0-87fd-5cc158ead1b0', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0a894328-b4fd-5117-84c1-9bbba27d1094', 'Счетчик газа СГБМ - 4 Бетар ш/ш', 'MG1339506802', NULL, NULL, 3850.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c20c71af-4a66-5ce4-a72a-6a4f0f826584', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Циркуляционный насос Protherm / Duca (для Lynx, Jaguar) 0020119604.MG', '0020119604.MG', NULL, NULL, 11000.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4309106c-91a7-55a0-9def-17c8421511b1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Циркуляционный насос Bosch / Duca 15-50 c обратным вращением (Bosch 6000) 87186481810.MG', '87186481810.MG', NULL, 'CP.042', 10300.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('24050840-e3c4-58e4-b4f7-932cbef58fc7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Двигатель насоса Grundfos 90W 5661200.MG', '5661200.MG', NULL, 'Двигатель насоса Copo Grundfos Type 95W (все модели Grundfos 15-50,15-60) 5661200.MG', 9000.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fe74d3c0-a51a-58f4-9a82-3824c22c9803', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Теплообменник 1101-07.000 (VilTerm S11)', '1101-07.000', NULL, '4640108970131
1шт использована по гарантии', 8640.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6e3f4078-858d-558f-844a-5f800b8dc8a9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Теплообменник 1102-07.000 (VilTerm S10)', '1102-07.000', NULL, '4640108970155', 8320.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('18ce2687-ac85-59b4-a649-59fb6416f585', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Теплообменник 1103-17.000 (VilTerm S13, E14) на гаранте', '1103-07.000', NULL, 'проведен как гарантийный', 10800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ec4c1ad3-ee89-52bc-b767-bcd41cb94445', 'dde8de94-afde-5e5f-b7c2-005966c45494', '47a52980-ff8d-54d3-ac99-56b5df280568', 'Ремкомплект водяного узла Neva Lux 5514, 6014 до 17г.', 'MG-582768726', NULL, 'старая 1100', 900.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3605eab8-08ba-51b8-adab-da6b37ffa5bb', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Предохранительный клапан 3 бар (для BAXI/Viessmann) 710071200.MG / 7823864 / 0020014173 пластик', 'KG0024006', NULL, '', 790.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5fa0a78b-4a76-5f8a-bc5d-b1af14a1e4f4', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Двигатель трехходового клапана для котлов Protherm Ягуар, Lynx (0020119256.MG)', '0020119256.MG', NULL, NULL, 2280.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a91e8855-a412-57b8-8b64-d78078929910', 'dde8de94-afde-5e5f-b7c2-005966c45494', '8861e393-68fd-57f3-b5da-7a9269ba7c72', 'Двигатель насоса Wilo INTKSL 15/5 82W без гидрогруппы (для MAIN 5, Biasi, Viessmann) 710820200.MG', '710820200.MG', NULL, NULL, 9900.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5277378d-7d05-5de7-9d26-e892cc74e3bb', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S10 серебро', '00-00001028', NULL, NULL, 14440.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ddf0bcf2-8a84-527d-8a2c-7e94836651a0', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'b1ce4a0e-2ff1-5a37-9331-66ef4bbabf38', 'Газовая колонка VilTerm S10 чёрная', '00-00003789', NULL, NULL, 14580.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5495a660-7f28-58c4-9a46-7ead7d3871cc', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ кран наполнения системы в сборе', '620890', NULL, NULL, 2364.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0dc7f800-320d-5e40-88af-52002b8df933', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое (15,54x2,62)', '710046400', NULL, NULL, 248.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('56c10ecb-9f44-56d3-bd8d-525a1993d699', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое (21,5x3) улитки насоса', '710963000', NULL, NULL, 191.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a4de3a9b-6d67-592d-b7d0-06a88d28fee0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое 17,13x2,62 BAXI (711230600) на первичный Eco Nova', '711230600', NULL, NULL, 180.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b11636d1-14a3-5722-aee6-16799e6bd827', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик температуры (NTC) (погружной) 8434820', '8434820', NULL, 'каждый в отдельной упаковке Resideo
SO11001U', 1600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('81a3d255-6f7e-55e7-92d6-ae93074c10a7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'штуцер для анализа продуктов сгорания', '5409480', NULL, '1130', 890.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ef6ad033-e970-56d2-b308-0ca7db02f18a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Пружина фиксирующая ', '8380680', NULL, NULL, 490.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a2296310-bfb3-5db7-9191-1be22b7eef26', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'крепление для панелей котла (внутренний элемент)', '3400400', NULL, NULL, 684.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1c492297-bfc1-5719-825d-b3beac267887', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'крепление для панелей котла (внешний элемент)', '3400390', NULL, NULL, 288.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('38691fa5-f291-59c4-b6e0-62f5adbc8b0c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Сопло горелки D 1,85 природный газ', '721395000', NULL, NULL, 1305.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0751c1d1-7260-589b-950d-2c856a0a1a20', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Устройство розжига для газ. клапана SIT', '8620370', NULL, NULL, 2600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b2777403-10d6-570e-8a4a-28ddd30fc824', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Трубка пневмореле (L=270) 5408080', '5408080', NULL, 'старая 660', 560.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c587cc35-26c5-57ef-be58-b7850af3cdc3', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'пневмореле', '721890300', NULL, NULL, 4500.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5a5ee63e-45bd-5708-8a70-384badf56257', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Трубка бай-пасса в сборе', '5672770', NULL, NULL, 4319.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7ddb3045-7a7b-5339-ab7d-34ea1a48a047', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Кран наполнения системы в сборе BAXI (710224400)', '710224400', NULL, NULL, 2250.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ead75de3-0cfd-56e8-9745-91d98c537156', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'мембрана', '5405960', NULL, NULL, 638.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b38e8ded-9b3b-5866-aa8e-b5a12e26fe57', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Мембрана', '722305500', NULL, NULL, 1050.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0288ac5d-b9e4-517b-afaa-b4df8ea60021', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Электрод розжига', '8620350', NULL, '1509', 1850.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('05766cbf-7b89-526c-bc9e-68a438916d5c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение штока  в сборе', '5630250', NULL, NULL, 931.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c60d1ae6-6d5a-5a12-93ea-994883dae480', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Клапан предохранительный 3 бар', '7728736', NULL, NULL, 2060.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4a18f03f-92aa-5b4f-b920-76784cf31646', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение вторичного теплообменника', '711613500', NULL, NULL, 330.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('116c2815-ace9-5324-9d79-3524a9141380', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое (17x4)', '6399440057', NULL, NULL, 227.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0d502463-b7ce-57d0-b510-299aa8a9bb3e', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое вторичного теплообменника 3,6x19x25 BAXI (6399440051)', '6399440051', NULL, NULL, 230.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5a036df6-0def-5236-bdd8-1ee4d58853b4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ Уплотнение вентилятора', '5412270', NULL, NULL, 457.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5022b023-cbfb-5d99-9dd7-6ee18626d281', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение вторичного теплообменника (5404520.MG) Baxi / 65104334 Ariston', '5404520', 'KG0023678, 5404520.MG', 'Цена за 1 шт
производство Турция', 186.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8a6841c8-f0e1-5b53-ad98-323faebf2b78', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ Уплотнение датчика температуры (NTC)', '5402830', NULL, NULL, 208.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('44e8aefb-0502-5982-9d01-54dce8191061', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое 11,91x2,62 BAXI (710049100)', '710049100', NULL, NULL, 256.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('07ed10de-9d10-5179-bd86-60b18ab3585d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое (23,47x2,62)', '710047800', NULL, NULL, 210.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9ee82389-761a-5ed0-893f-5a0c9e9bf7bd', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ кран наполнения системы в сборе', '611930', NULL, NULL, 1760.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f2578bcf-fb57-51ea-b1ce-59b411faf0e2', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик температуры (NTC) погружной (8435400) Италия', '8435400', NULL, 'Поставляется вместо 8434840. 
Полные аналоги: 
8434840, 8435400 (Eco Four), YYY008435401, YYY84354011P, 200025382 (Eco Nova), 7815662 (Eco Life).', 1600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9896aea5-892c-5b85-9e55-096c8866479c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'кабель электрода зажигания', '710430800', NULL, NULL, 980.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3e168384-be05-5648-9377-bab42b79ec43', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'колпачок электрода изоляционный', '5407830', NULL, NULL, 181.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('09df7d7f-31d9-5968-abb7-c7fa58568069', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ Электрод контроля пламени с кабелем', '8620290', NULL, NULL, 1576.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('65ed7497-6436-536b-a722-1dc631aa7071', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Электрод розжига (или контроля пламени)', '8422570', NULL, NULL, 1769.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2e94734b-6681-5628-8369-f656277b50a6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Провод электрический заземляющий для блока двойного розжига', '711635600', NULL, NULL, 597.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('56a0cf17-f7a4-5322-8d26-a6721cc9c2d7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'предохранительный прессостат системы отопления', '721384000', NULL, '3247', 3580.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d6af19aa-ff2d-5148-89be-80be015d7754', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Прессостат предохранительный системы отопления ( 9951690.MG)', '9951690', NULL, NULL, 1890.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4c3e0168-6165-566f-8ced-ded7c0288418', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'датчик потока ГВС ', '5663770', NULL, NULL, 2353.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('adeacf94-b77f-5ef2-bbc8-fc95dac580a0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Трубка расширительного бака', '711250900', NULL, NULL, 1890.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6037d06e-8eb2-5542-9f48-6dcb01c359e0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение кольцевое (13,94х2,62)', '711296900', NULL, '12шт в т/о 710537600
старая 209', 189.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e8176e4d-4490-52db-b7e3-95267fc97bf4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ Трубка расширительного бака', '5698830', NULL, NULL, 2270.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3ed1a621-eaa6-5c24-8f1a-198537ee4f81', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Трубка расширительного бака (710054000) ECO Home, ECO-4s', '710054000', NULL, NULL, 2520.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c0d07b88-efd6-5d09-a2db-2991bb6020a1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Конденсатосборник BAXI (710447300)', '710447300', NULL, NULL, 1930.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dda34035-00df-594e-ae5e-bc949420765b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Вентури трубка', '5413850', NULL, NULL, 1125.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3193e705-bd62-5434-9710-6195cba6e19c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Устройство Вентури', '710364700', NULL, NULL, 1125.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9bf626ae-5fe4-553d-99a4-b8789c37746e', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Трубка вентури BAXI (Eco Classic, Eco Nova) 6603220001', '6603220001', NULL, NULL, 891.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('90521929-7764-534d-9877-7252bac0e263', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'воздухоотводчик автоматический ', '710493600', NULL, NULL, 3127.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('090f6503-c0f9-5917-b66b-c5e15e4bf497', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ датчик температуры (NTC) (накладной) D18-ITS2410201/0-', '8435500', NULL, NULL, 853.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6945d3bf-1160-5fc0-a80f-4048793348b4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'НЕ ПРОБИВАТЬ датчик температуры (NTC) (накладной)', '8435360', NULL, NULL, 1377.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c66733a2-aa43-5ff3-8db1-f63d8e995213', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик температуры NTC погружной (YYY84354011P) Baymak Турция', 'YYY84354011P', NULL, 'Датчик температуры NTC (погружной) YYY84354011P совместим со следующими моделями:
ECO Classic 10F 100021534
ECO Classic 14F 100021535
ECO Classic 18F 100021536
ECO Classic 24F 100020806
ECO Classic 24F 100021537
ECO Nova 10F 100021538
ECO Nova 18F 100021540
ECO Nova 24F (100021428)', 1575.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('284d558c-c42a-5f26-977a-a88ad2088c8d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Картридж трехходового клапана', '7726370', NULL, NULL, 9837.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8f35f785-2c77-5eb0-a404-56f4da57c0c3', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение плоское кольцевое (6,1x11,5x1,5)', '5402050', NULL, 'старая 263', 213.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5be592ec-c1b0-5266-8579-afd7366136cb', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Трубка расширительного бака ECO5', '711412700', NULL, NULL, 2230.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('58ef6184-4806-520f-b87a-3a6415470a0d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Теплообменник основной Navien 30012862C', '30012862C', '25358797991880753, 25358797991880650, 25358797991880689', 'Теплообменник основной Navien 30012862C (30012862A, 30012723B) совместим с котлами Deluxe 35-40K, Deluxe Plus 35-40K, Prime Coaxial 35K, Smart Tok Coaxial 35K, Ace 35-40K.', 11110.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('aec4a299-b4aa-530d-9cd5-75195709bc3d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Navien Теплообменник основной 30012859C (30012718C, 30012859A/B)', '30012859C', '65151797892960012', 'Подходит для котлов:
 Deluxe 13-24K
 Deluxe Coaxial 13-24K
 Deluxe Plus 13-24K
 Deluxe Plus Coaxial 13-24K
 Prime Coaxial 13-24K
 Smart Tok Coaxial 13-24K
 Ace 13-24K
 Ace Coaxial 13-24K', 11579.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0a0740ad-df6d-5a7b-bdb7-510a26efd3aa', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Прокладка 18,3x3,6 мм Рысь Lynx 24/28 (1 шт) Protherm 0020118641', '0020118641', '8690813414662', 'Старая 256
Прокладка 18,3x3,6 мм Рысь Lynx 24/28 (1 шт) Protherm 0020118641

Используется в:

11JTV Ягуар (Н-RU)

24JTV Ягуар (Н-RU)

Рысь НК11 (N-RU)

Рысь НК24 (N-RU)

Рысь НК28 (N-RU)

Производитель: Protherm

Страна производства: Германия', 206.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c73179ca-3f26-565f-a522-c54a94c7ffb8', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Резиновое уплотнительное кольцо Protherm 0020118704', '0020118704', '8690813413832', 'Модель котла - PROTHERM ЯГУАР 11 JTV (H-RU), PROTHERM ЯГУАР 24 JTV (H-RU)', 250.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8d4eaebd-a46d-53a0-a536-a6b92c2567b4', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Прокладка 23.81x2.62 Protherm', '0020118729', '8690813414082', 'Модель котла
PROTHERM ГЕПАРД 12 MOV (H-RU)
PROTHERM ГЕПАРД 12 MTV (H-RU)
PROTHERM ГЕПАРД 23 MOV (H-RU/VE)
PROTHERM ГЕПАРД 23 MTV (H-RU/VE)
PROTHERM ЯГУАР 11 JTV (H-RU)
PROTHERM ЯГУАР 24 JTV (H-RU)', 272.0, 0, NULL, 19, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a842ac97-f152-5e06-a5f5-0fdf2f582d8b', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Уплотнительное кольцо Protherm Jaguar Lynx 0020118658', '0020118658', '8690813414839', 'Используется на моделях:

PROTHERM LYNX HK 11 (N-RU),
PROTHERM LYNX HK 24 (N-RU),
PROTHERM LYNX HK 28 (N-RU),
PROTHERM ЯГУАР 11 JTV (H-RU),
PROTHERM ЯГУАР 24 JTV (H-RU)
Уплотнительное кольцо основного теплообменника системы отопления котла.

Материал: резина;
Толщина: 3 мм;
Внутренний диаметр: 18 мм;
Наружный диаметр: 24 мм', 250.0, 0, NULL, 7, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e238cb2e-5c67-59d2-8dcb-d37f19dbb687', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Резиновое уплотнительное кольцо 14,2 x 3 мм Protherm 0020118667', '0020118667', '8690813414921', 'Резиновое уплотнительное кольцо 14,2 x 3 мм (10 Штук) Protherm 0020118667', 291.0, 0, NULL, 24, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a44106ff-5047-5e82-9001-184abfdf4727', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный Grundfos UP 15.50 для котлов BAXI (5655200) JJJ005655200', 'JJJ005655200', NULL, 'Насос циркуляционный Grundfos UP 15-50 для настенных газовых котлов BAXI моделей: Baxi Eco 1.240 Fi Baxi Eco 1.240 i Baxi Eco 240 Fi Baxi Eco-3 240 Fi Baxi Eco-3 240 i Baxi Luna 240 Fi Baxi Luna Max 240 Fi Baxi Luna Max 240 i Baxi Main 24 Fi Baxi Main 24i Baxi Nuvola 140 Fi Baxi Nuvola 240 FI Baxi Nuvola 240 i Baxi Nuvola-3 140 B40 Fi Baxi Nuvola-3 240 B40 Fi GPL Baxi Nuvola-3 240 B40 i Baxi Nuvola-3 Comfort 140 Fi Baxi Nuvola-3 Comfort 240 Fi Baxi Nuvola-3 Comfort 240 Fi GPL Baxi Nuvola-3 Comfort 240 i', 13079.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0caafb6a-5101-53e5-8bba-8a63f9816023', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ГРУППА ОБРАТНОЙ ПОДАЧИ ДВУХКОНТУРНОГО КОТЛА 711033700', '711033700', NULL, 'Группа обратной подачи двухконтурного котла 711033700 совместим со следующими моделями:
ECO Compact 1.24 721425401
ECO Compact 1.24 721425402
ECO Compact 24 721425501
ECO Compact 24 721425502
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680', 17531.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c807a1fd-8d3c-58ab-9143-2a3e54bc0c47', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный Grundfos UPS 15-50 для котлов Baxi SLIM (3611300) JJJ003611300', 'JJJ003611300', NULL, 'Насос циркуляционный Grundfos UPS 15-50 для напольных газовых котлов BAXI моделей:
Baxi Slim 1.150 i
Baxi Slim 1.230 Fi
Baxi Slim 1.230 i
Baxi Slim 1.300 Fi
Baxi Slim 1.300 i
Baxi Slim 2.230 i
Baxi Slim 2.300 Fi
Baxi Slim 2.300 i', 15909.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a0c22e60-fc6d-56f9-8e98-ff8045b3201d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный Wilo 6м для котла Baxi MAIN Four / FOURTECH 240 F (5698270) JJJ005698270', 'JJJ005698270', NULL, 'Циркуляционный насос 5698270 совместим со следующими моделями:
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654
FOURTECH 24 (CSR466243680)
Максимальный напор - 6 м., потребляемая мощность - 98 Вт, WILO BXSL 15/6.7-1 с, односкоросной.', 16291.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('76a459f7-4efd-516a-ad4f-65dc7e6daa94', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Газовый клапан Protherm Honeywell VK8525MR1501 для котлов Рысь, Леопард, Тигр с версией 17 (0020035638)', '0020035638', '8585032417443', 'Используется в котлах Protherm Протерм серии:
РЫСЬ 23 BOVERD, 23 BTVERD,
ЛЕОПАРД 24 BOVR версии 17, 24 BTVR версии 17,
ТИГР 12 KTZR версии 17, 24 KTZR версии 17, 12 KOZ версии 17, 24 KOZR версии 17.
Шаговый двигатель для газового клапана Honeywell CE-1312BM3541 поставляется как отдельное комплектующие Ref: 40001242451 24 VDC 6VA. Аналогом газового клапана VK8525MR 1501 является газовый клапан торговой марки Sauiner Duval S10716 c регулятором CE1312BM3541 – газовые клапана взаимозаменяемы.', 13069.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b1ba855f-cfcb-58fe-b662-8f0b1f26427b', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Трехходовой клапан в сборе (гидроблок) Protherm Рысь Lynx, Ягуар, Гепард 0020118698', '0020118698', '8690813413764', 'Устанавливается в котлах:
Protherm Гепард 12 MOV H-RU
Protherm Гепард 23 MOV H-RU
Protherm Гепард 12 MTV H-RU
Protherm Гепард 23 MTV H-RU
Protherm Lynx 11, 24, 28
Protherm Ягуар Jaguar 11JTV
Protherm Ягуар Jaguar 24JTV
12MOV20 Гепард (H-RU),
23MOV20 Гепард (H-RU/VE),
12MTV20 Гепард (H-RU),
23MTV20 Гепард (H-RU/VE),
Рысь HK11 (N-RU),
Рысь HK24 (N-RU),
Рысь HK28 (N-RU),
11JTV Ягуар (H-RU),
24JTV Ягуар (H-RU).
Код замены: D003202242, 3003202242
Запчасть для котла Protherm,  трехходовой клапан переключения для Protherm РЫСЬ.
Подходит для моделей LYNX 24 и LYNX 28
Вид запасной части: Группы ГВС и гидравлические комплектующие
Производитель: PROTHERM', 4950.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dc658eac-e93f-5721-a418-8b8f50272d2f', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Подпиточный клапан (для Ariston / BAXI) 65104324-2_н/о', '65104324-2_н/о', '65104324, 710046600, 65114261, 766947000', 'Модели Котлов:

Ariston BSII
Ariston Clas
Ariston Egis (после 2008)
Ariston Genus
Ariston Matis
Baxi Duo-tec compact
Baxi Eco compact
Baxi Eco home
Baxi Eco-4s
Baxi Eco-5 compact
Baxi Fourtech
Chaffoteaux Alixia
Chaffoteaux Pigma
Chaffoteaux Talia', 1680.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('30052758-8df2-5cc1-9027-80e423dc3035', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Газовый клапан Protherm Lynx, Ягуар (0020118636) Beretta Novella 20059831', '0020118636', '8690813414617', 'Газовый клапан SIT 845070 (845057)
Клапан газовый для настенных газовых котлов Protherm моделей:

    Protherm Lynx (Новая Рысь) HK 11
    Protherm Lynx (Новая Рысь) HK 24
    Protherm Lynx (Новая Рысь) HK 28
    Protherm Ягуар Jaguar 11JTV
    Protherm Ягуар Jaguar 24JTV

    PROTHERM LYNX HK 11 (N-RU),        
    PROTHERM LYNX HK 24 (N-RU),
    PROTHERM LYNX HK 28 (N-RU),
    PROTHERM ЯГУАР 11 JTV (H-RU),
    PROTHERM ЯГУАР 24 JTV (H-RU)', 8570.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bf6a31db-e03b-5b26-abc1-44cea4cb4db8', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'УДАЛЕНО, НЕ ПРОБИВАТЬ Датчик давления (для Vaillant, Protherm) 0020118696.MG / 0020059717', '0020118696.MG', NULL, 'Датчик давления (для Vaillant, Protherm) 0020118696.MG / 0020059717 Германия', 1940.0, 0, NULL, 11, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d544447c-6432-520b-8f41-7b7ca74e7ea4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Насос циркуляционный Grundfos 15-50 75w (63104010341P)', '63104010341P', NULL, 'Для моделей:
ECO Classic 10F (100021534);
ECO Classic 14F (100021535);
ECO Classic 14F (100022867);
ECO Classic 18F (100021536);
Eco Classic 24F (100020806);
Eco Classic 24F (100021537);
ECO Classic+ 10F (100022999);
ECO Classic+ 14F (100023000);
ECO Classic+ 18F (100023001);
ECO Classic+ 24F (100022998);
ECO Nova 1.24F (100022963);
ECO Nova 10F (100021538);
ECO Nova 14F (100021539);
ECO Nova 18F (100021540);
ECO Nova 24F (100021428).', 16000.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4bf02455-0199-597b-9608-88a02404d797', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Датчик температуры NTC 19 мм для котлов Vaillant 193592', '193592', '4024074479834', 'Датчик температуры NTC 19 мм для котлов Vaillant 193592

Датчик NTC с диаметром 19 мм Vaillant используется на котлах и предназначен для измерения температуры в системах отопления. Его установка производится врезным способом в контуры, а подключается датчик к электронной плате котла, на которую передает информацию, в зависимости от чего происходит регулировка интенсивности сгорания пламени, что позволяет экономить топливо. Отличается длительным сроком эксплуатации, но при выходе из строя потребует полной замены.

Устанавливается в модели котлов Vaillant:

TurboTEC Pro/Plus:

VU 254/4-7;  VUW 254/4-7;  VU 105/4-7;  VU 255/4-7;  VUW 255/4-7;  VU 202/5-5;  VU 242/5-5;  VU 282/5-5;  VU 362/5-5;  VUW 202/5-3;  VUW 202/5-5;  VUW 242/5-3;  VUW 242/5-5;  VUW 282/5-3;  VUW 282/5-5;  VUW 322/5-5;  VUW 362/5-5;  VUW 255/4-7;  VUW 202/3-3 M, R1;  VUW 242/3-3 M, R1;  VUW 202/3-3, R1;  VUW 202/3-5;  VUW 282/3-3, R1;  VUW 282/3-5;  VUW 322/3-5;  VUW 242/3-3, R1;  VUW OE 236/3-5;  VUW 362/3-5;  VUW OE 296/3-5;  VUW 242/3-5;  VUW OE 346/3-5;

AtmoTEC Pro/Plus:

VU 200/5-5;  VU 240/5-5;  VU 280/5-5;  VUW 180/5-3;  VUW 180/5-3;  VUW 200/5-3;  VUW 200/5-5;  VUW 240/5-3;  VUW 240/5-5;  VUW 280/5-3;  VUW 280/5-5;  VU 254/4-7;  VUW 254/4-7;  VU 240/3-3 M, R1;  VUW 200/3-3 M, R1;  VUW 240/3-3 M, R1;  VUW 200/3-3, R1;  VUW 200/3-5;  VUW 240/3-3, R1;  VUW 240/3-5;  VUW 280/3-3, R1;  VUW 280/3-5;  

EcoTEC Pro/Plus:

VU INT IV 246/5-5 R2;  VU INT IV 306/5-5 R2;  VU INT IV 346/5-5 R2;  VU INT IV 386/5-5 R2;  VUW INT IV 236/5-3 R2;  VUW INT IV 286/5-3 R2;  VUW INT IV 346/5-3 R2;  VUW INT IV 246/5-5 R2;  VUW INT IV 306/5-5 R2;  VUW INT IV 346/5-5 R2;  VM 246/5-5, R2;  VM 306/5-5, R2;  VMW 236/5-3, R2;  VU INT 246/3-5;  VU INT 376/3-5;  VUW INT 236/3-5;  VU OE 246/3-5;  VU OE 306/3-5;  VMW 286/5-3, R2;  VCW 296/3-5;  VCW 346/3-5;  VCW 376/3-5;  VMW 246/5-5, R2;  VCW 226/3-3;  VMW 306/5-5, R2;  VCW 286/3-3;  VMW 346/5-5, R2;  VU OE 376/3-5.', 1201.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5be1883b-1a9b-5a60-827a-02b6eab7e5d9', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'ДАТЧИК NTC (103430)', '103430', '4024074479469', 'Датчик NTC Vaillant (103430) относится к дополнительным элементам системы безопасности отопительной установки и предназначены для того, чтобы контролировать температуру жидкости в системе. Особенностью данного датчика является то, что он работает совместно с электронной платой котла, на которую передает информацию о температуре жидкости в контурах отопительной системы. В систему устанавливается врезным способом и отличается длительным сроком эксплуатации, но при выходе из строя потребует полной замены.

Датчик NTC Vaillant (103430) применяется на системах отопления с такой маркировкой:
VUW 240/5-5;
VUW 240/5-5 R1;
VUW 280/5-5.', 2840.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ff52dcb8-1f5c-5a13-95ed-048287c2af3c', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Датчик температуры NTC погружной для котлов Vaillant (252805)', '252805', '4024074165362', 'Датчик температуры NTC (252805 o) предназначен для контроля температуры в газовом оборудовании.

При отсутствии или недостаточной тяге в дымоходе резко повышается температура, вследствие чего датчик срабатывает и размыкает электрическую цепь, закрывая газовый клапан и прекращая подачу газа к горелке и его отключению (блокировке).

Датчик  рассчитан на работу при температурах от 40 до 500 °C.

Срок службы датчика температуры зависит от среды, в которой находится и условий теплообмена.

Устанавливается на следующие модели:

Vaillant atmoMAX pro 240/2-3
Vaillant atmoMAX pro 280/2-3
Vaillant atmoMAX plus 240/2-5
Vaillant atmoMAX plus 280/2-5
Vaillant turboMAX pro 242/2-3
Vaillant turboMAX plus 242/2-5
Vaillant turboMAX plus 282/2-5', 2828.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2c5130af-00c7-5195-a5d9-675cdfcd85d0', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Трубка вентури (пито) для котлов Vaillant (094282)', '094282', NULL, 'Трубка вентури (пито) для котлов Vaillant  094282 предназначена для установки на котлы с закрытой камерой и привинчивается на вентилятор котла. На корпусе вентилятора имеется отверстие для монтажа трубки вентури. Вентури состоит из пластикового корпуса и монтируется в корпус вентиляторов котлов с помощью винта. С помощью силиконовой трубки вентури подсоединяется к прессостату дыма и выполняет функцию передачи давления воздуха плате управления котла. Основной причиной поломки является неправильное включения котла (система отопления неразвоздушена перед включением – в результате вентури расплавилась), а также вариантами поломки являются образование трещин на корпусе и повреждения, связаны с механическим вмешательством.

 

Устанавливается на следующие котлы:
- Vaillant Turbo Max Plus VU 122/ 202/ 242/ 282 – 5
- Vaillant Turbo Max Plus VU2 122/ 202/ 242/ 282 – 5 (R1)
- Vaillant Turbo Max Plus VU2 122/ 202/ 242/ 282 – 5 (R2)
- Vaillant Turbo Max Plus VU2 122/ 202/ 242/ 282 – 5 (R3)
- Vaillant Turbo Max Plus VUW 202/ 242/ 282 – 5
- Vaillant Turbo Max Pro VUW 202/ 242/ 282 – 3
- Vaillant Turbo Max Plus VUW2 202/ 242/ 282 – 5
- Vaillant Turbo Max Pro VUW2 202/ 242/ 282 – 3
- Vaillant Turbo Max Plus VUW 202/ 242/ 282 – 5 (R1)
- Vaillant Turbo Max Pro VUW 202/ 242/ 282 – 3 (R1)
- Vaillant Turbo Max Plus VUW  242/ 282 – 5 (R2)
- Vaillant Turbo Max Pro VUW  242/ 282 – 3 (R2)
- Vaillant Turbo Max Plus VUW 202/ 242/ 282 – 5 (R3)
- Vaillant Turbo Max Pro VUW 202/ 242/ 282 – 3 (R3)
- Vaillant VUI 242/ 282 – 7', 550.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c8563240-7609-54ae-a15b-a7e261dc455e', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Уплотнительное кольцо 1/2", Vaillant (981142)', '981142', '4024074381359', 'Уплотнительное кольцо 1/2", 1шт. котла Vaillant (981142)

Прокладка 981142 для газового отопительного котла применяется во многих газовых моделях Vaillant.

Материал: паронит без асбеста.
Толщина: 1,5 мм.;
Внутренний диаметр: 13 мм.;
Наружный диаметр: 18 мм.', 235.0, 0, NULL, 26, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('af809485-b59c-5118-a9fe-94523b624431', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Прокладка вторичного теплообменника Vaillant (178969)', '178969', NULL, 'Прокладка вторичного теплообменника  для настенного котла Vaillant 

- VUW 200...280/3-3 
- VUW 202...282/3-3 
- VUW 240/5-3 
- VUW 242/5-3 (только для RU, SEE-INT, UA, TR) 
- VUW INT IV 236(286)/5-3 R2(R4)', 138.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('af3b8d5d-3016-53de-a917-101928efb99c', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Прокладка вторичного теплообменника Vaillant (178969.MG)', '178969.MG', 'KG0030787', 'Прокладка вторичного теплообменника  для настенного котла Vaillant 

- VUW 200...280/3-3 
- VUW 202...282/3-3 
- VUW 240/5-3 
- VUW 242/5-3 (только для RU, SEE-INT, UA, TR) 
- VUW INT IV 236(286)/5-3 R2(R4)
238', 230.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0d5e0c6c-5c9e-5b23-b057-669672ad5af4', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Прокладка вторичного теплообменника Protherm (0020014166)', '0020014166', '4024074494943', 'Прокладки резиновые для вторичного теплообменника.

Характеристика:
Внутренний диаметр — 13 мм
Ширина - 4,5мм
Толщина - 6,0 мм

Используется в:
12MOV20 Гепард (H-RU)
12MOV20 Гепард/R1 (H-RU)
23MOV20 Гепард (H-RU/VE)
23MOV20 Гепард/R1 (H-RU/VE)
25KOV20 Пантера (H-RU)
25KOV20 Пантера/R1 (H-RU)
30KOV20 Пантера (H-RU)
30KOV20 Пантера/R1 (H-RU)
25KOO20 Пантера
12MTV20 Гепард (H-RU)
12MTV20 Гепард/R1 (H-RU)
23MTV20 Гепард (H-RU/VE)
23MTV20 Гепард/R1 (H-RU/VE)
25KTV20 Пантера (H-RU)
25KTV20 Пантера/R1 (H-RU)
30KTV20 Пантера (H-RU)
30KTV20 Пантера/R1 (H-RU)
12KTO20 Пантера (H-RU)
12KTO20 Пантера/R1 (H-RU)
25KTO20 Пантера (H-RU)
25KTO20 Пантера/R1 (H-RU)', 129.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3f20bb7a-134d-55e6-832f-60e032dfb858', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Уплотнительное кольцо вторичного теплообменника ГВС Vaillant (981163)', '981163', '4024074381564', 'Материал: прочная термостойкая резина.
Толщина: 2 мм.
Внутренний диаметр: 15 мм.
Наружный диаметр: 19 мм.
Производитель Vaillant.', 245.0, 0, NULL, 42, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9f402674-08a8-501d-8428-45255e142fe3', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'МОТОР ТРЕХХОДОВОГО КЛАПАНА (YYY56945811P)', 'YYY56945811P', NULL, 'Мотор трехходового клапана YYY56945811P совместим со следующими моделями:
ECO Classic 10F 100021534
ECO Classic 14F 100021535
ECO Classic 18F 100021536
ECO Classic 24F 100020806
ECO Classic 24F 100021537
ECO Nova 10F 100021538
ECO Nova 18F 100021540
ECO Nova 24F (100021428)

Полная аналогия с 5694580 и YYY005694581', 4160.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c7493089-86f9-5ac4-bf7a-e16e9c8bf310', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Электрод розжига Baxi (0611410032)', '0611410032', NULL, NULL, 1220.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('67f0f745-e840-53d9-821e-cbafae43b2c5', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Турбинка датчика протока с датчиком Холла в сборе BAXI (200024693)', '200024693', NULL, 'Представляет собой устройство, формирующее выходной сигнал при наличии потока жидкости или газа. Датчик протока с фильтром монтируется в группу трехходового клапана. Внутри датчика протока вмонтирована турбинка, которая вращается при открытии крана горячей воды. В корпусе турбинки впаяны два магнита, вращение которых считывает датчик холла. Показания скорости вращения турбинки определяет количество проходимой воды через датчик протока.

Датчик протока чаще всего выполняют защитную, информационную или управляющую функции. Защитная функция связана с обнаружением наличия потока в системах, где его отсутствие может привести к возникновению аварийных ситуаций или поломкам оборудования.

Устанавливается на следующие котлы:
ECO Classic 10F
ECO Classic 14F
ECO Classic 14F
ECO Classic 18F
Eco Classic 24F
ECO Nova 10F
ECO Nova 14F
ECO Nova 18F
ECO Nova 24F
ECO Nova 31F', 2901.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6869b28e-d8b0-5ca9-9695-5d0f36881619', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Клапан предохранительный 3 бар BAXI (6306101022)', '6306101022', NULL, 'Клапан сбросной на ГВС BAXI арт. 6306101022
Клапан предохранительный 3 бар для газовых котлов BAXI (БАКСИ) 
Eco Classic 
ECO Nova', 2270.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0e33287a-6d2e-5be7-be14-bf5a09a74b0a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Кран подпитки Eco Classic,Eco Nova (Baxi) (200024692)', '200024692', NULL, 'Кран подпитки используется в котлах:
ECO Classic 10F - 100021534
ECO Classic 14F - 100021535
ECO Classic 18F - 100021536
ECO Classic 24F - 100020806
ECO Classic 24F - 100021537
ECO Nova 10F - 100021538
ECO Nova 14F - 100021539
ECO Nova 18F - 100021540
ECO Nova 24F – 100021428
ECO Nova 31F- 100022347', 1085.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7251852f-9b44-54b4-878d-164985bd5c68', 'dde8de94-afde-5e5f-b7c2-005966c45494', '0a0b22a7-9bc3-5b1b-be07-cbee5d33782c', 'ВОЗДУХОУДАЛИТЕЛЬ АВТОМАТИЧЕСКИЙ (6606100001)', '6606100001', NULL, 'Воздухоудалитель автоматический (6606100001) совместим со следующими моделями:
ECO Classic 10F 100021534
ECO Classic 14F 100021535
ECO Classic 18F 100021536
ECO Classic 24F 100020806
ECO Classic 24F 100021537
ECO Nova 10F 100021538
ECO Nova 18F 100021540
ECO Nova 24F (100021428)', 4549.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4d4380ee-0d81-5388-9968-42ad18dbd5f2', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Датчик температуры NTC для котлов Protherm Lynx, Ягуар (0020118638.MG)', '0020118638.MG', 'KG0031324', 'Датчик температуры NTC для настенных газовых котлов Protherm моделей:
    Protherm Lynx HK 11
    Protherm Lynx HK 24
    Protherm Lynx HK 28
    Protherm Ягуар 11JTV
    Protherm Ягуар 24JTV', 600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('648ea795-7a05-5349-aa0f-a433163d86a5', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Комплект подключения бойлера Baxi для Slim (KHW71408741)', 'KHW714087410', NULL, NULL, 16100.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2cc11ccd-8439-5278-9735-a92065ff5a78', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Байпас Protherm Гепард (v.20), Рысь HK (N-RU), Ягуар (H-RU) (0020261477)', '0020261477', '3532041741613', 'Байпас (0020261477) предназначен для предотвращения перегрева теплообменника при неудовлетворительной циркуляции в системе отопления. В этих условиях система нормально регулируется, и при достижении заданного значения температуры горелка выключается.

Устанавливается на следующие котлы:
- Protherm Рысь 11 BA
- Protherm Рысь 24 BA
- Protherm Рысь 28 BA
- Protherm Ягуар 11 JTV
- Protherm Ягуар 24 JTV
- Protherm Гепард 12 MOV 20
- Protherm Гепард 23 MOV 20
- Protherm Гепард 12 MTV 20
- Protherm Гепард 23 MTV 20', 1257.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a1e6a500-5986-59e1-a76b-d9d9fb238d54', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Трубка вентури Hermann Habitat, Колви Термона (40002961)', '40002961', NULL, 'Пластиковая трубка вентури 40002961 вмонтирована на корпусе вентиляторов котлов Hermann и Колви Термона: Вентилятор Hermann Habitat (Habitat 23 | 28 SE, Habitat 2 23 | 28 SE), Колви Термона (Thermona) – Колвитерм KT 20 TCX, KT 20 TLX, KT 28 TLX, KT 28 TCX.', 2890.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d3aa052d-23a4-59af-bf6b-d2dfa761e512', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'АВАРИЙНЫЙ ТЕРМОСТАТ 130°C (0020118652)', '0020118652', '8690813414778', 'Аварийный термостат 130°C Protherm (Протерм) (0020118652) контролирует температуру жидкости в системе. Работает устройство под управлением электронной платы котла и передаёт на нее информацию о состоянии состава. При превышении необходимых параметров система автоматически отключается.

Устанавливается на следующие котлы: 
Protherm Lynx HK 11
Protherm Lynx HK 24
Protherm Lynx HK 28
Protherm Ягуар (Jaguar) 11JTV
Protherm Ягуар (Jaguar) 24JTV
старая 1266 руб', 550.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('02590a9f-e3df-5817-a577-d58cb78f656e', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Аквасенсор (датчик протока) в сборе для котлов Protherm Ягуар, Lynx, Гепард H-RU (0020118662)', '0020118662', NULL, 'Используется в  

Protherm Гепард 12 MOV H-RU
Protherm Гепард 23 MOV H-RU
Protherm Гепард 12 MTV H-RU
Protherm Гепард 23 MTV H-RU
Protherm Lynx HK 11
Protherm Lynx HK 24
Protherm Lynx HK 28
Protherm Ягуар 11JTV
Protherm Ягуар 24JTV', 993.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fc8847b6-f4ed-5f44-b776-8ff30fe5ff59', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Датчик протока ГВС Vaillant Atmo/Turbo TEC (178988.MG) Турция', 'KG0014554', NULL, 'Подходящие модели Vaillant: 
 VUW 386, VUW 376, VUW 326, VUW 316, VUW 286, VUW 246, ecoTEC PRO, ecoTEC PLUS, ecoTEC exclusive, Ecotec Pro', 2690.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('60339975-acd1-518b-a05b-61aaa74d2203', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Ручка для бойлера Protherm Lynx 24/28 (KG0040214) 0020118706', 'KG0040214', NULL, NULL, 820.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e18f4864-dd25-58bb-9621-82e021b03b3a', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Термостат предохранительный 98/70 °C PROTHERM (0020118653)', '0020118653', '8690813414785', 'Защитный термостат, смонтированный на трубке выхода отопительной воды из основного теплообменника для настенных моделей Protherm Рысь HK 11/24/28 (N-RU), Ягуар 11/24 JTV (H-RU)', 810.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b2b9aa5a-49e8-57b6-a882-32186542c2d0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик котла NTC 1/2 (KG0021390)', 'KG0021390', NULL, NULL, 710.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e1a3d5d4-bbe3-5bea-b4ae-c102086d7e69', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Гайка гидроблока (Выход) PROTHERM (0020118725)', '0020118725', '8690813414044', 'Модели котла:
PROTHERM ГЕПАРД 12 MOV (H-RU)
PROTHERM ГЕПАРД 12 MTV (H-RU)
PROTHERM ГЕПАРД 23 MOV (H-RU/VE)
PROTHERM ГЕПАРД 23 MTV (H-RU/VE)
PROTHERM ЯГУАР 11 JTV (H-RU)
PROTHERM ЯГУАР 24 JTV (H-RU)', 540.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('06c96c9b-4dd2-5209-b05f-b29f76e929fa', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Датчик давления для котлов Protherm, Гепард, Пантера, Леопард, Тигр (S5720500.MG)', 'S5720500.MG', NULL, 'Датчик давления для настенных газовых котлов Protherm моделей:
Гепард 11 MOV 19
Гепард 11 MTV 19
Гепард 23 MOV 19
Гепард 23 MTV 19
Леопард 24 BOV 15
Леопард 24 BTV 15
Леопард 24 BOV 17
Леопард 24 BTV 17
Пантера 24 KTV 15
Пантера 12 KTO 15
Пантера 24 KTO 15
Пантера 12 KOO 15
Пантера 24 KOO 15
Пантера 24 KOV 15
Пантера 12 KOO 17
Пантера 24 KOO 17
Пантера 24 KOV 17
Пантера 24 KTV 17
Пантера 28 KTV 17
Пантера 24 KTV 18
Пантера 28 KTV 18
Пантера 24 KOO 18
Пантера 24 KOV 18
Пантера 25 KOV 19
Пантера 25 KTV 19
Пантера 30 KTV 19
Пантера 12 KOO 19
Пантера 25 KOO 19
Пантера 12 KTO 19
Пантера 25 KTO 19
Тигр', 4838.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1cd58bbf-7deb-5c94-84ca-aa9eb38d9aa4', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Байпас для котла Demrad Neva & Protherm Lynx (KG0029475)', 'KG0029475', NULL, NULL, 557.0, 0, NULL, 9, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c3fef0ba-5f1a-5de3-a978-6e39e747ad79', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Сменный датчик NTC Для котла Fondital Antea GWP 18 мм (KG0014454) 0020119602', 'KG0014454', NULL, NULL, 1090.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('325e9155-d052-5c29-9b33-4dc9b4e8ec78', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Крыльчатка (турбинка) датчика протока (из аквасенсора) для котлов Vaillant atmo/turboMAX (0020029604_н/о)', '0020029604_н/о', '22000005477', 'Крыльчатка (турбинка) датчика протока (из аквасенсора) для настенных газовых котлов Vaillant моделей:
atmoMAX pro VUW 240/2-3
turboMAX pro VUW 182/2-3
turboMAX pro VUW 202/2-3
turboMAX pro VUW 242/2-3
atmoMAX plus VUW 120/2-5
atmoMAX plus VUW 200/2-5
atmoMAX plus VUW 240/2-5
atmoMAX plus VUW 280/2-5
turboMAX plus VUW 202/2-5
turboMAX plus VUW 242/2-5
turboMAX plus VUW 282/2-5', 1687.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b5229631-b8e4-5045-bc96-c02cf9545fe8', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Датчик аквасенсора Protherm Ягуар, Lynx, Гепард H-RU (0020118650.MG)', '0020118650.MG', 'KG0013789', 'Датчик аквасенсора для настенных газовых котлов Protherm моделей:
Гепард 12 MOV H-RU
Гепард 23 MOV H-RU
Гепард 12 MTV H-RU
Гепард 23 MTV H-RU
Lynx HK 11
Lynx HK 24
Lynx HK 28
Ягуар 11JTV
Ягуар 24JTV', 1140.0, 0, NULL, 21, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6dca4c8e-800f-5d7d-a7ee-0e39e1bb45cd', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'КРЕПЕЖНЫЕ КЛИПСЫ ТРУБКИ БАЙПАСС (JJJ008380850) удалено не пробивать', 'JJJ008380850', NULL, 'Крепежные клипсы трубки байпасса 8380850 совместим со следующими моделями:
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
LUNA-3 1.310 Fi CSE455313660
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.240 i CSE451243580
LUNA-3 COMFORT 1.240 i CSE451243581
LUNA-3 COMFORT 1.240 i CSE451243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 310 Fi CSB456313690
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654', 442.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6fe965aa-93c7-577d-ab40-8e0457e65c1f', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'КЛИПСЫ ТЕПЛООБМЕННИКА (JJJ005114360)', 'JJJ005114360', NULL, 'Клипсы теплообменника 5114360 совместим со следующими моделями:
ECO Compact 1.24 721425401
ECO Compact 1.24 721425402
ECO Compact 24 721425501
ECO Compact 24 721425502
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
MAIN 24i BSB432243650
MAIN 24i BSB432243651
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652', 620.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('83144c4d-4f13-568a-a92c-09f5035561d1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'КРЕПЕЖНЫЕ КЛИПСЫ ТЕПЛООБМЕННИКА (JJJ005113650)', 'JJJ005113650', NULL, 'Крепежные клипсы теплообменника 5113650 совместим со следующими моделями:
ECO Compact 1.14 F 711573701
ECO Compact 1.14 F 711573702
ECO Compact 1.24 721425401
ECO Compact 1.24 721425402
ECO Compact 1.24 F 711287001
ECO Compact 14 F 711571901
ECO Compact 14 F 711571902
ECO Compact 18 F 711572001
ECO Compact 18 F 711572002
ECO Compact 24 721425501
ECO Compact 24 721425502
ECO Compact 24 F 710506502
ECO Compact 24 F 710506503
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
LUNA-3 1.310 Fi CSE455313660
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.240 i CSE451243580
LUNA-3 COMFORT 1.240 i CSE451243581
LUNA-3 COMFORT 1.240 i CSE451243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
LUNA-3 SILVER SPACE 250 Fi CSB456253671
LUNA-3 SILVER SPACE 250 Fi CSB456253672
LUNA-3 SILVER SPACE 310 Fi CSB456313671
LUNA-3 SILVER SPACE 310 Fi CSB456313672
MAIN 24 Fi BSB436243651
MAIN 24 Fi BSB436243652
MAIN 24i BSB432243650
MAIN 24i BSB432243651
MAIN DIGIT 240Fi BSE446243650
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654
MAIN-5 14 F 711178001
MAIN-5 18 F 711178101
MAIN-5 24 F 710775001
MAIN-5 24 F 710775002', 410.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8e908940-250b-5e81-9550-b57c5fc22b1b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'КРЕПЕЖНЫЕ КЛИПСЫ ТЕПЛООБМЕННИКА (JJJ005112510)', 'JJJ005112510', NULL, 'Крепежные клипсы теплообменника 5112510 совместим со следующими моделями:
ECO 1.240 Fi CSE435243680
ECO 1.240 i CSE431243680
ECO 240 Fi CSE436243680
ECO 240 Fi CSE436243681
ECO 240 i CSE432243680
ECO 240 i CSE432243681
ECO 280 Fi CSE436283680
ECO 280 i CSB432283680
ECO 280 i CSE432283680', 429.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('85973e45-6a20-5847-b1b5-144983fae1fc', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Газовый клапан (SIT 845 048 SIGMA) BAXI ECO (3, Four), FOURTECH, LUNA, LUNA (3, 3 Comfort) SLIM, SLIM 2 (0063AS4831)', '0063AS4831', NULL, 'Модели котлов:
BAXI ECO Four 1.14
BAXI ECO Four 1.14 F
BAXI ECO Four 1.24
BAXI ECO Four 1.24 F
BAXI ECO Four 24
BAXI ECO Four 24 F
BAXI ECO Home 10F (765857701)
BAXI ECO Home 10F (7729462)
BAXI ECO Home 10F (7787575)
BAXI ECO Home 14F (765281001)
BAXI ECO Home 14F (7729463)
BAXI ECO Home 14F (7787576)
BAXI ECO Home 24F (765281101)
BAXI ECO Home 24F (7729464)
BAXI ECO Home 24F (7787577)
BAXI ECO-3 1.240 Fi
BAXI ECO-3 240 Fi
BAXI ECO-3 240 I
BAXI ECO-3 280 Fi
BAXI ECO-4s 1.24 F
BAXI ECO-4s 10 F
BAXI ECO-4s 18 F
BAXI ECO-4s 24
BAXI ECO-4s 24 F
BAXI FOURTECH 1.14
BAXI FOURTECH 1.14 F
BAXI FOURTECH 1.24
BAXI FOURTECH 1.24 F
BAXI FOURTECH 24 (CSB)
BAXI FOURTECH 24 (CSR)
BAXI FOURTECH 24 F (CSB)
BAXI FOURTECH 24 F (CSR)
BAXI LUNA-3 1.310 Fi (CSB)
BAXI LUNA-3 1.310 Fi (CSE)
BAXI LUNA-3 240 Fi (CSB)
BAXI LUNA-3 240 Fi (CSE)
BAXI LUNA-3 240 i (CSB)
BAXI LUNA-3 240 i (CSE)
BAXI LUNA-3 280 Fi (CSE)
BAXI LUNA-3 310 Fi (CSB)
BAXI LUNA-3 310 Fi (CSE)
BAXI LUNA-3 COMFORT 1.240 Fi
BAXI LUNA-3 COMFORT 1.240 i
BAXI LUNA-3 COMFORT 1.310 Fi
BAXI LUNA-3 COMFORT 240 Fi (CSE)
BAXI LUNA-3 COMFORT 240 Fi (CSZ)
BAXI LUNA-3 COMFORT 240 i (CSE)
BAXI LUNA-3 COMFORT 240 i (CSZ)
BAXI LUNA-3 COMFORT 310 Fi (CSE)
BAXI LUNA-3 COMFORT 310 Fi (CSZ)', 10000.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('42bd269f-223b-5a92-8871-1e5abbc58b9c', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Газовая арматура с регулятором давления Honeywell/Resideo VK8515MR для Vaillant atmo/turboTEC Protherm (0020053968) 0020039188', 'KG0021524', '8714724082823', 'Газовая арматура с регулятором давления Honeywell/Resideo VK8515MR для настенных газовых котлов Vaillant моделей:
atmoTEC pro VUW (VU) INT 240/3-3
atmoTEC pro VUW (VU) INT 280/3-3
turboTEC pro VUW (VU) INT 242/3-3
turboTEC pro VUW (VU) INT 282/3-3
atmoTEC plus VUW (VU) INT 240/3-5
atmoTEC plus VUW (VU) INT 280/3-5 
turboTEC plus VUW (VU) INT 242/3-5
turboTEC plus VUW (VU) INT 282/3-5
turboTEC plus VUW (VU) INT 322/3-5
turboTEC plus VUW (VU) INT 362/3-5

Для настенных газовых котлов Protherm моделей:
Гепард 11 Mov
Гепард 11 MTV
Гепард 23 MOV V.19
Гепард 23 МТV V.19
Пантера 12 КОO 18
Пантера 24 КOO 18
Пантера 12 КТО 18
Пантера 24 КТО 18
Пантера 24 KOV 18
Пантера 24 KTV 18
Пантера 12 кOO V.19
Пантера 25 кOO v.19
Пантера 12 КТО V.19
Пантера 25 КТО V.19
Пантера 25 КOV v.19
Пантера 25 KTV v.19
Пантера 30 KTV V.19', 14500.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('681a594b-d619-5fbf-87ba-fda235ee6621', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Дисплей для котлов Vaillant atmo/turboTEC plus 5-5 (0020202560)', '0020202560', '4024074738337', 'Дисплей для настенных газовых котлов Vaillant моделей:
Vaillant atmoTEC plus VUW (VU) INT 200, 240, 280/5-5
Vaillant turboTEC plus VUW (VU) INT 202, 242, 282, 322, 362/5-5', 9342.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e6d3c3ae-2477-5c25-8e7f-f9b9f847d0f3', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Теплообменник ГВС 35 пластин для котлов Vaillant turboTEC plus 32, 36 кВт (0020025041)', '0020025041', '4024074508404', 'Теплообменник вторичный 35 пластин для настенных газовых котлов Vaillant моделей:
Vaillant turboTEC plus VUW INT 322/3-5
Vaillant turboTEC plus VUW INT 362/3-5

20593', 27600.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a9b47007-6818-5168-a48a-8b958c8e2e93', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Циркуляционный насос Vaillant Max Pro (160928)', '160928', '4024074366912', 'Используется на моделях:
Vaillant AtmoMAX PRO 240 VUW,
Vaillant TurboMAX PRO 242 VUW', 33600.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2902759e-9b5c-5b52-8f19-9456a28ade02', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ТРУБКА (710538800)', '710538800', NULL, 'Трубка 710538800 совместим со следующими моделями:
MAIN-5 14 F 711178001
MAIN-5 18 F 711178101
MAIN-5 24 F 710775001
MAIN-5 24 F 710775002', 3380.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('070f64ff-b0fa-55d4-a5b2-674b297da5b0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик температуры NTC погружной для Baxi (8434820.MG) JJJ008434820', '8434820.MG', 'KG0013978', 'Датчик температуры NTC (погружной) (8434820.MG) совместим со следующими моделями:
ECO 1.240 Fi CSE435243680
ECO 1.240 i CSE431243680
ECO 240 Fi CSE436243680
ECO 240 Fi CSE436243681
ECO 240 i CSE432243680
ECO 240 i CSE432243681
ECO 280 Fi CSE436283680
ECO 280 i CSB432283680
ECO 280 i CSE432283680
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
LUNA-3 SILVER SPACE 250 Fi CSB456253671
LUNA-3 SILVER SPACE 250 Fi CSB456253672
LUNA-3 SILVER SPACE 310 Fi CSB456313671
LUNA-3 SILVER SPACE 310 Fi CSB456313672
MAIN 24 Fi BSB436243651
MAIN 24 Fi BSB436243652
MAIN 24i BSB432243650
MAIN 24i BSB432243651
MAIN DIGIT 240Fi BSE446243650
NUVOLA 280 i CSB434283660
NUVOLA 280 i CSB434283661
NUVOLA-3 240 B40 Fi CSB457243560
NUVOLA-3 240 B40 i CSB454243560
NUVOLA-3 280 B40 Fi CSB457283560
NUVOLA-3 280 B40 i CSB454283560
NUVOLA-3 COMFORT 240 Fi CSB457243580
NUVOLA-3 COMFORT 240i CSB454243580
NUVOLA-3 COMFORT 280 Fi CSB457283580
NUVOLA-3 COMFORT 280 i CSB454283580
NUVOLA-3 COMFORT 320 Fi CSB457323580', 550.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d9cd9a98-313f-546e-b22f-bdf5fc5c06c0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ДАТЧИК ТЕМПЕРАТУРЫ (NTC) (НАКЛАДНОЙ) D18 (8435500.MG)', '8435500.MG', '22000006341', 'Датчик температуры (NTC) (накладной) D18 совместим со следующими моделями:
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413', 1130.0, 0, NULL, 6, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('592045c4-6dc8-54ea-a769-b06c29fd15d4', 'dde8de94-afde-5e5f-b7c2-005966c45494', '47a52980-ff8d-54d3-ac99-56b5df280568', 'Ремкомплект водяного узла на Neva Lux 4511, 4513М', '3227-02.278-01', NULL, 'Ремкомплект водяного узла на ВПГ Neva, 4511, 4513М с 2013 года до мая 2017 

Состав: Мембрана 3227-02.278-01, уплотнительные кольца', 1100.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6ca89823-a3ac-5eb6-9fc5-1678f54e25a8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Картридж трехходового клапана для котлов BAXI (711356900_н/о)', '711356900_н/о', NULL, 'Оригинал 8457руб.
Картридж трехходового клапана для котлов BAXI моделей:
Eco Four 24 F
Eco-3 240 Fi
Eco-3 240 i
Eco-3 280 Fi
Eco-3 Compact 240 Fi
Eco-3 Compact 240 i
Luna-3 240 Fi
Luna-3 240 i
Luna-3 280 Fi
Luna-3 310 Fi
Luna-3 Comfort 240 Fi
Luna-3 Comfort 240 i
Luna-3 Comfort 310 Fi', 3860.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('671c8694-84da-5a7e-9144-765cb4b8ece4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик протока ГВС в сборе BAXI (710048100)', '710048100_н/о', NULL, 'Подходит для котлов - DUO-TEC COMPACT, ECO Compact,  ECO Home, ECO-5 COMPACT, FOURTECH.', 2516.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b9369dcb-445c-58b3-9ea1-194f5e055d66', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Катушка комбинированного газового клапана Катушка для газового клапана Sit 230 В Sit 840-898 (KG0043216)', 'KG0043216', NULL, 'Катушка газового клапана совместима с Sit 848,898,845,843,840 Sigma', 1990.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8ec26944-2fb4-500d-a226-bd383a9060d4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ДАТЧИК ТЕМПЕРАТУРЫ (NTC) (НАКЛАДНОЙ) D18 (JJJ008435500)', 'JJJ008435500', NULL, 'Датчик температуры (NTC) (накладной) D18-ITS2410201/0- 8435500 совместим со следующими моделями:
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413', 1940.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('df9372aa-d371-5dfb-b6a4-fdd2f3a2cfb3', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик температуры NTC накладной для котлов BAXI Eco-3, Eco-3 Compact, Luna-3, Luna-3 Comfort (8435360) JJJ008435360', 'JJJ008435360', NULL, 'Датчик температуры NTC накладной для настенных газовых котлов BAXI моделей:
ECO-3 1.240 Fi
ECO-3 240 Fi
ECO-3 240 i
ECO-3 280 Fi
ECO-3 COMPACT 1.140 Fi
ECO-3 COMPACT 1.140 i
ECO-3 COMPACT 1.240 Fi
ECO-3 COMPACT 1.240 i
ECO-3 COMPACT 240 Fi
ECO-3 COMPACT 240 i
LUNA-3 1.310 Fi
LUNA-3 240 Fi
LUNA-3 240 i
LUNA-3 280 Fi
LUNA-3 310 Fi
LUNA-3 COMFORT 1.240 Fi
LUNA-3 COMFORT 1.240 i
LUNA-3 COMFORT 1.310 Fi
LUNA-3 COMFORT 240 Fi
LUNA-3 COMFORT 240 i
LUNA-3 COMFORT 310 Fi', 1980.0, 0, NULL, 13, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1640810d-7a78-56f6-8a89-7af2e12e1481', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Комплект прокладок вторичного теплообменника 24х18х4,3 для Protherm Ягуар, Lynx (0020118654.MG)', 'KG0030970', '0020118654.MG', NULL, 800.0, 0, NULL, 31, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d33ab2bc-2de8-5926-a265-8094dc4ecf88', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', '3-ходовой групповой шаговый двигатель Baymak ECO5 Compact Combi (KG0029608)', 'KG0029608', NULL, NULL, 1707.0, 0, NULL, 7, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('72fee429-d947-5d74-84e7-012375a93eda', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение вторичного теплообменника для котлов BAXI (JJJ005404520)', 'JJJ005404520', NULL, 'Уплотнение вторичного теплообменника для настенных газовых котлов BAXI моделей:
DUO-TEC COMPACT
ECO
ECO Compact
ECO Four
ECO Home
ECO-3
ECO-3 COMPACT
ECO-4s
ECO-5 COMPACT
FOURTECH
LUNA
LUNA DUO-TEC
LUNA MAX
LUNA-3
LUNA-3 COMFORT
PRIME HT

Кольцевое уплотнение с артикулом JJJ005404520 устанавливается на вторичные теплообменники с артикулами: 
5686660
5686670
5686680
5686690
5689930', 375.0, 0, NULL, 8, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('faa30ae3-0d68-5aa5-8da2-265510b6f0b2', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение датчика температуры NTC 9,7х15х2 для котлов BAXI (JJJ005402830)', 'JJJ005402830', NULL, 'Уплотнение датчика температуры NTC 9,7X15X2 мм для газовых котлов BAXI.

Данное уплотнение используется для датчиков температуры котлов BAXI с артикулами 8434820 и 8435400.', 230.0, 0, NULL, 12, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ea7ac7d4-fccc-5eed-9f28-062994d525e3', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Уплотнение плоское кольцевое 6,1X11,5X1,5 для котлов BAXI (JJJ005402050)', 'JJJ005402050', NULL, 'Уплотнение плоское кольцевое 6,1X11,5X1,5 для котлов BAXI', 263.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2537dc94-c056-5521-a245-efea6dc08f10', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ПРОКЛАДКА ВЕНТИЛЯТОРА (JJJ005412270)', 'JJJ005412270', NULL, 'Прокладка вентилятора 5412270 совместим со следующими моделями:
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB465243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
LUNA-3 1.310 Fi CSE455313660
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
LUNA-3 SILVER SPACE 250 Fi CSB456253671
LUNA-3 SILVER SPACE 250 Fi CSB456253672
LUNA-3 SILVER SPACE 310 Fi CSB456313671
LUNA-3 SILVER SPACE 310 Fi CSB456313672
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654', 970.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('372e2234-0bf7-58a1-96d2-cb5908813b8e', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'КРАН НАПОЛНЕНИЯ СИСТЕМЫ В СБОРЕ (JJJ000611930)', 'JJJ000611930', NULL, 'Кран наполнения системы в сборе 611930 совместим со следующими моделями:
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584', 1822.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9b955265-4ece-5858-8ab1-ad0c4185e51f', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран наполнения системы в сборе для котлов BAXI (JJJ000620890)', 'JJJ000620890', NULL, 'Кран наполнения системы в сборе для настенных газовых котлов BAXI моделей:
Eco Four 24
Eco Four 24 F
Luna Duo-Tec', 2600.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8593365b-dbae-515c-9df2-c993dee3f741', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Электрод розжига (контроля пламени) для котлов BAXI (8422570) JJJ008422570', 'JJJ008422570', NULL, 'Электрод розжига (контроля пламени) для газовых котлов BAXI моделей:
Eco 1.240 Fi
Eco 1.240 i
Eco 20 Fi
Eco 20 i
Eco 240 Fi
Eco 240 i
Eco 280 Fi
Eco 280 i
Eco Compact 1.24
Eco Compact 24
Eco Four 1.14
Eco Four 1.14 F
Eco Four 1.24
Eco Four 1.24 F
Eco Four 24
Eco Four 24 F
Eco Home 10 F
Eco Home 14 F
Eco Home 24 F
Eco-3 1.240 Fi
Eco-3 240 Fi
Eco-3 240 i
Eco-3 280 Fi
Eco-3 Compact 1.140 Fi
Eco-3 Compact 1.140 i
Eco-3 Compact 1.240 Fi
Eco-3 Compact 1.240 i
Eco-3 Compact 240 Fi
Eco-3 Compact 240 i
Eco-4s 1.24 F
Eco-4s 10 F
Eco-4s 18 F
Eco-4s 24
Eco-4s 24 F
Eco-5 Compact 1.24
Eco-5 Compact 24
Fourtech 1.14
Fourtech 1.24
Fourtech 1.24 F
Fourtech 24
Fourtech 24 F
Luna 1.240 Fi
Luna 1.310 Fi
Luna 24 Fi
Luna 240 FI
Luna 280 i
Luna 310 Fi
Luna-3 1.310 Fi
Luna-3 240 Fi
Luna-3 240 i
Luna-3 280 Fi
Luna-3 310 Fi
Luna-3 Comfort 1.240 Fi
Luna-3 Comfort 1.240 i
Luna-3 Comfort 1.310 Fi
Luna-3 Comfort 240 Fi
Luna-3 Comfort 240 i
Comfort 310 Fi
Main 24 Fi
Main 24 i
Main Digit 240 Fi
Main Four 18 F
Main Four 24
Main Four 240 F
Nuvola
Nuvola-3
Nuvola-3 Comfort', 1693.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c617e649-d3e1-5e85-96b8-dd89731a663c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Электрод контроля пламени с кабелем BAXI Slim 008620290 (JJJ008620290)', '008620290 (JJJ008620290)', NULL, 'Электрод контроля пламени с кабелем для напольных газовых котлов BAXI моделей:
SLIM 1.150 i
SLIM 1.230 Fi
SLIM 1.230 FiN
SLIM 1.230 i
SLIM 1.230 iN
SLIM 1.300 Fi
SLIM 1.300 FiN
SLIM 1.300 i
SLIM 1.300 iN
SLIM 1.400 iN
SLIM 1.490 iN
SLIM 1.620 iN
SLIM 2.230 i
SLIM 2.300 Fi
SLIM 2.300 i

1509', 2400.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dfd4585f-d338-5b91-9326-849ec7e292b6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ИЗОЛЯЦИОННЫЙ КОЛПАЧОК ЭЛЕКТРОДА 5407830 (JJJ005407830)', 'JJJ005407830', NULL, 'Изоляционный колпачок электрода 5407830 совместим со следующими моделями:
ECO 1.240 Fi CSE435243680
ECO 240 Fi CSE436243680
ECO 240 Fi CSE436243681
ECO 280 Fi CSE436283680
ECO Compact 1.24 721425401
ECO Compact 1.24 721425402
ECO Compact 24 721425501
ECO Compact 24 721425502
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
LUNA-3 1.310 Fi CSE455313660
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
LUNA-3 SILVER SPACE 250 Fi CSB456253671
LUNA-3 SILVER SPACE 250 Fi CSB456253672
LUNA-3 SILVER SPACE 310 Fi CSB456313671
LUNA-3 SILVER SPACE 310 Fi CSB456313672
MAIN 24 Fi BSB436243651
MAIN 24 Fi BSB436243652
MAIN 24i BSB432243650
MAIN 24i BSB432243651
MAIN DIGIT 240Fi BSE446243650
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654', 380.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('129a9d56-741e-5318-ac3c-d08d6b6d2de5', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ТРУБКА РАСШИРИТЕЛЬНОГО БАКА 5698830 (JJJ005698830)', '(JJJ005698830)', NULL, 'Трубка расширительного бака 5698830 совместим со следующими моделями:
ECO Compact 1.24 721425401
ECO Compact 1.24 721425402
ECO Compact 24 721425501
ECO Compact 24 721425502
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654', 2870.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('08868a61-cf7c-5a00-8b83-575997fab956', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Прессостат предохранительный системы отопления XP602 BAXI 009951690 (JJJ009951690)', 'JJJ009951690', NULL, 'Предохранительный прессостат системы отопления 9951690 совместим со следующими моделями:
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
LUNA-3 1.310 Fi CSE455313660
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.240 i CSE451243580
LUNA-3 COMFORT 1.240 i CSE451243581
LUNA-3 COMFORT 1.240 i CSE451243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
LUNA-3 SILVER SPACE 250 Fi CSB456253671
LUNA-3 SILVER SPACE 250 Fi CSB456253672
LUNA-3 SILVER SPACE 310 Fi CSB456313671
LUNA-3 SILVER SPACE 310 Fi CSB456313672
MAIN 24 Fi BSB436243651
MAIN 24 Fi BSB436243652
MAIN 24i BSB432243650
MAIN 24i BSB432243651
MAIN DIGIT 240Fi BSE446243650
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654', 3512.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('51b7f8dc-5d9c-5dd4-956a-be7f8100c453', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'a731561e-5b48-56f6-b326-98ce886a6949', 'Реле давления воздуха (пневмореле) 170/140 Huba (для Viessmann), 7817494_н/о', '7817494_н/о', NULL, 'Прессостат для газовых котлов Viessmann установлен в моделях с тепловой мощностью 24 и 30 кВт:
Vitopend 100 WH1D 24 кВт
Vitopend 100 WH1D 30 кВт	Vitopend 100 WH1B 24 кВт
Vitopend 100 WH1B 30 кВт	Vitopend 100 WH0 24 кВт
Vitopend 100 WH0A 24 кВт

Дифференциальное реле давления воздуха производства Huba Control c диапазоном включения и блокировки 170/140 Pa установлен в широком сегменте котлов Viessmann Витопенд 100. Компания очень тщательно подбирает комплектующие для разработки выпускаемого отопительного оборудования, которое оснащено передовыми системами защиты.

Маностат 170 Pa представляет собой устройство контроля функции турбины, гарантирует безопасную эксплуатацию котла при достижении давления свыше допустимой нормы 140 Pa.', 2940.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d056c18c-076b-5089-9884-94a69643038b', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'e667eed7-e799-5dfb-97b0-cdfed595f0ed', 'Счетчик газовый Элехант СГБ-1,8 г/ш', '4603728439006', NULL, 'Счетчик «Элехант» — прибор учета струйного типа. Принцип работы основан на возникновении звуковых колебаний при прохождении потока газа через струйный генератор. Далее звуковые колебания улавливаются пьезомикрофоном и интерпретируются в расход газа. 
Диапазон измерения газа, м3/ч 0,03-1,8
Максимальное избыточное давление, кПа 5,0
Присоединительная резьба G1/2,G3/4
Диаметр условного прохода, мм 15
Температура окружающей среды, °C -10...+50
Срок службы, не менее, лет 12
Масса, не более, кг 0,3
Габаритные размеры, мм 110x66x55
Межповерочный интервал, лет 12
Пределы относительной погрешности:  
от Qmin до 0,2 Qmax,% ±2,5
от 0,2 Qmax до Qmax,% ±1,0
 Производитель - Элехант (Россия) 
Гарантийный срок - 6 лет со дня продажи', 2800.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fc982774-c7a4-55b7-8f9b-71b51317c441', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'e667eed7-e799-5dfb-97b0-cdfed595f0ed', 'Счетчик газовый Элехант СГБ-4 г/г', '4603728439020', NULL, 'Счетчик «Элехант» — прибор учета струйного типа. Принцип работы основан на возникновении звуковых колебаний при прохождении потока газа через струйный генератор. Далее звуковые колебания улавливаются пьезомикрофоном и интерпретируются в расход газа. 
Диапазон измерения газа, м3/ч	0,08-4,0
Максимальное избыточное давление, кПа	5,0
Присоединительная резьба	G1/2,G3/4
Диаметр условного прохода, мм	15
Температура окружающей среды, °C	-10...+50
Срок службы, не менее, лет	12
Масса, не более, кг 0,3
Габаритные размеры, мм	110x66x55
Межповерочный интервал, лет 12
Пределы относительной погрешности:	 
от Qmin до 0,2 Qmax,%	±2,5
от 0,2 Qmax до Qmax,%	±1,0
Производитель - Элехант (Россия) 
Гарантийный срок - 6 лет со дня продажи', 3450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d92cdf05-bb8e-57a1-971c-1617b55cdb9a', 'dde8de94-afde-5e5f-b7c2-005966c45494', '47a52980-ff8d-54d3-ac99-56b5df280568', 'Манометр для котлов NevaLux (40055627)', '40055627', NULL, 'Манометр (40055627) предназначен для измерения давления в газовых котлах. Монтируется в технологические отверстия диаметром тридцать семь миллиметров. Фиксация в посадочном месте осуществляется двумя отлитыми в корпусе "ушками" (они хорошо видны на фото). Капиллярная трубка для передачи импульсов выполнена из меди с ПВХ покрытием и имеет спиральную навивку, облегчающую установку прибора. Её крепление обеспечивается упорной гайкой под ключ "на четырнадцать". Плоская уплотнительная прокладка, которая может быть изготовлена из резины либо паронита в комплект поставки не входит.

Характеристики:
диаметр - Ø 37 мм;
диапазон – 0…4 бар;
длина капилляра – 1500 мм;
крепление – 1/4G.

Устанавливается на следующие модели:
NevaLux 7211
NevaLux 7218
NevaLux 7224', 3385.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('56101c19-5746-526d-af8d-6728dbdf5bba', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Аквасенсор (датчик протока) для котлов Protherm Пантера 25-35 кВт H-RU (0020197555.MG) 0020197555', '0020197555.MG', NULL, 'Аквасенсор (датчик протока) для настенных газовых котлов Protherm (с апреля 2015 года выпуска) моделей:
Пантера 25 KOV (H-RU)
Пантера 30 KOV (H-RU)
Пантера 25 KTV (H-RU)
Пантера 30 KTV (H-RU)
Пантера 35 KTV (H-RU)', 5456.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d935c46c-421a-5acb-a833-d01721a003f4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Гидравлический направляющий штока (гайка) Baxi & Westen (KG0023484)', 'KG0023484', NULL, 'Baxi & Westen Pin Guide Assembly - 5630250
Baxi Luna/Baxi Eco/Westen Star/Westen Energy', 390.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('31e8dad7-4910-5fe1-9f33-d68e90e941d9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Втулка трехходового клапана для котлов Protherm (KG0030133) 0020034169', 'KG0030133', '0020034169', 'Альфа, Аристон, Бакси, Бэй, Биази, Будерус, Идеал, Поттертон, Протерм, Вестен, Зум

Устанавливается на следующие котлы:

Protherm Тигр 24 KTV v12
Protherm Тигр 28 KTV v12
Protherm Тигр 24 KOV v12
Protherm Тигр 28 KOV v12', 950.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3d1fd5ca-1d89-5114-adae-23cbeb794088', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Электрод зажигания свечи зажигания BAXI LUNA 3 24 31 BAYMAK (9191012881)', '9191012881', NULL, NULL, 655.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('377dd7b8-b5aa-5fca-a3b2-d9870e205b43', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Картридж трехходового клапана для котлов BAXI (7728745)', '7728745', NULL, 'Картридж трехходового клапана для настенных газовых котлов BAXI моделей: 
Eco-4s 10 F 
Eco-4s 18 F 
Eco-4s 24 
Eco-4s 24 F 
Eco Home 10 F 
Eco Home 14 F 
Eco Home 24 F', 2993.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e6f2b4e5-5e04-5d1a-8394-8037363e1506', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Манометр системы отопления d.40 (для Ecofour/EcoClassic) 9951650.MG/99516511P CEWAL Италия', '9951650.MG', NULL, 'Манометр 9951650 совместим со следующими моделями:
ECO 240 Fi CSE436243680
ECO Four 1.14 CSE461143540
ECO Four 1.14 F CSE465143540
ECO Four 1.14 F CSE465143541
ECO Four 1.24 CSE461243540
ECO Four 1.24 F CSE465243540
ECO Four 1.24 F CSE465243541
ECO Four 24 CSE462243540
ECO Four 24 CSE462243541
ECO Four 24 F CSE466243540
ECO Four 24 F CSE466243541
ECO Four 24 F CSE466243542
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
LUNA-3 1.310 Fi CSE455313660
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.240 i CSE451243580
LUNA-3 COMFORT 1.240 i CSE451243581
LUNA-3 COMFORT 1.240 i CSE451243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
MAIN 24 Fi BSB436243651
MAIN 24 Fi BSB436243652
MAIN 24i BSB432243650
MAIN 24i BSB432243651
MAIN DIGIT 240Fi BSE446243650', 2900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('65b22c9f-1181-529c-bde4-737eb137e7ef', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Манометр системы отопления d.40 (для MAIN Four, Fourtech) 8922460.MG CEWAL Италия', '8922460.MG', NULL, 'Манометр 8922460 совместим со следующими моделями:
FOURTECH 1.14 CSB461143680
FOURTECH 1.14 CSB465143680
FOURTECH 1.24 CSB461243680
FOURTECH 1.24 CSB465243680
FOURTECH 24 CSB462243680
FOURTECH 24 CSB462243681
FOURTECH 24 CSR462243680
FOURTECH 24 F CSB466243680
FOURTECH 24 F CSB466243681
FOURTECH 24 F CSR466243680
MAIN Four 18 F BSR466183411
MAIN Four 18 F BSR466183412
MAIN Four 18 F BSR466183413
MAIN Four 24 BSB462243650
MAIN Four 24 BSB462243651
MAIN Four 24 BSB462243652
MAIN Four 240 F BSE466243650
MAIN Four 240 F BSE466243651
MAIN Four 240 F BSE466243652
MAIN Four 240 F BSE466243653
MAIN Four 240 F BSE466243654', 2800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('693e7f46-b4cb-5196-9244-b01b40826a88', 'dde8de94-afde-5e5f-b7c2-005966c45494', '86c23708-e295-5254-9686-ad46699849c2', 'Газовые клапана SIGMA (EBR2008N010201)', 'EBR2008N010201', NULL, NULL, 12300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f9f924af-6266-52fb-9bf1-6fef484d78d5', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Газовые клапана SIGMA (EBR2008N)', 'EBR2008N', NULL, NULL, 12300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('297d4657-85d3-5635-a33e-8867a8d9eebf', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Расширительный бак (круглый) 8л 3/8 резьба Bosch WBN 6000 Ariston (87186425520) 87186425520.MG', '87186425520.MG', '65104261, 8705407005', 'старая 7245
Расширительный бак - это компенсатор объема теплоносителя системы отопления. Максимально допустимое давление воды в баке при обычном присоединении его к обратной магистрали системы перед всасывающим патрубком циркуляционного насоса принимается в зависимости от предельного рабочего давления для элементов системы отопления в низшей ее точке (обычно для такого теплообменника, как чугунный котел, или для его арматуры), уменьшенного на величину давления насоса и гидростатического давления от уровня воды в баке до низшей точки системы.

Предназначен для компенсации линейных расширений воды в котле Buderus, Bosch

Используется на моделях:
- Bosch GAZ 6000W WBN6000 - 12C RN S5700
- Bosch GAZ 6000W WBN6000 - 18H RN S5700
- Bosch GAZ 6000W WBN6000 - 18C RN S5700
- Bosch GAZ 6000W WBN6000 - 24C RN S5700
- Bosch GAZ 6000W WBN6000 - 24H RN S5700
- Buderus Lagamax U072 - 18
- Buderus Lagamax U072 - 18K
- Buderus Lagamax U072 - 24
- Buderus Lagamax U072 - 24K

Ariston BSII
Ariston Matis
Ariston Clas
Ariston Clas X
Ariston HS X
Ariston Cares X
Ariston Egis (до 2008)
Bosch GAZ 3000 ZW24

Параметры бака:
Высота  - 81 мм
Диаметр - 392 мм', 6650.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('07668e9d-6587-5f3b-bcfc-2bca6ec310ff', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Бак расширительный BAXI (5693900) JJJ005693900', 'JJJ005693900', NULL, 'Расширительный бак Baxi Eco Four, Eco-4s, Eco-5, Fourtech, Main Four (5693900) 

Расширительный бак  настенного котла Baxi 
- MAIN FOUR 
- ECO four 
- ECO compact 
- ECO tech', 7656.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('24188df9-32fe-5f13-ade6-f5f3b452b2e7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Расширительный бак 8 литров для котлов BAXI Eco-3 Compact, Main, Main Digit (5663880.MG) Zilo Италия', '5663880.MG', NULL, NULL, 5640.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0bfc6ce3-9d0b-5a6b-8659-a2002830c268', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Расширительный бак 8л резьба быстросъемный (для Baxi) (710418200.MG) CIMM Италия', '710418200.MG', NULL, 'Расширительный бак 8 литров для котлов BAXI Eco Compact, Eco-5 Compact (710418200.MG) 

Расширительный бак  настенного котла Baxi:
Eco Compact 1.14 F
Eco Compact 1.24 F
Eco Compact 14 F
Eco Compact 18 F
Eco Compact 24 F
Eco-5 Compact 14 F
Eco-5 Compact 18 F
Eco-5 Compact 24 F', 7945.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9e19adae-5a39-5a4e-b813-0a5fd848b02e', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Кран подпитки котла VAILLANT (014674)', '014674', NULL, 'кран подпитки котла VAILLANT MAX PRO/PLUS  

данная запчасть подходит для следующих моделей котлов: 
AtmoMAX PRO 240 VUW
TurboMAX PRO 242 VUW
AtmoMAX PLUS VU/VUW
TurboMAX PLUS VU/VUW
Atmo Max Pro VU/VUW 240-280/2-3
Turbo Max Pro VU/VUW 242-282/2-3
Atmo Max Plus VU/VUW 120-280/2-5
Turbo Max Plus VU/VUW 242-362/2-5', 1860.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3d00f6d1-59cd-5044-9a66-5da1e8d2ec17', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Подпиточный вентиль (для TEC PRO/PLUS) (0020018065_н/о)', '0020018065_н/о', NULL, 'turbo TEC pro
turbo TEC plus
eco TEC plus', 1370.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('41182559-f6b3-583a-bbb9-bfe9fb202e61', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Подпиточный вентиль пластиковый (для TEC PRO/PLUS) (0020265137_н/о)', '0020265137_н/о', NULL, 'turbo TEC pro
turbo TEC plus
eco TEC plus', 2752.0, 0, NULL, 30, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4bebacbf-eadb-5083-bd76-b03ee12daf3b', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Ручка крана подпитки для котлов Vaillant atmo/turboTEC (0020010292.MG)', '0020010292.MG', 'KG0013793', 'Ручка крана подпитки для настенных газовых котлов Vaillant моделей:
Vaillant atmoTEC pro VUW INT 200, 240, 280/3-3
Vaillant atmoTEC pro VUW INT 240/5-3
Vaillant turboTEC pro VUW INT 202, 242, 282/3-3<
Vaillant turboTEC pro VUW INT 242/5-3
Vaillant atmoTEC plus VUW INT 200, 240, 280/3-5
Vaillant atmoTEC plus VUW INT 200, 240, 280/5-5
Vaillant turboTEC plus VUW INT 202, 242, 282, 322, 362/3-5
Vaillant turboTEC plus VUW INT 202, 242, 282, 322, 362/5-5', 500.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('86c69a7d-aeb7-5b30-8052-3c8c075b8591', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Манометр Navien (30002308C)', '30002308C', '10273797898950018, 30013530A', 'Манометр 0-4 бар Navien

Используется в следующих моделях: Navien Ace, Deluxe, Deluxe Coaxial, Deluxe Plus, Deluxe Plus Coaxial.', 1994.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9f08a7d7-1c80-50ea-8f47-2996a2794654', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Электроды розжига и ионизации в сборе для котлов Navien Ace, Ace Coaxial, Ace Atmo (30003875C)', '30003875C', NULL, 'Электроды розжига и ионизации в сборе для настенных газовых двухконтурных котлов Navien моделей:
Navien Ace 13-40K
Navien Ace Coaxial 13-30K
Navien Atmo 13-24A(N)', 1490.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e46cd5e1-c0e0-55b6-9938-0f66b97b482f', '29a952ee-445d-5680-83e4-a15983d8ab13', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Разделительный трансформатор для котельного оборудования BAXI Balance 250 (RT25001)', 'RT25001', NULL, 'Устраняет искажения и наводки в питающей сети;
Создает эффект защитного зануления (заземления);
Высокоэффективный тороидальный трансформатор с КПД 93,5%;
Металлический корпус позволяет эффективно отводить тепло;
Адаптация котла для работы с бензиновым, дизельным или газовым генератором.', 12530.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('22708dd4-44c4-5330-a71e-9d280fae7391', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0c20ec29-d01d-5c86-8c5f-908d2488e788', 'Счетчик газа NPM G-2,5 Газдевайс (левый) 2021г.', 'MG1042544133', '4607014002745', NULL, 2490.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0981c869-7a62-58e2-b999-d83baea43714', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', '0c20ec29-d01d-5c86-8c5f-908d2488e788', 'Счетчик газа NPM G-2,5 Газдевайс (левый) 2022г.', 'MG1132760386', '4607014002745', NULL, 2590.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('96f72dc3-1936-5db8-a495-5ee10366ee7a', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'СГК G4 Сигнал Правый-18 2022г.', 'MG1638300455', '1415281504225237100', NULL, 2300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('00dee0a3-3bd8-5ddc-9cb1-6158627a6688', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Адаптер моноблочный с фланцевым соединением FAVORIT', 'MG1064174358', NULL, NULL, 2190.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a72242e0-be4a-5ec2-868c-4477722a1d42', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Счетчик газа СГМН-1-G6 (200 мм) левый Минск (на замену ВК-G6) 2023г.', 'MG934775014', NULL, 'Диафрагменный счетчик, белорусского производства, G6 СГМН-1 Беломо левостороннего типа. То есть, в аппарате движение газового вещества происходит с левой стороны направо. Газовый расходомер СГМН G6 мембранного типа применяется для ведения учета общего объема потребляемого природного газ. топлива, либо испарений сжиженного газового вещества. Счетчик G6 можно устанавливать как в частных владениях, так и в строениях общественного типа. То есть, в тех местах, где возможно использование различной газовой техники. В частности, котлов, колонок, плит и т.д. От вертикального патрубка входа газа до идентичного выходного патрубка расстояние равняется 20 см (200 мм). ДУ присоединения на патрубках составляет 3.2 см (32 мм), а резьбы накидной гайки G1 1/4, которые применяются для присоединения и соответствует ГОСТ6357-81.


Счетчик газа БелОМО СГМН-1 G6 (200мм, левый) с Госповеркой на 10 лет!!!
Вход газа слева-направо
Минимальный расход газа: 0,06 м3/ч
Номинальный расход газа: 6 м3/ч
Максимальный расход газа: 10 м3/ч
Рабочее давление max: 60 кПа
Минимальная рабочая температура: -40 °C
Максимальная рабочая температура: 50 °C
Габаритные размеры: 263x165x235 мм
Габариты в упаковке: 273х173х250 мм
Резьбы на патрубках: G1 1/4
Межцентровое расстояние: 200 мм
Межповерочный интервал: 10 лет
Срок службы: 20 лет
Вес: 3,3 кг
Страна производитель: ОАО «ММЗ им. Вавилова», Беларусь
Гарантия: 24 месяца', 6900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8765e683-a855-5cf0-8531-a2d33edbdf41', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Шкаф для газового счетчика ШС-1,2 пластиковый с дверцей', 'MG2040052830', NULL, 'Корпус ШС - 1.2 пластиковый с дверцей

Характеристики:
Межосевое расстояние: 110 мм
Размер: 300Х250Х200 мм
Размер двери: 190х230 мм
Материал: ударопрочный полистирол
Конструкция: сборная
Корпус предназначен под газовый счетчик с верхним подключением и межосевым расстоянием 110мм', 1440.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('11ad8760-d558-5564-b62c-ec859c453660', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Комплект для раздельного дымоотведения BAXI (KHG714061512)', 'KHG714061512', 'KHG714061512', NULL, 2200.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('239def7d-baab-5d20-968b-ef7c55fafecc', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Газовый клапан Sit 820 mV NOVA (0820303) Protherm Медведь TLO 0020027516', '0820303', '303659831126', 'Газовый клапан SIT 820 NOVA (0820303) для котлов Лемакс, Боринское, Конорд, Мимакс, Сингал, Ростовгазоаппарат, Thermona, Protherm, BAXI, Koreastar, Ferroli, Mora, Siberia и других (0.820.303) 0820303', 11990.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('903bae09-924c-5f5d-af18-2c9bea4dcf01', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'ТОЧНЫЙ ТЕРМОСТАТ (00011466/OB)', '00011466/OB', NULL, NULL, 2000.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6c5f1a10-b283-5e7e-bf48-73840f727cc1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'b163c8fb-d0b2-56fd-a1d8-a706bffe6b7e', 'Газовый клапан 630 EUROSIT (0630802) 0630810', '0630802', NULL, NULL, 8650.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9b62e079-1f89-5763-8208-4b6de8516004', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Клапан трехходовой с электроприводом Ariston (60001583-01) 61302483', '60001583-01', NULL, 'СТАРАЯ 6950
Клапан трехходовой в комплекте с электроприводом (привод+шток) (BS, BS II, Egis+, Clas, Genus) арт. 60001583-01

3-Х ходовой клапан + мотор (kit)

СОВМЕСТИМЫЕ МОДЕЛИ
	КОД	МОДЕЛЬ

	3300107	GENUS 24 FF
	3300110	GENUS 24 CF
	3300113	GENUS 28 FF
	3300116	GENUS 28 CF
	3300118	GENUS 35 FF
	3665036	GENUS PREMIUM 24
	3665037	GENUS PREMIUM 30
	3665038	GENUS PREMIUM 35
	3300187	CLAS 24 FF
	3300188	CLAS 28 FF
	3300189	CLAS 24 CF
	3300285	BS 24 FF
	3300286	BS 24 CF
	3665102	CLAS B 30 FF
	3665104	CLAS B 24 FF
	3665105	CLAS B 24 CF
	3300324	GENUS PREMIUM 24
	3300325	GENUS PREMIUM 30
	3300326	GENUS PREMIUM 35
	3300330	CLAS PREMIUM 24
	3300332	CLAS PREMIUM 30
	3300295	BS II 24 FF
	3300296	BS II 24 CF
	3300297	GENUS 24 FF
	3300298	GENUS 24 CF
	3300299	GENUS 28 FF
	3300300	GENUS 28 CF
	3300307	CLAS 24 FF
	3300308	CLAS 24 CF
	3300309	CLAS 28 FF
	3300315	CLAS SYSTEM 24 FF
	3300316	CLAS SYSTEM 24 CF
	3300317	CLAS SYSTEM 28 FF
	3300318	CLAS SYSTEM 28 CF
	3300319	CLAS SYSTEM 32 FF
	3300334	GENUS 36 FF
	3300411	EGIS PLUS 24 CF
	3300413	EGIS PLUS 24 FF
	3300438	BS II 24 CF
	3300439	BS II 24 FF
	3300442	MATIS 24 FF
	3300443	MATIS 24 CF
	3300419	BS II 15 FF
	3300441	BS II 15 FF
	3300472	GENUS EVO 24 FF
	3300473	GENUS EVO 24 CF
	3300474	GENUS EVO 30 FF
	3300475	GENUS EVO 30 CF
	3300477	GENUS EVO 35 FF
	3300480	CLAS EVO 24 FF
	3300481	CLAS EVO 24 CF
	3300483	CLAS EVO 28 FF
	3300487	CLAS EVO SYSTEM 28 FF
	3300488	CLAS EVO SYSTEM 28 CF
	3300446	GENUS PREMIUM EVO 24
	3300447	GENUS PREMIUM EVO 30
	3300448	GENUS PREMIUM EVO 35
	3300451	GENUS PREMIUM EVO SYSTEM 24
	3300452	GENUS PREMIUM EVO SYSTEM 30
	3300453	GENUS PREMIUM EVO SYSTEM 35
	3300457	CLAS PREMIUM EVO 24
	3300458	CLAS PREMIUM EVO 30
	3300463	CLAS PREMIUM EVO SYSTEM 24
	3300546	CLAS PREMIUM EVO SYSTEM 35
	3300704	GENUS PREMIUM EVO 24 EU
	3300705	GENUS PREMIUM EVO 30 EU
	3300706	GENUS PREMIUM EVO 35 EU
	3300709	GENUS PREMIUM EVO SYSTEM 24 EU
	3300710	GENUS PREMIUM EVO SYSTEM 30 EU
	3300711	GENUS PREMIUM EVO SYSTEM 35 EU
	3300611	CLAS B EVO 30 FF
	3300612	CLAS B EVO 24 FF
	3300697	CLAS PREMIUM EVO 24 EU
	3300698	CLAS PREMIUM EVO 30 EU
	3300702	CLAS PREMIUM EVO SYSTEM 24 EU
	3300703	CLAS PREMIUM EVO SYSTEM 35 EU', 6500.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('47480835-a9be-5d0d-8cfa-959e9cae64fe', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Трубка подачи теплоносителя Ariston BS II, Egis Plus, Matis (60001302)', '60001302', NULL, 'Трубка подачи теплоносителя медная для алюминиевого теплообменника настенных газовых котлов Ariston моделей:
BS II 15 FF
BS II 24 FF
Egis Plus 24 FF
Matis 24 FF', 2323.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ae721fd7-8bef-523b-8d60-dbbe4e2b1de1', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Трехходовой клапан котла Ariston и Chaffoteaux (65114924)', '65114924', NULL, 'Ariston:

ALTEA ONE 24
ALTEA ONE 30
ALTEA ONE 35
ALTEAS X 24 CF
ALTEAS X 24 FF
ALTEAS X 28 CF
ALTEAS X 30 CF
ALTEAS X 30 FF
ALTEAS X 32 FF
ALTEAS X 35 FF
CLAS X 24 CF
CLAS X 24 FF
CLAS X 28 FF
CARES X 15 CF
CARES X 15 FF
CARES X 18 FF
CARES X 24 CF
CARES X 24 FF
CARES X SYSTEM 24 CF
CARES X SYSTEM 24 FF
CLAS X SYSTEM 24 CF
CLAS X SYSTEM 24 FF
CLAS X SYSTEM 28 CF
CLAS X SYSTEM 28 FF
CLAS X SYSTEM 32 FF
HS X 15 CF
HS X 15 FF
HS X 18 FF
HS X 24 CF
HS X 15 FF
GENUS ONE SYSTEM 12
GENUS ONE SYSTEM 18
GENUS ONE SYSTEM 24
GENUS ONE SYSTEM 30
GENUS ONE SYSTEM 35
GENUS X 24 CF
GENUS X 24 FF
GENUS X 28 CF
GENUS X 30 CF
GENUS X 30 FF
GENUS X 32 FF
GENUS X 35 FF
CLAS ONE 24
CLAS ONE 30
CLAS ONE 35
CLAS ONE SYSTEM 18
CLAS ONE SYSTEM 24
CLAS ONE SYSTEM 30
CLAS ONE SYSTEM 35

Chaffoteaux:

ALIXIA ULTRA 15 FF
ALIXIA ULTRA 18 FF
ALIXIA ULTRA 20 CF
ALIXIA ULTRA 20 FF
ALIXIA ULTRA 24 CF
ALIXIA ULTRA 24 FF
INOA ULTRA 24 FF
ALIXIA SIMPLE 18 CF
ALIXIA SIMPLE 18 FF
ALIXIA SIMPLE 24 CF
ALIXIA SIMPLE 24 FF
PIGMA ULTRA SYSTEM 25 CF
PIGMA ULTRA SYSTEM 25 FF
PIGMA ULTRA SYSTEM 30 FF
PIGMA ULTRA SYSTEM 35 FF
PIGMA ULTRA 25 CF
PIGMA ULTRA 25 FF
PIGMA ULTRA 30 CF
PIGMA ULTRA 30 FF
PIGMA ULTRA 35 FF', 9430.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('34b82632-5fb7-5070-b198-ccc2fb579c63', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'ДАТЧИК ПРОТОКА (65158269)', '65158269', NULL, 'Устанавливается на следующие котлы: 

MARCO POLO GI7S 11L FFI NG
MARCO POLO M2 10L FF NG
NEXT EVO SFT 11 NG EXP
ARISTON Gi7S 11L FFI
ARISTON M2 10L FF', 1100.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('03473f4b-a0c4-53c1-aa42-ac907e299660', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Датчик давления Ariston (аристон), Kentatsu (кентатсу) EGIS (65105090.MG) 7021630030 32700018', '65105090.MG', 'KG0032551', 'Реле минимального давления Ariston 65105090 совместим со следующими моделями:
CLAS B 24 CF 3665105
CLAS B 24 FF 3665104
CLAS B 30 FF 3665102
CLAS B EVO 24 FF 3300612
CLAS B EVO 30 FF 3300611
CLAS EVO 28 FF 3300483
CLAS EVO SYSTEM 15 FF RU 3300495
CLAS EVO SYSTEM 24 FF RU 3300497
CLAS EVO SYSTEM 28 FF 3300487
CLAS EVO SYSTEM 32 FF RU 3300499
CLAS PREMIUM 24 3300330
CLAS PREMIUM 30 3300332
CLAS PREMIUM EVO SYSTEM 24 3300463
CLAS PREMIUM EVO SYSTEM 24 EU 3300702
CLAS PREMIUM EVO SYSTEM 35 3300546
CLAS PREMIUM EVO SYSTEM 35 EU 3300703
CLAS SYSTEM 15 CF 3300226
CLAS SYSTEM 15 FF 3300225
CLAS SYSTEM 24 CF 3300208
CLAS SYSTEM 24 FF 3300207
Clas 24 CF 3300189
Clas 24 FF 3300187
EGIS 24 CF 3300194
EGIS 24 FF 3300193
MATIS 24 FF 3300442', 2190.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5eb5263c-64bf-5a6a-bb35-9e7fcd1f3435', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Датчик температуры NTC для Ariston (65105079)', '65105079', '5411692622244', 'Датчик температуры NTC (65105079 o) предназначен для измерения и контроля температуры теплоносителя в контурах оборудования.
При резком повышается температуры, вследствие чего датчик срабатывает и размыкает электрическую цепь, закрывая газовый клапан и прекращая подачу газа к горелке котла и его отключению. Датчик устанавливается заводом-изготовителем на определенную температуру срабатывания.
Данная зависимость показывает, что при увеличении температуры теплоносителя, сопротивление датчика уменьшается. Датчик накладной контура отопления имеет диаметр крепежной скобы 14мм, с помощью скобы-фиксатора крепиться на трубку подачи отопления.
Датчик накладной изготовлен с использованием металлоксидного состава, что покрывается эпоксидной смолой. Корпус температурного датчика из термопласта полиамидного, зажим-фиксатор датчика из оцинкованной стали, клеммы из латуни. Также, хотелось бы заметить, что погружные датчики температуры можно заменить накладными – их функциональные характеристики совпадают.
Накладные датчики имеют свои преимущества – при замене датчика не нужно сливать воду с системы отопления котельного оборудования, что значительно упрощает процесс замены датчика и соответственно его монтажа. 

Устанавливается на следующие модели:

Ariston EGIS 24 CF/ FF
Ariston Genus Premium 24/ 35
Ariston Clas Premium 24/ 30', 1500.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1654049e-d839-5501-b9c1-ae9fc632e780', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'О-КОЛЬЦО 17.96Х2.62 ARISTON (65104337)', '65104337', '5411692817466', 'О-кольцо 17.96х2.62 Ariston 65104337 совместим со следующими моделями:
ALTEAS ONE NET 24 (3301058)
ALTEAS ONE NET 24 3301058
ALTEAS ONE NET 30 3301059
ALTEAS ONE NET 35 3301060
ALTEAS X 24 CF NG 3300844
ALTEAS X 24 FF NG 3300845
ALTEAS X 30 CF NG 3300846
ALTEAS X 30 FF NG 3300847
ALTEAS X 35 FF NG 3300849
BS 24 CF 3300286
BS 24 FF 3300286
BS II 15 FF 3300419
BS II 15 FF EU 3300441
BS II 24 CF 3300296
BS II 24 CF EU 3300438
BS II 24 FF 3300295
BS II 24 FF EU 3300439
CARES X 15 CF NG 3300889
CARES X 15 FF NG 3300887
CARES X 18 FF NG 3300886
CARES X 24 CF NG 3300888
CARES X 24 FF NG 3300885
CLAS B 24 CF 3665105
CLAS B 24 FF 3665104
CLAS B 30 FF 3665102
CLAS B EVO 24 FF 3300612
CLAS B EVO 30 FF 3300611
CLAS EVO 24 CF 3300481
CLAS EVO 24 FF 3300480
CLAS EVO 28 FF 3300483
CLAS EVO SYSTEM 15 CF RU 3300496
CLAS EVO SYSTEM 15 FF RU 3300495
CLAS EVO SYSTEM 24 CF RU 3300498
CLAS EVO SYSTEM 24 FF RU 3300497
CLAS EVO SYSTEM 28 CF 3300488
CLAS EVO SYSTEM 28 FF 3300487
CLAS EVO SYSTEM 32 FF RU 3300499
CLAS ONE 24 RDC 3301017
CLAS ONE 30 RDC 3301036
CLAS ONE SYSTEM 24 RDC 3301039
CLAS ONE SYSTEM 35 RDC 3301041
CLAS PREMIUM 24 3300330
CLAS PREMIUM 30 3300332
CLAS PREMIUM EVO SYSTEM 24 3300463
CLAS PREMIUM EVO SYSTEM 24 EU 3300702
CLAS PREMIUM EVO SYSTEM 35 3300546
CLAS PREMIUM EVO SYSTEM 35 EU 3300703
CLAS SYSTEM 15 CF 3300226
CLAS SYSTEM 15 FF 3300225
CLAS SYSTEM 24 CF 3300208
CLAS SYSTEM 24 FF 3300207
CLAS X 24 CF NG 3300866
CLAS X 24 FF NG 3300864
CLAS X 28 FF NG 3300865
CLAS X SYSTEM 15 CF NG RU 3300875
CLAS X SYSTEM 15 FF NG RU 3300872
CLAS X SYSTEM 24 CF NG 3300867
CLAS X SYSTEM 24 CF NG RU 3300876
CLAS X SYSTEM 24 FF NG 3300869
CLAS X SYSTEM 24 FF NG RU 3300873
CLAS X SYSTEM 28 CF NG 3300868
CLAS X SYSTEM 28 FF NG 3300870
CLAS X SYSTEM 32 FF NG 3300871
CLAS X SYSTEM 32 FF NG RU 3300874
Clas 24 CF 3300189
Clas 24 FF 3300187
EGIS 24 CF 3300194
EGIS 24 FF 3300193
EGIS PLUS 24 CF 3300411
EGIS PLUS 24 FF 3300413
GENUS 24 CF 3300110
GENUS 24 FF 3300107
GENUS 28 CF 3300116
GENUS 28 FF 3300113
GENUS 35 FF 3300118
GENUS EVO 24 CF 3300473
GENUS EVO 24 FF 3300472
GENUS EVO 30 FF 3300474
GENUS EVO 30 СF 3300475
GENUS EVO 35 FF 3300477
GENUS ONE 24 3301018
GENUS ONE 30 3301019
GENUS ONE 35 3301020
GENUS ONE SYSTEM 24 3301027
GENUS ONE SYSTEM 30 3301028
GENUS ONE SYSTEM 35 3301029
GENUS PREMIUM 24 3300324
GENUS PREMIUM 30 3300325
GENUS PREMIUM 35 3300326
GENUS PREMIUM EVO 24 3300446
GENUS PREMIUM EVO 24 EU 3300704
GENUS PREMIUM EVO 30 3300447
GENUS PREMIUM EVO 30 EU 3300705
GENUS PREMIUM EVO 35 3300448
GENUS PREMIUM EVO 35 EU 3300706
GENUS PREMIUM EVO SYSTEM 24 3300451
GENUS PREMIUM EVO SYSTEM 24 EU 3300709
GENUS PREMIUM EVO SYSTEM 30 3300452
GENUS PREMIUM EVO SYSTEM 30 EU 3300710
GENUS PREMIUM EVO SYSTEM 35 3300453
GENUS PREMIUM EVO SYSTEM 35 EU 3300711
GENUS X 24 CF NG 3300850
GENUS X 24 FF NG 3300851
GENUS X 30 CF NG 3300852
GENUS X 30 FF NG 3300853
GENUS X 35 FF NG 3300855
HS X 15 CF NG 3300897
HS X 15 FF NG 3300895
HS X 15 FF RU 3300946
HS X 18 FF NG 3300894
HS X 24 CF NG 3300896
HS X 24 FF NG 3300893
MATIS 24 CF 3300443
MATIS 24 FF 3300442', 460.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a1fc2bf1-088b-5770-95bb-a6af3c68c3a8', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'О-КОЛЬЦО 17.04Х3.53 ARISTON (65104262)', '65104262', '5411692805302', 'О-кольцо 17.04х3.53 Ariston 65104262 совместим со следующими моделями:
ALTEAS ONE NET 24 (3301058)
ALTEAS ONE NET 24 3301058
ALTEAS ONE NET 30 3301059
ALTEAS ONE NET 35 3301060
ALTEAS X 24 CF NG 3300844
ALTEAS X 24 FF NG 3300845
ALTEAS X 30 CF NG 3300846
ALTEAS X 30 FF NG 3300847
ALTEAS X 35 FF NG 3300849
BS 24 CF 3300286
BS 24 FF 3300286
BS II 15 FF 3300419
BS II 15 FF EU 3300441
BS II 24 CF 3300296
BS II 24 CF EU 3300438
BS II 24 FF 3300295
BS II 24 FF EU 3300439
CARES X 15 CF NG 3300889
CARES X 15 FF NG 3300887
CARES X 18 FF NG 3300886
CARES X 24 CF NG 3300888
CARES X 24 FF NG 3300885
CLAS B 24 CF 3665105
CLAS B 24 FF 3665104
CLAS B 30 FF 3665102
CLAS B EVO 24 FF 3300612
CLAS B EVO 30 FF 3300611
CLAS EVO 24 CF 3300481
CLAS EVO 24 FF 3300480
CLAS EVO 28 FF 3300483
CLAS EVO SYSTEM 15 CF RU 3300496
CLAS EVO SYSTEM 15 FF RU 3300495
CLAS EVO SYSTEM 24 CF RU 3300498
CLAS EVO SYSTEM 24 FF RU 3300497
CLAS EVO SYSTEM 28 CF 3300488
CLAS EVO SYSTEM 28 FF 3300487
CLAS EVO SYSTEM 32 FF RU 3300499
CLAS ONE 24 RDC 3301017
CLAS ONE 30 RDC 3301036
CLAS ONE SYSTEM 24 RDC 3301039
CLAS ONE SYSTEM 35 RDC 3301041
CLAS PREMIUM 24 3300330
CLAS PREMIUM 30 3300332
CLAS PREMIUM EVO SYSTEM 24 3300463
CLAS PREMIUM EVO SYSTEM 24 EU 3300702
CLAS PREMIUM EVO SYSTEM 35 3300546
CLAS PREMIUM EVO SYSTEM 35 EU 3300703
CLAS SYSTEM 15 CF 3300226
CLAS SYSTEM 15 FF 3300225
CLAS SYSTEM 24 CF 3300208
CLAS SYSTEM 24 FF 3300207
CLAS X 24 CF NG 3300866
CLAS X 24 FF NG 3300864
CLAS X 28 FF NG 3300865
CLAS X SYSTEM 15 CF NG RU 3300875
CLAS X SYSTEM 15 FF NG RU 3300872
CLAS X SYSTEM 24 CF NG 3300867
CLAS X SYSTEM 24 CF NG RU 3300876
CLAS X SYSTEM 24 FF NG 3300869
CLAS X SYSTEM 24 FF NG RU 3300873
CLAS X SYSTEM 28 CF NG 3300868
CLAS X SYSTEM 28 FF NG 3300870
CLAS X SYSTEM 32 FF NG 3300871
CLAS X SYSTEM 32 FF NG RU 3300874
Clas 24 CF 3300189
Clas 24 FF 3300187
EGIS 24 CF 3300194
EGIS 24 FF 3300193
EGIS PLUS 24 CF 3300411
EGIS PLUS 24 FF 3300413
GENUS 24 CF 3300110
GENUS 24 FF 3300107
GENUS 28 CF 3300116
GENUS 28 FF 3300113
GENUS 35 FF 3300118
GENUS EVO 24 CF 3300473
GENUS EVO 24 FF 3300472
GENUS EVO 30 FF 3300474
GENUS EVO 30 СF 3300475
GENUS EVO 35 FF 3300477
GENUS ONE 24 3301018
GENUS ONE 30 3301019
GENUS ONE 35 3301020
GENUS ONE SYSTEM 24 3301027
GENUS ONE SYSTEM 30 3301028
GENUS ONE SYSTEM 35 3301029
GENUS PREMIUM 24 3300324
GENUS PREMIUM 30 3300325
GENUS PREMIUM 35 3300326
GENUS PREMIUM EVO 24 3300446
GENUS PREMIUM EVO 24 EU 3300704
GENUS PREMIUM EVO 30 3300447
GENUS PREMIUM EVO 30 EU 3300705
GENUS PREMIUM EVO 35 3300448
GENUS PREMIUM EVO 35 EU 3300706
GENUS PREMIUM EVO SYSTEM 24 3300451
GENUS PREMIUM EVO SYSTEM 24 EU 3300709
GENUS PREMIUM EVO SYSTEM 30 3300452
GENUS PREMIUM EVO SYSTEM 30 EU 3300710
GENUS PREMIUM EVO SYSTEM 35 3300453
GENUS PREMIUM EVO SYSTEM 35 EU 3300711
GENUS X 24 CF NG 3300850
GENUS X 24 FF NG 3300851
GENUS X 30 CF NG 3300852
GENUS X 30 FF NG 3300853
GENUS X 35 FF NG 3300855
HS X 15 CF NG 3300897
HS X 15 FF NG 3300895
HS X 15 FF RU 3300946
HS X 18 FF NG 3300894
HS X 24 CF NG 3300896
HS X 24 FF NG 3300893
MATIS 24 CF 3300443
MATIS 24 FF 3300442', 350.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('075c3526-e961-5e14-8d2d-b1923f7a6ba3', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'О-КОЛЬЦО 17.86X2.62 ARISTON (61308091)', '61308091', '3234090337648', 'О-кольцо 17.86X2.62 Ariston 61308091 совместим со следующими моделями:
ALTEAS ONE NET 24 (3301058)
ALTEAS ONE NET 24 3301058
ALTEAS ONE NET 30 3301059
ALTEAS ONE NET 35 3301060
ALTEAS X 24 CF NG 3300844
ALTEAS X 24 FF NG 3300845
ALTEAS X 30 CF NG 3300846
ALTEAS X 30 FF NG 3300847
ALTEAS X 35 FF NG 3300849
BS 24 CF 3300286
BS 24 FF 3300286
BS II 15 FF 3300419
BS II 15 FF EU 3300441
BS II 24 CF 3300296
BS II 24 CF EU 3300438
BS II 24 FF 3300295
BS II 24 FF EU 3300439
CARES X 15 CF NG 3300889
CARES X 15 FF NG 3300887
CARES X 18 FF NG 3300886
CARES X 24 CF NG 3300888
CARES X 24 FF NG 3300885
CLAS B 24 CF 3665105
CLAS B 24 FF 3665104
CLAS B 30 FF 3665102
CLAS B EVO 24 FF 3300612
CLAS B EVO 30 FF 3300611
CLAS EVO 24 CF 3300481
CLAS EVO 24 FF 3300480
CLAS EVO 28 FF 3300483
CLAS EVO SYSTEM 15 CF RU 3300496
CLAS EVO SYSTEM 15 FF RU 3300495
CLAS EVO SYSTEM 24 CF RU 3300498
CLAS EVO SYSTEM 24 FF RU 3300497
CLAS EVO SYSTEM 28 CF 3300488
CLAS EVO SYSTEM 28 FF 3300487
CLAS EVO SYSTEM 32 FF RU 3300499
CLAS ONE 24 RDC 3301017
CLAS ONE 30 RDC 3301036
CLAS ONE SYSTEM 24 RDC 3301039
CLAS ONE SYSTEM 35 RDC 3301041
CLAS PREMIUM 24 3300330
CLAS PREMIUM 30 3300332
CLAS PREMIUM EVO SYSTEM 24 3300463
CLAS PREMIUM EVO SYSTEM 24 EU 3300702
CLAS PREMIUM EVO SYSTEM 35 3300546
CLAS PREMIUM EVO SYSTEM 35 EU 3300703
CLAS SYSTEM 15 CF 3300226
CLAS SYSTEM 15 FF 3300225
CLAS SYSTEM 24 CF 3300208
CLAS SYSTEM 24 FF 3300207
CLAS X 24 CF NG 3300866
CLAS X 24 FF NG 3300864
CLAS X 28 FF NG 3300865
CLAS X SYSTEM 15 CF NG RU 3300875
CLAS X SYSTEM 15 FF NG RU 3300872
CLAS X SYSTEM 24 CF NG 3300867
CLAS X SYSTEM 24 CF NG RU 3300876
CLAS X SYSTEM 24 FF NG 3300869
CLAS X SYSTEM 24 FF NG RU 3300873
CLAS X SYSTEM 28 CF NG 3300868
CLAS X SYSTEM 28 FF NG 3300870
CLAS X SYSTEM 32 FF NG 3300871
CLAS X SYSTEM 32 FF NG RU 3300874
Clas 24 CF 3300189
Clas 24 FF 3300187
EGIS 24 CF 3300194
EGIS 24 FF 3300193
EGIS PLUS 24 CF 3300411
EGIS PLUS 24 FF 3300413
GENUS 24 CF 3300110
GENUS 24 FF 3300107
GENUS 28 CF 3300116
GENUS 28 FF 3300113
GENUS 35 FF 3300118
GENUS EVO 24 CF 3300473
GENUS EVO 24 FF 3300472
GENUS EVO 30 FF 3300474
GENUS EVO 30 СF 3300475
GENUS EVO 35 FF 3300477
GENUS ONE 24 3301018
GENUS ONE 30 3301019
GENUS ONE 35 3301020
GENUS ONE SYSTEM 24 3301027
GENUS ONE SYSTEM 30 3301028
GENUS ONE SYSTEM 35 3301029
GENUS PREMIUM 24 3300324
GENUS PREMIUM 30 3300325
GENUS PREMIUM 35 3300326
GENUS PREMIUM EVO 24 3300446
GENUS PREMIUM EVO 24 EU 3300704
GENUS PREMIUM EVO 30 3300447
GENUS PREMIUM EVO 30 EU 3300705
GENUS PREMIUM EVO 35 3300448
GENUS PREMIUM EVO 35 EU 3300706
GENUS PREMIUM EVO SYSTEM 24 3300451
GENUS PREMIUM EVO SYSTEM 24 EU 3300709
GENUS PREMIUM EVO SYSTEM 30 3300452
GENUS PREMIUM EVO SYSTEM 30 EU 3300710
GENUS PREMIUM EVO SYSTEM 35 3300453
GENUS PREMIUM EVO SYSTEM 35 EU 3300711
GENUS X 24 CF NG 3300850
GENUS X 24 FF NG 3300851
GENUS X 30 CF NG 3300852
GENUS X 30 FF NG 3300853
GENUS X 35 FF NG 3300855
HS X 15 CF NG 3300897
HS X 15 FF NG 3300895
HS X 15 FF RU 3300946
HS X 18 FF NG 3300894
HS X 24 CF NG 3300896
HS X 24 FF NG 3300893
MATIS 24 CF 3300443
MATIS 24 FF 3300442', 230.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5dc1d45b-8d22-5968-862b-9020f445bb0d', '9f9e8abb-f5dd-55d4-8d0c-b9f242815086', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Счетчик газа СГМН-1-G6 диафрагменный БелОМО 250 мм 2023г.', 'MG464741508', NULL, 'Минимальный расход газа: 0,06 м3/ч 
Номинальный расход газа: 6 м3/ч 
Максимальный расход газа: 10 м3/ч 
Минимальная рабочая температура: -40 °C 
Максимальная рабочая температура: 50 °C 
Габаритные размеры: 320x180x224 мм 
Габариты в упаковке: 273х173х250 мм 
Резьбы на патрубках: G1 1/4 
Межцентровое расстояние: 250 мм 
Межпроверочный интервал: 8 лет 
Срок службы: 20 лет 
Вес: 3,3 кг 
Страна производитель: ОАО «НЗГА», Беларусь', 6500.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('859b5a79-01ed-5fc9-b4de-75194ea261f3', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Плата управления Ariston (65115782-05)', '65115782-04', '5414849926332', 'Основная плата + дисплей для газовых котлов ARISTON:

CARES X 15/24 FF/CF, CARES X 10/18 FF,
HS X 15/24 CF/FF, HS X 10/18 FF,
CARES XC 10/15/18/24 FF,
HS XC 10/15/18/24 FF,
CHAFFOTEAUX:
ALIXIA ULTRA 24 CF, ALIXIA ULTRA 15/18/24 FF,
ALIXIA ULTRA C 15/18/24 FF.
Производитель: Ariston 
Страна производства: Италия', 17400.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d37e99fc-8a26-5272-a4de-b8e6a6f04fcc', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Мотор трехходового клапана Ariston (61302483)', '61302483', NULL, 'Мотор трехходового клапана ELBI 220v 7.5mm широкий белый (Ariston) (61302483)

Привод (мотор) трехходового клапана для настенных газовых котлов Ariston моделей:

Ariston BS
Ariston BS II
Ariston Egis Plus
Ariston Clas
Ariston Clas System
Ariston Clas Evo
Ariston Clas Evo System
Ariston Clas Premium
Ariston Clas Premium Evo
Ariston Clas Premium Evo System
Ariston Genus
Ariston Genus Evo
Ariston Genus Premium
Ariston Genus Premium Evo
Ariston Genus Premium Evo System
Ariston Matis', 4245.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b5748957-ad8a-518b-92ab-2ffc3b67a97e', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Газовый баллончик (пропан-бутан) 200-220г (всесезонная смесь) цанговое присоединение, (09.02.103.20), Россия', '09.02.103.20', '4600171390762', NULL, 99.0, 0, NULL, 36, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b69dd6bc-870e-5ee5-815f-cd54df88e014', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', '3e72cd9f-0619-5134-b5f2-2a8b6c746e87', 'Ручки крана "GEFEST" мод. СН1210, 1211, СВН 2230 (с 01.02.11 до 01.09.15), СВН 3210, ПВГ 1212, корич', 'MG1016711231', NULL, NULL, 980.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ce3abd51-9400-5c6e-899d-f8a279862323', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Система Автономного Контроля Загазованности Бытовая СГК-2-Б-СО+СН4 DN 20 НД', 'MG572762230', NULL, NULL, 6200.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dbabe193-ed0f-50d8-bba3-b7fe60d939fd', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Комплект горелок стола (4шт) "DARINA" м. GM 441, GM 442, "Лысьва" мод. ЭГ 401, "Веста" м. М1464, "Кинг" м. 1465, 1449 (без розжига) (01020368)', '01020368', NULL, NULL, 970.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3a22e9f7-5a0f-55aa-ac2d-d06aec63358b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Комплект горелок стола (4шт) "DARINA" м. GM 441, GM 442, "Лысьва" мод. ЭГ 401, "Веста" м. М1464, "Кинг" м. 1465, 1449 (с розжигом)', 'MG2751173', NULL, NULL, 970.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7aa2fce7-ef85-5a6d-880e-dec01080c771', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Радиодатчик температуры воздуха ZONT МЛ 740', 'MG973218508', '7930066730333', NULL, 3350.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('42b5a152-8a10-58c3-a11e-aa667517f9b7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Радиомодуль ZONT МЛ‑590', 'MG508912570', '7930066730463', NULL, 3600.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c0d0610a-de55-5a2a-913c-99f03d1bcde0', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Электрод розжига (двойной) Ariston (65152497)', '65152497', '5414849534308', 'Используется в:

3632047	FAST EVO ONT B 11 NG RU		
3632048	FAST EVO ONT B 14 NG RU		
3632128	FAST EVO ONT C 11 NG RU		
3632129	FAST EVO ONT C 14 NG RU		
3632312	FAST R ONM 14 NG RU		
3632714	FAST R DISPLAY 14L NG', 420.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('469b2421-378e-5e9b-ab1c-75af23355113', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Комплект жиклеров (форсунок) газовой плиты "Дарина"', 'MG1218755733', NULL, NULL, 1060.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8b2720dc-aa1f-552f-a4b4-1f7e86a01b42', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Заглушка для газового баллона, левая резьба', 'MG1318581258', NULL, NULL, 175.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c836f9c3-ab66-5ca0-b65e-dbe02a058d8e', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Пьезовоспламенитель (073.953)', '073.953', NULL, NULL, 950.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0f86f194-d529-5f0a-8164-5648856d465a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'штуцер левый на газовый баллон 9мм', 'MG1814209484', NULL, NULL, 375.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('54cc9d2c-df2b-545e-ae45-d5cda559d973', 'dde8de94-afde-5e5f-b7c2-005966c45494', '3e72cd9f-0619-5134-b5f2-2a8b6c746e87', 'Кнопка розжига ПКН-13', 'MG613884220', NULL, NULL, 430.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('979d56ba-5b05-544c-acfd-6ff112e40117', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Патрубок контура ОВ проходной Выход "папа" Navien (20007845B)', '20007845B', '56001797892970231', 'Патрубок контура ОВ проходной Выход "папа" для котлов Navien (Навьен):

Deluxe
Deluxe Coaxial
Deluxe Plus
Deluxe Plus Coaxial
Smart Tok Coaxial
Prime Coaxial
Ace
Ace Coaxial
Atmo
NCN', 944.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e7cb9c15-bbc1-5c50-a759-7b84bf4de2cd', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Клапан автоматический предохранительный Navien (30002251A)', '30002251A', '39223797993940065', 'Клапан сбросной предохранительный 3 бара.

Совместимость:
 Deluxe
 Deluxe Coaxial
 Deluxe Plus
 Deluxe Plus Coaxial
 Smart Tok Coaxial
 Prime Coaxial
 NCN
 Deluxe S/C/E', 1290.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('476cf954-0140-512c-bc15-e7b1829d7cf7', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Датчик давления воды ОВ Navien (BH2507535A)', 'BH2507535A', '025154798598890174', 'Датчик давления (BH2507535A) предназначен для автоматического контроля давления. Монтаж датчика производится непосредственно в систему отопления, откуда передается сигналы на плату управления, полученная информация автоматически включает циркуляционный насос и обеспечивает качественное отопление.

Устанавливается на следующие модели:

Navien NCN 21KN
Navien NCN 25KN
Navien NCN 32KN
Navien NCN 40KN', 2100.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('76602db8-139c-5df4-ad49-65afac7b079d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Гидроузел с фильтром ОВ в сборе Navien (30002514B)', '30002514B', '30432797696700150', 'Гидроузел с фильтром отопительной воды для котлов Navien. Подходит к моделям: 
Navien Ace 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Ace Coaxial 10K, 13K, 16K, 20K, 24K, 30K,
Navien Deluxe 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Deluxe Coaxial 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Prime 13K, 16K, 20K, 24K, 30K, 35K,
Navien Smart TOK 13K, 16K, 20K, 24K, 30K, 35K.
Deluxe Plus 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Deluxe Plus Coaxial 13K, 16K, 20K, 24K, 30K.
NCN 21NK, 21NK, 32NK, 40NK.
Navien Atmo 13A, 16A, 20A, 24A, 28A, 13AN, 16AN, 20AN, 24AN.

Аналоги BH1301021A, BH1301018B, BH1301018D.', 1979.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c9606453-19d8-5d8b-9818-f4ecdc89a279', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Фитинг угловой контура ГВС с датчиком для котлов Navien (30003628F)', '30003628F', '30442797891760166', 'Подходит для:

Navien Ace 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K
Navien Ace Coaxial 10K, 13K, 16K, 20K, 24K, 30K
Navien Atmo 13A, 16A, 20A, 24A, 28A, 13AN, 16AN, 20AN, 24AN
Navien Deluxe 13K, 16K, 20K, 24K, 30K, 35K, 40K
Navien Deluxe Coaxial 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K
Navien Prime 13K, 16K, 20K, 24K, 30K, 35K
Navien Smart TOK 13K, 16K, 20K, 24K, 30K, 35K', 749.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('34a33821-c050-5451-a298-8392ed63c7b9', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Патрубок контура ОВ проходной Выход "мама" Navien (20007847B)', '20007847B', '56002797896880044', 'Патрубок контура ОВ проходной Выход "мама" Deluxe, Deluxe Coaxial, Deluxe Plus, Deluxe Plus Coaxial, Smart Tok Coaxial, Prime Coaxial, Ace, Ace Coaxial, Atmo, NCN 20007847B/BH2507367B', 986.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a0ba8207-7d64-54e1-9a18-4199cf5f5bad', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'ГИДРОУЗЕЛ ДАТЧИКА ПРОТОКА С КРАНОМ ПОДПИТКИ NAVIEN ACE/DELUXE 13-24K (30011226A)', '300011226A', '035940797992790236', 'Вентиль наполнения в сборе для Navien Ace 13-24K, Coaxial 13-24K, Atmo 13-24A, Deluxe 13-24K. Старый артикул BH1410017C', 3290.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c4a7d68e-6f11-5e04-9e8c-8e7d61b7ed20', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Датчик давления воздуха (маностат) для котлов Navien GA 11-35K(N), GST 35-40K(N) (30004407B)', '30004407B', '006170797796820217', '30004407B (PH0903010A) Датчик давления воздуха (маностат) GA 11-35K(N), GST 35-40K(N)', 1950.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fa931d56-b7bf-55b8-94e6-063d23a5e8e6', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Датчик температуры ОВ Navien Deluxe, Ace, Atmo (30002644A)', '30002644A', '83988798091930395', 'Датчик температуры ОВ Deluxe 13-40K, Deluxe Coaxial 13-30K, Ace 13-40K, Ace Coaxial 13-30K, Atmo 13-24A(N)', 790.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('10e54abb-cbcd-5b65-bd6c-94c774b928f9', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Датчик температуры ГВС Navien (30002643A)', '30002643A', '839890798095800193', 'Датчик температуры отопительной воды используется в котлах:

Navien Ace 13-40K
Navien Ace Coaxial 13-30K
Navien Atmo 13-24A', 790.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('93e090a0-0033-5d7a-ac00-3e718349378e', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Клапан автоматический предохранительный Navien (30002244A)', '30002244A', '00254797895910870', 'для котлов Ace, Ace Coaxial, Atmo.', 1370.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3098cf1c-bff6-554f-9da7-2723709784ca', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Изоляционная прокладка камеры сгорания Navien 13-24K (20023124A)', '20023124A', '84703ANHDM22191568', NULL, 300.0, 0, NULL, 8, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6dfe9844-f819-5cdf-b6c1-83defb6eacc7', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'НАСОС ЦИРКУЛЯЦИОННЫЙ NAVIEN DELUXE S 13-40K, DELUXE ONE 24-35K (30020779A)', '30020779A', '09975798189912951', '6/35 Циркуляционный насос обеспечивает циркуляцию теплоносителя в системе отопления или между теплообменниками в котле при приготовлении ГВС', 18400.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e189ffe6-c71f-59b5-8912-5d897d3c0872', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Датчик давления воздуха (маностат) APS Navien Deluxe, Ace (30000660A)', '30000660A', '08004798197940084', 'Датчик давления воздуха (маностат) APS Deluxe 13-40K, Deluxe Coaxial 13-30K, Ace 13-40K, Ace Coaxial 13-30K (NASS9EX00006) (30000660A)', 2470.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('28faa013-5354-5b36-b95e-e9dc4a7552ea', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Газовый клапан (арматура газовая) Navien Ace, Ace Coaxial, Atmo (30002197A)', '30002197A', NULL, 'Модель котла: NAVIEN ACE 13K, NAVIEN ACE 16K, NAVIEN ACE 20K, NAVIEN ACE 24K, NAVIEN ACE 30K, NAVIEN ACE 35K, NAVIEN ACE 40K, NAVIEN ATMO 13AN, NAVIEN ATMO 16AN, NAVIEN ATMO 20AN, NAVIEN ATMO 24AN', 7410.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9f864ecf-bb00-5a13-b947-a8e609154fff', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'ПУЛЬТ УПРАВЛЕНИЯ NAVIEN ACE 13-40K, DELUXE 13-40K, COAXIAL 13-30K, ATMO 13-24A (30012601D)', '30012601D', '23421797896900357', NULL, 5360.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e3d13bde-f0c8-5eba-bbb7-3480797b0297', 'dde8de94-afde-5e5f-b7c2-005966c45494', '73764589-799f-56bc-a354-fdee1bb7da64', 'Патрубок контура ГВС проходной Navien (30003659C)', '30003659C', '30395798193950127', 'Входная труба горячей воды для котлов Navien. Подходит к моделям: 
Navien Ace 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Ace Coaxial 10K, 13K, 16K, 20K, 24K, 30K,
Navien Atmo 13A, 16A, 20A, 24A, 28A, 13AN, 16AN, 20AN, 24AN,
Navien Deluxe 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Deluxe Coaxial 10K, 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Navien Prime 13K, 16K, 20K, 24K, 30K, 35K,
Navien Smart TOK 13K, 16K, 20K, 24K, 30K, 35K.
Navien NCN 21KN, 25KN, 32KN, 40KN,
Deluxe Plus 13K, 16K, 20K, 24K, 30K, 35K, 40K,
Deluxe Plus Coaxial 13K, 16K, 20K, 24K, 30K.', 319.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2f89ff35-ed04-53c8-9d21-68c8a5d8ec85', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'a731561e-5b48-56f6-b326-98ce886a6949', 'Кран подпитки для котлов Viessmann (7825984)', '7825984', 'KG0022166', 'Кран подпитки предназначен для подпитки системы отопления и поддержания необходимого давления после заполнения системы.

Принцип крана подпитки таков, что при падении давления в трубопроводе открывается и впускает дополнительную жидкость, когда система заполниться кран закрывается.

Кран изготовлен из латуни и монтируется в гидравлический узел.

В основном причиной поломки крана подпитки является частое добавление воды в систему отопления, которое возникает в результате утечек воды из системы отопления или несвоевременного проведения технического обслуживания.

Устанавливается на следующие модели:

Viessmann Vitopend 100-W WH1B 24/ 30 кВт
Viessmann Vitopend 100-W WHKB 25/ 30 кВт', 1640.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4ad036e4-d741-5f91-ac12-da3b996291f7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Кран подпитки (Запиточное устройство) ZW24_30-2/U032_U034-24K Bosch/Buderus (87074052300_н/о)', '87074052300', '22000005425', 'Устанавливается в:

Logomax U032-24K / U034-24K

Euroline: ZW18-1AE, ZW23-1AE, ZW24-1E LH AE, ZW18-1KE, ZW23-1KE.

Appliance: OW18-1 LH AE, OW23-1 LH AE, OW24-1 LH AE, OW18-1 LH KE, OW23-1 LH KE, OW24-1 LH KE.

Ceraclass: ZW11-2 DH AE, ZW14-2 DH AE, ZW18-2 DH AE, ZW24-2 DH AE, ZW30-2 DH AE, ZW14-2 DH KE, ZW18-2 DH KE, ZW24-2 DH KE, ZW28-2 DH KE, ZW30-2 DH KE.

Bosch: Gaz 3000 W: ZW11-2 DH AE, ZW14-2 DH AE, ZW18-2 DH AE, ZW24-2 DH AE, ZW30-2 DH AE, ZW14-2 DH KE, ZW18-2 DH KE, ZW24-2 DH KE, ZW28-2 DH KE, ZW30-2 DH KE.

ZW 24–2 AЕ, ZW 24–2 КЕ, ZW 28–2 KЕ, ZW 30–2 AЕ, ZW 23–1 АЕ, ZW 23–1 КЕ, ZW 24–2 DH AE, ZW 24–2 DH KE.', 1390.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f6ec01b8-73df-5c62-b42e-2eb68183195f', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Кран подпитки BOSCH JUNKERS (87074051940)', '87074051940.MG', 'KG0022173', NULL, 986.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fe6ccf6a-6198-5149-acf7-eb2d8766c814', 'dde8de94-afde-5e5f-b7c2-005966c45494', '8f8838e6-3716-5cd7-b279-a929bd2874eb', 'Дифференциальное реле давления Buderus (87186456530.MG) 87186456530_н/о', '87186456530_н/о', 'KG0037097, 87186456530.MG', 'BUDERUS Logamax U072-24
BUDERUS Logamax U072-24K', 2640.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('46a192a8-0374-5ef8-924b-6d22ca3e1149', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Дифференциальное реле давления для котлов (Bosch Gaz 2000 W, 6000 W Buderus Logamax U072 18 кВт) 36/20 PA (87161567440)', '87161567440_н/о', '87161567440', NULL, 2670.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('252dbcbb-e11e-5b45-b23c-4d743227c1f6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Прокладка теплообменника ГВС большая 18 мм Buderus Logamax U072, Bosch Gaz 2000 W, 6000 W, 7000 W (87167710030.MG)', '87167710030.MG', 'KG0035150', 'Прокладка теплообменника ГВС большая 18 мм для настенных газовых котлов Buderus и Bosch моделей:
Logamax U072-18K
Logamax U072-24K
Logamax U072-28K
Logamax U072-35K
Gaz 2000 W WBN2000-12C
Gaz 2000 W WBN2000-18C
Gaz 2000 W WBN2000-24C
Gaz 6000 W WBN6000-12C
Gaz 6000 W WBN6000-18C
Gaz 6000 W WBN6000-24C
Gaz 6000 W WBN6000-28C
Gaz 6000 W WBN6000-35C
Gaz 7000 W ZWC 24-3 MFA
Gaz 7000 W ZWC 24-3 MFK
Gaz 7000 W ZWC 28-3 MFA
Gaz 7000 W ZWC 28-3 MFK
Gaz 7000 W ZWC 35-3 MFA', 135.0, 0, NULL, 6, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f7a452c0-ac9f-5aa6-8e8e-edd5797bc399', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Картридж турбинки 8 л/мин для котлов Bosch Gaz 2000 W 24C, 6000 W 24С, Buderus Logamax U072-24K (87186456830)', '87186456830_н/о', NULL, 'Для настенных котлов Buderus - Logamax U072-24K', 2790.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('17483c09-47f5-5baa-9b4c-f10d134c2596', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Кран подпитки (Запиточное устройство) Bosch/Buderus (87074052300.MG)', '87074052300.MG', '86900001916', NULL, 790.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9cb70caa-3d00-56b3-947a-bc507e148635', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Прокладка теплообменника ГВС (1шт) для котлов Bosch, Buderus (87167713250.MG)', '87167713250.MG', 'KG0035149', 'Устанавливается на следующие котлы:
- Bosch Gaz W-6000 WBN6000-18C
- Bosch Gaz W-6000 WBN6000-24C
- Bosch Gaz W-7000 ZWC 24-3 MFA
- Bosch Gaz W-7000 ZWC 24-3 MFK
- Bosch Gaz W-7000 ZWC 28-3 MFA
- Bosch Gaz W-7000 ZWC 28-3 MFK
- Bosch Gaz W-7000 ZWC 35-3 MFA', 135.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d0a17b64-c0a2-59b4-b7ff-7470d48b264e', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Кран подпитки для котлов Bosch, Buderus (87161034650.MG)', '87161034650.MG', 'KG0031924', 'Кран подпитки (87161034650) предназначен для подпитки системы отопления и поддержания необходимого давления после заполнения системы.

Принцип крана подпитки таков, что при падении давления в трубопроводе открывается и впускает дополнительную жидкость, когда система заполниться кран закрывается.

При поднятии давления до 1-1,5 бар необходимо закрыть кран. Если оставить кран подпитки в открытом состоянии, сработает сбросной клапан.

Кран изготовлен из латуни и монтируется в гидравлический узел возврата.



Устанавливается на следующие модели:

Bosch GAZ 4000 W ZSA 24 - 2 A
Bosch GAZ 4000 W ZWA 24 - 2 A
Buderus Logamax U042-24
Buderus Logamax U022-24K
Buderus Logamax U052-24K
Buderus Logamax U052-28K', 780.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('18503855-b12f-5ae5-94ae-adbbbd6f4160', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'ДАТЧИК ТЕМПЕРАТУРЫ NTC (8435360.MG)', '8435360.MG', 'KG0022909', 'Датчик температуры NTC 8435360 совместим со следующими моделями:
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
ECO-3 280 Fi CSB456283680
ECO-3 280 Fi CSB456283681
ECO-3 280 Fi CSB456283682
ECO-3 280 Fi CSB456283683
ECO-3 280 Fi CSB456283684
ECO-3 COMPACT 1.140 Fi CSB445143681
ECO-3 COMPACT 1.140 Fi CSB445143682
ECO-3 COMPACT 1.140 i CSB441143680
ECO-3 COMPACT 1.140 i CSB441143681
ECO-3 COMPACT 1.240 Fi CSB445243680
ECO-3 COMPACT 1.240 Fi CSB445243681
ECO-3 COMPACT 1.240 Fi CSB445243682
ECO-3 COMPACT 1.240 i CSB441243680
ECO-3 COMPACT 1.240 i CSB441243681
ECO-3 COMPACT 240 Fi CSB446243681
ECO-3 COMPACT 240 Fi CSB446243682
ECO-3 COMPACT 240 Fi CSB446243683
ECO-3 COMPACT 240 Fi CSB446243684
ECO-3 COMPACT 240 Fi CSB446243685
ECO-3 COMPACT 240 i CSB442243681
ECO-3 COMPACT 240 i CSB442243682
ECO-3 COMPACT 240 i CSB442243683
ECO-3 COMPACT 240 i CSB442243684
LUNA-3 1.310 Fi CSE455313660
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 280 Fi CSE456283660
LUNA-3 280 Fi CSE456283661
LUNA-3 310 Fi CSE456313660
LUNA-3 310 Fi CSE456313661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.240 i CSE451243580
LUNA-3 COMFORT 1.240 i CSE451243581
LUNA-3 COMFORT 1.240 i CSE451243582
LUNA-3 COMFORT 1.310 Fi CSE455313580
LUNA-3 COMFORT 1.310 Fi CSE455313581
LUNA-3 COMFORT 1.310 Fi CSE455313582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT 310 Fi CSE456313580
LUNA-3 COMFORT 310 Fi CSE456313581
LUNA-3 COMFORT 310 Fi CSE456313582
LUNA-3 COMFORT 310 Fi CSE456313583
LUNA-3 COMFORT 310 Fi CSE456313584
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693
LUNA-3 COMFORT AIR 310 Fi CSB456313690
LUNA-3 COMFORT AIR 310 Fi CSB456313691
LUNA-3 COMFORT AIR 310 Fi CSB456313692
LUNA-3 COMFORT AIR 310 Fi CSB456313693
LUNA-3 SILVER SPACE 250 Fi CSB456253671
LUNA-3 SILVER SPACE 250 Fi CSB456253672
LUNA-3 SILVER SPACE 310 Fi CSB456313671
LUNA-3 SILVER SPACE 310 Fi CSB456313672', 1203.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('746aa786-db8d-582b-a59c-3c6685329181', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Датчик температуры NTC для котлов Bosch, Buderus (87186504540.MG)', '87186504540.MG', 'KG0040290', 'Датчик температуры NTC предназначен для измерения и контроля температуры теплоносителя в контурах оборудования.

При резком повышается температуры, вследствие чего датчик срабатывает и размыкает электрическую цепь, закрывая газовый клапан и прекращая подачу газа к горелке котла и его отключению. Датчик устанавливается заводом-изготовителем на определенную температуру срабатывания.

Принцип работы датчика заключается в том, что при изменении температуры теплоносителя меняется температура датчика и его электрическое сопротивление обратно пропорционально.  При повышении температуры снижается сопротивление, и наоборот, при снижении температуры сопротивление увеличивается.



Устанавливается на следующие модели:

Bosch Gaz 6000 W WBN6000-12C RN
Bosch Gaz 6000 W WBN6000-18C RN
Bosch Gaz 6000 W WBN6000-24C RN
Bosch Gaz 6000 W WBN6000-28C RN
Bosch Gaz 6000 W WBN6000-35C RN
Buderus Logomax U072-18K
Buderus Logomax U072-24K
Buderus Logomax U072-28K
Buderus Logomax U072-35K', 1190.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('45d82e12-69ed-5b1b-ab55-3504813c6691', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Датчик температуры NTC погружной BAXI (721309400)', '721309400', 'KG0019535', 'Датчик температуры NTC погружной BAXI арт. 721309400 

Подходит для котлов:  

DUO-TEC COMPACT 
ECO Compact 
ECO Home  
ECO-4s 
ECO-5 COMPACT 
FOURTECH', 927.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('01a4e591-0052-5da4-9261-ea9f6ff1bb02', 'dde8de94-afde-5e5f-b7c2-005966c45494', '8f8838e6-3716-5cd7-b279-a929bd2874eb', 'Кран подпитки Bitron для котлов Buderus Logamax U072, Bosch Gaz 2000 W, 6000 W (87186445920.MG)', '87186445920.MG', 'KG0029623', 'Кран подпитки Bitron для настенных газовых котлов Buderus и Bosch моделей:
Buderus Logamax U072-18
Buderus Logamax U072-18K
Buderus Logamax U072-24
Buderus Logamax U072-24K
Buderus Logamax U072-28
Buderus Logamax U072-28K
Buderus Logamax U072-35
Buderus Logamax U072-35K
Bosch Gaz 2000 W WBN2000-12C
Bosch Gaz 2000 W WBN2000-18C
Bosch Gaz 2000 W WBN2000-24C
Bosch Gaz 6000 W WBN6000-12C
Bosch Gaz 6000 W WBN6000-18C
Bosch Gaz 6000 W WBN6000-24C
Bosch Gaz 6000 W WBN6000-28C
Bosch Gaz 6000 W WBN6000-35C
Bosch Gaz 6000 W WBN6000-18H
Bosch Gaz 6000 W WBN6000-24H
Bosch Gaz 6000 W WBN6000-28H
Bosch Gaz 6000 W WBN6000-35H', 1560.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e2e7aa90-4f0b-5a99-a568-f095aadc86f6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Подпиточный клапан с ручкой Bosch', 'MG375149024', '8690000002153', NULL, 940.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7ddced27-f28d-5db3-970a-bd795691350d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '8f8838e6-3716-5cd7-b279-a929bd2874eb', 'Кран подпитки Bitron для котлов Buderus Logamax U072, Bosch Gaz 2000 W, 6000 W (87186445920_н/о)', '87186445920_н/о', '22000005421', 'Кран подпитки Bitron для настенных газовых котлов Buderus и Bosch моделей:
Buderus Logamax U072-18
Buderus Logamax U072-18K
Buderus Logamax U072-24
Buderus Logamax U072-24K
Buderus Logamax U072-28
Buderus Logamax U072-28K
Buderus Logamax U072-35
Buderus Logamax U072-35K
Bosch Gaz 2000 W WBN2000-12C
Bosch Gaz 2000 W WBN2000-18C
Bosch Gaz 2000 W WBN2000-24C
Bosch Gaz 6000 W WBN6000-12C
Bosch Gaz 6000 W WBN6000-18C
Bosch Gaz 6000 W WBN6000-24C
Bosch Gaz 6000 W WBN6000-28C
Bosch Gaz 6000 W WBN6000-35C
Bosch Gaz 6000 W WBN6000-18H
Bosch Gaz 6000 W WBN6000-24H
Bosch Gaz 6000 W WBN6000-28H
Bosch Gaz 6000 W WBN6000-35H', 1560.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7e90a08b-4f6e-5e81-9dd0-73c4dd2091d0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Мотор трехходового клапана Chunhui 220v 10mm узкий (6ATTCOMP00_н/о)', '6ATTCOMP00_н/о', NULL, 'Fondital Minorca', 1800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a92ee6d2-8fbb-5ecd-a217-e11a16ae6837', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Плата управления на BOSCH (БОШ GAZ 6000) WBN6000 / WBN2000 (87186496770) до 01.06.2017, первая кнопка назад, до сер. номера 753', '87186496770', '4057749116994', 'BOSCH GAZ 2000 W WBN2000-12C
BOSCH GAZ 2000 W WBN2000-18C
BOSCH GAZ 2000 W WBN2000-24C
BOSCH GAZ 6000 W WBN6000 12C
BOSCH GAZ 6000 W WBN6000 18C
BOSCH GAZ 6000 W WBN6000 18H
BOSCH GAZ 6000 W WBN6000 24C
BOSCH GAZ 6000 W WBN6000 24H
BOSCH GAZ 6000 W WBN6000 28C
BOSCH GAZ 6000 W WBN6000 28H
BOSCH GAZ 6000 W WBN6000 35C
BOSCH GAZ 6000 W WBN6000 35H', 21960.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3aef957e-9918-5023-b6a3-c04e2b52f728', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Трубка Вентури для котлов Ariston и Chaffoteaux (65106516) Protherm Lynx пластик', '65106516', '5414849010482', 'Трубка Вентури для настенных газовых котлов Ariston и Chaffoteaux моделей:
Alteas X 24 FF
BS 24 FF
BS II 15 FF
BS II 24 FF
Cares X 10 FF
Cares X 15 FF
Cares X 18 FF
Cares X 24 FF
Clas 24 FF
Clas B 24 FF
Clas B Evo 24 FF
Clas B X 24 FF
Clas Evo 24 FF
Clas Evo System 15 FF
Clas Evo System 24 FF
Clas System 15 FF
Clas System 24 FF
Clas X 24 FF
Clas X System 15 FF
Clas X System 24 FF
Egis 24 FF
Egis Plus 24 FF
Genus 24 FF
Genus Evo 24 FF
Genus X 24 FF
HS X 10 FF
HS X 15 FF
HS X 18 FF
HS X 24 FF
Matis 24 FF
Alixia 18 FF
Alixia 24 FF
Alixia S 15 FF
Alixia S 18 FF
Alixia S 24 FF
Alixia Ultra 15 FF
Alixia Ultra 18 FF
Alixia Ultra 24 FF
Niagara C 25 FF
Pigma 25 FF
Pigma Evo 25 FF
Pigma Evo System 25 FF
Pigma Ultra 25 FF
Pigma Ultra System
Pigma Ultra System 25 FF
Talia 25 FF
Talia System 15 FF
Talia System 25 FF', 630.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fcbd2cbd-7cc6-5fe1-b504-36691fcf2f5a', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Турбинка ГВС Bitron (турбинка) для Ariston (65104317-3_н/о) серая', '65104317-3_н/о', '22000005525', 'Ariston GENUS
Ariston GENUS PREMIUM
Ariston CLAS
Ariston EGIS
Ariston BS
Ariston GENUS PREMIUM
Ariston CLAS PREMIUM
Ariston CLAS SYSTEM
Ariston GENUS 36 FF
Ariston EGIS PLUS
Ariston BS II
Ariston MATIS 24 FF
Ariston BS II
Ariston GENUS EVO
Ariston CLAS EVO
Ariston CLAS EVO SYSTEM
Ariston GENUS PREMIUM EVO
Ariston GENUS PREMIUM EVO SYSTEM
Ariston CLAS PREMIUM EVO
Ariston CLAS PREMIUM EVO SYSTEM', 2950.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('631e088f-9dec-5228-9a81-c8e983ea4859', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'ДАТЧИК ПЛАМЕНИ (ЭЛЕКТРОД КОНТРОЛЯ ИОНИЗАЦИИ) ARISTON (998624)', '998624', '5411692285685', 'Подходит для котлов Ariston: TX 27 MFFI, TX 23 MI, TX 23 MFFI, MICROSYSTEM 28 RFFI, MICROSYSTEM 28 RI, MICROSYSTEM 21 RFFI, MICROSYSTEM 28 RFFI, MICROSYSTEM 21 RI, MICROGENUS PLUS 28 MI, MICROGENUS PLUS 24 MI, MICROGENUS PLUS SYSTEM 28 RI, MICROGENUS PLUS SYSTEM 21 RI, MICROGENUS 23 MI, MICROGENUS 23 MFFI, MICROGENUS 27 MI, MICROGENUS 27 MFFI.

Датчик пламени (электрод контроля ионизации) Ariston 998624 (ионизационный электрод) подключен к плате управления, которая обеспечивает подачу электрического потенциала на электрод контроля пламени. При наличии пламени плата регистрирует наличие тока через пламя (0,5 – 5 мкА).', 750.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a24ddfd7-3d30-58fd-a33d-0a6032b52d1e', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'ДАТЧИК ПРОТОКА ГВС (ГЕРКОН) ARISTON (65104323)', '65104323', '5411692816902', 'Датчик протока ГВС (геркон) для настенных газовых котлов ARISTON моделей:

ARISTON GENUS 24 FF
ARISTON GENUS 24 CF
ARISTON GENUS 28 FF
ARISTON GENUS 28 CF
ARISTON GENUS 35 FF
ARISTON GENUS PREMIUM 24
ARISTON GENUS PREMIUM 30
ARISTON GENUS PREMIUM 35
ARISTON CLAS 24 FF
ARISTON CLAS 28 FF
ARISTON CLAS 24 CF
ARISTON EGIS 24 FF
ARISTON EGIS 24 CF
ARISTON BS 24 FF
ARISTON BS 24 CF
ARISTON CLAS B 30 FF
ARISTON CLAS B 24 FF
ARISTON CLAS B 24 CF
ARISTON GENUS PREMIUM 24
ARISTON GENUS PREMIUM 30
ARISTON GENUS PREMIUM 35
ARISTON CLAS PREMIUM 24
ARISTON CLAS PREMIUM 30
ARISTON CLAS SYSTEM 24 FF
ARISTON CLAS SYSTEM 24 CF
ARISTON CLAS SYSTEM 28 FF
ARISTON CLAS SYSTEM 28 CF
ARISTON CLAS SYSTEM 32 FF
ARISTON GENUS 36 FF
ARISTON EGIS PLUS 24 CF
ARISTON EGIS PLUS 24 FF
ARISTON BS II 24 CF
ARISTON BS II 24 FF
ARISTON BS II 15 FF
ARISTON BS II 15 FF
ARISTON GENUS EVO 24 FF
ARISTON GENUS EVO 24 CF
ARISTON GENUS EVO 30 FF
ARISTON GENUS EVO 30 CF
ARISTON GENUS EVO 35 FF
ARISTON CLAS EVO 24 FF
ARISTON CLAS E', 1410.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d9005219-e989-5a62-949f-2ba4979769f7', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Блок розжига Ariston UNO 24 MI/MFFI (995902) оригинал', '995902', '5411692409609', 'UNO 24 MFFI 537636', 1870.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4de0630d-cb30-534c-9b39-290789b56fc9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Предохранительный клапан 3 бар Ariston (998447)', '998447', NULL, 'Предохранительный клапан 3 бар для настенных газовых котлов Ariston моделей:
Microsystem 21 RFFI
Microsystem 21 RI
Microsystem 28 RFFI
Microsystem 28 RI', 1133.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6d62c9da-da22-5755-ad68-9056e171fc44', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Реле давления дыма (Пневмореле) котлов Ariston 55 Pa (998484)', '998484', NULL, 'Ariston Uno 24 MFFI
T2 23 MFFI
T2 23 MFFI
MICROGENUS 23 MFFI
MICROGENUS PLUS 24 MFFI', 5790.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e5d818da-2bba-51aa-8367-9cbcddc3d04a', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Датчик температуры накладной с зажимом для котлов Ariston (990686)', '990686', '5411692438838', 'Датчик температуры отопления накладной с зажимом для настенных газовых котлов Ariston моделей:
Ariston GENUS
Ariston GENUS PREMIUM
Ariston UNO
Ariston CLAS
Ariston CLAS SYSTEM
Ariston EGIS
Ariston BS
Ariston BS II
Ariston CLAS B
Ariston CLAS PREMIUM
Ariston EGIS PLUS
Ariston MATIS
Ariston GENUS EVO
Ariston CLAS EVO
Ariston CLAS EVO SYSTEM
Ariston GENUS PREMIUM EVO
Ariston GENUS PREMIUM EVO SYSTEM
Ariston CLAS PREMIUM EVO
Ariston CLAS PREMIUM EVO SYSTEM
Ariston CLAS EVO SYSTEM', 1390.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b79f1e3f-79b9-52d1-83c8-7556a8e44a91', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Блок розжига для настенных котлов Ariston BS II (60001576) оригинал', '60001576', '3234090781779', 'Блок розжига Ariston 60001576 совместим со следующими моделями:
BS II 15 FF 3300419
BS II 15 FF EU 3300441
BS II 24 CF 3300296
BS II 24 FF 3300295
BS II 24 FF EU 3300439', 2290.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('734d054e-d98a-5b0b-996f-92f1ff440b65', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Газовый клапан Tlong Electric TGV 307 (заменяет 630 EUROSIT) для Лемакс, Siberia, RGA, Боринское, Конорд', 'MG403187299', '2212002912', 'Газовый клапан TLONG ELECTRIC TGV 306 котел (аналог 630 EUROSIT)
 
Технические данные:
Подсоединения:  Rp 3/8 ISO 7
Рабочее положение: Любое
Используемый газ (семейства):  I, II и III
Максимальное входное давление газа:  50 мБар
Диапазон настройки регулятора: 3..18 мБар
Рабочая температура: 40..90° C
Регулятор давления:  класс С
Устойчивость при кручении и изгибе: группа 2
Система термоэлектрической защиты (при использовании термопар SIT серии 200 или 290)
время зажигания:  < 10 сек.
время сброса: < 60 сек.
расчетное число циклов зажигания: 10 000
Система ручного сброса расчетное число циклов сброса: 10 000', 4900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('09ba0c8c-2fb5-513a-add7-f22ca7512d12', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Набор разрядников электроподжига конфорок (электродов, свечей розжига) для газовой плиты Gefest (Гефест) 1100, 1200, 1300, 3100, 3200, 3300', 'MG1662288913', NULL, 'газогорелочная группа GEFEST-4', 1100.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6a5520ab-f315-53d8-a7d0-13a401e34313', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Переходник на резиновый шланг 1/2" Ш 10', 'MG931160485', '4630003323033', NULL, 200.0, 0, NULL, 6, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('55e420e4-40e6-5a7d-ae51-e43e7e0a5ea7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Термореле керамич 100°С KSD302 - 250V10A с кнопкой', 'MG1762549789', '2200000060570', NULL, 350.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('df1d495e-0ecc-5999-9342-44e12627d578', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Термореле керамич 95°С KSD301 - 250V10A', 'MG2007148738', '2200000049667', NULL, 350.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a8f0939a-07d3-5e74-832f-e4cb55225b37', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Клейкая лента армированная х/б ткань 48мм*10м (серебряная) UNIBOB', '01060501', NULL, NULL, 219.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('55338369-8db8-5926-ab76-fda3a71f9ace', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Термореле керамич 85°С KSD302 - 250V10A', 'MG1247758029', '2200000060730', NULL, 350.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('362f68d9-780d-5d95-b000-2ff40bb1291e', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'КОЛЕНО Ø80 (М-П) С МАНЖЕТОЙ 45 ГРАДУСОВ', 'MG723884612', NULL, NULL, 750.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6ed583a3-0bfc-555e-ab5e-308fbf42f0ee', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'КОЛЕНО 80-90(М-П) БЕЗРАДИУСНОЕ С МАНЖЕТОЙ', 'MG1564853680', NULL, NULL, 790.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bb445f57-c9a8-563f-9aa5-f05991f1e5ee', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'КОЛЕНО 80-90(М-М) БЕЗРАДИУСНОЕ С МАНЖЕТОЙ', 'MG2083467675', NULL, NULL, 900.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a6a7fcb9-daad-54e0-8e72-2adbab4d98e9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'УДЛИНИТЕЛЬНАЯ ТРУБА 80 - 500 ММ.', 'MG953141051', NULL, NULL, 650.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8c2ef4ba-6958-52fb-baab-d85cf065f32b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'УДЛИНИТЕЛЬ 80-250 ММ.', 'MG156599887', NULL, NULL, 390.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4fb57a8a-04d9-5a08-82f8-29576701ffd4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Предохранительный клапан 3бар для котлов Protherm Ягуар, Lynx, Гепард RU Heatline & Glowworm (0020118190-2.MG) 0020118734 Турция', 'MG1779823487', 'KG0021456, 0020118190, 3003201638, D003202395', 'код продукта: 3003201638 - 0020118190 - D003202395', 890.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f3c5052f-00e1-506d-b687-b95191b7ff4c', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'ПРОВОДНОЙ ПРОГРАММИРУЕМЫЙ КОМНАТНЫЙ ТЕРМОСТАТ TEPLOCOM TS-PROG-2AA/8A', 'MG131564943', '4612734063310', '250 В, 8 А
Значительное сокращение затрат на энергоресурсы
Простое использование и простой монтаж
Недельное расписание, комфортная или экономичная температура для разных временных периодов
Отображение устанавливаемой и текущей температуры для точной настройки
Не требуется подключение электросети 220 В к термостату
Безопасное отключение термостата с переходом на режим защиты от замерзания', 4850.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('677ed5e7-7a27-5954-bb6d-ddba026e0d72', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'БЕСПРОВОДНОЙ ПРОГРАММИРУЕМЫЙ КОМНАТНЫЙ ТЕРМОСТАТ TEPLOCOM TS-PROG-2AA/3A-RF', 'MG2029436331', '4612734066281', '250 В, 3 А
Радиус беспроводного соединения на открытой местности: до 100 м
Температура регулировки: от 5 °С до 35 °С
Точность регулировки: 0,5 °С', 9550.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('00d23a86-da63-51d0-b564-96cd56d183b0', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'ПРОВОДНОЙ КОМНАТНЫЙ ТЕРМОСТАТ TEPLOCOM TS-2AA/8A', 'MG1367537097', '4612734063303', '250 В, 8 А
Простое использование и простой монтаж
Экономия энергоресурсов
Отображение устанавливаемой и текущей температуры для точной настройки
Не требуется подключение электросети 220 В к термостату
Безопасное отключение термостата с переходом на режим защиты от замерзания', 2800.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f486ac7d-8e61-5b79-805f-56560391a87f', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Удлинение дымохода 60/100 - 1 м (FVT-60/100-1)', 'FVT-60/100-1', NULL, NULL, 2530.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9ea7bab6-14b0-528b-8854-913e27c4c35a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Изолирующее соединение муфта 3/4 ш/ш (изолятор)', 'MG337183617', NULL, 'Диэлектрический изолятор "Tuboflex" исключает протекание через газопровод токов, утечки при возникновении электропотенциала на корпусе электрифицированного газового прибора (плиты, котла, бойлера и прочего), а также защищает электронные части газовых приборов. Диэлектрические вставки предназначены для монтажа на газопроводы, транспортирующие природный газ по ГОСТ 5542-87 и сжиженный газ по ГОСТ 20448-90, ГОСТ Р 52087-2003. В качестве электроизолятора применяется высококачественный стеклонаполненный полиамид. Стеклонаполненные полиамиды - это композитные материалы, в состав которых помимо полиамидной смолы входят структурированные стеклянные нити. Они отличаются повышенной прочностью, устойчивостью к ударным нагрузкам, химической инертностью, что делает их масло и бензостойкими. Также стеклонаполненные полиамиды характеризуются хорошими диэлектрическими свойствами.
Отсутствие диэлектрической вставки может стать причиной утечки газа в следствии прожига гибкой подводки электрической дугой.
Диаметр: 1/2".
Номинальное давление: PN 0,6 Мпа.
Рабочая температура: от -60°C до +100°C.
Вставка не требует поверки и обслуживания в процессе эксплуатации.', 316.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('65f311c3-905d-536a-8a50-aa3bcd4329e1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Изолирующее соединение муфта 3/4 г/ш (изолятор)', 'MG1440346653', NULL, NULL, 316.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0678792c-2082-5f49-a4b5-92ff82d48098', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'ФИЛЬТР МЕХАНИЧЕСКОЙ ОЧИСТКИ КОСОЙ резьбовой, Ду 15 (1/2")', 'MG924579471', '22000002619', NULL, 406.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a2b61ac2-fcde-5f8d-8a71-5686ef206496', 'dde8de94-afde-5e5f-b7c2-005966c45494', '30359f12-4373-5619-b03d-88f7d3a5e394', 'Сгон угловой американка Valtec внутренняя-наружная резьба 3/4" никелированная латунь', 'MG79286234', NULL, 'Угловой сгон с разъемным соединением типа «американка» бренда Valtec имеет диаметр прохода 3/4" дюйма. Включает накидную гайку, оснащен наружной резьбой с одной стороны и внутренней – с другой. Обеспечивает возможность соединения неподвижных трубопроводов. Преимущества: - возможность соединения труб без вращения; - создание трубопровода с помощью вращения гаек; - изготовлен из качественного материала – никелированной латуни. В «Леруа Мерлен» цены на угловые сгоны минимальны, у нас можно выгодно купить и другие виды фитингов для монтажа надежных трубопроводов.', 466.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a703c08a-3dcc-58a1-af0d-7c4c0241bb7c', 'dde8de94-afde-5e5f-b7c2-005966c45494', '30359f12-4373-5619-b03d-88f7d3a5e394', 'Американка угловая 1/2 ВР(г) х 1/2 НР(ш) латунная', 'MG525171864', NULL, NULL, 319.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2c59cf83-410f-58e5-b1a7-1c9398e53492', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Шаровой кран со сгоном AQUALINK вн-нар 1/2 U B бабочка 1167', 'MG578600321', '4630003321848', NULL, 449.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7f7f8555-9cfa-528b-8dc5-da42827f6989', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шаровой латунный 1/2" ВР/ВР бабочка AQUALINK', 'MG2019625266', '4630003321947', NULL, 540.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4ec89b45-30ae-5a69-8fb5-3d94d2b2ce1b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шар. для газа угловой 3/4" г/г бабочка CTM ГАЗ (CGLFFB34)', 'CGLFFB34', '4627108213116', NULL, 1890.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('70eff7b6-6f35-5041-81b4-6e0b3b8c3384', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шар. для газа угловой 3/4" г/ш бабочка CTM ГАЗ (CGLFMB34)', 'CGLFMB34', '4627108213093', NULL, 1890.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('cee3a18d-f754-5274-9d43-d4dd9ac8cfa5', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Фильтр латунный грубой очистки косой 1/2" ВР AQUALINK', 'MG1602458964', '4630003321992', NULL, 530.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ed58296d-93e3-51d9-a756-6b6b2cee701f', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Фильтр латунный грубой очистки косой 1" ВР AQUALINK', 'MG1334415350', '4630003322661', NULL, 695.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('35b17f6e-c817-52d8-af09-60d4dfa52295', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шаровой ВВ 1/2 ручка никелированный AQUALINK', 'MG1176615123', '4630003322562', NULL, 480.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('702a0145-511d-508f-92fb-8074a44af1fc', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран для газа 1/2", Г-Г, ручка, AquaLink', 'MG556939973', '4650098215068', 'Наминальное давление - 16 бар.
Температура рабочей среды: -10С...100С.
Материал - латунь никелированная ЛС59-2 (CW617N).
Средний срок службы - 10 лет.
Средний ресурс - 10 000 циклов', 280.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('29f4b202-a934-5ffa-ba6d-b6ea11a175bb', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Шаровой кран RuB, 3/4" DN20 PN40, ВР-ВР', 'MG2060962983', NULL, NULL, 540.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('14f8d700-ba7a-59b3-9f4b-6a8e39b45ab9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шаровой 1/2" г/ш, никелированный с ручкой-бабочкой, прямой', 'MG339796914', NULL, NULL, 480.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('46e9a2e0-0624-5f60-a9f4-bb05176a2cae', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Муфта латунная ВР 3/4'''' AQUALINK', 'MG471141658', '4630003322203', NULL, 330.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c108488a-7383-58fd-9417-ba43d885f2a9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Муфта латунная ВР 1/2'''' AQUALINK', 'MG1153404260', '4670064712353', NULL, 313.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8cd51ac2-a3b6-53c5-9a9e-0b288fb20c34', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Тройник латунный ВР 3/4" AQUALINK', 'MG1889079951', '4670064713190', NULL, 571.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1c491518-33e6-54a6-9ecc-faec388a2596', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Тройник латунный ВР 1/2" AQUALINK', 'MG1087062091', '4630003322401', NULL, 413.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('606479a2-469a-59a2-a848-8841eeec94f6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Тройник с наружной резьбой AquaLink 1/2"', 'MG59648432', '4670064713329', NULL, 420.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('31be6a57-de9a-56fd-b2e2-4356e018bcaa', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Ниппель латунный 3/4'''' AQUALINK', 'MG1338542263', '4670064712308', NULL, 360.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('560ad635-85d8-5553-bb10-f9b79317d4f0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Ниппель латунный 1/2" AQUALINK', 'MG1802471737', '4670064712292', NULL, 310.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4c901906-cb6c-58a5-b757-da789f4e7aa3', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Ниппель латунный 1'''' AQUALINK', 'MG926144110', '4670064712315', NULL, 420.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('451cc615-06f9-530e-bf2d-d663a3d7d5a7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Футорка латунная 3/4"х1/2" AQUALINK', 'MG152871176', '4670064712858', NULL, 165.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('fb5d04bc-9ac1-56dd-8997-e257b18ad895', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Футорка латунная 1"х3/4" AQUALINK', 'MG1820258389', '4630003322326', NULL, 214.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ed466b12-4ee3-5787-8258-baa177cb0ce6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Футорка латунная 1"х1/2" AQUALINK', 'MG764417880', NULL, NULL, 235.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('378303e3-7ca6-5c10-a70c-d320bc7fe259', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Переходник AQUALINK 1/2"нар x3/4"вн', 'MG619352672', NULL, NULL, 386.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('459e61d1-012b-565e-bd83-7bd54e559428', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Ниппель - переходник (бочонок) латунный никелированный 1" х 1/2" н/н AQUALINK', 'MG2051938939', NULL, NULL, 402.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('21edbf6d-f1e4-5bf0-9dff-87472a412913', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Переходник AQUALINK 3/4 нар х3/4 вн', 'MG873808351', NULL, NULL, 370.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('608b76cf-4897-58b8-98ba-6601442d7682', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Удлинитель вн-нар 3/4"- 60 мм (AQUALINK 90/10) 02400', 'MG8642665', '4670064714012', 'старая 513', 550.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('cb20e3d0-83bc-58df-b58e-02d00410f866', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Переходная муфта AQUALINK 1/2х3/4 вн-вн', 'MG1131918085', '4670064712582', NULL, 386.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('abdb268b-d165-51e6-954d-ba307e294388', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Удлинитель AQUALINK вн-нар 3/4"-70 мм', 'MG560980206', NULL, NULL, 417.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dfa75132-9e27-5f08-be66-f2d9755dad85', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Удлинитель AQUALINK вн-нар 3/4"-80 мм', 'MG430990576', NULL, NULL, 467.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b6d71850-6f9d-54c5-899a-50908a9bfb36', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Муфта переходная 1-3/4 ВН/ВН AQUALINK', 'MG422260513', '4630003322173', NULL, 424.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6152cf92-a4b0-5f29-84be-548977a2d276', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Уголок AQUALINK 3/4x3/4 вн-вн', 'MG1055313723', '4670064712261', NULL, 193.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8274964f-6df2-5682-9b7c-9d8f8ce80fa7', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Уголок AQUALINK 3/4x3/4 вн-нар', 'MG522999243', '4670064713077', NULL, 210.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('60318fe3-8a55-5959-b54d-a21374978bf0', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Уголок 1/2 для газа с упором под прокладку г/ш (KG0029589)', 'KG0029589', NULL, NULL, 424.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('81a728af-20e4-5648-8843-d9135229ea1b', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', '"Ariston", "Mora" Мембрана ВПГ "Ariston" Fast R 10 ONM, черная', 'MG442677214', NULL, NULL, 550.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('677d580b-a7d5-5fee-ad95-c1da7f383f44', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Мембрана для газовой колонки Ariston Fast R 14 ONM (65153314)', 'MG1420629992', NULL, NULL, 600.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f4e3aa6e-af2e-5928-b9a6-9a7aa1db3fb5', 'dde8de94-afde-5e5f-b7c2-005966c45494', '47a52980-ff8d-54d3-ac99-56b5df280568', 'Мембрана D-72 mm. для водяного узла ВПГ NEVA 4510, 4511, 4513 с 01.03.2013 года арт. 3227-02.278-01 Vilterm', 'MG244448961', NULL, NULL, 350.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b2d21613-e9bf-523e-bc6b-0853ff4b8fc8', 'dde8de94-afde-5e5f-b7c2-005966c45494', '47a52980-ff8d-54d3-ac99-56b5df280568', 'Мембрана D-72 mm. (силикон) для водяного узла ВПГ NEVA 4510, 4511, 4513 с 01.03.2013 года арт. 3227-02.278-01', 'MG1489779391', NULL, NULL, 350.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3c40ee25-ddbe-5d19-87b3-6f334fda88f8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Мембрана NEVA 4510 М (импортный водогазовый узел) Нева-Транзит 10 E/ Vektor 12-W арт. 4510-02.251', 'MG1517701566', NULL, NULL, 400.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7531b93c-9ed6-5756-a060-dc8cb34cdd9d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Мембрана газовой колонки Bosch Junkers WR-275, WR-350', 'MG661649819', NULL, NULL, 500.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4bb91dba-259b-57c1-a911-3c901a7252e4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Мембрана для Bosch / Electrolux GWH 14 Nano Plus 2.0 (87387033640) d-73мм', 'MG899564748', NULL, NULL, 800.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a1d09d11-bdc9-5d0f-bdf0-fc2f88591eaa', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Мембрана для газовой колонки BAXI SIG-2 11p, SIG-2 11i, SIG-2 14i (722305500)', 'MG1820437042', NULL, NULL, 690.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('17a55f50-f6b7-5e91-8fc7-cbe89dd210af', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c4b674d0-3da5-5a7a-acd3-6432a0604535', 'BaltGaz Мембрана газовой колонки Нева Baltgaz 4510 4511 4513 с 2017 46мм', 'MG2032089277', NULL, NULL, 350.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4cfb4d45-8528-5c40-b386-7f2f50381e85', 'dde8de94-afde-5e5f-b7c2-005966c45494', '531222ed-43bd-5d19-b2ad-507aa2946258', 'Мембрана 49 мм ВПГ "Electrolux" мод. GWH 285 (МБС)', 'MG1278944533', NULL, NULL, 350.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('78ac21a6-b779-5a04-b6d0-b5ea794cd3fa', 'dde8de94-afde-5e5f-b7c2-005966c45494', '47a52980-ff8d-54d3-ac99-56b5df280568', 'Набор комплектующих для водяного узла ВПГ "NEVALUX" 4511, 4513, 4513M (3227-02.270-01) с 2015г.', '3227-02.270-01', NULL, NULL, 550.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5fc15180-8189-536b-96e4-742475dd388c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка гибкая д/воды нерж Н3/4"-Н3/4" L=0.8м лат/г ГИГАНТ AQUALINE', 'MG682810680', '4670064711363', NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('13b792ce-4f9a-5e66-8b36-ba79af2745aa', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка гибкая д/воды нерж Н3/4"-Н3/4" L=0.6м лат/г ГИГАНТ AQUALINE', 'MG1105440186', '4670064711356', NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('df22ca8a-5fae-5589-ae0d-abb47280ac15', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка гибкая д/воды нерж Н3/4"-Н3/4" L=0.5м лат/г ГИГАНТ AQUALINE', 'MG138594212', '4670064711349', NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('733f20b8-b62d-57b6-b103-4f5ebd58820c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка гибкая д/воды нерж Н3/4"-Н3/4" L=0.4м лат/г ГИГАНТ AQUALINE', 'MG705288089', '4670064711332', NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('b80f0e15-688c-59ef-a0b5-6be6cde1c5b8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Подводка гибкая д/воды нерж Н3/4"-Н3/4" L=0.3м лат/г ГИГАНТ AQUALINE', 'MG1294294870', '4670064711325', NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('131c0dda-0c09-5699-88b5-114c313f96ff', '8f3f38cd-260b-52d9-ab64-e3b180a7e4fb', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Датчик бойлера Vaillant (306257) 0020174087', '306257', '4024074431450', 'Для котлов: atmoVIT, atmoCRAFT, iroVIT, ecoTEC, turboTEC, atmoTEC', 4300.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5f6409cf-e588-5e8e-ae0f-25d5fd2f52b2', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Шланг кислородный (армированный 9мм) за 1м', 'MG1139518284', NULL, NULL, 95.0, 0, NULL, 30, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('dd0cda82-0520-5ccb-b81d-3b57c21aeb3c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Мотор трехходового клапана ELBI 220v 7.5mm широкий (для BAXI LUNA) Италия 5694580.MG черный', '5694580.MG', NULL, NULL, 2490.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7e2e32b5-23c0-5aaf-8c2e-60d9c659c2d8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Мотор трехходового клапана ELBI 220v 7.5mm широкий (для BAXI LUNA) Италия 5694580-2.MG белый', '5694580-2.MG', NULL, NULL, 2590.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d175f1f2-7793-5e13-a6de-f909e3b6e83c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Мотор трехходового клапана ELBI 220v узкий (для BAXI Fourtech 24F) Италия 710047300.MG Fondital (6ATTCOMP00)', '710047300.MG', 'ЛП0029608', 'ЛП0029608', 1190.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('025478db-d3da-54e5-9ca3-8bff9a1d4f49', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Конденсатоотводчик для газового котла Ariston (65104623.A)', '65104623.A', '2000000187778', '2000000187778', 2590.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('56674ffc-5adf-5744-b8ee-d0133f7142d1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Манометр системы отопления d.28 с трубкой (для BOSCH) (87186457920_н/о) CEWAL Италия', '87186457920_н/о', NULL, NULL, 2940.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('54d2ad52-576b-5190-a2cb-a98cda82f34d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Ручка управления котла мал. (для MAX) 114286-2_н/о', '114286-2_н/о', NULL, NULL, 462.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9f2fd696-bef2-5f72-ad92-c552afb830de', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Расширительный бак 6л резьба M14 (для Baxi) (5693920-3_н/о) Турция', 'Расширительный бак 6л резьба M14 (для Baxi) (5693920-3_н/о)', NULL, NULL, 5066.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bd3125e6-0af8-5346-bdd4-9f9ae538199a', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'BAXI, Котел газовый ECO Classic 24 F', '100021537', NULL, NULL, 43900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('183d0315-552a-5800-b0b0-7a5ade2fd440', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Реле давления воздуха Huba 80/68 Vaillant (0020041905.MG / 2000801921)', 'MG811328921', 'KG0037599', NULL, 3490.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9ff61fd5-95fa-5b3b-9944-f60f53ffccf1', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'a731561e-5b48-56f6-b326-98ce886a6949', 'Реле давления воздуха (прессостат) HUBA 195/180 (для Viessmann)  7856835.MG', '7856835.MG', 'KG0037104', 'Дифференциальное реле (ПНЕВМОРЕЛЕ) 12, 24 kW для котлов Viessmann Vitopend 100-W A1HB и A1JB 12 - 24 кВт 7856835 о
Дифференциальное реле 12, 24 kW (прессостат, маностат) 195/180 Pa для настенных котлов Viessmann Vitopend 100-W A1JB/A1HB

Совместим с котлами:
7571692, Котел настенный Viessmann Vitopend 100-W A1JB009 K-rlu 12 кВт
7571694, Котел настенный Viessmann Vitopend 100-W A1JB010 K-rlu 24 кВт
7571693, Котел настенный Viessmann Vitopend 100-W A1HB001 U-rlu 24 кВт', 3320.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f9c623c6-2371-5a6b-b40c-3852f01c114f', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Маностат воздуха Protherm Lynx (Рысь) 11, 24 кВт, Ягуар (40/25 Па) (0020118741.MG)', '0020118741.MG', 'KG0022114', 'Устанавливается на следующие котлы:
Protherm LYNX 11 HK (N-RU)
Protherm LYNX 24 HK (N-RU)
Protherm Ягуар 11 JTV (N-RU)
Protherm Ягуар 24 JTV (N-RU)', 2980.0, 0, NULL, 7, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('ebcae2a0-8c10-5ebd-bb14-9c4281a1b00b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Пневмореле 115/95 Pa для котлов Baxi Eco, Eco-3, Luna, Luna-3 (721890800.MG)', '721890800.MG', 'KG0037103', NULL, 3580.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('85b2b484-f943-57b2-b9a1-c634fb7fcbaa', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Прессостат HYP-100 0090 P=0.40mbar / Pmax10 mbar', 'MG486183814', 'TB10108734', NULL, 3900.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('d84bed04-e470-5510-b65f-4680390337c5', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Универсальное реле давления котла 0,6 мбар', 'MG1725166579', '1606AZ', NULL, 3252.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8aab6835-8a53-5928-a451-449daee414a4', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Пневмореле (прессостат, маностат) 70/60 Pa, Huba Control 60010117', '60010117', NULL, 'для котлов BAXI 628770, 710789900, 721890300 
Для настенных котлов марок BAXI: ECO Four , FOURTECH, LUNA-3 , PULSAR , ECO-3 , ENERGY EASY , FALKE , FOURTECH , INITIA DIGIT , INITIA MASTER , INITIA PLUS , LUNA ST COMPACT, LUNA-3 , MAIN , MAIN DIGIT , MAIN Four, MS, MSL, NOVAMAX , NUVOLA-3 COMFORT', 1690.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('c410bbea-f73a-59fa-b9bb-eaf47a8d6a57', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Шток водяного узла 4510-02.252-01 газ. колонки 8-10л. (малый)', 'MG1969315989', NULL, NULL, 480.0, 0, NULL, 9, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('40fe15aa-405f-59b1-9abd-26dc00e78540', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Основной теплообменник BS II FF, Egis Plus FF, Matis 24 FF с трубками (65113396)', '65113396', '5414849385771', '', 25560.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e7a19728-bddd-599d-80a6-fa5dfdecfb86', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник ГВС HR 16 пластин 207 x 156 (для BAXI ECO3, Eco four, Fourtech, 4s) (5686680.MG) 5686660 5686670', '5686680.MG', 'KG0031288', 'Коды возможной замены
5686660 5653650 5653680 5655780 5686670 5686690 5653660

Комментарий тех. отдела BAXI
Для котлов с латунной гидрогруппой версии 2014 года и и ранее и для котлов с пластиковой гидрогруппой. Рекомендуется в качестве единой запасной части для всех моделей котлов серий ECO Four, Luna-3, Luna-3 Comfort для всех мощностей (24, 28, 31 кВт). Обращаем внимание на указанных сериях котлов с начала 2014 года (12-14 недели) устанавливаются новые не взаимозаменяемые теплообменники. Данный теплообменник может быть также установлен на котлы серий Fourtech и Eco Compact вне зависимости от даты выпуска.', 6490.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('27851d8d-a935-5590-9719-44b46b3e963d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник ГВС 12 пластин 207 x 156 (для BAXI ECO3, Eco four, Fourtech, 4s) 5686670-3.MG 5686660 5686680', '5686670-3.MG', NULL, NULL, 3900.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('18723f7f-a3d5-582f-9287-bcfb2cb45f3a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Картридж трехходового клапана латунь (для Baxi ECO Four 24, ECO-3, LUNA-3) 711356900.MG Турция', '711356900.MG', 'KG0016828', NULL, 3860.0, 0, NULL, 7, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5f136a7e-138a-5730-9419-5e49ef361766', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Картридж трехходового клапана (для BAXI/Ariston/Bosch) 721403800.MG / 87186445620 / 65104314 / 7728745 Bitron Италия', '721403800.MG', NULL, 'Картридж трехходового клапана для настенных газовых котлов BAXI моделей: 
Fourtech 24 
Fourtech 24 F 
Eco-5 Compact 14 F 
Eco-5 Compact 18 F 
Eco-5 Compact 24 F 
Eco-4s 10 F 
Eco-4s 18 F 
Eco-4s 24 
Eco-4s 24 F 
Eco Home 10 F 
Eco Home 14 F 
Eco Home 24 F 
Eco Compact 14 F 
Eco Compact 18 F 
Eco Compact 24
Eco Compact 24 F', 1525.0, 0, NULL, 27, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('159a9e1b-e950-53ee-94b0-568217c400d2', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Предохранительный клапан Watts 3 бар (для Ariston/Bosch) 61312668.MG / 87186445660', '61312668.MG', NULL, NULL, 1125.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('95a77804-2fa2-520f-9a8b-efb6f28336dc', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик протока ГВС для котлов BAXI Main, Main Digit, Westen Quasar Plus (5663770.MG) JJJ005663770', '5663770.MG', NULL, NULL, 1690.0, 0, NULL, 18, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('47de60c7-39d9-5d8c-867c-1e0e51a04e99', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Аквасенсор (датчик протока) в сборе для котлов Protherm Ягуар, Lynx, Гепард H-RU (0020118662.MG)', '0020118662.MG', 'KG0017508', NULL, 790.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6e8a48c3-2feb-5a26-b247-135815eb7866', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик протока ГВС для котлов BAXI Main Four (5667220.MG) JJJ005667220', '5667220.MG', NULL, NULL, 1790.0, 0, NULL, 20, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('7fcdf5b2-0bd4-515d-b272-77d552eef129', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шаровый 3/4 для газа DN-20 СТАНДАРТ 221 ВхН ГАЛЛОП "0116026"', '0116026', NULL, NULL, 810.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5086fbd4-ba08-5402-9c6d-0c0561013d73', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Кран наполнения системы в сборе (для Main Four) 710224400.MG', '710224400.MG', NULL, NULL, 1590.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('94a289d4-0671-55e9-9f0a-99cb45c74d9d', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Баллон газовый 27л (вентиль)', 'MG2046283498', NULL, 'без скидки 4970', 4890.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('444f7a12-84d8-583c-9af2-a889fb9e6cc2', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Баллон газовый 12л (вентиль)', 'MG1734625146', NULL, NULL, 4500.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('59014e44-5a97-56a7-958d-234522e48439', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Баллон газовый 5л (вентиль)', 'MG1107957006', NULL, 'старая 2790', 3200.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('523dbd9e-6d75-5754-86ce-434d73c243b9', 'e09476ce-d2b6-549e-83c6-c5d9d80d4a0e', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Термостат комнатный механический BAXI KHG 714086910', '714086910', 'KHG714086910', 'KHG714086910', 3370.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bba72d3f-6ae2-5da6-a49e-4ff1d6e50b72', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Автоматический воздухоотводчик BAXI (7219215.MG) 104521 0020014161', '7219215.MG', NULL, 'Автоматический воздухоотводчик BAXI (7219215.MG) 104521
Автоматический воздухоотводчик Воздухоотводчик Vaillant atmo/turboTEC 104521 - 1550руб
Автоматический воздухоотводчик BAXI (7219215.MG) 104521 0020014161', 950.0, 0, NULL, 30, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('65800444-1058-5a0f-b540-b421c27d1fac', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран шар. для газа угловой 1/2" г/ш бабочка Галлоп', 'MG1448395212', NULL, NULL, 580.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6ff7b976-9a80-56a2-a51d-dbc5822b515a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Мотор трехходового клапана Chunhui 220v широкий (для BAXI/Ariston) Китай 5694580-3.MG белый', '5694580-3.MG', NULL, NULL, 1980.0, 0, NULL, 20, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('49cd5dde-ec86-5669-a5d7-2ba97cc3d770', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Картридж трехходового клапана (для Baxi ECO Four 24, ECO-3, LUNA-3) 711356900-2.MG Китай', '711356900-2.MG', NULL, NULL, 1870.0, 0, NULL, 20, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('5017f6fc-68a2-5964-bf8e-910de12a9031', 'd807ca68-64ce-5694-91e7-be50e5e2cd37', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Газовая колонка VilTerm S13 серебро', '00-00002604', NULL, NULL, 18690.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1f6700bd-5ba5-54a8-835a-dacbb2a0b4d9', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Блок управления электронный 1101-08.100 VST5.L21A-0', '00-00000123', NULL, NULL, 1950.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('543c0453-3720-52db-8ee2-68422eb384c6', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Микровыключатель 1101-08.340 Vilterm', '1101-08.340', NULL, NULL, 450.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('73c58a47-1372-507b-87fb-672a2f3e423b', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Вентилятор FJ 35-01 (00-00003012)', '00-00003012', NULL, NULL, 6750.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1d831aa6-a4cb-5e97-8a56-16b4b176dd92', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Клапан предохранительный 3 бар для котлов BAXI (9951170.MG) 5653690 87074010270 710109400 под клипсу', '9951170.MG', '87074010270', NULL, 1390.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('35446d1f-dd96-534e-8018-9587a841672d', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик наличия пламени NEVA (свеча ионизации)', '3227-01.140-01', NULL, NULL, 650.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('07256661-7eae-5413-b8e9-fe80a6283a20', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Реле давления воды 1/4 KSY-C12 (универсальный, пластиковый штуцер, 2 контакта (9951690_н/о)', '9951690_н/о', '9951690', NULL, 890.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('42c8ed96-906f-5ab2-890f-e8a4cebbbd8c', 'd4f1028a-1df2-5bd7-835f-6b8da08f44f3', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'BAXI, Котел газовый ECO LIFE 24 F (Двухконтурный) 7814104', '7814104', '7659762', 'закуп 23.09.25 - 44500
закуп 24.10.25 - 46000', 59100.0, 0, NULL, 0, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1a969df9-a477-5456-9ee9-a2da63091a42', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c345df8c-ba5f-5144-898f-9adf5c93a034', 'Теплообменник пластинчатый для ГВС Zilmet 12 пластин для котлов BAXI (5686660.MG)', '5686660.MG', NULL, 'Оплата при получении товара после осмотра

Экспресс-доставка по всей России

Артикул запчасти: 5686660.MG

Исполнение: аналог оригинального артикула 5686660

Производитель: Zilmet, Италия.

Теплообменник ГВС пластинчатый вторичный Zilmet на 12 пластин для настенных газовых котлов BAXI моделей:

Eco 240 Fi
Eco 240 i
Eco Compact 14 F
Eco Compact 18 F
Eco Compact 24
Eco Compact 24 F
Eco Four 24
Eco Four 24 F
Eco Home 10 F
Eco Home 14 F
Eco Home 24 F
Eco-3 240 Fi
Eco-3 240 i
Eco-3 Compact 240 Fi
Eco-3 Compact 240 i
Eco-4s 10 F
Eco-4s 18 F
Eco-4s 24
Eco-4s 24 F
Eco-5 Compact 14 F
Eco-5 Compact 18 F
Eco-5 Compact 24
Eco-5 Compact 24 F
Fourtech 24', 6240.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('afa3b48d-7d4a-55bf-a28f-f3d0938ab983', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Теплообменник ГВС HR 12 пластин 192 x 154 (для Viessmann WH1D / Neva Lux 8224 / MIZUDO M11T-24T/TH) AB.08.02.0007.MG / 7828745', '7828745.MG', NULL, 'Теплообменник ГВС HR 12 пластин 192 x 154 (для Viessmann WH1D / Neva Lux 8224 / MIZUDO M11T-24T/TH) AB.08.02.0007.MG / 7828745', 4950.0, 0, NULL, 4, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('cb60915e-8bfd-5ed2-a9aa-9754a2c0163a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Теплообменник ГВС HR 12 пластин 192 x 160 (для Baxi Classic, Baltgaz) 63041310091P.MG', '63041310091P.MG', 'KG0035706', NULL, 4750.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9c369448-e939-5c79-b7b3-74e0e3cb7b6a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Теплообменник ГВС Zilmet 1901630 - 12 пластин 192 x 160  (для Baxi Classic, Baltgaz) 63041310091P_н/о', '63041310091P_н/о', NULL, NULL, 5550.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('549401bb-4ffd-50eb-9abf-19a11f465b6d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Теплообменник ГВС HR 12 пластин (Гепард ver.19, Пантера ver.19, TEC) 0020020018.MG / 0020059452', '0020020018.MG', '0020059452, KG0018325', NULL, 5990.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('1c3ac193-2fcf-5a81-8f5a-27ced97df038', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Теплообменник вторичный 12 пластин для котлов Bosch Gaz 2000 W, 6000 W 12C, 18C, Buderus Logamax U072-12K, 18K 87186446230.MG', '87186446230.MG', 'KG0037581', NULL, 4890.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('a1e5d5a8-fbb5-52a9-a137-b7d210eeb91c', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Теплообменник ГВС HR 12 пластин (для Protherm Lynx, Ягуар) 0020119605.MG', '0020119605.MG', 'KG0022476', '2800 аналог', 5500.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('bbb640e0-1c1a-566e-8253-289dd7cf4d7d', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Теплообменник ГВС HR 12 пластин (для Viessmann WH1B, Protherm) 7825533.MG / 995945 / 0020043598', '7825533.MG', 'KG0023418', NULL, 4680.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('3eb32efb-fc9a-500e-a38c-d92dd950f91c', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'c0c375f8-2b13-5026-a5d3-f11341c1b039', 'Теплообменник ГВС HR 16 пластин (U072-24К, WBN6000-24C) 87186446250-2_н/о', '87186446250-2_н/о', NULL, NULL, 5700.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('044e4874-5844-537e-a083-fb77c46005d2', 'dde8de94-afde-5e5f-b7c2-005966c45494', '2bcd6282-4c5c-5527-9eeb-3df8bc8850d8', 'Теплообменник вторичный ГВС 12 пластин 192 x 142 (для Ariston Clas-BS-EGIS) 65104333-2.MG', '65104333-2. MG', '8698973573465', 'Китай
старая 4980', 3280.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('f156da1b-d2e9-58f1-b417-59b5ee517ced', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик температуры NTC для котлов Protherm Lynx, Ягуар (0020118638.BR)', '0020118638.BR', NULL, NULL, 960.0, 0, NULL, 10, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('8ba084ac-6290-50f1-a500-a43d85f94c81', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'ДАТЧИК ТЕМПЕРАТУРЫ NTC (ПОГРУЖНОЙ) (8434820.BR)', '8434820.BR', NULL, NULL, 1200.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('0f5423db-0d10-5dff-acdd-b99990c5fbce', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Картридж трехходового клапана газового котла Bosch Gas 6000, Westen Pulsar D, Baxi. Bitron Италия (20490636.BR)', '20490636.BR', NULL, NULL, 1520.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4d1df722-c254-51d5-868d-39d9399bb291', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран наполнения системы в сборе G1/4 Novasfer для котлов BAXI Main, Main Digit (5667980.BR)', '5667980.BR', NULL, '1280', 1980.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('9725fbf0-7ac1-5102-bd43-f1dacdcb2d8a', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик NTC погружной производитель Bitron Италия (TS100.BR) 8434820.MG', 'TS100.BR', NULL, 'Датчик NTC погружной производитель Bitron Италия TS100 ставится на большинство котлов торговых марок Hermann, Beretta, Immergas, Nova Florida, Sime, Demrad, Baxi, Westen, Protherm, Termet и др.', 1010.0, 0, NULL, 5, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6c8017f5-a05b-54c5-a42d-191608a459c5', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Кран наполнения системы в сборе для котлов BAXI Eco Four 24, Luna (620890.BR)', '620890.BR', NULL, NULL, 1520.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('50c6941b-71fb-5ae7-9588-dd601e7af437', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Электронная плата управления Protherm Lynx, Jaguar HK 24-28 (0020119390)', '0020119390', '8690000010448', 'скидка до 20000', 19200.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('6c7cca77-ccce-5d30-adfe-82635c1eda4e', 'dde8de94-afde-5e5f-b7c2-005966c45494', '5312190a-1628-56c2-bbef-d9b4aeaa14b4', 'Теплообменник ГВС HR 13 пластин (для TEC) 0020020018_н/о', '0020020018_н/о', NULL, NULL, 5100.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('2d8bc9c8-57a1-5dd6-9919-a16e91d864d2', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Расширительный бак на газовый котел Baxi 8л. 14мм (мелкий шаг) (5663880.BR) 5625570.BR', '5663880.BR', NULL, '9450/9250

5663880.BR 
Baxi:

Eco 3 Compact (Fi),
Luna 240i,
Luna 240Fi,
Main 18 Fi,
Main 24Fi,
Main Digit 24 Fi,
Luna Comfort 250 Fi,
Luna 3 Comfort 240i,
Luna 3 Comfort 240Fi,

Westen:

Star 240i,
Star 240Fi,
Westen Star Master 240 Fi,
Energy 240i,
Energy 240Fi,
Westen Pulsar 240Fi,
Quasar 24F,
Westen Star Digit 240i,
Westen Star Digit 240Fi,
Westen Quasar Plus 24Fi.

5625570.BR - 

ECO 1.240 Fi CSE435243680
ECO 1.240 i CSE431243680
ECO 240 Fi CSE436243680
ECO 240 Fi CSE436243681
ECO 240 i CSE432243680
ECO 240 i CSE432243681
ECO-3 240 Fi CSB456243680
ECO-3 240 Fi CSB456243681
ECO-3 240 Fi CSB456243682
ECO-3 240 Fi CSB456243683
ECO-3 240 Fi CSB456243684
ECO-3 240 i CSB452243680
ECO-3 240 i CSB452243681
ECO-3 240 i CSB452243682
ECO-3 240 i CSB452243683
LUNA-3 240 Fi CSE456243660
LUNA-3 240 Fi CSE456243661
LUNA-3 240 i CSE452243660
LUNA-3 240 i CSE452243661
LUNA-3 COMFORT 1.240 Fi CSE455243580
LUNA-3 COMFORT 1.240 Fi CSE455243581
LUNA-3 COMFORT 1.240 Fi CSE455243582
LUNA-3 COMFORT 1.240 i CSE451243580
LUNA-3 COMFORT 1.240 i CSE451243581
LUNA-3 COMFORT 1.240 i CSE451243582
LUNA-3 COMFORT 240 Fi CSE456243580
LUNA-3 COMFORT 240 Fi CSE456243581
LUNA-3 COMFORT 240 Fi CSE456243582
LUNA-3 COMFORT 240 Fi CSE456243583
LUNA-3 COMFORT 240 i CSE452243580
LUNA-3 COMFORT 240 i CSE452243581
LUNA-3 COMFORT 240 i CSE452243582
LUNA-3 COMFORT 240 i CSE452243583
LUNA-3 COMFORT AIR 250 Fi CSB456253690
LUNA-3 COMFORT AIR 250 Fi CSB456253691
LUNA-3 COMFORT AIR 250 Fi CSB456253692
LUNA-3 COMFORT AIR 250 Fi CSB456253693', 9450.0, 0, NULL, 3, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('25f58ed5-4bd2-587e-a427-d71953b7de35', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'baac6292-b7e8-592f-a7ca-ce19eb3386fd', 'Датчик протока для котлов Baxi Eco Four, Luna 3 Comfort (620340.BR)', '620340.BR', NULL, '', 3376.0, 0, NULL, 2, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('e0e40fd2-b7cc-54d3-a75d-419e968164d8', 'dde8de94-afde-5e5f-b7c2-005966c45494', 'a731561e-5b48-56f6-b326-98ce886a6949', 'Теплообменник ГВС Zilmet 1901206 - 12 пластин 192 x 154  (для Viessmann WH1D)', '7828745-3_н/о', NULL, NULL, 5500.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL),
('4bdecae9-4044-514f-9307-5c3000961e18', 'dde8de94-afde-5e5f-b7c2-005966c45494', '75858c87-51de-502f-8365-9266af57c5c2', 'Теплообменник 10 пластин Protherm (0020119605)', '0020119605', '8585032433573', '', 7750.0, 0, NULL, 1, 0, 'шт', FALSE, NULL, '[]', TRUE, FALSE, NULL, NULL, NULL, '[]', '{}', '{}', 'now()', 'now()', NULL);