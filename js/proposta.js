/* ==========================================================
   9bitts — Configurador de proposta
   Soma itens selecionados e monta o e-mail final (multi-idioma)
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

  function currentLang() {
    try { return localStorage.getItem("9bitts_lang") || "pt"; } catch (e) { return "pt"; }
  }

  function tr(key) {
    return window.t ? window.t(currentLang(), key) : key;
  }

  function itemTitle(key) {
    return tr("item." + key + ".title");
  }

  function formatBRL(value) {
    // Converte para a moeda correta do idioma atual (BRL/USD/EUR) via js/currency.js
    return window.formatPrice ? window.formatPrice(value, currentLang()) : "R$ " + value.toLocaleString("pt-BR");
  }

  function getSelected() {
    return inputs.filter((i) => i.checked);
  }

  function render() {
    const selected = getSelected();

    inputs.forEach((i) => {
      const row = i.closest(".item-row");
      row.classList.toggle("checked", i.checked);
    });

    summaryItems.innerHTML = "";
    if (selected.length === 0) {
      summaryEmpty.textContent = tr("summary.empty");
      summaryEmpty.style.display = "block";
    } else {
      summaryEmpty.style.display = "none";
      selected.forEach((i) => {
        const price = parseFloat(i.getAttribute("data-price")) || 0;
        const recurring = i.getAttribute("data-recurring") === "true";
        const key = i.getAttribute("data-item-key");
        const line = document.createElement("div");
        line.className = "summary-line";
        line.innerHTML =
          "<span>" + itemTitle(key) + "</span><span>" +
          formatBRL(price) + (recurring ? tr("price.perMonth") : "") + "</span>";
        summaryItems.appendChild(line);
      });
    }

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
      totalMonthlyEl.textContent = formatBRL(monthly) + tr("price.perMonth");
    } else {
      monthlyRow.style.display = "none";
    }
  }

  inputs.forEach((i) => i.addEventListener("change", render));

  // Re-render whenever the language changes (updates item names, currency labels, etc.)
  document.addEventListener("i18n:change", function () {
    render();
    document.querySelectorAll(".details-toggle").forEach((btn) => {
      const details = btn.closest(".item-body").querySelector(".item-details");
      const isOpen = details.classList.contains("open");
      btn.textContent = tr(isOpen ? "summary.verMenos" : "summary.verMais");
    });
  });

  render();

  // ---------- "Ver mais detalhes" toggle (não deve marcar/desmarcar o item) ----------
  document.querySelectorAll(".details-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const details = btn.closest(".item-body").querySelector(".item-details");
      const isOpen = details.classList.toggle("open");
      btn.textContent = tr(isOpen ? "summary.verMenos" : "summary.verMais");
    });
  });

  // ---------- Email flow ----------
  if (openEmailFormBtn && emailForm) {
    openEmailFormBtn.addEventListener("click", () => {
      const selected = getSelected();
      if (selected.length === 0) {
        summaryEmpty.textContent = tr("summary.selectAtLeast");
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
        const key = i.getAttribute("data-item-key");
        if (recurring) monthly += price; else oneTime += price;
        return "- " + itemTitle(key) + ": " + formatBRL(price) + (recurring ? tr("price.perMonth") : "");
      });

      let body = tr("mail.intro") + "\n\n";
      body += tr("mail.nameLabel") + ": " + name + "\n";
      body += tr("mail.emailLabel") + ": " + email + "\n\n";
      body += tr("mail.itemsHeader") + "\n" + lines.join("\n") + "\n\n";
      body += tr("mail.investLabel") + " " + formatBRL(oneTime) + "\n";
      if (monthly > 0) body += tr("mail.recorLabel") + " " + formatBRL(monthly) + tr("price.perMonth") + "\n";

      const subject = tr("mail.subjectPrefix") + (name || tr("mail.defaultContact"));
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
