An intermediary which uses both middleware and afterware

```js
(async () => {
		function final(a, b, c) {
			console.log(`Executing target function with ${a}, ${b}, ${c}`);
			return ':D';
		}
	
		function delay(delay = 2000) {
			return new Promise((resolve) => {
				setTimeout(resolve, delay);
			})
		}
		
		
		let middleware = [
			(ctx) => async (a, b, c) => {
				ctx.first = 1;
				console.log("Waiting for async task")
				await delay();
				console.log(`Executing first middleware`);
				console.log(ctx);
				return [a, b, c + 1]
			},
			(ctx) => (a, b, c) => {
				ctx.second = 2;
				console.log(`Executing second middleware`);
				console.log(ctx);
				return [a, b, c]
			}
		]
		
		let afterware = [
			(ctx) => (result, ...targetArgs) => {
				console.log(`Executing first afterware`);
				console.log(`Context was `);
				console.log(ctx);
				console.log(`Result was ${result}`);
				console.log(`Target arguments were ${targetArgs}`);
				return { result, args: [...targetArgs] };
			},
			(ctx) => async (result, ...targetArgs) => {
				console.log(`Awaiting async task in afterware`);
				await delay();
				console.log(`Executing second afterware`);
				return { result, args: [...targetArgs] };
			},
		]
	
		const stack = new Intermediary(middleware, afterware);
		await stack.involve(final)(1, 2, 3);
		console.log('Done');
	})()
```