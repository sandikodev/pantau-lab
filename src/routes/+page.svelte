<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let error: unknown;

	let { response } = data;
</script>

{#if error}
	<p>Error: {error}</p>
{:else if data}
	<h1>Data loaded successfully!</h1>
	<!-- Use 'data' here as needed -->
	{#each response as item}
		<fieldset>
			<legend>
				{#if item['status'] == 'wait'}
					<p style="color:red">komputer tidak terhubung</p>
				{:else}
					<p style="color:green">komputer terhubung</p>
				{/if}
			</legend>
			<ul>
				<li>host: {item['host-name']}</li>
				<li>mac: {item['active-mac-address']}</li>
				<li>
					address: <input
						type="text"
						value={item['active-address']}
						disabled={item['dynamic'] == 'true'}
					/>
				</li>
				<li>
					status:
					{#if item['dynamic'] == 'true'}
						belum seting<br />
						<button>klik untuk seting!</button>
					{:else}
						sesuai
					{/if}
				</li>
			</ul>
		</fieldset>
	{/each}
{:else}
	<p>Loading...</p>
{/if}
