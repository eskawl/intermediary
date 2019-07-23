import Intermediary from '../lib/intermediary';
import sinon from 'sinon';
import chai from 'chai';

process.env.NODE_ENV = 'test'
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
			secondMiddlewareAction({ ...ctx });
			return args;
		};

		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction({ ...ctx });
			ctx.two = 2;
			await delay();
			return { result, args };
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction({ ...ctx });
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

	it('should ignore when first middleware throws error and throwOnMiddleware error is false', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			throw new Error('Some error occurred')
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction(args);
			return args
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		final.calledAfter(secondMiddlewareAction).should.be.true;
	})

	it('should ignore when second middleware throws error and throwOnMiddleware error is false and context is retained', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			return args
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware, thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(expectedArgs);
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('should ignore when last middleware throws error and throwOnMiddleware error is false and context is retained', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware, thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(expectedArgs);
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('should ignore when all the middleware throws error and throwOnMiddleware error is false', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware, thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = [2, 3, 4]
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		firstMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		final.getCall(0).args.should.deep.equal(args)
	})

	it('should halt when first middleware throws error and throwOnMiddleware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			throw new Error('Some error occurred')
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction(args);
			return args
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: true });
		await involved(...args);

		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledOnce.should.be.false;
		final.calledOnce.should.be.false;
	})

	it('should halt when second middleware throws error and throwOnMiddleware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			return args
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware, thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: true });
		await involved(...args);

		final.calledOnce.should.be.false;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('should halt when last middleware throws error and throwOnMiddleware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary = new Intermediary([firstMiddleware, secondMiddleware, thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 3)
		let involved = intermediary.involve(final, {}, { throwOnMiddleware: true });
		await involved(...args);

		final.calledOnce.should.be.false;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('should ignore when first afterware throws error and throwOnAfterware error is false', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction();
			throw new Error('Some error occurred')
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction(args);
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware, secondAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final, {}, { throwOnAfterware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		final.calledBefore(secondAfterwareAction).should.be.true;
	})

	it('should ignore when second afterware throws error and throwOnAfterware error is false and context is retained', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction();
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			secondAfterwareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware, secondAfterware, thirdAfterware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = intermediary.involve(final, {}, { throwOnAfterware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		thirdAfterwareAction.calledAfter(secondAfterwareAction).should.be.true;
		thirdAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('should halt when first afterware throws error and throwOnAfterware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction();
			throw new Error('Some error occurred')
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction(args);
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware, secondAfterware]);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final, {}, { throwOnAfterware: true });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledOnce.should.be.false;
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('should halt when second afterware throws error and throwOnAfterware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction();
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			secondAfterwareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware, secondAfterware, thirdAfterware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = intermediary.involve(final, {}, { throwOnAfterware: true });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		thirdAfterwareAction.calledOnce.should.be.false;
		secondAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('should ignore when target fn throws error and throwOnTarget error is false and the context is retained', async () => {
		const incrementArgs = (...args) => args.map(x => x + 1)

		const final = sinon.spy((...finalArgs) => {
			finalArgs = incrementArgs(...finalArgs)
			throw new Error('Some error occurred')
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			firstMiddlewareAction(args);
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			thirdMiddlewareAction(args);
			return args
		};

		const firstAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			secondAfterwareAction(args);
			return { result, args }
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary = new Intermediary(
			[firstMiddleware, secondMiddleware, thirdMiddleware], [firstAfterware, secondAfterware, thirdAfterware]
		);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final, {}, { throwOnTarget: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		final.calledAfter(thirdMiddlewareAction).should.be.true;
		firstAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		thirdAfterwareAction.calledAfter(secondAfterwareAction).should.be.true;
		firstMiddlewareAction.getCall(0).args[0].should.deep.equal([2, 3, 4]);
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal([3, 4, 5]);
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal([4, 5, 6]);
		final.getCall(0).args.should.deep.equal([4, 5, 6]);
		firstAfterwareAction.getCall(0).args[0].should.deep.equal([5, 6, 7]);
		secondAfterwareAction.getCall(0).args[0].should.deep.equal([6, 7, 8]);
		thirdAfterwareAction.getCall(0).args[0].should.deep.equal([7, 8, 9]);
	})

	it('should halt when target fn throws error and throwOnTarget error is true', async () => {
		const incrementArgs = (...args) => args.map(x => x + 1)

		const final = sinon.spy((...finalArgs) => {
			finalArgs = incrementArgs(...finalArgs)
			throw new Error('Some error occurred')
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			firstMiddlewareAction(args);
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			thirdMiddlewareAction(args);
			return args
		};

		const firstAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			secondAfterwareAction(args);
			return { result, args }
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary = new Intermediary(
			[firstMiddleware, secondMiddleware, thirdMiddleware], [firstAfterware, secondAfterware, thirdAfterware]
		);

		let args = [1, 2, 3];
		let involved = intermediary.involve(final, {}, { throwOnTarget: true });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		final.calledAfter(thirdMiddlewareAction).should.be.true;
		firstAfterwareAction.calledOnce.should.be.false;
		secondAfterwareAction.calledOnce.should.be.false;
		thirdAfterwareAction.calledOnce.should.be.false;
		firstMiddlewareAction.getCall(0).args[0].should.deep.equal([2, 3, 4]);
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal([3, 4, 5]);
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal([4, 5, 6]);
		final.getCall(0).args.should.deep.equal([4, 5, 6]);
	})


	/* Series */

	it('Series: Should call middleware', async () => {
		const {
			final, firstMiddlewareAction,
			firstMiddleware, intermediary,
		} = setup();
		Intermediary.series([intermediary], final)(1, 2, 3);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
	});


	it('Series: Should call afterware', async () => {
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
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.calledAfter(firstAfterwareAction).should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
	});

	it('Series: should call the final function', async () => {
		const {
			final, firstMiddlewareAction,
			firstMiddleware, intermediary,
		} = setup();
		let args = [1, 2, 3]
		let involved = await Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
	})

	it('Series: should work when no arguments are supplied', async () => {
		const final = sinon.spy();
		const intermediary = new Intermediary();
		let involved = Intermediary.series([intermediary], final);
		await involved();

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal([]);
	})

	it('Series: should work when no afterware is supplied', async () => {
		const {
			final, firstMiddlewareAction,
			firstMiddleware, intermediary,
		} = setup();
		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);

	})

	it('Series: should work when no middleware is supplied', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			firstAfterwareAction();
			return { result, args }
		};
		const intermediary = new Intermediary(null, [firstAfterware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);


		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.true;
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('Series: should work when no middleware and afterware is supplied', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const intermediary = new Intermediary();
		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);


		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
	})

	it('Series: should work when async middleware is supplied', async () => {
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
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		firstMiddlewareAction.calledBefore(final).should.be.true;
	})

	it('Series: should work when async afterware is supplied', async () => {
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
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('Series: should work when async target function is supplied', async () => {
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
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledAfter(final).should.be.true;
	})

	it('Series: should maintain context between middleware', async () => {
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
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);

		let args = [1, 2, 3];
		// TODO: Pass context here
		let involved = Intermediary.series([intermediary1, intermediary2], final);
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

	it('Series: should maintain context between middleware and afterware', async () => {
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
			secondMiddlewareAction({ ...ctx });
			return args;
		};

		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => async (result, ...args) => {
			firstAfterwareAction({ ...ctx });
			ctx.two = 2;
			await delay();
			return { result, args };
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction({ ...ctx });
			return { result, args };
		};
		const intermediary1 = new Intermediary([firstMiddleware], [firstAfterware]);
		const intermediary2 = new Intermediary([secondMiddleware], [secondAfterware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2], final);
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
		secondAfterwareAction.calledBefore(firstAfterwareAction).should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.getCall(0).args[0].should.deep.equal({ one: 1 })
	})

	it('Series: should maintain change in arguments done in the middleware', async () => {
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
		let involved = Intermediary.series([intermediary], final);
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args.map(x => x + 1));
		firstMiddlewareAction.calledBefore(final).should.be.true;
	})

	it('Series: should pass the final arguments to afterware', async () => {
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
		const intermediary1 = new Intermediary([firstMiddleware], [firstAfterware]);
		const intermediary2 = new Intermediary([secondMiddleware], [secondAfterware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2], final);
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
		secondAfterwareAction.calledBefore(firstAfterwareAction).should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.getCall(0).args[0].should.equal("FINAL_RESULT")
		secondAfterwareAction.getCall(0).args[1].should.equal(1)
	})

	it('Series: should ignore when first middleware throws error and throwOnMiddleware error is false', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			throw new Error('Some error occurred')
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction(args);
			return args
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2], final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		final.calledAfter(secondMiddlewareAction).should.be.true;
	})

	it('Series: should ignore when second middleware throws error and throwOnMiddleware error is false and context is retained', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			return args
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);
		const intermediary3 = new Intermediary([thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(expectedArgs);
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('Series: should ignore when last middleware throws error and throwOnMiddleware error is false and context is retained', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);
		const intermediary3 = new Intermediary([thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(expectedArgs);
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('Series: should ignore when all the middleware throws error and throwOnMiddleware error is false', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);
		const intermediary3 = new Intermediary([thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = [2, 3, 4]
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnMiddleware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		firstMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		final.getCall(0).args.should.deep.equal(args)
	})

	it('Series: should halt when first middleware throws error and throwOnMiddleware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			throw new Error('Some error occurred')
		};
		const secondMiddleware = (ctx) => (...args) => {
			secondMiddlewareAction(args);
			return args
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2], final, {}, { throwOnMiddleware: true });
		await involved(...args);

		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledOnce.should.be.false;
		final.calledOnce.should.be.false;
	})

	it('Series: should halt when second middleware throws error and throwOnMiddleware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			return args
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);
		const intermediary3 = new Intermediary([thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnMiddleware: true });
		await involved(...args);

		final.calledOnce.should.be.false;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('Series: should halt when last middleware throws error and throwOnMiddleware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstMiddlewareAction();
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			thirdMiddlewareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary1 = new Intermediary([firstMiddleware]);
		const intermediary2 = new Intermediary([secondMiddleware]);
		const intermediary3 = new Intermediary([thirdMiddleware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 3)
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnMiddleware: true });
		await involved(...args);

		final.calledOnce.should.be.false;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('Series: should ignore when first afterware throws error and throwOnAfterware error is false', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			secondAfterwareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary1 = new Intermediary(null, [firstAfterware]);
		const intermediary2 = new Intermediary(null, [secondAfterware]);

		let args = [1, 2, 3];
		let expectedArgs = [2, 3, 4];
		let involved = Intermediary.series([intermediary1, intermediary2], final, {}, { throwOnAfterware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs);
		secondAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs);
		firstAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledBefore(firstAfterwareAction).should.be.true;
		final.calledBefore(secondAfterwareAction).should.be.true;
	})

	it('Series: should ignore when second afterware throws error and throwOnAfterware error is true and context is retained', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			secondAfterwareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary1 = new Intermediary(null, [firstAfterware]);
		const intermediary2 = new Intermediary(null, [secondAfterware]);
		const intermediary3 = new Intermediary(null, [thirdAfterware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnAfterware: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledBefore(firstAfterwareAction).should.be.true;
		thirdAfterwareAction.calledBefore(secondAfterwareAction).should.be.true;
		thirdAfterwareAction.getCall(0).args[0].should.deep.equal(args.map(x => x + 1))
		secondAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
		firstAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('Series: should halt when first afterware throws error and throwOnAfterware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction();
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			secondAfterwareAction(args);
			throw new Error('Some error occurred')
		};
		const intermediary1 = new Intermediary(null, [firstAfterware]);
		const intermediary2 = new Intermediary(null, [secondAfterware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2], final, {}, { throwOnAfterware: true });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstAfterwareAction.calledOnce.should.be.false;
		secondAfterwareAction.calledOnce.should.be.true;
		secondAfterwareAction.calledAfter(final).should.be.true;
	})

	it('Series: should halt when second afterware throws error and throwOnAfterware error is true', async () => {
		const final = sinon.spy((...finalArgs) => {
		});
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			secondAfterwareAction(args);
			throw new Error('Some error occurred')
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = args.map((x) => x + 1)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary1 = new Intermediary(null, [firstAfterware]);
		const intermediary2 = new Intermediary(null, [secondAfterware]);
		const intermediary3 = new Intermediary(null, [thirdAfterware]);

		let args = [1, 2, 3];
		let expectedArgs = args.map(x => x + 2)
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnAfterware: true });
		await involved(...args);

		final.calledOnce.should.be.true;
		final.getCall(0).args.should.deep.equal(args);
		firstAfterwareAction.calledOnce.should.be.false;
		secondAfterwareAction.calledAfter(thirdAfterwareAction).should.be.true;
		thirdAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.getCall(0).args[0].should.deep.equal(expectedArgs)
	})

	it('Series: should ignore when target fn throws error and throwOnTarget error is false and the context is retained', async () => {
		const incrementArgs = (...args) => args.map(x => x + 1)

		const final = sinon.spy((...finalArgs) => {
			finalArgs = incrementArgs(...finalArgs)
			throw new Error('Some error occurred')
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			firstMiddlewareAction(args);
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			thirdMiddlewareAction(args);
			return args
		};

		const firstAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			secondAfterwareAction(args);
			return { result, args }
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary1 = new Intermediary([firstMiddleware], [firstAfterware]);
		const intermediary2 = new Intermediary([secondMiddleware], [secondAfterware]);
		const intermediary3 = new Intermediary([thirdMiddleware], [thirdAfterware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnTarget: false });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		final.calledAfter(thirdMiddlewareAction).should.be.true;
		thirdAfterwareAction.calledAfter(final).should.be.true;
		secondAfterwareAction.calledAfter(thirdAfterwareAction).should.be.true;
		firstAfterwareAction.calledAfter(secondAfterwareAction).should.be.true;
		firstMiddlewareAction.getCall(0).args[0].should.deep.equal([2, 3, 4]);
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal([3, 4, 5]);
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal([4, 5, 6]);
		final.getCall(0).args.should.deep.equal([4, 5, 6]);
		thirdAfterwareAction.getCall(0).args[0].should.deep.equal([5, 6, 7]);
		secondAfterwareAction.getCall(0).args[0].should.deep.equal([6, 7, 8]);
		firstAfterwareAction.getCall(0).args[0].should.deep.equal([7, 8, 9]);
	})

	it('Series: should halt when target fn throws error and throwOnTarget error is true', async () => {
		const incrementArgs = (...args) => args.map(x => x + 1)

		const final = sinon.spy((...finalArgs) => {
			finalArgs = incrementArgs(...finalArgs)
			throw new Error('Some error occurred')
		});
		const firstMiddlewareAction = sinon.spy();
		const secondMiddlewareAction = sinon.spy();
		const thirdMiddlewareAction = sinon.spy();
		const firstAfterwareAction = sinon.spy();
		const secondAfterwareAction = sinon.spy();
		const thirdAfterwareAction = sinon.spy();
		const firstMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			firstMiddlewareAction(args);
			return args
		};
		const secondMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			secondMiddlewareAction(args);
			return args
		};
		const thirdMiddleware = (ctx) => (...args) => {
			args = incrementArgs(...args)
			thirdMiddlewareAction(args);
			return args
		};

		const firstAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			firstAfterwareAction(args);
			return { result, args }
		};
		const secondAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			secondAfterwareAction(args);
			return { result, args }
		};
		const thirdAfterware = (ctx) => (result, ...args) => {
			args = incrementArgs(...args)
			thirdAfterwareAction(args);
			return { result, args }
		};
		const intermediary1 = new Intermediary([firstMiddleware], [firstAfterware]);
		const intermediary2 = new Intermediary([secondMiddleware], [secondAfterware]);
		const intermediary3 = new Intermediary([thirdMiddleware], [thirdAfterware]);

		let args = [1, 2, 3];
		let involved = Intermediary.series([intermediary1, intermediary2, intermediary3], final, {}, { throwOnTarget: true });
		await involved(...args);

		final.calledOnce.should.be.true;
		firstMiddlewareAction.calledOnce.should.be.true;
		secondMiddlewareAction.calledAfter(firstMiddlewareAction).should.be.true;
		thirdMiddlewareAction.calledAfter(secondMiddlewareAction).should.be.true;
		final.calledAfter(thirdMiddlewareAction).should.be.true;
		firstAfterwareAction.calledOnce.should.be.false;
		secondAfterwareAction.calledOnce.should.be.false;
		thirdAfterwareAction.calledOnce.should.be.false;
		firstMiddlewareAction.getCall(0).args[0].should.deep.equal([2, 3, 4]);
		secondMiddlewareAction.getCall(0).args[0].should.deep.equal([3, 4, 5]);
		thirdMiddlewareAction.getCall(0).args[0].should.deep.equal([4, 5, 6]);
		final.getCall(0).args.should.deep.equal([4, 5, 6]);
	})
})


