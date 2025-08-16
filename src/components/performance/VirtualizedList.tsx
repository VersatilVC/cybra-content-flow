import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (props: { index: number; item: T; style: React.CSSProperties }) => React.ReactNode;
  overscan?: number;
  className?: string;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 5,
  className
}: VirtualizedListProps<T>) {
  const [scrollOffset, setScrollOffset] = useState(0);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return renderItem({ index, item, style });
  }, [items, renderItem]);

  const memoizedList = useMemo(() => (
    <List
      height={height}
      width="100%"
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscan}
      className={className}
      onScroll={({ scrollOffset }) => setScrollOffset(scrollOffset)}
    >
      {Row}
    </List>
  ), [items.length, itemHeight, height, overscan, className, Row]);

  return memoizedList;
}

export default VirtualizedList;