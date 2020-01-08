App = {
    web3Provider: null,
    contracts: {},
    url: 'http://127.0.0.1:7545',
    account: '0x0',
    hasSold: false,

    init: function() {
        console.log("App Initialized...");
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 != 'undefined') {
          App.web3Provider = web3.currentProvider;
          web3 = new Web3(web3.currentProvider);
        } else {
          App.web3Provider = new Web3.providers.HttpProvider(App.url);
          web3 = new Web3(App.web3Provider);
        }
        console.log("Web3 initialized...");
        return App.initContract();
    },

    initContract: function() {
        $.getJSON("Shop.json", function(shop) {
            App.contracts.Shop = TruffleContract(shop);
            App.contracts.Shop.setProvider(App.web3Provider);
            console.log("Contract initialized...");
			App.listenForBuyEvents();

            return App.render();
        });
    },

  	listenForBuyEvents: function() {
		App.contracts.Shop.deployed().then(function(instance) {
      		instance.Buy({}, {
        		fromBlock: 0,
        		toBlock: 'latest',
      		}).watch(function(error, event) {
        		console.log("Item bought from the store", event);
      		});
    	});
  	},

    
	render: function() {
		var shopInstance;
		var loader = $("#loader");
		var content = $("#content");

		loader.show();
		content.hide();

		web3.eth.getCoinbase(function(err, account) {
		  if (err == null) {
		    App.account = account;
		    $("#accountAddress").html("Your Account: " + account);
		  }
		});
		
		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
        	return shopInstance.item_id();
        }).then(function(count) {
      		var items = $("#items");
      		items.empty();

        	for (var i = 1; i <= count; i++) {
        		shopInstance.items(i).then(function(item) {
					if(item[6]==false){
						var id = item[0];
				  		var seller = item[1];
				  		var itemname = item[2];
						var price = item[3];
						if (App.account != seller) {
							var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + seller +"</td><td><button id=\"buy\" class = \"btn btn-default btn-buy\" type = \"button\" data-id=\""+id+"\">Buy</button></td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";
							items.append(itemTemplate);
						}
						else {
							var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + seller +"</td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";
							items.append(itemTemplate);
						}
					}
				});
			}
      		loader.hide();
			content.show();
    	}).catch(function(error) {
      		console.warn(error);
    	});
	return App.bindevent();
	},

	bindevent: function() {
		$(document).on('click','.btn-buy',App.buy);
		$(document).on('click','.btn-hist',App.History);
	},

	buy: function(event) {
		event.preventDefault();
		var itemid = parseInt($(event.target).data('id'));
		var shopInstance;
		var price;
		var name;
		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
			return shopInstance.items(itemid).then(function(i) {
				price = i[3]*1000000000000000000;
				name = i[2];
				return shopInstance.BuyItems(itemid, {from:App.account, value: price});
				}).then(function(result) {
					if (result.receipt.status == "0x1") {
						alert("Item \""+ name +"\" bought by "+ App.account +" for price "+(price/1000000000000000000)+" ethers.");
					}
					else {
						alert("Transaction failed");
					}
			});
		}).catch(function(error) {
      		console.warn(error);
    	});
	},

	History: function(event) {
		event.preventDefault();
		var b = $(event.target).data('id');
        url = 'http://~/Ethereum/Store/src/next.html?name=' + encodeURIComponent(b);
    	document.location.href = url;
	}
}
$(function() {
    $(window).load(function() {
      App.init();
    });
  });
