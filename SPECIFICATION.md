# Endoweth contract specification

The endoweth contract functions as an endowment. It holds tokens, and makes them available to the endowee with the intent to keep the value of the principal intact. In other words: it distributes only the returns of the portfolio. It does to based on the expected return that the user sets for each token in the portfolio.

The workflow of an Endoweth contract user is as follows:

1. user deploys an instance of the Endoweth contract
2. user specifies which erc-20 tokens are managed by the endowment contract
3. user specifies the expected return of each erc-20 token
4. user specifies at which interval the distribution should take place
5. anyone can trigger the distribution event (this function is permissionless), and when this event is triggered, the erc-20 token amounts that have been made available are transferred to the endowee

The contract does the following:

- keeps a list of tokens that are under the contract's management
- it tracks the distribution statistics needed to calclate the correct distributions at the distribution intervals
- it calculates the erc-20 amount that may be distributed per distribution interval, based on the logic that the yearly returns may be distributed but only after they were realised. It thus calculates the amount to be distributed based on the expected return and the time that has passed.
- it emits detailed events of all actions taken on the contract

## Permissions

These are the permission groups of the Endoweth contract:

- the owner
- the accountants
- the public

The owner may assign and dismiss accountants. It is implemented through the OpenZeppeling `Ownable` contract.

The accountants may update the expected return of erc-20 tokens, add and remove erc-20 tokens from the endowment logic, and update the distribution interval.

The public may call permissionless functions. This includes triggering distributions, viewing the distributable amounts that have not yet been distributed.
