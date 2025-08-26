import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
    index("pages/Home.tsx"),
    route("/list", "pages/List.tsx"),
    route("/view/:bookId", "pages/View.tsx"),
] satisfies RouteConfig;