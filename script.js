const sheets = Array.from(document.querySelectorAll(".sheet"));
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const indicator = document.getElementById("indicator");
const book = document.getElementById("book");

let currentSheet = 0; // how many sheets have been flipped (0..sheets.length)

function updateZ() {
  // Unflipped sheets should stay on top; flipped sheets go behind
  sheets.forEach((sheet, i) => {
    const flipped = sheet.classList.contains("flipped");
    sheet.style.zIndex = flipped ? i : (100 + (sheets.length - i));
  });
}

function updateIndicator() {
  // Each sheet = 2 pages (front/back)
  const pageNumber = Math.min(currentSheet * 2 + 1, sheets.length * 2);
  indicator.textContent = `Page ${pageNumber}`;
  prevBtn.disabled = currentSheet === 0;
  nextBtn.disabled = currentSheet === sheets.length;
}

function flipNext() {
  if (currentSheet >= sheets.length) return;
  sheets[currentSheet].classList.add("flipped");
  currentSheet += 1;
  updateZ();
  updateIndicator();
}

function flipPrev() {
  if (currentSheet <= 0) return;
  currentSheet -= 1;
  sheets[currentSheet].classList.remove("flipped");
  updateZ();
  updateIndicator();
}

/* ---------------------------
   Scroll-to-flip (wheel/trackpad)
---------------------------- */
let scrollLocked = false;

function handleScroll(e) {
  if (scrollLocked) return;

  // If you're at the ends, don't lock unnecessarily
  if (e.deltaY > 0 && currentSheet >= sheets.length) return;
  if (e.deltaY < 0 && currentSheet <= 0) return;

  scrollLocked = true;

  if (e.deltaY > 0) flipNext();    // scroll down -> next
  else if (e.deltaY < 0) flipPrev(); // scroll up -> prev

  // unlock after animation duration (match CSS transition ~900ms)
  setTimeout(() => {
    scrollLocked = false;
  }, 900);
}

// Attach scroll listener to the book area
book.addEventListener("wheel", handleScroll, { passive: true });

/* ---------------------------
   Buttons + keyboard (optional)
---------------------------- */
prevBtn.addEventListener("click", flipPrev);
nextBtn.addEventListener("click", flipNext);

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") flipNext();
  if (e.key === "ArrowLeft") flipPrev();
});

/* ---------------------------
   Init
---------------------------- */
updateZ();
updateIndicator();

// ---- Mobile swipe support ----
let touchStartX = 0;
let touchStartY = 0;
let touchLocked = false;

const SWIPE_THRESHOLD = 40; // px (tweak: 30-60)

book.addEventListener("touchstart", (e) => {
  if (!e.touches || e.touches.length !== 1) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

book.addEventListener("touchend", (e) => {
  if (touchLocked) return;

  const t = e.changedTouches && e.changedTouches[0];
  if (!t) return;

  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  // Choose the dominant direction (horizontal swipe feels most "page flip")
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

  // Lock to avoid multiple flips per gesture
  touchLocked = true;

  if (absX >= absY) {
    // Horizontal swipe: left -> next, right -> prev
    if (dx < 0) flipNext();
    else flipPrev();
  } else {
    // Optional: vertical swipe: up -> next, down -> prev
    if (dy < 0) flipNext();
    else flipPrev();
  }

  setTimeout(() => {
    touchLocked = false;
  }, 900);
}, { passive: true });
