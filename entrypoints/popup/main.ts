import { sendMessage } from "webext-bridge/popup";
import "./style.css";

const charactersContainer = document.querySelector(
	".characters",
) as HTMLDivElement;

const characters = await sendMessage(
	BACKGROUND_ACTIONS.GET_CHARACTERS,
	{},
	"background",
);
console.log("from popup", characters);

for (const char of characters) {
	const li = document.createElement("li");
	li.textContent = `${char.name}: ${char.note}`;
	charactersContainer.append(li);
}
