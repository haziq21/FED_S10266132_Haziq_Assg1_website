import { Timeline } from "./timeline.js";

const mainTimelineElems = {
  timeline: document.querySelector(".player__timeline"),
  progressLine: document.querySelector(".player__elapsed"),
  elapsedTimestamp: document.querySelector(".player__timestamp:nth-of-type(1)"),
  runtimeTimestamp: document.querySelector(".player__timestamp:nth-of-type(2)"),
};
const overlayTimelineElems = {
  timeline: document.querySelector(".extra-player__timeline"),
  progressLine: document.querySelector(".extra-player__elapsed"),
  elapsedTimestamp: document.querySelector(".extra-player__timestamp:nth-of-type(1)"),
  runtimeTimestamp: document.querySelector(".extra-player__timestamp:nth-of-type(2)"),
};
const timeline = new Timeline(140_000, mainTimelineElems);

let mainPageScroll;

const mediaQuery = window.matchMedia("(min-width: 600px)");
mediaQuery.addEventListener("change", handleMediaQueryChange);
handleMediaQueryChange(mediaQuery);
// The back button on mobile will close the full-screen video player
document.getElementById("back-btn").addEventListener("click", () => {
  closeFullScreenPlayerMobile();
  timeline.bind(mainTimelineElems);
});

function handleMediaQueryChange(e) {
  if (e.matches) {
    document.querySelector(".player").removeEventListener("click", openFullScreenPlayerMobile);
  } else {
    document.querySelector(".player").addEventListener("click", () => {
      openFullScreenPlayerMobile();
      timeline.bind(overlayTimelineElems);
    });
  }
}

const overlayElem = document.getElementById("overlay");
const mainElem = document.getElementById("main");
const fixedOverlayChildElems = document.querySelectorAll(".overlay .fixed-when-overlaid");

function openFullScreenPlayerMobile() {
  // Preserve the scroll position of the main page
  mainPageScroll = window.scrollY;

  // Prepare the elements for the transition animation
  overlayElem.style.position = "fixed";
  overlayElem.style.top = "100vh";
  overlayElem.style.display = "block";
  // Temporarily set to absolute instead of fixed to let them move with the
  // overlay (since fixed elements are relative to the viewport)
  fixedOverlayChildElems.forEach((elem) => (elem.style.position = "absolute"));

  // requestAnimationFrame is needed to prevent the browser from batching
  // the all the CSS updates together and skipping the transition animation
  requestAnimationFrame(() => {
    overlayElem.style.top = "0";

    // Wait for the overlay to finish moving into place before finalising the styles
    overlayElem.addEventListener(
      "transitionend",
      () => {
        fixedOverlayChildElems.forEach((elem) => (elem.style.position = "fixed"));
        mainElem.style.display = "none";
        overlayElem.style.position = "absolute";
        window.scrollTo(0, 0);
      },
      { once: true }
    );
  });
}

function closeFullScreenPlayerMobile() {
  // Prepare the element for the transition animation
  overlayElem.style.position = "fixed";
  // Temporarily set to absolute instead of fixed to let them move with the
  // overlay (since fixed elements are relative to the viewport)
  fixedOverlayChildElems.forEach((elem) => (elem.style.position = "absolute"));

  mainElem.style.display = "block";
  overlayElem.style.top = "100vh";
  window.scrollTo(0, mainPageScroll);

  // Wait for the overlay to finish moving into place before finalising the styles
  overlayElem.addEventListener("transitionend", () => (overlayElem.style.display = "none"), { once: true });
}
