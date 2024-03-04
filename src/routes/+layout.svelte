<script>
	import NavLink from '$lib/components/NavLink.svelte';
	import '../app.css';
</script>

<div class="flex h-screen">
	<aside class="h-full bg-gray-800 w-64">
		<div class="p-4">
			<h1 class="text-white text-xl font-semibold mb-4">Pantau Lab</h1>
			<ul>
				<li class="mb-2">
					<NavLink to="/">Display</NavLink>
				</li>
				<li class="mb-2">
					<NavLink to="/settings">Settings</NavLink>
				</li>
			</ul>
		</div>
	</aside>
	<main class="flex-grow flex flex-col bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
		<slot><!-- optional fallback --></slot>
	</main>
</div>
