<script lang="ts">
import { goto } from '$app/navigation'

export let data;

console.log(data.searchParams);

data.searchParams.webapp === '' ? goto('/webapp') : goto('/')
</script>
