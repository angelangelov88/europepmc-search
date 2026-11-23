import { articleUrl, cleanTitle } from "../../../lib/articleDisplay";
import type { ResultItemProps } from "../../../types/Search";

const LINK_CLASSES =
  "text-blue-800 underline hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const ResultItem = ({ article }: ResultItemProps) => {
  const { title, authorString, journalTitle, pubYear, source } = article;
  // Preprints have no journal, so say what they are instead.
  const venue = journalTitle ?? (source === "PPR" ? "Preprint" : undefined);

  return (
    <li className="space-y-1">
      <h3 className="text-lg font-semibold">
        <a
          href={articleUrl(article)}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASSES}
        >
          {cleanTitle(title)}{" "}
          <span className="sr-only">(opens in new tab)</span>
        </a>
      </h3>
      <p className="text-gray-800">{authorString ?? "Unknown authors"}</p>
      <p className="text-sm text-gray-700">
        {venue}
        {venue && pubYear && " · "}
        {pubYear}
      </p>
    </li>
  );
};

export default ResultItem;
