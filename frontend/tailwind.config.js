/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          primary: "#1a1b1e",
          secondary: "#2c2e33",
          accent: "#3b82f6",
          text: "#e2e8f0",
          "text-secondary": "#94a3b8",
        },
        memecoin: {
          primary: "#FF6B6B",
          secondary: "#4ECDC4",
          accent: "#FFE66D",
          success: "#2ECC71",
          warning: "#F1C40F",
          error: "#E74C3C",
        },
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
