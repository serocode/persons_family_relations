import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// The question banks and study guides (~1 MB) are bundled on purpose so the whole app works offline.
	build: { chunkSizeWarningLimit: 1200 },
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Kit 3 dropped the built-in $lib alias; keep the conventional one.
			alias: { $lib: 'src/lib' },
			adapter: adapter({ fallback: '200.html' })
		})
	]
});
