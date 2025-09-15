"use client";

interface GlowingCardProps {
  aspectRatio?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function GlowingCard({
  aspectRatio = "16/9",
  children,
  className = "",
}: GlowingCardProps) {
  return (
    <>
      <div className={`card ${className}`} style={{ aspectRatio }}>
        {children}
        <div className="glow" />
      </div>

      <style jsx>{`
        @property --a {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes a {
          to {
            --a: 1turn;
          }
        }

        .card {
          position: relative;
          overflow: hidden;
          width: 100%;
          border-radius: 0.5em;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .glow {
          content: "";
          position: absolute;
          z-index: -1;
          inset: -1em;
          border: solid 1.25em;
          border-image: conic-gradient(
              from var(--a),
              #669900,
              #99cc33,
              #ccee66,
              #006699,
              #3399cc,
              #990066,
              #cc3399,
              #ff6600,
              #ff9900,
              #ffcc00,
              #669900
            )
            1;
          filter: blur(0.75em);
          animation: a 4s linear infinite;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
