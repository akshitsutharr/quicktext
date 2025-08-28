import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickText — Receive",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Head() {
  return (
    <>
      <title>QuickText — Receive</title>
      <meta name="robots" content="noindex,nofollow" />
    </>
  );
}
