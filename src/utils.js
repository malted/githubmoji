import gitmojis from "./gitmojis.js";

// Creates the parent element into which the prediction buttons will be added to.
export function createButtonGroup() {
	const buttonGroup = document.createElement("div");
	buttonGroup.classList.add("BtnGroup");
	buttonGroup.style.display = "flex";
	document
		.getElementById("commit-summary-input")
		.insertAdjacentElement("beforebegin", buttonGroup); // Insert the button group at the start of the group

	return buttonGroup;
}

export function replaceCodes(commitSummaryInput) {
	const replacement = gitmojis.find(el =>
		commitSummaryInput.value.includes(el.code),
	);
	if (replacement) {
		commitSummaryInput.value = commitSummaryInput.value.replace(
			replacement.code,
			replacement.emoji + " ",
		);
	}
}

export function createButtons(commitSummaryInput, buttonGroup) {
	const commitMsg = commitSummaryInput.value.trim();

	let predictiveCount = 0;

	// Predictively create a button for each emoji
	gitmojis.every(el => {
		// All the Gitmoji descriptions include spaces somewhere; break the loop if the input doesn't include meaningful content.
		if (!commitMsg || commitMsg == "" || commitMsg == " ") return false;

		// Displaying every single match would not be good UX.
		if (predictiveCount > 5) return false;

		// Convert both to lowercase; it wouldn't make sense to not match "Fix" with "fix", for example.
		if (el.description.toLowerCase().includes(commitMsg.toLowerCase())) {
			const predictive = document.createElement("button");

			// Use the existing GitHub CSS classes for the button.
			predictive.classList.add(
				"btn-sm",
				"btn",
				"BtnGroup-item",
				"ghmoji-predictive",
			);

			// Putting it here instead of the parent div so that there is no weird gap when there are no predictions
			predictive.style.marginTop = "0.5rem";

			// Add the predicted emoji to the button
			predictive.innerHTML = el.emoji;

			// When the button is clicked, replace the input with the emoji, along with a space.
			predictive.onclick = event => {
				event.preventDefault();
				commitSummaryInput.value = el.emoji + " ";

				// Regain focus on the input so that the user can continue typing.
				commitSummaryInput.focus();

				// Remove the predictions, as the user has selected one.
				removeAllPredictions();
			};

			// Add this button after the others.
			buttonGroup.insertAdjacentElement("beforeend", predictive);

			// Increment the count to stop displaying too many predictions.
			predictiveCount++;
		}

		// Continue to the next array element.
		return true;
	});
}
