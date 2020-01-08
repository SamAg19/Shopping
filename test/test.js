var Shop = artifacts.require("./Shop.sol");

contract("Shop", function(accounts) {
  var shopInstance;
  //Test case 1
  it("Contract deployment", function() {
    return Shop.deployed().then(function (instance) {
      shopInstance = instance;
      assert(shopInstance !== undefined, 'Shop contract should be defined');
    });
  });
  
  //Test case 2
  it("NO items yet on the store",function(){
    return Shop.deployed().then(function (instance){
      return instance.item_id();
    }).then(function (count){
      assert.equal(count,0);
    });
  });
  
  //Test case 3
  it("Valid Item registration",function(){
    return Shop.deployed().then(function (instance){
      shopInstance = instance;
      return shopInstance.SellingItems("Football", 5, 10, {from: accounts[0]});
    }).then(function(result){
      assert.equal("0x1",result.receipt.status,"Item Registered");
      return shopInstance.is_seller(accounts[0]);
    }).then(function(result){
      assert.equal(true,result,"Seller Registered");
      return shopInstance.item_id();
    }).then(function (count){
      assert.equal(count,1);
      return shopInstance.SellingItems("Cricket Ball",5,3,{from: accounts[1]});
    }).then(function(result){
      assert.equal("0x1",result.receipt.status,"Item Registered");
      return shopInstance.is_seller(accounts[0])
    }).then(function(result){
      assert.equal(true,result,"Seller Registered");
      return shopInstance.item_id();
    }).then(function (count){
      assert.equal(count,2);
    });
  });
  
  //Test case 4
  it("Buying an Item",function(){
    return Shop.deployed().then(function(instance){
      shopInstance=instance;
      var item_id = 2;
      return shopInstance.BuyItems(item_id, {from: accounts[2], value:5000000000000000000});
    }).then(function(result){
      assert.equal("0x1",result.receipt.status,"Transaction successful. Item Bought");
      return shopInstance.is_buyer(accounts[2]);
    }).then(function(result){
      assert.equal(true,result,"This account is a buyer");
    });
  });
  
  //Negative cases
  //Test case 5
  it("should NOT allow consumer to sell items",function(){
    return Shop.deployed().then(function(instance){
      shopInstance=instance;
      return shopInstance.SellingItems("Tennis Racket",10,5,{from: accounts[2]});
    }).then(function(result){
      throw("Condition not implemented in Smart Contract");
    }).catch(function(e){
      if(e == "Condition not implemented in Smart Contract"){
        assert(false);
      }
      else{
        assert(true);
      }
    })
  });
  
  //Test case 6
  it("should NOT allow sellers buy an item",function(){
    return Shop.deployed().then(function(instance){
      shopInstance=instance;
      var item_id = 0;
      return shopInstance.BuyItems(item_id,{from: accounts[1],value:5000000000000000000});
    }).then(function(result){
      throw("Condition not implemented in Smart Contract");
    }).catch(function(e){
      if(e == "Condition not implemented in Smart Contract"){
        assert(false);
      }
      else{
        assert(true);
      }
    })
  });
  
  //Test case 7
  it("should NOT pay less or more than the price quoted for an item",function(){
    return Shop.deployed().then(function(instance){
      shopInstance=instance;
      var item_id = 1;
      return shopInstance.BuyItems(item_id,{from: accounts[3],value:4000000000000000000});
    }).then(function(result){
      throw("Condition not implemented in Smart Contract");
    }).catch(function(e){
      if(e == "Condition not implemented in Smart Contract"){
        assert(false);
      }
      else{
        assert(true);
      }
    })
  });
  
  //Test Case 8
  it("should NOT be able buy illegitimate item",function(){
    return Shop.deployed().then(function(instance){
      shopInstance=instance;
      var item_id=99;
      return shopInstance.BuyItems(item_id,{from: accounts[3],value:5000000000000000000});
    }).then(function(result){
      throw("Condition not implemented in Smart Contract");
    }).catch(function(e){
      if(e == "Condition not implemented in Smart Contract"){
        assert(false);
      }
      else{
        assert(true);
      }
    })
  });
  
  //Test Case 9
  it("should NOT be able to buy an item which is out of stock",function(){
    return Shop.deployed().then(function(instance){
      shopInstance=instance;
      return shopInstance.SellingItems("Banana", 10, 1, {from: accounts[3]});
    }).then(function(result){
      assert.equal("0x1",result.receipt.status,"Item Registered");
      return shopInstance.BuyItems(3,{from: accounts[4],value:10000000000000000000});
    }).then(function(result){
      assert.equal("0x1",result.receipt.status,"Transaction successful. Item Bought");
      return shopInstance.BuyItems(3,{from: accounts[5],value:10000000000000000000});
    }).then(function(result){
      throw("Condition not implemented in Smart Contract");
    }).catch(function(e){
      if(e == "Condition not implemented in Smart Contract"){
        assert(false);
      }
      else{
        assert(true);
      }
    })
  });
});
