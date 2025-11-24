<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	interface Props {
		open: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { open = $bindable(), onConfirm, onCancel }: Props = $props();
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Project</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete this project? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={onCancel}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={onConfirm}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
