export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
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

		browser.runtime
			.sendMessage({
				action: "GET_STORE",
			})
			.then(d => {
				console.log(d)
			});
	},
});
