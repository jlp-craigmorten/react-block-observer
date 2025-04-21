import React, { useCallback, useEffect, useState } from 'react';

interface VirtualListProps {
  totalItems: number;
  itemHeight: number;
  renderItem: (index: number) => React.ReactNode;
  overscansize?: number;
}

const VirtualList: React.FC<VirtualListProps> = ({
  totalItems,
  itemHeight,
  renderItem,
  overscansize = 20,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setContainerHeight(height);
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate visible range
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscansize,
  );
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscansize,
  );

  // Create items to render
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          left: 0,
          right: 0,
        }}
      >
        {renderItem(i)}
      </div>,
    );
  }

  return (
    <div
      ref={containerRef}
      className="virtual-list"
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalItems * itemHeight,
          position: 'relative',
        }}
      >
        {visibleItems}
      </div>
    </div>
  );
};

export default VirtualList;
