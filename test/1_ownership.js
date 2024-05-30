const { loadFixture } = require( "@nomicfoundation/hardhat-toolbox/network-helpers" )
const { expect } = require( "chai" )
const { deployEndowethFixture } = require( "./fixtures/Endoweth" )


describe( "Ownership", () => {

    it( "Should set the deployer as the owner", async () => {
        const { endoweth, owner } = await loadFixture( deployEndowethFixture )

        expect( await endoweth.owner() ).to.equal( owner.address )
    } )


    it( "Should allow the owner to set a new owner", async () => {
        const { endoweth, addr1 } = await loadFixture( deployEndowethFixture )

        // Transfer ownership to addr1
        await endoweth.transferOwnership( addr1.address )

        // Check that the new owner is addr1
        expect( await endoweth.owner() ).to.equal( addr1.address )
    } )

    it( "Should revert when a non-owner tries to transfer ownership", async () => {
        const { endoweth, addr1, addr2 } = await loadFixture( deployEndowethFixture )

        // Attempt to transfer ownership from a non-owner account
        await expect( endoweth.connect( addr2 ).transferOwnership( addr1.address ) )
            .to.be.revertedWithCustomError( endoweth, "OwnableUnauthorizedAccount" )
    } )
} )
