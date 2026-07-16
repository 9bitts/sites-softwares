/* ==========================================================
   9bitts — Conversão de moeda por idioma/região
   MOEDA BASE: EUR. Preços de origem sempre em euro
   (data-price / data-price-min / data-price-max).
   DE -> EUR (exibe o valor base) · EN -> USD · PT -> BRL
   BRL e USD são convertidos a partir do valor em euro.
   ========================================================== */

(function () {
  "use strict";

  var CURRENCY_BY_LANG = { pt: "BRL", en: "USD", de: "EUR" };

  // Taxas de fallback a partir do EUR (usadas até a busca ao vivo responder, ou se ela falhar)
  var FX = { USD: 1.09, BRL: 6.30 };
  var FX_FETCHED = false;

  function fetchLiveRates() {
    fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=USD,BRL")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.rates && data.rates.USD && data.rates.BRL) {
          FX.USD = data.rates.USD;
          FX.BRL = data.rates.BRL;
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
      if (cached && cached.date === today && cached.rates && cached.rates.BRL) {
        FX.USD = cached.rates.USD;
        FX.BRL = cached.rates.BRL;
        FX_FETCHED = true;
      }
    } catch (e) {}
  }

  function getLang() {
    try { return localStorage.getItem("9bitts_lang") || "pt"; } catch (e) { return "pt"; }
  }

  // Arredondamento "limpo" para os valores convertidos (BRL/USD).
  // O euro é a moeda base e é exibido exatamente como definido.
  function niceRound(v) {
    if (v >= 10000) return Math.round(v / 500) * 500;
    if (v >= 2000) return Math.round(v / 100) * 100;
    if (v >= 200) return Math.round(v / 10) * 10;
    return Math.round(v);
  }

  function convert(eur, currency) {
    if (currency === "USD") return niceRound(eur * FX.USD);
    if (currency === "BRL") return niceRound(eur * FX.BRL);
    return eur; // EUR: valor base, exato
  }

  function currencyForLang(lang) {
    return CURRENCY_BY_LANG[lang] || "EUR";
  }

  function formatPrice(eurValue, lang) {
    var currency = currencyForLang(lang);
    var value = convert(eurValue, currency);
    if (currency === "USD") return "$" + value.toLocaleString("en-US");
    if (currency === "BRL") return "R$ " + value.toLocaleString("pt-BR");
    return value.toLocaleString("de-DE") + " €";
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
