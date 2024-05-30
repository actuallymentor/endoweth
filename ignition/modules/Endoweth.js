const { buildModule, getDeployer } = require( "@nomicfoundation/hardhat-ignition/modules" )


module.exports = buildModule( "EndowethModule", hardhat_module => {

    // Deploy the contract with arguments (address _owner, address _endowee, uint256 _distributionInterval)
    const { ENDOWETH_OWNER, ENDOWETH_ENDOWEE, ENDOWETH_DISTRIBUTION_INTERVAL_IN_S, NODE_ENV='development' } = process.env
    const deployer = hardhat_module.getAccount( 0 )
    console.log( `Deploying Endoweth with owner ${ ENDOWETH_OWNER }, endowee ${ ENDOWETH_ENDOWEE }, and distribution interval ${ ENDOWETH_DISTRIBUTION_INTERVAL_IN_S }` )
    const deployed_endoweth = hardhat_module.contract( "Endoweth", [ deployer, ENDOWETH_ENDOWEE, ENDOWETH_DISTRIBUTION_INTERVAL_IN_S ] )

    // ////////////////////////
    // Do post-deployment tasks
    // ////////////////////////

    // Add the endowment tokens that were specified in the .env (which was loaded in hardhar.config.js)
    let count = 0
    while( process.env[`ENDOWETH_TOKEN_${ count }_ADDRESS`] ) {
        const address = process.env[`ENDOWETH_TOKEN_${ count }_ADDRESS`]
        const expected_return = process.env[`ENDOWETH_TOKEN_${ count }_EXPECTED_RETURN`]
        console.log( `Adding token ${ address } with expected return ${ expected_return/100 }%` )
        if( address && expected_return ) hardhat_module.call( deployed_endoweth, 'addToken', [ ethers.getAddress( address ), expected_return ] )
        count++
    }

    // Add endowment accountants
    count = 0
    while( process.env[`ENDOWETH_ACCOUNTANT_${ count }`] ) {
        const address = process.env[`ENDOWETH_ACCOUNTANT_${ count }`]
        console.log( `Adding accountant ${ address }` )
        if( address ) hardhat_module.call( deployed_endoweth, 'addAccountant', [ ethers.getAddress( address ) ] )
        count++
    }

    // Set the owner to the intended owner after deployment
    console.log( `Setting owner to ${ ENDOWETH_OWNER }` )
    hardhat_module.call( deployed_endoweth, 'transferOwnership', [ ethers.getAddress( ENDOWETH_OWNER ) ] )

    // Get network from command line flags because hardhat docs don't explain how to get it from the module
    const args = process.argv.slice( 2 )
    const network = args.reduce( ( acc, arg, i ) => arg === '--network' ? args[i + 1] : acc, null )

    // Verification prompt
    console.log( `\n\nConsider verifying this contract by running:` )
    console.log( `NODE_ENV=${ NODE_ENV } npx hardhat verify --network ${ network } DEPLOYED_ADDRESS_HERE ${ ENDOWETH_OWNER } ${ ENDOWETH_ENDOWEE } ${ ENDOWETH_DISTRIBUTION_INTERVAL_IN_S }\n\n` )

    // Return contract
    return { deployed_endoweth }

} )
