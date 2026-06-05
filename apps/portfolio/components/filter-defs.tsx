import { forwardRef, type ReactElement } from "react";

export const REFRACTION_FILTER_ID = "hero-refraction";
export const REFRACTION_MAP_ID = "hero-refraction-map";

export const HeroRefractionFilter = forwardRef<SVGFEDisplacementMapElement>((props, ref): ReactElement => {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter id={REFRACTION_FILTER_ID} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008"
            numOctaves={2}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="blur" />
          <feDisplacementMap
            id={REFRACTION_MAP_ID}
            ref={ref}
            in="SourceGraphic"
            in2="blur"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
});

HeroRefractionFilter.displayName = "HeroRefractionFilter";
