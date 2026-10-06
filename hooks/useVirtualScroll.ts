/**
 * T3 Priority 3: Virtual Scrolling for Large Collections
 * Optimizes rendering of large lists (10,000+ items) with viewport-based rendering
 * Date: Oct 6, 2026
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface VirtualScrollConfig {
  itemHeight: number; // Height of each item in pixels
  containerHeight: number; // Height of visible container
  bufferSize?: number; // Number of items to render outside viewport (default: 5)
  overscan?: number; // Additional pixels to render beyond viewport
}

export interface VirtualScrollState {
  visibleStart: number;
  visibleEnd: number;
  offsetY: number;
  totalHeight: number;
}

// ============================================================================
// VIRTUAL SCROLL HOOK
// ============================================================================

export function useVirtualScroll<T>(
  items: T[],
  config: VirtualScrollConfig
): {
  visibleItems: T[];
  visibleStart: number;
  visibleEnd: number;
  offsetY: number;
  totalHeight: number;
  handleScroll: (scrollTop: number) => void;
  virtualScrollRef: React.RefObject<HTMLDivElement>;
} {
  const { itemHeight, containerHeight, bufferSize = 5, overscan = 100 } = config;
  const [state, setState] = useState<VirtualScrollState>({
    visibleStart: 0,
    visibleEnd: Math.ceil(containerHeight / itemHeight) + bufferSize,
    offsetY: 0,
    totalHeight: items.length * itemHeight,
  });

  const virtualScrollRef = useRef<HTMLDivElement>(null);

  // Calculate visible items based on scroll position
  const handleScroll = useCallback(
    (scrollTop: number) => {
      const visibleStart = Math.max(
        0,
        Math.floor((scrollTop - overscan) / itemHeight) - bufferSize
      );

      const visibleEnd = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight + overscan) / itemHeight) + bufferSize
      );

      setState({
        visibleStart,
        visibleEnd,
        offsetY: scrollTop,
        totalHeight: items.length * itemHeight,
      });
    },
    [items.length, itemHeight, containerHeight, bufferSize, overscan]
  );

  // Get visible items
  const visibleItems = useMemo(
    () => items.slice(state.visibleStart, state.visibleEnd),
    [items, state.visibleStart, state.visibleEnd]
  );

  // Auto-handle scroll from ref
  useEffect(() => {
    const container = virtualScrollRef.current;
    if (!container) return;

    const handleContainerScroll = () => {
      handleScroll(container.scrollTop);
    };

    container.addEventListener('scroll', handleContainerScroll);
    return () => container.removeEventListener('scroll', handleContainerScroll);
  }, [handleScroll]);

  return {
    visibleItems,
    visibleStart: state.visibleStart,
    visibleEnd: state.visibleEnd,
    offsetY: state.offsetY,
    totalHeight: state.totalHeight,
    handleScroll,
    virtualScrollRef,
  };
}

// ============================================================================
// VIRTUAL SCROLL LIST COMPONENT
// ============================================================================

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  onEndReached?: () => void;
  endReachedThreshold?: number; // Scroll to bottom distance (default: 500px)
  className?: string;
  style?: React.CSSProperties;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  onEndReached,
  endReachedThreshold = 500,
  className,
  style,
}: VirtualListProps<T>) {
  const { visibleItems, visibleStart, totalHeight, virtualScrollRef, handleScroll } =
    useVirtualScroll(items, {
      itemHeight,
      containerHeight,
      bufferSize: 5,
      overscan: 100,
    });

  // Handle end-reached callback
  const handleScrollEvent = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleScroll(e.currentTarget.scrollTop);

      // Check if reached end
      const scrollTop = e.currentTarget.scrollTop;
      const maxScroll = totalHeight - containerHeight;

      if (maxScroll - scrollTop < endReachedThreshold) {
        onEndReached?.();
      }
    },
    [handleScroll, totalHeight, containerHeight, endReachedThreshold, onEndReached]
  );

  return (
    <div
      ref={virtualScrollRef}
      onScroll={handleScrollEvent}
      style={{
        height: containerHeight,
        overflow: 'auto',
        ...style,
      }}
      className={className}
    >
      {/* Spacer at top */}
      <div style={{ height: visibleStart * itemHeight }} />

      {/* Visible items */}
      <div>
        {visibleItems.map((item, i) => (
          <div
            key={keyExtractor ? keyExtractor(item, visibleStart + i) : visibleStart + i}
            style={{ height: itemHeight, overflow: 'hidden' }}
          >
            {renderItem(item, visibleStart + i)}
          </div>
        ))}
      </div>

      {/* Spacer at bottom */}
      <div style={{ height: Math.max(0, (items.length - visibleStart - visibleItems.length) * itemHeight) }} />
    </div>
  );
}

// ============================================================================
// DYNAMIC HEIGHT VIRTUAL SCROLL (for variable-height items)
// ============================================================================

export interface DynamicVirtualScrollConfig {
  estimatedItemHeight: number;
  containerHeight: number;
  bufferSize?: number;
}

export function useDynamicVirtualScroll<T>(
  items: T[],
  config: DynamicVirtualScrollConfig,
  getItemHeight?: (item: T, index: number) => number
) {
  const { estimatedItemHeight, containerHeight, bufferSize = 5 } = config;
  const [heights, setHeights] = useState<Map<number, number>>(new Map());
  const [state, setState] = useState({
    visibleStart: 0,
    visibleEnd: Math.ceil(containerHeight / estimatedItemHeight) + bufferSize,
    offsetY: 0,
  });

  // Get total height with actual measurements
  const totalHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      if (heights.has(i)) {
        height += heights.get(i)!;
      } else if (getItemHeight) {
        height += getItemHeight(items[i], i);
      } else {
        height += estimatedItemHeight;
      }
    }
    return height;
  }, [items, heights, estimatedItemHeight, getItemHeight]);

  // Handle scroll
  const handleScroll = useCallback(
    (scrollTop: number) => {
      let accumulatedHeight = 0;
      let visibleStart = 0;
      let visibleEnd = 0;

      for (let i = 0; i < items.length; i++) {
        const itemHeight = heights.get(i) || estimatedItemHeight;

        if (accumulatedHeight + itemHeight > scrollTop - 100) {
          if (visibleStart === 0) {
            visibleStart = Math.max(0, i - bufferSize);
          }
        }

        if (accumulatedHeight > scrollTop + containerHeight + 100) {
          visibleEnd = i + bufferSize;
          break;
        }

        if (i === items.length - 1) {
          visibleEnd = items.length;
        }

        accumulatedHeight += itemHeight;
      }

      setState({
        visibleStart,
        visibleEnd: Math.min(items.length, visibleEnd),
        offsetY: scrollTop,
      });
    },
    [items, heights, estimatedItemHeight, containerHeight, bufferSize]
  );

  // Register item height
  const registerItemHeight = useCallback(
    (index: number, height: number) => {
      setHeights((prev) => {
        if (prev.get(index) === height) return prev;
        const next = new Map(prev);
        next.set(index, height);
        return next;
      });
    },
    []
  );

  const visibleItems = useMemo(
    () => items.slice(state.visibleStart, state.visibleEnd),
    [items, state.visibleStart, state.visibleEnd]
  );

  return {
    visibleItems,
    visibleStart: state.visibleStart,
    totalHeight,
    offsetY: state.offsetY,
    handleScroll,
    registerItemHeight,
  };
}

// ============================================================================
// PERFORMANCE OPTIMIZATION: Debounced scroll handler
// ============================================================================

export function useDebounceScroll(delay = 150) {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleScrollStart = useCallback(() => {
    setIsScrolling(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isScrolling, handleScrollStart, handleScrollEnd };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic virtual scroll with fixed height
function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <VirtualList
      items={messages}
      itemHeight={60} // 60px per message
      containerHeight={600}
      renderItem={(msg) => <MessageRow message={msg} />}
      onEndReached={() => loadMoreMessages()}
    />
  );
}

// Example 2: Using hook directly
function DiscussionMessages({ discussionId }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { visibleItems, handleScroll } = useVirtualScroll(messages, {
    itemHeight: 60,
    containerHeight: 600,
  });

  return (
    <div onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}>
      {visibleItems.map((msg) => (
        <MessageRow key={msg.id} message={msg} />
      ))}
    </div>
  );
}

// Example 3: Dynamic heights
function BlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { visibleItems, registerItemHeight } = useDynamicVirtualScroll(posts, {
    estimatedItemHeight: 200,
    containerHeight: 800,
  });

  return (
    <div>
      {visibleItems.map((post, i) => (
        <div
          key={post.id}
          ref={(el) => {
            if (el) registerItemHeight(i, el.clientHeight);
          }}
        >
          <BlogPostCard post={post} />
        </div>
      ))}
    </div>
  );
}
*/
