import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickText — Send",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Head() {
  return (
    <>
      <title>QuickText — Send</title>
      <meta name="robots" content="noindex,nofollow" />
    </>
  );
}
