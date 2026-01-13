/**
 * @param {object} page The data object for the current page.
 * @param {object} collection An Eleventy collection object for the page's collection.
 * @param {string} lang The language code for the current page.
 * @param {string} desiredLang The language code for the queried page.
 * @returns {string} The URL of the translated content.
 */
export default function findTranslation(page, collection = [], lang, desiredLang) {
	const expectedFilePathStem = page.filePathStem.replace(lang, desiredLang);

	let translationUrl = false;

	for (const element of collection) {
		if (element.filePathStem === expectedFilePathStem) {
			translationUrl = element.url;
		}
	}

	return translationUrl;
}
