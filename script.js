// ── Custom Cursor ──────────────────────────────────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.left = mouseX + 'px';
    cursorGlow.style.top = mouseY + 'px';
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

// Smooth ring following
function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// Expand ring on hoverable elements
document.querySelectorAll('a, button, .btn, .glass-card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.style.width = '60px';
        cursorRing.style.height = '60px';
        cursorRing.style.borderColor = 'rgba(0,240,255,1)';
        cursorDot.style.transform = 'translate(-50%,-50%) scale(0)';
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
        cursorRing.style.borderColor = 'rgba(0,240,255,0.6)';
        cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
    });
});

// ── Particle Canvas ─────────────────────────────────────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COUNT = 80;
const particles = [];

class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = -(Math.random() * 0.6 + 0.2);
        this.opacity = Math.random() * 0.6 + 0.1;
        this.color = Math.random() > 0.5 ? '0,240,255' : '112,0,255';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.001;
        if (this.y < -10 || this.opacity <= 0) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
        ctx.fill();
    }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Draw faint connecting lines between nearby particles
function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0,240,255,${0.06 * (1 - dist / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ── Navbar ──────────────────────────────────────────────────────────────────
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li a');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

navLinksItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Active link on scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - section.clientHeight / 3) {
            current = section.getAttribute('id');
        }
    });
    navLinksItems.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href').substring(1) === current) a.classList.add('active');
    });
});

// ── Scroll Reveal ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Stagger siblings
            const siblings = entry.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-right');
            let delay = 0;
            siblings.forEach((sib, idx) => {
                if (sib === entry.target) delay = idx * 120;
            });
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            revealObserver.unobserve(entry.target);

            // Animate skill bars if inside this element
            entry.target.querySelectorAll('.skill-bar').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// Animate timeline lines when visible
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.timeline').forEach(t => timelineObserver.observe(t));

// ── Typing Effect ────────────────────────────────────────────────────────────
const typingText = document.querySelector('.typing-text');
const phrases = ['Web Developer', 'UI/UX Designer', 'IT Customer Support', 'BSc.IT Student'];
let phraseIndex = 0, letterIndex = 0, isDeleting = false;

function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingText.textContent = currentPhrase.substring(0, --letterIndex);
    } else {
        typingText.textContent = currentPhrase.substring(0, ++letterIndex);
    }

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && letterIndex === currentPhrase.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 500;
    }

    setTimeout(typeLoop, speed);
}
setTimeout(typeLoop, 1000);

// ── 3D Tilt on Glass Cards ────────────────────────────────────────────────────
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = -(y / rect.height) * 8;
        const rotateY = (x / rect.width) * 8;
        card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease, border-color 0.35s, box-shadow 0.35s';
    });
});

// ── Contact Form – Save to localStorage ──────────────────────────────────────
const STORAGE_KEY = 'rup_portfolio_submissions';

function getSubmissions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveSubmission(data) {
    const all = getSubmissions();
    all.unshift(data); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function deleteSubmission(id) {
    const all = getSubmissions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    renderAdminTable();
}

const form = document.querySelector('.contact-form');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        if (!name || !email || !message) return;

        const btn = form.querySelector('.submit-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        // Send via EmailJS with 15s timeout
        const timeoutId = setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Timeout. Try Again.';
            btn.style.background = 'linear-gradient(135deg, #ff3d00, #ff6d00)';
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                btn.style.background = '';
            }, 3000);
        }, 15000);

        emailjs.send('service_3inlnyu', 'template_3euqgtr', {
            name: name,
            email: email,
            phone: phone || 'Not provided',
            message: message,
            title: 'Portfolio Contact Form'
        })
            .then(() => {
                clearTimeout(timeoutId);
                saveSubmission({ id: Date.now(), name, email, phone: phone || 'N/A', message, date: new Date().toLocaleString() });
                btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                btn.style.background = 'linear-gradient(135deg, #00c853, #00e676)';
                btn.disabled = false;
                form.reset();
                setTimeout(() => {
                    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                    btn.style.background = '';
                }, 3000);
            })
            .catch(err => {
                clearTimeout(timeoutId);
                console.error('EmailJS error:', err);
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed. Try Again.';
                btn.style.background = 'linear-gradient(135deg, #ff3d00, #ff6d00)';
                btn.disabled = false;
                setTimeout(() => {
                    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                    btn.style.background = '';
                }, 3000);
            });
    });
}

// ── Secret Admin Panel (click logo 5×) ───────────────────────────────────────
let logoClicks = 0, logoTimer;
const logo = document.querySelector('.logo');

logo.addEventListener('click', e => {
    e.preventDefault();
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
    if (logoClicks >= 5) {
        logoClicks = 0;
        openAdminPanel();
    }
});

function openAdminPanel() {
    let panel = document.getElementById('admin-panel');
    if (!panel) {
        panel = buildAdminPanel();
        document.body.appendChild(panel);
    }
    panel.classList.add('open');
    renderAdminTable();
    document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
        panel.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function buildAdminPanel() {
    const overlay = document.createElement('div');
    overlay.id = 'admin-panel';
    overlay.innerHTML = `
      <div class="admin-backdrop" onclick="closeAdminPanel()"></div>
      <div class="admin-modal">
        <div class="admin-header">
          <div class="admin-title">
            <i class="fas fa-user-shield"></i>
            <div>
              <h2>Admin Panel</h2>
              <p>Contact Form Submissions</p>
            </div>
          </div>
          <button class="admin-close" onclick="closeAdminPanel()"><i class="fas fa-times"></i></button>
        </div>
        <div class="admin-stats" id="admin-stats"></div>
        <div class="admin-body" id="admin-table-wrap"></div>
        <div class="admin-footer">
          <button class="admin-clear-btn" onclick="clearAllSubmissions()">
            <i class="fas fa-trash-alt"></i> Clear All
          </button>
          <button class="admin-export-btn" onclick="exportCSV()">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
        </div>
      </div>
    `;
    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAdminPanel();
    });
    return overlay;
}

function renderAdminTable() {
    const wrap = document.getElementById('admin-table-wrap');
    const stats = document.getElementById('admin-stats');
    const data = getSubmissions();

    stats.innerHTML = `
      <div class="stat-card"><span>${data.length}</span><p>Total Messages</p></div>
      <div class="stat-card"><span>${new Set(data.map(d => d.email)).size}</span><p>Unique Users</p></div>
      <div class="stat-card"><span>${data.length > 0 ? data[0].date.split(',')[0] : '—'}</span><p>Latest Message</p></div>
    `;

    if (data.length === 0) {
        wrap.innerHTML = `
          <div class="admin-empty">
            <i class="fas fa-inbox"></i>
            <p>No submissions yet.<br>Share your portfolio and wait for messages!</p>
          </div>`;
        return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((s, i) => `
            <tr>
              <td class="row-num">${data.length - i}</td>
              <td><strong>${escHtml(s.name)}</strong></td>
              <td><a href="mailto:${escHtml(s.email)}" class="admin-email">${escHtml(s.email)}</a></td>
              <td class="msg-cell" title="${escHtml(s.message)}">${escHtml(s.message)}</td>
              <td class="date-cell">${escHtml(s.date)}</td>
              <td><button class="del-btn" onclick="deleteSubmission(${s.id})"><i class="fas fa-trash"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
}

function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function clearAllSubmissions() {
    if (confirm('Delete ALL submissions? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        renderAdminTable();
    }
}

function exportCSV() {
    const data = getSubmissions();
    if (!data.length) return;
    const header = ['#', 'Name', 'Email', 'Message', 'Date'];
    const rows = data.map((s, i) => [
        data.length - i, `"${s.name}"`, `"${s.email}"`, `"${s.message.replace(/"/g, '""')}"`, `"${s.date}"`
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'submissions.csv'; a.click();
    URL.revokeObjectURL(url);
}
