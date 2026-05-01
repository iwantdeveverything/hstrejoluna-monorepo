/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MotionProvider } from "./MotionProvider";

describe("<MotionProvider />", () => {
  it("renders its children inside the LazyMotion boundary", () => {
    render(
      <MotionProvider>
        <p data-testid="child">payload</p>
      </MotionProvider>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("payload");
  });
});
