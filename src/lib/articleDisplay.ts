import type { Article } from "../types/EuropePmc";

const ARTICLE_BASE_URL = "https://europepmc.org/article";

// The article's page on Europe PMC, e.g. https://europepmc.org/article/MED/123
const articleUrl = ({ source, id }: Pick<Article, "source" | "id">) =>
  `${ARTICLE_BASE_URL}/${encodeURIComponent(source)}/${encodeURIComponent(id)}`;

// Some titles contain markup such as <i>Homo sapiens</i>. React would show the
// tags as text, so they are removed. Returns "Untitled" if nothing is left.
const cleanTitle = (title: string) => {
  const clean = title.replace(/<[^>]*>/g, "").trim();
  return clean === "" ? "Untitled" : clean;
};

export { articleUrl, cleanTitle };
