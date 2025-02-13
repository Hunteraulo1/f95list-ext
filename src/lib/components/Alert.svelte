<script lang="ts">
import * as Alert from '@/lib/components/ui/alert/index';
import { BadgeAlert } from '../assets/icon';

interface Props {
  title?: string;
  description: string;
}

const { title = 'Attention !', description }: Props = $props();
</script>

<Alert.Root class="text-red-600">
  
  <Alert.Title class="flex gap-1 font-bold items-center">
    <BadgeAlert size={16} strokeWidth={3} />
    {title}
  </Alert.Title>
  <Alert.Description>{description}</Alert.Description>
</Alert.Root>
