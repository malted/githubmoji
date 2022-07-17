// document.getElementById("predictions-toggle").onchange = () => {
// 	let sending = browser.runtime.sendMessage("test");
// 	// browser.tabs.sendMessage(tabs[0].id, "test");
// 	document.body.style.border = "5px solid red";
// };

function handleMessage(request, sender, sendResponse) {
	console.log("Message from the content script: " + request.greeting);
	sendResponse({ response: "Response from background script" });
}
browser.runtime.onMessage.addListener(handleMessage);

// browser.tabs
// 	.executeScript({ file: "/src/index.js" })
// 	.then(() => (document.body.style.border = "5px solid red"))
// 	.then(() => console.log(123))
// 	.catch(() => console.log(456));
