import Link from "next/link";

const baseClasses =
  "inline-flex min-h-12 items-center justify-center rounded-lg px-5 text-sm font-black transition duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-slate-950 text-white shadow-lg shadow-slate-950/20 hover:-translate-y-0.5 hover:bg-slate-800 focus:ring-slate-400/30",
  secondary:
    "border border-slate-200 bg-white/80 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:bg-white focus:ring-slate-300/40",
  soft:
    "bg-cyan-50 text-cyan-900 hover:-translate-y-0.5 hover:bg-cyan-100 focus:ring-cyan-300/40"
};

export default function Button({
  children,
  className = "",
  href,
  loading = false,
  variant = "primary",
  ...props
}) {
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  const content = (
    <>
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {content}
    </button>
  );
}
