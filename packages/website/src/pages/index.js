import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

const features = [
  {
    title: <>Stream money easily</>,
    imageUrl: "img/undraw_transfer_money_rywa.svg",
    description: (
      <>
        NoteStream allows you to send a continuous stream of cryptocurrency with
        one &quot;set and forget&quot; transaction
      </>
    ),
  },
  {
    title: <>Built on Ethereum</>,
    imageUrl: "img/undraw_ethereum_fb7n.svg",
    description: (
      <>
        As NoteStream is built on top of the Ethereum blockchain, our smart
        contracts safely holds your funds requiring trust in any third parties.
      </>
    ),
  },
  {
    title: <>Privacy from AZTEC Protocol</>,
    imageUrl: "img/undraw_security_o890.svg",
    description: (
      <>
        All assets which NoteStream uses to stream payments benefit from AZTEC
        Protocol&apos;s privacy solution so nobody can see how much you&apos;re
        receiving.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={siteConfig.title}
      description="Private money streaming on Ethereum"
    >
      <header className={classnames("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              to="https://note.stream"
            >
              Get Started
            </Link>
            <Link
              className={classnames(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              to={useBaseUrl("docs/introduction")}
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

Feature.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default Home;
