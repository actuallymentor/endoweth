const { ethers } = require( "hardhat" )

exports.deployEndowethFixture = async function deployEndowethFixture() {
    const [ owner, addr1, addr2 ] = await ethers.getSigners()
    const endowee = "0x000000000000000000000000000000000000dEaD"
    const distributionInterval = 3600

    // Deploy the contract
    const endoweth = await ethers.deployContract( "Endoweth", [ owner, endowee, distributionInterval ] )
    await endoweth.waitForDeployment()
    return { endoweth, owner, addr1, addr2, endowee, distributionInterval }
}

exports.deployERC20Mock = async function deployERC20Mock(  ) {
    const [ owner ] = await ethers.getSigners()
    const initialSupply = ethers.parseUnits( "1000", 18 )
    const erc20 = await ethers.deployContract( "MockERC20", [ "Mock Token", "MTK", initialSupply ] )
    await erc20.transfer( owner.address, initialSupply )
    return { erc20, owner, initialSupply }
}

exports.tokens = [
    {
        address: "0x" + "1".repeat( 40 ),
        expectedReturn: 500
    },
    {
        address: "0x" + "2".repeat( 40 ),
        expectedReturn: 1000
    },
    {
        address: "0x" + "3".repeat( 40 ),
        expectedReturn: 2000
    }
]