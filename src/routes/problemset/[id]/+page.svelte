<script>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { ArrowLeft, ExternalLink } from '@lucide/svelte';
    import * as Table from '$lib/components/ui/table/index.js';

    let problemset = $state(null);
    let isLoading = $state(true);
    let error = $state(null);

    // Use a reactive statement to get the id from the page store
    const id = $derived(page.params.id);

    onMount(async () => {
        try {
            const response = await fetch('/problemsets.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            problemset = data.problemsets.find(p => p.id === id);
            if (!problemset) {
                throw new Error('Problemset not found.');
            }
        } catch (e) {
            error = e.message;
        } finally {
            isLoading = false;
        }
    });

    function goToProblem(url) {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8">
        <a href="/" class="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to Problemsets
        </a>
    </div>

    {#if isLoading}
        <p class="text-center text-muted-foreground">Loading problemset...</p>
    {:else if error}
        <div class="text-center text-destructive">
            <h2 class="text-2xl font-semibold">Error</h2>
            <p>{error}</p>
            <p class="mt-2 text-sm">Please make sure `static/problemsets.json` exists and is valid.</p>
        </div>
    {:else if problemset}
        <div class="mb-8">
            <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">{problemset.title}</h1>
            <p class="text-lg text-muted-foreground mt-2">{problemset.description}</p>
        </div>

        <Card.Root>
            <Card.Header>
                <Card.Title>Problems</Card.Title>
            </Card.Header>
            <Card.Content>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-[100px]">#</Table.Head>
                            <Table.Head>Title</Table.Head>
                            <Table.Head class="hidden md:table-cell">Description</Table.Head>
                            <Table.Head class="text-right">Link</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each problemset.problems as problem}
                            <Table.Row
                                    class="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onclick={() => goToProblem(problem.url)}
                                    onkeypress={(e) => { if (e.key === 'Enter') goToProblem(problem.url) }}
                                    role="link"
                                    tabindex={0}
                                    aria-label={`View problem ${problem.number}: ${problem.title}`}>
                                <Table.Cell class="font-medium">{problem.number}</Table.Cell>
                                <Table.Cell>{problem.title}</Table.Cell>
                                <Table.Cell class="text-muted-foreground hidden md:table-cell">{problem.description || '—'}</Table.Cell>
                                <Table.Cell class="text-right">
                                    <a href={problem.url} target="_blank" rel="noopener noreferrer" onclick={(e) => e.stopPropagation() } title="View on Baekjoon">
                                        <Button variant="outline" size="icon">
                                            <ExternalLink class="h-4 w-4" />
                                        </Button>
                                    </a>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </Card.Content>
        </Card.Root>
    {/if}
</div>
