/**
 * Dropdown utility functions for filtering and highlighting
 */

export type FilterMode = 'startsWith' | 'contains' | 'exact';

/**
 * Filter string items based on mode
 */
export function filterStringItems(
  items: string[], 
  query: string, 
  mode: FilterMode = 'contains'
): string[] {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();
  
  switch (mode) {
    case 'startsWith':
      return items.filter(item => 
        item.toLowerCase().startsWith(lowerQuery)
      );
    
    case 'contains':
      return items.filter(item => 
        item.toLowerCase().includes(lowerQuery)
      );
    
    case 'exact':
      return items.filter(item => 
        item.toLowerCase() === lowerQuery
      );
    
    default:
      return items;
  }
}

/**
 * Check if an item should be highlighted based on query
 */
export function isItemHighlighted(
  item: string, 
  query: string, 
  mode: FilterMode = 'startsWith'
): boolean {
  if (!query) return false;
  
  const lowerItem = item.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  switch (mode) {
    case 'startsWith':
      return lowerItem.startsWith(lowerQuery);
    
    case 'contains':
      return lowerItem.includes(lowerQuery);
    
    case 'exact':
      return lowerItem === lowerQuery;
    
    default:
      return false;
  }
}

/**
 * Filter generic items based on a text extractor function
 */
export function filterItems<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
  mode: FilterMode = 'contains'
): T[] {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();
  
  return items.filter(item => {
    const text = getText(item).toLowerCase();
    
    switch (mode) {
      case 'startsWith':
        return text.startsWith(lowerQuery);
      case 'contains':
        return text.includes(lowerQuery);
      case 'exact':
        return text === lowerQuery;
      default:
        return false;
    }
  });
}

/**
 * Get matching indices for highlighting
 */
export function getMatchIndices(
  text: string,
  query: string
): Array<[number, number]> {
  if (!query) return [];
  
  const indices: Array<[number, number]> = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let startIndex = 0;
  
  while (startIndex < lowerText.length) {
    const index = lowerText.indexOf(lowerQuery, startIndex);
    if (index === -1) break;
    
    indices.push([index, index + lowerQuery.length]);
    startIndex = index + 1;
  }
  
  return indices;
}