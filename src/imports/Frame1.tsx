import svgPaths from "./svg-ifjsjc0ump";

function Frame1() {
  return (
    <div className="absolute h-[157px] left-[82px] top-[69px] w-[372px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 372 157">
        <g id="Frame 2">
          <rect height="156" stroke="var(--stroke-0, black)" width="371" x="0.5" y="0.5" />
          <g id="Frame 3">
            <rect fill="#FF0F0F" height="58" transform="translate(10 44)" width="18" />
          </g>
          <g id="Frame 4">
            <rect fill="#0FFF8B" height="58" transform="translate(336 44)" width="18" />
          </g>
          <path d={svgPaths.p34247cf0} fill="var(--fill-0, #D9D9D9)" id="Star 1" />
        </g>
      </svg>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <Frame1 />
    </div>
  );
}