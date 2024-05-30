const { loadFixture } = require( "@nomicfoundation/hardhat-toolbox/network-helpers" )
const { expect } = require( "chai" )
const { deployEndowethFixture } = require( "./fixtures/Endoweth" )

describe( "Accountant Management", () => {
    it( "Should allow the owner to add an accountant", async () => {
        const { endoweth, owner, addr1 } = await loadFixture( deployEndowethFixture )

        // Add accountant
        await expect( endoweth.addAccountant( addr1.address ) )
            .to.emit( endoweth, "AccountantAdded" )
            .withArgs( addr1.address )

        // Check if the address is marked as an accountant
        expect( await endoweth.accountants( addr1.address ) ).to.be.true
    } )

    it( "Should revert when a non-owner tries to add an accountant", async () => {
        const { endoweth, addr1, addr2 } = await loadFixture( deployEndowethFixture )

        // Attempt to add accountant from a non-owner account
        await expect( endoweth.connect( addr2 ).addAccountant( addr1.address ) )
            .to.be.revertedWithCustomError( endoweth, "OwnableUnauthorizedAccount" )
    } )

    it( "Should allow the owner to remove an accountant", async () => {
        const { endoweth, owner, addr1 } = await loadFixture( deployEndowethFixture )

        // Add and then remove accountant
        await endoweth.addAccountant( addr1.address )
        await expect( endoweth.removeAccountant( addr1.address ) )
            .to.emit( endoweth, "AccountantRemoved" )
            .withArgs( addr1.address )

        // Check if the address is no longer marked as an accountant
        expect( await endoweth.accountants( addr1.address ) ).to.be.false
    } )

    it( "Should revert when a non-owner tries to remove an accountant", async () => {
        const { endoweth, owner, addr1, addr2 } = await loadFixture( deployEndowethFixture )

        // Add accountant first
        await endoweth.addAccountant( addr1.address )

        // Attempt to remove accountant from a non-owner account
        await expect( endoweth.connect( addr2 ).removeAccountant( addr1.address ) )
            .to.be.revertedWithCustomError( endoweth, "OwnableUnauthorizedAccount" )
    } )

    it( "Should revert when trying to remove a non-existent accountant", async () => {
        const { endoweth, owner, addr1 } = await loadFixture( deployEndowethFixture )

        // Attempt to remove a non-existent accountant
        await expect( endoweth.removeAccountant( addr1.address ) )
            .to.be.revertedWith( "Accountant not found" )
    } )
} )
