# react-block-observer

<a href="https://www.npmjs.com/package/react-block-observer"><img alt="Available on NPM" src="https://img.shields.io/npm/v/react-block-observer" /></a>
<a href="https://github.com/jlp-craigmorten/react-block-observer/actions/workflows/test.yml"><img alt="Test workflows" src="https://github.com/jlp-craigmorten/react-block-observer/workflows/Test/badge.svg" /></a>
<a href="https://github.com/jlp-craigmorten/react-block-observer/blob/main/LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/jlp-craigmorten/react-block-observer" /></a>

A React library for efficiently loading content in vertical lists by tracking continuous blocks of loaded and unloaded items and observing when unloaded blocks come into view using the [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

## Installation

```bash
# Using npm
npm install react-block-observer

# Using yarn
yarn add react-block-observer

# Using pnpm
pnpm add react-block-observer
```

## Usage

```tsx
// Number of items before an unloaded block comes into view to trigger the
// intersection callback.
const BUFFER_SIZE = 10;

// Number of items to fetch either side of the intersection index.
const BATCH_SIZE = 25;

const MyListComponent = () => {
  const handleIntersection = useCallback(({ index, start, end }) => {
    // In this example we fetch a batch either side of the `index.
    // You could also choose to always load past the index etc.
    const batchStart = Math.max(start, Math.floor(index - BATCH_SIZE));
    const batchEnd = Math.min(end, Math.ceil(index + BATCH_SIZE));

    try {
      // Simulate fetching items for the desired range.
      const items = await fetchItems(batchStart, batchEnd);

      // If successful then we return the loaded start - end range and the
      // `BlockObserver` handles the update to blocks.
      return { start: batchStart, end: batchEnd };
    } catch {
      // If there is an error then not returning results in no change to the
      // `BlockObserver` blocks.
    }
  }, []);

  return (
    <div className="list-container">
      <List />

      {/* Place the `<BlockObserver />` component as a sibling to your list in the same scroll container */}
      <BlockObserver
        size={TOTAL_ITEMS}
        buffer={BUFFER_SIZE}
        onIntersection={handleIntersection}
      />
    </div>
  );
};
```

## API

### `BlockObserver`

The `BlockObserver` component observes blocks in a list and triggers a callback when unloaded blocks come into view. It is designed to work alongside a scrollable list to dynamically load content as needed.

#### Props

- **`size`** _(number, **required**)_: The total number of items in the list.

- **`buffer`** _(number, optional)_: The size of the leading and trailing buffer regions. This is the number of items before and after an unloaded block that will also trigger the loading of the block. Defaults to `0`.

- **`onIntersection`** _(function, **required**)_: A callback function triggered when an unloaded block comes into view. The function receives an `IntersectionParams` object and should return a `Promise` resolving to a `LoadRange` object or `undefined`.

  ```ts
  export interface IntersectionParams {
    /**
     * The index of the unloaded item that triggered the intersection.
     */
    index: number;

    /**
     * The start index of the block that was intersected (inclusive).
     */
    start: number;

    /**
     * The end index of the block that was intersected (inclusive).
     */
    end: number;
  }

  interface LoadRange {
    /**
     * The end index of the items that should be marked as successfully loaded.
     */
    end: number;

    /**
     * The start index of the items that should be marked as successfully loaded.
     */
    start: number;
  }

  type OnIntersection = (
    params: IntersectionParams
  ) => Promise<LoadRange | undefined> | LoadRange | undefined;
  ```

## Video

See below for a video where the mechanism behind this package was presented back in 2019 at the React London meet up:

[![React London 2019](https://img.youtube.com/vi/3FhcYQEnb_I/0.jpg)](https://www.youtube.com/watch?v=3FhcYQEnb_I&t=795)

## Resources

- [Contributing](.github/CONTRIBUTING.md)
- [Changelog](https://github.com/jlp-craigmorten/react-block-observer/releases)
- [MIT License](https://github.com/jlp-craigmorten/react-block-observer/blob/main/LICENSE)
