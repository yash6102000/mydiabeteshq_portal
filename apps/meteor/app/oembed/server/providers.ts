import type { OEmbedMeta, OEmbedUrlContent, OEmbedProvider } from '@rocket.chat/core-typings';
import { camelCase } from 'change-case';

import { callbacks } from '../../../lib/callbacks';
import { SystemLogger } from '../../../server/lib/logger/system';

class Providers {
	private providers: OEmbedProvider[];

	constructor() {
		this.providers = [];
	}

	static getConsumerUrl(provider: OEmbedProvider, url: string): string {
		const urlObj = new URL(provider.endPoint);
		urlObj.searchParams.set('url', url);

		return urlObj.toString();
	}

	registerProvider(provider: OEmbedProvider): number {
		return this.providers.push(provider);
	}

	getProviders(): OEmbedProvider[] {
		return this.providers;
	}

	getProviderForUrl(url: string): OEmbedProvider | undefined {
		return this.providers?.find((provider) => {
			return (
				provider.urls?.some((re) => {
					return re.test(url);
				}) ?? false
			);
		});
	}
}

const providers = new Providers();

providers.registerProvider({
	urls: [new RegExp('https?://soundcloud\\.com/\\S+')],
	endPoint: 'https://soundcloud.com/oembed?format=json&maxheight=150',
});

providers.registerProvider({
	urls: [
		new RegExp('https?://vimeo\\.com/[^/]+'),
		new RegExp('https?://vimeo\\.com/channels/[^/]+/[^/]+'),
		new RegExp('https://vimeo\\.com/groups/[^/]+/videos/[^/]+'),
	],
	endPoint: 'https://vimeo.com/api/oembed.json?maxheight=200',
});

providers.registerProvider({
	urls: [new RegExp('https?://www\\.youtube\\.com/\\S+'), new RegExp('https?://youtu\\.be/\\S+')],
	endPoint: 'https://www.youtube.com/oembed?maxheight=200',
});

providers.registerProvider({
	urls: [new RegExp('https?://www\\.rdio\\.com/\\S+'), new RegExp('https?://rd\\.io/\\S+')],
	endPoint: 'https://www.rdio.com/api/oembed/?format=json&maxheight=150',
});

providers.registerProvider({
	urls: [new RegExp('https?://www\\.slideshare\\.net/[^/]+/[^/]+')],
	endPoint: 'https://www.slideshare.net/api/oembed/2?format=json&maxheight=200',
});

providers.registerProvider({
	urls: [new RegExp('https?://www\\.dailymotion\\.com/video/\\S+')],
	endPoint: 'https://www.dailymotion.com/services/oembed?maxheight=200',
});

providers.registerProvider({
	urls: [new RegExp('https?://twitter\\.com/[^/]+/status/\\S+')],
	endPoint: 'https://publish.twitter.com/oembed',
});

providers.registerProvider({
	urls: [new RegExp('https?://(play|open)\\.spotify\\.com/(track|album|playlist|show)/\\S+')],
	endPoint: 'https://open.spotify.com/oembed',
});

providers.registerProvider({
	urls: [new RegExp('https?://www\\.loom\\.com/\\S+')],
	endPoint: 'https://www.loom.com/v1/oembed?format=json',
});

callbacks.add(
	'oembed:beforeGetUrlContent',
	(data) => {
		if (!data.urlObj) {
			return data;
		}

		const url = data.urlObj.toString();
		const provider = providers.getProviderForUrl(url);

		if (!provider) {
			return data;
		}

		const consumerUrl = Providers.getConsumerUrl(provider, url);

		return { ...data, urlObj: new URL(consumerUrl) };
	},
	callbacks.priority.MEDIUM,
	'oembed-providers-before',
);

const cleanupOembed = (data: {
	url: string;
	meta: OEmbedMeta;
	headers: { [k: string]: string };
	content: OEmbedUrlContent;
}): {
	url: string;
	meta: Omit<OEmbedMeta, 'oembedHtml'>;
	headers: { [k: string]: string };
	content: OEmbedUrlContent;
} => {
	if (!data?.meta) {
		return data;
	}

	// remove oembedHtml key from original meta
	const { oembedHtml, ...meta } = data.meta;

	return {
		...data,
		meta,
	};
};

callbacks.add(
	'oembed:afterParseContent',
	(data) => {
		if (!data?.url || !data.content?.body) {
			return cleanupOembed(data);
		}

		const provider = providers.getProviderForUrl(data.url);

		if (!provider) {
			return cleanupOembed(data);
		}

		data.meta.oembedUrl = data.url;

		try {
			const metas = JSON.parse(data.content.body);
			Object.entries(metas).forEach(([key, value]) => {
				if (value && typeof value === 'string') {
					data.meta[camelCase(`oembed_${key}`)] = value;
				}
			});
		} catch (error) {
			SystemLogger.error(error);
		}
		return data;
	},
	callbacks.priority.MEDIUM,
	'oembed-providers-after',
);
