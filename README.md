# Endoweth - an ERC-20 endowment fund contract

Automatically distribute<sup>1</sup> ERC-20 tokens based on their expected returns. The workflow of this contract:

1. Deploy the contract with an `_owner` that can do admin tasks, an `_endowee` that is an address that receives the funds, and a `_distributionInterval` that specifies at which interval in seconds funds are unlocked.
2. Optionally add accountant addresses, these are addresses that can add/remove/update ERC-20 tokens to be distributed. This is optional since the contract owner can also do these things.
3. Add ERC-20 tokens by calling `addToken`, this adds an address and expected return. For example, adding staked ETH in the form of `rETH` with an projected yearly return of `3%` would require calling `addToken( '0xae78736cd615f374d3085123a210448e74fc6393', 300 )`
4. Periodically call `triggerDistribution` to distributed the tokens that the endowment released. Note that if you do not call this regularly, the tokens simply stack up. Missing a claim window has no negative consequences.

---

*<sup>1</sup> tokens are marked for distribution, but since contracts cannot call themselves the distribution event must be triggered. The `triggerDistribution` function can be called by anyone.*

## Deployment

This project uses Hardhat and deploys using [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview).

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
