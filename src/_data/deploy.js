import process from 'node:process';

const deploy = {
	local: !process.env.CF_PAGES_URL,
	url: process.env.CF_PAGES_URL || 'https://financial-inclusion.pages.dev',
};

export default deploy;
