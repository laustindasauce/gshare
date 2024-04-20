import "../styles/globals.css";
import "aos/dist/aos.css";
import "yet-another-react-lightbox/styles.css";
import AOS from "aos";
import type { AppProps } from "next/app";
import React from "react";
import { NextPage } from "next";
import { ScriptProps } from "next/script";

type Page<P = Record<string, never>> = NextPage<P> & {
  Layout: (page: ScriptProps) => JSX.Element;
};

type Props = AppProps & {
  Component: Page;
};

export default function App({ Component, pageProps }: Props) {
  React.useEffect(() => {
    AOS.init({
      once: true,
      easing: "ease-in-cubic",
      duration: 700,
      delay: 0,
      disable: "mobile",
    });
    window.addEventListener("load", AOS.refresh);
  }, []);

  // Dynamic Layout
  const Layout =
    Component.Layout || (({ children }: ScriptProps) => <>{children}</>);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
