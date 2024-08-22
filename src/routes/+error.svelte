<script lang="ts">
import { goto } from '$app/navigation'

export let data

data.searchParams.webapp === '' ? goto('/webapp') : goto('/')
</script>
