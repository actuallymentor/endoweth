// const { eslint_config } = require( './index.cjs' )
const { eslint_config } = require( 'airier' )

// Export the default eslint config
module.exports = {
    ...eslint_config,
    globals: {
        ...eslint_config.globals,
        ethers: true,
        hardhat: true
    },
    settings: {}
}
