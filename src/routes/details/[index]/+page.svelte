<script lang="ts">
  import gamesJson from '$lib/assets/games.json'
  import noImage from '$lib/assets/no-image.png'
  import { Game, type GameType } from '$lib/schemas'
  import { parse } from 'valibot'
  import type { PageData } from './$types'

  export let data: PageData

  let game: GameType | null = null

  const index = parseInt(data.props.index)
  const gameData = gamesJson.data[index]

  if (gameData) {
    const validGames = parse(Game, gameData)
    game = validGames ?? null
  }
</script>

{#if game}
  <img src={game.image ?? noImage} alt={game.name} />
  <h1>{game.name}</h1>
{:else}
  <h1>Game not found</h1>
{/if}
