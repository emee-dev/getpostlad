// SVGs from lucide react icons

const svgNS = "http://www.w3.org/2000/svg";


export const ChevronDown = (size: number) => {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute(
    "class",
    "lucide lucide-chevron-down-icon lucide-chevron-down"
  );

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "m6 9 6 6 6-6");

  svg.appendChild(path);

  return svg;
};

export const ChevronRight = (size: number) => {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute(
    "class",
    "lucide lucide-chevron-right-icon lucide-chevron-right"
  );

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "m9 18 6-6-6-6");

  svg.appendChild(path);

  return svg;
};
