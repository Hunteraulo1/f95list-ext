<script lang="ts">
import List from '$components/List.svelte';
import Nav, { type Page } from '$components/Nav.svelte';
import Router from '$components/Router.svelte';

const pages: Page[] = [
  {
    link: 'list',
    target: List,
    icon: null,
  },
];
</script>

<Router {pages} />

<Nav {pages} />
