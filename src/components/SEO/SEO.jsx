import { Helmet } from "react-helmet-async";

const SITE_NAME = "Frunch Forest";
const SITE_URL = "https://frunchforest.com";
const DEFAULT_IMAGE = `${SITE_URL}/image/logo.png`;

/**
 * Drop this at the top of any page component to control that page's
 * <title>, meta description, canonical URL and social preview tags.
 *
 * Example:
 *   <SEO
 *     title="About Us — Frunch Forest"
 *     description="Learn how Frunch Forest sources handpicked, natural dry fruits..."
 *     path="/about"
 *   />
 */
export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd = null,
}) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title?.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
