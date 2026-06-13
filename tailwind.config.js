/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matched to the Clans Machina website (css/styles.css)
        // Primary action color is the industrial green.
        brand: {
          50: "#e9faf2",
          100: "#c9f3e0",
          200: "#9ae8c6",
          400: "#5fd9a3",
          500: "#3ecf8e", // --green
          600: "#2bb579",
          700: "#1f8f60",
          DEFAULT: "#3ecf8e",
        },
        // Steel blue secondary accent (--blue)
        steel: {
          100: "#dbeefa",
          400: "#74bce6",
          500: "#4ea8de",
          600: "#3a8fc4",
        },
        gold: "#e8c468",
        // Dark surfaces from the site
        sidebar: {
          DEFAULT: "#111518", // --bg-primary
          hover: "#191d21", // --bg-secondary
          card: "#1c2126",
          muted: "rgba(255,255,255,0.38)",
        },
        canvas: "#f4f6f8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
