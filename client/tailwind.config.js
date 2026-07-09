/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          50: "#eef7f3",
          100: "#d8ede4",
          200: "#b3dacb",
          300: "#82bfae",
          400: "#51a18e",
          500: "#378574",
          600: "#296a5e",
          700: "#23564d",
          800: "#1e453f",
          900: "#193a35",
          950: "#0d211e"
        },
        berry: {
          50: "#fff1f2",
          500: "#d33d55",
          600: "#bd293f",
          700: "#9f2134"
        },
        gold: {
          100: "#fff5cf",
          300: "#f6d36b",
          400: "#edbd37"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 28px rgba(15, 23, 42, 0.055)",
        modal: "0 24px 80px rgba(15, 23, 42, 0.22)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
