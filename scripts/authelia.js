function autheliaGetShadowColor(node) {
  const rgbToHsl = (color) => {
    const [r, g, b] = color.map((c) => c / 255);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  };

  const hslToRgb = (color) => {
    const [h, s, l] = color;
    let r, g, b;

    if (s === 0) r = g = b = l;
    else {
      const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return [r, g, b].map((c) => Math.round(c * 255));
  };

  const rgbToHex = (color) =>
    `#${color.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

  const parseColor = (colorStr) => {
    let match;
    if (colorStr.startsWith("rgba")) {
      match = colorStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+\.?\d*)\)/);
      return [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        parseFloat(match[4]) * 255,
      ];
    } else if (colorStr.startsWith("rgb")) {
      match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 255];
    } else if (colorStr.startsWith("#")) {
      switch (colorStr.length) {
        case 9:
          return [
            parseInt(colorStr.slice(1, 3), 16),
            parseInt(colorStr.slice(3, 5), 16),
            parseInt(colorStr.slice(5, 7), 16),
            parseInt(colorStr.slice(7, 9), 16),
          ];
        case 7:
          return [
            parseInt(colorStr.slice(1, 3), 16),
            parseInt(colorStr.slice(3, 5), 16),
            parseInt(colorStr.slice(5, 7), 16),
            255,
          ];
        case 5:
          return [
            parseInt(colorStr[1] + colorStr[1], 16),
            parseInt(colorStr[2] + colorStr[2], 16),
            parseInt(colorStr[3] + colorStr[3], 16),
            parseInt(colorStr[4] + colorStr[4], 16),
          ];
        case 4:
          return [
            parseInt(colorStr[1] + colorStr[1], 16),
            parseInt(colorStr[2] + colorStr[2], 16),
            parseInt(colorStr[3] + colorStr[3], 16),
            255,
          ];
      }
    }
    return [0, 0, 0, 255];
  };

  const color = parseColor(getComputedStyle(node).color);

  let [r, g, b, a] = color;

  let { h, s, l } = rgbToHsl([r, g, b]);
  l = 0.486 * l + 0.514;
  a = a * 0.87;

  [r, g, b] = hslToRgb([h, s, l]);
  return rgbToHex([r, g, b]) + Math.round(a).toString(16).padStart(2, "0");
}

function autheliaApplyStyle(node) {
  node.style.fontFamily = "CommilitiaFont UI TC";
  node.style.webkitTextStroke = "0.08px";
  node.style.textShadow = `0.45px 0.45px 0 ${autheliaGetShadowColor(node)}`;
}

function autheliaRecursiveExecute(node, selector, func) {
  func(node);
  node.querySelectorAll(selector).forEach((child) => func(child));
}

function autheliaSelectInScope(node, selector) {
  return node.matches(selector) ? node : node.querySelector(selector);
}

function autheliaResetIconHeader() {
  document.title = document.title.replace(/Authelia/g, "Commilitia");

  let link = document.querySelector("link[rel*='icon']");
  if (link) {
    link.href = "https://cdn.jsdelivr.net/gh/Commilitia/Resources@master/icons/commilitia-red.png";
  } else {
    link = document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href = "https://cdn.jsdelivr.net/gh/Commilitia/Resources@master/icons/commilitia-red.png";
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

document.head.appendChild(
  (() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href =
      "https://cdn.jsdelivr.net/gh/Commilitia/Resources@master/styles/commilitiaFonts.css";
    return link;
  })()
);

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.resolve();
  autheliaResetIconHeader();
  document.querySelectorAll("*").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    autheliaApplyStyle(node);
  });
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        autheliaRecursiveExecute(node, "*", autheliaApplyStyle);
      });
    });
  }).observe(document.body, {
    attributes: false,
    childList: true,
    subtree: true,
  });
});
