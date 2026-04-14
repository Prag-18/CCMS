/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          900: "#0b1120",
          800: "#0d1526",
          700: "#131f35",
          600: "#1c2d4f",
        },
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59,130,246,0.35)",
        "glow-red": "0 0 20px rgba(239,68,68,0.3)",
        "glow-green": "0 0 20px rgba(52,211,153,0.3)",
      },
    },
  },
  plugins: [],
}