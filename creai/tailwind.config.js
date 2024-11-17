"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "#1A1F2C",
                foreground: "#F1F0FB",
                primary: {
                    DEFAULT: "#9b87f5",
                    foreground: "#F1F0FB",
                },
                secondary: {
                    DEFAULT: "#6E59A5",
                    foreground: "#F1F0FB",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "#2A2F3C",
                    foreground: "#8E9196",
                },
                accent: {
                    DEFAULT: "#7E69AB",
                    foreground: "#F1F0FB",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
//# sourceMappingURL=tailwind.config.js.map