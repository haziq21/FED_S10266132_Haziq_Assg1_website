export class Timeline {
  startTime = Date.now();
  cursor = { x: 0, y: 0 };
  adjusting = false;
  pointerDownHandler = this.handlePointerDown.bind(this);

  /**
   * @typedef {Object} TimelineElements
   * @property {HTMLElement} timeline
   * @property {HTMLElement} progressLine
   * @property {HTMLElement} elapsedTimestamp
   * @property {HTMLElement} runtimeTimestamp
   */

  /**
   * @param {number} runtime Total runtime of the song in milliseconds
   * @param {TimelineElements} bindTo Relevant elements to bind to
   */
  constructor(runtime, bindTo) {
    this.totalRuntime = runtime;
    this.bind(bindTo);

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
    const e = Date.now() - this.startTime;
    this.elapsedRuntime = this.adjustedElapsedRuntime ?? e;
    if (e < this.totalRuntime) requestAnimationFrame(this.startUpdateLoop.bind(this));
  }

  /**
   * Updates the timeline to reflect the elapsed runtime (in milliseconds).
   * @param {number} t Elapsed runtime in milliseconds
   */
  set elapsedRuntime(t) {
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

  handlePointerDown() {
    this.adjusting = true;
  }

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
   * Update DOM bindings for the timeline.
   * @param {TimelineElements} el
   */
  bind(el) {
    this.el = el;
    this.el.runtimeTimestamp.textContent = this.getTimestamp(this.totalRuntime);
    this.el.timeline.removeEventListener("mousedown", this.pointerDownHandler);
    this.el.timeline.removeEventListener("touchstart", this.pointerDownHandler);
    this.el.timeline.addEventListener("mousedown", this.handlePointerDown.bind(this));
    this.el.timeline.addEventListener("touchstart", this.handlePointerDown.bind(this));
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
