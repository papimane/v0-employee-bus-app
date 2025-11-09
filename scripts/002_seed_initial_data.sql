-- Seed some initial bus stops
INSERT INTO bus_stops (name, address, pickup_time) VALUES
  ('Centre-ville', '123 Rue Principale', '07:30:00'),
  ('Zone industrielle', '456 Avenue du Commerce', '07:45:00'),
  ('Quartier résidentiel', '789 Boulevard des Érables', '08:00:00')
ON CONFLICT DO NOTHING;

-- Seed sample employees
INSERT INTO employees (name, email, department, bus_stop_id) VALUES
  ('Marie Dubois', 'marie.dubois@example.com', 'RH', 1),
  ('Jean Martin', 'jean.martin@example.com', 'IT', 2),
  ('Sophie Leroy', 'sophie.leroy@example.com', 'Finance', 1)
ON CONFLICT (email) DO NOTHING;
