/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./game.js"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slate: "#1e293b",
        parchment: "#f8f4e6",
        ember: "#b45309",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["IM Fell English", "serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(148,163,184,0.15), 0 0 24px rgba(30,41,59,0.65)",
      },
    },
  },
  plugins: [],
};
