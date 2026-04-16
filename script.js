// Flamingo Tabacaria - Lógica de Modais e Interações

// 1. Verificação de Idade e Fluxo de Entrada
function setupModals() {
    const ageModal = document.getElementById('age-modal');
    const reviewModal = document.getElementById('review-modal');
    const wheelModal = document.getElementById('wheel-modal');
    
    const yesAgeBtn = document.getElementById('yes-btn');
    const noAgeBtn = document.getElementById('no-btn');
    
    const yesReviewBtn = document.getElementById('review-yes-btn');
    const noReviewBtn = document.getElementById('review-no-btn');
    
    const accessDenied = document.getElementById('access-denied');

    if (!ageModal || !yesAgeBtn) return;

    // Fluxo Padrão: Sempre mostrar Verificação de Idade ao carregar a página
    ageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Clique Sim Idade
    yesAgeBtn.onclick = function() {
        ageModal.style.opacity = '0';
        setTimeout(() => {
            ageModal.style.display = 'none';
            // Mostra convite de avaliação se não jogou a roleta hoje
            if (!localStorage.getItem('flamingo_wheel_played')) {
                if (reviewModal) {
                    reviewModal.style.display = 'flex';
                    reviewModal.style.opacity = '1';
                }
            } else {
                document.body.style.overflow = 'auto';
            }
        }, 300);
    };

    // Clique Não Idade
    noAgeBtn.onclick = function() {
        ageModal.style.display = 'none';
        if (accessDenied) accessDenied.style.display = 'flex';
    };

    // Clique Sim Avaliação
    if (yesReviewBtn) {
        yesReviewBtn.onclick = function() {
            const googleReviewUrl = "https://www.google.com/search?q=flamingo+tabacaria&oq=flamin&gs_lcrp=EgZjaHJvbWUqBggCEEUYOzIGCAAQRRg8MgYIARBFGDkyBggCEEUYOzIGCAMQRRg7MgYIBBBFGDsyBggFEEUYPdIBCDM1ODRqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8#lrd=0x935a38e7e15e3dbf:0xf50a269ab85932ed,3,,,,";
            
            // Marca que a roleta está liberada
            localStorage.setItem('flamingo_pending_spin', 'true');
            
            // Abre o Google em nova aba
            window.open(googleReviewUrl, '_blank');
            
            // Fecha o convite e abre a roleta
            reviewModal.style.display = 'none';
            setTimeout(setupPrizeWheel, 1000);
        };
    }

    // Clique Não Avaliação
    if (noReviewBtn) {
        noReviewBtn.onclick = function() {
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Libera o site sem roleta
        };
    }
}

// 2. Lógica da Roleta de Prêmios
function setupPrizeWheel() {
    const wheelModal = document.getElementById('wheel-modal');
    const canvas = document.getElementById('prize-wheel');
    const spinBtn = document.getElementById('spin-btn');
    const closeBtn = document.getElementById('close-wheel');
    const resultDiv = document.getElementById('wheel-result');
    const prizeText = document.getElementById('prize-text');

    if (!wheelModal || !canvas || !spinBtn) return;

    wheelModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const ctx = canvas.getContext('2d');
    const prizes = [
        { text: "5% OFF", color: "#1a1a1a" },
        { text: "10% OFF", color: "#ff6b1a" },
        { text: "Brinde", color: "#1a1a1a" },
        { text: "15% OFF", color: "#ff007f" },
        { text: "Carvão", color: "#1a1a1a" },
        { text: "Surpresa", color: "#ff6b1a" }
    ];

    let startAngle = 0;
    const arc = Math.PI / (prizes.length / 2);
    let spinTimeout = null;
    let spinAngleStart = 10;
    let spinTime = 0;
    let spinTimeTotal = 0;

    function drawWheel() {
        ctx.clearRect(0, 0, 300, 300);
        prizes.forEach((prize, i) => {
            const angle = startAngle + i * arc;
            
            // Gradiente para o segmento
            const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
            if (i % 2 === 0) {
                gradient.addColorStop(0, "#1a1a1a");
                gradient.addColorStop(1, "#0a0a0a");
            } else {
                gradient.addColorStop(0, prize.color);
                gradient.addColorStop(1, "#803500"); // Tom mais escuro para profundidade
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(150, 150);
            ctx.arc(150, 150, 140, angle, angle + arc, false);
            ctx.lineTo(150, 150);
            ctx.fill();
            
            // Linha divisória elegante
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Texto do prêmio
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.translate(150 + Math.cos(angle + arc / 2) * 90, 150 + Math.sin(angle + arc / 2) * 90);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            ctx.font = 'bold 13px Space Grotesk';
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            const text = prize.text;
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        });
    }

    function rotateWheel() {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            const degrees = startAngle * 180 / Math.PI + 90;
            const arcd = arc * 180 / Math.PI;
            const index = Math.floor((360 - degrees % 360) / arcd);
            const winner = prizes[index].text;
            
            prizeText.innerHTML = `PARABÉNS! VOCÊ GANHOU: ${winner}`;
            resultDiv.style.display = 'block';
            spinBtn.style.display = 'none';
            
            localStorage.removeItem('flamingo_pending_spin');
            localStorage.setItem('flamingo_wheel_played', 'true');
            return;
        }
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        startAngle += (spinAngle * Math.PI / 180);
        drawWheel();
        spinTimeout = setTimeout(rotateWheel, 30);
    }

    function easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }

    spinBtn.onclick = () => {
        spinAngleStart = Math.random() * 10 + 10;
        spinTime = 0;
        spinTimeTotal = Math.random() * 3 + 4 * 1000;
        rotateWheel();
    };

    closeBtn.onclick = () => {
        wheelModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    drawWheel();
}

// 3. Inicialização e Outras Funções
document.addEventListener('DOMContentLoaded', function() {
    setupModals();

    // Dropdown de categorias
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');
    if (dropdownToggle && dropdown) {
        dropdownToggle.onclick = (e) => { e.preventDefault(); dropdown.classList.toggle('open'); };
        document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) dropdown.classList.remove('open'); });
    }

    // Accordion do Catálogo
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + 'px';
        };
    });

    // Sincronização das Bolinhas (Slider)
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.dots-decoration span');
    if (sliderTrack && dots.length > 0) {
        setInterval(() => {
            const style = window.getComputedStyle(sliderTrack);
            const matrix = new WebKitCSSMatrix(style.transform);
            const activeIndex = Math.floor((Math.abs(matrix.m41) + 375) / 750) % 8;
            dots.forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
        }, 100);
    }

    // Lógica do Custom Cursor - Desativar em dispositivos touch
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (dot && outline && !isTouchDevice) {
        window.onmousemove = (e) => {
            dot.style.left = outline.style.left = `${e.clientX}px`;
            dot.style.top = outline.style.top = `${e.clientY}px`;
            outline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" });
        };
        document.querySelectorAll('a, button, .cat-card, .product-card, .promo-btn').forEach(el => {
            el.onmouseenter = () => { dot.classList.add('hover'); outline.classList.add('hover'); };
            el.onmouseleave = () => { dot.classList.remove('hover'); outline.classList.remove('hover'); };
        });
    } else if (isTouchDevice) {
        if (dot) dot.style.display = 'none';
        if (outline) outline.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // Botão Voltar ao Topo
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.onscroll = () => { backToTop.style.display = window.pageYOffset > 300 ? 'flex' : 'none'; };
        backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});