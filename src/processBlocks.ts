import type { Block } from './types';

const addBlock = (
  block: Omit<Block, 'percentageHeight'>,
  resultBlocks: Block[],
  size: number,
) => {
  if (resultBlocks.length === 0) {
    resultBlocks.push({
      ...block,
      percentageHeight:
        ((block.bufferEnd - block.bufferStart + 1) / size) * 100,
    });

    return;
  }

  const lastBlock = resultBlocks.at(-1)!;

  if (lastBlock.loaded === block.loaded) {
    lastBlock.end = block.end;
    lastBlock.bufferEnd = block.bufferEnd;
    lastBlock.percentageHeight =
      ((lastBlock.bufferEnd - lastBlock.bufferStart + 1) / size) * 100;

    return;
  }

  resultBlocks.push({
    ...block,
    percentageHeight: ((block.bufferEnd - block.bufferStart + 1) / size) * 100,
  });
};

export const processBlocks = (
  blocks: Block[],
  {
    buffer,
    loadedEnd,
    loadedStart,
    size,
  }: {
    buffer: number;
    loadedEnd: number;
    loadedStart: number;
    size: number;
  },
): Block[] => {
  const loadedMiddle = Math.floor((loadedStart + loadedEnd) / 2);

  const loadedBufferStart =
    loadedStart === 0 ? 0 : Math.min(loadedStart + buffer, loadedMiddle);

  const loadedBufferEnd =
    loadedEnd === size - 1
      ? size - 1
      : Math.max(loadedEnd - buffer, loadedMiddle);

  const resultBlocks: Block[] = [];

  for (const block of blocks) {
    const { start, end, bufferStart, bufferEnd, loaded } = block;

    if (bufferEnd < loadedBufferStart || bufferStart > loadedBufferEnd) {
      addBlock(block, resultBlocks, size);

      continue;
    }

    if (start < loadedStart) {
      addBlock(
        {
          bufferEnd: loadedBufferStart - 1,
          bufferStart,
          end: loadedStart - 1,
          loaded,
          start,
        },
        resultBlocks,
        size,
      );
    }

    addBlock(
      {
        bufferEnd: loadedBufferEnd,
        bufferStart: loadedBufferStart,
        end: loadedEnd,
        loaded: true,
        start: loadedStart,
      },
      resultBlocks,
      size,
    );

    if (end > loadedEnd) {
      addBlock(
        {
          bufferEnd,
          bufferStart: loadedBufferEnd + 1,
          end,
          loaded,
          start: loadedEnd + 1,
        },
        resultBlocks,
        size,
      );
    }
  }

  return resultBlocks;
};
