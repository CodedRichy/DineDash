const { createClient } = require('@supabase/supabase-js');

// These are your credentials from .env
const supabaseUrl = 'https://qdcwbmdbpepctwjdggkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3dibWRicGVwY3R3amRnZ2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTgyOTQsImV4cCI6MjA4ODM3NDI5NH0.hcYHomTfSsDCNSbrmLEyHMYAZ-haIXlQ35hPhjdxeJg';

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
    { email: 'consumer@dinedash.app', role: 'consumer' },
    { email: 'manager@dinedash.app', role: 'manager', restaurant_id: 'd2222222-2222-2222-2222-222222222222' },
    { email: 'rider@dinedash.app', role: 'delivery_partner' },
    { email: 'admin@dinedash.app', role: 'super_admin' }
];

async function seed() {
    console.log("Seeding test users via Auth API...");
    for (const user of testUsers) {
        console.log(`Creating ${user.email}...`);
        const { data: { user: createdUser }, error } = await supabase.auth.signUp({
            email: user.email,
            password: 'password123',
        });

        if (error) {
            if (error.message.includes('User already registered')) {
                console.log(`User ${user.email} already exists.`);
                // Even if they exist, let's try to update their role in profiles
                const { data: authUser } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: 'password123'
                });
                if (authUser?.user) {
                    console.log(`Updating profile for ${user.email}...`);
                    await supabase.from('profiles').update({
                        role: user.role,
                        managed_restaurant_id: user.restaurant_id || null
                    }).eq('id', authUser.user.id);
                }
            } else {
                console.error(`Error creating ${user.email}:`, error.message);
            }
        } else if (createdUser) {
            console.log(`Successfully created ${user.email}!`);
            // Update profile role (default is consumer)
            await supabase.from('profiles').update({
                role: user.role,
                managed_restaurant_id: user.restaurant_id || null
            }).eq('id', createdUser.id);
        }
    }
    console.log("Done!");
}

seed();
