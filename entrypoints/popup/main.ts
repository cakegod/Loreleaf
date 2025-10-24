import "./style.css";
import { store } from "~/utils/store";

const charactersContainer = document.querySelector(
	".characters",
) as HTMLDivElement;

const storeValue = await store.getValue();
console.log("from popup", storeValue)

for (const char of storeValue) {
	const li = document.createElement("li");
	li.textContent = `${char.name}: ${char.context}`;
	charactersContainer.append(li);
}
