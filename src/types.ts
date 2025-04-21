export interface Block {
  end: number;
  bufferEnd: number;
  bufferStart: number;
  loaded: boolean;
  percentageHeight: number;
  start: number;
}

/**
 * Parameters passed to the intersection callback when a block comes into view.
 *
 * @interface IntersectionParams
 */
export interface IntersectionParams {
  /**
   * The end index of the block that was intersected (inclusive).
   */
  end: number;

  /**
   * The index of the unloaded item that triggered the intersection.
   */
  index: number;

  /**
   * The start index of the block that was intersected (inclusive).
   */
  start: number;
}
