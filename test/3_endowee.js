const { loadFixture } = require( "@nomicfoundation/hardhat-toolbox/network-helpers" )
const { expect } = require( "chai" )
const { deployEndowethFixture } = require( "./fixtures/Endoweth" )

describe( "Endowee Management", () => {

    it( "Should allow the owner to change the endowee", async () => {
        const { endoweth, owner, addr1: newEndowee } = await loadFixture( deployEndowethFixture )

        // Change endowee
        await expect( endoweth.changeEndowee( newEndowee.address ) )
            .to.emit( endoweth, "EndoweeChanged" )
            .withArgs( newEndowee.address )

        // Check if the endowee address is updated
        expect( await endoweth.endowee() ).to.equal( newEndowee.address )
    } )

    it( "Should revert when a non-owner tries to change the endowee", async () => {
        const { endoweth, addr2, addr1: newEndowee } = await loadFixture( deployEndowethFixture )

        // Attempt to change endowee from a non-owner account
        await expect( endoweth.connect( addr2 ).changeEndowee( newEndowee.address ) )
            .to.be.revertedWithCustomError( endoweth, "OwnableUnauthorizedAccount" )
    } )

} )