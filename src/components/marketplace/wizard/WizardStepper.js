export default function WizardStepper({ steps, currentStep }) {
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
                                    ? "bg-blue-600 text-white"
                                    : isComplete
                                    ? "bg-green-500 text-white"
                                    : "bg-neutral-200 text-neutral-600"
                            }`}
                        >
                            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-blue-600">
                                {index + 1}
                            </span>
                            {step.title}
                        </div>
                        {index !== steps.length - 1 && (
                            <span className="mx-2 h-px w-6 bg-neutral-300" />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

