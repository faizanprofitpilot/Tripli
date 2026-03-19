import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { GoogleMapsScript } from "@/components/planner/GoogleMapsScript";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-app",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tripli — Your trip, already planned.",
  description:
    "Plan your entire trip in seconds. AI travel planning with real places, hotels, and day-by-day itineraries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} font-sans antialiased`}
      >
        {apiKey ? <GoogleMapsScript apiKey={apiKey} /> : null}
        {children}
      </body>
    </html>
  );
}
