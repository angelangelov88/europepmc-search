import type { SpinnerProps } from "../../../types/Search";

// The text is always shown, so the spinner never relies on the animation
// alone. role="status" makes screen readers announce it.
const Spinner = ({ label }: SpinnerProps) => (
  <div role="status" className="flex items-center gap-2 text-gray-700">
    <span
      aria-hidden="true"
      className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-700 motion-reduce:animate-none"
    />
    <span>{label}</span>
  </div>
);

export default Spinner;
