/**
 * Responsive video loader that swaps sources based on viewport width.
 * Only the matching source is applied so mobile users never download the desktop asset (and vice versa).
 */
class ResponsiveVideo extends HTMLElement {
  #videoEl = null;
  #currentSrc = null;
  #resizeRaf = 0;
  #boundResize = null;

  connectedCallback() {
    this.#videoEl = this.querySelector("video");
    if (!this.#videoEl) {
      return;
    }
    this.attachEvents();
    this.updateSource();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  /**
   * Sets up listeners that keep the video source aligned with the viewport.
   */
  attachEvents() {
    if (typeof window === "undefined" || this.#boundResize) {
      return;
    }

    this.#boundResize = () => {
      if (this.#resizeRaf) {
        return;
      }
      this.#resizeRaf = requestAnimationFrame(() => {
        this.#resizeRaf = 0;
        this.updateSource();
      });
    };

    window.addEventListener("resize", this.#boundResize, { passive: true });
  }

  /**
   * Removes listeners and cancels pending work.
   */
  detachEvents() {
    if (typeof window !== "undefined" && this.#boundResize) {
      window.removeEventListener("resize", this.#boundResize);
    }
    if (this.#resizeRaf) {
      cancelAnimationFrame(this.#resizeRaf);
      this.#resizeRaf = 0;
    }
    this.#boundResize = null;
  }

  /**
   * Calculates which source should be active and updates the video if needed.
   */
  updateSource() {
    if (!this.#videoEl) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }

    const breakpoint = this.#getBreakpoint();
    const mobileVideo = this.getAttribute("mobile-video")?.trim() || "";
    const desktopVideo = this.getAttribute("desktop-video")?.trim() || "";
    const mobilePoster = this.getAttribute("mobile-poster")?.trim() || "";
    const desktopPoster = this.getAttribute("desktop-poster")?.trim() || "";
    const viewportWidth = window.innerWidth || 0;

    let nextMode = null;
    let nextVideo = "";
    let nextPoster = "";

    if (viewportWidth >= breakpoint && desktopVideo) {
      nextMode = "desktop";
      nextVideo = desktopVideo;
      nextPoster = desktopPoster;
    } else if (mobileVideo) {
      nextMode = "mobile";
      nextVideo = mobileVideo;
      nextPoster = mobilePoster;
    } else if (desktopVideo) {
      // Fallback to desktop when mobile video is missing.
      nextMode = "desktop";
      nextVideo = desktopVideo;
      nextPoster = desktopPoster;
    }

    if (!nextVideo) {
      return;
    }

    if (nextVideo === this.#currentSrc) {
      return;
    }

    this.#applySource(nextVideo, nextPoster, nextMode);
  }

  #getBreakpoint() {
    const attr = this.getAttribute("breakpoint");
    const parsed = parseInt(attr ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 768;
  }

  #applySource(videoUrl, posterUrl, mode) {
    const video = this.#videoEl;
    if (!video) {
      return;
    }

    const currentSrc = video.getAttribute("src");
    if (currentSrc === videoUrl) {
      this.#currentSrc = videoUrl;
      if (mode) {
        this.setAttribute("mode", mode);
      }
      return;
    }

    video.setAttribute("src", videoUrl);

    if (posterUrl) {
      video.setAttribute("poster", posterUrl);
    } else {
      video.removeAttribute("poster");
    }

    video.load();

    if (video.autoplay && typeof video.play === "function") {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Most browsers require muted autoplay; ignore failures quietly.
        });
      }
    }

    this.#currentSrc = videoUrl;
    if (mode) {
      this.setAttribute("mode", mode);
    } else {
      this.removeAttribute("mode");
    }
  }
}

if (!customElements.get("responsive-video")) {
  customElements.define("responsive-video", ResponsiveVideo);
}

export { ResponsiveVideo };
//# sourceMappingURL=responsive-video.esm.js.map
