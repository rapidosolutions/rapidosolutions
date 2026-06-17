/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ["./index.html", "./src/**/*.{js,jsx}"]
  },
  theme: {
    extend: {
      colors: {
        rapido: {
          navy: "#071529",
          ink: "#0B1220",
          blue: "#135CFF",
          sky: "#35B5FF",
          cyan: "#70E4FF",
          mist: "#F4F8FC",
          slate: "#56657A",
          line: "#D9E6F5",
          emerald: "#22C58B",
          amber: "#F7B955"
        }
      },
      boxShadow: {
        premium: "0 18px 48px rgba(7, 21, 41, 0.1)",
        "blue-soft": "0 16px 40px rgba(19, 92, 255, 0.14)",
        glass: "0 18px 60px rgba(6, 18, 36, 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(rgba(19, 92, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 92, 255, 0.08) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
        "hero-surface":
          "radial-gradient(circle at 20% 20%, rgba(53, 181, 255, 0.22), transparent 30%), linear-gradient(135deg, #071529 0%, #0B2046 46%, #06101F 100%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        scan: "scan 5s linear infinite"
      }
    }
  },
  plugins: []
};
