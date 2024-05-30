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

To do a test deploy on a local network:

1. Populate `.env.development` with the variables detailed in `.env.example`
1. `npx hardhat node # start a local testnet node`
1. `npx hardhat ignition deploy ignition/modules/Endoweth.js --network localhost`

To deploy on a live chain:

1. Populate `.env.production`, this may in theory be the same as your `.env.development`
1. `NODE_ENV=production npx hardhat ignition deploy ignition/modules/Endoweth.js --network 42161`<sup><-- change the network as needed</sup>

If you are making inreconcilable changes (like changing constructor parameters) to your ignition module, you can add `--reset` to your ignition command. This is not recommended, read about it [here](https://hardhat.org/ignition/docs/advanced/reconciliation).

## Verification

For complex or undocumented usecases, refer to the [hardhat verify plugin docs](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify).

1. Populate the relevant `.env.{development,production}` entries
1. `source .env.{development,production}`
1. `NODE_ENV={development,production} npx hardhat verify --network NETWORK DEPLOYED_CONTRACT_ADDRESS "INITIAL_OWNER" "INITIAL_ENDOWEE" "INITIAL_DISTRIBUTION_INTERVAL"`

Note that `NETWORK` is the key as defined in `hardhat.config.js`, for example `42161`. The `DEPLOYED_CONTRACT_ADDRESS` address is the address you deployed to.
