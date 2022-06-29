browser.webRequest.onBeforeRequest.addListener(interceptScripts, { urls: ["https://mewe.com/*"], types: ["script"] }, ["blocking"]);
browser.webRequest.onBeforeRequest.addListener(interceptPurchases, { urls: ["https://mewe.com/api/v2/store/items/purchased"] }, ["blocking"]);

let themes = [];

function interceptScripts(req) {

	const filter = browser.webRequest.filterResponseData(req.requestId);
	const decoder = new TextDecoder("utf-8");
	const encoder = new TextEncoder();

	let response = "";

	filter.ondata = event => {
		let data = decoder.decode(event.data, { stream: true });
		response += data;
	}

	filter.onstop = () => {

		// Unlock admin tools
		response = response
			.replace("this.get('globals.currentUser.id') === '5602c780e4b08f388c897a39'", "true")
			.replace("getPrimaryEmail();", "true");

		// Get themes
		const themesMatch = response.match(/JSON\.parse\('(\{.+?\})'\);\\n\\n\/\/# sourceURL=webpack:\/\/mewe\/\.\/utils\/rev-manifest\.json/);
		if (themesMatch) themes = JSON.parse(themesMatch[1].replace(/\\/g, ""));

		filter.write(encoder.encode(response));
		filter.disconnect();
	}
}

async function interceptPurchases(req) {

	let result = {
		items: [],
		_links: {
			self: {
				href: "/api/v2/store/items/purchased"
			}
		}
	};

	// Add emojis
	const buildInfo = await fetch("https://cdn.mewe.com/emoji/build-info.json");
	const buildInfoJson = await buildInfo.json();
	Object.keys(buildInfoJson.packs).forEach(name => {
		if (name == "default") return;
		result.items.push({ itemId: "emoji-" + name, expires: 9999999999 });
	});

	// Add themes
	Object.keys(themes).forEach(theme => {
		result.items.push({ itemId: theme.replace(".css", ""), expires: 9999999999 });
	});

	const filter = browser.webRequest.filterResponseData(req.requestId);
	const encoder = new TextEncoder();
	
	filter.onstart = () => {
		filter.write(encoder.encode(JSON.stringify(result)));
		filter.close();
	}

}
