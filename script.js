import { Timeline } from "./timeline.js";

const mainTimelineElems = {
  timeline: document.querySelector(".player__timeline"),
  progressLine: document.querySelector(".player__elapsed"),
  elapsedTimestamp: document.querySelector(".player__timestamp:nth-of-type(1)"),
  runtimeTimestamp: document.querySelector(".player__timestamp:nth-of-type(2)"),
  playerBtn: document.getElementById("player-btn"),
  playerBtnClasses: { playing: "player__btn--playing", paused: "player__btn--paused" },
};
const overlayTimelineElems = {
  timeline: document.querySelector(".extra-player__timeline"),
  progressLine: document.querySelector(".extra-player__elapsed"),
  elapsedTimestamp: document.querySelector(".extra-player__timestamp:nth-of-type(1)"),
  runtimeTimestamp: document.querySelector(".extra-player__timestamp:nth-of-type(2)"),
  playerBtn: document.getElementById("extra-player-btn"),
  playerBtnClasses: { playing: "extra-player__btn--playing", paused: "extra-player__btn--paused" },
};
const timeline = new Timeline(140_000, mainTimelineElems, false);

// The back button on mobile will close the full-screen video player
document.getElementById("back-btn").addEventListener("click", closeFullScreenPlayerMobile);

// Get the DOM elements needed to open/close the video players
const overlayElem = document.getElementById("overlay");
const mainElem = document.getElementById("main");
const fixedOverlayChildElems = document.querySelectorAll(".overlay .fixed-when-overlaid");

// Media query to update state-dependent styles when the screen size changes
const mediaQuery = window.matchMedia("(min-width: 600px)");
mediaQuery.addEventListener("change", handleMediaQueryChange);
handleMediaQueryChange(mediaQuery);

/**
 * Update relevant video player styles and event listeners when the screen size changes
 * from mobile to desktop or vice versa. This should also be run when the document loads
 * to register event listeners for the buttons that open/close the video players.
 * @param {MediaQueryList} e
 */
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

/**
 * Open the full-screen video player on mobile.
 */
function openFullScreenPlayerMobile() {
  timeline.bind(overlayTimelineElems);

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
        setVideoPlayerState(true);
      },
      { once: true }
    );
  });
}

/**
 * Close the full-screen video player (i.e. go back to the homepage) on mobile.
 */
function closeFullScreenPlayerMobile() {
  timeline.bind(mainTimelineElems);

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
      setVideoPlayerState(false);
    },
    { once: true }
  );
}

/**
 * Open or close the video player on desktop.
 */
function toggleVideoPlayerDesktop() {
  const currentlyOpen = getDesktopVideoPlayerState();
  overlayElem.style.display = currentlyOpen ? "none" : "block";
  setVideoPlayerState(!currentlyOpen);
}

/**
 * Update styles and bind the `Timeline` to the appropriate DOM elements, to be
 * called when the screen size changes from a mobile size to a desktop size.
 * @param {boolean} playerIsOpen Whether the video player is open
 */
function transitionFromMobileToDesktop(playerIsOpen) {
  overlayElem.style.position = "relative";
  overlayElem.style.top = "unset";
  fixedOverlayChildElems.forEach((el) => (el.style.position = "relative"));

  if (playerIsOpen) {
    timeline.bind(mainTimelineElems);
    overlayElem.style.display = "block";
    mainElem.style.display = "block";
  }
}

/**
 * Update styles and bind the `Timeline` to the appropriate DOM elements, to be
 * called when the screen size changes from a desktop size to a mobile size.
 * @param {boolean} playerIsOpen Whether the video player is open
 */
function transitionFromDesktopToMobile(playerIsOpen) {
  if (playerIsOpen) {
    timeline.bind(overlayTimelineElems);
    overlayElem.style.position = "absolute";
    overlayElem.style.top = "0";
    overlayElem.style.display = "block";
    fixedOverlayChildElems.forEach((elem) => (elem.style.position = "fixed"));
    mainElem.style.display = "none";
  } else {
    overlayElem.style.position = "fixed";
    overlayElem.style.top = "100vh";
    mainElem.style.display = "block";
  }
}

/**
 * Gets the state of the video player (open or closed) from LocalStorage.
 * @returns {boolean}
 */
function getDesktopVideoPlayerState() {
  return JSON.parse(localStorage.getItem("desktopVideoPlayerOpen") ?? "false");
}

/**
 * Sets the state of the video player (open or closed) in LocalStorage.
 * @param {boolean} open Whether the video player is open.
 */
function setVideoPlayerState(open) {
  localStorage.setItem("desktopVideoPlayerOpen", JSON.stringify(open));
}
