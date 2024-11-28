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

document.getElementById("back-btn").addEventListener("click", transitionFromFullScreenPlayerMobile);
