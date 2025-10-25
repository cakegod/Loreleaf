import "./style.css";
import { charactersStore } from "@/utils/stores";

const charactersContainer = document.querySelector(
	".characters",
) as HTMLDivElement;

const characters = await charactersStore.getValue();
console.log("from popup", characters);

for (const char of Object.values(characters)) {
	const li = document.createElement("li");
	li.textContent = `${char.name}: ${char.context}`;
	charactersContainer.append(li);
}
