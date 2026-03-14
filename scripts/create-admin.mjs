import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createAdmin() {
    console.log('Creating admin user...');
    
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@lkscale.ru',
        password: 'Admin123456!',
        email_confirm: true,
        user_metadata: { name: 'Главный Администратор' }
    });
    
    if (authError) {
        console.error('Auth error:', authError.message);
        return;
    }
    
    console.log('Admin created:', authData.user.id);
    
    // Create profile
    await supabase.from('users').upsert({
        id: authData.user.id,
        email: 'admin@lkscale.ru',
        name: 'Главный Администратор',
        phone: '+7 (999) 123-45-67',
        is_active: true
    });
    
    // Get admin role
    const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'admin').single();
    
    if (roleData) {
        await supabase.from('user_roles').insert({
            user_id: authData.user.id,
            role_id: roleData.id,
            assigned_by: authData.user.id
        });
    }
    
    console.log('Done!');
    console.log('Email: admin@lkscale.ru');
    console.log('Password: Admin123456!');
}

createAdmin();
