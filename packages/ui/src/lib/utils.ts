/**
 * Returns props for external links to ensure security and semantics.
 */
export const getExternalLinkProps = (isExternal?: boolean) => {
  if (!isExternal) return {};
  return {
    target: "_blank",
    rel: "noopener noreferrer external",
  };
};
