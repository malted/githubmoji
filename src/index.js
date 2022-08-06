import { observe } from "selector-observer";
import { createButtonGroup, createButtons, replaceCodes } from "./utils.js";

/* Detect when the input is added to the DOM. This is necessary because
the router GitHub uses is funky & quirky and does not use the browser's
native navigation. This means the load event is not fired for the navigation
methods that lead to the pages we are interested in injecting into. */
observe("#commit-summary-input", {
	// Called when the element is detected to have been added to the DOM.
	add(commitSummaryInput) {
		const buttonGroup = createButtonGroup();

		commitSummaryInput.oninput = () => {
			// Remove the predictions from the last keystroke, ready for this one.
			buttonGroup.textContent = "";

			createButtons(commitSummaryInput, buttonGroup);

			// Replace Gitmoji codes with the corresponding emoji, for example :bug: becomes 🐛.
			replaceCodes(commitSummaryInput);
		};
	},
});
