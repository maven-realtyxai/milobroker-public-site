import { footer } from "../content.js";

/** Explains the platform's role before the legal footer; no controls or side effects. */
export function DisclaimerSection() {
  return (
    <aside className="border-t border-line bg-sage" aria-labelledby="disclaimer-title">
      <div className="p-4">
        <h2 id="disclaimer-title" className="text-[2rem]">{footer.disclaimerTitle}</h2>
        <p className="text-sm leading-relaxed">{footer.disclaimer}</p>
      </div>
    </aside>
  );
}
