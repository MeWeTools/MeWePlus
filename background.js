browser.webRequest.onBeforeRequest.addListener(unlockAdminTools, { urls: ["https://mewe.com/*"], types: ["script"] }, ["blocking"]);

function unlockAdminTools(req) {

	const filter = browser.webRequest.filterResponseData(req.requestId);
	const decoder = new TextDecoder("utf-8");
	const encoder = new TextEncoder()

	let response = "";

	filter.ondata = event => {
		let data = decoder.decode(event.data, { stream: true });
		response += data;
	}

	filter.onstop = () => {
		response = response
			.replace("this.get('globals.currentUser.id') === '5602c780e4b08f388c897a39'", "true")
			.replace("getPrimaryEmail();", "true");
		filter.write(encoder.encode(response));
		filter.disconnect();
	}
}

