document.addEventListener('DOMContentLoaded', () => {
    
    // Handle Form Submission
    const repairForm = document.getElementById('repairForm');
    
    repairForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // In a real app, you would send this data to a backend API
        alert('Thank you! Your booking request has been sent. A technician will contact you shortly.');
        repairForm.reset();
    });

    // Smooth Scrolling for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.style.background = '#000';
            nav.style.padding = '0.5rem 5%';
        } else {
            nav.style.background = 'rgba(0,0,0,0.9)';
            nav.style.padding = '1rem 5%';
        }
    });
});
// ADD TO SCRIPT.JS

// Starts the specific Roadside Rescue branch
function startRescueFlow() {
    // Hides the main homepage content
    document.getElementById('home-view').classList.add('hidden');
    // Shows the rescue flow branch
    document.getElementById('rescue-view').classList.remove('hidden');
    window.scrollTo(0,0);
}

let selectedRescueIssue = "";

function selectIssue(btn) {
    // Deselect others and highlight current
    document.querySelectorAll('.issue-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRescueIssue = btn.innerText;
}

function goToPayment() {
    if (!selectedRescueIssue) {
        alert("Please select an issue type to continue.");
        return;
    }
    // Transition to OPay Page
    document.getElementById('step-1-issue').classList.add('hidden');
    document.getElementById('step-2-payment').classList.remove('hidden');
}

function simulateSuccess() {
    // Mimics the moment OPay confirms the ₦15,000.00 payment
    document.getElementById('step-2-payment').classList.add('hidden');
    document.getElementById('step-3-details').classList.remove('hidden');
}

function showFinalMessage() {
    const brand = document.getElementById('carBrand').value;
    const loc = document.getElementById('locationDesc').value;
    
    if (!brand || !loc) {
        alert("Please provide your car brand and location so we can find you!");
        return;
    }
    
    // Shows the final emergency priority popup
    document.getElementById('finalPopup').classList.remove('hidden');
}
function goToStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

    // If requesting the main site, scroll to top
    if (stepId === 'main-site') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Show the target step (if present)
    const target = document.getElementById(stepId);
    if (target) target.classList.add('active');

    // If we go to processing, auto-move to success after 3 seconds
    if (stepId === 'processing') {
      setTimeout(() => {
        goToStep('success');
      }, 3000); // 3 seconds delay
    }
  }

// safe binding if element exists
const _btnPrimaryEl = document.getElementById("btn-primary");
if (_btnPrimaryEl) {
    _btnPrimaryEl.addEventListener("click", function(){ window.location.href = "rescue.html"; });
}

let billingPeriod = 'monthly';
let selectedPlan = null;

function openSubscription(preselect) {
    selectedPlan = preselect || null;
    billingPeriod = 'monthly';
    const grid = document.getElementById('plans-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const plans = [
        { id: 'Basic', monthly: 9, yearly: 90, features: ['Basic checks','Priority chat'] },
        { id: 'Standard', monthly: 19, yearly: 190, features: ['Oil change','Diagnostics'] },
        { id: 'Premium', monthly: 39, yearly: 390, features: ['All maintenance','Priority dispatch'] },
        { id: 'Ultimate', monthly: 79, yearly: 790, features: ['All services','Home pickup'] },
    ];
    plans.forEach(p => {
        const card = document.createElement('div');
        card.className = 'plan-card' + (selectedPlan === p.id ? ' selected' : '');
        card.id = 'plan-' + p.id;
        card.innerHTML = `<h3>${p.id}</h3><p class="price">$${billingPeriod==='monthly'?p.monthly:p.yearly}${billingPeriod==='monthly'?'/mo':'/yr'}</p><p style="font-size:0.9rem;color:#bbb;">${p.features.join(' • ')}</p><div style="margin-top:12px;"><button class="btn-primary" onclick="selectPlanCard('${p.id}')">Select</button></div>`;
        grid.appendChild(card);
    });
    // preselect if provided
    if (selectedPlan) selectPlanCard(selectedPlan);
    goToStep('select-plan');
}

function toggleBilling(checked) {
    billingPeriod = checked ? 'yearly' : 'monthly';
    // update displayed prices
    document.querySelectorAll('.plan-card').forEach(card => {
        const id = card.id.replace('plan-','');
        const planData = { Basic: [9,90], Standard: [19,190], Premium: [39,390], Ultimate: [79,790] };
        const vals = planData[id];
        if (vals) card.querySelector('.price').innerText = `$${checked?vals[1]:vals[0]}${checked?'/yr':'/mo'}`;
    });
}

function selectPlanCard(id) {
    selectedPlan = id;
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    const sel = document.getElementById('plan-' + id);
    if (sel) sel.classList.add('selected');
}

function proceedToPaymentFromPlan() {
    if (!selectedPlan) { alert('Please select a plan first.'); return; }
    // show selected plan summary on pay page
    const summary = document.getElementById('selected-plan-summary');
    if (summary) summary.innerHTML = `<strong>Plan:</strong> ${selectedPlan} — <em>${billingPeriod}</em>`;
    goToStep('pay');
}

let currentLocation = null;

function requestLocation() {
    const info = document.getElementById('location-info');
    if (!navigator.geolocation) {
        if (info) info.innerText = 'Geolocation not supported by your browser.';
        return;
    }
    if (info) info.innerText = 'Requesting location...';
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        currentLocation = { lat, lon };
        if (info) info.innerText = `Coordinates: ${lat}, ${lon}`;
        // try reverse geocode (OpenStreetMap Nominatim)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.display_name && info) info.innerText = `Location: ${data.display_name}`;
            }
        } catch (e) {
            // ignore reverse geocode failure
        }
    }, (err) => {
        if (info) info.innerText = 'Unable to retrieve location. Please enable location permissions.';
    }, { enableHighAccuracy: true, timeout: 10000 });
}

function submitPayment() {
    const problem = document.getElementById('problem-desc').value || 'No description provided';
    const summary = document.getElementById('selected-plan-summary').innerText || '';
    const location = currentLocation ? `${currentLocation.lat}, ${currentLocation.lon}` : 'Location not provided';
    // Simple validation
    if (location === 'Location not provided') {
        if (!confirm('You have not provided a location. Continue without precise location?')) return;
    }
    // simulate processing
    goToStep('processing');
    setTimeout(() => {
        const successMsg = document.getElementById('success-msg');
        if (successMsg) successMsg.innerText = `Help is on the way. ${summary} ${problem ? 'Issue: ' + problem + '.' : ''} We will use the provided location: ${location}.`;
        goToStep('success');
    }, 2200);
}

function submitSignIn() {
    const email = document.getElementById('signin-email').value;
    const pass = document.getElementById('signin-pass').value;
    if (!email || !pass) {
        alert('Please provide email and password.');
        return;
    }
    alert('Signed in as ' + email + '. You can now book services.');
    const box = document.getElementById('signin');
    if (box) box.style.display = 'none';
    const form = document.getElementById('repairForm');
    if (form) form.scrollIntoView({behavior:'smooth'});
}
