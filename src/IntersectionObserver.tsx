import { useEffect, useRef } from 'react';

import type { CSSProperties, FC } from 'react';
import type { IntersectionParams } from './types';

const INTERSECTION_OBSERVER_STYLE: CSSProperties = {
  boxSizing: 'border-box',
  display: 'block',
  height: '100%',
  width: '100%',
};

interface IntersectionObserverProps {
  bufferEnd: number;
  bufferStart: number;
  end: number;
  onIntersection: (params: IntersectionParams) => void;
  start: number;
}

export const IntersectionObserver: FC<IntersectionObserverProps> = ({
  bufferEnd,
  bufferStart,
  end,
  onIntersection,
  start,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = ref.current!;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        observer.unobserve(target);

        const { boundingClientRect, intersectionRect } = entry;

        const percentageObserver =
          (Math.abs(Math.min(0, boundingClientRect.top)) +
            intersectionRect.height / 2) /
          boundingClientRect.height;

        const bufferedOffset = Math.floor(
          percentageObserver * (bufferEnd - bufferStart + 1),
        );

        const index = Math.max(
          start,
          Math.min(bufferStart + bufferedOffset, end),
        );

        const params: IntersectionParams = {
          index,
          start,
          end,
        };

        onIntersection(params);
      },
      {
        threshold: 0,
        rootMargin: '0px',
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [bufferEnd, bufferStart, end, onIntersection, start]);

  return <div ref={ref} style={INTERSECTION_OBSERVER_STYLE} />;
};
