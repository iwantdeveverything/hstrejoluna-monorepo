/**
 * Storybook coverage for the Liquid Glass primitive (REQ-1, REQ-3, REQ-4).
 *
 * The 5 primary stories show one variant each at default `intensity="med"`.
 * `FallbackMatrix` mounts every variant under each gating combination so
 * QA can eyeball the full design surface at a glance (covers S3.2, S4.1,
 * S5.1, S5.3 visually).
 *
 * Each story includes <LiquidGlassFilters /> alongside the demo so the SVG
 * <defs> are present in the Storybook iframe (Storybook does not share the
 * portfolio's locale layout).
 */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LiquidGlass } from "./LiquidGlass";
import { LiquidGlassFilters } from "./LiquidGlassFilters";
import type { LiquidGlassIntensity, LiquidGlassVariant } from "./types";

const VARIANTS = [
  "panel",
  "pill",
  "dock",
  "circle",
  "dialog",
] as const satisfies readonly LiquidGlassVariant[];
const INTENSITIES = ["low", "med", "high"] as const satisfies readonly LiquidGlassIntensity[];

const SubstrateBackdrop = () => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 20% 30%, #c93d8b 0, transparent 40%)," +
        "radial-gradient(circle at 80% 70%, #2dd4bf 0, transparent 45%)," +
        "radial-gradient(circle at 50% 50%, #fbbf24 0, transparent 35%)," +
        "linear-gradient(135deg, #0a0a0f, #1f1235)",
    }}
  />
);

const StageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: "relative",
      minHeight: "60vh",
      width: "100%",
      padding: "2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "2rem",
      flexWrap: "wrap",
    }}
  >
    <SubstrateBackdrop />
    <LiquidGlassFilters />
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </div>
);

const meta = {
  title: "Liquid Glass/LiquidGlass",
  component: LiquidGlass,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The single sanctioned glass surface in `apps/portfolio`. " +
          "Variant selects the geometry profile; intensity selects the " +
          "refraction/blur tier. Browser fallback, mobile, reduced data, " +
          "reduced transparency and reduced motion are all gated by CSS.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: VARIANTS as readonly string[],
    },
    intensity: {
      control: { type: "inline-radio" },
      options: INTENSITIES as readonly string[],
    },
  },
  args: {
    variant: "panel",
    intensity: "med",
  },
  decorators: [
    (Story) => (
      <StageWrapper>
        <Story />
      </StageWrapper>
    ),
  ],
} satisfies Meta<typeof LiquidGlass>;

export default meta;
type Story = StoryObj<typeof meta>;

const PanelInner = (
  <div
    style={{
      padding: "1.25rem 1.5rem",
      color: "white",
      fontFamily: "var(--font-sans, system-ui)",
      maxWidth: "20rem",
    }}
  >
    <p style={{ margin: 0, fontWeight: 600 }}>Panel surface</p>
    <p style={{ margin: "0.5rem 0 0", opacity: 0.8, fontSize: "0.875rem" }}>
      Refraction over a busy substrate.
    </p>
  </div>
);

export const Panel: Story = {
  args: { variant: "panel" },
  render: (args) => <LiquidGlass {...args}>{PanelInner}</LiquidGlass>,
};

export const Pill: Story = {
  args: { variant: "pill" },
  render: (args) => (
    <LiquidGlass
      {...args}
      style={{ borderRadius: 9999, padding: "0.5rem 1.25rem" }}
    >
      <span
        style={{
          color: "white",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Glass · Pill
      </span>
    </LiquidGlass>
  ),
};

export const Dock: Story = {
  args: { variant: "dock", intensity: "high" },
  render: (args) => (
    <LiquidGlass
      {...args}
      style={{ borderRadius: 28, padding: "0.75rem 1.5rem" }}
    >
      <div
        style={{
          color: "white",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Dock · system online
      </div>
    </LiquidGlass>
  ),
};

export const Circle: Story = {
  args: { variant: "circle" },
  render: (args) => (
    <LiquidGlass
      {...args}
      style={{ width: 120, height: 120, borderRadius: "50%" }}
    />
  ),
};

export const Dialog: Story = {
  args: { variant: "dialog" },
  render: (args) => (
    <LiquidGlass
      {...args}
      as="section"
      style={{ borderRadius: 20, padding: "2rem", maxWidth: "26rem" }}
    >
      <h3 style={{ margin: 0, color: "white" }}>Dialog surface</h3>
      <p style={{ margin: "0.5rem 0 0", color: "white", opacity: 0.8 }}>
        Reduced-transparency mode flattens this to a solid token.
      </p>
    </LiquidGlass>
  ),
};

/**
 * Fallback matrix — every variant under each gating combination. The CSS
 * cascade in `liquid-glass.css` does the actual gating; this story just
 * mounts the surfaces side-by-side so QA can verify all paths visually.
 */
export const FallbackMatrix: Story = {
  args: { variant: "panel" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1.5rem",
        width: "100%",
      }}
    >
      {INTENSITIES.flatMap((intensity) =>
        VARIANTS.map((variant) => (
          <div
            key={`${variant}-${intensity}`}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <code
              style={{
                color: "white",
                opacity: 0.7,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {variant} · {intensity}
            </code>
            <LiquidGlass
              variant={variant}
              intensity={intensity}
              style={{
                minHeight: 80,
                padding: "1rem",
                borderRadius:
                  variant === "circle"
                    ? "50%"
                    : variant === "pill"
                      ? 9999
                      : 16,
              }}
            >
              <span style={{ color: "white" }}>{variant}</span>
            </LiquidGlass>
          </div>
        )),
      )}
    </div>
  ),
};
