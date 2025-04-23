import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BlockObserver } from './BlockObserver';
import { IntersectionObserver } from './IntersectionObserver';

vi.mock('./IntersectionObserver', () => ({
  IntersectionObserver: vi.fn((props) => (
    <mock-intersection-observer data-testid="IntersectionObserver" {...props} />
  )),
}));

const mockIntersectionObserver = vi.mocked(IntersectionObserver);

describe('BlockObserver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with the correct container styles', () => {
    const { container } = render(
      <BlockObserver onIntersection={vi.fn()} size={10} />,
    );

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveAttribute('inert', '');
    expect(container.firstChild);
  });

  it('should initialize with a single unloaded block for the full size that contains an IntersectionObserver', () => {
    const { container } = render(
      <BlockObserver onIntersection={vi.fn()} size={10} />,
    );

    expect(container.firstChild!.childNodes).toHaveLength(1);
    expect(container.firstChild!.firstChild).toHaveStyle({
      boxSizing: 'border-box',
      display: 'block',
      height: '100%',
      width: '100%',
    });
    expect(container.firstChild!.firstChild).toContainElement(
      screen.getByTestId('IntersectionObserver'),
    );
  });

  it('should apply default buffer of 0', () => {
    render(<BlockObserver onIntersection={vi.fn()} size={10} />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        start: 0,
        end: 9,
        bufferStart: 0,
        bufferEnd: 9,
      }),
      undefined,
    );
  });

  it('should invoke the provided `onIntersection` callback when an intersection occurs', async () => {
    const onIntersection = vi.fn();

    render(<BlockObserver onIntersection={onIntersection} size={10} />);

    const handleIntersection =
      mockIntersectionObserver.mock.calls[0][0].onIntersection;

    const testParams = { index: 3, start: 0, end: 9 };

    await act(async () => {
      await handleIntersection(testParams);
    });

    expect(onIntersection).toHaveBeenCalledWith(testParams);
  });

  it('should not update blocks when the provided `onIntersection` returns `undefined`', async () => {
    const onIntersection = vi.fn().mockResolvedValue(undefined);

    const { container, rerender } = render(
      <BlockObserver onIntersection={onIntersection} size={10} />,
    );

    const handleIntersection =
      mockIntersectionObserver.mock.calls[0][0].onIntersection;

    await act(async () => {
      await handleIntersection({ index: 3, start: 0, end: 9 });
    });

    rerender(<BlockObserver onIntersection={onIntersection} size={10} />);

    expect(container.firstChild!.childNodes).toHaveLength(1);
  });

  it('should update blocks when onIntersection returns a `start` and `end` range', async () => {
    const onIntersection = vi.fn().mockResolvedValue({ start: 2, end: 5 });

    const { container, rerender } = render(
      <BlockObserver onIntersection={onIntersection} size={10} />,
    );

    const handleIntersection =
      mockIntersectionObserver.mock.calls[0][0].onIntersection;

    await act(async () => {
      await handleIntersection({ index: 3, start: 0, end: 9 });
    });

    rerender(<BlockObserver onIntersection={onIntersection} size={10} />);

    expect(container.firstChild!.childNodes).toHaveLength(3);
    expect(container.firstChild!.childNodes[0]).toHaveStyle({
      boxSizing: 'border-box',
      display: 'block',
      height: '20%',
      width: '100%',
    });
    expect(container.firstChild!.childNodes[0]).toContainElement(
      screen.getAllByTestId('IntersectionObserver')[0],
    );

    expect(container.firstChild!.childNodes[1]).toHaveStyle({
      boxSizing: 'border-box',
      display: 'block',
      height: '40%',
      width: '100%',
    });
    expect(container.firstChild!.childNodes[1]).toBeEmptyDOMElement();

    expect(container.firstChild!.childNodes[2]).toHaveStyle({
      boxSizing: 'border-box',
      display: 'block',
      height: '40%',
      width: '100%',
    });
    expect(container.firstChild!.childNodes[2]).toContainElement(
      screen.getAllByTestId('IntersectionObserver')[1],
    );
  });

  it('should return null when all blocks are loaded', async () => {
    const onIntersection = vi.fn().mockResolvedValue({ start: 0, end: 9 });

    const { container, rerender } = render(
      <BlockObserver onIntersection={onIntersection} size={10} />,
    );

    const handleIntersection =
      mockIntersectionObserver.mock.calls[0][0].onIntersection;

    await act(async () => {
      await handleIntersection({ index: 5, start: 0, end: 9 });
    });

    rerender(<BlockObserver onIntersection={onIntersection} size={10} />);

    expect(container).toBeEmptyDOMElement();
  });
});
