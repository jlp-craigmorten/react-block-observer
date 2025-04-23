import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { IntersectionObserver } from './IntersectionObserver';
import type { IntersectionParams } from './types';

let mockIntersectionObserver: {
  observe: Mock;
  unobserve: Mock;
  disconnect: Mock;
};

let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

describe('IntersectionObserver component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockIntersectionObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    window.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      intersectionCallback = callback;

      return mockIntersectionObserver;
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render with correct styles', () => {
    const { container } = render(
      <IntersectionObserver
        bufferEnd={10}
        bufferStart={0}
        end={10}
        start={0}
        onIntersection={vi.fn()}
      />,
    );

    expect(container.firstChild).toHaveStyle({
      boxSizing: 'border-box',
      display: 'block',
      height: '100%',
      width: '100%',
    });
  });

  it('should initialize an IntersectionObserver with a callback function and a 0 threshold and root margin', () => {
    render(
      <IntersectionObserver
        bufferEnd={10}
        bufferStart={0}
        end={10}
        start={0}
        onIntersection={vi.fn()}
      />,
    );

    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0,
        rootMargin: '0px',
      },
    );
  });

  it('should instruct the IntersectionObserver to observe the rendered div', () => {
    const { container } = render(
      <IntersectionObserver
        bufferEnd={10}
        bufferStart={0}
        end={10}
        start={0}
        onIntersection={vi.fn()}
      />,
    );

    expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(
      container.firstChild,
    );
  });

  it('should not call the provided `onIntersection` when the div is not intersecting with the viewport', () => {
    const onIntersection = vi.fn();

    render(
      <IntersectionObserver
        bufferEnd={10}
        bufferStart={0}
        end={10}
        start={0}
        onIntersection={onIntersection}
      />,
    );

    const mockEntry = {
      isIntersecting: false,
    } as IntersectionObserverEntry;

    intersectionCallback([mockEntry]);

    expect(onIntersection).not.toHaveBeenCalled();
    expect(mockIntersectionObserver.unobserve).not.toHaveBeenCalled();
  });

  it('should stop observing the div and call the provided `onIntersection` when the div intersects with the viewport', () => {
    const onIntersection = vi.fn();

    render(
      <IntersectionObserver
        bufferEnd={100}
        bufferStart={0}
        end={100}
        start={0}
        onIntersection={onIntersection}
      />,
    );

    const mockEntry = {
      isIntersecting: true,
      boundingClientRect: {
        top: -50,
        height: 100,
      } as DOMRectReadOnly,
      intersectionRect: {
        height: 50,
      } as DOMRectReadOnly,
    } as IntersectionObserverEntry;

    intersectionCallback([mockEntry]);

    expect(onIntersection).toHaveBeenCalledWith({
      index: 75,
      start: 0,
      end: 100,
    });
    expect(mockIntersectionObserver.unobserve).toHaveBeenCalled();
  });

  it('should handle different buffer ranges correctly', () => {
    const onIntersection = vi.fn();

    render(
      <IntersectionObserver
        bufferEnd={450}
        bufferStart={150}
        end={400}
        start={200}
        onIntersection={onIntersection}
      />,
    );

    const mockEntry = {
      isIntersecting: true,
      boundingClientRect: {
        top: -25,
        height: 100,
      } as DOMRectReadOnly,
      intersectionRect: {
        height: 75,
      } as DOMRectReadOnly,
    } as IntersectionObserverEntry;

    intersectionCallback([mockEntry]);

    expect(onIntersection).toHaveBeenCalledWith({
      index: 338,
      start: 200,
      end: 400,
    } as IntersectionParams);
  });

  it('should handle buffer calculation at the top of the element correctly', () => {
    const onIntersection = vi.fn();

    render(
      <IntersectionObserver
        bufferEnd={100}
        bufferStart={0}
        end={100}
        start={0}
        onIntersection={onIntersection}
      />,
    );

    const mockEntry = {
      isIntersecting: true,
      boundingClientRect: {
        top: 0,
        height: 100,
      } as DOMRectReadOnly,
      intersectionRect: {
        height: 50,
      } as DOMRectReadOnly,
    } as IntersectionObserverEntry;

    intersectionCallback([mockEntry]);

    expect(onIntersection).toHaveBeenCalledWith({
      index: 25,
      start: 0,
      end: 100,
    });
  });

  it('should disconnect the observer when the div unmounts', () => {
    const { unmount } = render(
      <IntersectionObserver
        bufferEnd={10}
        bufferStart={0}
        end={10}
        start={0}
        onIntersection={vi.fn()}
      />,
    );

    unmount();

    expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
  });
});
