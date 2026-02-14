/* ============================================
   Portfolio - Main JavaScript
   Animations, Particles, Form Validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimations();
    initNavbar();
    initMobileMenu();
    initContactForm();
    initFlashMessages();
    initTypingEffect();
});

/* --- Particle Background --- */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? '0, 240, 255' : '168, 85, 247';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    animate();
}

/* --- Scroll Animations (IntersectionObserver) --- */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Don't unobserve so re-entry works, but for performance:
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in, .stagger-children').forEach(el => {
        observer.observe(el);
    });
}

/* --- Navbar Scroll Effect --- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function onScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // Active section highlighting
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* --- Mobile Menu Toggle --- */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
}

/* --- Contact Form Validation --- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');
        let valid = true;

        // Clear previous errors
        [name, email, message].forEach(el => el.classList.remove('error'));

        if (!name.value.trim()) {
            name.classList.add('error');
            valid = false;
        }

        if (!email.value.trim() || !email.value.includes('@') || !email.value.includes('.')) {
            email.classList.add('error');
            valid = false;
        }

        if (!message.value.trim() || message.value.trim().length < 10) {
            message.classList.add('error');
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
            // Shake animation
            form.style.animation = 'none';
            requestAnimationFrame(() => {
                form.style.animation = 'shake 0.5s ease';
            });
        }
    });
}

/* --- Flash Messages Auto-dismiss --- */
function initFlashMessages() {
    const flashContainer = document.getElementById('flash-messages');
    if (!flashContainer) return;

    setTimeout(() => {
        flashContainer.style.transition = 'opacity 0.5s ease';
        flashContainer.style.opacity = '0';
        setTimeout(() => flashContainer.remove(), 500);
    }, 5000);
}

/* --- Typing Effect --- */
function initTypingEffect() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const text = el.getAttribute('data-text');
    el.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 40);
        }
    }

    // Start typing when hero section is visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setTimeout(type, 800);
            observer.disconnect();
        }
    });

    const heroSection = document.getElementById('hero');
    if (heroSection) observer.observe(heroSection);
}

/* --- Shake Animation (added via JS) --- */
const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
}`;

const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);
