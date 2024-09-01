<script lang="ts">
import { goto } from '$app/navigation';
import type { PageData } from './$types';

export let data: PageData;

data.searchParams.webapp === '' ? goto('/webapp') : goto('/');
</script>
