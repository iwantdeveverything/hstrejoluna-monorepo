/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExpandableToggle } from '@hstrejoluna/ui';

describe('useExpandableToggle', () => {
  it('S1: initial state is collapsed (null) when no argument given', () => {
    const { result } = renderHook(() => useExpandableToggle());
    expect(result.current.expandedId).toBeNull();
  });

  it('S2: toggle expands an item', () => {
    const { result } = renderHook(() => useExpandableToggle());

    act(() => result.current.toggle('item-1'));

    expect(result.current.expandedId).toBe('item-1');
    expect(result.current.isExpanded('item-1')).toBe(true);
  });

  it('S3: toggle collapses the same item', () => {
    const { result } = renderHook(() => useExpandableToggle());

    act(() => result.current.toggle('item-1'));
    act(() => result.current.toggle('item-1'));

    expect(result.current.expandedId).toBeNull();
    expect(result.current.isExpanded('item-1')).toBe(false);
  });

  it('S4: toggle switches between items', () => {
    const { result } = renderHook(() => useExpandableToggle());

    act(() => result.current.toggle('item-1'));
    act(() => result.current.toggle('item-2'));

    expect(result.current.expandedId).toBe('item-2');
    expect(result.current.isExpanded('item-1')).toBe(false);
    expect(result.current.isExpanded('item-2')).toBe(true);
  });

  it('S5: collapse forces null', () => {
    const { result } = renderHook(() => useExpandableToggle());

    act(() => result.current.toggle('item-1'));
    act(() => result.current.collapse());

    expect(result.current.expandedId).toBeNull();
  });

  it('S6: initial ID is respected', () => {
    const { result } = renderHook(() => useExpandableToggle('item-3'));

    expect(result.current.expandedId).toBe('item-3');
    expect(result.current.isExpanded('item-3')).toBe(true);
  });

  it('S7: isExpanded returns false for non-matching IDs', () => {
    const { result } = renderHook(() => useExpandableToggle());

    act(() => result.current.toggle('item-1'));

    expect(result.current.isExpanded('item-99')).toBe(false);
  });
});
