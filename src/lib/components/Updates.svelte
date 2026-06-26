<script lang="ts">
  import GameBox from "@/lib/components/GameBox.svelte";
  import { Button } from "@/lib/components/ui/button";
  import type { GameType, UpdateType } from "@/lib/schemas";
  import {
    filteredUpdates,
    games,
    updates,
    updatesContext,
  } from "@/lib/stores";
  import { RefreshCcw } from "../assets/icon";
  import Filter from "./Filter.svelte";

  browser.runtime.sendMessage("f95list-badge");

  interface Props {
    webapp?: boolean;
  }

  const { webapp = false }: Props = $props();

  const parisDayFormatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  let groupedUpdates = $derived.by(() => {
    const grouped = new Map<
      string,
      {
        dayKey: string;
        date: UpdateType["date"];
        type: UpdateType["type"];
        games: GameType[];
      }
    >();

    for (const update of $filteredUpdates) {
      const game =
        $games.find((entry) => entry.gameId === update.gameId) ??
        $games.find((entry) => entry.id === update.gameId);
      if (!game) continue;

      const dayKey = parisDayFormatter.format(update.date);
      const key = `${dayKey}-${update.type}`;
      const current = grouped.get(key);

      if (current) {
        current.games.push(game);
      } else {
        grouped.set(key, {
          dayKey,
          date: update.date,
          type: update.type,
          games: [game],
        });
      }
    }

    return [...grouped.values()].sort((a, b) => {
      if (a.dayKey !== b.dayKey) return b.dayKey.localeCompare(a.dayKey);
      if (a.type === b.type) return 0;
      return a.type === "AJOUT DE JEU" ? -1 : 1;
    });
  });
</script>

{#if $updates}
  <div class="relative flex flex-col h-full gap-2 p-2">
    <div class="flex flex-col h-full gap-4 p-2">
      {#each groupedUpdates as update}
        <div class="flex flex-col gap-2">
          <h2 class="mt-2 text-base font-bold leading-none text-center">
            {new Date(update.date).toLocaleDateString("fr-FR", {
              timeZone: "Europe/Paris",
            })}
          </h2>
          <h3
            class="text-[.7rem] text-center text-secondary-foreground/75 leading-none"
          >
            {update.type}
          </h3>
          {#each update.games as game}
            <GameBox {game} {webapp} />
          {/each}
        </div>
      {:else}
        <div
          class="flex items-center justify-center h-40 text-center text-secondary-foreground/75"
        >
          <span>Aucune mise à jour ne correspond à vos critères</span>
        </div>
      {/each}
    </div>

    <Filter variant="popup" ctx={updatesContext} label="Filtrer les MàJ" />
  </div>
{:else}
  <div class="flex items-center justify-center h-full">
    <Button>
      <RefreshCcw classes="mr-2 h-4 w-4" />
      Veuillez patienter
    </Button>
  </div>
{/if}
