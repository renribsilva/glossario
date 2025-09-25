import React from "react";
import { Ubuntu } from "next/font/google"

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"]
});

export default function Layout({ children }) {

  return (
    <>
      <main className={ubuntu.className}>{children}</main>
    </>
  );
}