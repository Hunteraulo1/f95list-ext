<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js'
  import * as Dialog from '$lib/components/ui/dialog/index.js'
  import type { GameType } from '$lib/schemas'
  import { tick } from 'svelte'
  import Input from './ui/input/input.svelte'
  import Label from './ui/label/label.svelte'

  const types: GameType['type'][] = [
    'RenPy',
    'RPGM',
    'Unreal',
    'HTLM',
    'Flash',
    'QSP',
    'RenPy/RPGM',
    'RenPy/Unity',
    'Autre',
  ]
  const status: GameType['status'][] = ['ABANDONNÉ', 'EN COURS', 'TERMINÉ']

  let open = false
  let value = ''

  $: selectedValue = types.find(f => f === value) ?? 'Types...'

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false
    tick().then(() => {
      document.getElementById(triggerId)?.focus()
    })
  }
</script>

<div class="sticky bottom-0 flex justify-center max-w-[300px]">
  <Dialog.Root>
    <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Edit Profile</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Make changes to your profile here. Click save when you're done.</Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Name</Label>
          <Input id="name" value="Pedro Duarte" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="username" class="text-right">Username</Label>
          <Input id="username" value="@peduarte" class="col-span-3" />
        </div>
      </div>
      <Dialog.Footer>
        <Button type="submit">Save changes</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
