require( "@nomicfoundation/hardhat-toolbox" )

// Environment variables
const { NODE_ENV='development' } = process.env
const env_file = `.env.${ NODE_ENV }`
require( 'dotenv' ).config( {
    path: env_file
} )
console.log( `Using ${ env_file } for hardhat config environment` )


// Load wallet authentication
const { MNEMONIC, PRIVATE_KEY } = process.env
const accounts = MNEMONIC ? { mnemonic: MNEMONIC } : PRIVATE_KEY ? [ { privateKey: PRIVATE_KEY, balance: 10_000_000_000_000_000_000_000 } ] : undefined
if( accounts == null && NODE_ENV == 'production' ) throw new Error( `⚠️  Missing wallet details, add MNEMONIC or PRIVATE_KEY to ${ env_file }` )
if( accounts ) console.log( `🔑 Using wallet based on ${ MNEMONIC ? 'mnemonic' : 'private key' } from ${ env_file }` )

// Load RPC endpoints
const { RPC_42161='https://arb1.arbitrum.io/rpc' } = process.env

// Load Etherscan API key
const { ETHERSCAN_API_KEY } = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    networks: {

        // Hardhat
        hardhat: {
            accounts
        },

        // Arbitrum One
        42161: {
            url: RPC_42161,
            accounts
        }
    },

    // Verification on explorers, https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify
    // list supported: npx hardhat verify --list-networks
    etherscan: {
        apiKey: {
            arbitrumOne: ETHERSCAN_API_KEY
        }
    },
    sourcify: { enabled: true }

}
