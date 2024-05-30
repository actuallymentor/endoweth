const { loadFixture } = require( "@nomicfoundation/hardhat-toolbox/network-helpers" )
const { expect } = require( "chai" )
const { deployEndowethFixture, tokens } = require( "./fixtures/Endoweth" )


describe( "Token Management", () => {

    it( "Should allow the owner to add a token", async () => {
        const { endoweth } = await loadFixture( deployEndowethFixture )

        // Add token
        await expect( endoweth.addToken( tokens[0].address, tokens[0].expectedReturn ) )
            .to.emit( endoweth, "TokenAdded" )
            .withArgs( tokens[0].address )

        // Check if the token is added to the token list
        const tokenInfo = await endoweth.tokens( tokens[0].address )
        expect( tokenInfo.expectedAnnualReturn ).to.equal( tokens[0].expectedReturn )
        expect( await endoweth.tokenList( 0 ) ).to.equal( tokens[0].address )
    } )

    it( "Should revert when a non-owner tries to add a token", async () => {
        const { endoweth, addr1 } = await loadFixture( deployEndowethFixture )

        // Attempt to add token from a non-owner account
        await expect( endoweth.connect( addr1 ).addToken( tokens[0].address, 500 ) )
            .to.be.revertedWith( "Accountant Unauthorized" )
    } )

    it( "Should allow the owner to remove a token", async () => {
        const { endoweth } = await loadFixture( deployEndowethFixture )

        // Add token first
        await endoweth.addToken( tokens[0].address, tokens[0].expectedReturn )

        // Remove token
        await expect( endoweth.removeToken( tokens[0].address ) )
            .to.emit( endoweth, "TokenRemoved" )
            .withArgs( tokens[0].address )

        // Check if the token is removed from the token list
        const tokenInfo = await endoweth.tokens( tokens[0].address )
        expect( tokenInfo.expectedAnnualReturn ).to.equal( 0 )
        expect( tokenInfo.lastDistributionTime ).to.equal( 0 )
        expect( await endoweth.tokenList.length ).to.equal( 0 )
    } )

    it( "Should revert when a non-owner tries to remove a token", async () => {
        const { endoweth, addr1 } = await loadFixture( deployEndowethFixture )

        // Add token first
        await endoweth.addToken( tokens[0].address, tokens[0].expectedReturn )

        // Attempt to remove token from a non-owner account
        await expect( endoweth.connect( addr1 ).removeToken( tokens[0].address ) )
            .to.be.revertedWith( "Accountant Unauthorized" )
    } )

    it( "Should revert when trying to remove a non-existent token", async () => {
        const { endoweth } = await loadFixture( deployEndowethFixture )

        // Attempt to remove a non-existent token
        await expect( endoweth.removeToken( tokens[0].address ) )
            .to.be.revertedWith( "Token not managed" )
    } )

    it( "Should allow for changing of expected returns", async () => {
        const { endoweth } = await loadFixture( deployEndowethFixture )
        const new_return = 142

        // Add token first
        await endoweth.addToken( tokens[0].address, tokens[0].expectedReturn )

        // Change expected return
        await expect( endoweth.updateExpectedReturn( tokens[0].address, new_return ) )
            .to.emit( endoweth, "ExpectedReturnUpdated" )
            .withArgs( tokens[0].address, new_return )

        // Check if the expected return is changed
        const tokenInfo = await endoweth.tokens( tokens[0].address )
        expect( tokenInfo.expectedAnnualReturn ).to.equal( new_return )
    } )

} )
