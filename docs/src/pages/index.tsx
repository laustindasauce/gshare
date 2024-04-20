import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import AnnouncementBar from "@theme/AnnouncementBar";
import { useColorMode } from "@docusaurus/theme-common";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { isDarkTheme } = useColorMode();

  return (
    <header
      className={clsx(
        "hero " + isDarkTheme ? "hero--dark" : "hero--light",
        styles.heroBanner
      )}
    >
      <div className="container">
        <div className={styles.logo}>
          <img
            src={isDarkTheme ? "img/logo-white.svg" : "img/logo.svg"}
            alt="gshare logo"
          />
        </div>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Documentation
          </Link>
          <Link
            className="button button--primary button--lg"
            href="https://github.com/austinbspencer/gshare"
          >
            Source Code
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  // const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Description will go into a meta tag in <head />"
    >
      <AnnouncementBar />
      <HomepageHeader />
      {/* <main>
        <HomepageFeatures />
      </main> */}
    </Layout>
  );
}
