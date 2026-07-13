import { f as lazyRouteComponent, p as createFileRoute } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as products } from "./_ssr/products-CdxBBAAx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_handle-Cz_hD1nJ.js
var $$splitComponentImporter = () => import("./_handle-CsTQoW2f.mjs");
var Route = createFileRoute("/shop/$handle")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: ({ params }) => {
		const p = products.find((x) => x.handle === params.handle);
		return { meta: [{ title: `${p?.title ?? "Product"} · Curated by MMJ — Notebooks` }, {
			name: "description",
			content: p?.description
		}] };
	}
});
//#endregion
export { Route as t };
