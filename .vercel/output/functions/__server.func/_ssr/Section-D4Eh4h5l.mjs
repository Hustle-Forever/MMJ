import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Section-D4Eh4h5l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			primary: "bg-blue text-white shadow-soft transition-[transform,box-shadow,background-color] ease-soft duration-(--duration-micro) hover:-translate-y-1 hover:shadow-lift active:translate-y-0 active:shadow-soft",
			quiet: "border border-border bg-transparent text-ink transition-[transform,box-shadow,background-color,border-color] ease-soft duration-(--duration-micro) hover:-translate-y-1 hover:bg-white hover:shadow-card active:translate-y-0 active:shadow-none"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9",
			pill: "min-h-11 rounded-full px-8 py-2 text-[length:var(--type-caption)] uppercase tracking-caps"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var widths = {
	narrow: "max-w-3xl",
	default: "max-w-7xl",
	wide: "max-w-wide"
};
/** Centered max-width wrapper with responsive side padding on the 8px grid. */
var Container = (0, import_react.forwardRef)(({ width = "default", className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("mx-auto w-full px-6 md:px-10", widths[width], className),
	...props
}));
Container.displayName = "Container";
var backgrounds = {
	blush: "bg-blush",
	"blush-2": "bg-blush-2",
	white: "bg-white",
	"footer-pink": "bg-footer-pink",
	none: ""
};
var rhythms = {
	default: "py-section",
	compact: "py-section-sm",
	none: ""
};
/** Layout band applying the locked section rhythm and a token background. */
var Section = (0, import_react.forwardRef)(({ as = "section", bg = "none", rhythm = "default", className, ...props }, ref) => (0, import_react.createElement)(as, {
	ref,
	className: cn("relative", backgrounds[bg], rhythms[rhythm], className),
	...props
}));
Section.displayName = "Section";
//#endregion
export { cn as i, Container as n, Section as r, Button as t };
