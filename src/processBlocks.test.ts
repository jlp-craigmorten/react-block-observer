import { describe, expect, it } from 'vitest';
import { processBlocks } from './processBlocks';
import type { Block } from './types';

describe('processBlocks', () => {
  const createBlock = (
    start: number,
    end: number,
    loaded = false,
    percentageHeight = 100,
    bufferStart = start,
    bufferEnd = end,
  ): Block => ({
    start,
    end,
    bufferStart,
    bufferEnd,
    loaded,
    percentageHeight,
  });

  it('should handle an initially empty list of blocks', () => {
    const result = processBlocks([], {
      buffer: 0,
      loadedStart: 0,
      loadedEnd: 9,
      size: 100,
    });

    expect(result).toEqual([]);
  });

  it('should handle loading in the middle of a single unloaded block', () => {
    const blocks = [createBlock(0, 99)];
    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 40,
      loadedEnd: 59,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 39, false, 40));
    expect(result[1]).toEqual(createBlock(40, 59, true, 20));
    expect(result[2]).toEqual(createBlock(60, 99, false, 40));
  });

  it('should merge adjacent blocks with the same loaded status', () => {
    const blocks = [
      createBlock(0, 19, false),
      createBlock(20, 39, true),
      createBlock(40, 99, false),
    ];

    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 40,
      loadedEnd: 59,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 19, false, 20));
    expect(result[1]).toEqual(createBlock(20, 59, true, 40));
    expect(result[2]).toEqual(createBlock(60, 99, false, 40));
  });

  it('should handle loading at the start of the list', () => {
    const blocks = [createBlock(0, 99)];
    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 0,
      loadedEnd: 20,
      size: 100,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(createBlock(0, 20, true, 21));
    expect(result[1]).toEqual(createBlock(21, 99, false, 79));
  });

  it('should handle loading at the end of the list', () => {
    const blocks = [createBlock(0, 99)];
    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 80,
      loadedEnd: 99,
      size: 100,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(createBlock(0, 79, false, 80));
    expect(result[1]).toEqual(createBlock(80, 99, true, 20));
  });

  it('should respect buffer zones when loading blocks', () => {
    const blocks = [createBlock(0, 99, false, 100)];

    const buffer = 5;
    const loadedStart = 40;
    const loadedEnd = 59;
    const size = 100;

    const result = processBlocks(blocks, {
      buffer,
      loadedStart,
      loadedEnd,
      size,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 39, false, 45, 0, 44));
    expect(result[1]).toEqual(createBlock(40, 59, true, 10, 45, 54));
    expect(result[2]).toEqual(createBlock(60, 99, false, 45, 55, 99));
  });

  it('should handle the entire range being loaded', () => {
    const blocks = [createBlock(0, 99)];

    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 0,
      loadedEnd: 99,
      size: 100,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(createBlock(0, 99, true, 100));
  });

  it('should handle loading a block that overlaps an existing loaded block', () => {
    const blocks = [
      createBlock(0, 39, false),
      createBlock(40, 49, true),
      createBlock(50, 99, false),
    ];

    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 20,
      loadedEnd: 69,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 19, false, 20));
    expect(result[1]).toEqual(createBlock(20, 69, true, 50));
    expect(result[2]).toEqual(createBlock(70, 99, false, 30));
  });

  it('should handle a loaded block that overlaps the start of an existing loaded block', () => {
    const blocks = [
      createBlock(0, 39, false),
      createBlock(40, 79, true),
      createBlock(80, 99, false),
    ];

    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 20,
      loadedEnd: 49,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 19, false, 20));
    expect(result[1]).toEqual(createBlock(20, 79, true, 60));
    expect(result[2]).toEqual(createBlock(80, 99, false, 20));
  });

  it('should handle a loaded block that overlaps the end of an existing loaded block', () => {
    const blocks = [
      createBlock(0, 39, false),
      createBlock(40, 79, true),
      createBlock(80, 99, false),
    ];

    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 60,
      loadedEnd: 89,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 39, false, 40));
    expect(result[1]).toEqual(createBlock(40, 89, true, 50));
    expect(result[2]).toEqual(createBlock(90, 99, false, 10));
  });

  it('should handle filling a gap between two loaded blocks', () => {
    const blocks = [
      createBlock(0, 29, false, 35, 0, 34),
      createBlock(30, 49, true, 10, 35, 44),
      createBlock(50, 69, false, 30, 45, 74),
      createBlock(70, 99, true, 25, 75, 99),
    ];

    const result = processBlocks(blocks, {
      buffer: 5,
      loadedStart: 50,
      loadedEnd: 69,
      size: 100,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(createBlock(0, 29, false, 35, 0, 34));
    expect(result[1]).toEqual(createBlock(30, 99, true, 65, 35, 99));
  });

  it('should handle creating a block of size one', () => {
    const blocks = [createBlock(0, 99)];
    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 45,
      loadedEnd: 45,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 44, false, 45));
    expect(result[1]).toEqual(createBlock(45, 45, true, 1));
    expect(result[2]).toEqual(createBlock(46, 99, false, 54));
  });

  it('should handle leaving a block of size one', () => {
    const blocks = [
      createBlock(0, 39, true),
      createBlock(40, 79, false),
      createBlock(80, 99, true),
    ];

    const result = processBlocks(blocks, {
      buffer: 0,
      loadedStart: 40,
      loadedEnd: 78,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 78, true, 79));
    expect(result[1]).toEqual(createBlock(79, 79, false, 1));
    expect(result[2]).toEqual(createBlock(80, 99, true, 20));
  });

  it('should handle leaving a block of size one with buffers', () => {
    const blocks = [
      createBlock(0, 39, true, 30, 0, 29),
      createBlock(40, 79, false, 60, 30, 89),
      createBlock(80, 99, true, 10, 90, 99),
    ];

    const result = processBlocks(blocks, {
      buffer: 10,
      loadedStart: 40,
      loadedEnd: 78,
      size: 100,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(createBlock(0, 78, true, 69, 0, 68));
    expect(result[1]).toEqual(createBlock(79, 79, false, 21, 69, 89));
    expect(result[2]).toEqual(createBlock(80, 99, true, 10, 90, 99));
  });
});
