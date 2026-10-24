import { initialOf } from "../../utils/message";
const colors = [
  "bg-pink-500",
  "bg-sky-500",
  "bg-amber-400",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-400",
];
export default function Avatar({ name, size = "md" }) {
  const index =
    Math.abs(
      String(name || "?")
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0),
    ) % colors.length;
  const dimensions =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-10 w-10 text-sm";
  return (
    <div
      className={`${colors[index]} ${dimensions} grid shrink-0 place-items-center rounded-full font-semibold text-white`}
    >
      {initialOf(name)}
    </div>
  );
}
