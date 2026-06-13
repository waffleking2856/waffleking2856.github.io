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
// CHAPTER 2: ALL SCENE LOGIC
// ==========================================

// ── Helper: transition between named scenes ──────────────────────
function ch2ShowScene(fromId, toId) {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);
    if (!from || !to) return;

    // Step 1: fade out the current scene
    from.classList.add('hidden');

    // Step 2: after fade completes, hard-hide it and reveal next scene
    setTimeout(() => {
        from.style.display = 'none';
        to.style.display   = '';          // make sure it's not display:none
        // Force a reflow so the opacity transition fires
        void to.offsetHeight;
        to.classList.remove('hidden');
    }, 850);
}

// ── SCENE 1: CHEESE PULL ─────────────────────────────────────────
const mozzTop = document.getElementById('mozz-top');

if (mozzTop) {
    const cheeseStretch = document.getElementById('cheese-stretch');
    const resultText    = document.getElementById('result-text');

    let isDragging  = false;
    let snapDone    = false;
    let stretchPx   = 0;
    let baseY       = null;   // Y position of the top-half's top edge at rest

    // On first touchstart on the top half, record where it sits
    mozzTop.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (snapDone) return;
        isDragging = true;

        // Record the resting top-edge Y once so we have a solid anchor
        if (baseY === null) {
            baseY = mozzTop.getBoundingClientRect().top;
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging || snapDone) return;
        e.preventDefault();

        const fingerY = e.touches[0].clientY;

        // How many px above the resting position is the finger?
        // clamp between 0 and 280 so it can't go crazy far
        stretchPx = Math.min(280, Math.max(0, baseY - fingerY));

        // Move the top half up
        mozzTop.style.transform = `translateY(-${stretchPx}px)`;

        // Grow the cheese strand downward to fill the gap
        cheeseStretch.style.height = stretchPx + 'px';

        // Warm up the cheese color as it stretches thin
        if (stretchPx > 130) {
            const t = (stretchPx - 130) / 150;   // 0→1 as it approaches snap
            cheeseStretch.style.width = Math.max(8, 22 - t * 10) + 'px';
            cheeseStretch.style.background =
                `linear-gradient(180deg, #ffee44 0%, #ffaa00 60%, #cc6600 100%)`;
        } else {
            cheeseStretch.style.width = '22px';
            cheeseStretch.style.background =
                `linear-gradient(180deg, #ffe566 0%, #ffd700 55%, #e6b800 100%)`;
        }

        // Snap at 220px
        if (stretchPx >= 220) {
            snapCheese();
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (snapDone) return;
        isDragging = false;
        // Rubber-band back if not snapped
        if (stretchPx < 220) {
            stretchPx = 0;
            mozzTop.style.transition = 'transform 0.3s ease';
            mozzTop.style.transform = 'translateY(0)';
            setTimeout(() => { mozzTop.style.transition = 'none'; }, 320);
            cheeseStretch.style.height = '0px';
            cheeseStretch.style.width  = '22px';
            cheeseStretch.style.background = '';
        }
    });

    function snapCheese() {
        if (snapDone) return;
        snapDone   = true;
        isDragging = false;

        // Top half flies up and off
        mozzTop.classList.add('snap-fly-up');

        // Cheese strand collapses fast
        cheeseStretch.style.transition = 'height 0.15s ease-in, opacity 0.15s';
        cheeseStretch.style.height  = '0px';
        cheeseStretch.style.opacity = '0';

        // Show "Good pull!!" text
        resultText.style.opacity = '1';

        // Go to pull photo scene first, then ketchup
        setTimeout(() => {
            ch2ShowScene('scene-cheese', 'scene-pull-photo');
        }, 1900);
    }
}


// ── SCENE 2: KETCHUP BOTTLE DRAG ─────────────────────────────────
const ketchupBottle = document.getElementById('ketchup-bottle');

if (ketchupBottle) {
    const edgeZone        = document.getElementById('edge-zone');
    const waitressPopup   = document.getElementById('waitress-popup');
    const ketchupContinue = document.getElementById('ketchup-continue-btn');

    let kDragging = false;
    let kTriggered = false;

    // Starting position (set via JS so it's always consistent)
    let kX = 30;   // left px
    let kY = null; // will be set on first touchstart

    // Threshold: bottle counts as "at the edge" when its left edge
    // is within 60px of the right side of the screen
    function isAtEdge() {
        const bottleRight = kX + ketchupBottle.offsetWidth;
        return bottleRight >= window.innerWidth - 52;
    }

    ketchupBottle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (kTriggered) return;
        kDragging = true;

        if (kY === null) {
            // Initialize Y from current computed position
            const rect = ketchupBottle.getBoundingClientRect();
            kY = rect.top;
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!kDragging || kTriggered) return;
        e.preventDefault();

        const touch = e.touches[0];

        // Keep Y locked (slide left–right only on the table)
        const newX = touch.clientX - (ketchupBottle.offsetWidth / 2);

        // Clamp so bottle stays on screen
        kX = Math.max(0, Math.min(window.innerWidth - ketchupBottle.offsetWidth, newX));

        ketchupBottle.style.left   = kX + 'px';
        ketchupBottle.style.bottom = '';
        if (kY !== null) {
            ketchupBottle.style.top  = kY + 'px';
        }
        ketchupBottle.style.position = 'fixed';

        // Light up edge zone when close
        if (isAtEdge()) {
            edgeZone.classList.add('active');
            triggerWaitress();
        } else {
            edgeZone.classList.remove('active');
        }
    }, { passive: false });

    ketchupBottle.addEventListener('touchend', (e) => {
        e.stopPropagation();
        kDragging = false;
    }, { passive: true });

    document.addEventListener('touchend', () => {
        kDragging = false;
    });

    function triggerWaitress() {
        if (kTriggered) return;
        kTriggered = true;
        kDragging  = false;

        // Lock bottle in place at edge
        ketchupBottle.style.left = (window.innerWidth - ketchupBottle.offsetWidth - 4) + 'px';
        ketchupBottle.style.filter = 'brightness(1.3) drop-shadow(0 0 12px rgba(255,80,80,0.7))';

        // Show waitress popup after short delay
        setTimeout(() => {
            waitressPopup.classList.add('visible');
        }, 400);
    }

}

// ── Ketchup continue button – standalone, touchstart for Safari ──
const ketchupContinueBtn = document.getElementById('ketchup-continue-btn');
if (ketchupContinueBtn) {
    let continueFired = false;
    function doKetchupContinue(e) {
        e.preventDefault();
        e.stopPropagation();
        if (continueFired) return;
        continueFired = true;
        ch2ShowScene('scene-ketchup', 'scene-dipper');
    }
    // touchstart is most reliable on Safari iOS for dynamically shown elements
    ketchupContinueBtn.addEventListener('touchstart', doKetchupContinue, { passive: false });
    // click as fallback for desktop testing
    ketchupContinueBtn.addEventListener('click', doKetchupContinue);
}


// ── Pull photo continue button → ketchup ────────────────────────
const pullPhotoContinueBtn = document.getElementById('pull-photo-continue-btn');
if (pullPhotoContinueBtn) {
    let pullContinueFired = false;
    function doPullContinue(e) {
        e.preventDefault();
        e.stopPropagation();
        if (pullContinueFired) return;
        pullContinueFired = true;
        ch2ShowScene('scene-pull-photo', 'scene-ketchup');
    }
    pullPhotoContinueBtn.addEventListener('touchstart', doPullContinue, { passive: false });
    pullPhotoContinueBtn.addEventListener('click', doPullContinue);
}


// ── SCENE 3: TRIPLE DIPPER DEBATE ────────────────────────────────
const confirmVoteBtn = document.getElementById('confirm-vote-btn');

if (confirmVoteBtn) {
    const voteOptions        = document.querySelectorAll('.vote-card');
    const dipper             = document.getElementById('scene-dipper');
    const verdictPanel       = document.getElementById('verdict-panel');
    const dipperVoteSection  = document.getElementById('dipper-vote-section');
    const verdictEmoji       = document.getElementById('verdict-emoji');
    const verdictTitle       = document.getElementById('verdict-title');
    const verdictText        = document.getElementById('verdict-text');
    const toClosingBtn       = document.getElementById('to-closing-btn');

    let selectedChoice = null;

    // Verdicts — text is yours to fill in, these are placeholders
    const verdicts = {
        bbq: {
            emoji: '🍗',
            title: 'good pick pookie',
            // YOUR TEXT: what do you want to say when she picks the right one?
            text: '[YOUR TEXT HERE]'
        },
        buffalo: {
            emoji: '🔥',
            title: 'pookie gets what pookie wants or whateva',
            // YOUR TEXT: what do you want to say when she goes buffalo?
            text: '[YOUR TEXT HERE]'
        },
        eggrolls: {
            emoji: '🥢',
            title: 'pookie gets what pookie wants or whateva',
            // YOUR TEXT: what do you want to say about the egg rolls pick?
            text: '[YOUR TEXT HERE]'
        },
        fourth: {
            emoji: '❓',
            title: '[YOUR TITLE]',
            // YOUR TEXT: what do you want to say about this choice?
            text: '[YOUR TEXT HERE]'
        }
    };

    // Handle vote card selection — use touchstart for Safari reliability
    voteOptions.forEach((card) => {
        function selectCard(e) {
            if (e.cancelable) e.preventDefault();
            voteOptions.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedChoice = card.dataset.choice;
            confirmVoteBtn.classList.add('ready');
        }
        card.addEventListener('touchstart', selectCard, { passive: false });
        card.addEventListener('click', selectCard);
    });

    // Confirm vote
    let confirmFired = false;
    function handleConfirm(e) {
        e.preventDefault();
        if (!selectedChoice || confirmFired) return;
        confirmFired = true;
        const v = verdicts[selectedChoice];

        verdictEmoji.textContent = v.emoji;
        verdictTitle.textContent = v.title;
        verdictText.textContent  = v.text;

        dipperVoteSection.style.display = 'none';
        verdictPanel.classList.add('visible');
        dipper.scrollTop = 0;
    }

    confirmVoteBtn.addEventListener('touchstart', handleConfirm, { passive: false });
    confirmVoteBtn.addEventListener('click', handleConfirm);

    // Manager easter egg
    const managerCard = document.getElementById('manager-card');
    const managerEgg  = document.getElementById('manager-egg');
    if (managerCard && managerEgg) {
        function openEgg(e) {
            e.preventDefault();
            e.stopPropagation();
            managerEgg.classList.add('open');
        }
        function closeEgg(e) {
            e.preventDefault();
            managerEgg.classList.remove('open');
        }
        managerCard.addEventListener('touchstart', openEgg, { passive: false });
        managerCard.addEventListener('click', openEgg);
        managerEgg.addEventListener('touchstart', closeEgg, { passive: false });
        managerEgg.addEventListener('click', closeEgg);
    }

    // "keep reading" → closing scene
    if (toClosingBtn) {
        let closingFired = false;
        function goToClosing(e) {
            e.preventDefault();
            e.stopPropagation();
            if (closingFired) return;
            closingFired = true;
            ch2ShowScene('scene-dipper', 'scene-closing');
        }
        toClosingBtn.addEventListener('touchstart', goToClosing, { passive: false });
        toClosingBtn.addEventListener('click', goToClosing);
    }
}


// ── Closing scene → Chapter 3 ─────────────────────────────────────
const toChapter3Btn = document.getElementById('to-chapter3-btn');
if (toChapter3Btn) {
    let ch3Fired = false;
    function goToChapter3(e) {
        e.preventDefault();
        if (ch3Fired) return;
        ch3Fired = true;
        window.location.href = 'chapter3.html';
    }
    toChapter3Btn.addEventListener('touchstart', goToChapter3, { passive: false });
    toChapter3Btn.addEventListener('click', goToChapter3);
}


// ==========================================
// CHAPTER 3: ALL SCENE LOGIC
// ==========================================
const folderScene = document.getElementById('scene-folder');

if (folderScene) {

    // ── SCENE 1: FOLDER DRAG OPEN ──────────────────────────────────
    const folderFlap = document.getElementById('folder-flap');
    let flapStartY  = null;
    let flapDragging = false;
    let flapDone    = false;

    folderFlap.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (flapDone) return;
        flapDragging = true;
        flapStartY   = e.touches[0].clientY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!flapDragging || flapDone) return;
        e.preventDefault();
        const dy = Math.max(0, Math.min(220, flapStartY - e.touches[0].clientY));
        folderFlap.style.transform = `translateY(-${dy}px)`;
        if (dy >= 130) openFolder();
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (flapDone) return;
        flapDragging = false;
        // Snap back if not opened far enough
        folderFlap.style.transition = 'transform 0.3s ease';
        folderFlap.style.transform  = 'translateY(0)';
        setTimeout(() => { folderFlap.style.transition = ''; }, 320);
    });

    function openFolder() {
        if (flapDone) return;
        flapDone     = true;
        flapDragging = false;
        folderFlap.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        folderFlap.style.transform  = 'translateY(-500px)';
        setTimeout(() => {
            ch2ShowScene('scene-folder', 'scene-gallery');
        }, 550);
    }


    // ── SCENE 2: CANCUN GALLERY SWIPE ─────────────────────────────
    const galleryTrack   = document.getElementById('gallery-track');
    const galleryDoneBtn = document.getElementById('gallery-done-btn');
    const dots           = document.querySelectorAll('.dot');

    if (galleryTrack) {
        const TOTAL_SLIDES = 4;
        let currentSlide = 0;
        let gStartX      = null;
        let gDragging    = false;

        function setSlide(n, animate) {
            currentSlide = Math.max(0, Math.min(TOTAL_SLIDES - 1, n));
            galleryTrack.style.transition = animate ? 'transform 0.32s ease' : 'none';
            galleryTrack.style.transform  = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
            if (currentSlide === TOTAL_SLIDES - 1 && galleryDoneBtn) {
                galleryDoneBtn.classList.add('visible');
            }
        }

        setSlide(0, false);

        galleryTrack.addEventListener('touchstart', (e) => {
            gStartX   = e.touches[0].clientX;
            gDragging = true;
        }, { passive: true });

        galleryTrack.addEventListener('touchend', (e) => {
            if (!gDragging || gStartX === null) return;
            const dx = e.changedTouches[0].clientX - gStartX;
            if (Math.abs(dx) > 48) setSlide(currentSlide + (dx < 0 ? 1 : -1), true);
            gDragging = false;
        }, { passive: true });
    }

    if (galleryDoneBtn) {
        let galFired = false;
        function galleryDone(e) {
            e.preventDefault();
            e.stopPropagation();
            if (galFired) return;
            galFired = true;
            ch2ShowScene('scene-gallery', 'scene-alarm');
        }
        galleryDoneBtn.addEventListener('touchstart', galleryDone, { passive: false });
        galleryDoneBtn.addEventListener('click', galleryDone);
    }


    // ── SCENE 3: RETRO ALARM CLOCK ────────────────────────────────
    const snoozeBtn    = document.getElementById('snooze-btn');
    const clockWrap    = document.getElementById('clock-wrap');
    const clockTime    = document.getElementById('clock-time');
    const snoozeStatus = document.getElementById('snooze-status');
    const crackOverlay = document.getElementById('crack-overlay');

    if (snoozeBtn && clockWrap) {
        let snoozeCount  = 0;
        let snoozeLocked = false;

        const shakeClass  = ['shake-1', 'shake-1', 'shake-2', 'shake-2', 'shake-3'];
        const statusLines = [
            'keep going...',
            'still going...',
            'it\'s cracking...',
            'almost there...',
            'SMASHED IT'
        ];

        // Start the blinking alarm display
        clockTime.style.animation = 'blink 0.65s step-end infinite';

        function doSnooze(e) {
            e.preventDefault();
            e.stopPropagation();
            if (snoozeLocked) return;
            snoozeLocked = true;
            snoozeCount++;

            // Re-trigger shake animation
            const cls = shakeClass[snoozeCount - 1];
            clockWrap.classList.remove('shake-1', 'shake-2', 'shake-3');
            void clockWrap.offsetHeight;
            clockWrap.classList.add(cls);

            // Update status text
            snoozeStatus.textContent = statusLines[snoozeCount - 1];

            // Show crack at tap 3+
            if (snoozeCount >= 3) crackOverlay.classList.add('show');

            if (snoozeCount >= 5) {
                // Break the clock
                clockTime.style.animation = 'none';
                snoozeBtn.style.pointerEvents = 'none';
                setTimeout(() => {
                    clockWrap.classList.add('clock-breaking');
                }, 200);
                setTimeout(() => {
                    ch2ShowScene('scene-alarm', 'scene-ch3-closing');
                }, 1100);
            } else {
                const shakeDuration = [400, 400, 500, 500, 600][snoozeCount - 1];
                setTimeout(() => { snoozeLocked = false; }, shakeDuration + 50);
            }
        }

        snoozeBtn.addEventListener('touchstart', doSnooze, { passive: false });
        snoozeBtn.addEventListener('click', doSnooze);
    }


    // ── Chapter 3 closing → Chapter 4 ─────────────────────────────
    const toChapter4Btn = document.getElementById('to-chapter4-btn');
    if (toChapter4Btn) {
        let ch4Fired = false;
        function goToChapter4(e) {
            e.preventDefault();
            e.stopPropagation();
            if (ch4Fired) return;
            ch4Fired = true;
            window.location.href = 'chapter4.html';
        }
        toChapter4Btn.addEventListener('touchstart', goToChapter4, { passive: false });
        toChapter4Btn.addEventListener('click', goToChapter4);
    }

}


// ==========================================
// CHAPTER 4: ALL SCENE LOGIC
// ==========================================
const farmScene = document.getElementById('scene-farm');

if (farmScene) {

    // ── SCENE 1: FARM COLLECTION ───────────────────────────────────
    const ITEMS = [
        { src: 'chicken.png', l: '8%',  t: '20%', w: 72 },
        { src: 'duck.png',    l: '58%', t: '16%', w: 72 },
        { src: 'cow1.png',    l: '4%',  t: '52%', w: 80 },
        { src: 'cow2.png',    l: '56%', t: '58%', w: 80 },
        { src: 'goat.png',    l: '28%', t: '68%', w: 72 },
        { src: 'pig.png',     l: '66%', t: '38%', w: 72 },
        { src: 'wine.png',    l: '20%', t: '34%', w: 56 },
        { src: 'wine.png',    l: '40%', t: '75%', w: 56 },
    ];

    const TOTAL     = ITEMS.length;
    let collected   = 0;
    let farmDone    = false;

    const countEl   = document.getElementById('collected-count');
    const progressBar = document.getElementById('farm-progress-bar');

    // Build item elements dynamically
    ITEMS.forEach((item, i) => {
        const wrap = document.createElement('div');
        wrap.className = 'farm-item';
        wrap.style.left = item.l;
        wrap.style.top  = item.t;
        wrap.style.animationDelay = `${-(i * 0.23)}s`;

        const img = document.createElement('img');
        img.src       = item.src;
        img.style.width = item.w + 'px';
        img.draggable = false;
        wrap.appendChild(img);
        farmScene.appendChild(wrap);

        function collectItem(e) {
            if (wrap.classList.contains('collected') || farmDone) return;
            const cx = (e.touches ? e.touches[0].clientX : e.clientX);
            const cy = (e.touches ? e.touches[0].clientY : e.clientY);
            wrap.classList.add('collected');
            spawnSparkles(cx, cy);
            collected++;
            countEl.textContent = collected;
            progressBar.style.width = (collected / TOTAL * 100) + '%';
            if (collected >= TOTAL) {
                farmDone = true;
                setTimeout(triggerWeddingReveal, 700);
            }
        }

        wrap.addEventListener('touchstart', (e) => {
            e.preventDefault();
            collectItem(e);
        }, { passive: false });
        wrap.addEventListener('click', collectItem);
    });

    // Sparkle burst on collection
    function spawnSparkles(x, y) {
        const colors = ['#ffe566', '#ff9933', '#66ff88', '#ff66cc', '#66eeff'];
        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            const angle = (i / 8) * Math.PI * 2;
            const dist  = 38 + Math.random() * 36;
            dot.style.cssText = `
                position:fixed; width:10px; height:10px; border-radius:50%;
                background:${colors[i % colors.length]};
                left:${x}px; top:${y}px; pointer-events:none; z-index:200;
            `;
            document.body.appendChild(dot);
            dot.animate([
                { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px),
                               calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`,
                  opacity: 0 }
            ], { duration: 480, easing: 'ease-out' }).onfinish = () => dot.remove();
        }
    }


    // ── SCENE 2: WEDDING REVEAL SEQUENCE ──────────────────────────
    function triggerWeddingReveal() {
        ch2ShowScene('scene-farm', 'scene-wedding');

        // Sequential reveal after scene fade (850ms)
        const seq = [
            [950,  () => document.getElementById('meanwhile-text').classList.add('show')],
            [2300, () => document.getElementById('stardew-text').classList.add('show')],
            [3600, () => {
                document.getElementById('wedding-photo').classList.add('show');
                startConfetti();
            }],
            [4600, () => document.getElementById('anniversary-title').classList.add('show')],
            [5500, () => document.getElementById('to-anniversary-btn').classList.add('show')],
        ];
        seq.forEach(([delay, fn]) => setTimeout(fn, delay));
    }

    // Confetti rain
    function startConfetti() {
        const colors = ['#ffe566', '#ff6699', '#66ffaa', '#6699ff', '#ff9933', '#cc66ff'];
        const weddingScene = document.getElementById('scene-wedding');
        for (let i = 0; i < 48; i++) {
            setTimeout(() => {
                const p = document.createElement('div');
                p.className = 'confetti-piece';
                const size = 5 + Math.random() * 8;
                p.style.cssText = `
                    left:${Math.random() * 100}%;
                    width:${size}px; height:${size}px;
                    background:${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
                    animation-duration:${1.4 + Math.random() * 1.2}s;
                    animation-delay:${Math.random() * 0.3}s;
                `;
                weddingScene.appendChild(p);
                setTimeout(() => p.remove(), 3500);
            }, i * 55);
        }
    }

    // To-anniversary button
    const toAnniversaryBtn = document.getElementById('to-anniversary-btn');
    if (toAnniversaryBtn) {
        let annFired = false;
        function goToAnniversary(e) {
            e.preventDefault();
            e.stopPropagation();
            if (annFired) return;
            annFired = true;
            ch2ShowScene('scene-wedding', 'scene-anniversary');
        }
        toAnniversaryBtn.addEventListener('touchstart', goToAnniversary, { passive: false });
        toAnniversaryBtn.addEventListener('click', goToAnniversary);
    }

}