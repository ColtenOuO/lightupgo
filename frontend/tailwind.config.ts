import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色：亮黃，活潑、像陽光
        sun: {
          50: "#FFFBEA",
          100: "#FFF5C8",
          200: "#FFEC9B",
          300: "#FFE26D",
          400: "#FFDA51",
          500: "#FFD93D",
          600: "#E5BB1A",
          700: "#A8851C",
          800: "#7A6116",
          900: "#5A4810",
          DEFAULT: "#FFD93D",
        },
        // 副色：珊瑚紅，CTA
        coral: {
          50: "#FFEFEF",
          100: "#FFD3D3",
          200: "#FFAEAE",
          300: "#FF8989",
          400: "#FF7878",
          500: "#FF6B6B",
          600: "#E14F4F",
          700: "#B73838",
          800: "#882828",
          900: "#5F1B1B",
          DEFAULT: "#FF6B6B",
        },
        // 強調：薄荷綠，次要按鈕、徽章
        mint: {
          50: "#E7F9F7",
          100: "#C2F0EC",
          200: "#9FE7E0",
          300: "#7CDED5",
          400: "#5FD5CB",
          500: "#4ECDC4",
          600: "#2EAFA6",
          700: "#218D85",
          800: "#176660",
          900: "#0F4641",
          DEFAULT: "#4ECDC4",
        },
        // 連結 / 點綴：天藍
        sky2: {
          50: "#EAF6FF",
          100: "#CDE7FE",
          200: "#A6D5FD",
          300: "#7DC2FC",
          400: "#74C0FC",
          500: "#5AAEF8",
          600: "#4DA3E5",
          700: "#317AB1",
          800: "#235780",
          900: "#173B57",
          DEFAULT: "#74C0FC",
        },
        // 背景：米白
        cream: {
          50: "#FFFEF9",
          100: "#FFFCEF",
          200: "#FFF8E1",
          DEFAULT: "#FFF8E1",
        },
        // 文字主色：深藍紫
        ink: {
          DEFAULT: "#2D2A4A",
          soft: "#5C5878",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-tc)", "system-ui", "sans-serif"],
        display: [
          "var(--font-klee-one)",
          "var(--font-noto-sans-tc)",
          "system-ui",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        pop: "0 8px 0 0 rgba(45, 42, 74, 0.12)",
        "pop-coral": "0 8px 0 0 rgba(255, 107, 107, 0.35)",
        "pop-sun": "0 8px 0 0 rgba(229, 187, 26, 0.35)",
      },
      keyframes: {
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        "bounce-soft": "bounceSoft 2.4s ease-in-out infinite",
        wiggle: "wiggle 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
