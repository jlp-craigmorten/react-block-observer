const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchItems = async (
  start: number,
  end: number,
): Promise<Record<number, string>> => {
  await delay(300 + Math.random() * 500);

  const items: Record<number, string> = {};

  for (let i = start; i <= end; i++) {
    items[i] = `Item #${i + 1} - ${generateRandomContent(i)}`;
  }

  return items;
};

const generateRandomContent = (index: number): string => {
  const seed = index % 5;

  switch (seed) {
    case 0:
      return 'This is a short description for this item.';
    case 1:
      return 'This item contains medium-length content with some details about what it represents.';
    case 2:
      return "A detailed description with multiple sentences. This provides more context about what this particular item is about. It's quite verbose.";
    case 3:
      return `Priority item with ID: ${index * 1000 + 123}`;
    case 4:
      return `Status: ${index % 2 === 0 ? 'Active' : 'Inactive'} | Last updated: ${new Date().toLocaleDateString()}`;
    default:
      return 'Default content';
  }
};
