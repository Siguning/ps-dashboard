<script>
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { ArrowRight } from '@lucide/svelte';

    let problemsets = $state([]);

    onMount(async () => {
        const response = await fetch('/problemsets.json');
        const data = await response.json();
        problemsets = data.problemsets;
    });
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">Problemsets</h1>
    <p class="text-muted-foreground mb-8">
        Browse through the collections of programming problems.
    </p>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each problemsets as problemset (problemset.id)}
            <a href={`/problemset/${problemset.id}`} class="group">
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="text-2xl font-semibold">{problemset.title}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <p class="text-muted-foreground">{problemset.description}</p>
                    </Card.Content>
                    <Card.Footer class="flex justify-end">
                        <Button variant="ghost" class="group-hover:bg-accent">
                            View Problems
                            <ArrowRight class="ml-2 h-4 w-4" />
                        </Button>
                    </Card.Footer>
                </Card.Root>
            </a>
        {/each}
    </div>
</div>
