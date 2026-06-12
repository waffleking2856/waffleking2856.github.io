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

    from.classList.add('hidden');
    setTimeout(() => {
        from.classList.add('gone');
        to.classList.remove('hidden');
        to.classList.remove('gone');
    }, 900);
}

// ── SCENE 1: CHEESE PULL ─────────────────────────────────────────
const mozzStick = document.getElementById('mozz-stick');

if (mozzStick) {
    const cheeseStretch = document.getElementById('cheese-stretch');
    const resultText    = document.getElementById('result-text');

    let isDragging  = false;
    let snapDone    = false;
    let stretchPx   = 0;

    // touchstart on the stick activates dragging
    mozzStick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (snapDone) return;
        isDragging = true;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging || snapDone) return;
        e.preventDefault();

        // How far the finger is above the bottom of the viewport
        const fingerY  = e.touches[0].clientY;
        const vh       = window.innerHeight;
        // Stretch height = how far above the midpoint of the plate-wrapper the finger goes
        // We anchor the "zero" at about 75% down the screen
        stretchPx = Math.min(260, Math.max(0, (vh * 0.75) - fingerY));

        cheeseStretch.style.height = stretchPx + 'px';

        // Visual wobble color as it gets close
        if (stretchPx > 160) {
            cheeseStretch.style.background = `linear-gradient(180deg, #ffee44 0%, #ffbb00 60%, #cc8800 100%)`;
        }

        // Snap trigger at 210px stretch
        if (stretchPx >= 210) {
            snapCheese();
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (snapDone) return;
        isDragging = false;
        // Rubber-band back if not snapped
        if (stretchPx < 210) {
            stretchPx = 0;
            cheeseStretch.style.height = '0px';
            cheeseStretch.style.background = '';
        }
    });

    function snapCheese() {
        if (snapDone) return;
        snapDone   = true;
        isDragging = false;

        // Animate snap: stretch collapses
        cheeseStretch.style.transition = 'height 0.2s ease-in';
        cheeseStretch.style.height = '0px';

        // Shake the stick
        mozzStick.classList.add('snapping');
        setTimeout(() => mozzStick.classList.remove('snapping'), 500);

        // Show the result text
        resultText.style.opacity = '1';

        // After a beat, move to the ketchup scene
        setTimeout(() => {
            ch2ShowScene('scene-cheese', 'scene-ketchup');
        }, 1800);
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

    // Continue button inside waitress popup
    if (ketchupContinue) {
        ketchupContinue.addEventListener('click', () => {
            ch2ShowScene('scene-ketchup', 'scene-dipper');
        });
        ketchupContinue.addEventListener('touchend', (e) => {
            e.preventDefault();
            ch2ShowScene('scene-ketchup', 'scene-dipper');
        });
    }
}


// ── SCENE 3: TRIPLE DIPPER DEBATE ────────────────────────────────
const confirmVoteBtn = document.getElementById('confirm-vote-btn');

if (confirmVoteBtn) {
    const voteOptions     = document.querySelectorAll('.vote-card');
    const dipper          = document.getElementById('scene-dipper');
    const verdictPanel    = document.getElementById('verdict-panel');
    const dipper_voteSection = document.getElementById('dipper-vote-section');
    const verdictEmoji    = document.getElementById('verdict-emoji');
    const verdictTitle    = document.getElementById('verdict-title');
    const verdictText     = document.getElementById('verdict-text');
    const toChapter3Btn   = document.getElementById('to-chapter3-btn');

    let selectedChoice = null;

    // Verdict copy for each pick
    const verdicts = {
        wings: {
            emoji: '🍗',
            title: "Matt wins this one 😤",
            text: "Wings. The only correct answer. Classic, crowd-pleasing, and pairs perfectly with ranch and chips & salsa. You can admit it — you knew he was right."
        },
        quesadilla: {
            emoji: '🤝',
            title: "An acceptable compromise",
            text: "Okay, quesadillas are solid. Cheesy, shareable, no real arguments here. Matt probably still thinks wings were better but he's smart enough to stay quiet this time."
        },
        nachos: {
            emoji: '🤨',
            title: "Bold. Controversial. Wrong.",
            text: "Nachos?? You already have chips and salsa! The overlap is off the charts. Matt is deeply, passionately, respectfully disappointed in this choice."
        },
        ribs: {
            emoji: '😂',
            title: "Jill's Wildcard Wins!",
            text: "Cheddar bites. Nobody expected it. Nobody can stop it. Honestly kind of genius? Matt won't admit it but he ate at least six of them."
        }
    };

    // Handle vote card selection
    voteOptions.forEach((card) => {
        function selectCard() {
            voteOptions.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedChoice = card.dataset.choice;
            confirmVoteBtn.classList.add('ready');
        }
        card.addEventListener('click', selectCard);
        card.addEventListener('touchend', (e) => {
            e.preventDefault();
            selectCard();
        });
    });

    // Confirm vote
    function handleConfirm() {
        if (!selectedChoice) return;
        const v = verdicts[selectedChoice];

        verdictEmoji.textContent = v.emoji;
        verdictTitle.textContent = v.title;
        verdictText.textContent  = v.text;

        // Hide vote section, show verdict
        dipper_voteSection.style.display = 'none';
        verdictPanel.classList.add('visible');

        // Scroll to top of dipper scene
        dipper.scrollTop = 0;
    }

    confirmVoteBtn.addEventListener('click', handleConfirm);
    confirmVoteBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleConfirm();
    });

    // Chapter 3 navigation
    if (toChapter3Btn) {
        function goToChapter3() {
            window.location.href = 'chapter3.html';
        }
        toChapter3Btn.addEventListener('click', goToChapter3);
        toChapter3Btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            goToChapter3();
        });
    }
}


// ==========================================
// CHAPTER 3 LOGIC (placeholder)
// ==========================================
// (Chapter 3 existence checks will go here)


// ==========================================
// CHAPTER 4 LOGIC (placeholder)
// ==========================================
// (Chapter 4 existence checks will go here)
