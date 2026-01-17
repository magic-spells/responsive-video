/**
 * Responsive video loader that swaps sources based on viewport width.
 * Only the matching source is applied so mobile users never download the desktop asset (and vice versa).
 */
export declare class ResponsiveVideo extends HTMLElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
  attachEvents(): void;
  detachEvents(): void;
  updateSource(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    "responsive-video": ResponsiveVideo;
  }
}
