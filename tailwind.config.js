/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0D12",
        panel: "#11151C",
        panel2: "#161B23",
        fg: "#EDEEF0",
        muted: "#8D939C",
        muted2: "#5E646D",
        accent: "#7CA0B3",
        accentStrong: "#A3C2D1",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "22px",
      },
    },
  },
  plugins: [],
};
