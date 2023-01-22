const OnlineShopping = artifacts.require('./OnlineShopping.sol')

require('chai')
.use(require('chai-as-promised'))
.should()

contract('OnlineShopping', ([deployer, seller, buyer]) => {
  let onlineshopping

  before(async () => {
    onlineshopping = await OnlineShopping.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await OnlineShopping.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await onlineshopping.name()
      assert.equal(name, 'Online Shopping')
    })
  })
  
  describe('packages', async () => {
    let result, packageCount

    before(async () => {
      result = await onlineshopping.createPackage('iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller })
      packageCount = await onlineshopping.packageCount()
    })

    it('creates packages', async () => {
      // SUCCESS
      assert.equal(packageCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), packageCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      // FAILURE: Product must have a name
      await await onlineshopping.createPackage('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Product must have a price
      await await onlineshopping.createPackage('iPhone X', 0, { from: seller }).should.be.rejected;
    })

    it('sells packages', async () => {
        // Track the seller balance before purchase
        let oldSellerBalance
        oldSellerBalance = await web3.eth.getBalance(seller)
        oldSellerBalance = new web3.utils.BN(oldSellerBalance)
      
        // SUCCESS: Buyer makes purchase
        result = await onlineshopping.purchasePackage(packageCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
      
        // Check logs
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), packageCount.toNumber(), 'id is correct')
        assert.equal(event.name, 'iPhone X', 'name is correct')
        assert.equal(event.price, '1000000000000000000', 'price is correct')
        assert.equal(event.owner, buyer, 'owner is correct')
        assert.equal(event.purchased, true, 'purchased is correct')
      
        // Check that seller received funds
        let newSellerBalance
        newSellerBalance = await web3.eth.getBalance(seller)
        newSellerBalance = new web3.utils.BN(newSellerBalance)
      
        let price
        price = web3.utils.toWei('1', 'Ether')
        price = new web3.utils.BN(price)
      
        const exepectedBalance = oldSellerBalance.add(price)
      
        assert.equal(newSellerBalance.toString(), exepectedBalance.toString())
      
        // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
        await onlineshopping.purchasePackage(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;      // FAILURE: Buyer tries to buy without enough ether
        // FAILURE: Buyer tries to buy without enough ether
        await onlineshopping.purchasePackage(packageCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
        // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
        await onlineshopping.purchasePackage(packageCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
        await onlineshopping.purchasePackage(packageCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      })
  })


})