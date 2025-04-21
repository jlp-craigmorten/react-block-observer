import type React from 'react';
import { useCallback, useState } from 'react';
import { BlockObserver, type IntersectionParams } from '../../../src/';
import { fetchItems } from './api/mockApi';
import VirtualList from './components/VirtualList';

const TOTAL_ITEMS = 10000;
const BATCH_SIZE = 50;
const BUFFER_SIZE = 40;

const App: React.FC = () => {
  const [loadedItems, setLoadedItems] = useState<Record<number, string>>({});

  const handleIntersection = useCallback(
    async ({
      index,
      start,
      end,
    }: IntersectionParams): Promise<
      { start: number; end: number } | undefined
    > => {
      const batchStart = Math.max(start, Math.floor(index - BATCH_SIZE / 2));
      const batchEnd = Math.min(end, Math.ceil(index + BATCH_SIZE / 2));

      try {
        const items = await fetchItems(batchStart, batchEnd);

        setLoadedItems((prev) => ({ ...prev, ...items }));

        return { start: batchStart, end: batchEnd };
      } catch {
        // Swallow error
      }
    },
    [],
  );

  return (
    <div className="app-container">
      <header>
        <h1>Virtual List with BlockObserver</h1>
        <p>Scroll to dynamically load {TOTAL_ITEMS.toLocaleString()} items</p>
      </header>

      <div className="virtual-list-scroll-container">
        <div className="virtual-list-container">
          <VirtualList
            totalItems={TOTAL_ITEMS}
            itemHeight={50}
            renderItem={(index: number) => (
              <div className="list-item">
                <div className="item-content">
                  {loadedItems[index] || `Item #${index + 1} - Loading...`}
                </div>
              </div>
            )}
          />

          <BlockObserver
            size={TOTAL_ITEMS}
            buffer={BUFFER_SIZE}
            onIntersection={handleIntersection}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
