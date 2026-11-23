import type { Article } from "../types/EuropePmc";

// The endpoint MSW stands in for.
const SEARCH_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

// Based on real Europe PMC replies (resultType=lite), trimmed to the fields we
// use: a journal article and a preprint (preprints have no journal).
const JOURNAL_ARTICLE: Article = {
  id: "43035835",
  source: "MED",
  title:
    "Specialist Palliative Care Referral in Patients With Head and Neck Cancer.",
  authorString: "Fu R, Chen L, Smith J.",
  journalTitle: "Head Neck",
  pubYear: "2026",
};

const PREPRINT: Article = {
  id: "PPR1373568",
  source: "PPR",
  title: "LCatlas: a single-cell atlas of lung cancer.",
  authorString: "Park SY, Kim J.",
  pubYear: "2026",
};

const NEXT_CURSOR = "AoE_next";

// Builds a /search reply the way Europe PMC shapes it. With lastPage, the reply
// has no nextCursorMark, as after the real last page.
const searchResponse = (
  articles: unknown[],
  { hitCount = articles.length, lastPage = false } = {},
) => ({
  version: "6.9",
  hitCount,
  ...(lastPage ? {} : { nextCursorMark: NEXT_CURSOR }),
  request: {},
  resultList: { result: articles },
});

export { JOURNAL_ARTICLE, NEXT_CURSOR, PREPRINT, SEARCH_URL, searchResponse };
