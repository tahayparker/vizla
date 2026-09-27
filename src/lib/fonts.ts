import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

export const qurovaFont = localFont({
  src: "../../public/fonts/Qurova-SemiBold.otf",
  weight: "600",
  display: "swap",
  variable: "--font-qurova",
  fallback: ["Montserrat", "system-ui", "sans-serif"],
});
