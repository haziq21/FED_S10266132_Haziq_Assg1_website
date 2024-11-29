let mainPageScroll;
const mediaQuery = window.matchMedia("(min-width: 600px)");

function handleMediaQueryChange(e) {
  if (e.matches) {
    document.querySelector(".player").removeEventListener("click", transitionToFullScreenPlayerMobile);
  } else {
    document.querySelector(".player").addEventListener("click", transitionToFullScreenPlayerMobile);
  }
}

mediaQuery.addEventListener("change", handleMediaQueryChange);
handleMediaQueryChange(mediaQuery);
document.getElementById("back-btn").addEventListener("click", transitionFromFullScreenPlayerMobile);

const extraContentElem = document.getElementById("extra-content");
const videoElem = document.getElementById("extra-content__video");
const mainElem = document.getElementById("main");
const fixedWhenStaticElems = document.querySelectorAll(".extra-content .fixed-when-static");

function transitionToFullScreenPlayerMobile() {
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
      },
      { once: true }
    );
  });
}

function transitionFromFullScreenPlayerMobile() {
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
    },
    { once: true }
  );
}

const totalRuntime = 140_000; // In milliseconds
const startTime = Date.now();

function updateTimeline() {
  const elapsedRuntime = Date.now() - startTime;
  document
    .querySelectorAll(".player__elapsed, .extra-player__elapsed")
    .forEach((el) => (el.style.width = `${(elapsedRuntime / totalRuntime) * 100}%`));

  const remainingMinutes = Math.floor(elapsedRuntime / 1000 / 60);
  const remainingSeconds = String(Math.round((elapsedRuntime / 1000) % 60));
  document
    .querySelectorAll(".player__timestamp:nth-of-type(1), .extra-player__timestamp:nth-of-type(1)")
    .forEach((el) => (el.textContent = `${remainingMinutes}:${remainingSeconds.padStart(2, "0")}`));

  // Keep updating the elapsed time until the song finished
  if (elapsedRuntime < totalRuntime) requestAnimationFrame(updateTimeline);
}

requestAnimationFrame(updateTimeline);
