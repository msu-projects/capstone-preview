<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'value' | 'files'> {
		value?: number;
		clearZeroOnFocus?: boolean;
	}

	let {
		value = $bindable(0),
		clearZeroOnFocus = true,
		class: className,
		onfocus,
		onblur,
		oninput,
		...restProps
	}: Props = $props();

	function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget;
		if (clearZeroOnFocus && input.value === '0') {
			input.value = '';
		}
		onfocus?.(e);
	}

	function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget;
		if (input.value === '' || input.value === '-') {
			value = 0;
			input.value = '0';
		}
		onblur?.(e);
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget;
		const numValue = parseFloat(input.value);
		if (!isNaN(numValue)) {
			value = numValue;
		} else if (input.value === '' || input.value === '-') {
			// Allow empty or just minus sign during typing
			value = 0;
		}
		oninput?.(e);
	}
</script>

<Input
	type="number"
	{value}
	onfocus={handleFocus}
	onblur={handleBlur}
	oninput={handleInput}
	class={className}
	{...restProps}
/>
