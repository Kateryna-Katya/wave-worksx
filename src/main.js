/**
 * WAVE-WORKSX.BLOG - Full Script Logic
 * Libraries: Three.js, GSAP, Lenis, AOS, Lucide
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. ИНИЦИАЛИЗАЦИЯ ИКОНОК
  if (typeof lucide !== 'undefined') {
      lucide.createIcons();
  }

  // 2. ПЛАВНЫЙ СКРОЛЛ (LENIS.JS)
  const initLenis = () => {
      const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true
      });

      function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
  };
  initLenis();

  // 3. ЭФФЕКТЫ ХЕДЕРА ПРИ СКРОЛЛЕ
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
          header.classList.add('header--scrolled');
      } else {
          header.classList.remove('header--scrolled');
      }
  });

  // 4. МОБИЛЬНОЕ МЕНЮ
  const initMobileMenu = () => {
      const burger = document.querySelector('.burger');
      const mobileMenu = document.getElementById('mobileMenu');
      const menuLinks = document.querySelectorAll('.mobile-menu__link');

      const toggleMenu = () => {
          burger.classList.toggle('is-active');
          mobileMenu.classList.toggle('is-active');
          document.body.style.overflow = mobileMenu.classList.contains('is-active') ? 'hidden' : '';
      };

      if (burger) {
          burger.addEventListener('click', toggleMenu);
      }

      menuLinks.forEach(link => {
          link.addEventListener('click', () => {
              if (mobileMenu.classList.contains('is-active')) toggleMenu();
          });
      });
  };
  initMobileMenu();

  // 5. THREE.JS HERO ANIMATION (ЦИФРОВАЯ ВОЛНА)
  const initHeroAnimation = () => {
      const container = document.getElementById('hero-canvas-container');
      if (!container || typeof THREE === 'undefined') return;

      let scene, camera, renderer, particles, count = 0;
      const AMOUNTX = 100, AMOUNTY = 55, SEPARATION = 65;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0D0D0D, 0.0012);

      camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
      camera.position.z = 1000;
      camera.position.y = 450;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const numParticles = AMOUNTX * AMOUNTY;
      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);

      let i = 0, j = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
              positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
              positions[i + 1] = 0;
              positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
              scales[j] = 1;
              i += 3; j++;
          }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      const material = new THREE.PointsMaterial({
          color: 0xFF4D00,
          size: 3,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      function animate() {
          requestAnimationFrame(animate);
          const pos = particles.geometry.attributes.position.array;
          let i = 0;
          count += 0.03;

          for (let ix = 0; ix < AMOUNTX; ix++) {
              for (let iy = 0; iy < AMOUNTY; iy++) {
                  pos[i + 1] = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
                  i += 3;
              }
          }
          particles.geometry.attributes.position.needsUpdate = true;
          camera.position.x += ( -200 - camera.position.x ) * .02;
          camera.lookAt(scene.position);
          renderer.render(scene, camera);
      }

      window.addEventListener('resize', () => {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
      });

      animate();

      // Появление текста Hero через GSAP
      gsap.from('.hero__content > *', {
          y: 60,
          opacity: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: "power4.out",
          delay: 0.3
      });
  };
  initHeroAnimation();

  // 6. ЛОГИКА ФОРМЫ (ВАЛИДАЦИЯ И КАПЧА)
  const initForm = () => {
      const form = document.getElementById('main-form');
      if (!form) return;

      const phoneInput = document.getElementById('phone-input');
      const captchaLabel = document.getElementById('captcha-label');
      const captchaInput = document.getElementById('captcha-input');
      const successMsg = document.getElementById('form-success');

      // Генерация примера
      let n1 = Math.floor(Math.random() * 9) + 1;
      let n2 = Math.floor(Math.random() * 9) + 1;
      let answer = n1 + n2;
      if(captchaLabel) captchaLabel.innerText = `Решите пример: ${n1} + ${n2} = ?`;

      // Только цифры в телефоне
      phoneInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });

      form.addEventListener('submit', (e) => {
          e.preventDefault();

          if (parseInt(captchaInput.value) !== answer) {
              alert('Ошибка в капче! Попробуйте снова.');
              return;
          }

          const btn = form.querySelector('.form__btn');
          btn.disabled = true;
          btn.innerText = 'Отправка...';

          // Имитация AJAX
          setTimeout(() => {
              form.reset();
              btn.disabled = false;
              btn.innerText = 'Запросить доступ';
              successMsg.style.display = 'flex';

              // Сброс капчи
              n1 = Math.floor(Math.random() * 9) + 1;
              n2 = Math.floor(Math.random() * 9) + 1;
              answer = n1 + n2;
              captchaLabel.innerText = `Решите пример: ${n1} + ${n2} = ?`;

              setTimeout(() => { successMsg.style.display = 'none'; }, 5000);
          }, 1800);
      });
  };
  initForm();

  // 7. COOKIE POPUP
  const initCookies = () => {
      const popup = document.getElementById('cookie-popup');
      const btn = document.getElementById('accept-cookies');

      if (popup && !localStorage.getItem('wave_cookies_accepted')) {
          setTimeout(() => { popup.style.display = 'block'; }, 2500);
      }

      if (btn) {
          btn.addEventListener('click', () => {
              localStorage.setItem('wave_cookies_accepted', 'true');
              popup.style.display = 'none';
          });
      }
  };
  initCookies();

  // 8. ИНИЦИАЛИЗАЦИЯ AOS (Scroll Animations)
  if (typeof AOS !== 'undefined') {
      AOS.init({
          duration: 800,
          easing: 'ease-out-cubic',
          once: true,
          offset: 50
      });
  }

});