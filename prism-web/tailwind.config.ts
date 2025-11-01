import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        prism: {
          primary: {
            DEFAULT: "#0066FF",
            50: "#E6F0FF",
            100: "#CCE0FF",
            200: "#99C2FF",
            300: "#66A3FF",
            400: "#3385FF",
            500: "#0066FF",
            600: "#0052CC",
            700: "#003D99",
            800: "#002966",
            900: "#001433",
          },
          secondary: {
            DEFAULT: "#00C9A7",
            50: "#E6FBF7",
            100: "#CCF7EF",
            200: "#99EFDF",
            300: "#66E7CF",
            400: "#33DFBF",
            500: "#00C9A7",
            600: "#00A186",
            700: "#007964",
            800: "#005043",
            900: "#002821",
          },
          accent: {
            DEFAULT: "#FF6B6B",
            50: "#FFE9E9",
            100: "#FFD3D3",
            200: "#FFA7A7",
            300: "#FF7B7B",
            400: "#FF4F4F",
            500: "#FF6B6B",
            600: "#CC5656",
            700: "#994040",
            800: "#662B2B",
            900: "#331515",
          },
          dark: {
            DEFAULT: "#1A1A2E",
            50: "#E8E8EB",
            100: "#D1D1D7",
            200: "#A3A3AF",
            300: "#757587",
            400: "#47475F",
            500: "#1A1A2E",
            600: "#151525",
            700: "#10101C",
            800: "#0A0A12",
            900: "#050509",
          },
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
