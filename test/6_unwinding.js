const { loadFixture } = require( "@nomicfoundation/hardhat-toolbox/network-helpers" )
const { expect } = require( "chai" )
const { deployEndowethFixture, deployERC20Mock } = require( "./fixtures/Endoweth" )

describe( "Unwinding Logic", () => {
    it( "Should allow the owner to unwind an unmanaged token", async () => {

        const { endoweth, owner } = await loadFixture( deployEndowethFixture )
        const { erc20: unmanagedToken } = await loadFixture( deployERC20Mock )
        const transferAmount = ethers.parseUnits( "1000", 18 )

        // Fund the contract with the unmanaged token
        await unmanagedToken.transfer( endoweth.target, transferAmount )

        // Check the contract's balance before unwinding
        const contractBalance = await unmanagedToken.balanceOf( endoweth.target )
        expect( contractBalance ).to.equal( transferAmount )

        // Unwind the unmanaged token
        await expect( endoweth.unwindToken( unmanagedToken.target ) )
            .to.emit( endoweth, "Distributed" )
            .withArgs( unmanagedToken.target, transferAmount )

        // Check the owner's balance after unwinding
        const finalBalance = await unmanagedToken.balanceOf( owner.address )
        expect( finalBalance ).to.equal( transferAmount )

        // Check the contract's balance after unwinding
        const finalContractBalance = await unmanagedToken.balanceOf( endoweth.target )
        expect( finalContractBalance ).to.equal( 0 )
    } )

    it( "Should revert when trying to unwind a managed token", async () => {
        const { endoweth } = await loadFixture( deployEndowethFixture )
        const { erc20: managedToken } = await loadFixture( deployERC20Mock )

        // Add token as managed
        await endoweth.addToken( managedToken.target, 500 )

        // Attempt to unwind the managed token
        await expect( endoweth.unwindToken( managedToken.target ) )
            .to.be.revertedWith( "Token managed" )
    } )

    it( "Should revert when a non-owner tries to unwind a token", async () => {

        const { endoweth, addr1 } = await loadFixture( deployEndowethFixture )
        const { erc20: unmanagedToken } = await loadFixture( deployERC20Mock )

        // Attempt to unwind the token from a non-owner account
        await expect( endoweth.connect( addr1 ).unwindToken( unmanagedToken.target ) )
            .to.be.revertedWithCustomError( endoweth, "OwnableUnauthorizedAccount" )
    } )
} )
