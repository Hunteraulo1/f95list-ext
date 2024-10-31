<script>
import { Button } from '$ui/button';
import { Reload } from 'svelte-radix';
</script>

<div class="flex justify-center items-center h-full">
  <Button>
    <Reload class="h-4 w-full animate-spin" />
    <span>Aucun jeu ne correspond à vos critères</span>
  </Button>
</div> 
