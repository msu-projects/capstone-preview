<script lang="ts">
	import { MapPin } from '@lucide/svelte';
</script>

<footer class="border-t bg-muted/50">
	<div class="container mx-auto px-4 py-8">
		<div class="grid gap-8 md:grid-cols-3">
			<!-- Branding -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<div class="flex size-9 items-center justify-center rounded-lg bg-primary">
						<MapPin class="size-5 text-primary-foreground" />
					</div>
					<div class="flex flex-col">
						<span class="text-sm leading-tight font-bold">South Cotabato</span>
						<span class="text-xs leading-tight text-muted-foreground">Convergence Data Bank</span>
					</div>
				</div>
				<p class="text-sm text-muted-foreground">
					A government transparency portal for tracking development projects in vulnerable
					communities within South Cotabato Province.
				</p>
			</div>

			<!-- Quick Links -->
			<div class="space-y-3">
				<h4 class="font-semibold">Quick Links</h4>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li>
						<a href="/projects" class="transition-colors hover:text-foreground">View Projects</a>
					</li>
					<li>
						<a href="/sitios" class="transition-colors hover:text-foreground">Explore Sitios</a>
					</li>
					<li>
						<a href="/login" class="transition-colors hover:text-foreground">Admin Portal</a>
					</li>
				</ul>
			</div>

			<!-- Contact -->
			<div class="space-y-3">
				<h4 class="font-semibold">Contact</h4>
				<address class="space-y-1 text-sm text-muted-foreground not-italic">
					<p>Provincial Government of South Cotabato</p>
					<p>Provincial Capitol, Alunan Avenue</p>
					<p>Koronadal City, South Cotabato</p>
				</address>
			</div>
		</div>

		<!-- Copyright -->
		<div class="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
			<p>
				&copy; {new Date().getFullYear()} Provincial Government of South Cotabato. All rights reserved.
			</p>
		</div>
	</div>
</footer>
