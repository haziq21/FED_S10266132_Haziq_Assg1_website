let mainPageScroll;
const mediaQuery = window.matchMedia("(min-width: 600px)");

function handleMediaQueryChange(e) {
  if (e.matches) {
    document.querySelector(".player").removeEventListener("click", openFullScreenPlayerMobile);
  } else {
    document.querySelector(".player").addEventListener("click", openFullScreenPlayerMobile);
  }
}

mediaQuery.addEventListener("change", handleMediaQueryChange);
handleMediaQueryChange(mediaQuery);
// The back button on mobile will close the full-screen video player
document.getElementById("back-btn").addEventListener("click", closeFullScreenPlayerMobile);

let mobileFullScreenPlayerIsOpen = false;

const extraContentElem = document.getElementById("extra-content");
const videoElem = document.getElementById("extra-content__video");
const mainElem = document.getElementById("main");
const fixedWhenStaticElems = document.querySelectorAll(".extra-content .fixed-when-static");

function openFullScreenPlayerMobile() {
  // Preserve the scroll position of the main page
  mainPageScroll = window.scrollY;

  // Prepare the elements for the transition animation
  extraContentElem.style.position = "fixed";
  extraContentElem.style.top = "100vh";
  extraContentElem.style.display = "block";
  // Temporarily set to absolute instead of fixed to let them move with the
  // extra-content (since fixed elements are relative to the viewport)
  fixedWhenStaticElems.forEach((elem) => (elem.style.position = "absolute"));

  // requestAnimationFrame is needed to prevent the browser from batching
  // the all the CSS updates together and skipping the transition animation
  requestAnimationFrame(() => {
    extraContentElem.style.top = "0";

    // Wait for the extra-content to finish moving into place before finalising the styles
    extraContentElem.addEventListener(
      "transitionend",
      () => {
        fixedWhenStaticElems.forEach((elem) => (elem.style.position = "fixed"));
        mainElem.style.display = "none";
        extraContentElem.style.position = "absolute";
        window.scrollTo(0, 0);
        mobileFullScreenPlayerIsOpen = true;
      },
      { once: true }
    );
  });
}

function closeFullScreenPlayerMobile() {
  // Prepare the element for the transition animation
  extraContentElem.style.position = "fixed";
  // Temporarily set to absolute instead of fixed to let them move with the
  // extra-content (since fixed elements are relative to the viewport)
  fixedWhenStaticElems.forEach((elem) => (elem.style.position = "absolute"));

  mainElem.style.display = "block";
  extraContentElem.style.top = "100vh";
  window.scrollTo(0, mainPageScroll);

  // Wait for the extra-content to finish moving into place before finalising the styles
  extraContentElem.addEventListener(
    "transitionend",
    () => {
      extraContentElem.style.display = "none";
      mobileFullScreenPlayerIsOpen = false;
    },
    { once: true }
  );
}

const totalRuntime = 140_000; // In milliseconds
let startTime = Date.now();

let cursor = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => (cursor = { x: e.clientX, y: e.clientY }));
window.addEventListener("touchmove", (e) => (cursor = { x: e.touches[0].clientX, y: e.touches[0].clientY }));

let adjustingTimeline = false;

function handlePointerDown() {
  adjustingTimeline = true;
}

function handlePointerUp() {
  if (adjustingTimeline) {
    adjustingTimeline = false;
    startTime = Date.now() - getAdjustedRuntime(totalRuntime);
  }
}

window.addEventListener("mouseup", handlePointerUp);
window.addEventListener("touchend", handlePointerUp);
document.querySelectorAll(".player__timeline, .extra-player__timeline").forEach((el) => {
  el.addEventListener("touchstart", handlePointerDown);
  el.addEventListener("mousedown", handlePointerDown);
});

/**
 * Returns the runtime duration that the user is adjusting
 * the timeline to (i.e. by dragging on the timeline).
 */
function getAdjustedRuntime(totalRuntime) {
  const { left, width } = getActiveTimeline().getBoundingClientRect();
  return totalRuntime * Math.min(Math.max((cursor.x - left) / width, 0), 1);
}

/**
 * Updates the timeline to reflect the elapsed runtime (in milliseconds).
 */
function updateTimeline(elapsedRuntime, totalRuntime) {
  document
    .querySelectorAll(".player__elapsed, .extra-player__elapsed")
    .forEach((el) => (el.style.width = `${(elapsedRuntime / totalRuntime) * 100}%`));

  document
    .querySelectorAll(".player__timestamp:nth-of-type(1), .extra-player__timestamp:nth-of-type(1)")
    .forEach((el) => (el.textContent = getTimestamp(elapsedRuntime)));
}

/**
 * Calls `updateTimeline()` every animation frame.
 */
function loopUpdateTimeline() {
  console.log(cursor.x, cursor.y);
  const elapsedRuntime = Date.now() - startTime;
  updateTimeline(adjustingTimeline ? getAdjustedRuntime(totalRuntime) : elapsedRuntime, totalRuntime);

  if (elapsedRuntime < totalRuntime) requestAnimationFrame(loopUpdateTimeline);
}

loopUpdateTimeline();

/**
 * Accepts a duration in milliseconds, and return its timestamp representation (e.g. "1:05").
 */
function getTimestamp(duration) {
  const elapsedMinutes = Math.floor(duration / 1000 / 60);
  const elapsedSeconds = Math.round((duration / 1000) % 60);
  return `${elapsedMinutes}:${String(elapsedSeconds).padStart(2, "0")}`;
}

function getActiveTimeline() {
  return document.querySelector(mobileFullScreenPlayerIsOpen ? ".extra-player__timeline" : ".player__timeline");
}
