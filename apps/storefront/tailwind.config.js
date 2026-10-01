module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/modules/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "3xl": "2rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
      },
    },
  },
}
