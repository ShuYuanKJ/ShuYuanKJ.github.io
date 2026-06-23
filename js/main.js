/* ============================================
   AI数据技术服务商 - 企业官网交互脚本（已修复语法错误）
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Dynamic Year ----------
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ---------- Navbar Scroll Effect ----------
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ---------- Mobile Menu Toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // ---------- Active Nav Link ----------
  const currentPath = window.location.pathname;
  const navAnchors = document.querySelectorAll('.nav-links a');
  navAnchors.forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
      a.classList.add('active');
    } else if (href && currentPath.includes(href.replace('./', '').replace('.html', ''))) {
      a.classList.add('active');
    }
  });

  // ---------- Scroll Reveal Animation ----------
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });

  // ---------- Hero Parallax ----------
  const heroBg = document.querySelector('.hero-bg-img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    });
  }

  // ---------- Contact Form Submit with validation ----------
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Form validation
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const phone = contactForm.querySelector('#phone');
      const company = contactForm.querySelector('#company');
      const service = contactForm.querySelector('#service');
      const message = contactForm.querySelector('#message');
      let isValid = true;

      // Remove previous error styles
      contactForm.querySelectorAll('.form-error').forEach(el => el.remove());
      contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      if (!name.value.trim()) {
        showError(name, '请填写您的姓名');
        isValid = false;
      }

      if (!phone.value.trim() && !email.value.trim()) {
        if (!email.value.trim()) showError(email, '请填写邮箱或电话');
        if (!phone.value.trim()) showError(phone, '请填写电话或邮箱');
        isValid = false;
      }

      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, '邮箱格式不正确');
        isValid = false;
      }

      if (phone.value.trim() && !/^[\d\-+() ]{7,15}$/.test(phone.value.trim())) {
        showError(phone, '电话格式不正确');
        isValid = false;
      }

      if (!service.value) {
        showError(service, '请选择服务类型');
        isValid = false;
      }

      if (!message.value.trim()) {
        showError(message, '请填写项目需求描述');
        isValid = false;
      }

      if (!isValid) return;

      const btn = contactForm.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = '提交中...';
      btn.disabled = true;

      // Simulate submission
      setTimeout(() => {
        btn.textContent = '✓ 已提交，我们会尽快联系您';
        btn.style.background = '#1a8fbf';
        contactForm.reset();

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1000);
    });
  }

  function showError(element, message) {
    element.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 4px;';
    errorDiv.textContent = message;
    element.parentNode.appendChild(errorDiv);
  }

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- Full-screen Particle System ----------
  const particleCanvas = document.querySelector('.hero-particles');
  if (particleCanvas) {
    initFullScreenParticles(particleCanvas);
  }

});

// ============================================
// Full-Screen Particle System (星空下落特效)
// ============================================
function initFullScreenParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const maxParticles = 180;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // Star / sparkle colors
  const colors = [
    'rgba(108, 212, 232,',  // soft-cyan
    'rgba(61, 184, 216,',   // light-cyan
    'rgba(26, 143, 191,',   // accent
    'rgba(160, 184, 204,',  // text-secondary
    'rgba(255, 255, 255,',  // white sparkle
  ];

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20;
      // 不同粒子不同大小：小亮点 + 中等光点 + 大光晕
      const type = Math.random();
      if (type < 0.7) {
        this.size = Math.random() * 1.5 + 0.3;  // 小粒子（星星）
        this.opacity = Math.random() * 0.5 + 0.15;
        this.speedY = Math.random() * 0.8 + 0.3;
      } else if (type < 0.9) {
        this.size = Math.random() * 2.5 + 1.5;  // 中等光点
        this.opacity = Math.random() * 0.3 + 0.1;
        this.speedY = Math.random() * 0.5 + 0.15;
      } else {
        this.size = Math.random() * 4 + 3;      // 大光晕
        this.opacity = Math.random() * 0.12 + 0.03;
        this.speedY = Math.random() * 0.25 + 0.08;
      }
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.colorIndex = Math.floor(Math.random() * colors.length);
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.twinkle += this.twinkleSpeed;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
        this.y = -20;
      }
    }

    draw() {
      const alpha = this.opacity * (0.7 + 0.3 * Math.sin(this.twinkle));
      const color = colors[this.colorIndex] + alpha + ')';

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = color;

      // 大粒子加光晕
      if (this.size > 2.5) {
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = colors[this.colorIndex].replace('rgba', 'rgb').replace(',', ')').replace(/[\d.]+\)$/, '') + alpha * 0.5 + ')';
      }

      ctx.fill();

      // 重置shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  }

  function initParticlesArray() {
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    particles = [];
    initParticlesArray();
  });

  resize();
  initParticlesArray();
  animate();
}

// ---------- Counter animation ----------
function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * ease);
    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

// Initialize counters when they become visible
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counter = entry.target;
      const target = parseInt(counter.getAttribute('data-target'));
      if (target) {
        animateCounter(counter, target);
        counterObserver.unobserve(counter);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => {
  counterObserver.observe(el);
});
