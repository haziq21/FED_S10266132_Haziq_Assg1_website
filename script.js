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

// The back button on mobile will close the full-screen video player
document.getElementById("back-btn").addEventListener("click", closeFullScreenPlayerMobile);

const overlayElem = document.getElementById("overlay");
const mainElem = document.getElementById("main");
const fixedOverlayChildElems = document.querySelectorAll(".overlay .fixed-when-overlaid");

const mediaQuery = window.matchMedia("(min-width: 600px)");
mediaQuery.addEventListener("change", handleMediaQueryChange);
handleMediaQueryChange(mediaQuery);

function handleMediaQueryChange(e) {
  if (e.matches) {
    document.getElementById("video-player-btn").addEventListener("click", toggleVideoPlayerDesktop);
    document.querySelector(".player").removeEventListener("click", openFullScreenPlayerMobile);

    transitionFromMobileToDesktop(getDesktopVideoPlayerState());
  } else {
    document.querySelector(".player").addEventListener("click", openFullScreenPlayerMobile);
    document.getElementById("video-player-btn").removeEventListener("click", toggleVideoPlayerDesktop);

    transitionFromDesktopToMobile(getDesktopVideoPlayerState());
  }
}

function openFullScreenPlayerMobile() {
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
        timeline.bind(overlayTimelineElems);
        setVideoPlayerState(true);
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

  // Wait for the overlay to finish moving into place before finalising the styles
  overlayElem.addEventListener(
    "transitionend",
    () => {
      overlayElem.style.display = "none";
      timeline.bind(mainTimelineElems);
      setVideoPlayerState(false);
    },
    { once: true }
  );
}

function transitionFromMobileToDesktop(playerIsOpen) {
  overlayElem.style.position = "relative";
  overlayElem.style.top = "unset";
  fixedOverlayChildElems.forEach((el) => (el.style.position = "relative"));

  if (playerIsOpen) {
    overlayElem.style.display = "block";
    mainElem.style.display = "block";
    timeline.bind(mainTimelineElems);
  }
}

/**
 * Update styles and bind the `Timeline` to the appropriate DOM elements, to be
 * called when the screen size changes from a desktop size to a mobile size.
 * @param {boolean} playerIsOpen Whether the video player is open
 */
function transitionFromDesktopToMobile(playerIsOpen) {
  if (playerIsOpen) {
    overlayElem.style.position = "absolute";
    overlayElem.style.top = "0";
    overlayElem.style.display = "block";
    fixedOverlayChildElems.forEach((elem) => (elem.style.position = "fixed"));
    mainElem.style.display = "none";

    window.scrollTo(0, 0);
    timeline.bind(overlayTimelineElems);
  } else {
    overlayElem.style.position = "fixed";
    overlayElem.style.top = "100vh";
    mainElem.style.display = "block";
  }
}

function toggleVideoPlayerDesktop() {
  const currentlyOpen = getDesktopVideoPlayerState();
  overlayElem.style.display = currentlyOpen ? "none" : "block";
  setVideoPlayerState(!currentlyOpen);
}

function getDesktopVideoPlayerState() {
  return JSON.parse(localStorage.getItem("desktopVideoPlayerOpen") ?? "false");
}

function setVideoPlayerState(open) {
  localStorage.setItem("desktopVideoPlayerOpen", JSON.stringify(open));
}
