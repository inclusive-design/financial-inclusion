export default {
	eleventyComputed: {
		eleventyNavigation(data) {
			if (!data.nav) {
				return false;
			}

			return {
				key: data.uuid,
				title: data.shortTitle && data.shortTitle !== '' ? data.shortTitle : data.title,
				order: data.order,
				parent: data.parent ?? false,
				lang: data.lang,
			};
		},
	},
};
