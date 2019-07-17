import Intermediary from '../lib/intermediary';
import sinon from 'sinon';
import chai from 'chai';

var should = chai.should();

function setup() {
	const final = sinon.spy((...finalArgs) => {
	});
	const firstMiddlewareAction = sinon.spy();
	const firstMiddleware = (ctx) => (...args) => {
		firstMiddlewareAction();
		return args;
	};
	const intermediary = new Intermediary([firstMiddleware]);

	return {
		final, firstMiddlewareAction,
		firstMiddleware, intermediary,
	}
}

function delay(duration = 200) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, duration);
	})
}

describe('Test Suite', () => {
	afterEach(() => {
		// Restore the default sandbox here
		sinon.restore();
	});

	it('Should export properly', () => {
		Intermediary.should.not.be.undefined;
	});

	it('Should call middleware', async () => {
		const {
			final, firstMiddlewareAction,
			firstMiddleware, intermediary,
		} = setup();
		await intermediary.involve(final)(1, 2, 3);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
	});

	it('Should call afterware', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction();
			await delay();
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction();
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware, secondAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
	});

	it('should call the final function', async () => {
		const {
			final, firstMiddlewareAction,
			firstMiddleware, intermediary,
		} = setup();
		let args = [1, 2, 3]
		let involved = await intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
	})

	it('should work when no arguments are supplied', async () => {
		const final = sinon.spy();
		const intermediary = new Intermediary();
		let involved = intermediary.involve(final);
		await involved();

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal([]);
	})

	it('should work when no afterware is supplied', async () => {
		const {
			final, firstMiddlewareAction,
			firstMiddleware, intermediary,
		} = setup();
		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);

	})

	it('should work when no middleware is supplied', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			firstAfterwareAction();
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);


		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.true;
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('should work when no middleware and afterware is supplied', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const intermediary = new Intermediary();
		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);


		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
	})

	it('should work when async middleware is supplied', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => async (...args) => {
			firstMiddlewareAction();
			await delay();
			return args
		};
		const intermediary = new Intermediary([firstMiddleware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
	})

	it('should work when async afterware is supplied', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction();
			await delay();
			return { result, args };
		};
		const intermediary = new Intermediary(null, [firstAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('should work when async target function is supplied', async () => {
		const final = sinon.spy(async (...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction();
			await delay();
			return { result, args };
		};
		const intermediary = new Intermediary(null, [firstAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('should maintain context between middleware', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => async (...args) => {
			firstMiddlewareAction();
			ctx.one = 1;
			await delay();
			return args;
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction(ctx);
			return args;
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware]);

		let args = [1, 2, 3];
		// TODO: Pass context here
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
		secondMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledBefore(final).should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal({ one: 1 })
	})

	it('should maintain context between middleware and afterware', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => async (...args) => {
			firstMiddlewareAction();
			ctx.one = 1;
			await delay();
			return args;
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction({...ctx});
			return args;
		};

		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction({...ctx});
			ctx.two = 2;
			await delay();
			return { result, args };
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction({...ctx});
			return { result, args };
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware], [firstAfterware, secondAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
		secondMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledBefore(final).should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal({ one: 1 });
		firstAfterwareAction.calledAfter(secondMiddlewareAction).should.be.true;
		firstAfterwareAction.calledAfter(final).should.be.true;
		firstAfterwareAction.getCall(0).args[0].should.deep.equal({ one: 1 })
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.getCall(0).args[0].should.deep.equal({ one: 1, two: 2 })
	})

	it('should maintain change in arguments done in the middleware', async () => {
		const final = sinon.spy(async (...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const firstMiddleware = Intermediary.createMiddleware(async (ctx, ...args) => {
			firstMiddlewareAction();
			await delay();
			return [...args.map(x => x + 1)];
		});
		const intermediary = new Intermediary([firstMiddleware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args.map(x => x + 1));
		firstMiddlewareAction.calledBefore(final).should.be.true;
	})

	it('should pass the final arguments to afterware', async () => {
		const final = sinon.spy((...finalArgs) => {
			return "FINAL_RESULT"
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => async (...args) => {
			firstMiddlewareAction();
			await delay();
			return args;
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction();
			return args;
		};

		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction(result, ...args);
			await delay();
			return { result, args };
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction(result, ...args);
			return { result, args };
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware], [firstAfterware, secondAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
		secondMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledBefore(final).should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		firstAfterwareAction.calledAfter(secondMiddlewareAction).should.be.true;
		firstAfterwareAction.calledAfter(final).should.be.true;
		firstAfterwareAction.getCall(0).args[0].should.equal("FINAL_RESULT")
		firstAfterwareAction.getCall(0).args[1].should.equal(1)
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.getCall(0).args[0].should.equal("FINAL_RESULT")
		secondAfterwareAction.getCall(0).args[1].should.equal(1)
	})

	// it('should throw when middleware throws and throwOnMiddleware error is true')
	// it('should not throw when any middleware except first and last throws and throwOnMiddleware error is false')
	// it('should not throw when first middleware throws and throwOnMiddleware error is false')
	// it('should not throw when last middleware throws and throwOnMiddleware error is false')

	// it('should throw when afterware throws and throwOnMiddleware error is true')
	// it('should not throw when any middleware except first and last throws and throwOnMiddleware error is false')
	// it('should not throw when first middleware throws and throwOnMiddleware error is false')
	// it('should not throw when last middleware throws and throwOnMiddleware error is false')
	

	// it('Should call afterware', async t => {
	// 	const final = sinon.spy();
	// 	const firstAfterwareAction = sinon.spy();
	// 	const firstAfterware = (ctx) => (next) => firstAfterwareAction;
	// 	const stack = new MiddleStack([], [firstAfterware]);
	// 	stack.applyMiddleware(final);

	// 	chai.assert(final.calledOnce);
	// 	chai.assert(firstAfterwareAction.calledOnce);
	// 	chai.assert(final.calledBefore(firstAfterwareAction));
	// });
})


