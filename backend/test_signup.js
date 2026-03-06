const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qdcwbmdbpepctwjdggkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3dibWRicGVwY3R3amRnZ2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTgyOTQsImV4cCI6MjA4ODM3NDI5NH0.hcYHomTfSsDCNSbrmLEyHMYAZ-haIXlQ35hPhjdxeJg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignUp() {
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    console.log(`Attempting to sign up with: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123',
    });

    if (error) {
        console.error('Signup Error:', error.message);
        if (error.details) console.error('Details:', error.details);
    } else {
        console.log('Signup Successful!', data.user.id);
    }
}

testSignUp();
