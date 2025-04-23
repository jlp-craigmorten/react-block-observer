import { useCallback, useState } from 'react';
import { IntersectionObserver } from './IntersectionObserver';
import { processBlocks } from './processBlocks';

import type { CSSProperties, FC } from 'react';
import type { Block, IntersectionParams } from './types';

const CONTAINER_STYLE: CSSProperties = {
  boxSizing: 'border-box',
  display: 'block',
  height: '100%',
  left: 0,
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width: '100%',
};

export interface LoadRange {
  /**
   * The end index of the items that should be marked asx successfully loaded.
   */
  end: number;

  /**
   * The start index of the items that should be marked asx successfully loaded.
   */
  start: number;
}

/**
 * Callback function triggered when a block comes into view.
 *
 * @param {IntersectionParams} params Information about the block that was
 * intersected.
 *
 * @returns {Promise<LoadRange | undefined> | LoadRange | undefined} The start index and
 * end index of the items that should be marked as successfully loaded, a
 * promise resolving to this information, or undefined or a promise resolving to
 * undefined if no update is required.
 */
export type OnIntersection = (
  params: IntersectionParams,
) => Promise<LoadRange | undefined> | LoadRange | undefined;

export interface BlockObserverProps {
  /**
   * Size of the leading and trailing buffer regions.
   *
   * This is the number of items before and after an unloaded block that will
   * also trigger the loading of the block.
   *
   * This is useful for preloading blocks that are likely to come into view.
   *
   * @default 0
   */
  buffer?: number;

  /**
   * Callback function triggered when an unloaded block comes into view.
   *
   * @param {IntersectionParams} params Information about the block that was
   * intersected.
   *
   * @returns {Promise<LoadRange | undefined> | LoadRange | undefined} The start index
   * and end index of the items that should be marked as successfully loaded, a
   * promise resolving to this information, or undefined or a promise resolving to
   * undefined if no update is required.
   */
  onIntersection: OnIntersection;

  /**
   * Total number of items in the list.
   */
  size: number;
}

/**
 * Observes blocks in a list and triggers a callback when unloaded blocks come
 * into view.
 *
 * The component places itself as an invisible, inert, overlay above the list
 * to detect when the user navigates to areas that need loading.
 */
export const BlockObserver: FC<BlockObserverProps> = ({
  buffer = 0,
  onIntersection,
  size,
}) => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      bufferEnd: size - 1,
      bufferStart: 0,
      end: size - 1,
      loaded: false,
      percentageHeight: 100,
      start: 0,
    },
  ]);

  const updateBlocks = useCallback(
    ({
      end: loadedEnd,
      start: loadedStart,
    }: {
      end: number;
      start: number;
    }) => {
      setBlocks((previousBlocks) =>
        processBlocks(previousBlocks, {
          buffer,
          loadedEnd,
          loadedStart,
          size,
        }),
      );
    },
    [buffer, size],
  );

  const handleIntersection = useCallback(
    async (params: IntersectionParams) => {
      const result = await onIntersection(params);

      if (result) {
        updateBlocks(result);
      }
    },
    [onIntersection, updateBlocks],
  );

  if (blocks.length === 1 && blocks[0].loaded) {
    return null;
  }

  return (
    <div inert aria-hidden style={CONTAINER_STYLE}>
      {blocks.map((block) => {
        const { loaded, start, end, bufferStart, bufferEnd, percentageHeight } =
          block;

        return (
          <div
            key={start}
            style={{
              boxSizing: 'border-box',
              display: 'block',
              height: `${percentageHeight}%`,
              width: '100%',
            }}
          >
            {!loaded && (
              <IntersectionObserver
                onIntersection={handleIntersection}
                start={start}
                end={end}
                bufferStart={bufferStart}
                bufferEnd={bufferEnd}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
