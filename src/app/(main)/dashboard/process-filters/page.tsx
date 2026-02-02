import {
  ProcessFiltersAddRule,
  ProcessFiltersAppliedRules,
  ProcessFiltersSettings,
} from "./_components/process-filters-panel";

export default function Page() {
  return (
    <div className="space-y-10">
      <section id="settings" className="scroll-mt-24">
        <ProcessFiltersSettings />
      </section>
      <section id="add-new-rule" className="scroll-mt-24">
        <ProcessFiltersAddRule />
      </section>
      <section id="existing-rules" className="scroll-mt-24">
        <ProcessFiltersAppliedRules />
      </section>
    </div>
  );
}
