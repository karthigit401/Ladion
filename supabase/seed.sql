-- =====================================================================
-- Ladion Services Platform — Seed data
-- Run after schema.sql. Safe to re-run (upserts on slug).
-- =====================================================================

insert into public.services (slug, name, short_description, detailed_description, capabilities, technology_areas, sort_order)
values
(
  'web-development',
  'Web Development',
  'Custom web platforms and applications built for production.',
  'End-to-end web application development, from architecture through to a deployed, maintained production system. Covers customer-facing platforms, internal tools, and APIs that other systems depend on.',
  '["Custom application development","API design and integration","Systems modernization","Performance and accessibility"]',
  '["React / Next.js","Node.js","PostgreSQL","REST & GraphQL APIs"]',
  1
),
(
  'mobile-app-development',
  'Mobile App Development',
  'Native and cross-platform mobile applications.',
  'Mobile applications for iOS and Android, built either natively or with a shared cross-platform codebase depending on the project''s performance and timeline requirements.',
  '["Cross-platform app development","Native iOS / Android modules","Offline-first architecture","App store release management"]',
  '["React Native","Swift","Kotlin","Push notifications"]',
  2
),
(
  'ai-machine-learning',
  'AI & Machine Learning',
  'Applied AI systems built into working products.',
  'Machine learning and data engineering applied where it measurably improves a system''s output — forecasting, computer vision, natural language processing, and intelligent automation.',
  '["Applied machine learning","Data pipeline engineering","Computer vision","Natural language processing"]',
  '["Python","PyTorch","Vector databases","MLOps pipelines"]',
  3
),
(
  'data-analytics',
  'Data Analytics',
  'Turning operational data into decisions.',
  'Data pipelines, warehousing, and analytics dashboards that give teams a reliable, current view of what is actually happening in the business.',
  '["Data pipeline design","Warehousing","Dashboarding and reporting","Data quality and governance"]',
  '["SQL / dbt","BI tooling","ETL pipelines","Data warehouses"]',
  4
),
(
  'cloud-devops',
  'Cloud & DevOps',
  'Cloud architecture, deployment, and infrastructure.',
  'Cloud architecture, migration, and infrastructure management, built around availability, security, and cost control rather than default configuration.',
  '["Cloud architecture and migration","CI/CD pipelines","Infrastructure as code","Monitoring and reliability"]',
  '["AWS / GCP / Azure","Docker & Kubernetes","Terraform","Observability tooling"]',
  5
),
(
  'cybersecurity',
  'Cybersecurity',
  'Security built in, not bolted on.',
  'Security review, hardening, and architecture work for systems where a breach carries real operational or reputational cost.',
  '["Security architecture review","Access control design","Vulnerability assessment","Secure development practices"]',
  '["OWASP practices","IAM / RBAC","Encryption at rest & in transit","Audit logging"]',
  6
),
(
  'iot-solutions',
  'IoT Solutions',
  'Software for connected devices and sensor networks.',
  'Software layers that interface directly with hardware, sensors, and embedded devices, from data ingestion through to operational dashboards.',
  '["Device connectivity","Sensor data ingestion","Edge processing","Fleet monitoring dashboards"]',
  '["MQTT","Embedded interfaces","Time-series databases","Edge compute"]',
  7
),
(
  'blockchain-development',
  'Blockchain Development',
  'Distributed ledger systems for specific, defined use cases.',
  'Blockchain and smart contract development scoped to problems that genuinely benefit from a distributed ledger, rather than applied by default.',
  '["Smart contract development","Ledger architecture","Wallet integration","Auditability tooling"]',
  '["Solidity","EVM-compatible chains","Smart contract testing"]',
  8
),
(
  'defense-aerospace-solutions',
  'Defense & Aerospace Solutions',
  'Mission-critical technology for defence and aerospace environments.',
  'Software and systems where correctness, security, and long service life are the baseline requirement — mission-critical platforms, simulation, and communication systems.',
  '["Mission-critical software","Simulation and modeling","Communication systems","Compliance-aware engineering"]',
  '["Real-time systems","Secure communications","Simulation environments"]',
  9
)
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  detailed_description = excluded.detailed_description,
  capabilities = excluded.capabilities,
  technology_areas = excluded.technology_areas,
  sort_order = excluded.sort_order;

-- =====================================================================
-- Making yourself an admin (do this AFTER registering an account in the app):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- =====================================================================
