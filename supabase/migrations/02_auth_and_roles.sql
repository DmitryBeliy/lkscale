-- Auth and Roles System
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles viewable by all" ON roles FOR SELECT TO authenticated USING (true);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Insert roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Главный Администратор', '["all"]'::jsonb),
('manager', 'Менеджер', '["products:view","products:edit","orders:view","orders:edit","customers:view","customers:edit"]'::jsonb),
('seller', 'Продавец', '["products:view","orders:view","orders:create","customers:view"]'::jsonb),
('warehouse', 'Кладовщик', '["products:view","inventory:view","inventory:edit"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Auth system ready' as status;
