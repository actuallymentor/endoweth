const {
    loadFixture,
    time,
} = require( "@nomicfoundation/hardhat-toolbox/network-helpers" )
const { expect } = require( "chai" )
const { deployEndowethFixture, deployERC20Mock, tokens } = require( "./fixtures/Endoweth" )

describe( "Distribution logic", () => {

    it( "Should have 0 distributable tokens before any time passed", async () => {

        // Load the fixtures
        const { endoweth, owner, endowee } = await loadFixture( deployEndowethFixture )
        const { erc20 } = await loadFixture( deployERC20Mock )

        // Add deployed mock token
        await endoweth.addToken( erc20.target, tokens[0].expectedReturn )

        // Check distributable token count
        expect( await endoweth.getDistributableTokenCount() )
            .to.be.equal( 0 )
    } )

    it( "Should have 1 distributable token after distro interval passed", async () => {

        // Load the fixtures
        const { endoweth, owner, distributionInterval } = await loadFixture( deployEndowethFixture )
        const { erc20, initialSupply  } = await loadFixture( deployERC20Mock )

        // Send tokens to contract
        expect( await erc20.balanceOf( owner.address ) ).to.equal( initialSupply )
        await erc20.transfer( endoweth.target, initialSupply )
        expect( await erc20.balanceOf( endoweth.target ) ).to.equal( initialSupply )

        // Add deployed mock token
        await endoweth.addToken( erc20.target, tokens[0].expectedReturn )

        // Double check tokenlist is correct
        expect( await endoweth.tokenList( 0 ) ).to.be.equal( erc20.target )

        // Fast forward time to exceed the distribution interval
        await time.increase( distributionInterval )

        // // Trigger distribution
        expect( await endoweth.getDistributableTokenCount() )
            .to.be.equal( 1 )

    } )

    it( "Should distribute the right amount of tokens (macro times)", async () => {

        // Load the fixtures
        const { endoweth, owner, endowee } = await loadFixture( deployEndowethFixture )
        const { erc20, initialSupply  } = await loadFixture( deployERC20Mock )
        const expectedReturn = 500
        const expectedReturnPercentage = expectedReturn / 100
        const acceptibleRoundingError = 1e-5

        /* ///////////////////////////////
            // One year
            // /////////////////////////////*/
        const one_year = 3600 * 24 * 365
        let time_to_pass = one_year

        // Send tokens to contract
        expect( await erc20.balanceOf( owner.address ) ).to.equal( initialSupply )
        await erc20.transfer( endoweth.target, initialSupply )
        expect( await erc20.balanceOf( endoweth.target ) ).to.equal( initialSupply )

        // Add deployed mock token
        await endoweth.addToken( erc20.target, expectedReturn )

        // Double check tokenlist is correct
        expect( await endoweth.tokenList( 0 ) ).to.be.equal( erc20.target )

        // Fast forward by one year
        await time.increase( time_to_pass )

        // Trigger distribution
        await endoweth.triggerDistribution()

        // Check the balance of the endowee
        const endoweeBalance = await erc20.balanceOf( endowee )
        const distributedPercentage = endoweeBalance.toString() / initialSupply.toString() * 100
        const distributionRoundingError = distributedPercentage - expectedReturnPercentage / one_year * time_to_pass 

        // Expect the distribution rounding error to be fractional
        expect( distributionRoundingError ).to.be.lessThan( acceptibleRoundingError )

        /* ///////////////////////////////
            // One month
            // /////////////////////////////*/
        const one_month = 3600 * 24 * 30
        time_to_pass = one_month

        // Forward the time by one month
        await time.increase( time_to_pass )

        // Record balances pre distribution
        const endoweeBalancePre = await erc20.balanceOf( endowee )
        const contractBalancePre = await erc20.balanceOf( endoweth.target )

        // Trigger distribution
        await endoweth.triggerDistribution()

        // Record balances post distribution
        const endoweeBalancePost = await erc20.balanceOf( endowee )
        const distributedToEndowee = endoweeBalancePost - endoweeBalancePre
        const distributedPercentagePost = distributedToEndowee.toString() / contractBalancePre.toString() * 100
        const distributionRoundingErrorPost = distributedPercentagePost - expectedReturnPercentage / one_year * time_to_pass

        // Expect the rounded down percentage to be equal to the expected return of one month
        expect( distributionRoundingErrorPost ).to.be.lessThan( acceptibleRoundingError )

    } )

    it( "Should distribute the right amount of tokens (micro times)", async () => {

        // Load the fixtures
        const { endoweth, owner, endowee } = await loadFixture( deployEndowethFixture )
        const { erc20, initialSupply  } = await loadFixture( deployERC20Mock )
        const expectedReturn = 500
        const expectedReturnPercentage = expectedReturn / 100
        const acceptibleRoundingError = 1e-5

        /* ///////////////////////////////
            // One day
            // /////////////////////////////*/
        const one_year = 3600 * 24 * 365
        const one_day = 3600 * 24
        let time_to_pass = one_day

        // Send tokens to contract
        expect( await erc20.balanceOf( owner.address ) ).to.equal( initialSupply )
        await erc20.transfer( endoweth.target, initialSupply )
        expect( await erc20.balanceOf( endoweth.target ) ).to.equal( initialSupply )

        // Add deployed mock token
        await endoweth.addToken( erc20.target, expectedReturn )

        // Double check tokenlist is correct
        expect( await endoweth.tokenList( 0 ) ).to.be.equal( erc20.target )

        // Fast forward by one year
        await time.increase( time_to_pass )

        // Trigger distribution
        await endoweth.triggerDistribution()

        // Check the balance of the endowee
        const endoweeBalance = await erc20.balanceOf( endowee )
        const distributedPercentage = endoweeBalance.toString() / initialSupply.toString() * 100
        const distributionRoundingError = distributedPercentage - expectedReturnPercentage / one_year * time_to_pass 

        // Expect the distribution rounding error to be fractional
        expect( distributionRoundingError ).to.be.lessThan( acceptibleRoundingError )

        /* ///////////////////////////////
            // One minute
            // /////////////////////////////*/
        const one_minute = 60
        time_to_pass = one_minute

        // Forward the time by one month
        await time.increase( time_to_pass )

        // Record balances pre distribution
        const endoweeBalancePre = await erc20.balanceOf( endowee )
        const contractBalancePre = await erc20.balanceOf( endoweth.target )

        // Trigger distribution
        await endoweth.triggerDistribution()

        // Record balances post distribution
        const endoweeBalancePost = await erc20.balanceOf( endowee )
        const distributedToEndowee = endoweeBalancePost - endoweeBalancePre
        const distributedPercentagePost = distributedToEndowee.toString() / contractBalancePre.toString() * 100
        const distributionRoundingErrorPost = distributedPercentagePost - expectedReturnPercentage / one_year * time_to_pass

        // Expect the rounded down percentage to be equal to the expected return of one month
        expect( distributionRoundingErrorPost ).to.be.lessThan( acceptibleRoundingError )

    } )

} )
