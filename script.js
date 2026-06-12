// ==========================================
// CHAPTER 1: FOGGY WINDOW LOGIC
// ==========================================
const canvas = document.getElementById('fogCanvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    const windowFrame = document.getElementById('windowFrame');
    const instruction = document.getElementById('instruction');

    const sceneFog = document.getElementById('scene-fog');
    const sceneReveal = document.getElementById('scene-reveal');

    let isDrawing = false;
    let hasRevealed = false; 
    let wipeCounter = 0;

    function resizeCanvas() {
        if(hasRevealed) return;
        canvas.width = windowFrame.clientWidth;
        canvas.height = windowFrame.clientHeight;
        drawFog();
    }

    function drawFog() {
        ctx.fillStyle = '#4a5a6a'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(240, 244, 248, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function triggerReveal() {
        if (hasRevealed) return;
        hasRevealed = true;
        isDrawing = false;
        
        sceneFog.classList.add('hidden');
        
        setTimeout(() => {
            sceneFog.style.display = 'none'; 
            sceneReveal.classList.remove('hidden');
        }, 1500); 
    }

    function wipe(clientX, clientY) {
        if(hasRevealed) return;

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2, false); 
        ctx.fill();
        
        if (instruction.style.opacity !== '0') {
            instruction.style.opacity = '0';
        }

        wipeCounter++;

        if (wipeCounter > 200) {
            triggerReveal();
            return;
        }

        if (wipeCounter % 5 === 0) {
            checkProgress();
        }
    }

    function checkProgress() {
        if(hasRevealed) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        const totalPixels = pixels.length / 4;

        for (let i = 3; i < pixels.length; i += 32) {
            if (pixels[i] < 100) { 
                transparentPixels += 8; 
            }
        }

        const percentageCleared = (transparentPixels / totalPixels) * 100;

        if (percentageCleared >= 60) {
            triggerReveal();
        }
    }

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        isDrawing = true;
        const touch = e.touches[0];
        wipe(touch.clientX, touch.clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); 
        if (!isDrawing) return;
        const touch = e.touches[0];
        wipe(touch.clientX, touch.clientY);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDrawing = false;
    }, { passive: false });

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 150);
}

// Global button function to move to the next chapter
function goToChapter2() {
    window.location.href = "chapter2.html";
}


// ==========================================
// CHAPTER 2: CHEESE PULL LOGIC
// ==========================================
const stick = document.getElementById('mozz-stick');

if (stick) {
    const cheese = document.getElementById('cheese-stretch');
    const result = document.getElementById('result-text');
    let isDragging = false;
    let height = 0;

    stick.addEventListener('touchstart', (e) => { isDragging = true; });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        height = Math.min(250, Math.max(0, 300 - e.touches[0].clientY));
        cheese.style.height = height + 'px';
        stick.style.bottom = (50 + height) + 'px';

        if (height > 200) {
            isDragging = false;
            result.style.opacity = '1';
            setTimeout(() => { alert("Ready for the next part of the date!"); }, 500);
        }
    });

    document.addEventListener('touchend', () => { isDragging = false; });
}