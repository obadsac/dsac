// --- SUPABASE CONFIGURATION ---
// Unga File 2-la iruntha original Supabase URL & Key inga podunga
const supabaseUrl = 'https://nraqhwfobchmvjnbkhfd.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Replace with your actual anon key
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- FORM SUBMISSION LOGIC ---
document.getElementById('btnSubmit').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btnSubmit');
    const originalBtnText = btn.innerHTML;
    
    // Title, Date, Time validation
    const title = document.getElementById('evTitle').value;
    const date = document.getElementById('evDate').value;
    const time = document.getElementById('evTime').value;

    if(!title || !date || !time) {
         Swal.fire({
             title: 'Missing Fields', 
             text: 'Title, Date, and Time are mandatory!', 
             icon: 'warning',
             customClass: { popup: 'rounded-3xl' }
         });
         return;
    }

    // Loading State UI
    btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2 text-indigo-400"></i> Publishing...`;
    btn.disabled = true;

    const postType = document.getElementById('postType').value;
    const isPaid = document.getElementById('evType').value === 'Paid';
    const priceVal = document.getElementById('evPrice').value;

    // Poll Options Format Panrathu (JSON)
    let pollOptionsVal = null;
    if (postType === 'Poll') {
        const rawOptions = document.getElementById('evPollOptions').value;
        if(rawOptions) {
            const optArray = rawOptions.split(',').map(s => s.trim()).filter(s => s);
            pollOptionsVal = JSON.stringify(optArray);
        } else {
            Swal.fire('Error', 'Poll options are required for a Poll!', 'error');
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            return;
        }
    }

    // Database Record Structure
    const newEvent = {
        title: title,
        event_date: `${date} ${time}:00`, 
        location: postType === 'Poll' ? '' : document.getElementById('evLocation').value,
        description: document.getElementById('evDesc').value,
        visibility: document.getElementById('evVisibility').value,
        is_paid: postType === 'Poll' ? false : isPaid,
        fee_amount: postType === 'Poll' ? "0" : (isPaid ? priceVal : "0"),
        type: postType,
        poll_options: pollOptionsVal
    };

    try {
        // Send to Supabase 'events' table
        const { error } = await supabaseClient.from('events').insert([newEvent]);
        if (error) throw error;
        
        // Success Alert
        Swal.fire({
            title: 'Success!', 
            text: `${postType} published to the board successfully.`, 
            icon: 'success',
            confirmButtonColor: '#0f172a',
            customClass: { popup: 'rounded-3xl' }
        });
        
        // Reset the form and UI fields
        document.getElementById('eventForm').reset();
        togglePostFields(); 
        
        // Optional: Admin-a Overview tab-kku auto-switch panrathu
        switchTab('overview'); 
        
    } catch (err) {
        console.error("Supabase Error: ", err);
        Swal.fire('Error', 'Could not save data to Supabase. Check console.', 'error');
    } finally {
        // Reset button state
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
});