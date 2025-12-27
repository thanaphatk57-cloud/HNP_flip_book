const leaves = Array.from(document.querySelectorAll(".leaf"));
const book = document.getElementById("book");

let current = 0;

function updateZ() {
  // unflipped on top, flipped behind
  leaves.forEach((leaf, i) => {
    const flipped = leaf.classList.contains("flipped");
    leaf.style.zIndex = flipped ? (100 + i) : (200 + (leaves.length - i));
  });
}

function next() {
  if (current >= leaves.length) return;
  leaves[current].classList.add("flipped");
  current += 1;
  updateZ();
}

function prev() {
  if (current <= 0) return;
  current -= 1;
  leaves[current].classList.remove("flipped");
  updateZ();
}

/* Desktop wheel */
let wheelLock = false;
book.addEventListener("wheel", (e) => {
  if (wheelLock) return;
  if (e.deltaY > 0 && current >= leaves.length) return;
  if (e.deltaY < 0 && current <= 0) return;

  wheelLock = true;
  if (e.deltaY > 0) next();
  else prev();

  setTimeout(() => (wheelLock = false), 900);
}, { passive: true });

/* Mobile swipe */
let startX = 0, startY = 0;
let touchLock = false;
const TH = 35;

book.addEventListener("touchstart", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  startX = t.clientX;
  startY = t.clientY;
}, { passive: true });

book.addEventListener("touchend", (e) => {
  if (touchLock) return;

  const t = e.changedTouches && e.changedTouches[0];
  if (!t) return;

  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (Math.max(ax, ay) < TH) return;

  touchLock = true;

  // prefer horizontal swipe
  if (ax >= ay) {
    if (dx < 0) next();
    else prev();
  } else {
    if (dy < 0) next();
    else prev();
  }

  setTimeout(() => (touchLock = false), 900);
}, { passive: true });

updateZ();

