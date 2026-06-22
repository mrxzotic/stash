(function () {
  const form = document.querySelector("[data-waitlist-form]");
  const status = document.querySelector("[data-waitlist-status]");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = form.querySelector("input[name='email']");
    const button = form.querySelector("button[type='submit']");
    const email = String(input?.value || "").trim();

    status.className = "waitlist-status";
    if (!email || !input.checkValidity()) {
      status.textContent = "Enter a valid email.";
      status.classList.add("is-error");
      return;
    }

    button.disabled = true;
    status.textContent = "Joining...";

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not join the waitlist.");
      }
      input.value = "";
      status.textContent = "You're on the list.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent = "Could not join right now. Try again in a minute.";
      status.classList.add("is-error");
    } finally {
      button.disabled = false;
    }
  });
})();
