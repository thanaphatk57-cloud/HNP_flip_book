const sheets = Array.from(document.querySelectorAll(".sheet"));
const book = document.getElementById("book");

let currentSheet = 0; // 0..sheets.length

function updateZ() {
  // Unflipped sheets stay on top; flipped go behind
  sheets.forEach((sheet, i) => {
    const flipped = sheet.classList.contains("flipped");
    sheet.style.zIndex = flipped ? i : (100 + (sheets.length - i));
  });
}

function flipNext() {
  if (currentSheet >= sheets.length) return;
  sheets[currentSheet].classList.add("flipped");
  currentSheet += 1;
  updateZ();
}

function flipPrev() {
  if (currentSheet <= 0) return;
  currentSheet -= 1;
  sheets[currentSheet].classList.remove("flipped");
  updateZ();
}

/* ---------------------------
   Desktop: wheel / trackpad
---------------------------- */
let scrollLocked = false;

function handleWheel(e) {
  if (scrollLocked) return;

  // Stop at the ends
  if (e.deltaY > 0 && currentSheet >= sheets.length) return;
  if (e.deltaY < 0 && currentSheet <= 0) return;

  scrollLocked = true;

  if (e.deltaY > 0) flipNext();
  else if (e.deltaY < 0) flipPrev();

  setTimeout(() => (scrollLocked = false), 900);
}

book.addEventListener("wheel", handleWheel, { passive: true });

/* ---------------------------
   Mobile: swipe
---------------------------- */
let touchStartX = 0;
let touchStartY = 0;
let touchLocked = false;
const SWIPE_THRESHOLD = 40; // px
const SWIPE_DIR_RATIO = 1.2; // prefer horizontal

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

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

  touchLocked = true;

  // Prefer horizontal like real page flip
  if (absX >= absY * SWIPE_DIR_RATIO) {
    if (dx < 0) flipNext(); else flipPrev();
  } else {
    // fallback vertical: up next, down prev
    if (dy < 0) flipNext(); else flipPrev();
  }

  setTimeout(() => (touchLocked = false), 900);
}, { passive: true });

/* ---------------------------
   Keyboard (optional desktop)
---------------------------- */
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") flipNext();
  if (e.key === "ArrowLeft") flipPrev();
});

updateZ();

alert("script.js loaded ✅");
