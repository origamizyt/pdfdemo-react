import type { Config } from '@react-router/dev/config'
import books from './src/assets/books.json'

export default {
    async prerender() {
        const prerenderList = ['/', '/list'];
        for (const book of books) {
            prerenderList.push(`/view/${book.id}`);
        }
        return prerenderList;
    },
    ssr: false,
    appDirectory: "src",
    buildDirectory: "dist",
    basename: process.env.BASENAME ?? '/'
} satisfies Config;