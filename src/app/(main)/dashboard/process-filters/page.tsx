import { Card, CardContent } from "@/components/ui/card";

import {
  ProcessFiltersAddRule,
  ProcessFiltersAppliedRules,
  ProcessFiltersSettings,
} from "./_components/process-filters-panel";

export default function Page() {
  return (
    <div className="space-y-6">
      <Card className="py-4">
        <CardContent className="px-5">
          <section id="settings" className="scroll-mt-24">
            <ProcessFiltersSettings />
          </section>
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardContent className="px-5">
          <section id="add-new-rule" className="scroll-mt-24">
            <ProcessFiltersAddRule />
          </section>
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardContent className="px-5">
          <section id="existing-rules" className="scroll-mt-24">
            <ProcessFiltersAppliedRules />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
