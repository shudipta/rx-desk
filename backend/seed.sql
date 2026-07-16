-- Seed Favorite Medicines (idempotent, skips if name already exists)
INSERT OR IGNORE INTO favorite_medicines (name, created_at, updated_at) VALUES 
('Comet', datetime('now'), datetime('now')),
('Bigmet', datetime('now'), datetime('now')),
('Metsa', datetime('now'), datetime('now')),
('Diamicron MR', datetime('now'), datetime('now')),
('Dimerol', datetime('now'), datetime('now')),
('Secrin', datetime('now'), datetime('now')),
('Lijenta', datetime('now'), datetime('now')),
('Lijenta-M', datetime('now'), datetime('now')),
('Glipita', datetime('now'), datetime('now')),
('Glipita-M', datetime('now'), datetime('now')),
('Wikitin', datetime('now'), datetime('now')),
('Empazin', datetime('now'), datetime('now')),
('Jardiance', datetime('now'), datetime('now')),
('Eltroxin', datetime('now'), datetime('now')),
('Thyrox', datetime('now'), datetime('now')),
('Neomazole', datetime('now'), datetime('now')),
('Thyromazol', datetime('now'), datetime('now')),
('Progest', datetime('now'), datetime('now')),
('Artigest', datetime('now'), datetime('now')),
('Cabergol', datetime('now'), datetime('now')),
('Cabaser', datetime('now'), datetime('now'));

-- Seed Favorite Tests
INSERT OR IGNORE INTO favorite_tests (name, created_at, updated_at) VALUES 
('TSH', datetime('now'), datetime('now')),
('FT3', datetime('now'), datetime('now')),
('FT4', datetime('now'), datetime('now')),
('FBS', datetime('now'), datetime('now')),
('HbA1c', datetime('now'), datetime('now')),
('Anti-TPO Antibodies', datetime('now'), datetime('now')),
('Prolactin', datetime('now'), datetime('now')),
('Testosterone', datetime('now'), datetime('now')),
('LH', datetime('now'), datetime('now')),
('FSH', datetime('now'), datetime('now')),
('DHEA-S', datetime('now'), datetime('now')),
('Cortisol', datetime('now'), datetime('now')),
('ACTH', datetime('now'), datetime('now')),
('Lipid Profile', datetime('now'), datetime('now')),
('Serum Insulin', datetime('now'), datetime('now'));

-- Seed Advice Templates
INSERT OR IGNORE INTO advice_templates (title, content, created_at, updated_at) VALUES 
('Diabetes Advice', '- Low carbohydrate diet
- Regular exercise
- Weight reduction
- Avoid sugary foods
- Monitor blood glucose regularly', datetime('now'), datetime('now')),
('Thyroid Advice', '- Take medicine on an empty stomach
- Take medication at the same time daily
- Follow-up thyroid function tests regularly', datetime('now'), datetime('now')),
('PCOS Advice', '- Weight management
- Regular exercise
- Healthy diet
- Adequate sleep', datetime('now'), datetime('now')),
('Obesity Advice', '- Calorie controlled diet
- Daily physical activity
- Weight monitoring', datetime('now'), datetime('now'));

-- Seed Followup Templates
INSERT OR IGNORE INTO followup_templates (title, value, created_at, updated_at) VALUES 
('2 Weeks', '2 Weeks', datetime('now'), datetime('now')),
('6 Weeks', '6 Weeks', datetime('now'), datetime('now')),
('3 Months', '3 Months', datetime('now'), datetime('now')),
('6 Months', '6 Months', datetime('now'), datetime('now')),
('12 Months', '12 Months', datetime('now'), datetime('now'));
