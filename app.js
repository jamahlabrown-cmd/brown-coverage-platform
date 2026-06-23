const SUPABASE_URL = "https://hgiuvudzyaadjhohplik.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnaXV2dWR6eWFhZGpob2hwbGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzAzNzksImV4cCI6MjA5NzgwNjM3OX0.S5VYlMPuYyQgn_9TR7RiHwTLx8XQBvXNi6FCg-PdBY8";

async function saveLeadToSupabase(lead) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return true;
}const brokers = [
  { name: "Maria Lopez", state: ["NC","SC","GA","FL","TX"], products: ["Marketplace Health","Life Insurance","Final Expense","Dental and Vision","Critical Illness"], language: "Spanish", tier: "Partner" },
  { name: "Marcus Green", state: ["NC","VA","SC"], products: ["Marketplace Health","Life Insurance","Final Expense"], language: "English", tier: "Growth" },
  { name: "Olivia Carter", state: ["GA","FL","TX"], products: ["Life Insurance","Final Expense","Critical Illness"], language: "English", tier: "Growth" },
  { name: "Daniel Rivera", state: ["TX","FL"], products: ["Marketplace Health","Life Insurance","Final Expense","Dental and Vision"], language: "Spanish", tier: "Partner" },
  { name: "Avery Thompson", state: ["VA","NC","GA"], products: ["Marketplace Health","Dental and Vision","Critical Illness"], language: "English", tier: "Starter" }
];

const seedLeads = [
  { id: "LD-1001", name: "Jasmine Miller", state: "NC", product: "Marketplace Health", language: "English", source: "Organic website", status: "New", broker: "Marcus Green", quality: "Qualified", created: "Today" },
  { id: "LD-1002", name: "Carlos Hernandez", state: "TX", product: "Final Expense", language: "Spanish", source: "Spanish landing page", status: "Appointment scheduled", broker: "Daniel Rivera", quality: "Appointment", created: "Today" },
  { id: "LD-1003", name: "Tanya Brooks", state: "GA", product: "Life Insurance", language: "English", source: "Facebook ad", status: "Quoted", broker: "Olivia Carter", quality: "Paid exclusive", created: "Yesterday" },
  { id: "LD-1004", name: "Miguel Santos", state: "FL", product: "Marketplace Health", language: "Spanish", source: "Referral partner", status: "Application started", broker: "Maria Lopez", quality: "Strategic partner", created: "Yesterday" }
];

function getStoredLeads() {
  const stored = localStorage.getItem("bitp_leads");
  if (!stored) {
    localStorage.setItem("bitp_leads", JSON.stringify(seedLeads));
    return seedLeads;
  }
  return JSON.parse(stored);
}

function saveLead(lead) {
  const leads = getStoredLeads();
  leads.unshift(lead);
  localStorage.setItem("bitp_leads", JSON.stringify(leads));
}

function chooseBroker(state, product, language) {
  let matches = brokers.filter(b => b.state.includes(state) && b.products.includes(product));
  if (language === "Spanish") {
    const spanishMatch = matches.find(b => b.language === "Spanish");
    if (spanishMatch) return spanishMatch;
  }
  return matches[0] || brokers[0];
}

function leadShare(quality, source) {
  if (source === "Broker-owned client") return "3%";
  if (quality === "Strategic partner") return "30%–40%";
  if (quality === "Paid exclusive") return "25%";
  if (quality === "Appointment") return "20%";
  if (quality === "Qualified") return "15%";
  return "10%";
}

function setupOptions() {
  document.querySelectorAll("[data-option-group]").forEach(group => {
    group.querySelectorAll(".option").forEach(option => {
      option.addEventListener("click", () => {
        group.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");
        const input = document.querySelector(`#${group.dataset.optionGroup}`);
        if (input) input.value = option.dataset.value;
      });
    });
  });
}

function setupQuoteForm() {
  const form = document.querySelector("#quoteForm");
  if (!form) return;
  setupOptions();
  const productInput = document.querySelector("#product");
  const detailWrap = document.querySelector("#productDetails");

  function renderProductFields() {
    const product = productInput.value || "Marketplace Health";
    let html = "";
    if (product === "Marketplace Health") {
      html = `
        <div class="row">
          <div class="field"><label>Household size</label><input name="householdSize" type="number" min="1" placeholder="Example: 3"></div>
          <div class="field"><label>Estimated yearly household income</label><input name="income" placeholder="Example: $48,000"></div>
        </div>
        <div class="field"><label>Any preferred doctors or prescriptions?</label><textarea name="needs" placeholder="List doctors, medications, or coverage concerns."></textarea></div>`;
    } else if (product === "Life Insurance") {
      html = `
        <div class="row">
          <div class="field"><label>Coverage amount desired</label><select name="coverageAmount"><option>$100,000</option><option>$250,000</option><option>$500,000</option><option>$1,000,000+</option><option>Not sure</option></select></div>
          <div class="field"><label>Tobacco use?</label><select name="tobacco"><option>No</option><option>Yes</option></select></div>
        </div>
        <div class="field"><label>Main reason for coverage</label><textarea name="needs" placeholder="Example: protect my family, mortgage, child, income replacement."></textarea></div>`;
    } else if (product === "Final Expense") {
      html = `
        <div class="row">
          <div class="field"><label>Coverage amount desired</label><select name="coverageAmount"><option>$5,000</option><option>$10,000</option><option>$15,000</option><option>$25,000</option><option>Not sure</option></select></div>
          <div class="field"><label>Urgency</label><select name="urgency"><option>Just looking</option><option>Need coverage soon</option><option>Ready to speak with someone</option></select></div>
        </div>
        <div class="field"><label>Any major health concerns?</label><textarea name="needs" placeholder="This helps the licensed broker prepare options."></textarea></div>`;
    } else {
      html = `
        <div class="row">
          <div class="field"><label>Coverage start date</label><input name="startDate" type="date"></div>
          <div class="field"><label>Budget range</label><select name="budget"><option>Lowest available</option><option>Balanced</option><option>Best coverage</option><option>Not sure</option></select></div>
        </div>
        <div class="field"><label>What should the broker know?</label><textarea name="needs" placeholder="Tell us anything important."></textarea></div>`;
    }
    detailWrap.innerHTML = html;
  }

  document.querySelectorAll(".option").forEach(o => o.addEventListener("click", renderProductFields));
  renderProductFields();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const product = data.product || "Marketplace Health";
    const state = data.state || "NC";
    const language = data.language || "English";
    const broker = chooseBroker(state, product, language);
    const lead = {
      id: "LD-" + Math.floor(1000 + Math.random() * 9000),
      name: `${data.firstName || "New"} ${data.lastName || "Lead"}`,
      state,
      product,
      language,
      source: "Website quote flow",
      status: "New",
      broker: broker.name,
      quality: "Qualified",
      created: "Just now",
      contact: data.phone || data.email || ""
    };
    saveLead(lead);
    const result = document.querySelector("#quoteResult");
    result.classList.remove("hidden");
    result.innerHTML = `
      <h3>Lead created: ${lead.id}</h3>
      <p><strong>Assigned broker:</strong> ${broker.name} (${broker.tier}, ${broker.language})</p>
      <p><strong>Product:</strong> ${lead.product} • <strong>State:</strong> ${lead.state} • <strong>Platform share:</strong> ${leadShare(lead.quality, lead.source)}</p>
      <p class="small">This is a prototype. In production, this step would also save consent, contact permission, timestamp, source, and compliance records.</p>
      <a class="button primary" href="broker.html">View in broker dashboard</a>
    `;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function setupDashboards() {
  const table = document.querySelector("#leadTableBody");
  if (!table) return;
  const leads = getStoredLeads();
  table.innerHTML = leads.map(lead => `
    <tr>
      <td><strong>${lead.id}</strong><br><span class="small">${lead.created}</span></td>
      <td>${lead.name}</td>
      <td>${lead.product}<br><span class="small">${lead.state} • ${lead.language}</span></td>
      <td>${lead.source}</td>
      <td><span class="status ${lead.status === "New" ? "hot" : lead.status === "Sold" ? "sold" : ""}">${lead.status}</span></td>
      <td>${lead.broker}</td>
      <td>${leadShare(lead.quality, lead.source)}</td>
    </tr>
  `).join("");

  const total = leads.length;
  const hot = leads.filter(l => ["New","Appointment scheduled","Application started"].includes(l.status)).length;
  const spanish = leads.filter(l => l.language === "Spanish").length;
  const products = [...new Set(leads.map(l => l.product))].length;
  setText("metricTotal", total);
  setText("metricHot", hot);
  setText("metricSpanish", spanish);
  setText("metricProducts", products);
}

function setupAdminCharts() {
  const leads = getStoredLeads();
  const productCounts = {};
  leads.forEach(l => productCounts[l.product] = (productCounts[l.product] || 0) + 1);
  const max = Math.max(...Object.values(productCounts), 1);
  const chart = document.querySelector("#productBars");
  if (chart) {
    chart.innerHTML = Object.entries(productCounts).map(([product, count]) => `
      <div class="bar-row">
        <span>${product}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(count/max)*100}%"></div></div>
        <strong>${count}</strong>
      </div>
    `).join("");
  }
}

function setText(id, value) {
  const el = document.querySelector("#" + id);
  if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", () => {
  setupQuoteForm();
  setupDashboards();
  setupAdminCharts();
});
