export class Timeline {
  cursor = { x: 0, y: 0 };
  adjusting = false;
  #paused = false;

  /**
   * @typedef {Object} TimelineElements
   * @property {HTMLElement} timeline
   * @property {HTMLElement} progressLine
   * @property {HTMLElement} elapsedTimestamp
   * @property {HTMLElement} runtimeTimestamp
   * @property {HTMLElement} playerBtn
   * @property {{playing: string, paused: string}} playerBtnClasses Classes to apply to the player button to indicate playing/paused state
   */

  /**
   * @param {number} runtime Total runtime of the song in milliseconds
   * @param {TimelineElements} bindTo Relevant elements to bind to
   * @param {boolean} paused Whether the timeline is paused
   * @param {number} startTime The time (Unix timestamp) the song started playing
   * @param {number} pausedTime The time (Unix timestamp) the song was last paused
   */
  constructor(runtime, bindTo, paused, startTime, pausedTime) {
    this.totalRuntime = runtime;
    this.bind(bindTo); // .bind() relies on this.totalRuntime to update the timestamp UI
    this.paused = paused; // Setting this.paused relies on this.el being set (in .bind()) to update the button icon
    this.startTime = startTime ?? Date.now();
    this.pausedTime = pausedTime;

    // Set initial timestamp value
    this.el.elapsedTimestamp.textContent = "0:00";

    // Bind event listeners (both mouse and touch to support desktop and mobile)
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
    window.addEventListener("touchmove", this.handleTouchMove.bind(this));
    window.addEventListener("mouseup", this.handlePointerUp.bind(this));
    window.addEventListener("touchend", this.handlePointerUp.bind(this));

    this.startUpdateLoop();
  }

  /**
   * Starts the update loop to update the timeline.
   */
  startUpdateLoop() {
    // No UI to update if the player is paused and the user isn't dragging the timeline
    if (this.paused && !this.adjusting) return;

    const e = Date.now() - this.startTime;
    this.elapsedRuntime = this.adjustedElapsedRuntime ?? e;
    if (e < this.totalRuntime) requestAnimationFrame(this.startUpdateLoop.bind(this));
    else {
      this.paused = true;
      this.pausedTime = Date.now();
    }
  }

  /**
   * Updates the timeline to reflect the elapsed runtime (in milliseconds).
   * @param {number} t Elapsed runtime in milliseconds
   */
  set elapsedRuntime(t) {
    t = Math.min(t, this.totalRuntime);
    this.el.progressLine.style.width = `${(t / this.totalRuntime) * 100}%`;
    this.el.elapsedTimestamp.textContent = this.getTimestamp(t);
  }

  /**
   * Returns the elapsed runtime duration (in milliseconds) that the user
   * is adjusting the timeline to (i.e. by dragging on the timeline).
   * @returns {number | null}
   */
  get adjustedElapsedRuntime() {
    if (!this.adjusting) return null;
    const { left, width } = this.el.timeline.getBoundingClientRect();
    return this.totalRuntime * Math.min(Math.max((this.cursor.x - left) / width, 0), 1);
  }

  get paused() {
    return this.#paused;
  }

  set paused(p) {
    this.#paused = p;

    // Update the UI accordingly
    if (this.#paused) {
      this.el.playerBtn.classList.remove(this.el.playerBtnClasses.playing);
      this.el.playerBtn.classList.add(this.el.playerBtnClasses.paused);
    } else {
      this.el.playerBtn.classList.remove(this.el.playerBtnClasses.paused);
      this.el.playerBtn.classList.add(this.el.playerBtnClasses.playing);
      this.startTime += Date.now() - this.pausedTime;
    }
  }

  handlePointerDown() {
    this.adjusting = true;
    if (this.paused) this.startUpdateLoop();
  }

  handlePointerDownWithThis = this.handlePointerDown.bind(this);

  /**
   * Updates `this.cursor` to reflect the current mouse position.
   * @param {MouseEvent} e
   */
  handleMouseMove(e) {
    this.cursor = { x: e.clientX, y: e.clientY };
  }

  /**
   * Updates `this.cursor` to reflect the current touch position.
   * @param {TouchEvent} e
   */
  handleTouchMove(e) {
    this.cursor = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  /**
   * Updates `this.startTime` to reflect the adjusted elapsed runtime.
   */
  handlePointerUp() {
    if (!this.adjusting) return;
    this.startTime = Date.now() - this.adjustedElapsedRuntime;
    this.adjusting = false;
  }

  /**
   * Pause/play the timeline when the pause/play button is clicked.
   * @param {MouseEvent} e
   */
  handlePauseToggle(e) {
    this.paused = !this.paused;
    this.pausedTime = Date.now();
    if (!this.paused) this.startUpdateLoop();
    e.stopPropagation();
  }

  handlePauseToggleWithThis = this.handlePauseToggle.bind(this);

  /**
   * Update DOM bindings for the timeline.
   * @param {TimelineElements} el
   */
  bind(el) {
    this.el?.timeline.removeEventListener("mousedown", this.handlePointerDownWithThis);
    this.el?.timeline.removeEventListener("touchstart", this.handlePointerDownWithThis, { passive: true });
    this.el?.playerBtn.removeEventListener("click", this.handlePauseToggleWithThis);

    this.el = el;

    // Update all the UI appropriately
    this.el.runtimeTimestamp.textContent = this.getTimestamp(this.totalRuntime);
    if (this.paused) {
      this.el.playerBtn.classList.remove(this.el.playerBtnClasses.playing);
      this.el.playerBtn.classList.add(this.el.playerBtnClasses.paused);
      this.elapsedRuntime = this.pausedTime - this.startTime;
    } else {
      this.el.playerBtn.classList.remove(this.el.playerBtnClasses.paused);
      this.el.playerBtn.classList.add(this.el.playerBtnClasses.playing);
    }

    this.el.timeline.addEventListener("mousedown", this.handlePointerDownWithThis);
    this.el.timeline.addEventListener("touchstart", this.handlePointerDownWithThis, { passive: true });
    this.el.playerBtn.addEventListener("click", this.handlePauseToggleWithThis);
  }

  /**
   * Converts a duration to its timestamp representation (e.g. "1:05").
   * @param {number} duration Duration in milliseconds
   * @returns {string}
   */
  getTimestamp(duration) {
    const elapsedMinutes = Math.floor(duration / 1000 / 60);
    const elapsedSeconds = Math.floor((duration / 1000) % 60);
    return `${elapsedMinutes}:${String(elapsedSeconds).padStart(2, "0")}`;
  }
}
