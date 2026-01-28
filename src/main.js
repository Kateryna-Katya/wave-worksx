// Initialize Lucide icons
lucide.createIcons();

// Initialize Lenis Smooth Scroll
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});

// Глобальная анимация появления (GSAP)
gsap.from('.nav > *', {
    y: -20,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power4.out"
});

gsap.from('.footer__grid > *', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 80%'
    },
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.2
});
/* ==========================================================================
   HERO THREE.JS ANIMATION
   ========================================================================== */

   function initHeroAnimation() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;

    let scene, camera, renderer, particles;
    let count = 0;

    // Basic Setup
    scene = new THREE.Scene();
    // Немного тумана для глубины, цвет фона
    scene.fog = new THREE.FogExp2(0x0D0D0D, 0.0015);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 400; // Приподнимем камеру, чтобы смотреть на волну сверху вниз

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1); // Оптимизация для ретины
    container.appendChild(renderer.domElement);

    // Create Geometry (Wave of Particles)
    const SEPARATION = 60;
    const AMOUNTX = 100; // Количество частиц по X
    const AMOUNTY = 50;  // Количество частиц по Y
    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
            positions[i + 1] = 0; // y (будет меняться в анимации)
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
            scales[j] = 1;
            i += 3;
            j++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Material (Неоновые точки)
    const material = new THREE.PointsMaterial({
        color: 0xFF4D00, // Наш акцентный цвет
        size: 4, // Размер точек
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Режим наложения для свечения
        fog: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const positions = particles.geometry.attributes.position.array;
        let i = 0;
        count += 0.03; // Скорость волны

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // Синусоидальное движение для создания волны
                positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                                   (Math.sin((iy + count) * 0.5) * 50);
                i += 3;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Плавное вращение всей сцены
        camera.position.x += ( - 50 - camera.position.x ) * .05;
        camera.lookAt( scene.position );

        renderer.render(scene, camera);
    }

    // Handle Resize
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate();

    // GSAP Text Reveal (Анимация появления текста поверх волны)
    gsap.from('.hero__content > *', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5
    });
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', initHeroAnimation);
// В начало script.js (после импорта, если используешь CDN)
// Или просто подключи AOS через CDN в index.html:
// <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
// <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация AOS
  if (typeof AOS !== 'undefined') {
      AOS.init({
          duration: 1000,
          once: true,
          offset: 100
      });
  }

  // Обновляем иконки Lucide для новых элементов
  lucide.createIcons();
});
/* ==========================================================================
   FORM LOGIC (ЭТАП 4)
   ========================================================================== */

   function initFormLogic() {
    const form = document.getElementById('main-form');
    const phoneInput = document.getElementById('phone-input');
    const captchaLabel = document.getElementById('captcha-label');
    const captchaInput = document.getElementById('captcha-input');
    const successMsg = document.getElementById('form-success');

    // 1. Генерация капчи
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    if(captchaLabel) captchaLabel.innerText = `Решите пример: ${num1} + ${num2} = ?`;

    // 2. Валидация телефона (только цифры)
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // 3. Обработка отправки (Имитация AJAX)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Проверка капчи
        if (parseInt(captchaInput.value) !== correctAnswer) {
            alert('Неверный ответ капчи. Попробуйте снова.');
            return;
        }

        // Имитация загрузки
        const btn = form.querySelector('.form__btn');
        const originalText = btn.innerText;
        btn.innerText = 'Отправка...';
        btn.disabled = true;

        setTimeout(() => {
            // "Успешный" ответ от сервера
            form.reset();
            btn.innerText = originalText;
            btn.disabled = false;

            // Показываем сообщение об успехе
            successMsg.style.display = 'flex';

            // Обновляем капчу для следующего раза
            initFormLogic();

            // Скрываем сообщение через 5 секунд
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

document.addEventListener('DOMContentLoaded', initFormLogic);