<script lang="ts">
	import { page } from '$app/stores';
	export let to: string;
</script>

<a href={to} class="text-gray-300 hover:text-white" class:active={$page.url.pathname === to}
	><slot /></a
>

<style>
	.active {
		background-color: gray;
		color: black;
	}
</style>
