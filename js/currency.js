/* ==========================================================
   9bitts — Conversão de moeda por idioma/região
   PT -> BRL · EN -> USD · DE -> EUR
   Preços de origem sempre em BRL (data-price / data-price-min / data-price-max).
   ========================================================== */

(function () {
  "use strict";

  var CURRENCY_BY_LANG = { pt: "BRL", en: "USD", de: "EUR" };

  // Taxas de fallback (usadas até a busca ao vivo responder, ou se ela falhar)
  var FX = { USD: 0.193, EUR: 0.169 };
  var FX_FETCHED = false;

  function fetchLiveRates() {
    fetch("https://api.frankfurter.dev/v1/latest?from=BRL&to=USD,EUR")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.rates && data.rates.USD && data.rates.EUR) {
          FX.USD = data.rates.USD;
          FX.EUR = data.rates.EUR;
          FX_FETCHED = true;
          try {
            localStorage.setItem("9bitts_fx", JSON.stringify({ rates: FX, date: data.date }));
          } catch (e) {}
          renderAllPrices(getLang());
        }
      })
      .catch(function () { /* mantém taxas de fallback silenciosamente */ });
  }

  function loadCachedRates() {
    try {
      var cached = JSON.parse(localStorage.getItem("9bitts_fx") || "null");
      var today = new Date().toISOString().slice(0, 10);
      if (cached && cached.date === today && cached.rates) {
        FX.USD = cached.rates.USD;
        FX.EUR = cached.rates.EUR;
        FX_FETCHED = true;
      }
    } catch (e) {}
  }

  function getLang() {
    try { return localStorage.getItem("9bitts_lang") || "pt"; } catch (e) { return "pt"; }
  }

  function niceRound(v) {
    if (v >= 200) return Math.round(v / 10) * 10;
    return Math.round(v);
  }

  function convert(brl, currency) {
    if (currency === "USD") return niceRound(brl * FX.USD);
    if (currency === "EUR") return niceRound(brl * FX.EUR);
    return brl;
  }

  function currencyForLang(lang) {
    return CURRENCY_BY_LANG[lang] || "BRL";
  }

  function formatPrice(brlValue, lang) {
    var currency = currencyForLang(lang);
    var value = convert(brlValue, currency);
    if (currency === "USD") return "$" + value.toLocaleString("en-US");
    if (currency === "EUR") return value.toLocaleString("de-DE") + " €";
    return "R$ " + value.toLocaleString("pt-BR");
  }

  window.formatPrice = formatPrice;
  window.getCurrencyLang = getLang;

  function renderAllPrices(lang) {
    // Ranges (cards de serviço)
    document.querySelectorAll("[data-price-min]").forEach(function (el) {
      var min = parseFloat(el.getAttribute("data-price-min")) || 0;
      var max = parseFloat(el.getAttribute("data-price-max")) || 0;
      var openEnded = el.getAttribute("data-open-ended") === "true";
      var recurring = el.getAttribute("data-recurring") === "true";
      var text = formatPrice(min, lang) + " – " + formatPrice(max, lang) + (openEnded ? "+" : "");
      if (recurring) text += window.t ? window.t(lang, "price.perMonth") : "/mês";
      el.textContent = text;
    });

    // Valores únicos (itens da proposta)
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var price = parseFloat(el.getAttribute("data-price"));
      if (isNaN(price)) return;
      var priceEl = el.querySelector(":scope > .item-price") || el.parentElement && el.parentElement.querySelector(".item-price");
      // input elements: procurar o span irmão dentro do mesmo label
      var label = el.closest(".item-row");
      if (!label) return;
      var span = label.querySelector(".item-price");
      if (!span) return;
      var recurring = el.getAttribute("data-recurring") === "true";
      var qualifier = span.getAttribute("data-qualifier");
      var html = formatPrice(price, lang);
      if (qualifier === "aPartirDe") {
        html += '<span class="per" data-i18n="price.aPartirDe">' + (window.t ? window.t(lang, "price.aPartirDe") : "a partir de") + "</span>";
      } else if (qualifier === "perMonth" || recurring) {
        html += '<span class="per" data-i18n="price.perMonth">' + (window.t ? window.t(lang, "price.perMonth") : "/mês") + "</span>";
      }
      span.innerHTML = html;
    });
  }

  window.renderAllPrices = renderAllPrices;

  document.addEventListener("i18n:change", function (e) {
    renderAllPrices(e.detail.lang);
  });

  document.addEventListener("DOMContentLoaded", function () {
    loadCachedRates();
    renderAllPrices(getLang());
    fetchLiveRates();
  });
})();
