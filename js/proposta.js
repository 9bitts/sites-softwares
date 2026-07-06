/* ==========================================================
   9bitts — Configurador de proposta
   Soma itens selecionados e monta o e-mail final
   ========================================================== */

(function () {
  "use strict";

  const DEST_EMAIL = "diegoalbs@proton.me";

  const inputs = Array.from(document.querySelectorAll(".builder-input"));
  const summaryItems = document.getElementById("summaryItems");
  const summaryEmpty = document.getElementById("summaryEmpty");
  const totalOneTimeEl = document.getElementById("totalOneTime");
  const totalMonthlyEl = document.getElementById("totalMonthly");
  const monthlyRow = document.getElementById("monthlyRow");
  const openEmailFormBtn = document.getElementById("openEmailForm");
  const emailForm = document.getElementById("emailForm");
  const confirmMsg = document.getElementById("confirmMsg");

  if (!inputs.length) return;

  function formatBRL(value) {
    return "R$ " + value.toLocaleString("pt-BR");
  }

  function getSelected() {
    return inputs.filter((i) => i.checked);
  }

  function render() {
    const selected = getSelected();

    // row highlight
    inputs.forEach((i) => {
      const row = i.closest(".item-row");
      row.classList.toggle("checked", i.checked);
    });

    // summary list
    summaryItems.innerHTML = "";
    if (selected.length === 0) {
      summaryEmpty.style.display = "block";
    } else {
      summaryEmpty.style.display = "none";
      selected.forEach((i) => {
        const price = parseFloat(i.getAttribute("data-price")) || 0;
        const recurring = i.getAttribute("data-recurring") === "true";
        const line = document.createElement("div");
        line.className = "summary-line";
        line.innerHTML =
          "<span>" + i.getAttribute("data-label") + "</span><span>" +
          formatBRL(price) + (recurring ? "/mês" : "") + "</span>";
        summaryItems.appendChild(line);
      });
    }

    // totals
    let oneTime = 0;
    let monthly = 0;
    selected.forEach((i) => {
      const price = parseFloat(i.getAttribute("data-price")) || 0;
      if (i.getAttribute("data-recurring") === "true") {
        monthly += price;
      } else {
        oneTime += price;
      }
    });

    totalOneTimeEl.textContent = formatBRL(oneTime);
    if (monthly > 0) {
      monthlyRow.style.display = "flex";
      totalMonthlyEl.textContent = formatBRL(monthly) + "/mês";
    } else {
      monthlyRow.style.display = "none";
    }
  }

  inputs.forEach((i) => i.addEventListener("change", render));
  render();

  // ---------- "Ver mais detalhes" toggle (não deve marcar/desmarcar o item) ----------
  document.querySelectorAll(".details-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const details = btn.closest(".item-body").querySelector(".item-details");
      const isOpen = details.classList.toggle("open");
      btn.textContent = isOpen ? "Ver menos detalhes" : "Ver mais detalhes";
    });
  });

  // ---------- Email flow ----------
  if (openEmailFormBtn && emailForm) {
    openEmailFormBtn.addEventListener("click", () => {
      const selected = getSelected();
      if (selected.length === 0) {
        summaryEmpty.textContent = "Selecione ao menos um item antes de continuar.";
        summaryEmpty.style.display = "block";
        return;
      }
      emailForm.classList.toggle("open");
    });

    emailForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("nameInput").value.trim();
      const email = document.getElementById("emailInput").value.trim();
      const selected = getSelected();

      let oneTime = 0;
      let monthly = 0;
      const lines = selected.map((i) => {
        const price = parseFloat(i.getAttribute("data-price")) || 0;
        const recurring = i.getAttribute("data-recurring") === "true";
        if (recurring) monthly += price; else oneTime += price;
        return "- " + i.getAttribute("data-label") + ": " + formatBRL(price) + (recurring ? "/mês" : "");
      });

      let body = "Nova proposta montada pelo site 9bitts\n\n";
      body += "Nome: " + name + "\n";
      body += "E-mail: " + email + "\n\n";
      body += "Itens selecionados:\n" + lines.join("\n") + "\n\n";
      body += "Investimento inicial: " + formatBRL(oneTime) + "\n";
      if (monthly > 0) body += "Recorrência mensal: " + formatBRL(monthly) + "/mês\n";

      const subject = "Proposta 9bitts - " + (name || "Novo contato");
      const mailto =
        "mailto:" + encodeURIComponent(DEST_EMAIL) +
        "?cc=" + encodeURIComponent(email) +
        "&subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      confirmMsg.classList.add("show");
    });
  }
})();
