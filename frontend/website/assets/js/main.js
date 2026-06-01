// ===== CUSTOM CURSOR =====
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursor-ring');
    
    if (!cursor || !cursorRing) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;
    
    // Update mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth cursor animation
    function animateCursor() {
        // Direct cursor follows mouse immediately
        cursorX = mouseX;
        cursorY = mouseY;
        
        // Ring follows with slight delay
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Hide default cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [role="button"]');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursorRing.style.width = '48px';
            cursorRing.style.height = '48px';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.width = '8px';
            cursor.style.height = '8px';
            cursorRing.style.width = '36px';
            cursorRing.style.height = '36px';
        });
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorRing.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorRing.style.opacity = '1';
    });
}

function animateCounter(element, target, durationMs) {
    let startTs = 0;

    function tick(ts) {
        if (!startTs) startTs = ts;
        const progress = Math.min((ts - startTs) / durationMs, 1);
        element.textContent = Math.floor(progress * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ===== SCROLL-BASED SECTIONS =====
function initScrollSections() {
    const problemWrap = document.getElementById('problem-pin-wrap');
    const problemFill = document.getElementById('problem-fill');
    const problemSteps = ['ps-1', 'ps-2', 'ps-3'].map((id) => document.getElementById(id));
    const problemVisuals = ['pv-1', 'pv-2', 'pv-3'].map((id) => document.getElementById(id));
    const counter = document.getElementById('counter');

    const howWrap = document.getElementById('how-pin-wrap');
    const howSteps = ['hs-0', 'hs-1', 'hs-2'].map((id) => document.getElementById(id));
    const howVisuals = ['hv-0', 'hv-1', 'hv-2'].map((id) => document.getElementById(id));
    const howDots = ['hd-0', 'hd-1', 'hd-2'].map((id) => document.getElementById(id));

    if (!problemWrap && !howWrap) return;

    let counterDone = false;

    function setVisibility(node, isActive) {
        if (!node) return;
        node.classList.toggle('hidden', !isActive);
        node.classList.toggle('opacity-0', !isActive);
        node.classList.toggle('translate-y-10', !isActive);
        node.classList.toggle('translate-y-8', !isActive);
        node.classList.toggle('pointer-events-none', !isActive);
        node.classList.toggle('opacity-100', isActive);
        node.classList.toggle('translate-y-0', isActive);
        node.classList.toggle('pointer-events-auto', isActive);
    }

    function setProblem(index) {
        problemSteps.forEach((step, idx) => setVisibility(step, idx === index));
        problemVisuals.forEach((visual, idx) => {
            if (!visual) return;
            visual.classList.toggle('hidden', idx !== index);
            visual.classList.toggle('opacity-0', idx !== index);
            visual.classList.toggle('opacity-100', idx === index);
        });

        if (index === 0 && !counterDone && counter) {
            counterDone = true;
            animateCounter(counter, 4847, 2000);
        }
    }

    function setHow(index) {
        howSteps.forEach((step, idx) => setVisibility(step, idx === index));
        howVisuals.forEach((visual, idx) => {
            if (!visual) return;
            visual.classList.toggle('hidden', idx !== index);
            visual.classList.toggle('opacity-0', idx !== index);
            visual.classList.toggle('opacity-100', idx === index);
        });
        howDots.forEach((dot, idx) => {
            if (!dot) return;
            dot.classList.toggle('bg-snapPrimary', idx === index);
            dot.classList.toggle('border-snapPrimary', idx === index);
            dot.classList.toggle('shadow-[0_0_8px_#7f0df2]', idx === index);
        });
    }

    function progressFromWrap(wrap) {
        const rect = wrap.getBoundingClientRect();
        const total = Math.max(1, wrap.offsetHeight - window.innerHeight);
        return Math.max(0, Math.min(1, -rect.top / total));
    }

    function handleScroll() {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (!isDesktop) {
            if (problemFill) problemFill.style.height = '0%';
            setProblem(0);
            setHow(0);
            return;
        }

        if (problemWrap) {
            const progress = progressFromWrap(problemWrap);
            if (problemFill) {
                problemFill.style.height = `${progress * 100}%`;
            }

            if (progress < 0.33) setProblem(0);
            else if (progress < 0.66) setProblem(1);
            else setProblem(2);
        }

        if (howWrap) {
            const progress = progressFromWrap(howWrap);
            if (progress < 0.33) setHow(0);
            else if (progress < 0.66) setHow(1);
            else setHow(2);
        }
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 16); // ~60fps
        }
    });

    // Initial call
    handleScroll();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initCustomCursor();
    initScrollSections();
});
