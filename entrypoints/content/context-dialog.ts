const html = String.raw;

export function showContextDialog(
  selectedText: string,
  container: HTMLElement,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dialog = document.createElement("dialog");
    dialog.className = "context-modal";
    dialog.innerHTML = html`
      <form class="context-modal__form" method="dialog">
        <h2 class="context-modal__title">Add context to "${selectedText}"</h2>
        <div class="context-modal__field">
          <label class="context-modal__label" for="context-input">
            Context
          </label>
          <textarea
            class="context-modal__textarea"
            name="context"
            id="context-input"
            rows="6"
            required
          >
          </textarea>
        </div>
        <div class="context-modal__actions">
          <button
            name="cancel"
            type="button"
            class="context-modal__btn context-modal__btn--secondary"
          >
            Cancel
          </button>
          <button
            name="submit"
            type="submit"
            class="context-modal__btn context-modal__btn--primary"
            disabled
          >
            Save
          </button>
        </div>
      </form>
    `;

    const form = dialog.querySelector("form")!;
    const formElements = form.elements as HTMLFormControlsCollection & {
      context: HTMLTextAreaElement;
      submit: HTMLButtonElement;
      cancel: HTMLButtonElement;
    };
    const context = formElements.context;
    const submitBtn = formElements.submit;
    const cancelBtn = formElements.cancel;

    const cleanup = (): void => {
      dialog.close();
      dialog.remove();
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = context.value.trim();
      if (!value) {
        context.focus();
        return;
      }
      resolve(value);
      cleanup();
    });

    cancelBtn.addEventListener("click", () => {
      reject(new Error("cancelled"));
      cleanup();
    });

    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      reject(new Error("cancelled"));
      cleanup();
    });

    context.addEventListener("input", () => {
      submitBtn.disabled = !context.value.trim();
    });

    container.append(dialog);
    dialog.showModal();
  });
}
