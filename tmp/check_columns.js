const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkColumns() {
    const { data, error } = await supabase.from('menu_items').select('*').limit(1);
    if (error) {
        console.error('Error fetching menu_items:', error);
    } else {
        console.log('Columns in menu_items:', Object.keys(data[0] || {}));
    }
}

checkColumns();
