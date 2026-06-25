import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useRef } from "react";
// We import from the to-be-created file
import { useFocusTrap } from "../useFocusTrap";

const TestComponent = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, isOpen, onClose);
  
  return (
    <div>
      <button data-testid="outside-before">Outside Before</button>
      <button data-testid="toggle" style={{ display: isOpen ? "none" : "block" }}>Toggle</button>
      {isOpen && (
        <div ref={ref} data-testid="dialog">
          <button data-testid="first">First</button>
          <a href="#" data-testid="second">Second</a>
          <button data-testid="last">Last</button>
        </div>
      )}
      <button data-testid="outside-after">Outside After</button>
    </div>
  );
};

describe("useFocusTrap", () => {
  it("focuses the first focusable element when opened", () => {
    const onClose = vi.fn();
    const { rerender } = render(<TestComponent isOpen={false} onClose={onClose} />);
    
    // Open dialog
    rerender(<TestComponent isOpen={true} onClose={onClose} />);
    
    expect(screen.getByTestId("first")).toHaveFocus();
  });

  it("traps focus and wraps Tab/Shift+Tab at ends", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<TestComponent isOpen={true} onClose={onClose} />);
    
    const first = screen.getByTestId("first");
    const second = screen.getByTestId("second");
    const last = screen.getByTestId("last");
    
    // Ensure first is focused initially
    expect(first).toHaveFocus();
    
    // Tab to second
    await user.tab();
    expect(second).toHaveFocus();
    
    // Tab to last
    await user.tab();
    expect(last).toHaveFocus();
    
    // Tab wraps to first
    await user.tab();
    expect(first).toHaveFocus();
    
    // Shift+Tab wraps to last
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<TestComponent isOpen={true} onClose={onClose} />);
    
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("restores focus to previous active element on unmount", () => {
    const onClose = vi.fn();
    const { rerender } = render(<TestComponent isOpen={false} onClose={onClose} />);
    
    const toggle = screen.getByTestId("toggle");
    toggle.focus();
    expect(toggle).toHaveFocus();
    
    // Open dialog
    rerender(<TestComponent isOpen={true} onClose={onClose} />);
    
    // Close dialog
    rerender(<TestComponent isOpen={false} onClose={onClose} />);
    
    expect(toggle).toHaveFocus();
  });
});
