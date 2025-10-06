import type { AppProps } from "next/app";
import React from "react";
import "../styles/global.css";
import Layout from "../layout/layout";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider
        attribute="class"  
        defaultTheme="system"
        enableSystem={true}
      >
        <Head>
          <title>Glossário</title>

          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="apple-touch-icon" href="/seven192.png" />
          {/*Icon for iOS devices*/}
          <link
            rel="apple-touch-icon"
            sizes="192x192"
            href="seven192.png"
          />
          {/*Splash screen for iOS devices*/}
          <link
            rel="apple-touch-startup-image"
            href="/seven512.png"
            sizes="512X512"
          />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}