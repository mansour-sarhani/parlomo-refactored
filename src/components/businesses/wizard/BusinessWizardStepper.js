export default function BusinessWizardStepper({ steps, currentStep }) {
    return (
        <ol className="flex flex-wrap gap-3">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                    <li key={step.title} className="flex items-center">
                        <div
                            className={`flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                isActive
                                    ? "bg-[var(--color-primary)] text-white"
                                    : isComplete
                                    ? "bg-[var(--color-success)] text-white"
                                    : "bg-[var(--color-secondary)] text-[var(--color-text-secondary)]"
                            }`}
                        >
                            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold"
                                style={{ color: "var(--color-primary)" }}
                            >
                                {index + 1}
                            </span>
                            {step.title}
                        </div>
                        {index !== steps.length - 1 && (
                            <span className="mx-2 h-px w-6 bg-[var(--color-border)]" />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}


