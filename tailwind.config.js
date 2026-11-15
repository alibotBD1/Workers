/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        // Vert forêt du Mont Cameroun
        foret: { 50: "#eef7f2", 100: "#d5ebdf", 200: "#acd7c0", 300: "#79bb98", 400: "#4a9a72", 500: "#2d7d57", 600: "#1f6345", 700: "#194f38", 800: "#13392a", 900: "#0c271d", 950: "#06150f" },
        // Ocre du soleil de l'Extrême-Nord
        soleil: { 50: "#fff9e6", 100: "#ffefbf", 200: "#ffe08a", 300: "#ffcd4d", 400: "#fbb924", 500: "#eea00b", 600: "#cc7a06", 700: "#a25709", 800: "#85450f", 900: "#713a11" },
        // Terre rouge de l'Est
        terre: { 50: "#fdf3f0", 100: "#fbe3dc", 200: "#f6c4b6", 300: "#ee9b85", 400: "#e36d52", 500: "#d14d31", 600: "#b33a24", 700: "#922f20", 800: "#782b20", 900: "#64281f" },
        creme: "#fbf7ef",
        encre: "#14201a",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "system-ui", "sans-serif"],
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        carte: "0 1px 0 rgba(20,32,26,.04), 0 8px 24px -12px rgba(20,32,26,.18)",
        flotte: "0 24px 60px -20px rgba(12,39,29,.45)",
      },
      keyframes: {
        monte: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        defile: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        monte: "monte .5s cubic-bezier(.2,.7,.2,1) both",
        defile: "defile 40s linear infinite",
      },
    },
  },
  plugins: [],
};
