import type { AppProps } from "next/app";
import React from "react";
import "../styles/global.css";
import Layout from "../layout/layout";
import Head from "next/head";
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Glossário</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}