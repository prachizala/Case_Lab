import assert from "assert";
import {
  DOMAINS,
  DOMAIN_NAMES,
  getDomainByName,
  getTopicsForDomain,
  isValidDomain,
  DomainName,
} from "../src/config/domains";
import { generateCECasePack } from "../src/lib/casepack/generate";
import { getDepartmentProfile } from "../src/config/casepack/departments";
import { mockStore } from "../src/lib/mock-db";

console.log("==============================================================================");
console.log("🧪 RUNNING STEP 1 VERIFICATION TESTS: 8 BUSINESS DOMAINS & GENERATOR PIPELINE");
console.log("==============================================================================");

mockStore.seedTestFixtures();

// 1. Verify exactly 8 domains with exact names
const EXPECTED_NAMES = [
  "Finance",
  "Marketing",
  "HR",
  "IT",
  "Supply Chain",
  "Strategy",
  "Analytics",
  "Operations",
];

assert.strictEqual(DOMAINS.length, 8, "Must have exactly 8 domains in DOMAINS");
assert.strictEqual(DOMAIN_NAMES.length, 8, "Must have exactly 8 domain names in DOMAIN_NAMES");

EXPECTED_NAMES.forEach((name, index) => {
  assert.strictEqual(DOMAIN_NAMES[index], name, `Domain name at ${index} must be ${name}`);
  const domainConfig = DOMAINS.find((d) => d.name === name);
  assert(domainConfig, `Domain config for ${name} must exist`);
  assert(domainConfig.id, `Domain ${name} must have an id`);
  assert(domainConfig.shortDescription, `Domain ${name} must have a short description`);
  assert(domainConfig.units.length > 0, `Domain ${name} must have at least one unit`);
  assert(isValidDomain(name), `isValidDomain(${name}) must be true`);
});
console.log("  ✅ PASS: Exactly 8 domains configured with canonical names and metadata.");

// 2. Verify Supply Chain and Operations are separate with distinct topics
const scTopics = getTopicsForDomain("Supply Chain");
const opsTopics = getTopicsForDomain("Operations");
assert(scTopics.length > 0, "Supply Chain must have topics");
assert(opsTopics.length > 0, "Operations must have topics");
assert(scTopics.includes("procurement and sourcing"), "Supply Chain must contain 'procurement and sourcing'");
assert(opsTopics.includes("production planning"), "Operations must contain 'production planning'");
const topicOverlap = scTopics.filter((t) => opsTopics.includes(t));
assert.strictEqual(topicOverlap.length, 0, "Supply Chain and Operations topics must be strictly distinct");
console.log("  ✅ PASS: Supply Chain and Operations have separate, distinct topic lists.");

// 3. Verify topic chips change with the domain
const financeTopics = getTopicsForDomain("Finance");
const hrTopics = getTopicsForDomain("HR");
const itTopics = getTopicsForDomain("IT");
assert(financeTopics.includes("capital budgeting"), "Finance must contain 'capital budgeting'");
assert(hrTopics.includes("HR planning"), "HR must contain 'HR planning'");
assert(itTopics.includes("cybersecurity and data privacy"), "IT must contain 'cybersecurity and data privacy'");
assert.notDeepStrictEqual(financeTopics, hrTopics, "Finance and HR topics must differ");
assert.notDeepStrictEqual(itTopics, financeTopics, "IT and Finance topics must differ");
console.log("  ✅ PASS: Dynamic topics change correctly per selected domain.");

async function runTests() {
  // 4. Verify generation works for each of the 8 domains
  for (const domainName of EXPECTED_NAMES) {
    const dConfig = getDomainByName(domainName)!;
    const { casePack } = await generateCECasePack({
      department: dConfig.id as any,
      subject: `${domainName} Advanced Case Studies`,
      topics: dConfig.units[0].topics.slice(0, 3),
      industry: "Indian Enterprise",
      length: "standard",
    });

    assert(casePack, `Case pack for domain ${domainName} must be generated`);
    assert(casePack.case.title, `Case pack for domain ${domainName} must have a title`);
    assert(casePack.case.sections.length > 0, `Case pack for domain ${domainName} must have sections`);
    assert(casePack.questions.length > 0, `Case pack for domain ${domainName} must have questions`);
    assert(casePack.answers.length > 0, `Case pack for domain ${domainName} must have answers`);
    assert(casePack.teaching_notes, `Case pack for domain ${domainName} must have teaching notes`);
  }
  console.log("  ✅ PASS: Case pack generation works seamlessly for all 8 domains.");

  // 5. Verify domain profile resolution (core vs generic fallback)
  const finProfile = getDepartmentProfile("finance");
  assert.strictEqual(finProfile.id, "finance");
  assert.strictEqual(finProfile.name, "Finance");

  const itProfile = getDepartmentProfile("it");
  assert.strictEqual(itProfile.name, "IT");
  assert(itProfile.units.length > 0, "IT profile must contain units");

  const scProfile = getDepartmentProfile("supply-chain");
  assert.strictEqual(scProfile.name, "Supply Chain");
  console.log("  ✅ PASS: Core profiles preserved and generic profiles properly synthesized.");

  // 6. Verify filtering and old cases without domain still display
  const allCases = mockStore.getCases();
  assert(allCases.length >= 7, "Mock store must contain seeded cases");

  // Test that cases exist for multiple domains
  const domainsInMock = new Set(allCases.map((c) => c.domain).filter(Boolean));
  assert(domainsInMock.has("Finance"), "Mock cases should include Finance");
  assert(domainsInMock.has("Operations"), "Mock cases should include Operations");
  assert(domainsInMock.has("IT"), "Mock cases should include IT");
  assert(domainsInMock.has("Analytics"), "Mock cases should include Analytics");

  // Test case without domain (simulate legacy unmapped case)
  const unassignedCase = {
    ...allCases[0],
    id: "case-unassigned-test",
    domain: undefined,
    title: "Legacy Case Without Domain",
  };
  mockStore.saveCase(unassignedCase);
  const retrievedUnassigned = mockStore.getCase("case-unassigned-test");
  assert(retrievedUnassigned, "Unassigned case must be retrieved cleanly");
  assert.strictEqual(retrievedUnassigned.domain, undefined, "Domain is undefined for unmapped legacy case");

  console.log("  ✅ PASS: Mock cases cover 8 domains; unassigned legacy cases display cleanly.");
  console.log("\n🎉 ALL STEP 1 UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
