export default defineContentScript({
	matches: ["<all_urls>"],
	async main() {
		browser.runtime.onMessage.addListener(
			async (message, _sender, sendResponse) => {
				switch (message.action) {
					case "PROMPT": {
						console.log(message);
						sendResponse(prompt("context"));
						break;
					}
					case "ALERT": {
						alert(message.data);
						break;
					}

					default: {
						throw new Error(`${message.action} is invalid`);
					}
				}
			},
		);

		const store = await browser.runtime.sendMessage("get-storage");
		console.log(store);
	},
});
