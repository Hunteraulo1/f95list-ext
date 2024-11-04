<script lang="ts">
import { goto } from '$app/navigation';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

let { data }: Props = $props();

data.searchParams.webapp === '' ? goto('/webapp') : goto('/');
</script>
