export default function PlayerTag({children}: {children?: React.ReactNode}) {
  return (
    <span className="grid place-content-center rounded px-2 h-fit bg-linear-to-br from-amber-400 to-amber-500 border border-black text-black font-semibold">
      {children}
    </span>
  );
}